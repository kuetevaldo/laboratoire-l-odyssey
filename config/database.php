<?php
declare(strict_types=1);

const DB_HOST = 'localhost';
const DB_NAME = 'borel_clinique';
const DB_USER = 'root';
const DB_PASSWORD = '';

function database(): mysqli
{
    mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
    $connection = new mysqli(DB_HOST, DB_USER, DB_PASSWORD, DB_NAME);
    $connection->set_charset('utf8mb4');

    return $connection;
}

function ensure_patient_results_schema(mysqli $connection): void
{
    $connection->query('CREATE TABLE IF NOT EXISTS patient_results (id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, patient_number VARCHAR(50) NOT NULL, patient_name VARCHAR(100) NOT NULL, access_code_hash VARCHAR(255) NOT NULL, file_name VARCHAR(255) NOT NULL, storage_name VARCHAR(80) NOT NULL UNIQUE, is_active TINYINT(1) NOT NULL DEFAULT 1, expires_at DATE NULL, uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, INDEX (patient_number, is_active)) ENGINE=InnoDB');
}

function start_secure_session(): void
{
    if (session_status() === PHP_SESSION_NONE) {
        session_set_cookie_params([
            'httponly' => true,
            'samesite' => 'Lax',
            'secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
        ]);
        session_start();
    }
}

function csrf_token(): string
{
    start_secure_session();

    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }

    return $_SESSION['csrf_token'];
}

function verify_csrf(): void
{
    start_secure_session();
    $token = $_POST['csrf_token'] ?? '';

    if (!is_string($token) || empty($_SESSION['csrf_token']) || !hash_equals($_SESSION['csrf_token'], $token)) {
        http_response_code(403);
        exit('Requête non valide. Veuillez réessayer.');
    }
}
