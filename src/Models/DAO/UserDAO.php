<?php

declare(strict_types=1);

namespace VotoEC\Models\DAO;

use DateTimeImmutable;
use PDO;
use PDOException;
use VotoEC\Models\DTO\NewUserDTO;
use VotoEC\Models\DTO\UserDTO;

final class UserDAO
{
    public function __construct(
        private PDO $pdo,
    ) {
    }

    public function create(NewUserDTO $user): int
    {
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

        return array_map(
            fn (array $row): UserDTO => new UserDTO(
                id: (int) $row['id'],
                name: $row['name'],
                email: $row['email'],
                role: $row['role'],
                active: (bool) $row['active'],
                createdAt: new DateTimeImmutable($row['created_at']),
            ),
            $rows,
        );
    }
}