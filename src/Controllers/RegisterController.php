<?php

declare(strict_types=1);

namespace VotoEC\Controllers;

use VotoEC\Models\DAO\DuplicateEmailException;
use VotoEC\Models\DAO\UserDAO;
use VotoEC\Models\Database;
use VotoEC\Models\DTO\NewUserDTO;

class RegisterController
{
    public function handle(): void
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
                $dao = new UserDAO((new Database())->connect());

                $dao->create(new NewUserDTO(
                    name: $name,
                    email: $email,
                    passwordHash: password_hash($password, PASSWORD_DEFAULT),
                ));

                $_SESSION['success'] = 'Registro exitoso. Ya puedes ingresar.';
            } catch (DuplicateEmailException) {
                $errors[] = 'Este email ya está registrado.';
            }
        }

        if ($errors !== []) {
            $_SESSION['errors'] = $errors;
        }

        header('Location: ?page=register');
        exit;
    }
}