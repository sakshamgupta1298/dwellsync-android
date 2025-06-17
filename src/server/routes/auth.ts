import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User';
import { auth } from '../middleware/auth'; // Assuming you have an auth middleware

const router = Router();

// @route   POST /api/auth/register_owner
// @desc    Register a new owner
// @access  Public
router.post('/register_owner', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    let user = await UserModel.findOne({ email });

    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    user = new UserModel({
      name,
      email,
      is_owner: true,
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    const payload = {
      user: {
        id: user.id,
        is_owner: user.is_owner,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'supersecretjwtkey',
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, is_owner: user.is_owner } });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/auth/register_tenant
// @desc    Register a new tenant (simplified for now, might need more fields)
// @access  Public
router.post('/register_tenant', async (req, res) => {
  const { name, tenant_id, password, propertyId, ownerId } = req.body;

  try {
    let user = await UserModel.findOne({ tenant_id });

    if (user) {
      return res.status(400).json({ message: 'Tenant ID already exists' });
    }

    user = new UserModel({
      name,
      tenant_id,
      password, // Password should be hashed here as well
      is_owner: false,
      propertyId, // Assign property if applicable
      ownerId, // Assign owner if applicable
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    const payload = {
      user: {
        id: user.id,
        is_owner: user.is_owner,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'supersecretjwtkey',
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.status(201).json({ token, user: { id: user.id, name: user.name, tenant_id: user.tenant_id, is_owner: user.is_owner } });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  const { tenant_id, password } = req.body; // Using tenant_id for login based on your AuthContext

  try {
    let user = await UserModel.findOne({ tenant_id });

    if (!user) {
      // If not found by tenant_id, try by email for owners
      user = await UserModel.findOne({ email: tenant_id, is_owner: true });
    }

    if (!user) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    const payload = {
      user: {
        id: user.id,
        is_owner: user.is_owner,
        propertyId: user.propertyId, // Include propertyId in token payload for tenant
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'supersecretjwtkey',
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token, user: { id: user.id, name: user.name, email: user.email, is_owner: user.is_owner, tenant_id: user.tenant_id, propertyId: user.propertyId } });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/auth/user
// @desc    Get logged in user data (example of protected route)
// @access  Private
router.get('/user', auth, async (req, res) => {
  try {
    // req.user is populated from the auth middleware
    const user = await UserModel.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

export default router; 