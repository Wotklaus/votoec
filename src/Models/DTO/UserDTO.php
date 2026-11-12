<?php

declare(strict_types=1);

namespace VotoEC\Models\DTO;

use DateTimeImmutable;

final readonly class UserDTO
{
    public function __construct(
        public int $id,
        public string $name,
        public string $email,
        public string $role,
        public bool $active,
        public DateTimeImmutable $createdAt,
    ) {
    }
}