<?php
/**
 * upload.php - Handle file uploads
 */

require_once 'config.php';
auth();

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'error' => 'Invalid request method.']);
    exit;
}

$user_id = $_SESSION['user_id'];
$category = $_POST['category'] ?? 'other';
$file = $_FILES['file'] ?? null;

if (!$file || $file['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(['success' => false, 'error' => 'No file uploaded or upload error.']);
    exit;
}

// Validate size
if ($file['size'] > MAX_FILE_SIZE) {
    echo json_encode(['success' => false, 'error' => 'File size exceeds 10MB limit.']);
    exit;
}

// Validate extension
$ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
if (!in_array($ext, ALLOWED_EXTENSIONS)) {
    echo json_encode(['success' => false, 'error' => 'File extension not allowed.']);
    exit;
}

// Validate mime type
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mime = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);

if (!in_array($mime, ALLOWED_MIMES)) {
    echo json_encode(['success' => false, 'error' => 'Invalid file type.']);
    exit;
}

// Generate stored name
$stored_name = uniqid('vault_', true) . '.' . $ext;
$target_path = UPLOAD_DIR . $stored_name;

if (move_uploaded_file($file['tmp_name'], $target_path)) {
    try {
        $stmt = db()->prepare("INSERT INTO files (user_id, original_name, stored_name, category, file_type, file_size) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $user_id,
            $file['name'],
            $stored_name,
            $category,
            $mime,
            $file['size']
        ]);
        echo json_encode(['success' => true]);
    } catch (Exception $e) {
        // Remove file if DB insert fails
        unlink($target_path);
        echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['success' => false, 'error' => 'Failed to move uploaded file.']);
}
