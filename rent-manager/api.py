from flask import Flask, request, jsonify
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from models import db, User, MeterReading, Payment, ElectricityRate, WaterBill, MaintenanceRequest, OwnerElectricityRate
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
import stripe
from werkzeug.utils import secure_filename
from PIL import Image
import jwt
from functools import wraps
from flask_cors import CORS
import random
import string
from flask_mail import Message, Mail

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for API
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'default-secret-key')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///rentmanager.db')
app.config['UPLOAD_FOLDER'] = 'static/uploads'
stripe.api_key = os.getenv('STRIPE_API_KEY')
app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER', 'mail.liveinsync.in')
app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT', 587))
app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS', 'True').lower() == 'true'
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME', 'admin@liveinsync.in')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_DEFAULT_SENDER', 'admin@liveinsync.in')
app.config['MAIL_MAX_EMAILS'] = 100  # Maximum number of emails to send per connection
app.config['MAIL_ASCII_ATTACHMENTS'] = False  # Allow non-ASCII characters in attachments

# Initialize extensions
db.init_app(app)
login_manager = LoginManager()
login_manager.init_app(app)
mail = Mail(app)

# Ensure upload directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Token verification decorator
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
        
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user = User.query.get(data['user_id'])
            if not current_user:
                return jsonify({'error': 'Invalid token'}), 401
        except:
            return jsonify({'error': 'Invalid token'}), 401
        
        return f(current_user, *args, **kwargs)
    
    return decorated

@app.route('/api/owner/dashboard', methods=['GET'])
@token_required
def owner_dashboard(current_user):
    if not current_user.is_owner:
        return jsonify({'error': 'Unauthorized'}), 403

    tenants = User.query.filter_by(owner_id=current_user.id).all()
    total_tenants = len(tenants)
    total_rent = sum(t.rent_amount for t in tenants)
    total_payments = Payment.query.filter(Payment.status == 'completed').count()
    recent_payments = Payment.query.order_by(Payment.payment_date.desc()).limit(10).all()

    payments_data = []
    for p in recent_payments:
        tenant = User.query.get(p.user_id)
        if tenant and tenant.owner_id == current_user.id:  # Only include payments from owner's tenants
            payments_data.append({
                'id': p.id,
                'tenant': tenant.name if tenant else "Unknown",
                'amount': p.amount,
                'date': p.payment_date.isoformat(),
                'status': p.status,
                'method': p.payment_method,
            })

    return jsonify({
        'total_tenants': total_tenants,
        'total_rent': total_rent,
        'total_payments': total_payments,
        'recent_payments': payments_data,
    })
    
@app.route('/api/owner/electricity_rate', methods=['POST'])
@token_required
def set_electricity_rate(current_user):
    if not current_user.is_owner:
        return jsonify({'error': 'Unauthorized'}), 403

    data = request.get_json()
    rate = data.get('rate')
    if rate is None:
        return jsonify({'error': 'Missing rate'}), 400

    from datetime import datetime
    new_rate = OwnerElectricityRate(
        owner_id=current_user.id,
        rate_per_unit=rate,
        effective_from=datetime.utcnow()
    )
    db.session.add(new_rate)
    db.session.commit()
    return jsonify({'message': 'Rate updated successfully'}), 200

@app.route('/api/owner/electricity_rate', methods=['GET'])
@token_required
def get_electricity_rate(current_user):
    if not current_user.is_owner:
        return jsonify({'error': 'Unauthorized'}), 403

    # Get the latest rate for this owner
    rate = OwnerElectricityRate.query.filter_by(owner_id=current_user.id).order_by(OwnerElectricityRate.effective_from.desc()).first()
    if not rate:
        return jsonify({'error': 'No rate set yet'}), 404

    return jsonify({
        'rate_per_unit': rate.rate_per_unit,
        'effective_from': rate.effective_from.isoformat()
    })

