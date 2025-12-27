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

// validate contact_id
$contact_id = $_GET["contact_id"] ?? null;

if (!$contact_id || !is_numeric($contact_id)) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid contact ID"]);
    exit;
}

// fetch notes with author info
$stmt = $pdo->prepare(
    "SELECT
        n.id,
        n.comment,
        n.created_at,
        CONCAT(u.firstname, ' ', u.lastname) AS created_by
     FROM notes n
     JOIN users u ON n.created_by = u.id
     WHERE n.contact_id = :contact_id
     ORDER BY n.created_at DESC"
);

$stmt->execute(["contact_id" => $contact_id]);
$notes = $stmt->fetchAll(PDO::FETCH_ASSOC);

// 4. Return notes
echo json_encode($notes);
?>