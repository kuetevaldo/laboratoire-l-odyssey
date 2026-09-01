<?php
declare(strict_types=1);
require_once __DIR__ . '/../config/database.php';
start_secure_session();

if (empty($_SESSION['admin_id'])) {
    header('Location: login.php');
    exit;
}

$connection = database();
ensure_blog_schema($connection);
$error = '';
$form = ['id' => 0, 'title' => '', 'excerpt' => '', 'content' => '', 'cover_image' => '', 'is_published' => 0];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();
    $action = $_POST['action'] ?? '';

    if ($action === 'save') {
        $form['id'] = (int) ($_POST['post_id'] ?? 0);
        $form['title'] = trim((string) ($_POST['title'] ?? ''));
        $form['excerpt'] = trim((string) ($_POST['excerpt'] ?? ''));
        $form['content'] = trim((string) ($_POST['content'] ?? ''));
        $form['cover_image'] = trim((string) ($_POST['cover_image'] ?? ''));
        $form['is_published'] = isset($_POST['is_published']) ? 1 : 0;
        $coverUpload = $_FILES['cover_file'] ?? null;

        if ($form['title'] === '' || strlen($form['title']) > 180 || $form['excerpt'] === '' || strlen($form['excerpt']) > 300 || $form['content'] === '' || strlen($form['cover_image']) > 255) {
            $error = 'Complétez les champs obligatoires et respectez les longueurs indiquées.';
        } else {
            $oldCoverImage = '';
            if ($form['id']) {
                $oldCoverStatement = $connection->prepare('SELECT cover_image FROM blog_posts WHERE id = ? LIMIT 1');
                $oldCoverStatement->execute([$form['id']]);
                $oldCoverImage = (string) ($oldCoverStatement->fetchColumn() ?: '');
            }

            if ($coverUpload && $coverUpload['error'] !== UPLOAD_ERR_NO_FILE) {
                $allowedImageTypes = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp', 'image/gif' => 'gif'];
                $mimeType = $coverUpload['error'] === UPLOAD_ERR_OK ? (new finfo(FILEINFO_MIME_TYPE))->file($coverUpload['tmp_name']) : '';
                if ($coverUpload['error'] !== UPLOAD_ERR_OK || $coverUpload['size'] > 5 * 1024 * 1024 || !isset($allowedImageTypes[$mimeType])) {
                    $error = 'Choisissez une image JPG, PNG, WEBP ou GIF de 5 Mo maximum.';
                } else {
                    $imageDirectory = __DIR__ . '/../images/blog';
                    if (!is_dir($imageDirectory) && !mkdir($imageDirectory, 0755, true) && !is_dir($imageDirectory)) {
                        $error = 'Le dossier des images ne peut pas être créé.';
                    } else {
                        $imageName = bin2hex(random_bytes(20)) . '.' . $allowedImageTypes[$mimeType];
                        if (!move_uploaded_file($coverUpload['tmp_name'], $imageDirectory . '/' . $imageName)) {
                            $error = 'L’image n’a pas pu être enregistrée.';
                        } else {
                            $form['cover_image'] = 'images/blog/' . $imageName;
                        }
                    }
                }
            }

            if ($error === '') {
            $publishedAt = null;
            if ($form['is_published']) {
                $publishedAt = (string) $connection->query('SELECT NOW()')->fetchColumn();
                if ($form['id']) {
                    $publishedStatement = $connection->prepare('SELECT published_at FROM blog_posts WHERE id = ? LIMIT 1');
                    $publishedStatement->execute([$form['id']]);
                    $existingPublishedAt = $publishedStatement->fetchColumn();
                    if ($existingPublishedAt) {
                        $publishedAt = $existingPublishedAt;
                    }
                }
            }
            $slug = create_blog_slug($connection, $form['title'], $form['id'] ?: null);

            if ($form['id']) {
                $statement = $connection->prepare('UPDATE blog_posts SET title = ?, slug = ?, excerpt = ?, content = ?, cover_image = ?, is_published = ?, published_at = ? WHERE id = ?');
                $statement->execute([$form['title'], $slug, $form['excerpt'], $form['content'], $form['cover_image'] ?: null, $form['is_published'], $publishedAt, $form['id']]);
                if ($oldCoverImage !== $form['cover_image'] && strpos($oldCoverImage, 'images/blog/') === 0) {
                    $oldImagePath = __DIR__ . '/../' . $oldCoverImage;
                    if (is_file($oldImagePath)) {
                        unlink($oldImagePath);
                    }
                }
            } else {
                $statement = $connection->prepare('INSERT INTO blog_posts (title, slug, excerpt, content, cover_image, is_published, published_at) VALUES (?, ?, ?, ?, ?, ?, ?)');
                $statement->execute([$form['title'], $slug, $form['excerpt'], $form['content'], $form['cover_image'] ?: null, $form['is_published'], $publishedAt]);
            }
            header('Location: blog.php?saved=1');
            exit;
            }
        }
    }

    if ($action === 'delete') {
        $postId = filter_input(INPUT_POST, 'post_id', FILTER_VALIDATE_INT);
        if ($postId) {
            $coverStatement = $connection->prepare('SELECT cover_image FROM blog_posts WHERE id = ? LIMIT 1');
            $coverStatement->execute([$postId]);
            $coverImage = (string) ($coverStatement->fetchColumn() ?: '');
            $statement = $connection->prepare('DELETE FROM blog_posts WHERE id = ?');
            $statement->execute([$postId]);
            if (strpos($coverImage, 'images/blog/') === 0) {
                $coverPath = __DIR__ . '/../' . $coverImage;
                if (is_file($coverPath)) {
                    unlink($coverPath);
                }
            }
        }
        header('Location: blog.php?deleted=1');
        exit;
    }
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST' && isset($_GET['edit'])) {
    $postId = filter_input(INPUT_GET, 'edit', FILTER_VALIDATE_INT);
    if ($postId) {
        $statement = $connection->prepare('SELECT id, title, excerpt, content, cover_image, is_published FROM blog_posts WHERE id = ? LIMIT 1');
        $statement->execute([$postId]);
        $post = $statement->fetch(PDO::FETCH_ASSOC);
        if ($post) {
            $form = $post;
        }
    }
}

