<!--
Step 1: Create MySQL DB in ezyro.com cPanel
Step 2: Edit config.php with DB name and cPanel password
Step 3: Upload all files via FTP - host: ftp.ezyro.com port 21 user: ezyro_41552605
Step 4: Visit yoursite.ezyro.com/install.php
Step 5: Delete install.php immediately
Step 6: Go to yoursite.ezyro.com/login.php and login with admin/vault2025
-->
<?php
/**
 * install.php - Database setup and initialization
 */

require_once 'config.php';

$error = '';
$success = false;

try {
    $pdo = db();

    // Create Users Table
    $pdo->exec("CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('user', 'admin') DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;");

    // Create Files Table
    $pdo->exec("CREATE TABLE IF NOT EXISTS files (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        original_name VARCHAR(255) NOT NULL,
        stored_name VARCHAR(255) NOT NULL,
        category VARCHAR(50) NOT NULL,
        file_type VARCHAR(100) NOT NULL,
        file_size INT NOT NULL,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB;");

    // Insert Default Admin User
    $stmt = $pdo->prepare("SELECT id FROM users WHERE username = 'admin'");
    $stmt->execute();
    if (!$stmt->fetch()) {
        $password = password_hash('vault2025', PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("INSERT INTO users (username, password, role) VALUES ('admin', ?, 'admin')");
        $stmt->execute([$password]);
    }

    // Create Uploads Directory
    if (!file_exists(UPLOAD_DIR)) {
        mkdir(UPLOAD_DIR, 0755, true);
    }

    // Create uploads/.htaccess to prevent PHP execution
    $htaccess_content = "Options -Indexes\n<Files *.php>\n    Order Deny,Allow\n    Deny from all\n</Files>\n";
    file_put_contents(UPLOAD_DIR . '.htaccess', $htaccess_content);

    $success = true;
} catch (Exception $e) {
    $error = $e->getMessage();
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Vault Installation</title>
    <style>
        body { font-family: sans-serif; background: #0a0e1a; color: #e8e0d0; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
        .card { background: #111827; padding: 2rem; border-radius: 8px; border: 1px solid #c9a84c; text-align: center; max-width: 400px; }
        h1 { color: #c9a84c; }
        .alert { padding: 1rem; margin: 1rem 0; border-radius: 4px; }
        .alert-success { background: rgba(0, 255, 0, 0.1); color: #00ff00; border: 1px solid #00ff00; }
        .alert-error { background: rgba(255, 0, 0, 0.1); color: #ff0000; border: 1px solid #ff0000; }
        .critical { color: #e05555; font-weight: bold; font-size: 1.5rem; display: block; margin-top: 1rem; }
    </style>
</head>
<body>
    <div class="card">
        <h1>Vault Setup</h1>
        <?php if ($success): ?>
            <div class="alert alert-success">
                Installation Successful!<br>
                Default User: <strong>admin</strong><br>
                Default Pass: <strong>vault2025</strong>
            </div>
            <span class="critical">DELETE THIS FILE NOW</span>
            <p><a href="login.php" style="color: #c9a84c;">Go to Login</a></p>
        <?php else: ?>
            <div class="alert alert-error">
                Installation Failed: <?php echo e($error); ?>
            </div>
        <?php endif; ?>
    </div>
</body>
</html>
