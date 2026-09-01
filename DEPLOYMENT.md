# Déploiement Hostinger — Laboratoire L'Odyssey

Le site nécessite un hébergement PHP/MySQL. Il ne peut pas fonctionner sur GitHub Pages, car l'administration, les formulaires, le blog et les résultats patients utilisent PHP et MariaDB/MySQL.

## 1. Préparer l'hébergement

Dans hPanel Hostinger :

1. Activez PHP 8.1 ou une version plus récente.
2. Vérifiez les extensions `pdo_mysql`, `fileinfo`, `mbstring` et `openssl`.
3. Activez le certificat SSL du domaine.
4. Créez une base MySQL et son utilisateur dans **Sites Web → Tableau de bord → Bases de données MySQL**.

Hostinger ajoute généralement un préfixe `u..._` au nom de la base et à l'utilisateur. Conservez exactement les valeurs affichées dans hPanel.

## 2. Importer la base de données

Ouvrez phpMyAdmin depuis hPanel, sélectionnez la base créée, puis utilisez **Importer**.

- Nouvelle installation : importez `database/borel_clinique.sql`.
- Migration des données XAMPP actuelles : importez `database/borel_clinique_recovered.sql`.

Le schéma public ne contient ni `CREATE DATABASE`, ni `USE`, ni `GRANT`, ce qui le rend compatible avec l'import Hostinger. Le fichier récupéré contient des données privées : ne le placez pas dans GitHub et supprimez-le de `public_html` immédiatement après l'import.

## 3. Configurer la production

Copiez `config/database.example.php` vers `config/production.php`, puis remplacez toutes les valeurs :

```php
<?php
declare(strict_types=1);

return [
    'app_env' => 'production',
    'app_url' => 'https://www.votre-domaine.com',
    'db_host' => 'localhost',
    'db_port' => 3306,
    'db_name' => 'u123456789_borel_clinique',
    'db_user' => 'u123456789_borel_user',
    'db_password' => 'VOTRE_MOT_DE_PASSE_FORT',
    'allow_setup' => false,
];
```

N'envoyez jamais `config/production.php` sur GitHub. Si Hostinger fournit un hôte MySQL différent de `localhost`, utilisez la valeur indiquée dans hPanel.

## 4. Envoyer les fichiers

Envoyez le contenu du projet dans `public_html` avec le gestionnaire de fichiers Hostinger, FTP ou SFTP. Le fichier `index.html` doit se trouver directement dans `public_html`.

N'envoyez pas :

- `.git` et les fichiers de développement ;
- les journaux `database/*.log` ;
- les sauvegardes SQL privées après leur import ;
- les anciens PDF de test dans `storage/results`.

Conservez les fichiers `.htaccess`, y compris ceux de `admin`, `config`, `database`, `images/blog` et `storage`. Ils protègent les fichiers sensibles et forcent HTTPS en production.

## 5. Dossiers accessibles en écriture

Le compte PHP doit pouvoir écrire dans :

- `storage/results` pour les PDF patients ;
- `images/blog` pour les images d'articles.

Utilisez normalement `755` pour les dossiers et `644` pour les fichiers. N'utilisez `775` que si Hostinger l'exige. N'utilisez jamais `777`.

## 6. Créer l'administrateur

Si vous avez importé la base XAMPP actuelle, le compte administrateur existe déjà.

Pour une base neuve :

1. Mettez temporairement `'allow_setup' => true` dans `config/production.php`.
2. Ouvrez `https://www.votre-domaine.com/setup.php`.
3. Créez un mot de passe d'au moins 12 caractères.
4. Remettez immédiatement `'allow_setup' => false`.

La page de configuration répond ensuite comme une page inexistante.

## 7. Vérifications après publication

Testez le site uniquement en HTTPS :

- accueil, menu mobile et bouton d'appel ;
- formulaire de rendez-vous et formulaire de contact ;
- connexion et déconnexion administrateur ;
- modification du nom et du mot de passe administrateur ;
- publication d'un article avec image ;
- ajout, activation, désactivation et suppression d'un résultat patient ;
- consultation d'un PDF avec un bon code et refus avec un mauvais code ;
- `robots.txt` et `sitemap.xml` ;
- refus d'accès direct à `/config`, `/database` et `/storage`.

Ajoutez ensuite `https://www.votre-domaine.com/sitemap.xml` dans Google Search Console.

## 8. Sauvegardes et confidentialité

- Programmez des sauvegardes de la base et de `storage/results`.
- Ne placez jamais de résultats patients, mots de passe ou exports SQL dans GitHub.
- Utilisez un utilisateur MySQL dédié, jamais `root`.
- Gardez `app_env` sur `production` pour masquer les erreurs techniques aux visiteurs.
- Supprimez régulièrement les résultats expirés ou inutiles depuis l'administration.
