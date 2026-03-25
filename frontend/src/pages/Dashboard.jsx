import React from 'react';
import { useNavigate } from 'react-router-dom';
import bannerImg from '../assets/banner-uv.png';

const Dashboard = () => {
    const navigate = useNavigate();
    const userRole = localStorage.getItem("userRole");
    const userName = localStorage.getItem("userName");

    const handleTransparenciaClick = () => {
        if (userRole === "Contralora") {
            navigate('/transparencia/contralora');
        } else {
            navigate('/transparencia/ti');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col overflow-x-hidden">

            {/* 1. Banner de Bienvenida */}
            <section
                className="relative w-full py-24 px-8 text-center bg-gray-900 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${bannerImg})` }}
            >
                <div className="absolute inset-0 bg-black/60 z-10"></div>
                <div className="relative z-20 text-white">
                    <h2 className="text-4xl font-light">Bienvenid@</h2>
                    <p className="text-3xl font-bold mt-2">{userName}</p>
                    <div className="w-20 h-1 bg-green-500 mx-auto mt-6 rounded-full"></div>
                </div>
            </section>

            {/* 2. Contenedor de Módulos */}
            <main className="flex-1 max-w-7xl mx-auto w-full p-8 py-12">
                <div className="text-center mb-12">
                    <h3 className="text-2xl font-bold text-gray-800">Módulos del Sistema</h3>
                    <p className="text-gray-500">Seleccione un módulo para continuar</p>
                    <div className="w-16 h-0.5 bg-blue-400 mx-auto mt-2"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                    {/* Tarjeta de Transparencia - REPARADA */}
                    <div
                        onClick={handleTransparenciaClick}
                        className="group relative h-72 rounded-3xl overflow-hidden shadow-lg cursor-pointer transform hover:-translate-y-2 transition-all duration-300"
                    >
                        {/* Imagen de fondo confinada a la tarjeta */}
                        <div className="absolute inset-0 z-0 bg-[url('https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=600')] bg-cover bg-center group-hover:scale-110 transition-transform duration-500"></div>

                        {/* Overlay de la tarjeta */}
                        <div className="absolute inset-0 z-10 bg-black/50 group-hover:bg-black/40 transition-colors"></div>

                        {/* Contenido de la tarjeta */}
                        <div className="relative z-20 h-full p-8 flex flex-col justify-end text-white">
                            <span className="absolute top-6 right-6 bg-white/20 backdrop-blur-md w-10 h-10 rounded-full flex items-center justify-center font-bold border border-white/30">
                                1
                            </span>
                            <h4 className="text-xl font-bold leading-tight">
                                Gestión de Solicitudes de Transparencia
                            </h4>
                            <p className="text-sm mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                Entrar al módulo →
                            </p>
                        </div>
                    </div>

                    {/* Espacios para futuros módulos */}
                    <div className="h-72 border-2 border-dashed border-gray-200 rounded-3xl flex items-center justify-center text-gray-400 italic">
                        Próximamente: Gestión de Auditorías
                    </div>

                </div>
            </main>

            <footer className="p-4 text-center text-xs text-gray-400 bg-white border-t border-gray-100">
                © 2026 Universidad Veracruzana - Contraloría General
            </footer>
        </div>
    );
};

export default Dashboard;