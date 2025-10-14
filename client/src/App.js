import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Header from "./components/Header/Header";
import Login from "./pages/Login/Login";
import Registrar from "./pages/Registrar/Registrar";
import DashboardNutricionista from "./pages/DashboardNutricionista/DashboardNutricionista";
import Perfil from "./pages/Perfil/Perfil";
import ClienteDashboard from "./pages/ClienteDashboard/ClienteDashboard";
import Compras from "./pages/Compras/Compras";
import Chat from "./components/Chat/Chat"
import Biblioteca from './pages/Biblioteca/Biblioteca';
import MediadorDashboard from "./pages/MediadorDashboard/MediadorDashboard";
import MediadorPedidoDetalhes from "./pages/MediadorPedidoDetalhes/MediadorPedidoDetalhes";
import Relatorio from "./pages/Relatorio/Relatorio"
import Planejamento from "./pages/Planejamento/Planejamento"

function DashboardRouter({ planos, setPlanos }) {
  const userType = useSelector((state) => state.user.userType);

  if (!userType) return <Navigate to="/" />;

  switch (userType.id) {
    case 0:
      return null;
    case 1:
      return <ClienteDashboard />;
    case 2:
      return <DashboardNutricionista planos={planos} setPlanos={setPlanos} />;
    case 3:
      return <MediadorDashboard />;
    default:
      return <Navigate to="/" />;
  }
}

function AppContext() {
  const location = useLocation();

  const [userData, setUserData] = useState({
    nome: "teste",
    idade: 66,
    email: "Rodrigo@gmail.com",
    senha: "100%seguro",
    cep: "20271-204",
    estado: "RJ",
    cidade: "Rio de Janeiro",
    bairro: "Maracanã",
    rua: "General Canabarro",
    numero: 485,
    complemento: "P1 - 101",
  });

  const [planos, setPlanos] = useState([
    { id: 1, nome: 'Hipertrofia Muscular', objetivo: 'Ganho de massa' },
    { id: 2, nome: 'Dieta Mediterrânea', objetivo: 'Saúde e longevidade' },
    { id: 3, nome: 'Low Carb Equilibrado', objetivo: 'Perda de peso' },
    { id: 4, nome: 'Dieta Vegana para Atletas', objetivo: 'Performance' },
    { id: 5, nome: 'Reeducação Alimentar', objetivo: 'Saúde geral' },
  ]);

  const hideRoutes = ["/", "/login", "/registrar"];
  const showLoggedComponents = !hideRoutes.includes(location.pathname);
  const userType = useSelector((state) => state.user.userType);

  return (
    <>
      {showLoggedComponents && <Header tipo={userType.name}/>}
      {showLoggedComponents && <Chat userData={userData} setUserData={setUserData}/>}

      <Routes>
        {/* Páginas para Não-Logados */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registrar" element={<Registrar />}/>

        {/* Páginas para Logados */}
        <Route path="/dashboard" element={<DashboardRouter planos={planos} setPlanos={setPlanos} />} />

        <Route path="/compras" element={<Compras />} />
        <Route path="/biblioteca" element={<Biblioteca />} />
        <Route path="/mediador-pedido-detalhes" element={<MediadorPedidoDetalhes />} />
        <Route path="/relatorio" element={<Relatorio />} />
        <Route path="/planejamento" element={<Planejamento />} />

        <Route path="/perfil" element={<Perfil userData={userData} setUserData={setUserData} />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContext />
    </Router>
  );
}

export default App;