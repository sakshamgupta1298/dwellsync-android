from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
import random
import string

db = SQLAlchemy()

def generate_tenant_id():
    # Generate a random 6-digit tenant ID
    return ''.join(random.choices(string.digits, k=6))

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    tenant_id = db.Column(db.String(6), unique=True, nullable=True)
    email = db.Column(db.String(120), unique=True, nullable=True)
    password_hash = db.Column(db.String(200), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    is_owner = db.Column(db.Boolean, default=False)
    rent_amount = db.Column(db.Float, nullable=False, default=0.0)
    owner_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)  # For tenants, this links to their owner
    meter_readings = db.relationship('MeterReading', backref='user', lazy=True)
    payments = db.relationship('Payment', backref='user', lazy=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    # Relationship for owner to access their tenants
    tenants = db.relationship('User', backref=db.backref('owner', remote_side=[id]), lazy=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    @staticmethod
    def generate_unique_tenant_id():
        while True:
            tenant_id = generate_tenant_id()
            if not User.query.filter_by(tenant_id=tenant_id).first():
                return tenant_id

    @staticmethod
    def generate_tenant_password():
        """Generate a secure random password for new tenants"""
        import random
        import string
        
        # Define character sets
        lowercase = string.ascii_lowercase
        uppercase = string.ascii_uppercase
        digits = string.digits
        special = "!@#$%^&*"
        
        # Generate password with at least one of each type
        password = [
            random.choice(lowercase),
            random.choice(uppercase),
            random.choice(digits),
            random.choice(special)
        ]
        
        # Add 4 more random characters from all sets
        all_chars = lowercase + uppercase + digits + special
        password.extend(random.choice(all_chars) for _ in range(4))
        
        # Shuffle the password
        random.shuffle(password)
        return ''.join(password)

class MeterReading(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    reading_value = db.Column(db.Float, nullable=True)
    reading_date = db.Column(db.DateTime, nullable=False)
    image_path = db.Column(db.String(200), nullable=False)
    is_processed = db.Column(db.Boolean, default=False)
    meter_type = db.Column(db.String(20), nullable=False)  # 'electricity' or 'water'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Payment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    rent_component = db.Column(db.Float, default=0.0)
    electricity_component = db.Column(db.Float, default=0.0)
    water_component = db.Column(db.Float, default=0.0)
    payment_date = db.Column(db.DateTime, nullable=False)
    payment_method = db.Column(db.String(20), nullable=False)
    status = db.Column(db.String(20), default='pending')
    stripe_payment_id = db.Column(db.String(100))
    transaction_reference = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class ElectricityRate(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    rate_per_unit = db.Column(db.Float, nullable=False)
    effective_from = db.Column(db.DateTime, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class OwnerElectricityRate(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    owner_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    rate_per_unit = db.Column(db.Float, nullable=False)
    effective_from = db.Column(db.DateTime, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    owner = db.relationship('User', backref='electricity_rates')

class WaterBill(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    total_amount = db.Column(db.Float, nullable=False)
    billing_date = db.Column(db.DateTime, nullable=False)
    total_tenants = db.Column(db.Integer, nullable=False)
    amount_per_tenant = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class MaintenanceRequest(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    tenant_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=False)
    priority = db.Column(db.String(20), nullable=False)
    status = db.Column(db.String(20), default='pending')
    owner_notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=db.func.now(), onupdate=db.func.now())

    tenant = db.relationship('User', backref='maintenance_requests')

class PasswordResetCode(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    code = db.Column(db.String(6), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    expires_at = db.Column(db.DateTime, nullable=False)
    is_used = db.Column(db.Boolean, default=False)

    user = db.relationship('User', backref='password_reset_codes') 