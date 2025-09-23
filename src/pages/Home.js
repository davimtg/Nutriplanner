import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/layout/Logo';
import './Home.css';

function Home() {
  return (
    <div className="home-page">
      <div className="container">
        <div className="hero-section">
          {/* Logo principal da home - versão gradient com texto */}
          <div className="hero-logo">
            <Logo 
              variant="gradient" 
              showText={true}
              className="hero-logo-item"
            />
          </div>
          
          <h1 className="hero-title">NutriPlanner Professional</h1>
          <p className="hero-subtitle">Sistema completo para gestão de saúde e nutrição</p>
          
          <div className="cta-buttons">
            <Link to="/mediador" className="btn btn-primary">
              Acessar Área do Mediador
            </Link>
            <Link to="/receitas" className="btn btn-secondary">
              Explorar Receitas
            </Link>
          </div>
        </div>

        {/* Seção de características */}
        <div className="features-section">
          <h2>Por que escolher o NutriPlanner?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Planejamento Inteligente</h3>
              <p>Planos alimentares personalizados baseados em suas metas e preferências</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🛒</div>
              <h3>Compras Assistidas</h3>
              <p>Mediador especializado para facilitar suas compras de alimentos</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">👩‍⚕️</div>
              <h3>Acompanhamento Profissional</h3>
              <p>Suporte nutricional completo para sua jornada saudável</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;