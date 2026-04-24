import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { API_URL } from '../config';

const LOGIN_API_URL = `${API_URL}/auth/login`;

const Login = () => {
    const navigate = useNavigate();

    const [correo, setCorreo] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState('');
    const [mostrarContrasena, setMostrarContrasena] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setCargando(true);

        try {
            const response = await fetch(LOGIN_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ correo: correo.trim(), contrasena }),
            });

            const data = await response.json();

            if (!response.ok || !data.ok) {
                setError(data.mensaje || 'Credenciales incorrectas.');
                return;
            }

            // Guardar datos de sesión en sessionStorage
            sessionStorage.setItem('token', data.token);
            sessionStorage.setItem('userRole', data.usuario.rol);
            sessionStorage.setItem('userName', data.usuario.nombre);
            sessionStorage.setItem('userLN', data.usuario.apellidoPaterno || '');
            sessionStorage.setItem('userMLN', data.usuario.apellidoMaterno || '');
            sessionStorage.setItem('userPuesto', data.usuario.puesto || '');
            sessionStorage.setItem('userId', data.usuario.id);
            sessionStorage.setItem('authPassed', 'true');

            navigate('/dashboard');

        } catch (err) {
            setError('No se pudo conectar con el servidor. Verifica que la API esté corriendo.');
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-gray-800 font-sans">


            <h1 className="text-center font-bold text-gray-700 mb-10 max-w-2xl text-2xl md:text-3xl uppercase leading-tight px-4">
                Sistema de gestión de procesos de la Contraloría General de la Universidad Veracruzana
            </h1>


            <div className="bg-white p-8 md:p-10 rounded-2xl shadow-xl w-full max-w-md border border-gray-100 transition-all hover:shadow-2xl">
                <h2 className="text-center text-2xl font-semibold text-gray-800 mb-8">
                    Inicio de sesión
                </h2>


                {error && (
                    <div className="mb-5 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm font-medium text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label htmlFor="correo" className="block text-sm font-bold text-gray-600 mb-2">
                            Correo electrónico
                        </label>
                        <input
                            id="correo"
                            type="email"
                            value={correo}
                            onChange={(e) => setCorreo(e.target.value)}
                            placeholder="Ej: ti@uv.mx"
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#009642] focus:ring-2 focus:ring-green-100 outline-none transition-all placeholder:text-gray-300 text-gray-700 font-medium"
                            required
                            disabled={cargando}
                            autoComplete="email"
                        />
                    </div>

                    <div>
                        <label htmlFor="contrasena" className="block text-sm font-bold text-gray-600 mb-2">
                            Contraseña
                        </label>
                        <div className="relative">
                            <input
                                id="contrasena"
                                type={mostrarContrasena ? 'text' : 'password'}
                                value={contrasena}
                                onChange={(e) => setContrasena(e.target.value)}
                                placeholder="••••••••"
                                className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-300 focus:border-[#009642] focus:ring-2 focus:ring-green-100 outline-none transition-all placeholder:text-gray-300"
                                required
                                disabled={cargando}
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                onClick={() => setMostrarContrasena(v => !v)}
                                className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                tabIndex={-1}
                                aria-label={mostrarContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                            >
                                {mostrarContrasena ? (

                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                    </svg>
                                ) : (

                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={cargando}
                        className="w-full bg-[#009642] text-white py-3.5 rounded-xl font-bold text-lg hover:bg-green-700 shadow-md shadow-green-100 transition-all mt-4 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {cargando ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                </svg>
                                Verificando...
                            </>
                        ) : (
                            'Ingresar'
                        )}
                    </button>
                </form>

                <p className="text-center text-[10px] text-gray-400 mt-8 uppercase tracking-widest font-medium">
                    © 2026 Universidad Veracruzana
                </p>
            </div>
        </div>
    );
};

export default Login;