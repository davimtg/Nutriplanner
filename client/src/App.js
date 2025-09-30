import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/Header/Header";
import Login from "./pages/Login/Login";
import Registrar from "./pages/Registrar/Registrar";
import DashboardNutricionista from "./pages/DashboardNutricionista/DashboardNutricionista";
import Perfil from "./pages/Perfil/Perfil";
import ClienteDashboard from "./pages/ClienteDashboard/ClienteDashboard";
import Chat from "./components/Chat/Chat"

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

  const [pacientes, setPacientes] = useState([
    { id: 1, nome: 'João da Silva', objetivo: 'Perda de peso' },
    { id: 2, nome: 'Maria Oliveira', objetivo: 'Controle de diabetes' },
    { id: 3, nome: 'Carlos Pereira', objetivo: 'Ganho de massa muscular' },
    { id: 4, nome: 'Ana Souza', objetivo: 'Reeducação alimentar' },
  ]);

  const [planos, setPlanos] = useState([
    { id: 1, nome: 'Hipertrofia Muscular', objetivo: 'Ganho de massa' },
    { id: 2, nome: 'Dieta Mediterrânea', objetivo: 'Saúde e longevidade' },
    { id: 3, nome: 'Low Carb Equilibrado', objetivo: 'Perda de peso' },
    { id: 4, nome: 'Dieta Vegana para Atletas', objetivo: 'Performance' },
    { id: 5, nome: 'Reeducação Alimentar', objetivo: 'Saúde geral' },
  ]);

  const hideHeaderRoutes = ["/", "/login", "/registrar"];
  const showHeader = !hideHeaderRoutes.includes(location.pathname);

  return (
    <>
      {showHeader && <Chat userData={userData} setUserData={setUserData}/>}
      {showHeader && <Header />}

      <Routes>
        <Route
          path="/"
          element={<Login loginData={loginData} setLoginData={setLoginData} />}
        />
        <Route
          path="/login"
          element={<Login loginData={loginData} setLoginData={setLoginData} />}
        />
        <Route
          path="/registrar"
          element={
            <Registrar
              RegistrarData={RegistrarData}
              setRegistrarData={setRegistrarData}
            />
          }
        />
        <Route
          path="/perfil"
          element={<Perfil userData={userData} setUserData={setUserData} />}
        />
        <Route
          path="/nutricionista-dashboard"
          element={<DashboardNutricionista planos={planos} pacientes={pacientes} />}
        />
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registrar" element={<Registrar />} />
        <Route path="/cliente-dashboard" element={<ClienteDashboard />} />
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