@app.route('/api/update_rate', methods=['POST'])
@token_required  # Ensure only owners can access
def update_rate(current_user):
    if not current_user.is_owner:
        return jsonify({'error': 'Unauthorized'}), 403

    data = request.get_json()
    rate_type = data.get('rate_type')  # 'electricity' or 'water'
    new_rate = data.get('rate_per_unit')

    if not rate_type or not new_rate:
        return jsonify({'error': 'Missing data'}), 400

    if rate_type == 'electricity':
        from models import ElectricityRate
        from datetime import datetime
        rate = ElectricityRate(rate_per_unit=new_rate, effective_from=datetime.utcnow())
        db.session.add(rate)
        db.session.commit()
        return jsonify({'message': 'Electricity rate updated', 'rate_per_unit': new_rate})
    elif rate_type == 'water':
        from models import WaterRate
        from datetime import datetime
        rate = WaterRate(rate_per_unit=new_rate, effective_from=datetime.utcnow())
        db.session.add(rate)
        db.session.commit()
        return jsonify({'message': 'Water rate updated', 'rate_per_unit': new_rate})
    else:
        return jsonify({'error': 'Invalid rate type'}), 400

@app.route('/api/owner/water_bill', methods=['GET'])
@token_required
def get_water_bill(current_user):
    if not current_user.is_owner:
        return jsonify({'error': 'Unauthorized'}), 403

    # Get all tenants belonging to this owner
    owner_tenants = User.query.filter_by(owner_id=current_user.id).all()
    total_tenants = len(owner_tenants)

    # Get the latest water bill
    bill = WaterBill.query.order_by(WaterBill.billing_date.desc()).first()
    if not bill:
        return jsonify({'error': 'No water bill set yet'}), 404

    # Calculate amount per tenant based on owner's total tenants
    amount_per_tenant = bill.total_amount / total_tenants  if total_tenants > 0 else 0

    return jsonify({
        'amount_per_tenant': amount_per_tenant,
        'billing_date': bill.billing_date.isoformat(),
        'total_tenants': total_tenants
    })

@app.route('/api/owner/meter_readings', methods=['GET'])
@token_required
def get_owner_meter_readings(current_user):
    if not current_user.is_owner:
        return jsonify({'error': 'Unauthorized'}), 403

    # Get all tenants belonging to this owner
    owner_tenants = User.query.filter_by(owner_id=current_user.id).all()
    tenant_ids = [tenant.id for tenant in owner_tenants]

    # Get readings only for owner's tenants
    readings = MeterReading.query.filter(MeterReading.user_id.in_(tenant_ids)).order_by(MeterReading.reading_date.desc()).all()
    readings_data = []
    for r in readings:
        tenant = User.query.get(r.user_id)
        readings_data.append({
            'id': r.id,
            'tenant_id': tenant.tenant_id if tenant else None,
            'tenant_name': tenant.name if tenant else "Unknown",
            'meter_type': r.meter_type,
            'reading_value': r.reading_value,
            'reading_date': r.reading_date.isoformat() if r.reading_date else None,
            'image_path': r.image_path,
        })

    return jsonify(readings_data)

@app.route('/api/owner/payments', methods=['GET'])
@token_required
def get_owner_payments(current_user):
    if not current_user.is_owner:
        return jsonify({'error': 'Unauthorized'}), 403

    # Get all tenants belonging to this owner
    owner_tenants = User.query.filter_by(owner_id=current_user.id).all()
    tenant_ids = [tenant.id for tenant in owner_tenants]

    # Get payments only for owner's tenants
    payments = Payment.query.filter(Payment.user_id.in_(tenant_ids)).order_by(Payment.payment_date.desc()).all()
    payments_data = []
    for p in payments:
        tenant = User.query.get(p.user_id)
        payments_data.append({
            'id': p.id,
            'tenant_id': tenant.tenant_id if tenant else None,
            'tenant_name': tenant.name if tenant else "Unknown",
            'amount': p.amount,
            'date': p.payment_date.isoformat() if p.payment_date else None,
            'status': p.status,
            'method': p.payment_method,
            'reference': p.stripe_payment_id if p.payment_method == 'card' else p.transaction_reference
        })

    return jsonify(payments_data)

@app.route('/api/owner/tenants', methods=['GET'])
@token_required
def get_owner_tenants(current_user):
    if not current_user.is_owner:
        return jsonify({'error': 'Unauthorized'}), 403

    tenants = User.query.filter_by(owner_id=current_user.id).all()
    tenants_data = []
    for t in tenants:
        tenants_data.append({
            'id': t.id,
            'name': t.name,
            'tenant_id': t.tenant_id,
            'email': t.email,
            'rent_amount': t.rent_amount,
            'created_at': t.created_at.isoformat() if t.created_at else None,
        })

    return jsonify(tenants_data)

