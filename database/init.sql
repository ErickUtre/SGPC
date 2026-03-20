USE sgpc_db;

-- ==========================================================
-- 1. ESTRUCTURA DE USUARIOS
-- ==========================================================
CREATE TABLE IF NOT EXISTS Usuario (
    IdUsuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) UNIQUE NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    rol ENUM('Contralora', 'TI', 'Secretaria', 'Responsable') NOT NULL
);

CREATE TABLE IF NOT EXISTS UsuarioResponsable (
    IdUsuario INT PRIMARY KEY,
    puesto VARCHAR(100) NOT NULL,
    FOREIGN KEY (IdUsuario) REFERENCES Usuario(IdUsuario) ON DELETE CASCADE
);

-- ==========================================================
-- 2. REPOSITORIO CENTRAL DE ARCHIVOS
-- ==========================================================
CREATE TABLE IF NOT EXISTS Archivo (
    IdArchivo INT AUTO_INCREMENT PRIMARY KEY,
    nombreArchivo VARCHAR(255) NOT NULL,
    contenido LONGBLOB NOT NULL
);

-- ==========================================================
-- 3. SOLICITUDES Y TURNADOS
-- ==========================================================
CREATE TABLE IF NOT EXISTS Solicitud (
    IdSolicitud INT AUTO_INCREMENT PRIMARY KEY,
    nombreSolicitud VARCHAR(255) NOT NULL,
    resuelto BOOLEAN DEFAULT FALSE,
    IdUsuarioTI INT NOT NULL,
    IdArchivoPNT INT, -- Referencia al archivo inicial de la PNT
    fechaRegistro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (IdUsuarioTI) REFERENCES Usuario(IdUsuario),
    FOREIGN KEY (IdArchivoPNT) REFERENCES Archivo(IdArchivo)
);

-- Tabla para manejar los archivos que se "turnan" a los responsables.
-- Una solicitud puede tener varios responsables y cada uno recibe un oficio diferente.
CREATE TABLE IF NOT EXISTS TurnadoSolicitud (
    IdTurnado INT AUTO_INCREMENT PRIMARY KEY,
    IdSolicitud INT NOT NULL,
    IdUsuarioResponsable INT NOT NULL,
    IdArchivoOficio INT, 
    FOREIGN KEY (IdSolicitud) REFERENCES Solicitud(IdSolicitud),
    FOREIGN KEY (IdUsuarioResponsable) REFERENCES Usuario(IdUsuario),
    FOREIGN KEY (IdArchivoOficio) REFERENCES Archivo(IdArchivo)
);

-- ==========================================================
-- 4. RESPUESTAS Y EVIDENCIAS
-- ==========================================================
CREATE TABLE IF NOT EXISTS Respuesta (
    IdRespuesta INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255),
    completa BOOLEAN DEFAULT FALSE,
    IdSolicitud INT NOT NULL,
    IdUsuarioContralor INT,
    FOREIGN KEY (IdSolicitud) REFERENCES Solicitud(IdSolicitud),
    FOREIGN KEY (IdUsuarioContralor) REFERENCES Usuario(IdUsuario)
);

-- Tabla para que la Respuesta tenga referencia a los archivos de los responsables.
CREATE TABLE IF NOT EXISTS EvidenciaResponsable (
    IdEvidencia INT AUTO_INCREMENT PRIMARY KEY,
    IdRespuesta INT NOT NULL,
    IdUsuarioResponsable INT NOT NULL,
    IdArchivoRespuesta INT NOT NULL, 
    FOREIGN KEY (IdRespuesta) REFERENCES Respuesta(IdRespuesta),
    FOREIGN KEY (IdUsuarioResponsable) REFERENCES Usuario(IdUsuario),
    FOREIGN KEY (IdArchivoRespuesta) REFERENCES Archivo(IdArchivo)
);

-- ==========================================================
-- 5. NOTIFICACIONES
-- ==========================================================
CREATE TABLE IF NOT EXISTS Notificacion (
    IdNotificacion INT AUTO_INCREMENT PRIMARY KEY,
    nombreNotificacion VARCHAR(255) NOT NULL,
    descripcion TEXT,
    IdRemitente INT NOT NULL,
    IdDestinatario INT NOT NULL,
    fechaEnvio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (IdRemitente) REFERENCES Usuario(IdUsuario),
    FOREIGN KEY (IdDestinatario) REFERENCES Usuario(IdUsuario)
);

-- ==========================================================
-- 6. DATOS DE PRUEBA (SEED DATA)
-- ==========================================================

-- Usuarios de cada rol (Contraseña: password123 para todos)
INSERT INTO Usuario (nombre, correo, contrasena, rol) VALUES 
('Admin TI', 'ti@uv.mx', 'password123', 'TI'),
('Dra. Contralora', 'contralora@uv.mx', 'password123', 'Contralora'),
('Sra. Secretaria', 'secretaria@uv.mx', 'password123', 'Secretaria'),
('Lic. Responsable Area', 'responsable@uv.mx', 'password123', 'Responsable');

-- Datos específicos para el usuario Responsable (su ID es el 4)
INSERT INTO UsuarioResponsable (IdUsuario, puesto) VALUES 
(4, 'Director de Recursos Materiales');