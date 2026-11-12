<?php

declare(strict_types=1);

$errors = $_SESSION['errors'] ?? [];
unset($_SESSION['errors']);
?>
<h1>Ingresar</h1>

<?php foreach ($errors as $error): ?>
    <div class="alert alert-danger"><?= htmlspecialchars($error) ?></div>
<?php endforeach; ?>

<form method="post" action="?page=login" class="col-md-6">
    <label for="email" class="form-label">Email</label>
    <div class="input-group mb-3">
        <span class="input-group-text"><i class="bi bi-envelope"></i></span>
        <input type="email" class="form-control" id="email" name="email" autocomplete="email" required>
    </div>

    <label for="password" class="form-label">Contraseña</label>
    <div class="input-group mb-3">
        <span class="input-group-text"><i class="bi bi-lock"></i></span>
        <input type="password" class="form-control" id="password" name="password" autocomplete="current-password" required>
    </div>

    <button type="submit" class="btn btn-primary">Ingresar</button>
</form>

<p class="mt-3">¿No tienes cuenta? <a href="?page=register">Regístrate aquí</a></p>
