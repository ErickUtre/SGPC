import React from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        // Por ahora, como acordamos, solo navegamos sin validar
        navigate('/dashboard');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-gray-800">

            {/* Título Institucional */}
            <h1 className="text-center font-bold text-gray-700 mb-10 max-w-2xl text-2xl md:text-3xl uppercase leading-tight">
                Sistema de gestión de procesos de la Contraloría General de la Universidad Veracruzana
            </h1>

            {/* Tarjeta de Inicio de Sesión */}
            <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
                <h2 className="text-center text-2xl font-semibold text-gray-800 mb-8">
                    Inicio de sesión
                </h2>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-600 mb-2">
                            Correo electrónico
                        </label>
                        <input
                            type="email"
                            placeholder="ejemplo@uv.mx"
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-uv-green focus:ring-2 focus:ring-green-100 outline-none transition-all placeholder:text-gray-300"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-600 mb-2">
                            Contraseña
                        </label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-uv-green focus:ring-2 focus:ring-green-100 outline-none transition-all placeholder:text-gray-300"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-[#009642] text-white py-3.5 rounded-lg font-bold text-lg hover:bg-green-700 shadow-md shadow-green-100 transition-all mt-4"
                    >
                        Ingresar
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;