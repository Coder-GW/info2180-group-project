<?php
session_start();
require_once "config.php";

header("Content-Type: application/json");

// must be logged in
if (!isset($_SESSION["user_id"])) {
    http_response_code(401);
    echo json_encode(["error" => "Unauthorized"]);
    exit;
}

// only POST
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode(["error" => "Invalid request method"]);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$id = $input['id'] ?? null;
$action = $input['action'] ?? null;

if (!$id || !is_numeric($id) || !$action) {
    http_response_code(400);
    echo json_encode(["error" => "Missing id or action"]);
    exit;
}

try {
    if ($action === 'assign') {
        // assign to current user
        $stmt = $pdo->prepare("UPDATE contacts SET assigned_to = :uid, updated_at = NOW() WHERE id = :id");
        $stmt->execute(["uid" => $_SESSION["user_id"], "id" => $id]);
    } elseif ($action === 'switch') {
        // get current type
        $s = $pdo->prepare("SELECT type FROM contacts WHERE id = :id");
        $s->execute(["id" => $id]);
        $row = $s->fetch(PDO::FETCH_ASSOC);
        if (!$row) {
            http_response_code(404);
            echo json_encode(["error" => "Contact not found"]);
            exit;
        }
        $current = $row['type'];
        // Normalize to UI values
        $isLead = ($current === 'Lead' || $current === 'Sales Lead');
        $newType = $isLead ? 'Support' : 'Sales Lead';
        $u = $pdo->prepare("UPDATE contacts SET type = :type, updated_at = NOW() WHERE id = :id");
        $u->execute(["type" => $newType, "id" => $id]);
    } else {
        http_response_code(400);
        echo json_encode(["error" => "Unknown action"]);
        exit;
    }

    // return updated contact (with creator and assigned names)
    $stmt = $pdo->prepare("SELECT c.*, CONCAT(u1.firstname, ' ', u1.lastname) as creator_name, CONCAT(u2.firstname, ' ', u2.lastname) as assigned_name FROM contacts c LEFT JOIN users u1 ON c.created_by = u1.id LEFT JOIN users u2 ON c.assigned_to = u2.id WHERE c.id = :id");
    $stmt->execute(["id" => $id]);
    $contact = $stmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode(["contact" => $contact]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database error"]);
}
