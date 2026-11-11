<?php

declare(strict_types = 1);

namespace VotoEC\Models;

use PDO;

class Database
{
    public function connect(): PDO
    {
        $dsn = "pgsql:host={$_ENV['DB_HOST']};port={$_ENV['DB_PORT']};dbname={$_ENV['DB_NAME']}";

        return new PDO($dsn, $_ENV['DB_USER'], $_ENV['DB_PASSWORD'], [
           PDO::ATTR_ERRMODE                => PDO::ERRMODE_EXCEPTION,
           PDO::ATTR_DEFAULT_FETCH_MODE     => PDO::FETCH_ASSOC,
           PDO::ATTR_EMULATE_PREPARES       => false,
        ]);

    }

}