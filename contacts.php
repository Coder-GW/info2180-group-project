<?php
session_start();
require_once "config.php";
header("Content-Type: application/json");

if (!isset($_SESSION["user_id"])) {
    http_response_code(401);
    exit(json_encode(["error" => "Unauthorized"]));
}

$query = "SELECT c.*, CONCAT(u.firstname, ' ', u.lastname) AS assigned_to 
          FROM contacts c LEFT JOIN users u ON c.assigned_to = u.id";
$params = [];

// Handle filters from dashboard.js
if (isset($_GET['type'])) {
    $query .= " WHERE c.type = :type";
    $params['type'] = $_GET['type'];
} elseif (isset($_GET['assigned_to_me'])) {
    $query .= " WHERE c.assigned_to = :me";
    $params['me'] = $_SESSION['user_id'];
}

$query .= " ORDER BY c.created_at DESC";
$stmt = $pdo->prepare($query);
$stmt->execute($params);

echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
?>