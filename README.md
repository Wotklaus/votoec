# VotoEC

Plataforma de gobernanza con blockchain: procesos de decisión como elecciones,
encuestas y presupuestos participativos.


## Requisitos

- PHP 8.4 con la extensión `pdo_pgsql`
- Composer
- Docker con Docker Compose

## Puesta en marcha

1. Crear el archivo de entorno y completar sus valores:

   ```bash
   cp .env.example .env
   ```

   PostgreSQL se publica solo en `127.0.0.1:5432`, así que desde PHP se usa
   `DB_HOST=127.0.0.1` y `DB_PORT=5432`.

2. Levantar PostgreSQL:

   ```bash
   docker compose up -d
   ```

3. Instalar las dependencias de PHP:

   ```bash
   composer install
   ```

4. Iniciar el servidor de desarrollo:

   ```bash
   php -S localhost:8000 -t public
   ```

   La aplicación queda en <http://localhost:8000>.

## Estructura

```
.
├── public/            Punto de entrada (index.php) y recursos estáticos
├── src/               Código PHP (namespace VotoEC\)
│   ├── Controllers/   Controladores
│   └── Models/        Modelos y acceso a datos (Database.php)
├── views/             Vistas: layout.php y pages/
├── tests/             Pruebas (namespace VotoEC\Tests\)
├── legacy/            v1 en Node.js, solo referencia
├── compose.yaml       Servicios de Docker (PostgreSQL 18)
└── composer.json      Dependencias y autoload PSR-4
```

## Flujo de ramas

```
feature/*  →  dev  →  qa  →  main
```

- Cada cambio se desarrolla en una rama `feature/*` y se integra en `dev` mediante un pull request.
- `dev` pasa a `qa` para las pruebas, y `qa` pasa a `main` para producción.
- En cada push y pull request a `dev`, `qa` y `main`, GitHub Actions ejecuta
  [gitleaks](https://github.com/gitleaks/gitleaks) sobre todo el historial para detectar secretos.

## Hoja de ruta

1. Base de datos y CRUD
2. Login y seguridad
3. Contrato inteligente v2 en Solidity
4. Kafka y MongoDB para auditoría
5. Migración a Laravel

## Convenciones

- Código en inglés; textos visibles en español.
- Los secretos solo van en `.env`, que nunca se sube al repositorio.