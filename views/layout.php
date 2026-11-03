<?php
$menu = [
    'home'    => 'Inicio',
    'votes'   => 'Votaciones',
    'results' => 'Resultados',
    'login'   => 'Ingresar',
];
?>
<!doctype html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>VotoEC</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.13.1/font/bootstrap-icons.min.css">
</head>
<body class="d-flex flex-column min-vh-100">

<nav class="navbar navbar-expand-lg bg-dark navbar-dark">
    <div class="container">
        <a class="navbar-brand" href="?page=home"><i class="bi bi-box-seam"></i> VotoEC</a>
        <ul class="navbar-nav ms-auto">
            <?php foreach ($menu as $key => $label): ?>
                <li class="nav-item">
                    <a class="nav-link <?= $page === $key ? 'active' : '' ?>" href="?page=<?= $key ?>"><?= $label ?></a>
                </li>
            <?php endforeach; ?>
        </ul>
    </div>
</nav>

<main class="container py-5 flex-grow-1">
    <?php include __DIR__ . "/pages/{$page}.php"; ?>
</main>

<footer class="bg-dark text-white-50 text-center py-3">
    VotoEC · Decisiones transparentes
</footer>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>