<?php
$errors = $_SESSION['errors'] ?? [];
$success = $_SESSION['success'] ?? null;
unset($_SESSION['errors'], $_SESSION['success']);
?>
<h1>Registro</h1>

<?php if ($success): ?>
    <div class="alert alert-success"><?= $success ?></div>
<?php endif; ?>

<?php foreach ($errors as $error): ?>
    <div class="alert alert-danger"><?= $error ?></div>
<?php endforeach; ?>

<form method="post" action="?page=register" class="col-md-6">
    <label for="name" class="form-label">Nombre</label>
    <div class="input-group mb-3">
        <span class="input-group-text"><i class="bi bi-person"></i></span>
        <input type="text" class="form-control" id="name" name="name">
    </div>

    <label for="email" class="form-label">Email</label>
    <div class="input-group mb-3">
        <span class="input-group-text"><i class="bi bi-envelope"></i></span>
        <input type="email" class="form-control" id="email" name="email">
    </div>

    <label for="password" class="form-label">Contraseña</label>
    <div class="input-group mb-3">
        <span class="input-group-text"><i class="bi bi-lock"></i></span>
        <input type="password" class="form-control" id="password" name="password">
    </div>

    <button type="submit" class="btn btn-primary">Registrarme</button>
</form>