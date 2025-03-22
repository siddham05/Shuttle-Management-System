import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pg from 'pg';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

dotenv.config();

const app = express();
const { Pool } = pg;

// Database configuration
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: process.env.NODE_ENV === 'production'
});

// Middleware
app.use(cors());
app.use(express.json());

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Auth routes
app.post('/api/auth/signup', async (req, res) => {
  const { email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, role, points) VALUES ($1, $2, $3, $4) RETURNING id, email, role, points',
      [email, hashedPassword, 'student', 500]
    );

    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET);

    res.json({ user, token });
  } catch (error) {
    res.status(500).json({ error: 'Error creating user' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    const user = result.rows[0];
    if (!user || !await bcrypt.compare(password, user.password_hash)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET
    );

    res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        points: user.points
      },
      token
    });
  } catch (error) {
    res.status(500).json({ error: 'Error logging in' });
  }
});

// Routes routes
app.get('/api/routes', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM routes ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching routes' });
  }
});

// Stops routes
app.get('/api/stops', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM stops ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching stops' });
  }
});

// Bookings routes
app.get('/api/bookings', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        b.*,
        r1.name as route_name,
        r2.name as second_route_name
      FROM bookings b
      LEFT JOIN routes r1 ON b.route_id = r1.id
      LEFT JOIN routes r2 ON b.second_route_id = r2.id
      WHERE b.user_id = $1
      ORDER BY b.created_at DESC
    `, [req.user.id]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching bookings' });
  }
});

app.post('/api/bookings', authenticateToken, async (req, res) => {
  const {
    route_id,
    start_stop_id,
    end_stop_id,
    points_deducted,
    second_route_id,
    transfer_point_id,
    total_wait_time
  } = req.body;

  try {
    const result = await pool.query(`
      INSERT INTO bookings (
        user_id,
        route_id,
        start_stop_id,
        end_stop_id,
        points_deducted,
        status,
        second_route_id,
        transfer_point_id,
        total_wait_time
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [
      req.user.id,
      route_id,
      start_stop_id,
      end_stop_id,
      points_deducted,
      'pending',
      second_route_id,
      transfer_point_id,
      total_wait_time
    ]);

    // Update user points
    await pool.query(
      'UPDATE users SET points = points - $1 WHERE id = $2',
      [points_deducted, req.user.id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error creating booking' });
  }
});

// Transfer points routes
app.get('/api/transfer-points', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM transfer_points');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching transfer points' });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});