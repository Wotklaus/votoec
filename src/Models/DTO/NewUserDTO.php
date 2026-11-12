<?php

declare(strict_types=1);

namespace VotoEC\Models\DTO;

final readonly class NewUserDTO
{
    public function __construct(
        public string $name,
        public string $email,
        public string $passwordHash,
    ) {
    }
}