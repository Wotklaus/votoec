<?php

declare(strict_types=1);

/** @var list<\VotoEC\Models\DTO\UserDTO> $users */
/** @var array{id: int, name: string, role: string} $currentUser viene del layout */

$errors = $_SESSION['errors'] ?? [];
$success = $_SESSION['success'] ?? null;
unset($_SESSION['errors'], $_SESSION['success']);

$currentUserId = (int) $currentUser['id'];

$roleLabels = [
    'admin' => 'Administrador',
    'voter' => 'Votante',
];
$timezone = new DateTimeZone('America/Guayaquil');
?>
<h1>Usuarios</h1>

<?php if ($success !== null): ?>
    <div class="alert alert-success"><?= htmlspecialchars($success) ?></div>
<?php endif; ?>

<?php foreach ($errors as $error): ?>
    <div class="alert alert-danger"><?= htmlspecialchars($error) ?></div>
<?php endforeach; ?>

<?php if ($users === []): ?>
    <div class="alert alert-info">No hay usuarios registrados.</div>
<?php else: ?>
    <div class="table-responsive">
        <table class="table table-striped table-hover align-middle">
            <thead class="table-dark">
            <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Fecha de registro</th>
                <th>Acciones</th>
            </tr>
            </thead>
            <tbody>
            <?php foreach ($users as $user): ?>
                <tr>
                    <td><?= htmlspecialchars((string) $user->id) ?></td>
                    <td><?= htmlspecialchars($user->name) ?></td>
                    <td><?= htmlspecialchars($user->email) ?></td>
                    <td><?= htmlspecialchars($roleLabels[$user->role] ?? $user->role) ?></td>
                    <td>
                        <?php if ($user->active): ?>
                            <span class="badge text-bg-success">Activo</span>
                        <?php else: ?>
                            <span class="badge text-bg-secondary">Inactivo</span>
                        <?php endif; ?>
                    </td>
                    <td><?= htmlspecialchars($user->createdAt->setTimezone($timezone)->format('d/m/Y H:i')) ?></td>
                    <td>
                        <div class="d-flex gap-2">
                            <a href="?page=user-edit&amp;id=<?= htmlspecialchars((string) $user->id) ?>"
                               class="btn btn-outline-primary btn-sm">
                                <i class="bi bi-pencil"></i> Editar
                            </a>

                            <?php if ($user->id === $currentUserId): ?>
                                <span class="badge text-bg-info align-self-center">Tú</span>
                            <?php elseif ($user->active): ?>
                                <form method="post" action="?page=user-deactivate">
                                    <input type="hidden" name="id" value="<?= htmlspecialchars((string) $user->id) ?>">
                                    <button type="submit" class="btn btn-outline-danger btn-sm">
                                        <i class="bi bi-person-x"></i> Desactivar
                                    </button>
                                </form>
                            <?php else: ?>
                                <form method="post" action="?page=user-activate">
                                    <input type="hidden" name="id" value="<?= htmlspecialchars((string) $user->id) ?>">
                                    <button type="submit" class="btn btn-outline-success btn-sm">
                                        <i class="bi bi-person-check"></i> Activar
                                    </button>
                                </form>
                            <?php endif; ?>
                        </div>
                    </td>
                </tr>
            <?php endforeach; ?>
            </tbody>
        </table>
    </div>
<?php endif; ?>
