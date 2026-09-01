<?php
declare(strict_types=1);
require_once __DIR__ . '/config/database.php';

$connection = database();
ensure_blog_schema($connection);
$slug = trim((string) ($_GET['slug'] ?? ''));
$statement = $connection->prepare('SELECT title, excerpt, content, cover_image, published_at FROM blog_posts WHERE slug = ? AND is_published = 1 AND published_at IS NOT NULL AND published_at <= NOW() LIMIT 1');
$statement->execute([$slug]);
$post = $statement->fetch(PDO::FETCH_ASSOC);

if (!$post) {
    http_response_code(404);
}

function article_image(?string $image): ?string
{
    $image = trim((string) $image);
    return $image !== '' && preg_match('#^(https?://|images/)#i', $image) ? $image : null;
}

$image = $post ? article_image($post['cover_image']) : null;
$pageTitle = $post ? $post['title'] . ' | Laboratoire L’Odyssey' : 'Article introuvable | Laboratoire L’Odyssey';
$pageDescription = $post ? $post['excerpt'] : 'Cet article du Laboratoire L’Odyssey est introuvable.';
$canonicalUrl = $post ? app_url('article.php?slug=' . rawurlencode($slug)) : app_url('article.php');
$socialImage = $image && preg_match('#^https?://#i', $image) ? $image : app_url($image ?: 'images/hero-img.jpg');
?>
<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="<?= htmlspecialchars($pageDescription, ENT_QUOTES, 'UTF-8') ?>">
  <meta name="robots" content="<?= $post ? 'index, follow, max-image-preview:large' : 'noindex, follow' ?>">
  <meta name="theme-color" content="#19764b">
  <title><?= htmlspecialchars($pageTitle, ENT_QUOTES, 'UTF-8') ?></title>
  <link rel="canonical" href="<?= htmlspecialchars($canonicalUrl, ENT_QUOTES, 'UTF-8') ?>">
  <link rel="icon" href="images/logo.jpg" type="image/jpeg">
  <link rel="manifest" href="site.webmanifest">
  <meta property="og:locale" content="fr_FR">
  <meta property="og:type" content="<?= $post ? 'article' : 'website' ?>">
  <meta property="og:site_name" content="Laboratoire L'Odyssey">
  <meta property="og:title" content="<?= htmlspecialchars($pageTitle, ENT_QUOTES, 'UTF-8') ?>">
  <meta property="og:description" content="<?= htmlspecialchars($pageDescription, ENT_QUOTES, 'UTF-8') ?>">
  <meta property="og:url" content="<?= htmlspecialchars($canonicalUrl, ENT_QUOTES, 'UTF-8') ?>">
  <meta property="og:image" content="<?= htmlspecialchars($socialImage, ENT_QUOTES, 'UTF-8') ?>">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Manrope:wght@500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">
  <link rel="stylesheet" href="style.css?v=6">
  <?php if ($post): ?><script type="application/ld+json"><?= json_encode([
      '@context' => 'https://schema.org',
      '@type' => 'BlogPosting',
      'headline' => $post['title'],
      'description' => $post['excerpt'],
      'image' => [$socialImage],
      'datePublished' => (new DateTime($post['published_at']))->format(DATE_ATOM),
      'mainEntityOfPage' => $canonicalUrl,
      'publisher' => ['@type' => 'Organization', 'name' => "Laboratoire L'Odyssey", 'logo' => ['@type' => 'ImageObject', 'url' => app_url('images/logo.jpg')]],
  ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP) ?></script><?php endif; ?>
</head>
<body class="blog-public-page">
  <main class="article-page container">
    <a class="back-home" href="blog.php" aria-label="Retour au blog"><i class="fa-solid fa-arrow-left"></i></a>
    <?php if (!$post): ?>
      <section class="blog-empty"><i class="fa-regular fa-circle-question"></i><h1>Article introuvable</h1><p>Cet article n’est plus disponible ou n’a pas encore été publié.</p></section>
    <?php else: ?>
      <article class="article-content"><time datetime="<?= htmlspecialchars($post['published_at'], ENT_QUOTES, 'UTF-8') ?>"><?= (new DateTime($post['published_at']))->format('d/m/Y') ?></time><h1><?= htmlspecialchars($post['title'], ENT_QUOTES, 'UTF-8') ?></h1><p class="article-excerpt"><?= htmlspecialchars($post['excerpt'], ENT_QUOTES, 'UTF-8') ?></p><?php if ($image): ?><img class="article-cover" src="<?= htmlspecialchars($image, ENT_QUOTES, 'UTF-8') ?>" alt="" fetchpriority="high"><?php endif; ?><div class="article-body"><?= nl2br(htmlspecialchars($post['content'], ENT_QUOTES, 'UTF-8')) ?></div></article>
    <?php endif; ?>
  </main>
</body>
</html>
