-- Database Setup for EVAULT.SYS
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    joined DATE,
    fileCount INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS files (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category ENUM('identity', 'career', 'certificates', 'other') NOT NULL,
    size VARCHAR(20),
    date DATE,
    type VARCHAR(100),
    owner VARCHAR(50),
    path VARCHAR(255),
    FOREIGN KEY (owner) REFERENCES users(username)
);

-- Default Admin
INSERT INTO users (username, password, role, joined) 
VALUES ('admin', 'vault2025', 'admin', CURDATE());
