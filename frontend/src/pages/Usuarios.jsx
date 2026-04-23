import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { API_BASE } from '../utils/solicitudesTransparencia';

const Usuarios = () => {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Modals state
  const [modalEditar, setModalEditar] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);

  const [modalNuevo, setModalNuevo] = useState(false);
  const [usuarioNuevo, setUsuarioNuevo] = useState({
    nombre: '', apellidoPaterno: '', apellidoMaterno: '', abreviacionOcupacion: '',
    ocupacion: '', puesto: '', correo: '', rol: 'Responsable', contrasena: ''
  });

  const [modalEliminar, setModalEliminar] = useState(false);
  const [usuarioEliminar, setUsuarioEliminar] = useState(null);

  useEffect(() => {
    const role = sessionStorage.getItem('userRole');
    if (role !== 'Supervisor') {
      navigate('/dashboard');
      return;
    }
    cargarUsuarios();
  }, [navigate]);

  const cargarUsuarios = async () => {
    setCargando(true);
    try {
      const token = sessionStorage.getItem('token');
      const res = await fetch(`${API_BASE}/usuarios`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.ok) {
        setUsuarios(data.usuarios);
      }
    } catch (e) {
      console.error('Error cargando usuarios', e);
    } finally {
      setCargando(false);
    }
  };

  const abrirEditar = (u) => {
    setUsuarioEditando({ ...u });
    setModalEditar(true);
  };

  const handleGuardarEdicion = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const res = await fetch(`${API_BASE}/usuarios/${usuarioEditando.IdUsuario}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...usuarioEditando,
          nombre: usuarioEditando.nombre.trim(),
          apellidoPaterno: (usuarioEditando.apellidoPaterno || '').trim(),
          apellidoMaterno: (usuarioEditando.apellidoMaterno || '').trim(),
          correo: (usuarioEditando.correo || '').trim(),
        })
      });
      const data = await res.json();
      if (data.ok) {
        setModalEditar(false);
        cargarUsuarios();
      } else {
        window.alert(data.mensaje || 'Error al guardar');
      }
    } catch (e) {
      window.alert('Error de red');
    }
  };

  const abrirNuevo = () => {
    setUsuarioNuevo({
      nombre: '', apellidoPaterno: '', apellidoMaterno: '', abreviacionOcupacion: '',
      ocupacion: '', puesto: '', correo: '', rol: 'Responsable', contrasena: ''
    });
    setModalNuevo(true);
  };

  const handleCrearUsuario = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const datos = {
        ...usuarioNuevo,
        nombre: usuarioNuevo.nombre.trim(),
        apellidoPaterno: (usuarioNuevo.apellidoPaterno || '').trim(),
        apellidoMaterno: (usuarioNuevo.apellidoMaterno || '').trim(),
        correo: (usuarioNuevo.correo || '').trim(),
      };

      if (!datos.nombre || !datos.correo || !datos.contrasena) {
        window.alert('Nombre, correo y contraseña son obligatorios.');
        return;
      }
      if (datos.contrasena.length < 8) {
        window.alert('La contraseña debe tener al menos 8 caracteres.');
        return;
      }

      const res = await fetch(`${API_BASE}/usuarios`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(datos)
      });
      const data = await res.json();
      if (data.ok) {
        setModalNuevo(false);
        cargarUsuarios();
      } else {
        window.alert(data.mensaje || 'Error al registrar el usuario');
      }
    } catch (e) {
      window.alert('Error de red al intentar crear');
    }
  };

  const abrirEliminar = (u) => {
    setUsuarioEliminar(u);
    setModalEliminar(true);
  };

  const handleEliminar = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const res = await fetch(`${API_BASE}/usuarios/${usuarioEliminar.IdUsuario}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.ok) {
        setModalEliminar(false);
        cargarUsuarios();
      } else {
        window.alert(data.mensaje || 'Error al eliminar');
      }
    } catch (e) {
      window.alert('Error de red');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight font-sans">Gestión de Usuarios</h1>
            <p className="text-sm font-semibold text-gray-500 mt-1">Directorio de todo el personal registrado en el sistema.</p>
          </div>
          <button onClick={abrirNuevo} className="bg-[#1e4b8f] text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-[#153566] transition-colors shadow-md flex items-center gap-2 active:scale-95">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Registrar Nuevo Usuario
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-widest text-gray-400 font-bold">
                  <th className="p-4">Nombre Completo</th>
                  <th className="p-4">Ocupación/Puesto</th>
                  <th className="p-4">Correo</th>
                  <th className="p-4 text-center">Rol</th>
                  <th className="p-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {cargando ? (
                  <tr>
                    <td colSpan="5" className="p-12 text-center text-gray-400">
                      <div className="flex flex-col items-center gap-2">
                        <svg className="animate-spin h-6 w-6 text-[#1e4b8f]" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                        <span className="font-bold text-xs uppercase tracking-widest">Cargando datos...</span>
                      </div>
                    </td>
                  </tr>
                ) : usuarios.map(u => (
                  <tr key={u.IdUsuario} className="hover:bg-blue-50/50 transition-colors">
                    <td className="p-4 align-top">
                      <div className="font-bold text-gray-800">{u.nombre} {u.apellidoPaterno} {u.apellidoMaterno}</div>
                    </td>
                    <td className="p-4 align-top">
                      <div className="text-xs font-semibold text-gray-500 mb-0.5 whitespace-nowrap">{u.abreviacionOcupacion} {u.ocupacion}</div>
                      <div className="text-[11px] font-bold text-gray-400 bg-gray-100 uppercase tracking-wider rounded px-2 py-0.5 inline-block">{u.puesto}</div>
                    </td>
                    <td className="p-4 align-top">
                      <a href={`mailto:${u.correo}`} className="text-[#1e4b8f] font-semibold hover:underline">{u.correo}</a>
                    </td>
                    <td className="p-4 align-top text-center">
                      <span className="bg-blue-100 text-[#1e4b8f] font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-full">{u.rol}</span>
                    </td>
                    <td className="p-4 align-top">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => abrirEditar(u)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-colors active:scale-95" title="Editar Usuario">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                        <button onClick={() => abrirEliminar(u)} className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-600 hover:text-white transition-colors active:scale-95" title="Eliminar Usuario">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* MODAL EDITAR */}
      {modalEditar && usuarioEditando && (
        <div className="fixed inset-0 bg-black/60 z-[120] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="bg-[#1e4b8f] p-5 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm tracking-widest uppercase">Editar Usuario</h3>
              <button onClick={() => setModalEditar(false)} className="text-white/70 hover:text-white">✕</button>
            </div>
            <div className="p-6 md:p-8 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Nombre</label>
                  <input type="text" value={usuarioEditando.nombre} onChange={e => setUsuarioEditando({ ...usuarioEditando, nombre: e.target.value })} maxLength={30} className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:border-[#1e4b8f] outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Ap. Paterno</label>
                  <input type="text" value={usuarioEditando.apellidoPaterno} onChange={e => setUsuarioEditando({ ...usuarioEditando, apellidoPaterno: e.target.value })} maxLength={30} className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:border-[#1e4b8f] outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Ap. Materno</label>
                  <input type="text" value={usuarioEditando.apellidoMaterno} onChange={e => setUsuarioEditando({ ...usuarioEditando, apellidoMaterno: e.target.value })} maxLength={30} className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:border-[#1e4b8f] outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="col-span-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Abrev. Ocupación</label>
                  <input type="text" value={usuarioEditando.abreviacionOcupacion} onChange={e => setUsuarioEditando({ ...usuarioEditando, abreviacionOcupacion: e.target.value })} maxLength={10} placeholder="Ej: M.A.P." className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:border-[#1e4b8f] outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Ocupación</label>
                  <input type="text" value={usuarioEditando.ocupacion} onChange={e => setUsuarioEditando({ ...usuarioEditando, ocupacion: e.target.value })} maxLength={30} placeholder="Ej: Contralora" className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:border-[#1e4b8f] outline-none" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Puesto</label>
                <input type="text" value={usuarioEditando.puesto} onChange={e => setUsuarioEditando({ ...usuarioEditando, puesto: e.target.value })} maxLength={50} className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:border-[#1e4b8f] outline-none" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Correo Electrónico</label>
                  <input type="email" value={usuarioEditando.correo} onChange={e => setUsuarioEditando({ ...usuarioEditando, correo: e.target.value })} maxLength={100} className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:border-[#1e4b8f] outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Rol en Sistema</label>
                  <select value={usuarioEditando.rol} onChange={e => setUsuarioEditando({ ...usuarioEditando, rol: e.target.value })} className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:border-[#1e4b8f] outline-none bg-white">
                    <option value="Contralora">Contralora</option>
                    <option value="TI">TI</option>
                    <option value="Secretaria">Secretaria</option>
                    <option value="Responsable">Responsable</option>
                    <option value="Supervisor">Supervisor</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-100">
                <button onClick={() => setModalEditar(false)} className="px-6 py-2.5 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-colors">Cancelar</button>
                <button onClick={handleGuardarEdicion} className="px-6 py-2.5 bg-[#009642] text-white rounded-xl font-bold text-xs hover:bg-green-700 transition-colors shadow-md active:scale-95">Guardar Cambios</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL NUEVO */}
      {modalNuevo && (
        <div className="fixed inset-0 bg-black/60 z-[120] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="bg-[#1e4b8f] p-5 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm tracking-widest uppercase">Registrar Nuevo Usuario</h3>
              <button onClick={() => setModalNuevo(false)} className="text-white/70 hover:text-white">✕</button>
            </div>
            <div className="p-6 md:p-8 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Nombre</label>
                  <input type="text" value={usuarioNuevo.nombre} onChange={e => setUsuarioNuevo({ ...usuarioNuevo, nombre: e.target.value })} maxLength={30} className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:border-[#1e4b8f] outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Ap. Paterno</label>
                  <input type="text" value={usuarioNuevo.apellidoPaterno} onChange={e => setUsuarioNuevo({ ...usuarioNuevo, apellidoPaterno: e.target.value })} maxLength={30} className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:border-[#1e4b8f] outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Ap. Materno</label>
                  <input type="text" value={usuarioNuevo.apellidoMaterno} onChange={e => setUsuarioNuevo({ ...usuarioNuevo, apellidoMaterno: e.target.value })} maxLength={30} className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:border-[#1e4b8f] outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="col-span-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Abrev. Ocupación</label>
                  <input type="text" value={usuarioNuevo.abreviacionOcupacion} onChange={e => setUsuarioNuevo({ ...usuarioNuevo, abreviacionOcupacion: e.target.value })} maxLength={10} placeholder="Ej: M.A.P." className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:border-[#1e4b8f] outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Ocupación</label>
                  <input type="text" value={usuarioNuevo.ocupacion} onChange={e => setUsuarioNuevo({ ...usuarioNuevo, ocupacion: e.target.value })} maxLength={30} placeholder="Ej: Contralora" className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:border-[#1e4b8f] outline-none" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Puesto</label>
                <input type="text" value={usuarioNuevo.puesto} onChange={e => setUsuarioNuevo({ ...usuarioNuevo, puesto: e.target.value })} maxLength={50} className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:border-[#1e4b8f] outline-none" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="col-span-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Correo Electrónico</label>
                  <input type="email" value={usuarioNuevo.correo} onChange={e => setUsuarioNuevo({ ...usuarioNuevo, correo: e.target.value })} maxLength={100} className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:border-[#1e4b8f] outline-none" />
                </div>
                <div className="col-span-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Contraseña Incial</label>
                  <input type="password" value={usuarioNuevo.contrasena} onChange={e => setUsuarioNuevo({ ...usuarioNuevo, contrasena: e.target.value })} maxLength={50} className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:border-[#1e4b8f] outline-none" />
                </div>
                <div className="col-span-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Rol en Sistema</label>
                  <select value={usuarioNuevo.rol} onChange={e => setUsuarioNuevo({ ...usuarioNuevo, rol: e.target.value })} className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:border-[#1e4b8f] outline-none bg-white">
                    <option value="Contralora">Contralora</option>
                    <option value="TI">TI</option>
                    <option value="Secretaria">Secretaria</option>
                    <option value="Responsable">Responsable</option>
                    <option value="Supervisor">Supervisor</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-100">
                <button onClick={() => setModalNuevo(false)} className="px-6 py-2.5 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-colors">Cancelar</button>
                <button onClick={handleCrearUsuario} className="px-6 py-2.5 bg-[#1e4b8f] text-white rounded-xl font-bold text-xs hover:bg-[#153566] transition-colors shadow-md active:scale-95">Registrar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ELIMINAR */}
      {modalEliminar && usuarioEliminar && (
        <div className="fixed inset-0 bg-black/60 z-[120] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in duration-200">
            <div className="bg-red-600 p-5 text-white flex justify-center pb-8 relative">
              <h3 className="font-bold text-sm tracking-widest uppercase">Eliminar Usuario</h3>
              <div className="absolute -bottom-6 bg-white w-12 h-12 rounded-full flex items-center justify-center shadow-md">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
            </div>
            <div className="p-6 pt-10 text-center">
              <p className="text-gray-800 font-bold mb-1">¿Estás seguro que deseas eliminar a este usuario?</p>
              <p className="text-[#1e4b8f] font-black text-lg mb-4">{usuarioEliminar.nombre} {usuarioEliminar.apellidoPaterno}</p>
              <p className="text-[10px] text-gray-500 bg-red-50 p-2 rounded border border-red-100 uppercase tracking-widest font-bold">Esta acción no se puede deshacer y fallará si el usuario tiene procesos activos.</p>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setModalEliminar(false)} className="flex-1 py-3 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-colors">Cancelar</button>
                <button onClick={handleEliminar} className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold text-xs hover:bg-red-700 transition-colors shadow-md active:scale-95">Eliminar Definitivamente</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Usuarios;
