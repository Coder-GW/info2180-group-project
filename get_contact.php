<?php
session_start();
require_once "config.php";
header("Content-Type: application/json");

if (!isset($_SESSION["user_id"])) { exit(json_encode(["error" => "Unauthorized"])); }

$id = $_GET['id'] ?? null;

// Fetch Contact
$stmt = $pdo->prepare("
    SELECT c.*, 
           CONCAT(u1.firstname, ' ', u1.lastname) as creator_name,
           CONCAT(u2.firstname, ' ', u2.lastname) as assigned_name
    FROM contacts c
    LEFT JOIN users u1 ON c.created_by = u1.id
    LEFT JOIN users u2 ON c.assigned_to = u2.id
    WHERE c.id = ?
");
$stmt->execute([$id]);
$contact = $stmt->fetch(PDO::FETCH_ASSOC);

// Fetch Notes
$nStmt = $pdo->prepare("
    SELECT n.*, CONCAT(u.firstname, ' ', u.lastname) as author_name 
    FROM notes n 
    JOIN users u ON n.created_by = u.id 
    WHERE n.contact_id = ? ORDER BY n.created_at DESC
");
$nStmt->execute([$id]);
$notes = $nStmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode(["contact" => $contact, "notes" => $notes]);
?>