<?php
declare(strict_types=1);
require_once __DIR__ . '/../config/database.php';
start_secure_session();

if (empty($_SESSION['admin_id'])) {
    header('Location: login.php');
    exit;
}

$connection = database();
ensure_patient_results_schema($connection);
$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();
    $action = $_POST['action'] ?? '';

    if ($action === 'upload') {
        $patientNumber = trim((string) ($_POST['patient_number'] ?? ''));
        $patientName = trim((string) ($_POST['patient_name'] ?? ''));
        $accessCode = (string) ($_POST['access_code'] ?? '');
        $expiresAt = trim((string) ($_POST['expires_at'] ?? ''));
        $upload = $_FILES['result_file'] ?? null;
        $validExpiry = $expiresAt === '' || (DateTime::createFromFormat('Y-m-d', $expiresAt)?->format('Y-m-d') === $expiresAt);

        if ($patientNumber === '' || strlen($patientNumber) > 50 || $patientName === '' || strlen($patientName) > 100 || strlen($accessCode) < 8 || !$validExpiry || !$upload || $upload['error'] !== UPLOAD_ERR_OK || $upload['size'] > 10 * 1024 * 1024) {
            $error = 'Vérifiez les informations, utilisez un code de 8 caractères minimum et un PDF de 10 Mo maximum.';
        } else {
            $mimeType = (new finfo(FILEINFO_MIME_TYPE))->file($upload['tmp_name']);
            if ($mimeType !== 'application/pdf') {
                $error = 'Seuls les fichiers PDF sont acceptés.';
            } else {
                $storageDirectory = __DIR__ . '/../storage/results';
                if (!is_dir($storageDirectory) && !mkdir($storageDirectory, 0700, true) && !is_dir($storageDirectory)) {
                    $error = 'Le dossier de stockage ne peut pas être créé.';
                } else {
                    $storageName = bin2hex(random_bytes(24)) . '.pdf';
                    if (!move_uploaded_file($upload['tmp_name'], $storageDirectory . '/' . $storageName)) {
                        $error = 'Le fichier n’a pas pu être enregistré.';
                    } else {
                        $fileName = basename((string) $upload['name']);
                        $hash = password_hash($accessCode, PASSWORD_DEFAULT);
                        $expiresAt = $expiresAt === '' ? null : $expiresAt;
                        $statement = $connection->prepare('INSERT INTO patient_results (patient_number, patient_name, access_code_hash, file_name, storage_name, expires_at) VALUES (?, ?, ?, ?, ?, ?)');
                        $statement->execute([$patientNumber, $patientName, $hash, $fileName, $storageName, $expiresAt]);
                        header('Location: results.php?uploaded=1');
                        exit;
                    }
                }
            }
        }
    }

    if ($action === 'toggle') {
        $resultId = filter_input(INPUT_POST, 'result_id', FILTER_VALIDATE_INT);
        if ($resultId) {
            $statement = $connection->prepare('UPDATE patient_results SET is_active = NOT is_active WHERE id = ?');
            $statement->execute([$resultId]);
        }
        header('Location: results.php');
        exit;
    }

    if ($action === 'delete') {
        $resultId = filter_input(INPUT_POST, 'result_id', FILTER_VALIDATE_INT);
        if ($resultId) {
            $statement = $connection->prepare('SELECT storage_name FROM patient_results WHERE id = ? LIMIT 1');
            $statement->execute([$resultId]);
            $result = $statement->fetch(PDO::FETCH_ASSOC);

            if ($result) {
                $delete = $connection->prepare('DELETE FROM patient_results WHERE id = ?');
                $delete->execute([$resultId]);
                $storedFile = __DIR__ . '/../storage/results/' . basename((string) $result['storage_name']);
                if (is_file($storedFile)) {
                    unlink($storedFile);
                }
            }
        }
        header('Location: results.php?deleted=1');
        exit;
    }
}

$results = $connection->query('SELECT id, patient_number, patient_name, file_name, is_active, expires_at, uploaded_at FROM patient_results ORDER BY uploaded_at DESC')->fetchAll();
?>
<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Résultats patients | Administration</title><link rel="stylesheet" href="admin.css?v=20260726"></head><body><main class="dashboard"><header><div><h1>Résultats patients</h1><p>Publiez des PDF protégés par code d’accès.</p></div><a class="button secondary" href="index.php">Retour au tableau de bord</a></header><?php if ($error): ?><p class="alert error"><?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?></p><?php endif; ?><?php if (isset($_GET['uploaded'])): ?><p class="alert success">Résultat ajouté avec succès.</p><?php endif; ?><?php if (isset($_GET['deleted'])): ?><p class="alert success">Résultat supprimé avec succès.</p><?php endif; ?><section class="admin-section"><h2>Ajouter un résultat</h2><form method="post" enctype="multipart/form-data" class="upload-form"><input type="hidden" name="csrf_token" value="<?= htmlspecialchars(csrf_token(), ENT_QUOTES, 'UTF-8') ?>"><input type="hidden" name="action" value="upload"><label>Numéro du patient<input name="patient_number" maxlength="50" required></label><label>Nom du patient<input name="patient_name" maxlength="100" required></label><label>Code sécurisé<input type="password" name="access_code" minlength="8" required></label><label>Date d’expiration (facultative)<input type="date" name="expires_at"></label><label>Résultat PDF<input type="file" name="result_file" accept="application/pdf" required></label><button type="submit">Publier le résultat</button></form></section><section class="admin-section"><h2>Résultats publiés <span class="count"><?= count($results) ?></span></h2><?php if (!$results): ?><p class="empty">Aucun résultat publié.</p><?php endif; ?><?php foreach ($results as $result): ?><article class="result-record"><div><h3><?= htmlspecialchars($result['patient_name'], ENT_QUOTES, 'UTF-8') ?> <span class="status <?= $result['is_active'] ? 'confirmed' : 'cancelled' ?>"><?= $result['is_active'] ? 'actif' : 'désactivé' ?></span></h3><p><?= htmlspecialchars($result['patient_number'], ENT_QUOTES, 'UTF-8') ?> · <?= htmlspecialchars($result['file_name'], ENT_QUOTES, 'UTF-8') ?></p><time>Ajouté le <?= htmlspecialchars($result['uploaded_at'], ENT_QUOTES, 'UTF-8') ?></time></div><form method="post" class="inline-form"><input type="hidden" name="csrf_token" value="<?= htmlspecialchars(csrf_token(), ENT_QUOTES, 'UTF-8') ?>"><input type="hidden" name="result_id" value="<?= (int) $result['id'] ?>"><button name="action" value="toggle"><?= $result['is_active'] ? 'Désactiver' : 'Activer' ?></button><button class="delete-button" name="action" value="delete" onclick="return confirm('Supprimer définitivement ce résultat et son fichier PDF ?')">Supprimer</button></form></article><?php endforeach; ?></section></main></body></html>
