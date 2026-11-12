<?php

declare(strict_types=1);

namespace VotoEC\Controllers;

use VotoEC\Models\DAO\DuplicateEmailException;
use VotoEC\Models\DAO\UserDAO;
use VotoEC\Models\Database;
use VotoEC\Models\DTO\UserDTO;

/**
 * Registro, ingreso, salida y sesión al día.
 */
final class AuthController
{
    /**
     * Hash de una contraseña aleatoria que nadie conoce. Se verifica contra él cuando
     * el email no existe, para que la respuesta tarde lo mismo que con un email real.
     */
    private const DUMMY_HASH = '$2y$12$sJXsaDJQvjTSxRG0nq/vUeS5ZeqwUNaTkHQCIAr8Po0o9I12oOVPm';

    public function register(): never
    {
        $name = trim((string) ($_POST['name'] ?? ''));
        $email = strtolower(trim((string) ($_POST['email'] ?? '')));
        $password = (string) ($_POST['password'] ?? '');

        $errors = [];

        if ($name === '' || mb_strlen($name) > 100) {
            $errors[] = 'El nombre es obligatorio y debe tener máximo 100 caracteres.';
        }
        if (filter_var($email, FILTER_VALIDATE_EMAIL) === false || strlen($email) > 255) {
            $errors[] = 'El email no es válido.';
        }
        if (strlen($password) < 8) {
            $errors[] = 'La contraseña debe tener al menos 8 caracteres.';
        }

        if ($errors === []) {
            try {
                $this->dao()->create(new UserDTO(
                    name: $name,
                    email: $email,
                    passwordHash: password_hash($password, PASSWORD_DEFAULT),
                ));

                $this->redirect('?page=register', success: 'Registro exitoso. Ya puedes ingresar.');
            } catch (DuplicateEmailException) {
                $errors[] = 'Este email ya está registrado.';
            }
        }

        $this->redirect('?page=register', errors: $errors);
    }

    public function login(): never
    {
        $email = strtolower(trim((string) ($_POST['email'] ?? '')));
        $password = (string) ($_POST['password'] ?? '');

        if ($email === '' || $password === '') {
            $this->redirect('?page=login', errors: ['Ingresa tu email y contraseña.']);
        }

        $user = $this->dao()->findForLogin($email);

        $passwordOk = password_verify($password, $user?->passwordHash ?? self::DUMMY_HASH);

        if ($user === null || !$passwordOk) {
            $this->redirect('?page=login', errors: ['Credenciales incorrectas']);
        }

        if (!$user->active) {
            $this->redirect('?page=login', errors: ['Tu cuenta está desactivada.']);
        }

        session_regenerate_id(true);

        $_SESSION['user'] = [
            'id'   => $user->id,
            'name' => $user->name,
            'role' => $user->role,
        ];

        $this->redirect('?page=home');
    }

    public function logout(): never
    {
        $_SESSION = [];

        if (ini_get('session.use_cookies')) {
            $params = session_get_cookie_params();

            setcookie(session_name(), '', [
                'expires'  => time() - 42000,
                'path'     => $params['path'],
                'domain'   => $params['domain'],
                'secure'   => $params['secure'],
                'httponly' => $params['httponly'],
                'samesite' => $params['samesite'],
            ]);
        }

        session_destroy();

        $this->redirect('?page=home');
    }

    /**
     * Mantiene $_SESSION['user'] al día con la base en cada petición.
     */
    public function refresh(): void
    {
        $sessionUser = $_SESSION['user'] ?? null;

        if ($sessionUser === null) {
            return;
        }

        $user = $this->dao()->findById((int) $sessionUser['id']);

        if ($user === null || !$user->active) {
            $_SESSION = [];
            session_regenerate_id(true);

            $this->redirect('?page=login', errors: ['Tu sesión se cerró porque tu cuenta ya no está activa.']);
        }

        // Si cambian los permisos, el ID de sesión también cambia (igual que al ingresar).
        if ($user->role !== $sessionUser['role']) {
            session_regenerate_id(true);
        }

        $_SESSION['user']['name'] = $user->name;
        $_SESSION['user']['role'] = $user->role;
    }

    private function dao(): UserDAO
    {
        return new UserDAO((new Database())->connect());
    }

    /** @param list<string> $errors */
    private function redirect(string $location, ?string $success = null, array $errors = []): never
    {
        if ($success !== null) {
            $_SESSION['success'] = $success;
        }
        if ($errors !== []) {
            $_SESSION['errors'] = $errors;
        }

        header("Location: {$location}");
        exit;
    }
}
