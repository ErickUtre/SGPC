const request = require('supertest');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const pool = require('./db');

const API_URL = 'http://localhost:3001/api';
const TEST_PASSWORD = 'password123';

let tokens = {};
let userIds = {};
let testSolicitudId = null;

// Emails únicos para evitar colisiones
const TEST_EMAILS = {
  TI: `test_ti_${Date.now()}@test.com`,
  Contralora: `test_contralora_${Date.now()}@test.com`,
  Responsable: `test_resp_${Date.now()}@test.com`
};

// Aumentar el timeout global para pruebas que involucren carga de archivos
jest.setTimeout(30000);

describe('Pruebas Independientes del Módulo de Solicitudes de Transparencia', () => {
  
  beforeAll(async () => {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(TEST_PASSWORD, salt);

    // 1. Crear usuarios de prueba directamente en la DB
    for (const role in TEST_EMAILS) {
      const email = TEST_EMAILS[role];
      const [result] = await pool.query(
        'INSERT INTO Usuario (nombre, apellidoPaterno, correo, contrasena, rol) VALUES (?, ?, ?, ?, ?)',
        [`User`, role, email, hash, role]
      );
      userIds[role] = result.insertId;

      if (role === 'Responsable') {
        await pool.query('INSERT INTO UsuarioResponsable (IdUsuario) VALUES (?)', [result.insertId]);
      }

      // 2. Obtener Token vía API login
      const loginRes = await request(API_URL)
        .post('/auth/login')
        .send({ correo: email, contrasena: TEST_PASSWORD });
      
      tokens[role] = loginRes.body.token;
    }

    // 3. Crear archivo dummy
    const dummyPath = path.join(__dirname, 'test.pdf');
    if (!fs.existsSync(dummyPath)) {
      fs.writeFileSync(dummyPath, '%PDF-1.4\n1 0 obj\n<< /Title (Test) >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF');
    }
  });

  // --- PRUEBAS DE FLUJO ---
  
  test('TI: Debe crear una nueva solicitud', async () => {
    const res = await request(API_URL)
      .post('/solicitudes')
      .set('Authorization', `Bearer ${tokens.TI}`)
      .field('nombre', 'Solicitud Independiente de Usuarios')
      .field('folio', '123456789012345')
      .field('diasMaximos', 5)
      .attach('archivo', path.join(__dirname, 'test.pdf'));

    if (res.status !== 201) console.log('Error 400 en Creación:', res.body);
    expect(res.status).toBe(201);
    expect(res.body.ok).toBe(true);
    testSolicitudId = res.body.id;
  });

  test('Contralora: Debe turnar la solicitud al Responsable de prueba', async () => {
    const res = await request(API_URL)
      .post(`/solicitudes/${testSolicitudId}/turnar`)
      .set('Authorization', `Bearer ${tokens.Contralora}`)
      .send({ idsResponsables: [userIds.Responsable] });

    if (res.status !== 200) console.log('Error 400 en Turnar:', res.body);
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  test('Responsable: Debe subir evidencia', async () => {
    const res = await request(API_URL)
      .post(`/solicitudes/${testSolicitudId}/evidencia-responsable/upload`)
      .set('Authorization', `Bearer ${tokens.Responsable}`)
      .attach('evidencia', path.join(__dirname, 'test.pdf'));

    if (res.status !== 200) console.log('Error 400 en Evidencia:', res.body);
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  test('TI: Debe poder eliminar la solicitud creada', async () => {
    const res = await request(API_URL)
      .delete(`/solicitudes/${testSolicitudId}`)
      .set('Authorization', `Bearer ${tokens.TI}`);

    if (res.status !== 200) console.log('Error 400 en Eliminar:', res.body);
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    testSolicitudId = null; // Marcar como borrada para el cleanup
  });

  afterAll(async () => {
    // 1. Limpiar solicitud si no se borró en el test
    if (testSolicitudId) {
      // Eliminar dependencias primero
      await pool.query('DELETE FROM TurnadoSolicitud WHERE IdSolicitud = ?', [testSolicitudId]);
      await pool.query('DELETE FROM Solicitud WHERE IdSolicitud = ?', [testSolicitudId]);
    }

    // 2. Limpiar usuarios creados (en orden inverso de creación/dependencia)
    for (const role in userIds) {
      await pool.query('DELETE FROM UsuarioResponsable WHERE IdUsuario = ?', [userIds[role]]);
      await pool.query('DELETE FROM Usuario WHERE IdUsuario = ?', [userIds[role]]);
    }

    // 3. Borrar archivo dummy
    const dummyPath = path.join(__dirname, 'test.pdf');
    if (fs.existsSync(dummyPath)) {
      fs.unlinkSync(dummyPath);
    }

    // 4. Cerrar pool
    await pool.end();
  });
});
