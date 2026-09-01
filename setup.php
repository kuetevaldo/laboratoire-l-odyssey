<?php
declare(strict_types=1);
require_once __DIR__ . '/config/database.php';

$allowSetup = filter_var(configuration_value('allow_setup', 'ALLOW_SETUP', false), FILTER_VALIDATE_BOOLEAN);
if (is_production() && !$allowSetup) {
    http_response_code(404);
    exit('Page introuvable.');
}

start_secure_session();

$error = '';
$adminExists = false;
try {
    if (!is_production()) {
        $server = new PDO(
            'mysql:host=' . DB_HOST_FALLBACK . ';port=' . DB_PORT_FALLBACK . ';charset=utf8mb4',
            DB_USER_FALLBACK,
            DB_PASSWORD_FALLBACK,
            [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
        );
        $server->exec('CREATE DATABASE IF NOT EXISTS `borel_clinique` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    }
    $connection = database();
    $connection->exec('CREATE TABLE IF NOT EXISTS administrators (id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, username VARCHAR(50) NOT NULL UNIQUE, password_hash VARCHAR(255) NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP) ENGINE=InnoDB');
    $connection->exec('CREATE TABLE IF NOT EXISTS appointments (id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100) NOT NULL, phone VARCHAR(30) NOT NULL, email VARCHAR(150) NULL, service VARCHAR(100) NOT NULL, appointment_date DATE NOT NULL, appointment_time TIME NOT NULL, notes TEXT NULL, status ENUM(\'pending\', \'confirmed\', \'completed\', \'cancelled\') NOT NULL DEFAULT \'pending\', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, INDEX (appointment_date, status)) ENGINE=InnoDB');
    $connection->exec('CREATE TABLE IF NOT EXISTS contact_messages (id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100) NOT NULL, email VARCHAR(150) NOT NULL, message TEXT NOT NULL, is_read TINYINT(1) NOT NULL DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, INDEX (is_read, created_at)) ENGINE=InnoDB');
    ensure_patient_results_schema($connection);
    ensure_blog_schema($connection);
    $adminExists = (int) $connection->query('SELECT COUNT(*) FROM administrators')->fetchColumn() > 0;
} catch (Throwable $exception) {
    error_log($exception->getMessage());
    $error = 'La configuration de la base de données est temporairement indisponible.';
}

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'POST' && !$adminExists && $error === '') {
    verify_csrf();
    $username = trim((string) ($_POST['username'] ?? ''));
    $password = (string) ($_POST['password'] ?? '');
    if (!preg_match('/^[A-Za-z0-9_.-]{3,50}$/', $username) || strlen($password) < 12) {
        $error = 'Utilisez un identifiant de 3 caractères minimum et un mot de passe d’au moins 12 caractères.';
    } else {
        $statement = $connection->prepare('INSERT INTO administrators (username, password_hash) VALUES (?, ?)');
        $statement->execute([$username, password_hash($password, PASSWORD_DEFAULT)]);
        header('Location: admin/login.php?created=1');
        exit;
    }
}
?>
<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Configuration | Laboratoire L'Odyssey</title><link rel="stylesheet" href="admin/admin.css"></head><body><main class="auth-card"><h1>Configuration L'Odyssey</h1><?php if ($error): ?><p class="alert error"><?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?></p><?php endif; ?><?php if ($adminExists): ?><p class="alert success">La base de données est prête. <a href="admin/login.php">Accéder à l’administration</a></p><?php else: ?><p>Créez le premier compte administrateur.</p><form method="post"><input type="hidden" name="csrf_token" value="<?= htmlspecialchars(csrf_token(), ENT_QUOTES, 'UTF-8') ?>"><label>Identifiant<input name="username" required maxlength="50" autocomplete="username"></label><label>Mot de passe<input type="password" name="password" required minlength="12" autocomplete="new-password"></label><button type="submit">Créer le compte</button></form><?php endif; ?></main></body></html>
