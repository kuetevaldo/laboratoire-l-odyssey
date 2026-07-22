<?php
declare(strict_types=1);
require_once __DIR__ . '/config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: index.html');
    exit;
}

$name = trim((string) ($_POST['name'] ?? ''));
$email = trim((string) ($_POST['email'] ?? ''));
$message = trim((string) ($_POST['message'] ?? ''));
$honeypot = trim((string) ($_POST['website'] ?? ''));

if ($honeypot !== '') {
    header('Location: index.html#contact');
    exit;
}

if ($name === '' || strlen($name) > 100 || !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 150 || $message === '' || strlen($message) > 3000) {
    header('Location: index.html?contact=error#contact');
    exit;
}

try {
    $connection = database();
    $statement = $connection->prepare('INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)');
    $statement->bind_param('sss', $name, $email, $message);
    $statement->execute();
    header('Location: index.html?contact=success#contact');
} catch (mysqli_sql_exception $exception) {
    header('Location: index.html?contact=error#contact');
}
exit;
