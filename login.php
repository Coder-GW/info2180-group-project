<?php
session_start();
require_once "config.php";

header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode(["error" => "Invalid request method"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

$email = trim($data["email"] ?? "");
$password = $data["password"] ?? "";

if ($email === "" || $password === "") {
    http_response_code(400);
    echo json_encode(["error" => "Email and password are required"]);
    exit;
}

$stmt = $pdo->prepare(
    "SELECT id, firstname, lastname, password, role
     FROM users
     WHERE email = :email"
);
$stmt->execute(["email" => $email]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user || !password_verify($password, $user["password"])) {
    http_response_code(401);
    echo json_encode(["error" => "Invalid email or password"]);
    exit;
}

// create session
$_SESSION["user_id"] = $user["id"];
$_SESSION["firstname"] = $user["firstname"];
$_SESSION["lastname"] = $user["lastname"];
$_SESSION["role"] = $user["role"];

echo json_encode([
    "message" => "Login successful",
    "user" => [
        "firstname" => $user["firstname"],
        "lastname" => $user["lastname"],
        "role" => $user["role"]
    ]
]);
?>