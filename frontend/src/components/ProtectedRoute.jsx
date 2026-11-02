import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles, children }) => {
    // Obtener el token y el rol del usuario desde localStorage
    const token = localStorage.getItem('token');
    const userRol = localStorage.getItem('rol_id');

    // 1. Verificar si el usuario está autenticado (tiene un token)
    if (!token) {
        // Si no hay token, redirige a la página de login
        return <Navigate to="/login" replace />;
    }

    // 2. Verificar la autorización por rol (si se especifican roles permitidos)
    if (allowedRoles && allowedRoles.length > 0) {
        // Convertir el rol del usuario a número para asegurar la comparación
        const userRolNumber = parseInt(userRol, 10);

        // Si el rol del usuario NO está incluido en los roles permitidos
        if (!allowedRoles.includes(userRolNumber)) {
            // Redirige a una página de acceso denegado o al perfil predeterminado
            // Opcional: podrías tener una página de error 403 o redirigir al home/login
            console.warn(`Acceso denegado. Rol ${userRol} no autorizado para esta ruta.`);
            // Redirige al usuario a una ruta segura, por ejemplo, el dashboard del cliente
            // O una página de "acceso no autorizado"
            return <Navigate to="/customer" replace />; // O a "/access-denied"
        }
    }

    // Si está autenticado y autorizado, renderiza el componente hijo (la ruta real)
    // `Outlet` se usa cuando este componente se anida en `Routes` y `children` cuando se pasa directamente
    return children ? children : <Outlet />;
};

export default ProtectedRoute;