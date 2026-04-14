USE sgpc_db;

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
    rol ENUM('Contralora', 'TI', 'Secretaria', 'Responsable') NOT NULL
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
    folio VARCHAR(15),
    diasMaximos INT DEFAULT 7,
    IdArchivoPNT INT, 
    IdCapturaEntrega INT, 
    diasProrroga INT DEFAULT 0, 
    cancelada BOOLEAN DEFAULT FALSE,
    fechaRegistro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (IdUsuarioTI) REFERENCES Usuario(IdUsuario),
    FOREIGN KEY (IdArchivoPNT) REFERENCES Archivo(IdArchivo),
    FOREIGN KEY (IdCapturaEntrega) REFERENCES Archivo(IdArchivo)
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
-- 5. PRÓRROGAS
-- ==========================================================
-- Las solicitudes de prórroga que piden los Responsables a la Contralora
CREATE TABLE IF NOT EXISTS ProrrogaSolicitud (
    IdProrroga INT AUTO_INCREMENT PRIMARY KEY,
    IdSolicitud INT NOT NULL,
    IdUsuarioResponsable INT NOT NULL,
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
    IdRemitente INT NOT NULL,
    IdDestinatario INT NOT NULL,
    fechaEnvio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (IdRemitente) REFERENCES Usuario(IdUsuario),
    FOREIGN KEY (IdDestinatario) REFERENCES Usuario(IdUsuario)
);

-- ==========================================================
-- 6. DATOS DE PRUEBA (SEED DATA)
-- ==========================================================

-- Usuarios de cada rol (Contraseña: password123 para todos, ya hasheada)
INSERT INTO Usuario (nombre, apellidoPaterno, apellidoMaterno, abreviacionOcupacion, puesto, ocupacion, correo, contrasena, rol) VALUES 
('Admin', 'Sistemas', 'TI', 'Ing.', 'Administrador de Sistemas', 'Ingeniero', 'ti@uv.mx', '$2a$10$bgmQKSjZfVF.FNuCTCV2b.suU.A0IXWQ/0iWOlGbu1xu0KsYJ4TK2', 'TI'),
('Norma Hilda', 'Jiménez', 'Martínez', 'M.A.P.', 'Contralora General', 'Contralora', 'contralora@uv.mx', '$2a$10$bgmQKSjZfVF.FNuCTCV2b.suU.A0IXWQ/0iWOlGbu1xu0KsYJ4TK2', 'Contralora'),
('Sra.', 'Secretaria', 'Gral.', 'Lic.', 'Secretaria Particular', 'Secretaria', 'secretaria@uv.mx', '$2a$10$bgmQKSjZfVF.FNuCTCV2b.suU.A0IXWQ/0iWOlGbu1xu0KsYJ4TK2', 'Secretaria'),
('María del Carmen', 'Peña', 'Cabrera', 'C.P.', 'Directora de Auditoría', 'Contadora', 'control@uv.mx', '$2a$10$bgmQKSjZfVF.FNuCTCV2b.suU.A0IXWQ/0iWOlGbu1xu0KsYJ4TK2', 'Responsable'),
('Juan', 'Pérez', 'Gómez', 'Ing.', 'Director de Obras', 'Ingeniero Civil', 'juan@uv.mx', '$2a$10$bgmQKSjZfVF.FNuCTCV2b.suU.A0IXWQ/0iWOlGbu1xu0KsYJ4TK2', 'Responsable'),
('Ana', 'López', 'Ruiz', 'Lic.', 'Directora de Finanzas', 'Licenciada en Contaduría', 'ana@uv.mx', '$2a$10$bgmQKSjZfVF.FNuCTCV2b.suU.A0IXWQ/0iWOlGbu1xu0KsYJ4TK2', 'Responsable'),
('Carlos', 'García', 'Méndez', 'Ing.', 'Director de SIU', 'Ingeniero en Sistemas', 'carlos@uv.mx', '$2a$10$bgmQKSjZfVF.FNuCTCV2b.suU.A0IXWQ/0iWOlGbu1xu0KsYJ4TK2', 'Responsable');

-- Datos específicos para los usuarios Responsables (IDs del 4 al 7)
INSERT INTO UsuarioResponsable (IdUsuario) VALUES 
(4), (5), (6), (7);