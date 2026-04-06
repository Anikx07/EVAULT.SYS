<?php
/**
 * config.php - Database configuration and helper functions
 */

session_start();

// Database Configuration
define('DB_HOST', 'sql100.ezyro.com');
define('DB_PORT', '3306');
define('DB_USER', 'ezyro_41552605');
define('DB_PASS', 'YOUR_CPANEL_PASSWORD');
define('DB_NAME', 'YOUR_DB_NAME');

// File Upload Configuration
define('UPLOAD_DIR', __DIR__ . '/uploads/');
define('MAX_FILE_SIZE', 10 * 1024 * 1024); // 10MB
define('ALLOWED_EXTENSIONS', ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'txt', 'zip']);
define('ALLOWED_MIMES', [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'text/plain',
    'application/zip'
]);

/**
 * Database connection using PDO
 */
function db() {
    static $pdo = null;
    if ($pdo === null) {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=utf8mb4";
            $pdo = new PDO($dsn, DB_USER, DB_PASS, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]);
        } catch (PDOException $e) {
            die("Database connection failed: " . $e->getMessage());
        }
    }
    return $pdo;
}

/**
 * Authentication check
 */
function auth() {
    if (!isset($_SESSION['user_id'])) {
        header('Location: login.php');
        exit;
    }
}

/**
 * Admin check
 */
function admin_auth() {
    auth();
    if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
        header('Location: index.php');
        exit;
    }
}

/**
 * Check if current user is admin
 */
function is_admin() {
    return isset($_SESSION['role']) && $_SESSION['role'] === 'admin';
}

/**
 * Helper to escape HTML output
 */
function e($string) {
    return htmlspecialchars($string, ENT_QUOTES, 'UTF-8');
}
