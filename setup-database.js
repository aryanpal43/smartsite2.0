const { Pool } = require('pg');
require('dotenv').config();

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'construction_monitoring',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '1234',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

const pool = new Pool(dbConfig);

// SQL script to create the database schema
const createTablesSQL = `
-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  location VARCHAR(200),
  start_date DATE,
  end_date DATE,
  status VARCHAR(20) DEFAULT 'active',
  progress INTEGER DEFAULT 0,
  manager VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create workers table
CREATE TABLE IF NOT EXISTS workers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(50),
  department VARCHAR(50),
  helmet_id VARCHAR(50),
  project_id INTEGER REFERENCES projects(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create helmets table
CREATE TABLE IF NOT EXISTS helmets (
  id VARCHAR(50) PRIMARY KEY,
  status VARCHAR(20) DEFAULT 'available',
  battery_level INTEGER DEFAULT 100,
  condition VARCHAR(20) DEFAULT 'good',
  worker_id INTEGER REFERENCES workers(id),
  last_used TIMESTAMP,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL PRIMARY KEY,
  worker_id INTEGER REFERENCES workers(id),
  helmet_id VARCHAR(50) REFERENCES helmets(id),
  project_id INTEGER REFERENCES projects(id),
  status VARCHAR(20) DEFAULT 'active',
  start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  end_time TIMESTAMP,
  duration INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create videos table
CREATE TABLE IF NOT EXISTS videos (
  id SERIAL PRIMARY KEY,
  session_id INTEGER REFERENCES sessions(id),
  filename VARCHAR(255) NOT NULL,
  file_path VARCHAR(500),
  file_size BIGINT,
  duration INTEGER,
  storage_provider VARCHAR(20) DEFAULT 'local',
  storage_url VARCHAR(500),
  ai_analysis JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO users (username, email, password, role) VALUES 
('admin', 'admin@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.i8m.', 'admin')
ON CONFLICT (username) DO NOTHING;

INSERT INTO projects (name, description, location, start_date, end_date, status, progress, manager) VALUES 
('Downtown Office Complex', 'Construction of a 20-story office building', '123 Main St, Downtown', '2024-01-15', '2024-12-31', 'active', 65, 'John Smith'),
('Residential Tower A', 'Luxury residential complex with 150 units', '456 Oak Ave, Uptown', '2024-03-01', '2025-02-28', 'active', 45, 'Sarah Johnson'),
('Shopping Mall Extension', 'Extension of existing shopping center', '789 Pine Rd, Suburbs', '2024-02-10', '2024-11-30', 'active', 80, 'Mike Brown')
ON CONFLICT DO NOTHING;

INSERT INTO workers (name, role, department, project_id) VALUES 
('John Doe', 'Excavator', 'Construction', 1),
('Jane Smith', 'Electrician', 'Electrical', 1),
('Bob Wilson', 'Plumber', 'Plumbing', 2),
('Alice Brown', 'Safety Officer', 'Safety', 1),
('Charlie Davis', 'Supervisor', 'Management', 2)
ON CONFLICT DO NOTHING;

INSERT INTO helmets (id, status, battery_level, condition) VALUES 
('HLM-001', 'available', 92, 'excellent'),
('HLM-002', 'available', 87, 'good'),
('HLM-003', 'available', 100, 'excellent'),
('HLM-004', 'available', 78, 'good'),
('HLM-005', 'available', 95, 'excellent'),
('HLM-006', 'available', 83, 'good'),
('HLM-007', 'available', 89, 'excellent'),
('HLM-008', 'available', 91, 'good'),
('HLM-009', 'available', 76, 'good'),
('HLM-010', 'available', 94, 'excellent')
ON CONFLICT (id) DO NOTHING;
`;

async function setupDatabase() {
  try {
    console.log('🔧 Setting up database...');
    const client = await pool.connect();
    console.log('✅ Connected to PostgreSQL database');
    console.log('📋 Creating database tables...');
    await client.query(createTablesSQL);
    console.log('✅ Database tables created successfully');
    client.release();
    console.log('🎉 Database setup completed successfully!');
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    if (error.code === '28P01') {
      console.log('💡 Password authentication failed. Please check your DB_PASSWORD in .env file');
    } else if (error.code === '3D000') {
      console.log('💡 Database does not exist. Please create the database first:');
      console.log('   CREATE DATABASE construction_monitoring;');
    }
  } finally {
    await pool.end();
  }
}

// Run the setup
setupDatabase(); 