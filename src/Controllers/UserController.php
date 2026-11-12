<?php

declare(strict_types=1);

namespace VotoEC\Controllers;

use VotoEC\Models\DAO\UserDAO;
use VotoEC\Models\Database;
use VotoEC\Models\DTO\UserDTO;

final class UserController
{
    /** @return list<UserDTO> */
    public function index(): array
    {
        $dao = new UserDAO((new Database())->connect());

        return $dao->findAll();
    }
}
