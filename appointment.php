<?php
declare(strict_types=1);
require_once __DIR__ . '/config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: index.html#appointment');
    exit;
}

$name = trim((string) ($_POST['name'] ?? ''));
$phone = trim((string) ($_POST['phone'] ?? ''));
$email = trim((string) ($_POST['email'] ?? ''));
$service = trim((string) ($_POST['service'] ?? ''));
$appointmentDate = trim((string) ($_POST['appointment_date'] ?? ''));
$appointmentTime = trim((string) ($_POST['appointment_time'] ?? ''));
$notes = trim((string) ($_POST['notes'] ?? ''));
$honeypot = trim((string) ($_POST['website'] ?? ''));
$allowedServices = ['Analyses de routine', 'Bilan de santé', 'Analyses spécialisées', 'Prélèvement à domicile'];
$date = DateTime::createFromFormat('Y-m-d', $appointmentDate);
$time = DateTime::createFromFormat('H:i', $appointmentTime);

if ($honeypot !== '') {
    header('Location: index.html#appointment');
    exit;
}

if ($name === '' || strlen($name) > 100 || $phone === '' || strlen($phone) > 30 || ($email !== '' && (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 150)) || !in_array($service, $allowedServices, true) || !$date || $date->format('Y-m-d') !== $appointmentDate || $date < new DateTime('today') || !$time || $time->format('H:i') !== $appointmentTime || strlen($notes) > 1000) {
    header('Location: index.html?appointment=error#appointment');
    exit;
}

try {
    $connection = database();
    $statement = $connection->prepare('INSERT INTO appointments (name, phone, email, service, appointment_date, appointment_time, notes) VALUES (?, ?, ?, ?, ?, ?, ?)');
    $statement->execute([$name, $phone, $email, $service, $appointmentDate, $appointmentTime, $notes]);
    header('Location: index.html?appointment=success#appointment');
} catch (Throwable $exception) {
    error_log($exception->getMessage());
    header('Location: index.html?appointment=error#appointment');
}
exit;
