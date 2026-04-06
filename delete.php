<?php
/**
 * delete.php - Handle file deletion
 */

require_once 'config.php';
auth();

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'error' => 'Invalid request method.']);
    exit;
}

$file_id = $_POST['file_id'] ?? null;
$user_id = $_SESSION['user_id'];

if (!$file_id) {
    echo json_encode(['success' => false, 'error' => 'File ID missing.']);
    exit;
}

try {
    $pdo = db();
    $stmt = $pdo->prepare("SELECT * FROM files WHERE id = ?");
    $stmt->execute([$file_id]);
    $file = $stmt->fetch();

    if ($file && ($file['user_id'] == $user_id || is_admin())) {
        $file_path = UPLOAD_DIR . $file['stored_name'];
        if (file_exists($file_path)) {
            unlink($file_path);
        }

        $stmt = $pdo->prepare("DELETE FROM files WHERE id = ?");
        $stmt->execute([$file_id]);

        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => 'File not found or access denied.']);
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
}
