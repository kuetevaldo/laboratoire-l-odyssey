<?php
declare(strict_types=1);
require_once __DIR__ . '/config/database.php';

header('Content-Type: text/plain; charset=utf-8');
header('X-Robots-Tag: noindex');
$robotsBasePath = rtrim((string) (parse_url(app_url(''), PHP_URL_PATH) ?: ''), '/');
?>User-agent: *
Allow: /
Disallow: <?= $robotsBasePath ?>/admin/
Disallow: <?= $robotsBasePath ?>/config/
Disallow: <?= $robotsBasePath ?>/database/
Disallow: <?= $robotsBasePath ?>/storage/
Disallow: <?= $robotsBasePath ?>/setup.php
Disallow: <?= $robotsBasePath ?>/patient_results.php
Disallow: <?= $robotsBasePath ?>/result_file.php

Sitemap: <?= app_url('sitemap.xml') ?>