@app.route('/api/login', methods=['POST'])
def login():
    if not request.is_json:
        return jsonify({'error': 'Missing JSON in request'}), 400
    
    data = request.get_json()
    tenant_id = data.get('tenant_id')
    password = data.get('password')
    
    if not tenant_id or not password:
        return jsonify({'error': 'Missing tenant_id or password'}), 400
    
    # Try to find user by tenant_id first (for tenants)
    user = User.query.filter_by(tenant_id=tenant_id).first()
    if not user:
        # If not found, try email (for owner)
        user = User.query.filter_by(email=tenant_id).first()
    
    if user and user.check_password(password):
        # Generate token
        token = jwt.encode({
            'user_id': user.id,
            'is_owner': user.is_owner,
               'exp': datetime.utcnow() + timedelta(days=1)
        }, app.config['SECRET_KEY'], algorithm='HS256')
        
        return jsonify({
            'token': token,
            'user': {
                'id': user.id,
                'name': user.name,
                'is_owner': user.is_owner,
                'tenant_id': user.tenant_id if not user.is_owner else None
            }
        })
    
    return jsonify({'error': 'Invalid credentials'})

@app.route('/api/submit_reading', methods=['POST'])
@token_required
def submit_reading(current_user):
    if 'meter_type' not in request.form or 'reading_value' not in request.form:
        return jsonify({'error': 'Missing required fields'}), 400

    meter_type = request.form['meter_type']
    reading_value = float(request.form['reading_value'])
    image = request.files.get('image')

    # Save image if present
    image_path = None
    if image:
        # Use tenant_id if available, else fallback to user_id
        tenant_folder_name = str(getattr(current_user, 'tenant_id', None) or current_user.id)
        tenant_folder = os.path.join(app.root_path, app.config['UPLOAD_FOLDER'], tenant_folder_name)
        os.makedirs(tenant_folder, exist_ok=True)
        filename = secure_filename(f"{current_user.id}_{meter_type}_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}_{image.filename}")
        image.save(os.path.join(tenant_folder, filename))
        # Store the relative path (e.g., '12345/filename.jpg')
        image_path = os.path.join(tenant_folder_name, filename)

    # Save reading to DB
    reading = MeterReading(
        user_id=current_user.id,
        reading_value=reading_value,
        reading_date=datetime.utcnow(),
        image_path=image_path,
        meter_type=meter_type,
        is_processed=False
    )
    db.session.add(reading)
    db.session.commit()

    return jsonify({'message': 'Reading submitted successfully'}), 200

