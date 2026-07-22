<?php
declare(strict_types=1);
require_once __DIR__ . '/config/database.php';
start_secure_session();

$resultId = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
$expiresAt = $_SESSION['patient_results_expires_at'] ?? 0;
$allowedIds = $_SESSION['patient_result_ids'] ?? [];

if (!$resultId || !is_array($allowedIds) || time() > $expiresAt || !in_array($resultId, $allowedIds, true)) {
    http_response_code(403);
    exit('Accès refusé. Veuillez consulter vos résultats à nouveau.');
}

$connection = database();
$statement = $connection->prepare('SELECT file_name, storage_name FROM patient_results WHERE id = ? AND is_active = 1');
$statement->bind_param('i', $resultId);
$statement->execute();
$result = $statement->get_result()->fetch_assoc();
$filePath = $result ? __DIR__ . '/storage/results/' . $result['storage_name'] : '';

if (!$result || !is_file($filePath)) {
    http_response_code(404);
    exit('Fichier introuvable.');
}

$download = ($_GET['action'] ?? '') === 'download';
$safeFileName = str_replace(["\r", "\n", '"'], '', $result['file_name']);
header('Content-Type: application/pdf');
header('Content-Length: ' . (string) filesize($filePath));
header('Content-Disposition: ' . ($download ? 'attachment' : 'inline') . '; filename="' . $safeFileName . '"');
header('X-Content-Type-Options: nosniff');
readfile($filePath);
exit;
