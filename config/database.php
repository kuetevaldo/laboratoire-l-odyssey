<?php
declare(strict_types=1);

$isLocal = (getenv('APP_ENV') ?: 'local') !== 'production';
ini_set('display_errors', $isLocal ? '1' : '0');
ini_set('log_errors', '1');
error_reporting(E_ALL);

if (!$isLocal) {
    set_exception_handler(static function (Throwable $exception): void {
        error_log($exception->getMessage());
        http_response_code(500);
        exit('Une erreur interne est survenue. Veuillez réessayer plus tard.');
    });
}

const DB_HOST_FALLBACK = 'localhost';
const DB_NAME_FALLBACK = 'borel_clinique';
const DB_USER_FALLBACK = 'root';
const DB_PASSWORD_FALLBACK = '';

function database(): PDO
{
    static $connection;
    if ($connection instanceof PDO) {
        return $connection;
    }
    $host = getenv('DB_HOST') ?: DB_HOST_FALLBACK;
    $name = getenv('DB_NAME') ?: DB_NAME_FALLBACK;
    $user = getenv('DB_USER') ?: DB_USER_FALLBACK;
    $password = getenv('DB_PASSWORD') ?: DB_PASSWORD_FALLBACK;
    $connection = new PDO('mysql:host=' . $host . ';dbname=' . $name . ';charset=utf8mb4', $user, $password, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC, PDO::ATTR_EMULATE_PREPARES => false]);
    return $connection;
}

function ensure_patient_results_schema(PDO $connection): void
{
    $connection->exec("CREATE TABLE IF NOT EXISTS patient_results (id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, patient_number VARCHAR(50) NOT NULL, patient_name VARCHAR(100) NOT NULL, access_code_hash VARCHAR(255) NOT NULL, file_name VARCHAR(255) NOT NULL, storage_name VARCHAR(80) NOT NULL UNIQUE, is_active TINYINT(1) NOT NULL DEFAULT 1, expires_at DATE NULL, uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, INDEX (patient_number, is_active)) ENGINE=InnoDB");
}

function start_secure_session(): void
{
    if (session_status() === PHP_SESSION_NONE) {
        session_set_cookie_params(['httponly' => true, 'samesite' => 'Lax', 'secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off']);
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