@app.route('/api/tenant/dashboard', methods=['GET'])
@token_required
def tenant_dashboard(current_user):
    if current_user.is_owner:
        return jsonify({'error': 'Owner account cannot access tenant dashboard'}), 403
    
    # Get the owner's current electricity rate
    owner = User.query.get(current_user.owner_id)
    current_rate = OwnerElectricityRate.query.filter_by(owner_id=owner.id).order_by(OwnerElectricityRate.effective_from.desc()).first()
    
    # Get total tenants for this owner
    total_tenants = User.query.filter_by(owner_id=owner.id, is_owner=False).count()
    
    # Get the latest readings
    latest_electricity_reading = MeterReading.query.filter_by(
        user_id=current_user.id, meter_type='electricity'
    ).order_by(MeterReading.reading_date.desc()).first()
    latest_water_reading = MeterReading.query.filter_by(
        user_id=current_user.id, meter_type='water'
    ).order_by(MeterReading.reading_date.desc()).first()
    
    # Get previous readings
    electricity_previous = MeterReading.query.filter(
        MeterReading.user_id == current_user.id,
        MeterReading.meter_type == 'electricity',
        MeterReading.reading_date < (latest_electricity_reading.reading_date if latest_electricity_reading else None)
    ).order_by(MeterReading.reading_date.desc()).first() if latest_electricity_reading else None

    water_previous = MeterReading.query.filter(
        MeterReading.user_id == current_user.id,
        MeterReading.meter_type == 'water',
        MeterReading.reading_date < (latest_water_reading.reading_date if latest_water_reading else None)
    ).order_by(MeterReading.reading_date.desc()).first() if latest_water_reading else None

    # Calculate bills
    electricity_bill = 0
    if latest_electricity_reading and electricity_previous and current_rate:
        consumption = latest_electricity_reading.reading_value - electricity_previous.reading_value
        electricity_bill = consumption * current_rate.rate_per_unit
        electricity_bill = round(electricity_bill, 2)
    
    water_bill_amount = 0
    if latest_water_reading and water_previous and current_rate:
        consumption = latest_water_reading.reading_value - water_previous.reading_value
        water_bill_amount = (consumption / (total_tenants + 1)) * current_rate.rate_per_unit
        water_bill_amount = round(water_bill_amount, 2)

    # Prepare dashboard data
    dashboard_data = {
        'tenant': {
            'name': current_user.name,
            'tenant_id': current_user.tenant_id,
            'rent_amount': current_user.rent_amount
        },
        'billing': {
            'rent': current_user.rent_amount,
            'electricity': electricity_bill,
            'water': water_bill_amount,
            'total': current_user.rent_amount + electricity_bill + water_bill_amount
        },
        'meter_readings': {
            'electricity': {
                'current': latest_electricity_reading.reading_value if latest_electricity_reading else None,
                'previous': electricity_previous.reading_value if electricity_previous else None,
                'consumption': (latest_electricity_reading.reading_value - electricity_previous.reading_value) if (latest_electricity_reading and electricity_previous) else None,
                'date': latest_electricity_reading.reading_date.isoformat() if latest_electricity_reading else None,
                'has_image': bool(latest_electricity_reading.image_path) if latest_electricity_reading else False,
                'image_url': f"/static/uploads/{latest_electricity_reading.image_path}" if (latest_electricity_reading and latest_electricity_reading.image_path) else None
            } if latest_electricity_reading else None,
            'water': {
                'current': latest_water_reading.reading_value if latest_water_reading else None,
                'previous': water_previous.reading_value if water_previous else None,
                'date': latest_water_reading.reading_date.isoformat() if latest_water_reading else None,
                'has_image': bool(latest_water_reading.image_path) if latest_water_reading else False,
                'image_url': f"/static/uploads/{latest_water_reading.image_path}" if (latest_water_reading and latest_water_reading.image_path) else None
            } if latest_water_reading else None
        },
        'payment_status': None,
        'payment_history': []
    }
    
    # Get payment history
    payments = Payment.query.filter_by(user_id=current_user.id).order_by(Payment.payment_date.desc()).limit(10).all()

    # Check for existing payment for current billing period
    latest_reading = None
    if latest_electricity_reading and latest_water_reading:
        latest_reading = max(latest_electricity_reading, latest_water_reading, key=lambda r: r.reading_date)
    elif latest_electricity_reading:
        latest_reading = latest_electricity_reading
    elif latest_water_reading:
        latest_reading = latest_water_reading

    existing_payment = None
    if latest_reading:
        existing_payment = Payment.query.filter(
            Payment.user_id == current_user.id,
            Payment.payment_date >= latest_reading.reading_date
        ).order_by(Payment.payment_date.desc()).first()
    
    # Add existing payment data
    if existing_payment:
        dashboard_data['payment_status'] = {
            'status': existing_payment.status,
            'amount': existing_payment.amount,
            'method': existing_payment.payment_method,
            'date': existing_payment.payment_date.isoformat(),
            'reference': existing_payment.transaction_reference or existing_payment.stripe_payment_id
        }
    
    # Format payment history
    for payment in payments:
        dashboard_data['payment_history'].append({
            'id': payment.id,
            'date': payment.payment_date.isoformat(),
            'amount': payment.amount,
            'method': payment.payment_method,
            'status': payment.status,
            'reference': payment.transaction_reference or payment.stripe_payment_id
        })
    
    return jsonify(dashboard_data)

# Add more API endpoints for other functionality...

