import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
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

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
    userType: "",
  });

  const [RegistrarData, setRegistrarData] = useState({
    userType: "",
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const hideRoutes = ["/", "/login", "/registrar"];
  const showLoggedComponents = !hideRoutes.includes(location.pathname);

  const clienteRotas = ["/cliente-dashboard", "/compras", "/biblioteca", "/planejamento"];
  const nutricionistaRotas = ["/planos", "/pacientes"];
  const mediadorRotas = ["/mediador-dashboard", "/mediador-pedido-detalhes"];

  let tipo = "";
  // 2. Lógica do Header ajustada para funcionar com rotas dinâmicas como /planos/101
  if (clienteRotas.some(rota => location.pathname.startsWith(rota))) {
    tipo = "cliente";
  } else if (nutricionistaRotas.some(rota => location.pathname.startsWith(rota))) {
    tipo = "nutricionista";
  } else if (mediadorRotas.some(rota => location.pathname.startsWith(rota))) {
    tipo = "mediador";
  } else if (location.pathname === "/perfil") {
    // Lógica para perfil, que pode ser de vários tipos. Aqui você precisaria de um estado de usuário logado.
    // Por enquanto, vamos assumir um padrão ou o último tipo detectado.
    // O ideal seria ter um estado global `const [usuarioLogado, setUsuarioLogado] = useState({ tipo: 'cliente' })`
    tipo = "cliente"; // Definindo um padrão para o perfil
  }

  return (
    <>
      {showLoggedComponents && <Chat userData={userData} setUserData={setUserData}/>}
      {showLoggedComponents && <Header tipo={tipo}/>}

      <Routes>
        {/* Rotas de Autenticação */}
        <Route path="/" element={<Login loginData={loginData} setLoginData={setLoginData} />} />
        <Route path="/login" element={<Login loginData={loginData} setLoginData={setLoginData} />} />
        <Route path="/registrar" element={<Registrar RegistrarData={RegistrarData} setRegistrarData={setRegistrarData} />} />
        
        {/* Rota Compartilhada */}
        <Route path="/perfil" element={<Perfil userData={userData} setUserData={setUserData} />} />
        
        {/* Rotas de Nutricionista */}
        <Route path="/planos" element={<Planos/>}/>
        {/* 3. Adicionamos a nova rota para o detalhe do plano */}
        <Route path="/planos/:id" element={<PlanoDetalhes/>}/>
        <Route path="/pacientes" element={<Pacientes/>}/>

        {/* Rotas de Cliente */}
        <Route path="/cliente-dashboard" element={<ClienteDashboard />} />
        <Route path="/compras" element={<Compras />} />
        <Route path="/biblioteca" element={<Biblioteca />} />
        <Route path="/relatorio" element={<Relatorio />} />
        <Route path="/planejamento" element={<Planejamento />} />
        
        {/* Rotas de Mediador */}
        <Route path="/mediador-dashboard" element={<MediadorDashboard />} />
        <Route path="/mediador-pedido-detalhes" element={<MediadorPedidoDetalhes />} />
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