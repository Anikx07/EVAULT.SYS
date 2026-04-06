<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// --- CONFIGURATION ---
$host = "sql100.ezyro.com"; // Change if your host is different
$db_name = "your_db_name";   // Your DB Name
$username = "ezyro_41552605"; // Your DB User
$password = "your_password"; // Your DB Password

try {
    $db = new PDO("mysql:host=" . $host . ";dbname=" . $db_name, $username, $password);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    die(json_encode(["error" => "DB Connection failed"]));
}

$action = $_GET['action'] ?? '';
$data = json_decode(file_get_contents("php://input"), true);

switch($action) {
    case 'login':
        $stmt = $db->prepare("SELECT * FROM users WHERE username = ? AND password = ?");
        $stmt->execute([$data['username'], $data['password']]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        echo json_encode($user ? ["status" => "success", "user" => $user] : ["status" => "error"]);
        break;

    case 'get_users':
        $stmt = $db->query("SELECT id, username, role, joined, fileCount FROM users");
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        break;

    case 'create_user':
        $stmt = $db->prepare("INSERT INTO users (username, password, role, joined) VALUES (?, ?, ?, CURDATE())");
        $success = $stmt->execute([$data['username'], $data['password'], $data['role']]);
        echo json_encode(["status" => $success ? "success" : "error"]);
        break;

    case 'get_files':
        $stmt = $db->query("SELECT * FROM files");
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        break;

    case 'delete_file':
        $stmt = $db->prepare("DELETE FROM files WHERE id = ?");
        $stmt->execute([$_GET['id']]);
        echo json_encode(["status" => "success"]);
        break;

    default:
        echo json_encode(["status" => "online"]);
}
?>
