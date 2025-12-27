<?php
session_start();
require_once "config.php";

header("Content-Type: application/json");

// login check
if (!isset($_SESSION["user_id"])) {
    http_response_code(401);
    echo json_encode(["error" => "Unauthorized"]);
    exit;
}

// admin check
if ($_SESSION["role"] !== "admin") {
    http_response_code(403);
    echo json_encode(["error" => "Forbidden"]);
    exit;
}

// fetch users from database
$stmt = $pdo->query(
    "SELECT id, firstname, lastname, email, role, created_at
     FROM users
     ORDER BY created_at DESC"
);

$users = $stmt->fetchAll(PDO::FETCH_ASSOC);

// return data
echo json_encode($users);
?>