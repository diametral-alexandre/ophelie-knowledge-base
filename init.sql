CREATE TABLE employees (
    employee_id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    department VARCHAR(50),
    hire_date DATE DEFAULT CURRENT_DATE,
    profile_image_url VARCHAR(500)
);

CREATE TABLE clients (
    customer_id SERIAL PRIMARY KEY,
    company_name VARCHAR(100) NOT NULL,
    contact_name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sector VARCHAR(30)
);

CREATE TABLE missions (
    mission_id SERIAL PRIMARY KEY,
    customer_id INT NOT NULL,
    mission_name VARCHAR(150) NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    status VARCHAR(20) DEFAULT 'In Progress',
    FOREIGN KEY (customer_id) REFERENCES clients(customer_id) ON DELETE RESTRICT
);

CREATE TABLE skills (
    skill_id SERIAL PRIMARY KEY,
    skill_name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE "references" (
    reference_id SERIAL PRIMARY KEY,
    employee_id INT,
    mission_id INT NOT NULL,
    skill_id INT NOT NULL,
    role_description TEXT,
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE SET NULL,
    FOREIGN KEY (mission_id) REFERENCES missions(mission_id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(skill_id) ON DELETE RESTRICT
);

INSERT INTO employees (first_name, last_name, email, department, hire_date, profile_image_url) VALUES
('Alex', 'Mercer', 'alex.mercer@company.com', 'Engineering', '2024-01-15', 'https://i.pravatar.cc/150?u=alex.mercer@company.com'),
('Maya', 'Lin', 'maya.lin@company.com', 'Data Science', '2024-03-22', 'https://i.pravatar.cc/150?u=maya.lin@company.com'),
('David', 'Kim', 'david.kim@company.com', 'Cybersecurity', '2025-05-10', 'https://i.pravatar.cc/150?u=david.kim@company.com'),
('Sarah', 'Alami', 'sarah.alami@company.com', 'Engineering', '2025-08-01', 'https://i.pravatar.cc/150?u=sarah.alami@company.com'),
('James', 'OConnor', 'james.oconnor@company.com', 'Cloud Architecture', '2026-02-14', 'https://i.pravatar.cc/150?u=james.oconnor@company.com');

INSERT INTO clients (company_name, contact_name, email, phone, address, sector) VALUES
('Apex Health Solutions', 'Dr. Robert Chen', 'r.chen@apexhealth.com', '+1-555-0192', '123 Medical Plaza, Boston, MA', 'Healthcare'),
('Fintech Global Corp', 'Elena Rostova', 'e.rostova@fintechglobal.com', '+1-555-4831', '77 Wall Street, New York, NY', 'Finance'),
('GreenPulse Energy', 'Marcus Vance', 'm.vance@greenpulse.io', '+1-555-8902', '456 Renewable Way, Austin, TX', 'Energy');

INSERT INTO missions (customer_id, mission_name, description, start_date, end_date, status) VALUES
(1, 'Patient Portal Upgrade', 'Migrating the legacy patient portal to a modern microservices architecture.', '2025-06-01', '2025-12-20', 'Completed'),
(2, 'Fraud Detection Model', 'Implementing an AI-driven real-time fraud detection pipeline.', '2025-09-15', '2026-04-30', 'Completed'),
(2, 'Cloud Security Audit', 'Comprehensive vulnerability assessment and AWS infrastructure hardening.', '2026-03-01', '2026-08-31', 'In Progress'),
(3, 'Smart Grid IoT Dashboard', 'Developing a real-time analytics dashboard for wind and solar farm telemetry.', '2026-05-01', '2026-11-30', 'In Progress');

INSERT INTO skills (skill_name) VALUES
('Python'),
('SQL'),
('AWS Cloud'),
('React.js'),
('Machine Learning'),
('Penetration Testing'),
('Java');

INSERT INTO "references" (employee_id, mission_id, skill_id, role_description) VALUES
(1, 1, 4, 'Frontend Developer responsible for rebuilding the UI with React.'),
(4, 1, 7, 'Backend Engineer handles API design and Java backend microservices.'),
(2, 2, 1, 'Lead Data Scientist writing pipeline scripts in Python.'),
(2, 2, 5, 'Designed and trained the XGBoost fraud prediction models.'),
(4, 2, 2, 'Optimized SQL database indexes for high-throughput transactional logging.'),
(3, 3, 6, 'Conducted penetration testing on active network endpoints.'),
(5, 3, 3, 'Audited AWS IAM policies and configured secure VPC peering.'),
(1, 4, 4, 'Building real-time tracking components using React and WebSockets.'),
(2, 4, 2, 'Managing timescaledb databases for high-velocity sensor data streams.');
