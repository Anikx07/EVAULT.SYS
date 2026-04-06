<?php
/**
 * admin.php - Admin Dashboard
 */

require_once 'config.php';
admin_auth();

$pdo = db();

// Handle User Creation
$error = '';
$success = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    if ($_POST['action'] === 'add_user') {
        $username = trim($_POST['username']);
        $password = trim($_POST['password']);
        $role = $_POST['role'] === 'admin' ? 'admin' : 'user';

        if (empty($username) || empty($password)) {
            $error = "Username and password are required.";
        } else {
            try {
                $stmt = $pdo->prepare("INSERT INTO users (username, password, role) VALUES (?, ?, ?)");
                $stmt->execute([$username, password_hash($password, PASSWORD_DEFAULT), $role]);
                $success = "User added successfully.";
            } catch (PDOException $e) {
                $error = "Username already exists.";
            }
        }
    } elseif ($_POST['action'] === 'delete_user') {
        $user_id = (int)$_POST['user_id'];
        if ($user_id != $_SESSION['user_id']) {
            $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
            $stmt->execute([$user_id]);
            $success = "User deleted successfully.";
        } else {
            $error = "You cannot delete yourself.";
        }
    }
}

// Get all users
$stmt = $pdo->query("SELECT u.*, (SELECT COUNT(*) FROM files f WHERE f.user_id = u.id) as file_count FROM users u ORDER BY created_at DESC");
$users = $stmt->fetchAll();

// Get all files (for admin view)
$stmt = $pdo->query("SELECT f.*, u.username FROM files f JOIN users u ON f.user_id = u.id ORDER BY uploaded_at DESC");
$all_files = $stmt->fetchAll();

function formatSize($bytes) {
    $units = ['B', 'KB', 'MB', 'GB'];
    for ($i = 0; $bytes > 1024; $i++) $bytes /= 1024;
    return round($bytes, 2) . ' ' . $units[$i];
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard - Vault</title>
    <link rel="stylesheet" href="style.css">
</head>
<body class="<?php echo isset($_COOKIE['theme']) && $_COOKIE['theme'] === 'light' ? 'light-mode' : ''; ?>">
    <header class="main-header">
        <div class="container header-content">
            <a href="index.php" class="site-logo">Vault<span class="accent-text">.</span> Admin</a>
            <div class="header-actions">
                <button id="themeToggle" class="theme-toggle">
                    <span class="theme-icon">🌙</span>
                    <span class="theme-text">Dark</span>
                </button>
                <a href="index.php" class="logout-link">Dashboard</a>
                <a href="logout.php" class="logout-link">Sign Out</a>
            </div>
        </div>
    </header>

    <main class="container">
        <div class="admin-nav">
            <a href="#users" class="active" onclick="showTab('users')">Manage Users</a>
            <a href="#files" onclick="showTab('files')">All Files</a>
        </div>

        <?php if ($error): ?>
            <div class="error-msg" style="margin-bottom: 2rem;"><?php echo e($error); ?></div>
        <?php endif; ?>
        <?php if ($success): ?>
            <div style="color: var(--success); margin-bottom: 2rem; font-size: 0.8rem;"><?php echo e($success); ?></div>
        <?php endif; ?>

        <!-- Users Tab -->
        <div id="usersTab" class="view">
            <div class="view-header">
                <h2 style="font-size: 2.5rem; color: var(--accent); font-style: italic;">User Management</h2>
                <button onclick="document.getElementById('addUserModal').style.display='flex'" class="btn-accent">+ Add User</button>
            </div>

            <div class="file-list-container">
                <div class="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Username</th>
                                <th>Role</th>
                                <th>Files</th>
                                <th>Joined</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($users as $user): ?>
                                <tr>
                                    <td class="file-name"><?php echo e($user['username']); ?></td>
                                    <td><?php echo e(strtoupper($user['role'])); ?></td>
                                    <td><?php echo $user['file_count']; ?></td>
                                    <td><?php echo date('M d, Y', strtotime($user['created_at'])); ?></td>
                                    <td class="actions">
                                        <?php if ($user['id'] != $_SESSION['user_id']): ?>
                                            <form method="POST" style="display:inline;" onsubmit="return confirm('Delete this user and all their files?');">
                                                <input type="hidden" name="action" value="delete_user">
                                                <input type="hidden" name="user_id" value="<?php echo $user['id']; ?>">
                                                <button type="submit" class="btn-del">Delete</button>
                                            </form>
                                        <?php else: ?>
                                            <span style="font-size: 0.6rem; opacity: 0.5;">CURRENT</span>
                                        <?php endif; ?>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- Files Tab -->
        <div id="filesTab" class="view hidden">
            <div class="view-header">
                <h2 style="font-size: 2.5rem; color: var(--accent); font-style: italic;">All Vault Files</h2>
            </div>

            <div class="file-list-container">
                <div class="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Owner</th>
                                <th>Document Name</th>
                                <th>Category</th>
                                <th>Size</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($all_files as $file): ?>
                                <tr>
                                    <td style="font-size: 0.7rem; color: var(--accent);"><?php echo e($file['username']); ?></td>
                                    <td class="file-name"><?php echo e($file['original_name']); ?></td>
                                    <td><?php echo e(ucfirst($file['category'])); ?></td>
                                    <td><?php echo formatSize($file['file_size']); ?></td>
                                    <td class="actions">
                                        <button class="btn-view" data-stored="<?php echo e($file['stored_name']); ?>" data-type="<?php echo e($file['file_type']); ?>">View</button>
                                        <a href="download.php?id=<?php echo $file['id']; ?>" class="btn-dl">Download</a>
                                        <button class="btn-del-admin" data-id="<?php echo $file['id']; ?>">Delete</button>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </main>

    <!-- Add User Modal -->
    <div id="addUserModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2>New User</h2>
            </div>
            <form method="POST">
                <input type="hidden" name="action" value="add_user">
                <div class="form-group">
                    <label>Username</label>
                    <input type="text" name="username" required>
                </div>
                <div class="form-group">
                    <label>Password</label>
                    <input type="password" name="password" required>
                </div>
                <div class="form-group">
                    <label>Role</label>
                    <select name="role">
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
                <div class="modal-footer">
                    <button type="button" onclick="document.getElementById('addUserModal').style.display='none'" class="btn-cancel">Cancel</button>
                    <button type="submit" class="btn-gold">Create User</button>
                </div>
            </form>
        </div>
    </div>

    <!-- Preview Modal (Same as index) -->
    <div id="previewModal" class="modal preview-modal">
        <div class="modal-content">
            <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <h2 style="margin: 0; font-size: 1.5rem;">File Preview</h2>
                <button class="btn-cancel close-modal">Close</button>
            </div>
            <div id="previewContainer" class="preview-container"></div>
        </div>
    </div>

    <script src="app.js"></script>
    <script>
        function showTab(tab) {
            document.getElementById('usersTab').classList.add('hidden');
            document.getElementById('filesTab').classList.add('hidden');
            document.querySelectorAll('.admin-nav a').forEach(a => a.classList.remove('active'));
            
            document.getElementById(tab + 'Tab').classList.remove('hidden');
            event.currentTarget.classList.add('active');
        }

        // Admin specific delete
        document.querySelectorAll('.btn-del-admin').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (!confirm('Are you sure you want to delete this document?')) return;
                const id = btn.dataset.id;
                const response = await fetch(`delete.php?id=${id}`, { method: 'POST' });
                const result = await response.json();
                if (result.success) btn.closest('tr').remove();
                else alert(result.error);
            });
        });
    </script>
</body>
</html>
