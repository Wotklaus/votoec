<?php

declare(strict_types=1);

namespace VotoEC\Controllers;

class TemplateController
{
    public function render(): void
    {
        $pages = ['home', 'votes', 'results', 'login', 'register'];
        $page = $_GET['page'] ?? 'home';

        if (!in_array($page, $pages, true)) {
            http_response_code(404);
            $page = '404';
        }

        include __DIR__ . '/../../views/layout.php';
    }
}