<?php
declare(strict_types=1);
require_once __DIR__ . '/../config/database.php';
start_secure_session();

if (empty($_SESSION['admin_id'])) {
    header('Location: login.php');
    exit;
}

$connection = database();
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();
    $action = $_POST['action'] ?? '';

    if ($action === 'message_read' || $action === 'message_delete') {
        $messageId = filter_input(INPUT_POST, 'message_id', FILTER_VALIDATE_INT);
        if ($messageId) {
            $query = $action === 'message_read' ? 'UPDATE contact_messages SET is_read = 1 WHERE id = ?' : 'DELETE FROM contact_messages WHERE id = ?';
            $statement = $connection->prepare($query);
            $statement->execute([$messageId]);
        }
    }

    if ($action === 'appointment_status') {
        $appointmentId = filter_input(INPUT_POST, 'appointment_id', FILTER_VALIDATE_INT);
        $status = $_POST['status'] ?? '';
        $allowedStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
        if ($appointmentId && in_array($status, $allowedStatuses, true)) {
            $statement = $connection->prepare('UPDATE appointments SET status = ? WHERE id = ?');
            $statement->execute([$status, $appointmentId]);
        }
    }

    if ($action === 'appointment_delete') {
        $appointmentId = filter_input(INPUT_POST, 'appointment_id', FILTER_VALIDATE_INT);
        if ($appointmentId) {
            $statement = $connection->prepare('DELETE FROM appointments WHERE id = ?');
            $statement->execute([$appointmentId]);
        }
    }

    header('Location: index.php');
    exit;
}

$appointments = $connection->query('SELECT id, name, phone, email, service, appointment_date, appointment_time, notes, status, created_at FROM appointments ORDER BY appointment_date ASC, appointment_time ASC')->fetchAll();
$messages = $connection->query('SELECT id, name, email, message, is_read, created_at FROM contact_messages ORDER BY created_at DESC')->fetchAll();
$resultsCount = (int) $connection->query('SELECT COUNT(*) AS total FROM patient_results WHERE is_active = 1')->fetch(PDO::FETCH_ASSOC)['total'];
$pendingAppointments = count(array_filter($appointments, static fn(array $appointment): bool => $appointment['status'] === 'pending'));
$unreadMessages = count(array_filter($messages, static fn(array $message): bool => !(bool) $message['is_read']));

function status_label(string $status): string
{
    return ['pending' => 'En attente', 'confirmed' => 'Confirmé', 'completed' => 'Terminé', 'cancelled' => 'Annulé'][$status] ?? $status;
}
?>
<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Administration | Borel Clinique</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">
  <link rel="stylesheet" href="./admin.css?v=4">
</head>
<body class="admin-page">
  <button class="sidebar-overlay" id="sidebarOverlay" type="button" aria-label="Fermer le menu"></button>
  <aside class="sidebar" id="sidebar">
    <div class="sidebar-brand"><span class="brand-mark"><i class="fa-solid fa-plus"></i></span><div><strong>Borel</strong><small>Clinique</small></div></div>
    <p class="sidebar-label">Navigation</p>
    <nav class="sidebar-nav" aria-label="Navigation administration">
      <a class="active" href="index.php"><i class="fa-solid fa-grid-2"></i><span>Dashboard</span></a>
      <a href="#appointments"><i class="fa-regular fa-calendar-check"></i><span>Rendez-vous</span><b><?= count($appointments) ?></b></a>
      <a href="#messages"><i class="fa-regular fa-envelope"></i><span>Messages</span><b><?= $unreadMessages ?></b></a>
      <a href="results.php"><i class="fa-solid fa-file-medical"></i><span>Résultats patients</span></a>
    </nav>
    <p class="sidebar-label">Compte</p>
    <nav class="sidebar-nav">
      <a href="#settings"><i class="fa-solid fa-sliders"></i><span>Paramètres</span></a>
      <a class="sidebar-logout" href="logout.php"><i class="fa-solid fa-arrow-right-from-bracket"></i><span>Se déconnecter</span></a>
    </nav>
    <div class="sidebar-footer"><i class="fa-solid fa-shield-heart"></i><span>Données protégées</span></div>
  </aside>

  <div class="admin-shell">
    <header class="topbar">
      <button class="menu-toggle" id="menuToggle" type="button" aria-label="Ouvrir le menu" aria-expanded="false"><i class="fa-solid fa-bars"></i></button>
      <div class="topbar-heading"><p>Vue d’ensemble</p><h1>Administration</h1></div>
      <div class="topbar-actions"><span class="today"><i class="fa-regular fa-calendar"></i><?= date('d/m/Y') ?></span><span class="admin-avatar">A</span><a class="topbar-logout" href="logout.php"><i class="fa-solid fa-arrow-right-from-bracket"></i><span>Déconnexion</span></a></div>
    </header>

    <main class="dashboard-content">
      <section class="welcome-row"><div><h2>Bonjour, administrateur</h2><p>Voici un aperçu de l’activité de votre clinique.</p></div><a class="primary-button" href="results.php"><i class="fa-solid fa-cloud-arrow-up"></i> Ajouter un résultat</a></section>

      <section class="stats-grid" aria-label="Statistiques">
        <article class="stat-card"><span class="stat-icon green"><i class="fa-regular fa-calendar-check"></i></span><div><strong><?= count($appointments) ?></strong><span>Total rendez-vous</span><small>Toutes demandes reçues</small></div></article>
        <article class="stat-card"><span class="stat-icon orange"><i class="fa-regular fa-clock"></i></span><div><strong><?= $pendingAppointments ?></strong><span>En attente</span><small>À traiter rapidement</small></div></article>
        <article class="stat-card"><span class="stat-icon blue"><i class="fa-regular fa-envelope"></i></span><div><strong><?= count($messages) ?></strong><span>Messages reçus</span><small><?= $unreadMessages ?> non lu<?= $unreadMessages > 1 ? 's' : '' ?></small></div></article>
        <article class="stat-card"><span class="stat-icon purple"><i class="fa-solid fa-file-medical"></i></span><div><strong><?= $resultsCount ?></strong><span>Résultats actifs</span><small>Documents patients publiés</small></div></article>
      </section>

      <section class="dashboard-panel" id="appointments">
        <div class="panel-heading"><div><p class="eyebrow">Planning</p><h2>Rendez-vous</h2></div><a class="outline-button" href="../index.html#appointment"><i class="fa-solid fa-plus"></i> Nouveau rendez-vous</a></div>
        <div class="toolbar"><label class="search-field"><i class="fa-solid fa-magnifying-glass"></i><input id="appointmentSearch" type="search" placeholder="Rechercher un patient, service..." aria-label="Rechercher un rendez-vous"></label><select id="appointmentStatus" aria-label="Filtrer par statut"><option value="">Tous les statuts</option><option value="pending">En attente</option><option value="confirmed">Confirmé</option><option value="completed">Terminé</option><option value="cancelled">Annulé</option></select><input id="appointmentDate" type="date" aria-label="Filtrer par date"></div>
        <div class="table-wrap"><table class="data-table" id="appointmentsTable"><thead><tr><th>Patient</th><th>Téléphone</th><th>Date</th><th>Heure</th><th>Service</th><th>Statut</th><th>Actions</th></tr></thead><tbody><?php foreach ($appointments as $appointment): ?><tr data-status="<?= htmlspecialchars($appointment['status'], ENT_QUOTES, 'UTF-8') ?>" data-date="<?= htmlspecialchars($appointment['appointment_date'], ENT_QUOTES, 'UTF-8') ?>" data-search="<?= htmlspecialchars(strtolower($appointment['name'] . ' ' . $appointment['phone'] . ' ' . $appointment['service']), ENT_QUOTES, 'UTF-8') ?>"><td><div class="patient-cell"><span class="table-avatar"><?= htmlspecialchars(strtoupper(substr($appointment['name'], 0, 1)), ENT_QUOTES, 'UTF-8') ?></span><strong><?= htmlspecialchars($appointment['name'], ENT_QUOTES, 'UTF-8') ?></strong></div></td><td><a href="tel:<?= htmlspecialchars($appointment['phone'], ENT_QUOTES, 'UTF-8') ?>"><?= htmlspecialchars($appointment['phone'], ENT_QUOTES, 'UTF-8') ?></a></td><td><?= htmlspecialchars($appointment['appointment_date'], ENT_QUOTES, 'UTF-8') ?></td><td><?= htmlspecialchars(substr($appointment['appointment_time'], 0, 5), ENT_QUOTES, 'UTF-8') ?></td><td><?= htmlspecialchars($appointment['service'], ENT_QUOTES, 'UTF-8') ?></td><td><span class="status-badge <?= htmlspecialchars($appointment['status'], ENT_QUOTES, 'UTF-8') ?>"><?= status_label($appointment['status']) ?></span></td><td><form method="post" class="table-action-form"><input type="hidden" name="csrf_token" value="<?= htmlspecialchars(csrf_token(), ENT_QUOTES, 'UTF-8') ?>"><input type="hidden" name="appointment_id" value="<?= (int) $appointment['id'] ?>"><select name="status" aria-label="Statut du rendez-vous"><option value="pending" <?= $appointment['status'] === 'pending' ? 'selected' : '' ?>>En attente</option><option value="confirmed" <?= $appointment['status'] === 'confirmed' ? 'selected' : '' ?>>Confirmé</option><option value="completed" <?= $appointment['status'] === 'completed' ? 'selected' : '' ?>>Terminé</option><option value="cancelled" <?= $appointment['status'] === 'cancelled' ? 'selected' : '' ?>>Annulé</option></select><button class="icon-button" name="action" value="appointment_status" title="Mettre à jour" aria-label="Mettre à jour"><i class="fa-solid fa-check"></i></button><button class="icon-button danger-icon" name="action" value="appointment_delete" title="Supprimer" aria-label="Supprimer" onclick="return confirm('Supprimer ce rendez-vous ?')"><i class="fa-regular fa-trash-can"></i></button></form></td></tr><?php endforeach; ?></tbody></table><?php if (!$appointments): ?><div class="empty-state"><i class="fa-regular fa-calendar-xmark"></i><strong>Aucun rendez-vous pour le moment.</strong><span>Les nouvelles demandes apparaîtront ici.</span></div><?php endif; ?></div><div class="table-footer"><span id="appointmentSummary"></span><div class="pagination" id="appointmentPagination"></div></div>
      </section>

      <section class="dashboard-panel" id="messages">
        <div class="panel-heading"><div><p class="eyebrow">Communication</p><h2>Messages reçus</h2></div><span class="panel-count"><?= $unreadMessages ?> non lu<?= $unreadMessages > 1 ? 's' : '' ?></span></div>
        <div class="toolbar"><label class="search-field"><i class="fa-solid fa-magnifying-glass"></i><input id="messageSearch" type="search" placeholder="Rechercher dans les messages..." aria-label="Rechercher un message"></label><select id="messageStatus" aria-label="Filtrer les messages"><option value="">Tous les messages</option><option value="unread">Non lus</option><option value="read">Lus</option></select></div>
        <div class="table-wrap"><table class="data-table" id="messagesTable"><thead><tr><th>Expéditeur</th><th>Email</th><th>Message</th><th>Date</th><th>État</th><th>Actions</th></tr></thead><tbody><?php foreach ($messages as $message): ?><tr data-status="<?= $message['is_read'] ? 'read' : 'unread' ?>" data-search="<?= htmlspecialchars(strtolower($message['name'] . ' ' . $message['email'] . ' ' . $message['message']), ENT_QUOTES, 'UTF-8') ?>"><td><div class="patient-cell"><span class="table-avatar message-avatar"><?= htmlspecialchars(strtoupper(substr($message['name'], 0, 1)), ENT_QUOTES, 'UTF-8') ?></span><strong><?= htmlspecialchars($message['name'], ENT_QUOTES, 'UTF-8') ?></strong></div></td><td><a href="mailto:<?= htmlspecialchars($message['email'], ENT_QUOTES, 'UTF-8') ?>"><?= htmlspecialchars($message['email'], ENT_QUOTES, 'UTF-8') ?></a></td><td class="message-preview"><?= htmlspecialchars(mb_strimwidth($message['message'], 0, 72, '…'), ENT_QUOTES, 'UTF-8') ?></td><td><?= htmlspecialchars($message['created_at'], ENT_QUOTES, 'UTF-8') ?></td><td><span class="read-badge <?= $message['is_read'] ? 'read' : 'unread' ?>"><?= $message['is_read'] ? 'Lu' : 'Non lu' ?></span></td><td><div class="table-actions"><button class="icon-button view-message" type="button" title="Voir le message" aria-label="Voir le message" data-name="<?= htmlspecialchars($message['name'], ENT_QUOTES, 'UTF-8') ?>" data-email="<?= htmlspecialchars($message['email'], ENT_QUOTES, 'UTF-8') ?>" data-date="<?= htmlspecialchars($message['created_at'], ENT_QUOTES, 'UTF-8') ?>" data-message="<?= htmlspecialchars($message['message'], ENT_QUOTES, 'UTF-8') ?>"><i class="fa-regular fa-eye"></i></button><form method="post"><input type="hidden" name="csrf_token" value="<?= htmlspecialchars(csrf_token(), ENT_QUOTES, 'UTF-8') ?>"><input type="hidden" name="message_id" value="<?= (int) $message['id'] ?>"><?php if (!$message['is_read']): ?><button class="icon-button" name="action" value="message_read" title="Marquer comme lu" aria-label="Marquer comme lu"><i class="fa-solid fa-check"></i></button><?php endif; ?><button class="icon-button danger-icon" name="action" value="message_delete" title="Supprimer" aria-label="Supprimer" onclick="return confirm('Supprimer ce message ?')"><i class="fa-regular fa-trash-can"></i></button></form></div></td></tr><?php endforeach; ?></tbody></table><?php if (!$messages): ?><div class="empty-state"><i class="fa-regular fa-envelope-open"></i><strong>Aucun message reçu pour le moment.</strong><span>Les messages du formulaire de contact apparaîtront ici.</span></div><?php endif; ?></div><div class="table-footer"><span id="messageSummary"></span><div class="pagination" id="messagePagination"></div></div>
      </section>
    </main>
  </div>

  <dialog class="message-modal" id="messageModal"><button class="modal-close" id="modalClose" type="button" aria-label="Fermer"><i class="fa-solid fa-xmark"></i></button><p class="eyebrow">Message reçu</p><h2 id="modalName"></h2><a id="modalEmail"></a><time id="modalDate"></time><p class="modal-message" id="modalMessage"></p></dialog>
  <script>
    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.getElementById('menuToggle');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const setSidebar = (open) => { sidebar.classList.toggle('open', open); sidebarOverlay.classList.toggle('visible', open); menuToggle.setAttribute('aria-expanded', String(open)); };
    menuToggle.addEventListener('click', () => setSidebar(!sidebar.classList.contains('open')));
    sidebarOverlay.addEventListener('click', () => setSidebar(false));
    document.querySelectorAll('.sidebar-nav a').forEach((link) => link.addEventListener('click', () => setSidebar(false)));

    const setupTable = (tableId, searchId, filterId, dateId, paginationId, summaryId, statusFilter) => {
      const table = document.getElementById(tableId); if (!table) return;
      const rows = [...table.querySelectorAll('tbody tr')]; const search = document.getElementById(searchId); const filter = document.getElementById(filterId); const date = dateId ? document.getElementById(dateId) : null; const pagination = document.getElementById(paginationId); const summary = document.getElementById(summaryId); let page = 1; const perPage = 10;
      const render = () => { const query = search.value.toLowerCase().trim(); const filtered = rows.filter((row) => (!query || row.dataset.search.includes(query)) && (!filter.value || row.dataset.status === filter.value) && (!date || !date.value || row.dataset.date === date.value)); const pages = Math.max(1, Math.ceil(filtered.length / perPage)); page = Math.min(page, pages); rows.forEach((row) => { row.hidden = true; }); filtered.slice((page - 1) * perPage, page * perPage).forEach((row) => { row.hidden = false; }); summary.textContent = filtered.length ? `${(page - 1) * perPage + 1}–${Math.min(page * perPage, filtered.length)} sur ${filtered.length}` : 'Aucun résultat'; pagination.innerHTML = ''; for (let index = 1; index <= pages; index += 1) { const button = document.createElement('button'); button.type = 'button'; button.textContent = index; button.className = index === page ? 'active' : ''; button.addEventListener('click', () => { page = index; render(); }); pagination.appendChild(button); } };
      [search, filter, date].filter(Boolean).forEach((input) => input.addEventListener('input', () => { page = 1; render(); })); render();
    };
    setupTable('appointmentsTable', 'appointmentSearch', 'appointmentStatus', 'appointmentDate', 'appointmentPagination', 'appointmentSummary');
    setupTable('messagesTable', 'messageSearch', 'messageStatus', null, 'messagePagination', 'messageSummary');

    const modal = document.getElementById('messageModal');
    document.querySelectorAll('.view-message').forEach((button) => button.addEventListener('click', () => { document.getElementById('modalName').textContent = button.dataset.name; const email = document.getElementById('modalEmail'); email.textContent = button.dataset.email; email.href = `mailto:${button.dataset.email}`; document.getElementById('modalDate').textContent = button.dataset.date; document.getElementById('modalMessage').textContent = button.dataset.message; modal.showModal(); }));
    document.getElementById('modalClose').addEventListener('click', () => modal.close());
    modal.addEventListener('click', (event) => { if (event.target === modal) modal.close(); });
  </script>
</body>
</html>
