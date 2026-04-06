<?php
/**
 * login.php - User login page
 */

require_once 'config.php';

if (isset($_SESSION['user_id'])) {
    header('Location: index.php');
    exit;
}

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? '';

    if ($username && $password) {
        $stmt = db()->prepare("SELECT * FROM users WHERE username = ?");
        $stmt->execute([$username]);
        $user = $stmt->fetch();

        if ($user && password_verify($password, $user['password'])) {
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['username'] = $user['username'];
            $_SESSION['role'] = $user['role'];
            header('Location: index.php');
            exit;
        } else {
            $error = 'Invalid username or password.';
        }
    } else {
        $error = 'Please fill in all fields.';
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - MY VAULT</title>
    <link rel="stylesheet" href="style.css">
</head>
<body class="login-page">
    <div class="login-container">
        <form action="login.php" method="POST" class="login-card">
            <h1 class="vault-title">MY VAULT</h1>
            <p class="subtitle">Secure Document Storage</p>
            
            <?php if ($error): ?>
                <div class="error-msg"><?php echo e($error); ?></div>
            <?php endif; ?>

            <div class="input-group">
                <input type="text" name="username" placeholder="Username" required autocomplete="off">
            </div>
            <div class="input-group">
                <input type="password" name="password" placeholder="Password" required>
            </div>
            
            <button type="submit" class="btn-login">ENTER VAULT</button>
        </form>
    </div>
</body>
</html>
