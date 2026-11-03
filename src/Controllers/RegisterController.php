<?php

declare(strict_types=1);

namespace VotoEC\Controllers;

class RegisterController
{
    public function handle(): void
    {
        $name = trim((string) ($_POST['name'] ?? ''));
        $email = trim((string) ($_POST['email'] ?? ''));
        $password = (string) ($_POST['password'] ?? '');

        $errors = [];

        if ($name === '') {
            $errors[] = 'El nombre es obligatorio.';
        }
        if (filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
            $errors[] = 'El email no es válido.';
        }
        if (strlen($password) < 8) {
            $errors[] = 'La contraseña debe tener al menos 8 caracteres.';
        }

        if ($errors !== []) {
            $_SESSION['errors'] = $errors;
        } else {
            $_SESSION['success'] = 'Registro válido. Pronto lo guardaremos en la base de datos.';
        }

        header('Location: ?page=register');
        exit;
    }
}