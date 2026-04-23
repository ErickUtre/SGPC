# Pruebas Automatizadas de Solicitudes de Transparencia

Este directorio contiene pruebas de integración para los endpoints de la API del módulo de Solicitudes de Transparencia.

## Requisitos
1. Tener la API ejecutándose en `http://localhost:3001`.
2. Tener Node.js instalado.

## Instalación
Desde esta carpeta (`Tests/SolicitudesTransparenciaTests`), ejecuta:
```bash
npm install
```

## Ejecución
Para correr las pruebas:
```bash
npm test
```

## Cobertura de Pruebas
Las pruebas cubren el flujo completo de una solicitud:
- Autenticación por roles (TI, Contralora, Responsable).
- Creación de solicitud por parte de TI.
- Edición de metadatos (nombre).
- Turnado de solicitud a responsables por parte de la Contralora.
- Carga de evidencias por parte del Responsable.
- Eliminación de la solicitud para limpieza.

## Independencia de Datos
Las pruebas son totalmente independientes de los usuarios existentes en el sistema:
1.  **Creación Dinámica**: Al iniciar (`beforeAll`), el test inserta usuarios temporales con roles de TI, Contralora y Responsable directamente en la base de datos con emails únicos.
2.  **Autenticación Real**: Utiliza el endpoint de `/login` con estos nuevos usuarios para obtener tokens válidos.
3.  **Limpieza Automática**: Al finalizar (`afterAll`), se eliminan los usuarios creados y sus datos asociados, dejando la base de datos en su estado original.

---
**Nota:** Asegúrate de que las credenciales de la base de datos en `backend/.env` sean correctas, ya que el test se conecta directamente a MySQL para la gestión de usuarios temporales.