$posts = $connection->query('SELECT id, title, excerpt, slug, is_published, published_at, created_at FROM blog_posts ORDER BY created_at DESC')->fetchAll(PDO::FETCH_ASSOC);
?>
<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Blog | Administration</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">
  <link rel="stylesheet" href="./admin.css?v=20260726">
</head>
<body>
  <main class="dashboard blog-dashboard">
    <header>
      <div>
        <h1>Blog du laboratoire</h1>
        <p>Partagez les articles, partenariats et événements de L’Odyssey.</p>
      </div>
      <a class="button secondary" href="index.php">Retour au tableau de bord</a>
    </header>

    <?php if ($error): ?><p class="alert error"><?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?></p><?php endif; ?>
    <?php if (isset($_GET['saved'])): ?><p class="alert success">Article enregistré avec succès.</p><?php endif; ?>
    <?php if (isset($_GET['deleted'])): ?><p class="alert success">Article supprimé.</p><?php endif; ?>

    <section class="admin-section">
      <h2><?= $form['id'] ? 'Modifier l’article' : 'Nouvel article' ?></h2>
      <form method="post" enctype="multipart/form-data" class="blog-form">
        <input type="hidden" name="csrf_token" value="<?= htmlspecialchars(csrf_token(), ENT_QUOTES, 'UTF-8') ?>">
        <input type="hidden" name="action" value="save">
        <input type="hidden" name="post_id" value="<?= (int) $form['id'] ?>">
        <label>Titre de l’article<input name="title" maxlength="180" required value="<?= htmlspecialchars((string) $form['title'], ENT_QUOTES, 'UTF-8') ?>"></label>
        <label>Résumé court<textarea name="excerpt" rows="2" maxlength="300" required><?= htmlspecialchars((string) $form['excerpt'], ENT_QUOTES, 'UTF-8') ?></textarea></label>
        <label>Contenu de l’article<textarea name="content" rows="10" required><?= htmlspecialchars((string) $form['content'], ENT_QUOTES, 'UTF-8') ?></textarea></label>
        <label>Importer une image <small>(JPG, PNG, WEBP ou GIF, 5 Mo maximum)</small><input type="file" name="cover_file" accept="image/jpeg,image/png,image/webp,image/gif"></label>
        <label>Image de couverture <small>(URL ou chemin, facultatif)</small><input name="cover_image" maxlength="255" value="<?= htmlspecialchars((string) $form['cover_image'], ENT_QUOTES, 'UTF-8') ?>" placeholder="images/mon-evenement.jpg"></label>
        <label class="blog-checkbox"><input type="checkbox" name="is_published" value="1" <?= $form['is_published'] ? 'checked' : '' ?>> Publier immédiatement</label>
        <div class="blog-form-actions"><button type="submit"><?= $form['id'] ? 'Enregistrer les modifications' : 'Créer l’article' ?></button><?php if ($form['id']): ?><a class="button secondary" href="blog.php">Annuler</a><?php endif; ?></div>
      </form>
    </section>

    <section class="admin-section">
      <div class="blog-section-heading"><h2>Articles <span class="count"><?= count($posts) ?></span></h2><a class="button secondary" href="../blog.php" target="_blank" rel="noopener">Voir le blog</a></div>
      <?php if (!$posts): ?><p class="empty">Aucun article pour le moment.</p><?php endif; ?>
      <?php foreach ($posts as $post): ?>
        <article class="blog-record">
          <div><h3><?= htmlspecialchars($post['title'], ENT_QUOTES, 'UTF-8') ?> <span class="status <?= $post['is_published'] ? 'confirmed' : 'pending' ?>"><?= $post['is_published'] ? 'Publié' : 'Brouillon' ?></span></h3><p><?= htmlspecialchars($post['excerpt'], ENT_QUOTES, 'UTF-8') ?></p><time><?= htmlspecialchars($post['published_at'] ?: $post['created_at'], ENT_QUOTES, 'UTF-8') ?></time></div>
          <div class="blog-record-actions"><a class="button secondary" href="blog.php?edit=<?= (int) $post['id'] ?>">Modifier</a><form method="post" onsubmit="return confirm('Supprimer cet article ?')"><input type="hidden" name="csrf_token" value="<?= htmlspecialchars(csrf_token(), ENT_QUOTES, 'UTF-8') ?>"><input type="hidden" name="action" value="delete"><input type="hidden" name="post_id" value="<?= (int) $post['id'] ?>"><button class="danger-button" type="submit">Supprimer</button></form></div>
        </article>
      <?php endforeach; ?>
    </section>
  </main>
</body>
</html>
