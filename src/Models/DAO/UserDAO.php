<?php

declare(strict_types=1);

namespace VotoEC\Models\DAO;

use DateTimeImmutable;
use InvalidArgumentException;
use PDO;
use PDOException;
use VotoEC\Models\DTO\UserDTO;

final class UserDAO
{
    public function __construct(
        private PDO $pdo,
    ) {
    }

    public function create(UserDTO $user): int
    {
        if ($user->passwordHash === null) {
            throw new InvalidArgumentException('Para crear un usuario se necesita el hash de la contraseña.');
        }

        $stmt = $this->pdo->prepare('SELECT id FROM create_user(:name, :email, :password)');

        try {
            $stmt->execute([
                'name'     => $user->name,
                'email'    => $user->email,
                'password' => $user->passwordHash,
            ]);
        } catch (PDOException $e) {
            if ($e->getCode() === '23505') {
                throw new DuplicateEmailException('El email ya está registrado.', previous: $e);
            }
            throw $e;
        }

        return (int) $stmt->fetchColumn();
    }

    /** @return list<UserDTO> */
    public function findAll(): array
    {
        $rows = $this->pdo->query('SELECT * FROM list_users()')->fetchAll();

        return array_map($this->toUserDTO(...), $rows);
    }

    public function findById(int $id): ?UserDTO
    {
        $stmt = $this->pdo->prepare('SELECT * FROM find_user_by_id(:id)');
        $stmt->execute(['id' => $id]);

        $row = $stmt->fetch();

        return $row === false ? null : $this->toUserDTO($row);
    }

    /**
     * @return bool false si el usuario no existe.
     * @throws DuplicateEmailException si el email ya pertenece a otro usuario.
     */
    public function update(UserDTO $user): bool
    {
        if ($user->id === null) {
            throw new InvalidArgumentException('Para actualizar un usuario se necesita su id.');
        }

        $stmt = $this->pdo->prepare('SELECT id FROM update_user(:id, :name, :email, :role)');

        try {
            $stmt->execute([
                'id'    => $user->id,
                'name'  => $user->name,
                'email' => $user->email,
                'role'  => $user->role,
            ]);
        } catch (PDOException $e) {
            if ($e->getCode() === '23505') {
                throw new DuplicateEmailException('El email ya está registrado.', previous: $e);
            }
            throw $e;
        }

        return $stmt->fetchColumn() !== false;
    }

    /** @return bool false si el usuario no existe. */
    public function deactivate(int $id): bool
    {
        return $this->changeStatus('SELECT id FROM deactivate_user(:id)', $id);
    }

    /** @return bool false si el usuario no existe. */
    public function activate(int $id): bool
    {
        return $this->changeStatus('SELECT id FROM activate_user(:id)', $id);
    }

    private function changeStatus(string $sql, int $id): bool
    {
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute(['id' => $id]);

        return $stmt->fetchColumn() !== false;
    }

    /** @param array<string, mixed> $row */
    private function toUserDTO(array $row): UserDTO
    {
        return new UserDTO(
            id: (int) $row['id'],
            name: $row['name'],
            email: $row['email'],
            role: $row['role'],
            active: (bool) $row['active'],
            createdAt: new DateTimeImmutable($row['created_at']),
        );
    }

    public function findForLogin(string $email): ?UserDTO
    {
        $stmt = $this->pdo->prepare('SELECT * FROM find_user_for_login(:email)');
        $stmt->execute(['email' => $email]);

        $row = $stmt->fetch();

        if ($row === false) {
            return null;
        }

        return new UserDTO(
            id: (int) $row['id'],
            name: $row['name'],
            email: $email,
            role: $row['role'],
            active: (bool) $row['active'],
            passwordHash: $row['password'],
        );
    }
}