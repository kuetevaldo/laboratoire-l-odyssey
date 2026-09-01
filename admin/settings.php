<?php
declare(strict_types=1);
require_once __DIR__ . '/../config/database.php';
start_secure_session();

if (empty($_SESSION['admin_id'])) {
    header('Location: login.php');
    exit;
}

$connection = database();
$adminId = (int) $_SESSION['admin_id'];
$statement = $connection->prepare('SELECT username, password_hash FROM administrators WHERE id = ? LIMIT 1');
$statement->execute([$adminId]);
$admin = $statement->fetch(PDO::FETCH_ASSOC);

if (!$admin) {
    $_SESSION = [];
    header('Location: login.php');
    exit;
}

$error = '';
$success = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();
    $newUsername = trim((string) ($_POST['username'] ?? ''));
    $currentPassword = (string) ($_POST['current_password'] ?? '');
    $newPassword = (string) ($_POST['new_password'] ?? '');
    $confirmPassword = (string) ($_POST['confirm_password'] ?? '');

    if (!password_verify($currentPassword, (string) $admin['password_hash'])) {
        $error = 'Le mot de passe actuel est incorrect.';
    } else {
        if (!preg_match('/^[A-Za-z0-9_.-]{3,50}$/', $newUsername)) {
            $error = 'Le nom administrateur doit contenir 3 à 50 caractères : lettres, chiffres, point, tiret ou underscore.';
        } elseif ($newUsername !== $admin['username']) {
            $usernameCheck = $connection->prepare('SELECT id FROM administrators WHERE username = ? AND id <> ? LIMIT 1');
            $usernameCheck->execute([$newUsername, $adminId]);
            if ($usernameCheck->fetch(PDO::FETCH_ASSOC)) {
                $error = 'Ce nom administrateur est déjà utilisé.';
            }
        }

        if (!$error && $newPassword !== '' && strlen($newPassword) < 12) {
            $error = 'Le nouveau mot de passe doit contenir au moins 12 caractères.';
        } elseif (!$error && $newPassword !== $confirmPassword) {
            $error = 'Les nouveaux mots de passe ne correspondent pas.';
        }

        if (!$error) {
            if ($newPassword !== '') {
                $update = $connection->prepare('UPDATE administrators SET username = ?, password_hash = ? WHERE id = ?');
                $update->execute([$newUsername, password_hash($newPassword, PASSWORD_DEFAULT), $adminId]);
                $success = 'Votre nom et votre mot de passe ont été mis à jour.';
            } else {
                $update = $connection->prepare('UPDATE administrators SET username = ? WHERE id = ?');
                $update->execute([$newUsername, $adminId]);
                $success = 'Votre nom administrateur a été mis à jour.';
            }
            $admin['username'] = $newUsername;
        }
    }
}
?>
<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Paramètres | Administration</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">
  <link rel="stylesheet" href="./admin.css?v=4">
</head>
<body>
  <main class="dashboard">
    <header>
      <div>
        <h1>Paramètres</h1>
        <p>Gérez votre compte administrateur.</p>
      </div>
      <a class="button secondary" href="index.php">Retour au tableau de bord</a>
    </header>

    <?php if ($error): ?><p class="alert error"><?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?></p><?php endif; ?>
    <?php if ($success): ?><p class="alert success"><?= htmlspecialchars($success, ENT_QUOTES, 'UTF-8') ?></p><?php endif; ?>

    <section class="admin-section">
      <h2>Informations du compte</h2>
      <div class="settings-account"><span class="stat-icon green"><i class="fa-solid fa-user-shield"></i></span><div><strong><?= htmlspecialchars($admin['username'], ENT_QUOTES, 'UTF-8') ?></strong><span> Compte administrateur connecté</span></div></div>
    </section>

    <section class="admin-section">
      <h2>Modifier le compte</h2>
      <form method="post" class="upload-form settings-form">
        <input type="hidden" name="csrf_token" value="<?= htmlspecialchars(csrf_token(), ENT_QUOTES, 'UTF-8') ?>">
        <label>Nom administrateur<input name="username" required minlength="3" maxlength="50" pattern="[A-Za-z0-9_.-]{3,50}" value="<?= htmlspecialchars($admin['username'], ENT_QUOTES, 'UTF-8') ?>" autocomplete="username"></label>
        <label>Mot de passe actuel<input type="password" name="current_password" required autocomplete="current-password"></label>
        <label>Nouveau mot de passe <small>(laisser vide pour ne pas le changer)</small><input type="password" name="new_password" minlength="12" autocomplete="new-password"></label>
        <label>Confirmer le nouveau mot de passe<input type="password" name="confirm_password" minlength="12" autocomplete="new-password"></label>
        <button type="submit">Enregistrer les modifications</button>
      </form>
    </section>
  </main>
</body>
</html>
