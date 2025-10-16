import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Header from "./components/Header/Header";
import Login from "./pages/Login/Login";
import Registrar from "./pages/Registrar/Registrar";
import Perfil from "./pages/Perfil/Perfil";
import Pacientes from "./pages/Pacientes/Pacientes"
import Planos from "./pages/Planos/Planos"
import PlanoDetalhes from "./pages/PlanoDetalhes/PlanoDetalhes"
import ClienteDashboard from "./pages/ClienteDashboard/ClienteDashboard";
import Compras from "./pages/Compras/Compras";
import Chat from "./components/Chat/Chat"
import Biblioteca from './pages/Biblioteca/Biblioteca';
import MediadorDashboard from "./pages/MediadorDashboard/MediadorDashboard";
import MediadorPedidoDetalhes from "./pages/MediadorPedidoDetalhes/MediadorPedidoDetalhes";
import Relatorio from "./pages/Relatorio/Relatorio"
import Planejamento from "./pages/Planejamento/Planejamento"
import EsqeuciMinhaSenha from "./pages/EsqueciMinhaSenha/EsqueciMinhaSenha"

function DashboardRouter() {
  const userType = useSelector((state) => state.user.userType);
  if (!userType) return <Navigate to="/" />;

  switch (userType.id) {
    case 0: return null;
    case 1: return <ClienteDashboard />;
    case 2: return <Pacientes />;
    case 3: return <MediadorDashboard />;
    default: return <Navigate to="/" />;
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

  // Aqui é um código para quando a pessoa não estiver logada,
  // Não aparecer o header, nem o chat
  const rotasNaoLogadas = ["/", "/login", "/registrar", "/esqueci-minha-senha"];
  const mostrarComponentesQuandoLogados = !rotasNaoLogadas.includes(location.pathname);
  const userType = useSelector((state) => state.user.userType);

  return (
    <>
      {mostrarComponentesQuandoLogados && <Header tipo={userType.name}/>}
      {mostrarComponentesQuandoLogados && <Chat />}

      <Routes>
        {/* Páginas para Não-Logados */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registrar" element={<Registrar />}/>

        {/* Páginas para Logados */}
        <Route path="/dashboard" element={<DashboardRouter />} />
        <Route path="/compras" element={<Compras />} />
        <Route path="/biblioteca" element={<Biblioteca />} />
        <Route path="/mediador-pedido-detalhes" element={<MediadorPedidoDetalhes />} />
        <Route path="/relatorio" element={<Relatorio />} />
        <Route path="/planejamento" element={<Planejamento />} />
        <Route path="/perfil" element={<Perfil userData={userData} setUserData={setUserData} />} />
        <Route path="/planos" element={<Planos/>}/>
        <Route path="/planos/:id" element={<PlanoDetalhes/>}/>
        <Route path="/esqueci-minha-senha" element={<EsqeuciMinhaSenha/>}/>
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