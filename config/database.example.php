<?php
declare(strict_types=1);

// Set these values in your hosting control panel as environment variables.
putenv('APP_ENV=production');
putenv('DB_HOST=your-mysql-host');
putenv('DB_NAME=your_database_name');
putenv('DB_USER=your_database_user');
putenv('DB_PASSWORD=your_database_password');

require_once __DIR__ . '/database.php';
