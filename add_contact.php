<?php
session_start();
require_once "config.php";

header("Content-Type: application/json");

// 1. Must be logged in
if (!isset($_SESSION["user_id"])) {
    http_response_code(401);
    echo json_encode(["error" => "Unauthorized"]);
    exit;
}

// 2. Only allow POST
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode(["error" => "Invalid request method"]);
    exit;
}

// 3. Read JSON input
$data = json_decode(file_get_contents("php://input"), true);

$title       = trim($data["title"] ?? "");
$firstname   = trim($data["firstname"] ?? "");
$lastname    = trim($data["lastname"] ?? "");
$email       = trim($data["email"] ?? "");
$telephone   = trim($data["telephone"] ?? "");
$company     = trim($data["company"] ?? "");
$type        = trim($data["type"] ?? "");
$assigned_to = $data["assigned_to"] ?? null;

// Normalize assigned_to: treat empty string as NULL
if ($assigned_to === "") {
    $assigned_to = null;
}

// 4. Validate required fields
if (
    $title === "" ||
    $firstname === "" ||
    $lastname === "" ||
    $email === "" ||
    $telephone === "" ||
    $company === "" ||
    $type === ""
) {
    http_response_code(400);
    echo json_encode(["error" => "All required fields must be filled"]);
    exit;
}

// 5. Validate email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid email format"]);
    exit;
}

// 6. Validate contact type
// Accept types used in the UI (Sales Lead, Support) and keep legacy values
$allowedTypes = ["Sales Lead", "Support", "Customer", "Lead"];
if (!in_array($type, $allowedTypes)) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid contact type. Allowed types: " . implode(', ', $allowedTypes)]);
    exit;
}

// 7. Insert contact
$stmt = $pdo->prepare(
    "INSERT INTO contacts
        (title, firstname, lastname, email, telephone, company, type, assigned_to, created_by, created_at)
     VALUES
        (:title, :firstname, :lastname, :email, :telephone, :company, :type, :assigned_to, :created_by, NOW())"
);

$stmt->execute([
    "title"       => $title,
    "firstname"   => $firstname,
    "lastname"    => $lastname,
    "email"       => $email,
    "telephone"   => $telephone,
    "company"     => $company,
    "type"        => $type,
    "assigned_to" => $assigned_to,
    "created_by"  => $_SESSION["user_id"]
]);

// 8. Success
http_response_code(201);
echo json_encode(["message" => "Contact created successfully"]);
?>