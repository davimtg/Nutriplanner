import React, { Component, useState } from 'react';
import './App.css';
import Perfil from "./Pages/Perfil/Perfil.js"
import NutriNavbar from './Pages/NutriNavbar/NutriNavbar.js';
import Login from './Pages/Login/Login.js';
import Register from './Pages/Register/Register.js';


import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Container, Nav, Offcanvas, Button, Form, Row, Col, Image } from 'react-bootstrap';
import Home from './Home';


function App(props) {

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
    const [registerData, setRegisterData] = useState({
        userType: "",
        fullName:"",
        email: "",
        password:"",
        confirmPassword:"",
      });
    console.log(registerData);
return (<>
    <Router>
        <NutriNavbar />
        <Routes>
            <Route path="/login" element={<Login Login loginData={loginData} setLoginData={setLoginData} />} />
            <Route path="/perfil" element={<Perfil userData={userData} setUserData={setUserData} />}/>
            <Route path="/registrar" element={<Register registerData={registerData} setRegisterData={setRegisterData} />}/>
        </Routes>
    </Router >

</>)

}

export default App;

