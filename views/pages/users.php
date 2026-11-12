<?php

declare(strict_types=1);

/** @var list<\VotoEC\Models\DTO\UserDTO> $users */

// TODO: cuando hagamos el login, esta página será solo para administradores.

$roleLabels = [
    'admin' => 'Administrador',
    'voter' => 'Votante',
];
$timezone = new DateTimeZone('America/Guayaquil');
?>
<h1>Usuarios</h1>

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
                </tr>
            <?php endforeach; ?>
            </tbody>
        </table>
    </div>
<?php endif; ?>
