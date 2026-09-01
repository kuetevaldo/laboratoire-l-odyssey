<?php
declare(strict_types=1);
require_once __DIR__ . '/config/database.php';

header('Content-Type: application/xml; charset=utf-8');
header('X-Robots-Tag: noindex');

$pages = [
    ['url' => app_url('/'), 'lastmod' => date('Y-m-d', (int) filemtime(__DIR__ . '/index.html'))],
    ['url' => app_url('service.html'), 'lastmod' => date('Y-m-d', (int) filemtime(__DIR__ . '/service.html'))],
    ['url' => app_url('about.html'), 'lastmod' => date('Y-m-d', (int) filemtime(__DIR__ . '/about.html'))],
    ['url' => app_url('result.html'), 'lastmod' => date('Y-m-d', (int) filemtime(__DIR__ . '/result.html'))],
    ['url' => app_url('blog.php'), 'lastmod' => date('Y-m-d', (int) filemtime(__DIR__ . '/blog.php'))],
];

try {
    $connection = database();
    ensure_blog_schema($connection);
    $articles = $connection->query('SELECT slug, published_at FROM blog_posts WHERE is_published = 1 AND published_at IS NOT NULL AND published_at <= NOW() ORDER BY published_at DESC')->fetchAll(PDO::FETCH_ASSOC);
    foreach ($articles as $article) {
        $pages[] = [
            'url' => app_url('article.php?slug=' . rawurlencode((string) $article['slug'])),
            'lastmod' => substr((string) $article['published_at'], 0, 10),
        ];
    }
} catch (Throwable $exception) {
    error_log('Sitemap blog entries: ' . $exception->getMessage());
}

function sitemap_escape(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES | ENT_XML1, 'UTF-8');
}
echo '<?xml version="1.0" encoding="UTF-8"?>' . PHP_EOL;
?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<?php foreach ($pages as $page): ?>
  <url>
    <loc><?= sitemap_escape($page['url']) ?></loc>
    <lastmod><?= sitemap_escape($page['lastmod']) ?></lastmod>
  </url>
<?php endforeach; ?>
</urlset>
