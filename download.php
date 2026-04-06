<?php
/**
 * download.php - Handle file downloads
 */

require_once 'config.php';
auth();

$file_id = $_GET['id'] ?? null;
$user_id = $_SESSION['user_id'];

if (!$file_id) {
    die("File ID missing.");
}

try {
    $stmt = db()->prepare("SELECT * FROM files WHERE id = ?");
    $stmt->execute([$file_id]);
    $file = $stmt->fetch();

    if ($file && ($file['user_id'] == $user_id || is_admin())) {
        $file_path = UPLOAD_DIR . $file['stored_name'];
        if (file_exists($file_path)) {
            header('Content-Description: File Transfer');
            header('Content-Type: ' . $file['file_type']);
            header('Content-Disposition: attachment; filename="' . $file['original_name'] . '"');
            header('Expires: 0');
            header('Cache-Control: must-revalidate');
            header('Pragma: public');
            header('Content-Length: ' . filesize($file_path));
            readfile($file_path);
            exit;
        } else {
            die("File not found on server.");
        }
    } else {
        die("File not found or access denied.");
    }
} catch (Exception $e) {
    die("Error: " . $e->getMessage());
}
