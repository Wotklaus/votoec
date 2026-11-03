<?php

declare(strict_types=1);

require __DIR__ . '/../vendor/autoload.php';

session_start();

use VotoEC\Controllers\TemplateController;

(new TemplateController())->render();

?>

