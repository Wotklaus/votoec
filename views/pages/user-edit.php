<?php

declare(strict_types=1);

/** @var \VotoEC\Models\DTO\UserDTO $editUser */
/** @var array{id: int, name: string, role: string} $currentUser viene del layout */

$errors = $_SESSION['errors'] ?? [];
unset($_SESSION['errors']);

$isSelf = $editUser->id === (int) $currentUser['id'];

$roleLabels = [
    'admin' => 'Administrador',
    'voter' => 'Votante',
];
?>
<h1>Editar usuario</h1>

<?php foreach ($errors as $error): ?>
    <div class="alert alert-danger"><?= htmlspecialchars($error) ?></div>
<?php endforeach; ?>

<form method="post" action="?page=user-edit&amp;id=<?= htmlspecialchars((string) $editUser->id) ?>" class="col-md-6">
    <label for="name" class="form-label">Nombre</label>
    <div class="input-group mb-3">
        <span class="input-group-text"><i class="bi bi-person"></i></span>
        <input type="text" class="form-control" id="name" name="name"
               value="<?= htmlspecialchars($editUser->name) ?>" maxlength="100" required>
    </div>

    <label for="email" class="form-label">Email</label>
    <div class="input-group mb-3">
        <span class="input-group-text"><i class="bi bi-envelope"></i></span>
        <input type="email" class="form-control" id="email" name="email"
               value="<?= htmlspecialchars($editUser->email) ?>" maxlength="255" required>
    </div>

    <label for="role" class="form-label">Rol</label>
    <div class="input-group mb-1">
        <span class="input-group-text"><i class="bi bi-shield"></i></span>
        <select class="form-select" id="role" name="role" <?= $isSelf ? 'disabled' : '' ?>>
            <?php foreach ($roleLabels as $value => $label): ?>
                <option value="<?= htmlspecialchars($value) ?>" <?= $editUser->role === $value ? 'selected' : '' ?>>
                    <?= htmlspecialchars($label) ?>
                </option>
            <?php endforeach; ?>
        </select>
    </div>
    <?php if ($isSelf): ?>
        <!-- Un select deshabilitado no se envía: el rol va oculto. El servidor igual lo valida. -->
        <input type="hidden" name="role" value="admin">
        <div class="form-text mb-3">No puedes quitarte el rol de administrador.</div>
    <?php else: ?>
        <div class="mb-3"></div>
    <?php endif; ?>

    <button type="submit" class="btn btn-primary">Guardar</button>
    <a href="?page=users" class="btn btn-outline-secondary">Cancelar</a>
</form>