@app.route('/api/create_payment', methods=['POST'])
@token_required
def create_payment(current_user):
    if not request.is_json:
        return jsonify({'error': 'Missing JSON in request'}), 400

    data = request.get_json()
    payment_method = data.get('payment_method')

    if not payment_method or payment_method not in ['card', 'bank_transfer', 'cash']:
        return jsonify({'error': 'Invalid payment method'}), 400

    # Calculate total amount due
    total_amount = current_user.rent_amount
    electricity_cost = 0
    water_cost = 0

    # Get the owner's current electricity rate
    owner = User.query.get(current_user.owner_id)
    current_rate = OwnerElectricityRate.query.filter_by(owner_id=owner.id).order_by(OwnerElectricityRate.effective_from.desc()).first()

    # --- Electricity Bill Calculation ---
    latest_electricity = MeterReading.query.filter_by(
        user_id=current_user.id,
        meter_type='electricity'
    ).order_by(MeterReading.reading_date.desc()).first()

    if latest_electricity and current_rate:
        previous_electricity = MeterReading.query.filter(
            MeterReading.user_id == current_user.id,
            MeterReading.meter_type == 'electricity',
            MeterReading.reading_date < latest_electricity.reading_date
        ).order_by(MeterReading.reading_date.desc()).first()

        if previous_electricity:
            consumption = latest_electricity.reading_value - previous_electricity.reading_value
            electricity_cost = consumption * current_rate.rate_per_unit
            total_amount += electricity_cost

    # --- Water Bill Calculation ---
    latest_water = MeterReading.query.filter_by(
        user_id=current_user.id,
        meter_type='water'
    ).order_by(MeterReading.reading_date.desc()).first()

    if latest_water and current_rate:
        previous_water = MeterReading.query.filter(
            MeterReading.user_id == current_user.id,
            MeterReading.meter_type == 'water',
            MeterReading.reading_date < latest_water.reading_date
        ).order_by(MeterReading.reading_date.desc()).first()

        if previous_water:
            total_tenants = User.query.filter_by(owner_id=owner.id, is_owner=False).count()
            water_consumption = latest_water.reading_value - previous_water.reading_value
            water_cost = (water_consumption / (total_tenants + 1)) * current_rate.rate_per_unit
            total_amount += water_cost

    # Create payment record
    payment = Payment(
        user_id=current_user.id,
        amount=total_amount,
        rent_component=current_user.rent_amount,
        electricity_component=electricity_cost,
        water_component=water_cost,
        payment_date=datetime.now(),
        payment_method=payment_method,
        status='pending'
    )

    if payment_method == 'card':
        try:
            payment_intent = stripe.PaymentIntent.create(
                amount=int(total_amount * 100),  # Convert to cents
                currency='inr',
                metadata={'user_id': current_user.id}
            )
            payment.stripe_payment_id = payment_intent.id
            db.session.add(payment)
            db.session.commit()

            return jsonify({
                'clientSecret': payment_intent.client_secret,
                'amount': total_amount
            })
        except Exception as e:
            return jsonify({'error': str(e)}), 400
    else:
        # For cash and bank transfer
        reference = f"RENT{datetime.now().strftime('%Y%m%d%H%M%S')}{current_user.id}"
        payment.transaction_reference = reference
        db.session.add(payment)
        db.session.commit()

        return jsonify({
            'reference': reference,
            'amount': total_amount,
            'message': f'Please use reference {reference} when making the payment'
        })

def generate_tenant_password(length=8):
    """Generate a random password for tenant"""
    characters = string.ascii_letters + string.digits + string.punctuation
    password = ''.join(random.choice(characters) for _ in range(length))
    return password

