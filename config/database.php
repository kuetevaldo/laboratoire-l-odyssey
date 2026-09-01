<?php
declare(strict_types=1);

$localConfiguration = [];
$productionConfigurationPath = __DIR__ . '/production.php';

if (is_file($productionConfigurationPath)) {
    $loadedConfiguration = require $productionConfigurationPath;
    if (!is_array($loadedConfiguration)) {
        throw new RuntimeException('Le fichier config/production.php doit retourner un tableau.');
    }
    $localConfiguration = $loadedConfiguration;
}

function configuration_value(string $key, string $environmentName, mixed $default = null): mixed
{
    global $localConfiguration;
    $environmentValue = getenv($environmentName);
    if ($environmentValue !== false && $environmentValue !== '') {
        return $environmentValue;
    }
    return $localConfiguration[$key] ?? $default;
}

function is_production(): bool
{
    return strtolower((string) configuration_value('app_env', 'APP_ENV', 'local')) === 'production';
}

function request_is_https(): bool
{
    if (!empty($_SERVER['HTTPS']) && strtolower((string) $_SERVER['HTTPS']) !== 'off') {
        return true;
    }
    return strtolower((string) ($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '')) === 'https';
}

function app_url(string $path = ''): string
{
    $configuredUrl = trim((string) configuration_value('app_url', 'APP_URL', ''));
    if ($configuredUrl !== '') {
        $baseUrl = rtrim($configuredUrl, '/');
    } else {
        $scheme = request_is_https() ? 'https' : 'http';
        $host = (string) ($_SERVER['HTTP_HOST'] ?? 'localhost');
        if (!preg_match('/^[a-z0-9.:-]+$/i', $host)) {
            $host = 'localhost';
        }
        $scriptDirectory = str_replace('\\', '/', dirname((string) ($_SERVER['SCRIPT_NAME'] ?? '/')));
        $scriptDirectory = $scriptDirectory === '/' ? '' : rtrim($scriptDirectory, '/');
        $scriptDirectory = implode('/', array_map(static fn(string $segment): string => rawurlencode(rawurldecode($segment)), explode('/', $scriptDirectory)));
        $baseUrl = $scheme . '://' . $host . $scriptDirectory;
    }

    return $path === '' ? $baseUrl : $baseUrl . '/' . ltrim($path, '/');
}

$isLocal = !is_production();
ini_set('display_errors', $isLocal ? '1' : '0');
ini_set('log_errors', '1');
error_reporting(E_ALL);
date_default_timezone_set('Africa/Douala');

if (!$isLocal) {
    set_exception_handler(static function (Throwable $exception): void {
        error_log($exception->getMessage());
        http_response_code(500);
        exit('Une erreur interne est survenue. Veuillez réessayer plus tard.');
    });
}

define('DB_HOST_FALLBACK', (string) configuration_value('db_host', 'DB_HOST', 'localhost'));
define('DB_NAME_FALLBACK', (string) configuration_value('db_name', 'DB_NAME', 'borel_clinique'));
define('DB_USER_FALLBACK', (string) configuration_value('db_user', 'DB_USER', 'root'));
define('DB_PASSWORD_FALLBACK', (string) configuration_value('db_password', 'DB_PASSWORD', ''));
define('DB_PORT_FALLBACK', (int) configuration_value('db_port', 'DB_PORT', 3306));

function database(): PDO
{
    static $connection;
    if ($connection instanceof PDO) {
        return $connection;
    }
    $host = (string) configuration_value('db_host', 'DB_HOST', DB_HOST_FALLBACK);
    $name = (string) configuration_value('db_name', 'DB_NAME', DB_NAME_FALLBACK);
    $user = (string) configuration_value('db_user', 'DB_USER', DB_USER_FALLBACK);
    $password = (string) configuration_value('db_password', 'DB_PASSWORD', DB_PASSWORD_FALLBACK);
    $port = (int) configuration_value('db_port', 'DB_PORT', DB_PORT_FALLBACK);

    if (is_production() && ($name === '' || $user === '' || $password === '' || str_contains($name, 'your_') || str_contains($user, 'your_'))) {
        throw new RuntimeException('La configuration de production de la base de données est incomplète.');
    }

    $connection = new PDO(
        'mysql:host=' . $host . ';port=' . $port . ';dbname=' . $name . ';charset=utf8mb4',
        $user,
        $password,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
            PDO::ATTR_TIMEOUT => 5,
        ]
    );
    return $connection;
}

