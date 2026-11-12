<?php

declare(strict_types=1);

namespace VotoEC\Controllers;

class TemplateController
{
    public function render(): void
    {
        // Primero que todo: la sesión al día con la base (antes de atender cualquier POST).
        $auth = new AuthController();
        $auth->refresh();

        $pages = ['home', 'votes', 'results', 'users', 'user-edit', 'login', 'register'];
        // Acciones sin vista: solo existen por POST. Un GET cae en el 404.
        $actions = ['logout', 'user-deactivate', 'user-activate'];

        $page = $_GET['page'] ?? 'home';
        $isPost = $_SERVER['REQUEST_METHOD'] === 'POST';

        if ($isPost && in_array($page, $actions, true)) {
            $page = $this->handleAction($page);
        } elseif (!in_array($page, $pages, true)) {
            $page = $this->notFound();
        }

        if ($page === 'register' && $isPost) {
            $auth->register();
        }
        if ($page === 'login' && $isPost) {
            $auth->login();
        }

        // Solo administradores. Se revisa antes de consultar la base.
        if ($page === 'users') {
            if ($this->requireAdmin()) {
                $users = (new UserController())->index();
            } else {
                $page = $this->forbidden();
            }
        }

        if ($page === 'user-edit') {
            if (!$this->requireAdmin()) {
                $page = $this->forbidden();
            } else {
                $userController = new UserController();
                $id = $this->parseId($_GET['id'] ?? null);
                $editUser = $id === null ? null : $userController->show($id);

                if ($editUser === null) {
                    $page = $this->notFound();
                } elseif ($isPost) {
                    $userController->update($editUser->id, $this->currentUserId());
                }
            }
        }

        include __DIR__ . '/../../views/layout.php';
    }

    /**
     * Ejecuta una acción POST. Si termina bien, redirige (no regresa);
     * si no, devuelve la página de error que se debe mostrar.
     */
    private function handleAction(string $action): string
    {
        if ($action === 'logout') {
            (new AuthController())->logout();
        }

        if (!$this->requireAdmin()) {
            return $this->forbidden();
        }

        $id = $this->parseId($_POST['id'] ?? null);

        if ($id === null) {
            return $this->notFound();
        }

        $userController = new UserController();

        if ($action === 'user-deactivate') {
            $userController->deactivate($id, $this->currentUserId());
        }

        $userController->activate($id);
    }

    /**
     * Sin sesión: redirige al login. Con sesión: true si es administrador.
     */
    private function requireAdmin(): bool
    {
        $sessionUser = $_SESSION['user'] ?? null;

        if ($sessionUser === null) {
            $_SESSION['errors'] = ['Debes ingresar para ver esta página.'];
            header('Location: ?page=login');
            exit;
        }

        return $sessionUser['role'] === 'admin';
    }

    private function currentUserId(): int
    {
        return (int) $_SESSION['user']['id'];
    }

    /** Devuelve el id si es un entero positivo; si no, null. */
    private function parseId(mixed $value): ?int
    {
        $id = filter_var($value, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);

        return $id === false ? null : $id;
    }

    private function notFound(): string
    {
        http_response_code(404);

        return '404';
    }

    private function forbidden(): string
    {
        http_response_code(403);

        return '403';
    }
}
