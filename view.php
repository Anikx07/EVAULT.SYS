<?php
/**
 * view.php - Serve file content for preview
 */

require_once 'config.php';
auth();

if (!isset($_GET['file'])) {
    die("File not specified.");
}

$stored_name = $_GET['file'];
$file_path = UPLOAD_DIR . $stored_name;

if (!file_exists($file_path)) {
    die("File not found.");
}

// Security: Check if user owns the file or is admin
$pdo = db();
$stmt = $pdo->prepare("SELECT * FROM files WHERE stored_name = ?");
$stmt->execute([$stored_name]);
$file = $stmt->fetch();

if (!$file) {
    die("File record not found.");
}

if ($file['user_id'] != $_SESSION['user_id'] && !is_admin()) {
    die("Access denied.");
}

// Serve the file
$mime = $file['file_type'];
header("Content-Type: $mime");
header("Content-Length: " . filesize($file_path));
// For PDF and images, we want to display inline
header("Content-Disposition: inline; filename=\"" . $file['original_name'] . "\"");

readfile($file_path);
exit;
