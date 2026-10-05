-- Online Seminar Registration System Database Schema
-- Compatible with PostgreSQL 12+

-- Clean up if re-running
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS certificates CASCADE;
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS waitlist CASCADE;
DROP TABLE IF EXISTS registrations CASCADE;
DROP TABLE IF EXISTS seminars CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. USERS TABLE
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    student_id VARCHAR(50) UNIQUE,
    phone VARCHAR(50),
    department VARCHAR(100),
    year VARCHAR(50),
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'event_admin', 'super_admin')),
    profile_photo VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. SEMINARS TABLE
CREATE TABLE seminars (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    speaker VARCHAR(255) NOT NULL,
    speaker_designation VARCHAR(255),
    speaker_image VARCHAR(500),
    banner_image VARCHAR(500),
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    venue VARCHAR(255) NOT NULL,
    capacity INT NOT NULL DEFAULT 50 CHECK (capacity > 0),
    registration_deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    requirements TEXT,
    topics TEXT[],
    organizer_info TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'closed', 'completed', 'cancelled')),
    created_by INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. REGISTRATIONS TABLE
CREATE TABLE registrations (
    id SERIAL PRIMARY KEY,
    registration_id VARCHAR(50) UNIQUE NOT NULL,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    seminar_id INT NOT NULL REFERENCES seminars(id) ON DELETE CASCADE,
    qr_code_token VARCHAR(100) UNIQUE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'waitlisted')),
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_seminar UNIQUE (user_id, seminar_id)
);

-- 4. ATTENDANCE TABLE
CREATE TABLE attendance (
    id SERIAL PRIMARY KEY,
    registration_id INT UNIQUE NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
    check_in_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) NOT NULL DEFAULT 'present' CHECK (status IN ('present', 'absent')),
    marked_by INT REFERENCES users(id) ON DELETE SET NULL
);

-- 5. CERTIFICATES TABLE
CREATE TABLE certificates (
    id SERIAL PRIMARY KEY,
    certificate_id VARCHAR(50) UNIQUE NOT NULL,
    registration_id INT UNIQUE NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    certificate_url VARCHAR(500),
    qr_verification_code VARCHAR(100) UNIQUE NOT NULL
);

-- 6. WAITLIST TABLE
CREATE TABLE waitlist (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    seminar_id INT NOT NULL REFERENCES seminars(id) ON DELETE CASCADE,
    position INT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'promoted', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_seminar_waitlist UNIQUE (user_id, seminar_id)
);

-- 7. NOTIFICATIONS TABLE
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'reminder')),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_student_id ON users(student_id);
CREATE INDEX idx_seminars_date ON seminars(date);
CREATE INDEX idx_seminars_category ON seminars(category);
CREATE INDEX idx_seminars_status ON seminars(status);
CREATE INDEX idx_registrations_seminar ON registrations(seminar_id);
CREATE INDEX idx_registrations_user ON registrations(user_id);
CREATE INDEX idx_registrations_token ON registrations(qr_code_token);
CREATE INDEX idx_attendance_reg ON attendance(registration_id);
CREATE INDEX idx_certificates_cert_id ON certificates(certificate_id);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read);
CREATE INDEX idx_waitlist_seminar_pos ON waitlist(seminar_id, position);
