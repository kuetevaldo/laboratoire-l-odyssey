<?php
declare(strict_types=1);
require_once __DIR__ . '/config/database.php';

$error = '';

try {
    $server = new mysqli(DB_HOST, DB_USER, DB_PASSWORD);
    $server->set_charset('utf8mb4');
    $server->query('CREATE DATABASE IF NOT EXISTS `' . DB_NAME . '` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    $connection = database();
    $connection->query('CREATE TABLE IF NOT EXISTS administrators (id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, username VARCHAR(50) NOT NULL UNIQUE, password_hash VARCHAR(255) NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB');
    $connection->query('CREATE TABLE IF NOT EXISTS contact_messages (id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100) NOT NULL, email VARCHAR(150) NOT NULL, message TEXT NOT NULL, is_read TINYINT(1) NOT NULL DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, INDEX (is_read, created_at)) ENGINE=InnoDB');
    $connection->query("CREATE TABLE IF NOT EXISTS appointments (id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100) NOT NULL, phone VARCHAR(30) NOT NULL, email VARCHAR(150) NULL, service VARCHAR(100) NOT NULL, appointment_date DATE NOT NULL, appointment_time TIME NOT NULL, notes TEXT NULL, status ENUM('pending', 'confirmed', 'completed', 'cancelled') NOT NULL DEFAULT 'pending', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, INDEX (appointment_date, status)) ENGINE=InnoDB");
    ensure_patient_results_schema($connection);
    $adminExists = (int) $connection->query('SELECT COUNT(*) AS total FROM administrators')->fetch_assoc()['total'] > 0;
} catch (mysqli_sql_exception $exception) {
    $error = 'Connexion MySQL impossible. Vérifiez les identifiants dans config/database.php et assurez-vous que MySQL est démarré.';
    $adminExists = false;
}

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'POST' && !$adminExists && $error === '') {
    $username = trim((string) ($_POST['username'] ?? ''));
    $password = (string) ($_POST['password'] ?? '');

    if (!preg_match('/^[A-Za-z0-9_.-]{3,50}$/', $username) || strlen($password) < 12) {
        $error = 'Utilisez un identifiant de 3 caractères minimum et un mot de passe d’au moins 12 caractères.';
    } else {
        $statement = $connection->prepare('INSERT INTO administrators (username, password_hash) VALUES (?, ?)');
        $hash = password_hash($password, PASSWORD_DEFAULT);
        $statement->bind_param('ss', $username, $hash);
        $statement->execute();
        header('Location: admin/login.php?created=1');
        exit;
    }
}
?>
<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Configuration | Borel Clinique</title><link rel="stylesheet" href="admin/admin.css"></head><body><main class="auth-card"><h1>Configuration Borel Clinique</h1><?php if ($error): ?><p class="alert error"><?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?></p><?php endif; ?><?php if ($adminExists): ?><p class="alert success">La base de données est prête. <a href="admin/login.php">Accéder à l’administration</a></p><?php else: ?><p>Créez le premier compte administrateur.</p><form method="post"><label>Identifiant<input name="username" required maxlength="50" autocomplete="username"></label><label>Mot de passe<input type="password" name="password" required minlength="12" autocomplete="new-password"></label><button type="submit">Créer le compte</button></form><?php endif; ?></main></body></html>
