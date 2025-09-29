import React from 'react';
import { Link } from 'react-router-dom';
import './Logo.css';

// Import das logos reais
import LogoClaro from '../../assets/images/logo/icon/nutriplanner-claro.svg';
import LogoEscuro from '../../assets/images/logo/icon/nutriplanner-escuro.svg';
import LogoGradient from '../../assets/images/logo/icon/nutriplanner-gradient.svg';

function Logo({ variant = 'claro', showText = true, className = '' }) {
  const getLogoSrc = () => {
    switch(variant) {
      case 'claro': return LogoClaro;
      case 'escuro': return LogoEscuro;
      case 'gradient': return LogoGradient;
      default: return LogoClaro;
    }
  };

  const logoSrc = getLogoSrc();

  return (
    <Link to="/" className={`logo ${className}`}>
      <img 
        src={logoSrc} 
        alt="NutriPlanner"
        className="logo-image"
        onError={(e) => {
          // Fallback se a imagem não carregar
          console.log('Logo não carregou, usando fallback');
          e.target.style.display = 'none';
        }}
      />
      {showText && (
        <div className="logo-text">
          <span className="logo-title">NutriPlanner</span>
        </div>
      )}
    </Link>
  );
}

export default Logo;