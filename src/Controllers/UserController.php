<?php

declare(strict_types=1);

namespace VotoEC\Controllers;

use VotoEC\Models\DAO\DuplicateEmailException;
use VotoEC\Models\DAO\UserDAO;
use VotoEC\Models\Database;
use VotoEC\Models\DTO\UserDTO;

/**
 * Administración de usuarios. Todas las acciones son solo para administradores:
 * el TemplateController lo comprueba antes de llamar a esta clase.
 */
final class UserController
{
    private const ROLES = ['admin', 'voter'];

    /** @return list<UserDTO> */
    public function index(): array
    {
        return $this->dao()->findAll();
    }

    public function show(int $id): ?UserDTO
    {
        return $this->dao()->findById($id);
    }

    public function update(int $id, int $adminId): never
    {
        $name = trim((string) ($_POST['name'] ?? ''));
        $email = strtolower(trim((string) ($_POST['email'] ?? '')));
        $role = (string) ($_POST['role'] ?? '');

        $errors = [];

        if ($name === '' || mb_strlen($name) > 100) {
            $errors[] = 'El nombre es obligatorio y debe tener máximo 100 caracteres.';
        }
        if (filter_var($email, FILTER_VALIDATE_EMAIL) === false || strlen($email) > 255) {
            $errors[] = 'El email no es válido.';
        }
        if (!in_array($role, self::ROLES, true)) {
            $errors[] = 'El rol no es válido.';
        } elseif ($id === $adminId && $role !== 'admin') {
            $errors[] = 'No puedes quitarte el rol de administrador.';
        }

        if ($errors === []) {
            try {
                $updated = $this->dao()->update(new UserDTO(
                    id: $id,
                    name: $name,
                    email: $email,
                    role: $role,
                ));

                if (!$updated) {
                    $this->redirect('?page=users', errors: ['El usuario no existe.']);
                }

                $this->redirect('?page=users', success: 'Usuario actualizado.');
            } catch (DuplicateEmailException) {
                $errors[] = 'Este email ya está registrado.';
            }
        }

        $this->redirect("?page=user-edit&id={$id}", errors: $errors);
    }

    public function deactivate(int $id, int $adminId): never
    {
        if ($id === $adminId) {
            $this->redirect('?page=users', errors: ['No puedes desactivar tu propia cuenta.']);
        }

        if (!$this->dao()->deactivate($id)) {
            $this->redirect('?page=users', errors: ['El usuario no existe.']);
        }

        $this->redirect('?page=users', success: 'Usuario desactivado.');
    }

    public function activate(int $id): never
    {
        if (!$this->dao()->activate($id)) {
            $this->redirect('?page=users', errors: ['El usuario no existe.']);
        }

        $this->redirect('?page=users', success: 'Usuario activado.');
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
