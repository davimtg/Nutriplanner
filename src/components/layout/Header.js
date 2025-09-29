import React from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';
import './Header.css';

function Header() {
  return (
    <header className="header">
      <div className="header-container">
        {/* Logo real */}
        <Logo 
          variant="claro" 
          showText={true}
          className="header-logo"
        />
      </div>
    </header>
  );
}

export default Header;