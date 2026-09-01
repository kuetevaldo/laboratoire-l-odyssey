<?php
declare(strict_types=1);
require_once __DIR__ . '/config/database.php';

function wants_json_response(): bool
{
    return strpos(strtolower((string) ($_SERVER['HTTP_ACCEPT'] ?? '')), 'application/json') !== false;
}

function respond_to_form(bool $success, string $location): void
{
    if (wants_json_response()) {
        http_response_code($success ? 200 : 422);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['success' => $success], JSON_UNESCAPED_UNICODE);
        exit;
    }

    header('Location: ' . $location);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: index.html');
    exit;
}

$name = trim((string) ($_POST['name'] ?? ''));
$email = trim((string) ($_POST['email'] ?? ''));
$message = trim((string) ($_POST['message'] ?? ''));
$honeypot = trim((string) ($_POST['website'] ?? ''));

if ($honeypot !== '') {
    respond_to_form(false, 'index.html#contact');
}

if ($name === '' || strlen($name) > 100 || !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 150 || $message === '' || strlen($message) > 3000) {
    respond_to_form(false, 'index.html?contact=error#contact');
}

try {
    $connection = database();
    $statement = $connection->prepare('INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)');
    $statement->execute([$name, $email, $message]);
    respond_to_form(true, 'index.html?contact=success#contact');
} catch (Throwable $exception) {
    error_log($exception->getMessage());
    respond_to_form(false, 'index.html?contact=error#contact');
}
