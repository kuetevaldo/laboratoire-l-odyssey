<?php
declare(strict_types=1);
require_once __DIR__ . '/config/database.php';
start_secure_session();

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $patientNumber = trim((string) ($_POST['patient_number'] ?? ''));
    $accessCode = (string) ($_POST['access_code'] ?? '');

    if ($patientNumber === '' || strlen($patientNumber) > 50 || $accessCode === '') {
        $error = 'Veuillez renseigner votre numéro de patient et votre code sécurisé.';
    } else {
        $connection = database();
        $statement = $connection->prepare('SELECT id, patient_name, file_name, access_code_hash FROM patient_results WHERE patient_number = ? AND is_active = 1 AND (expires_at IS NULL OR expires_at >= CURDATE()) ORDER BY uploaded_at DESC');
        $statement->execute([$patientNumber]);
        $results = $statement->fetchAll();
        $accessibleResultIds = [];

        foreach ($results as $result) {
            if (password_verify($accessCode, $result['access_code_hash'])) {
                $accessibleResultIds[] = (int) $result['id'];
            }
        }

        if ($accessibleResultIds) {
            $_SESSION['patient_result_ids'] = $accessibleResultIds;
            $_SESSION['patient_results_expires_at'] = time() + 900;
            $results = array_values(array_filter($results, static fn(array $result): bool => in_array((int) $result['id'], $accessibleResultIds, true)));
        } else {
            $error = 'Numéro de patient ou code sécurisé incorrect.';
        }
    }
} else {
    $error = 'Veuillez utiliser le formulaire de consultation des résultats.';
}
?>
<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Mes résultats | Laboratoire L’Odyssey</title><link rel="stylesheet" href="style.css"></head><body><main class="patient-results"><div class="patient-results-card"><a href="result.html" class="back-link">← Retour</a><h1>Mes résultats</h1><?php if ($error): ?><p class="result-alert error"><?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?></p><a href="result.html" class="btn-primary">Réessayer</a><?php else: ?><p class="result-alert success">Vos résultats sont disponibles pendant 15 minutes.</p><?php foreach ($results as $result): ?><article class="patient-result-file"><h2><?= htmlspecialchars($result['file_name'], ENT_QUOTES, 'UTF-8') ?></h2><p><?= htmlspecialchars($result['patient_name'], ENT_QUOTES, 'UTF-8') ?></p><a class="btn-primary" href="result_file.php?id=<?= (int) $result['id'] ?>&action=view" target="_blank">Consulter</a><a class="btn-secondary" href="result_file.php?id=<?= (int) $result['id'] ?>&action=download">Télécharger</a></article><?php endforeach; ?><?php endif; ?></div></main></body></html>
