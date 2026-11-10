<?php

declare(strict_types=1);

require __DIR__ . '/../vendor/autoload.php';

use Dotenv\Dotenv;
use VotoEC\Controllers\TemplateController;

Dotenv::createImmutable(__DIR__ . '/..')->load();

session_start();

(new TemplateController())->render();