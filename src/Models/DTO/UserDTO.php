<?php

declare(strict_types=1);

namespace VotoEC\Models\DTO;

use DateTimeImmutable;

/**
 * Único DTO del usuario. Los campos opcionales quedan en null cuando no aplican:
 * - id y createdAt: null al crear (todavía no existen en la base).
 * - passwordHash: solo se llena al crear y en el login; en la lista y la edición va null.
 */
final readonly class UserDTO
{
    public function __construct(
        public string $name,
        public string $email,
        public string $role = 'voter',
        public bool $active = true,
        public ?int $id = null,
        public ?DateTimeImmutable $createdAt = null,
        public ?string $passwordHash = null,
    ) {
    }
}
