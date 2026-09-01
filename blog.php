<?php
declare(strict_types=1);
require_once __DIR__ . '/config/database.php';

$connection = database();
ensure_blog_schema($connection);
$posts = $connection->query('SELECT title, slug, excerpt, cover_image, published_at FROM blog_posts WHERE is_published = 1 AND published_at IS NOT NULL AND published_at <= NOW() ORDER BY published_at DESC')->fetchAll(PDO::FETCH_ASSOC);
$blogUrl = app_url('blog.php');
$blogImage = app_url('images/hero-img.jpg');

function blog_date(string $date): string
{
    return (new DateTime($date))->format('d/m/Y');
}

function blog_image(?string $image): ?string
{
    $image = trim((string) $image);
    if ($image === '' || !preg_match('#^(https?://|images/)#i', $image)) {
        return null;
    }
    return $image;
}
?>
<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="Actualités, événements, partenariats et conseils du Laboratoire L'Odyssey.">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <meta name="theme-color" content="#19764b">
  <title>Blog | Laboratoire L'Odyssey</title>
  <link rel="canonical" href="<?= htmlspecialchars($blogUrl, ENT_QUOTES, 'UTF-8') ?>">
  <link rel="icon" href="images/logo.jpg" type="image/jpeg">
  <link rel="manifest" href="site.webmanifest">
  <meta property="og:locale" content="fr_FR">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Laboratoire L'Odyssey">
  <meta property="og:title" content="Blog | Laboratoire L'Odyssey">
  <meta property="og:description" content="Actualités, événements, partenariats et conseils du Laboratoire L'Odyssey.">
  <meta property="og:url" content="<?= htmlspecialchars($blogUrl, ENT_QUOTES, 'UTF-8') ?>">
  <meta property="og:image" content="<?= htmlspecialchars($blogImage, ENT_QUOTES, 'UTF-8') ?>">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Manrope:wght@500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">
  <link rel="stylesheet" href="style.css?v=6">
  <script type="application/ld+json"><?= json_encode([
      '@context' => 'https://schema.org',
      '@type' => 'Blog',
      'name' => "Blog du Laboratoire L'Odyssey",
      'url' => $blogUrl,
      'description' => "Actualités, événements, partenariats et conseils du Laboratoire L'Odyssey.",
      'publisher' => ['@type' => 'Organization', 'name' => "Laboratoire L'Odyssey", 'logo' => ['@type' => 'ImageObject', 'url' => app_url('images/logo.jpg')]],
  ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP) ?></script>
</head>
<body class="blog-public-page">
  <a class="back-home" href="index.html" aria-label="Retour à l’accueil"><i class="fa-solid fa-arrow-left"></i></a>

  <main>
    <section class="blog-hero"><span class="section-badge">Blog du laboratoire</span><h1>Nos nouvelles et événements</h1><p>Découvrez les articles, partenariats, campagnes et moments importants du Laboratoire L’Odyssey.</p></section>
    <section class="blog-list container">
      <?php if (!$posts): ?><div class="blog-empty"><i class="fa-regular fa-newspaper"></i><h2>Bientôt de nouveaux articles</h2><p>Les articles du laboratoire apparaîtront ici prochainement.</p></div><?php endif; ?>
      <?php foreach ($posts as $post): $image = blog_image($post['cover_image']); ?>
        <article class="public-blog-card">
          <?php if ($image): ?><img src="<?= htmlspecialchars($image, ENT_QUOTES, 'UTF-8') ?>" alt="" loading="lazy"><?php else: ?><div class="public-blog-card-placeholder"><i class="fa-solid fa-newspaper"></i></div><?php endif; ?>
          <div class="public-blog-card-content"><time datetime="<?= htmlspecialchars($post['published_at'], ENT_QUOTES, 'UTF-8') ?>"><?= blog_date($post['published_at']) ?></time><h2><?= htmlspecialchars($post['title'], ENT_QUOTES, 'UTF-8') ?></h2><p><?= htmlspecialchars($post['excerpt'], ENT_QUOTES, 'UTF-8') ?></p><a class="btn-secondary" href="article.php?slug=<?= urlencode($post['slug']) ?>">Lire l’article <i class="fa-solid fa-arrow-right"></i></a></div>
        </article>
      <?php endforeach; ?>
    </section>
  </main>

  <footer class="blog-public-footer"><p>© <?= date('Y') ?> Laboratoire L’Odyssey. Tous droits réservés.</p><a href="index.html">Retour au site principal</a></footer>
</body>
</html>
