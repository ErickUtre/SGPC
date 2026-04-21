import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useTransparencia } from '../../hooks/useTransparencia';
import { TransparenciaLayout } from '../../components/SolicitudesTransparencia/TransparenciaLayout';
import { SolicitudCard } from '../../components/SolicitudesTransparencia/SolicitudCard';
import { API_BASE, normalizarSolicitudReal } from '../../utils/solicitudesTransparencia';
import { abrirArchivoPNTEnPestana } from '../../utils/solicitudesArchivos';

const SolicitudesTransparenciaTI = () => {
  const fileInputRef = useRef(null);
  const capturaInputRef = useRef(null);
  const nuevaSolicitudFileInputRef = useRef(null);

  const [modalAbierta, setModalAbierta] = useState(false);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
  const [editandoId, setEditandoId] = useState(null);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [dropdownAbierto, setDropdownAbierto] = useState(null);

  const [modalNuevaSolicitudAbierta, setModalNuevaSolicitudAbierta] = useState(false);
  const [nuevaSolicitudNombre, setNuevaSolicitudNombre] = useState('');
  const [nuevaSolicitudFolio, setNuevaSolicitudFolio] = useState('');
  const [nuevaSolicitudDiasMax, setNuevaSolicitudDiasMax] = useState(7);
  const [nuevaSolicitudArchivo, setNuevaSolicitudArchivo] = useState(null);
  const [cargandoRegistro, setCargandoRegistro] = useState(false);
  const [errorModal, setErrorModal] = useState('');
  const [operacionSolicitudId, setOperacionSolicitudId] = useState(null);
  const [modalCapturaAbierta, setModalCapturaAbierta] = useState(false);
  const [capturaPreviewUrl, setCapturaPreviewUrl] = useState('');
  const [capturaPreviewNombre, setCapturaPreviewNombre] = useState('');

  const [cargandoSolicitudes, setCargandoSolicitudes] = useState(true);
  const [listaEvidencias, setListaEvidencias] = useState([]);
  const [cargandoEvidencias, setCargandoEvidencias] = useState(false);

  // El estado base incluye solicitudes reales de BD
  const state = useTransparencia([]);


  useEffect(() => {
    const token = sessionStorage.getItem('token');
    setCargandoSolicitudes(true);

    fetch(`${API_BASE}/solicitudes`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) state.setSolicitudes(data.solicitudes.map(normalizarSolicitudReal));
      })
      .catch(() => {})
      .finally(() => setCargandoSolicitudes(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (modalAbierta && solicitudSeleccionada) {
      const fetchEvidencias = async () => {
        setCargandoEvidencias(true);
        try {
          const token = sessionStorage.getItem('token');
          const response = await fetch(`${API_BASE}/solicitudes/${solicitudSeleccionada.idOriginal}/evidencias`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = await response.json();
          if (data.ok) {
            setListaEvidencias(data.evidencias);
          } else {
            setListaEvidencias([]);
          }
        } catch (error) {
          console.error("Error al cargar evidencias:", error);
          setListaEvidencias([]);
        } finally {
          setCargandoEvidencias(false);
        }
      };
      fetchEvidencias();
    } else {
      setListaEvidencias([]);
    }
  }, [modalAbierta, solicitudSeleccionada]);

  const todasEvidenciasSubidas = useMemo(() => {
    return listaEvidencias.length > 0 && listaEvidencias.every(ev => ev.IdEvidencia !== null);
  }, [listaEvidencias]);

  const descargarPaqueteZip = async () => {
    if (!solicitudSeleccionada) return;
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`${API_BASE}/solicitudes/${solicitudSeleccionada.idOriginal}/paquete?t=${Date.now()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        window.alert('No se pudo generar el paquete de evidencias.');
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      // Sanitizar nombre para el archivo de descarga
      const nombreSanitizado = solicitudSeleccionada.nombre.replace(/[^a-z0-9 ]/gi, '').replace(/ /g, '_');
      link.download = `${nombreSanitizado}_Respuesta.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      window.alert('Error al conectar con el servidor.');
    }
  };

  const descargarArchivoEvidencia = async (idEvidencia) => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`${API_BASE}/solicitudes/evidencia/${idEvidencia}/download`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        window.alert('No se pudo abrir la evidencia.');
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch {
      window.alert('Error al conectar con el servidor.');
    }
  };


  useEffect(() => {
    if (dropdownAbierto === null) return;
    const handler = () => setDropdownAbierto(null);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [dropdownAbierto]);



  const iniciarEdicion = (sol) => {
    setEditandoId(sol.id);
    setNuevoNombre(sol.nombre);
  };

  const guardarNombre = async (id) => {
    if (nuevoNombre.trim().length === 0) return;
    const solicitud = state.solicitudes.find((sol) => sol.id === id);
    if (!solicitud) {
      setEditandoId(null);
      return;
    }

    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`${API_BASE}/solicitudes/${solicitud.idOriginal}/nombre`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nombre: nuevoNombre.trim() }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        window.alert(data.mensaje || 'No se pudo cambiar el nombre.');
        return;
      }

      state.setSolicitudes(
        state.solicitudes.map((sol) => (sol.id === id ? { ...sol, nombre: nuevoNombre.trim() } : sol))
      );
      setEditandoId(null);
    } catch {
      window.alert('No se pudo conectar con el servidor.');
    }
  };

  const seleccionarSolicitudRealOperacion = (sol, inputRef) => {
    setOperacionSolicitudId(sol.id);
    inputRef.current.click();
  };

  const handleCambiarArchivo = async (e) => {
    const archivo = e.target.files?.[0];
    if (!archivo || !operacionSolicitudId) return;

    const solicitud = state.solicitudes.find((sol) => sol.id === operacionSolicitudId);
    e.target.value = '';
    setOperacionSolicitudId(null);

    if (!solicitud) return;

    try {
      const token = sessionStorage.getItem('token');
      const formData = new FormData();
      formData.append('archivo', archivo);

      const response = await fetch(`${API_BASE}/solicitudes/${solicitud.idOriginal}/archivo`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok || !data.ok) {
        window.alert(data.mensaje || 'No se pudo actualizar el archivo.');
        return;
      }

      state.setSolicitudes(
        state.solicitudes.map((sol) => (sol.id === solicitud.id ? { ...sol, archivo: archivo.name } : sol))
      );
      window.alert('Archivo actualizado correctamente.');
    } catch {
      window.alert('No se pudo conectar con el servidor.');
    }
  };

  const handleSubirCaptura = async (e) => {
    const captura = e.target.files?.[0];
    if (!captura || !operacionSolicitudId) return;

    const solicitud = state.solicitudes.find((sol) => sol.id === operacionSolicitudId);
    e.target.value = '';
    setOperacionSolicitudId(null);

    if (!solicitud) return;

    try {
      const token = sessionStorage.getItem('token');
      const formData = new FormData();
      formData.append('captura', captura);

      const response = await fetch(`${API_BASE}/solicitudes/${solicitud.idOriginal}/captura-entrega`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok || !data.ok) {
        window.alert(data.mensaje || 'No se pudo subir la captura.');
        return;
      }

      state.setSolicitudes(
        state.solicitudes.map((sol) => (
          sol.id === solicitud.id ? { ...sol, capturaEntregaDisponible: true } : sol
        ))
      );
      window.alert('Captura de entrega subida correctamente.');
    } catch {
      window.alert('No se pudo conectar con el servidor.');
    }
  };

  const verCapturaEntrega = async (sol) => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`${API_BASE}/solicitudes/${sol.idOriginal}/captura-entrega`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        window.alert(data?.mensaje || 'No se pudo abrir la captura.');
        return;
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setCapturaPreviewUrl(url);
      setCapturaPreviewNombre(`Captura de entrega - ${sol.nombre}`);
      setModalCapturaAbierta(true);
    } catch {
      window.alert('No se pudo conectar con el servidor.');
    }
  };



  const handleRegistrar = async () => {
    if (!nuevaSolicitudArchivo || nuevaSolicitudNombre.trim() === '' || nuevaSolicitudFolio.trim() === '') return;
    
    // Validar folio (15 numéricos)
    if (nuevaSolicitudFolio.trim().length !== 15 || !/^\d+$/.test(nuevaSolicitudFolio)) {
      setErrorModal('El folio debe tener exactamente 15 caracteres numéricos.');
      return;
    }

    // Validar días (1-100)
    const dias = parseInt(nuevaSolicitudDiasMax, 10);
    if (isNaN(dias) || dias < 1 || dias > 100) {
      setErrorModal('Los días máximos deben ser un número entre 1 y 100.');
      return;
    }

    setErrorModal('');
    setCargandoRegistro(true);

    try {
      const token = sessionStorage.getItem('token');
      const formData = new FormData();
      formData.append('nombre', nuevaSolicitudNombre.trim());
      formData.append('folio', nuevaSolicitudFolio.trim());
      formData.append('diasMaximos', dias);
      formData.append('archivo', nuevaSolicitudArchivo);

      const response = await fetch(`${API_BASE}/solicitudes`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        setErrorModal(data.mensaje || 'Error al registrar la solicitud.');
        return;
      }

      // Agregar la solicitud recién creada al inicio de la lista
      state.setSolicitudes([normalizarSolicitudReal(data.solicitud), ...state.solicitudes]);

      // Cerrar y limpiar modal
      setModalNuevaSolicitudAbierta(false);
      setNuevaSolicitudNombre('');
      setNuevaSolicitudFolio('');
      setNuevaSolicitudDiasMax(7);
      setNuevaSolicitudArchivo(null);
      setErrorModal('');

    } catch {
      setErrorModal('No se pudo conectar con el servidor.');
    } finally {
      setCargandoRegistro(false);
    }
  };

  const cerrarModalNueva = () => {
    if (cargandoRegistro) return;
    setModalNuevaSolicitudAbierta(false);
    setNuevaSolicitudNombre('');
    setNuevaSolicitudFolio('');
    setNuevaSolicitudDiasMax(7);
    setNuevaSolicitudArchivo(null);
    setErrorModal('');
  };

  return (
    <>
      <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.doc,.docx" onChange={handleCambiarArchivo} />
      <input type="file" ref={capturaInputRef} className="hidden" accept=".jpg,.jpeg,.png" onChange={handleSubirCaptura} />

      <TransparenciaLayout
        {...state}
        headerActions={
          <button
            onClick={() => setModalNuevaSolicitudAbierta(true)}
            className="w-full md:w-auto bg-[#009642] text-white px-6 py-3 rounded-lg shadow-md transition-all duration-200 hover:bg-green-700 hover:shadow-lg active:scale-95 font-bold text-sm shrink-0"
          >
            + Nueva Solicitud
          </button>
        }
      >
        {cargandoSolicitudes ? (
          <div className="flex items-center justify-center py-20 gap-3 text-gray-400">
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            <span className="text-sm font-semibold">Cargando solicitudes...</span>
          </div>
        ) : state.solicitudesFiltradas.length === 0 ? (
          <div className="text-center py-16 text-gray-400 font-semibold text-sm">
            No se encontraron solicitudes.
          </div>
        ) : (
          state.solicitudesFiltradas.map((sol) => (
            <SolicitudCard
              key={sol.id}
              solicitud={sol}
              onVerClick={editandoId === sol.id ? null : () => abrirArchivoPNTEnPestana(sol)}
              titleComponent={
                editandoId === sol.id ? (
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
                      <input
                        type="text"
                        value={nuevoNombre}
                        maxLength={70}
                        onChange={(e) => setNuevoNombre(e.target.value)}
                        className="w-full md:flex-1 border-b-2 border-blue-500 outline-none text-lg md:text-xl font-bold text-gray-800 bg-transparent focus:border-blue-700 transition-colors"
                        autoFocus
                      />
                      <div className="flex gap-4 shrink-0">
                        <button onClick={() => guardarNombre(sol.id)} className="text-green-600 font-bold text-xs hover:text-green-800 transition-colors active:scale-95">Guardar</button>
                        <button onClick={() => setEditandoId(null)} className="text-red-600 font-bold text-xs hover:text-red-800 transition-colors active:scale-95">Cancelar</button>
                      </div>
                    </div>
                    <span className={`text-[9px] font-bold tracking-widest ${nuevoNombre.length >= 60 ? 'text-red-500' : 'text-gray-400'}`}>
                      Caracteres: {nuevoNombre.length} / 70
                    </span>
                  </div>
                ) : null
              }
            >
              {!sol.cancelada && (
                <div className="relative">
                  <button
                    onClick={(e) => { e.stopPropagation(); setDropdownAbierto(dropdownAbierto === sol.id ? null : sol.id); }}
                    className="px-3 py-1.5 text-[10px] font-bold border-2 border-gray-400 text-gray-600 rounded-lg transition-all duration-200 hover:bg-gray-100 active:scale-95 flex items-center gap-1"
                  >
                    Operaciones
                    <span className="text-[8px]">{dropdownAbierto === sol.id ? '▲' : '▼'}</span>
                  </button>
                  {dropdownAbierto === sol.id && (
                    <div className="absolute left-0 bottom-full mb-1 z-50 bg-white border border-gray-200 rounded-xl shadow-lg py-1 min-w-[200px]">
                      <button onClick={() => { iniciarEdicion(sol); setDropdownAbierto(null); }} className="w-full text-left px-4 py-2.5 text-[11px] font-bold text-gray-500 hover:bg-gray-50 transition-colors">Cambiar nombre</button>
                      <button onClick={() => { seleccionarSolicitudRealOperacion(sol, fileInputRef); setDropdownAbierto(null); }} className="w-full text-left px-4 py-2.5 text-[11px] font-bold text-gray-500 hover:bg-gray-50 transition-colors">Cambiar archivo</button>
                      <button 
                        disabled={!sol.validada}
                        onClick={() => { seleccionarSolicitudRealOperacion(sol, capturaInputRef); setDropdownAbierto(null); }} 
                        className={`w-full text-left px-4 py-2.5 text-[11px] font-bold transition-colors ${
                          sol.validada 
                            ? 'text-gray-700 hover:bg-gray-50' 
                            : 'text-gray-300 cursor-not-allowed'
                        }`}
                      >
                        Subir captura de entrega { !sol.validada && '(Espera validación)' }
                      </button>
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={() => { setSolicitudSeleccionada(sol); setModalAbierta(true); }}
                className={`${sol.cancelada ? 'hidden' : 'bg-[#1e4b8f]'} text-white px-5 py-2 rounded-xl font-bold text-xs shadow-md whitespace-nowrap transition-all duration-200 hover:bg-[#153566] hover:shadow-lg active:scale-95`}
              >
                Ver Respuesta
              </button>

              {!sol.cancelada && sol.capturaEntregaDisponible && (
                <button
                  onClick={() => verCapturaEntrega(sol)}
                  className="px-3 py-2 text-[10px] font-bold border-2 border-emerald-500 text-emerald-600 rounded-xl hover:bg-emerald-500 hover:text-white transition-all active:scale-95"
                >
                  Captura subida - Ver
                </button>
              )}
            </SolicitudCard>
          ))
        )}
      </TransparenciaLayout>


      {modalAbierta && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in slide-in-from-bottom sm:zoom-in duration-300">
            <div className="bg-[#1e4b8f] p-5 text-white text-center">
              <h3 className="font-bold text-xs tracking-widest">Respuesta de la solicitud</h3>
            </div>
            <div className="p-6 md:p-10 text-center flex flex-col">
              <p className="text-gray-400 mb-1 text-[9px] font-bold tracking-widest">Solicitud Relacionada</p>
              <h4 className="font-bold text-gray-900 text-lg mb-6 border-b border-gray-100 pb-4 break-words">{solicitudSeleccionada?.nombre}</h4>
              <div className="bg-gray-50 rounded-xl p-3 md:p-4 mb-6 border border-gray-100 max-h-60 overflow-y-auto space-y-2 text-left">
                {cargandoEvidencias ? (
                  <div className="flex flex-col items-center justify-center py-6 text-gray-400 gap-2">
                    <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    <span className="text-xs font-bold tracking-widest">Cargando respuestas...</span>
                  </div>
                ) : listaEvidencias.length === 0 ? (
                  <p className="text-center py-4 text-gray-400 text-sm italic">Ningún responsable ha subido su respuesta aún.</p>
                ) : (
                  listaEvidencias.map((evidencia) => (
                    <div key={evidencia.IdUsuarioResponsable} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white rounded-lg border border-gray-100 hover:shadow-sm transition-shadow">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className={`p-2 rounded-lg shrink-0 ${evidencia.IdEvidencia ? 'bg-blue-50 text-[#1e4b8f]' : 'bg-orange-50 text-orange-500'}`}>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={evidencia.IdEvidencia ? "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" : "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"} /></svg>
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-black text-gray-800 truncate">{evidencia.nombreResponsable}</span>
                          {evidencia.IdEvidencia ? (
                            <span className="text-[10px] text-gray-500 truncate" title={evidencia.nombreArchivo}>{evidencia.nombreArchivo}</span>
                          ) : (
                            <span className="text-[10px] text-orange-500 font-bold italic tracking-tight">Aún no ha subido evidencia</span>
                          )}
                        </div>
                      </div>
                      {evidencia.IdEvidencia ? (
                        <button 
                          onClick={() => descargarArchivoEvidencia(evidencia.IdEvidencia)}
                          className="w-full sm:w-auto px-4 py-1.5 text-[10px] font-bold border-2 border-[#1e4b8f] text-[#1e4b8f] rounded-lg hover:bg-[#1e4b8f] hover:text-white transition-all active:scale-95 whitespace-nowrap"
                        >
                          Ver Documento
                        </button>
                      ) : (
                        <div className="w-full sm:w-auto px-4 py-1.5 text-[9px] font-bold text-gray-400 bg-gray-50 rounded-lg border border-gray-100 uppercase tracking-widest text-center">
                          Pendiente
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4 border-t border-gray-100 pt-6">
                <button onClick={() => setModalAbierta(false)} className="w-full sm:w-auto order-2 sm:order-1 px-8 py-3 text-xs font-bold text-gray-400 transition-all hover:text-red-600 hover:bg-red-50 rounded-lg active:scale-95">Cerrar ventana</button>
                <button 
                  onClick={descargarPaqueteZip}
                  disabled={!todasEvidenciasSubidas || !solicitudSeleccionada?.validada}
                  className={`w-full sm:w-auto order-1 sm:order-2 px-8 py-3 rounded-xl font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all ${
                    (todasEvidenciasSubidas && solicitudSeleccionada?.validada)
                      ? 'bg-[#009642] text-white hover:bg-green-700 active:scale-95' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                  }`}
                >
                  {solicitudSeleccionada?.validada ? 'Descargar todo' : 'Esperando validación de Contralora'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


      {modalNuevaSolicitudAbierta && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-300">
            <div className="bg-[#1e4b8f] p-5 text-white text-center">
              <h3 className="font-bold text-sm tracking-widest">Agregar nueva solicitud de transparencia</h3>
            </div>

            <div className="p-6 md:p-8 flex flex-col gap-6">
              {errorModal && (
                <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm font-medium text-center">
                  {errorModal}
                </div>
              )}

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2 flex-1 w-full">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Nombre de la solicitud</label>
                  <input
                    type="text"
                    value={nuevaSolicitudNombre}
                    onChange={(e) => setNuevaSolicitudNombre(e.target.value)}
                    placeholder="Ingrese el nombre"
                    disabled={cargandoRegistro}
                    className="w-full border-2 border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-[#1e4b8f] transition-colors disabled:opacity-60"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex flex-col gap-2 flex-[2] w-full">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Folio (15 dígitos numéricos)</label>
                    <input
                      type="text"
                      value={nuevaSolicitudFolio}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '' || (/^\d+$/.test(val) && val.length <= 15)) {
                          setNuevaSolicitudFolio(val);
                        }
                      }}
                      placeholder="Ej: 123456789012345"
                      disabled={cargandoRegistro}
                      className="w-full border-2 border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-[#1e4b8f] transition-colors disabled:opacity-60"
                      maxLength={15}
                    />
                  </div>
                  <div className="flex flex-col gap-2 flex-1 w-full">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Días para respuesta</label>
                    <input
                      type="number"
                      value={nuevaSolicitudDiasMax}
                      onChange={(e) => setNuevaSolicitudDiasMax(e.target.value)}
                      min={1}
                      max={100}
                      disabled={cargandoRegistro}
                      className="w-full border-2 border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-[#1e4b8f] transition-colors disabled:opacity-60"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2 w-full">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Archivo de la solicitud</label>
                  <div className="shrink-0 w-full">
                    <input
                      type="file"
                      ref={nuevaSolicitudFileInputRef}
                      className="hidden"
                      accept=".pdf,.docx"
                      onChange={(e) => {
                        setNuevaSolicitudArchivo(e.target.files[0]);
                        e.target.value = '';
                      }}
                    />
                    <button
                      onClick={() => nuevaSolicitudFileInputRef.current.click()}
                      disabled={cargandoRegistro}
                      className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-sm active:scale-95 border-2 ${
                        nuevaSolicitudArchivo 
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-600' 
                          : 'bg-white border-gray-200 text-gray-500 hover:border-[#1e4b8f] hover:text-[#1e4b8f]'
                      } disabled:opacity-60 disabled:cursor-not-allowed`}
                    >
                      {nuevaSolicitudArchivo ? '✓ Archivo seleccionado' : 'Adjuntar archivo PDF/DOCX'}
                    </button>
                  </div>
                </div>
              </div>

              {nuevaSolicitudArchivo && (
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 flex items-center gap-3 animate-in fade-in zoom-in duration-200">
                  <span className="text-lg">📄</span>
                  <span className="text-sm text-gray-700 font-medium truncate flex-1">{nuevaSolicitudArchivo.name}</span>
                  <button
                    onClick={() => {
                      setNuevaSolicitudArchivo(null);
                      if (nuevaSolicitudFileInputRef.current) nuevaSolicitudFileInputRef.current.value = '';
                    }}
                    disabled={cargandoRegistro}
                    className="text-red-500 hover:text-red-700 font-bold p-1 bg-red-50 rounded-lg h-8 w-8 flex items-center justify-center transition-colors"
                    title="Quitar archivo"
                  >
                    ✕
                  </button>
                </div>
              )}

              <div className="flex justify-end items-center gap-3 mt-4 border-t border-gray-100 pt-6">
                <button
                  onClick={cerrarModalNueva}
                  disabled={cargandoRegistro}
                  className="px-6 py-2.5 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors active:scale-95 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleRegistrar}
                  disabled={!nuevaSolicitudArchivo || nuevaSolicitudNombre.trim() === '' || nuevaSolicitudFolio.trim().length !== 15 || cargandoRegistro}
                  className={`px-8 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95 flex items-center gap-2 ${
                    (nuevaSolicitudArchivo && nuevaSolicitudNombre.trim() !== '' && nuevaSolicitudFolio.trim().length === 15 && !cargandoRegistro)
                      ? 'bg-[#009642] text-white hover:bg-green-700 cursor-pointer'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {cargandoRegistro ? (
                    <>
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Registrando...
                    </>
                  ) : (
                    'Registrar'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}



      {modalCapturaAbierta && (
        <div className="fixed inset-0 bg-black/60 z-[125] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in zoom-in duration-200">
            <div className="bg-emerald-600 p-5 text-white text-center font-bold text-xs tracking-widest">
              Captura de Entrega
            </div>
            <div className="p-6">
              <p className="text-sm font-semibold text-gray-600 mb-4">{capturaPreviewNombre}</p>
              <div className="bg-gray-100 rounded-xl overflow-auto max-h-[70vh] flex items-center justify-center">
                <img src={capturaPreviewUrl} alt="Captura de entrega" className="max-w-full h-auto" />
              </div>
              <div className="flex justify-end mt-5">
                <button
                  onClick={() => {
                    if (capturaPreviewUrl) URL.revokeObjectURL(capturaPreviewUrl);
                    setCapturaPreviewUrl('');
                    setCapturaPreviewNombre('');
                    setModalCapturaAbierta(false);
                  }}
                  className="px-8 py-3 text-xs font-bold text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all active:scale-95"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SolicitudesTransparenciaTI;