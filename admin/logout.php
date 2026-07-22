<?php
declare(strict_types=1);
require_once __DIR__ . '/../config/database.php';
start_secure_session();
$_SESSION = [];
session_destroy();
header('Location: login.php');
exit;
