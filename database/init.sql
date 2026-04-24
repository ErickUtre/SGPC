USE sgpc_db;
SET NAMES 'utf8mb4';

-- ==========================================================
-- 1. ESTRUCTURA DE USUARIOS
-- ==========================================================
CREATE TABLE IF NOT EXISTS Usuario (
    IdUsuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellidoPaterno VARCHAR(100),
    apellidoMaterno VARCHAR(100),
    abreviacionOcupacion VARCHAR(20),
    puesto VARCHAR(150),
    ocupacion VARCHAR(100),
    correo VARCHAR(100) UNIQUE NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    rol ENUM('Contralora', 'TI', 'Secretaria', 'Responsable', 'Supervisor') NOT NULL
);

CREATE TABLE IF NOT EXISTS UsuarioResponsable (
    IdUsuario INT PRIMARY KEY,
    FOREIGN KEY (IdUsuario) REFERENCES Usuario(IdUsuario) ON DELETE CASCADE
);

-- ==========================================================
-- 2. REPOSITORIO CENTRAL DE ARCHIVOS
-- ==========================================================
CREATE TABLE IF NOT EXISTS Archivo (
    IdArchivo INT AUTO_INCREMENT PRIMARY KEY,
    nombreArchivo VARCHAR(255) NOT NULL,
    r2Key VARCHAR(255) DEFAULT NULL,
    contenido LONGBLOB DEFAULT NULL
);

-- ==========================================================
-- 3. SOLICITUDES Y TURNADOS
-- ==========================================================
CREATE TABLE IF NOT EXISTS Solicitud (
    IdSolicitud INT AUTO_INCREMENT PRIMARY KEY,
    nombreSolicitud VARCHAR(255) NOT NULL,
    resuelto BOOLEAN DEFAULT FALSE,
    IdUsuarioTI INT NOT NULL,
    folio VARCHAR(15),
    diasMaximos INT DEFAULT 7,
    IdArchivoPNT INT, 
    IdCapturaEntrega INT, 
    diasProrroga INT DEFAULT 0, 
    cancelada BOOLEAN DEFAULT FALSE,
    fechaRegistro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fechaValidacion TIMESTAMP NULL,
    fechaAsignacionProrroga TIMESTAMP NULL,
    FOREIGN KEY (IdUsuarioTI) REFERENCES Usuario(IdUsuario),
    FOREIGN KEY (IdArchivoPNT) REFERENCES Archivo(IdArchivo),
    FOREIGN KEY (IdCapturaEntrega) REFERENCES Archivo(IdArchivo)
);

CREATE TABLE IF NOT EXISTS TurnadoSolicitud (
    IdTurnado INT AUTO_INCREMENT PRIMARY KEY,
    IdSolicitud INT NOT NULL,
    IdUsuarioResponsable INT NOT NULL,
    folioOficio VARCHAR(20),
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
-- 5. PRÓRROGAS
-- ==========================================================
CREATE TABLE IF NOT EXISTS ProrrogaSolicitud (
    IdProrroga INT AUTO_INCREMENT PRIMARY KEY,
    IdSolicitud INT NOT NULL,
    IdUsuarioResponsable INT NOT NULL,
    motivo VARCHAR(500),
    fechaSolicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (IdSolicitud) REFERENCES Solicitud(IdSolicitud),
    FOREIGN KEY (IdUsuarioResponsable) REFERENCES Usuario(IdUsuario)
);

-- ==========================================================
-- 6. NOTIFICACIONES
-- ==========================================================
CREATE TABLE IF NOT EXISTS Notificacion (
    IdNotificacion INT AUTO_INCREMENT PRIMARY KEY,
    nombreNotificacion VARCHAR(255) NOT NULL,
    descripcion TEXT,
    IdRemitente INT,
    IdDestinatario INT NOT NULL,
    leida BOOLEAN DEFAULT FALSE,
    fechaEnvio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (IdRemitente) REFERENCES Usuario(IdUsuario),
    FOREIGN KEY (IdDestinatario) REFERENCES Usuario(IdUsuario)
);

-- ==========================================================
-- 6. DATOS DE PRUEBA (SEED DATA)
-- ==========================================================

-- Usuarios de cada rol (Contraseña: password123 para todos, ya hasheada)
INSERT INTO Usuario (nombre, apellidoPaterno, apellidoMaterno, abreviacionOcupacion, puesto, ocupacion, correo, contrasena, rol) VALUES 
('Nuevo', 'TI', 'Test', 'Ing.', 'Soporte Técnico', 'Ingeniero', 'erickutrera47@gmail.com', '$2a$10$bgmQKSjZfVF.FNuCTCV2b.suU.A0IXWQ/0iWOlGbu1xu0KsYJ4TK2', 'TI'),
('Nueva', 'Contralora', 'Test', 'M.A.P.', 'Contraloría Adjunta', 'Contralora', 'erickutrera47@hotmail.com', '$2a$10$bgmQKSjZfVF.FNuCTCV2b.suU.A0IXWQ/0iWOlGbu1xu0KsYJ4TK2', 'Contralora'),
('Nuevo', 'Responsable', 'Test', 'Lic.', 'Coordinador de Área', 'Administrativo', 'zS21013841@estudiantes.uv.mx', '$2a$10$bgmQKSjZfVF.FNuCTCV2b.suU.A0IXWQ/0iWOlGbu1xu0KsYJ4TK2', 'Responsable'),
('Nueva', 'Secretaria', 'Test', 'Lic.', 'Secretaría Técnica', 'Secretaria', 'rickparker4747@gmail.com', '$2a$10$bgmQKSjZfVF.FNuCTCV2b.suU.A0IXWQ/0iWOlGbu1xu0KsYJ4TK2', 'Secretaria'),
('Nuevo', 'Supervisor', 'Test', 'M.A.', 'Supervisor de Auditoría', 'Auditor', 'trollolloxdlol@gmail.com', '$2a$10$bgmQKSjZfVF.FNuCTCV2b.suU.A0IXWQ/0iWOlGbu1xu0KsYJ4TK2', 'Supervisor');


-- Datos específicos para los usuarios Responsables
INSERT INTO UsuarioResponsable (IdUsuario)
SELECT IdUsuario FROM Usuario WHERE rol = 'Responsable';