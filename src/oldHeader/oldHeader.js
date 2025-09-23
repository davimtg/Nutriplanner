import './header.css';
import logoVertical from '../images/logotipo/gradient/nutriplanner-vertical-gradient.svg';
import logoIcon from '../images/logotipo/icon/nutriplanner-gradient.svg';
import { Button, Form, Container, Row, Col, Image, Navbar} from 'react-bootstrap';

export default function oldHeader() {
  const toggle = () => {
    // lógica para abrir/fechar menu
    console.log('Toggle menu');
  };

  const to = (url) => {
    window.location.href = url;
  };

  return (
    <>
      <Navbar>
        <div className="header-logo">
          <img src={logoVertical} alt="Logo Nutriplanner" className="header-logo-img" />
          <img src={logoIcon} alt="Nutriplanner" className="header-text-img" />
        </div>

        <div className="header-toggle-nav" onClick={toggle}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className="lucide lucide-ellipsis-vertical-icon lucide-ellipsis-vertical">
            <circle cx="12" cy="12" r="1" />
            <circle cx="12" cy="5" r="1" />
            <circle cx="12" cy="19" r="1" />
          </svg>
        </div>

        <div className="header-nav">
          {[
            { label: 'Dashboard', url: 'cliente-dashboard.html' },
            { label: 'Receitas', url: 'receitas.html' },
            { label: 'Planejamento', url: 'planejamento.html' },
            { label: 'Relatório', url: 'relatorio.html' },
            { label: 'Compras', url: 'compras.html' },
            { label: 'Nutricionista', url: 'nutricionista.html' },
            { label: 'Perfil', url: 'cliente-perfil.html' },
          ].map((item) => (
            <div key={item.label} className="header-item" onClick={() => to(item.url)}>
              {item.label}
            </div>
          ))}
        </div>
      </Navbar>

      <nav className="nav">
        <div className="nav-item end">
          <svg onClick={toggle} xmlns="http://www.w3.org/2000/svg" width="24" height="24"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x-icon lucide-x icon">
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </div>

        {/* Repetindo os itens com ícones */}
        {[
          { label: 'Dashboard', url: 'client-dashboard.html', icon: 'layout-dashboard' },
          { label: 'Receitas', url: 'receitas.html', icon: 'apple' },
          { label: 'Planejamento', url: 'planejamento.html', icon: 'calendar' },
          { label: 'Relatório', url: 'relatorio.html', icon: 'chart-no-axes-gantt' },
          { label: 'Compras', url: 'compras.html', icon: 'shopping-cart' },
          { label: 'Nutricionistas', url: 'nutricionista.html', icon: 'leaf' },
          { label: 'Perfil', url: 'cliente-perfil.html', icon: 'user' },
        ].map((item) => (
          <div key={item.label} className="nav-item" onClick={() => to(item.url)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round"
              className={`lucide lucide-${item.icon}-icon lucide-${item.icon} icon`}>
              {/* Aqui você pode usar <path> ou <rect> conforme o ícone */}
              {/* Ou substituir por componentes SVG importados */}
            </svg>
            <p className="nav-item__text">{item.label}</p>
          </div>
        ))}
      </nav>
    </>
  );
}