function ensure_patient_results_schema(PDO $connection): void
{
    $connection->exec("CREATE TABLE IF NOT EXISTS patient_results (id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, patient_number VARCHAR(50) NOT NULL, patient_name VARCHAR(100) NOT NULL, access_code_hash VARCHAR(255) NOT NULL, file_name VARCHAR(255) NOT NULL, storage_name VARCHAR(80) NOT NULL UNIQUE, is_active TINYINT(1) NOT NULL DEFAULT 1, expires_at DATE NULL, uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, INDEX (patient_number, is_active)) ENGINE=InnoDB");
}

function ensure_blog_schema(PDO $connection): void
{
    $connection->exec("CREATE TABLE IF NOT EXISTS blog_posts (id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, title VARCHAR(180) NOT NULL, slug VARCHAR(200) NOT NULL UNIQUE, excerpt VARCHAR(300) NOT NULL, content TEXT NOT NULL, cover_image VARCHAR(255) NULL, is_published TINYINT(1) NOT NULL DEFAULT 0, published_at DATETIME NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, INDEX idx_blog_published (is_published, published_at)) ENGINE=InnoDB");
}

function create_blog_slug(PDO $connection, string $title, ?int $excludeId = null): string
{
    $transliterated = function_exists('iconv') ? iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $title) : $title;
    $base = strtolower((string) $transliterated);
    $base = trim((string) preg_replace('/[^a-z0-9]+/', '-', $base), '-');
    $base = $base !== '' ? substr($base, 0, 180) : 'article';
    $slug = $base;
    $suffix = 2;

    while (true) {
        if ($excludeId === null) {
            $statement = $connection->prepare('SELECT id FROM blog_posts WHERE slug = ? LIMIT 1');
            $statement->execute([$slug]);
        } else {
            $statement = $connection->prepare('SELECT id FROM blog_posts WHERE slug = ? AND id <> ? LIMIT 1');
            $statement->execute([$slug, $excludeId]);
        }
        if (!$statement->fetch(PDO::FETCH_ASSOC)) {
            return $slug;
        }
        $slug = substr($base, 0, 175) . '-' . $suffix;
        $suffix++;
    }
}

function start_secure_session(): void
{
    if (session_status() === PHP_SESSION_NONE) {
        ini_set('session.use_strict_mode', '1');
        ini_set('session.use_only_cookies', '1');
        session_name('odyssey_session');
        session_set_cookie_params(['httponly' => true, 'samesite' => 'Lax', 'secure' => request_is_https(), 'path' => '/']);
        session_start();
    }
}

function rate_limit_is_blocked(string $key, int $maximumAttempts = 5, int $windowSeconds = 900): bool
{
    start_secure_session();
    $now = time();
    $attempts = $_SESSION['rate_limits'][$key] ?? [];
    $attempts = is_array($attempts) ? array_values(array_filter($attempts, static fn(mixed $attempt): bool => is_int($attempt) && $attempt > $now - $windowSeconds)) : [];
    $_SESSION['rate_limits'][$key] = $attempts;

    return count($attempts) >= $maximumAttempts;
}

function rate_limit_record_failure(string $key, int $windowSeconds = 900): void
{
    rate_limit_is_blocked($key, PHP_INT_MAX, $windowSeconds);
    $_SESSION['rate_limits'][$key][] = time();
}

function rate_limit_clear(string $key): void
{
    start_secure_session();
    unset($_SESSION['rate_limits'][$key]);
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
