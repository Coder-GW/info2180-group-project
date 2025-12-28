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

// only allow POST
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode(["error" => "Invalid request method"]);
    exit;
}

// get input
$data = json_decode(file_get_contents("php://input"), true);

$firstname = trim($data["firstname"] ?? "");
$lastname  = trim($data["lastname"] ?? "");
$email     = trim($data["email"] ?? "");
$password  = $data["password"] ?? "";
$role      = trim($data["role"] ?? "");

// input validation
if ($firstname === "" || $lastname === "" || $email === "" || $password === "" || $role === "") {
    http_response_code(400);
    echo json_encode(["error" => "All fields are required"]);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid email format"]);
    exit;
}

// email check (don't want any duplicates)
$stmt = $pdo->prepare("SELECT id FROM users WHERE email = :email");
$stmt->execute(["email" => $email]);

if ($stmt->fetch()) {
    http_response_code(409);
    echo json_encode(["error" => "Email already exists"]);
    exit;
}

// hash password
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

// insert user
$stmt = $pdo->prepare(
    "INSERT INTO users (firstname, lastname, email, password, role, created_at)
     VALUES (:firstname, :lastname, :email, :password, :role, NOW())"
);

$stmt->execute([
    "firstname" => $firstname,
    "lastname"  => $lastname,
    "email"     => $email,
    "password"  => $hashedPassword,
    "role"      => $role
]);

http_response_code(201);
echo json_encode(["message" => "User created successfully"]);
?>