@app.route('/api/register_tenant', methods=['POST'])
@token_required
def register_tenant(current_user):
    if not current_user.is_owner:
        return jsonify({'error': 'Unauthorized'}), 403
    
    if not request.is_json:
        return jsonify({'error': 'Missing JSON in request'}), 400
    
    data = request.get_json()
    name = data.get('name')
    rent_amount = float(data.get('rent_amount'))
    initial_electricity_reading = float(data.get('initial_electricity_reading'))
    initial_water_reading = float(data.get('initial_water_reading'))
    
    if not all([name, rent_amount, initial_electricity_reading, initial_water_reading]):
        return jsonify({'error': 'Missing required fields'}), 400
    
    # Generate unique tenant ID
    tenant_id = User.generate_unique_tenant_id()
    
    # Generate random password
    password = generate_tenant_password()
    
    tenant = User(
        tenant_id=tenant_id,
        name=name,
        rent_amount=rent_amount,
        is_owner=False,
        owner_id=current_user.id  # Set the owner_id to the current owner's ID
    )
    tenant.set_password(password)
    
    # Add tenant to database first to get the user_id
    db.session.add(tenant)
    db.session.flush()  # This assigns the ID to the tenant object
    
    # Create initial electricity meter reading
    initial_electricity = MeterReading(
        user_id=tenant.id,
        reading_value=initial_electricity_reading,
        reading_date=datetime.now(),
        image_path='initial_reading.jpg',  # Placeholder image path
        is_processed=True,  # Mark as processed since it's entered by owner
        meter_type='electricity'
    )
    
    # Create initial water meter reading
    initial_water = MeterReading(
        user_id=tenant.id,
        reading_value=initial_water_reading,
        reading_date=datetime.now(),
        image_path='initial_reading.jpg',  # Placeholder image path
        is_processed=True,  # Mark as processed since it's entered by owner
        meter_type='water'
    )
    
    db.session.add(initial_electricity)
    db.session.add(initial_water)
    db.session.commit()
    
    return jsonify({
        'message': 'Tenant registered successfully',
        'tenant': {
            'id': tenant.id,
            'name': tenant.name,
            'tenant_id': tenant.tenant_id,
            'password': password  # Send the generated password
        }
    })

@app.route('/api/change_password', methods=['POST'])
@token_required
def change_password(current_user):
    if not request.is_json:
        return jsonify({'error': 'Missing JSON in request'}), 400
    
    data = request.get_json()
    current_password = data.get('current_password')
    new_password = data.get('new_password')
    
    if not all([current_password, new_password]):
        return jsonify({'error': 'Missing required fields'}), 400
    
    # Verify current password
    if not current_user.check_password(current_password):
        return jsonify({'error': 'Current password is incorrect'}), 401
    
    # Update password
    current_user.set_password(new_password)
    db.session.commit()
    
    return jsonify({'message': 'Password updated successfully'})

@app.route('/api/register_owner', methods=['POST'])
def register_owner():
    if not request.is_json:
        return jsonify({'error': 'Missing JSON in request'}), 400

    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')

    if not name or not email or not password:
        return jsonify({'error': 'Missing name, email, or password'}), 400

    # Check if email already exists
    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already registered'}), 400

    # Create new owner user
    user = User(
        name=name,
        email=email,
        is_owner=True,
        rent_amount=0.0  # Owners don't pay rent
    )
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    return jsonify({'message': 'Owner registered successfully'}), 201

@app.route('/api/owner/payments/<int:payment_id>/accept', methods=['POST'])
@token_required
def accept_payment(current_user, payment_id):
    if not current_user.is_owner:
        return jsonify({'error': 'Unauthorized'}), 403
    payment = Payment.query.get(payment_id)
    if not payment:
        return jsonify({'error': 'Payment not found'}), 404
    payment.status = 'completed'
    db.session.commit()
    return jsonify({'message': 'Payment accepted', 'status': payment.status})

@app.route('/api/owner/payments/<int:payment_id>/reject', methods=['POST'])
@token_required
def reject_payment(current_user, payment_id):
    if not current_user.is_owner:
        return jsonify({'error': 'Unauthorized'}), 403
    payment = Payment.query.get(payment_id)
    if not payment:
        return jsonify({'error': 'Payment not found'}), 404
    payment.status = 'rejected'
    db.session.commit()
    return jsonify({'message': 'Payment rejected', 'status': payment.status})

@app.route('/api/owner/tenants/<int:tenant_id>', methods=['DELETE'])
@token_required
def delete_tenant(current_user, tenant_id):
    if not current_user.is_owner:
        return jsonify({'error': 'Unauthorized'}), 403
    tenant = User.query.get(tenant_id)
    if not tenant or tenant.is_owner:
        return jsonify({'error': 'Tenant not found'}), 404
    # Delete related meter readings and payments
    MeterReading.query.filter_by(user_id=tenant.id).delete()
    Payment.query.filter_by(user_id=tenant.id).delete()
    db.session.delete(tenant)
    db.session.commit()
    return jsonify({'message': 'Tenant deleted successfully'})

