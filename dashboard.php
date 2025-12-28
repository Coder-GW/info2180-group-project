<?php
session_start();
header("Content-Type: application/json");

if (!isset($_SESSION["user_id"])) {
    http_response_code(401);
    echo json_encode(["error" => "Unauthorized"]);
    exit;
}

echo json_encode([
    "user_id" => $_SESSION["user_id"],
    "firstname" => $_SESSION["firstname"],
    "lastname" => $_SESSION["lastname"],
    "role" => $_SESSION["role"]
]);
?>