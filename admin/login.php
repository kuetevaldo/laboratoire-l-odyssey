<?php
declare(strict_types=1);
require_once __DIR__ . '/../config/database.php';
start_secure_session();

if (!empty($_SESSION['admin_id'])) {
    header('Location: index.php');
    exit;
}

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();
    if (rate_limit_is_blocked('admin_login')) {
        $error = 'Trop de tentatives. Veuillez patienter 15 minutes.';
    } else {
        $username = trim((string) ($_POST['username'] ?? ''));
        $password = (string) ($_POST['password'] ?? '');
        $connection = database();
        $statement = $connection->prepare('SELECT id, password_hash FROM administrators WHERE username = ? LIMIT 1');
        $statement->execute([$username]);
        $admin = $statement->fetch(PDO::FETCH_ASSOC);

        if ($admin && password_verify($password, $admin['password_hash'])) {
            rate_limit_clear('admin_login');
            session_regenerate_id(true);
            $_SESSION['admin_id'] = (int) $admin['id'];
            header('Location: index.php');
            exit;
        }
        rate_limit_record_failure('admin_login');
        $error = rate_limit_is_blocked('admin_login') ? 'Trop de tentatives. Veuillez patienter 15 minutes.' : 'Identifiant ou mot de passe incorrect.';
    }
}
?>
<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Administration | Laboratoire L'Odyssey</title>
  <link rel="stylesheet" href="../style.css?v=6">
  <link rel="stylesheet" href="./admin.css?v=20260901">
</head>
<body>
  <main class="auth-card">
    <img class="auth-logo" src="../images/logo.jpg?v=5" alt="Laboratoire L'Odyssey">
    <p class="auth-eyebrow">Laboratoire L’Odyssey</p>
    <h1>Administration</h1>
    <p class="auth-intro">Connectez-vous pour gérer les rendez-vous, messages et résultats patients.</p>
    <?php if (isset($_GET['created'])): ?><p class="alert success">Compte créé. Connectez-vous.</p><?php endif; ?>
    <?php if ($error): ?><p class="alert error"><?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?></p><?php endif; ?>
    <form method="post">
      <input type="hidden" name="csrf_token" value="<?= htmlspecialchars(csrf_token(), ENT_QUOTES, 'UTF-8') ?>">
      <label>Identifiant<input name="username" required autofocus autocomplete="username"></label>
      <label>Mot de passe<input type="password" name="password" required autocomplete="current-password"></label>
      <button type="submit">Accéder au tableau de bord</button>
    </form>
    <p class="auth-back"><a href="../index.html">← Retour au site</a></p>
  </main>
</body>
</html>