@app.route('/api/maintenance-requests', methods=['POST'])
@token_required
def create_maintenance_request(current_user):
    data = request.get_json()
    title = data.get('title')
    description = data.get('description')
    priority = data.get('priority')
    if not title or not description or not priority:
        return jsonify({'error': 'Missing required fields'}), 400

    new_request = MaintenanceRequest(
        tenant_id=current_user.id,
        title=title,
        description=description,
        priority=priority,
        status='pending'
    )
    db.session.add(new_request)
    db.session.commit()
    print("New MaintenanceRequest created with ID:", new_request.id, "created_at:", new_request.created_at)
    return jsonify({
        'id': new_request.id,
        'tenantId': new_request.tenant_id,
        'title': new_request.title,
        'description': new_request.description,
        'priority': new_request.priority,
        'status': new_request.status,
        'created_at': new_request.created_at.isoformat()
    }), 201

@app.route('/api/maintenance-requests/owner', methods=['GET'])
@token_required
def get_all_maintenance_requests(current_user):
    if not current_user.is_owner:
        return jsonify({'error': 'Unauthorized'}), 403

    # Get all tenants belonging to this owner
    owner_tenants = User.query.filter_by(owner_id=current_user.id).all()
    tenant_ids = [tenant.id for tenant in owner_tenants]

    # Get maintenance requests only for owner's tenants
    requests = MaintenanceRequest.query.filter(MaintenanceRequest.tenant_id.in_(tenant_ids)).order_by(MaintenanceRequest.created_at.desc()).all()
    
    return jsonify([{
        'id': r.id,
        'tenantId': r.tenant_id,
        'tenantName': r.tenant.name if r.tenant else None,
        'tenantUniqueId': r.tenant.tenant_id if r.tenant else None,
        'title': r.title,
        'description': r.description,
        'priority': r.priority,
        'status': r.status,
        'ownerNotes': r.owner_notes,
        'created_at': r.created_at.isoformat()
    } for r in requests]), 200

@app.route('/api/maintenance-requests/tenant', methods=['GET'])
@token_required
def get_tenant_maintenance_requests(current_user):
    requests = MaintenanceRequest.query.filter_by(tenant_id=current_user.id).order_by(MaintenanceRequest.created_at.desc()).all()
    return jsonify([{
        'id': r.id,
        'tenantId': r.tenant_id,
        'title': r.title,
        'description': r.description,
        'priority': r.priority,
        'status': r.status,
        'created_at': r.created_at.isoformat()
    } for r in requests]), 200

@app.route('/api/maintenance-requests/<int:request_id>', methods=['GET'])
@token_required
def get_maintenance_request_by_id(current_user, request_id):
    r = MaintenanceRequest.query.get(request_id)
    if not r:
        return jsonify({'error': 'Request not found'}), 404
    if not current_user.is_owner and r.tenant_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403
    return jsonify({
        'id': r.id,
        'tenantId': r.tenant_id,
        'title': r.title,
        'description': r.description,
        'priority': r.priority,
        'status': r.status,
        'created_at': r.created_at.isoformat()
    }), 200

@app.route('/api/maintenance-requests/<int:request_id>', methods=['PATCH'])
@token_required
def update_maintenance_request(current_user, request_id):
    if not current_user.is_owner:
        return jsonify({'error': 'Unauthorized'}), 403

    req = MaintenanceRequest.query.get(request_id)
    if not req:
        return jsonify({'error': 'Request not found'}), 404

    data = request.get_json()
    status = data.get('status')
    owner_notes = data.get('ownerNotes')

    if status:
        req.status = status
    if owner_notes is not None:
        req.owner_notes = owner_notes

    db.session.commit()
    return jsonify({
        'id': req.id,
        'tenantId': req.tenant_id,
        'title': req.title,
        'description': req.description,
        'priority': req.priority,
        'status': req.status,
        'ownerNotes': req.owner_notes,
        'created_at': req.created_at.isoformat()
    }), 200

@app.route('/api/maintenance-requests/<int:request_id>/reject', methods=['POST'])
@token_required
def reject_maintenance_request(current_user, request_id):
    req = MaintenanceRequest.query.get(request_id)
    if not req:
        return jsonify({'error': 'Request not found'}), 404
    if req.tenant_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403
    if req.status != 'completed':
        return jsonify({'error': 'Can only reject completed requests'}), 400
    req.status = 'in_progress'
    db.session.commit()
    return jsonify({'message': 'Maintenance completion rejected', 'status': req.status}), 200

