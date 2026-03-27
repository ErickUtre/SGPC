import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const navigate = useNavigate();
    
    // Estado para capturar el valor del campo de "correo"
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = (e) => {
        e.preventDefault();
        
        const userValue = identifier.trim();

        // Lógica de redirección por Roles Estáticos
        if (userValue === "TI") {
            localStorage.setItem("userRole", "TI");
            localStorage.setItem("userName", "Administrador TI");
            navigate('/dashboard');
        } 
        else if (userValue === "Contralora") {
            localStorage.setItem("userRole", "Contralora");
            localStorage.setItem("userName", "Mtra. Contralora General");
            navigate('/dashboard');
        }
        else if (userValue === "Responsable") {
            localStorage.setItem("userRole", "Responsable");
            localStorage.setItem("userName", "Responsable Asignado");
            navigate('/dashboard');
        }
        else if (userValue === "Secretaria") {
            localStorage.setItem("userRole", "Secretaria");
            localStorage.setItem("userName", "Secretaria");
            navigate('/dashboard');
        }
        else {
            alert("Usuario no reconocido. Ingresa 'TI', 'Contralora', 'Responsable' o 'Secretaria'.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-gray-800 font-sans">

            {/* Título Institucional */}
            <h1 className="text-center font-bold text-gray-700 mb-10 max-w-2xl text-2xl md:text-3xl uppercase leading-tight px-4">
                Sistema de gestión de procesos de la Contraloría General de la Universidad Veracruzana
            </h1>

            {/* Tarjeta de Inicio de Sesión */}
            <div className="bg-white p-8 md:p-10 rounded-2xl shadow-xl w-full max-w-md border border-gray-100 transition-all hover:shadow-2xl">
                <h2 className="text-center text-2xl font-semibold text-gray-800 mb-8">
                    Inicio de sesión
                </h2>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-600 mb-2">
                            Correo electrónico / Usuario
                        </label>
                        <input
                            type="text" // Cambiado a text para aceptar "TI" o "Contralora"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            placeholder="Ej: david@example.com"
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#009642] focus:ring-2 focus:ring-green-100 outline-none transition-all placeholder:text-gray-300 text-gray-700 font-medium"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-600 mb-2">
                            Contraseña
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#009642] focus:ring-2 focus:ring-green-100 outline-none transition-all placeholder:text-gray-300"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-[#009642] text-white py-3.5 rounded-xl font-bold text-lg hover:bg-green-700 shadow-md shadow-green-100 transition-all mt-4 active:scale-95"
                    >
                        Ingresar
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