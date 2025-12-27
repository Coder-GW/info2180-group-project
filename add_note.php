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

// only allow POST
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode(["error" => "Invalid request method"]);
    exit;
}

// read input
$data = json_decode(file_get_contents("php://input"), true);

$contact_id = $data["contact_id"] ?? null;
$comment    = trim($data["comment"] ?? "");

// validate input
if (!$contact_id || !is_numeric($contact_id) || $comment === "") {
    http_response_code(400);
    echo json_encode(["error" => "Contact ID and comment are required"]);
    exit;
}

// insert note
$stmt = $pdo->prepare(
    "INSERT INTO notes (contact_id, comment, created_by, created_at)
     VALUES (:contact_id, :comment, :created_by, NOW())"
);

$stmt->execute([
    "contact_id" => $contact_id,
    "comment"    => $comment,
    "created_by"=> $_SESSION["user_id"]
]);

// Fetch the inserted note including author name and created_at
$note_id = $pdo->lastInsertId();
$noteStmt = $pdo->prepare(
    "SELECT n.id, n.comment, n.created_at, CONCAT(u.firstname, ' ', u.lastname) AS author_name
     FROM notes n
     JOIN users u ON n.created_by = u.id
     WHERE n.id = ?"
);
$noteStmt->execute([$note_id]);
$note = $noteStmt->fetch(PDO::FETCH_ASSOC);

http_response_code(201);
echo json_encode(["message" => "Note added successfully", "note" => $note]);
?>