@app.route('/api/maintenance-requests/<int:request_id>/approve', methods=['PATCH', 'POST'])
@token_required
def approve_maintenance_request(current_user, request_id):
    req = MaintenanceRequest.query.get(request_id)
    if not req:
        return jsonify({'error': 'Request not found'}), 404
    if req.tenant_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403
    if req.status != 'completed':
        return jsonify({'error': 'Can only approve completed requests'}), 400
    req.status = 'closed'
    db.session.commit()
    return jsonify({'message': 'Maintenance completion approved', 'status': req.status}), 200

@app.route('/api/request_password_reset', methods=['POST'])
def request_password_reset():
    if not request.is_json:
        return jsonify({'error': 'Missing JSON in request'}), 400
    
    data = request.get_json()
    email = data.get('email')
    
    if not email:
        return jsonify({'error': 'Email is required'}), 400
    
    # Check if user exists
    user = User.query.filter_by(email=email).first()
    if not user:
        # Don't reveal that the email doesn't exist for security reasons
        return jsonify({'message': 'If an account exists with this email, you will receive a password reset code'})
    
    # Generate OTP
    otp = PasswordResetOTP.generate_otp()
    otp_record = PasswordResetOTP(email=email, otp=otp)
    db.session.add(otp_record)
    db.session.commit()
    
    # Send email with OTP
    try:
        msg = Message(
            'Password Reset Code - LiveInSync',
            sender=app.config['MAIL_DEFAULT_SENDER'],
            recipients=[email]
        )
        msg.body = f'''Hello,

You have requested to reset your password for your LiveInSync account.

Your password reset code is: {otp}

This code will expire in 15 minutes.

If you did not request this password reset, please ignore this email or contact support if you have concerns.

Best regards,
LiveInSync Team'''
        
        msg.html = f'''
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #E50914;">Password Reset Request</h2>
            <p>Hello,</p>
            <p>You have requested to reset your password for your LiveInSync account.</p>
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
                <p style="margin: 0; font-size: 24px; font-weight: bold; color: #E50914;">{otp}</p>
            </div>
            <p>This code will expire in 15 minutes.</p>
            <p>If you did not request this password reset, please ignore this email or contact support if you have concerns.</p>
            <hr style="border: 1px solid #eee; margin: 20px 0;">
            <p style="color: #666; font-size: 12px;">Best regards,<br>LiveInSync Team</p>
        </div>
        '''
        
        mail.send(msg)
    except Exception as e:
        # Log the error but don't expose it to the user
        app.logger.error(f'Failed to send password reset email: {str(e)}')
        return jsonify({'error': 'Failed to send password reset code'}), 500
    
    return jsonify({'message': 'If an account exists with this email, you will receive a password reset code'})

@app.route('/api/verify_otp_and_reset_password', methods=['POST'])
def verify_otp_and_reset_password():
    if not request.is_json:
        return jsonify({'error': 'Missing JSON in request'}), 400
    
    data = request.get_json()
    email = data.get('email')
    otp = data.get('otp')
    new_password = data.get('new_password')
    
    if not all([email, otp, new_password]):
        return jsonify({'error': 'Email, OTP, and new password are required'}), 400
    
    # Find the most recent valid OTP for this email
    otp_record = PasswordResetOTP.query.filter_by(
        email=email,
        is_used=False
    ).order_by(PasswordResetOTP.created_at.desc()).first()
    
    if not otp_record or not otp_record.is_valid() or otp_record.otp != otp:
        return jsonify({'error': 'Invalid or expired OTP'}), 400
    
    # Find user and update password
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    user.set_password(new_password)
    otp_record.is_used = True
    db.session.commit()
    
    return jsonify({'message': 'Password has been reset successfully'})

@app.route('/api/test_email', methods=['GET'])
def test_email():
    try:
        msg = Message(
            'Test Email',
            recipients=[os.getenv('MAIL_DEFAULT_SENDER')]
        )
        msg.body = 'This is a test email from your Rent Manager application.'
        mail.send(msg)
        return jsonify({'message': 'Test email sent successfully'})
    except Exception as e:
        return jsonify({'error': f'Failed to send test email: {str(e)}'}), 500

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(host='0.0.0.0', port=5000) 