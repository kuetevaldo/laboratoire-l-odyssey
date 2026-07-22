# Borel Clinique production deployment

This application requires Apache, PHP 8.1 or newer, MySQL/MariaDB, PHP sessions, and HTTPS. GitHub Pages and other static hosting services cannot execute this project’s PHP files.

## 1. Upload the files

Purchase a PHP/MySQL shared-hosting plan with cPanel. Upload the project contents into `public_html` using cPanel File Manager or FTP. Keep the folders `admin`, `config`, `database`, `images`, `storage`, and `video` in the same structure as this repository.

Do not upload the local PDF files inside `storage/results`. The repository ignores them. Create `storage/results` on the host and keep its `.htaccess` and `.gitkeep` files.

## 2. Create the database

In cPanel, open **MySQL Databases**:

1. Create a database, for example `account_borel_clinique`.
2. Create a dedicated database user with a long unique password.
3. Add the user to the database with **All Privileges**.
4. Open phpMyAdmin, select the new database, choose **Import**, and upload `database/borel_clinique.sql`.

Shared hosts often prefix database names and users with the cPanel account name. Use the exact prefixed values in the next step.

## 3. Configure credentials

Set these environment variables in the hosting control panel if it supports them:

```text
APP_ENV=production
DB_HOST=your-host-database-host
DB_NAME=your-prefixed-database-name
DB_USER=your-prefixed-database-user
DB_PASSWORD=your-database-password
```

The application uses safe local XAMPP fallback values only when variables are absent. Never commit real hosting credentials. Keep `config/database.php` out of public source control when your hosting provider requires a manually configured file; use `config/database.example.php` as the template.

## 4. Create the first administrator

Open `https://your-domain.example/setup.php`, create an administrator with a password of at least 12 characters, and then open `https://your-domain.example/admin/login.php`.

After the first administrator is created, remove or protect `setup.php` from public access using cPanel File Manager. Do not leave the setup page available on a public production site.

## 5. Set permissions

Use normal hosting permissions, commonly `755` for folders and `644` for PHP/CSS/HTML files. The PHP process must be able to write to `storage/results` (commonly `755`, or the hosting provider’s documented writable permission). Do not make the whole project world-writable.

The `storage/results/.htaccess` file blocks directory browsing and direct access. Patient documents must be accessed through `result_file.php` after patient verification.

## 6. Test the application

Test each flow over HTTPS:

- Open the homepage and submit an appointment request.
- Confirm the appointment appears in `admin/index.php`.
- Submit the contact form and confirm the message appears in the dashboard.
- Log in and log out of the administration area.
- Upload a PDF from `admin/results.php` with a patient number and code.
- Use `result.html` with the patient number and code to view and download it.
- Confirm a wrong code is rejected and an expired/deactivated result cannot be accessed.
- Confirm a file placed directly in `storage/results` cannot be browsed or downloaded by URL.

## 7. Domain and HTTPS

Point the domain’s DNS records to the hosting account as instructed by the host. Enable the host’s free SSL certificate (usually AutoSSL/Let’s Encrypt), force HTTPS, and verify that the browser shows a valid certificate before uploading real patient documents.

## Production security checklist

- Use a dedicated database user, never the MySQL `root` user.
- Keep `APP_ENV=production` enabled so detailed PHP errors are not displayed.
- Use HTTPS for every patient and administrator request.
- Set regular database and `storage/results` backups through the hosting provider.
- Do not commit `.env`, database credentials, patient data, or laboratory PDFs.
- Add rate limiting or hosting WAF protection to login and patient-result endpoints.
- Configure email/WhatsApp notifications through a production provider instead of relying on local mail settings.
