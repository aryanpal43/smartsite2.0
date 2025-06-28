const db = require('../config/database');
const logger = require('../utils/logger');

const createTables = async () => {
  try {
    // Users table (for admin authentication)
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Projects table
    await db.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        location VARCHAR(200),
        start_date DATE,
        end_date DATE,
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Workers table
    await db.query(`
      CREATE TABLE IF NOT EXISTS workers (
        id SERIAL PRIMARY KEY,
        employee_id VARCHAR(50) UNIQUE NOT NULL,
        first_name VARCHAR(50) NOT NULL,
        last_name VARCHAR(50) NOT NULL,
        email VARCHAR(100),
        phone VARCHAR(20),
        position VARCHAR(50),
        hourly_rate DECIMAL(10,2),
        project_id INTEGER REFERENCES projects(id),
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Helmets table
    await db.query(`
      CREATE TABLE IF NOT EXISTS helmets (
        id SERIAL PRIMARY KEY,
        helmet_id VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(100),
        model VARCHAR(50),
        status VARCHAR(20) DEFAULT 'available',
        battery_level INTEGER DEFAULT 100,
        last_maintenance DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Sessions table (helmet assignments)
    await db.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id SERIAL PRIMARY KEY,
        helmet_id INTEGER REFERENCES helmets(id),
        worker_id INTEGER REFERENCES workers(id),
        project_id INTEGER REFERENCES projects(id),
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP,
        status VARCHAR(20) DEFAULT 'active',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Videos table
    await db.query(`
      CREATE TABLE IF NOT EXISTS videos (
        id SERIAL PRIMARY KEY,
        session_id INTEGER REFERENCES sessions(id),
        filename VARCHAR(255) NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        file_size BIGINT,
        duration INTEGER, -- in seconds
        local_path VARCHAR(500),
        cloud_url VARCHAR(500),
        upload_status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // AI Analysis results table
    await db.query(`
      CREATE TABLE IF NOT EXISTS ai_analysis (
        id SERIAL PRIMARY KEY,
        video_id INTEGER REFERENCES videos(id),
        session_id INTEGER REFERENCES sessions(id),
        analysis_data JSONB NOT NULL,
        work_quality VARCHAR(20),
        activity_detected TEXT[],
        idle_time INTEGER, -- in seconds
        active_time INTEGER, -- in seconds
        confidence_score DECIMAL(5,4),
        processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Attendance table
    await db.query(`
      CREATE TABLE IF NOT EXISTS attendance (
        id SERIAL PRIMARY KEY,
        worker_id INTEGER REFERENCES workers(id),
        project_id INTEGER REFERENCES projects(id),
        date DATE NOT NULL,
        check_in TIMESTAMP,
        check_out TIMESTAMP,
        total_hours DECIMAL(5,2),
        status VARCHAR(20) DEFAULT 'present',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Performance metrics table
    await db.query(`
      CREATE TABLE IF NOT EXISTS performance_metrics (
        id SERIAL PRIMARY KEY,
        worker_id INTEGER REFERENCES workers(id),
        session_id INTEGER REFERENCES sessions(id),
        date DATE NOT NULL,
        total_work_time INTEGER, -- in seconds
        effective_work_time INTEGER, -- in seconds
        idle_time INTEGER, -- in seconds
        quality_score DECIMAL(5,2),
        efficiency_score DECIMAL(5,2),
        tasks_completed INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for better performance
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_sessions_worker_id ON sessions(worker_id);
      CREATE INDEX IF NOT EXISTS idx_sessions_helmet_id ON sessions(helmet_id);
      CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
      CREATE INDEX IF NOT EXISTS idx_videos_session_id ON videos(session_id);
      CREATE INDEX IF NOT EXISTS idx_ai_analysis_video_id ON ai_analysis(video_id);
      CREATE INDEX IF NOT EXISTS idx_attendance_worker_date ON attendance(worker_id, date);
      CREATE INDEX IF NOT EXISTS idx_performance_worker_date ON performance_metrics(worker_id, date);
    `);

    logger.info('Database tables created successfully');
  } catch (error) {
    logger.error('Error creating tables:', error);
    throw error;
  }
};

const runMigrations = async () => {
  try {
    await createTables();
    logger.info('Database migration completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Migration failed:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  runMigrations();
}

module.exports = { createTables }; 