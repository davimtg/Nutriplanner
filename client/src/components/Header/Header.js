import { useState } from "react"; 
import { useNavigate } from "react-router-dom"; 
import styles from "./Header.module.css"; 
import iconDesktop from "../../assets/img/logotipo/icon/nutriplanner-gradient.svg"; 
import icon from "../../assets/img/logotipo/solid/nutriplanner-horizontal-colorido.svg";

export default function Header({ tipo }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  function toggle() {
    setMenuOpen(!menuOpen);
  }

  function goTo(page) {
    navigate(page)
  }

  const menus = {
    cliente: [
      { label: "Dashboard", page: "cliente-dashboard" },
      { label: "Biblioteca", page: "biblioteca" },
      { label: "Planejamento", page: "planejamento" },
      { label: "Relatório", page: "relatorio" },
      { label: "Perfil", page: "perfil" },
    ],
    nutricionista: [
      { label: "Pacientes", page: "pacientes" },
      { label: "Planos", page: "planos" },
      { label: "Perfil", page: "perfil" },
    ],
    mediador: [
      { label: "Pedidos", page: "mediador-dashboard" },
      { label: "Perfil", page: "perfil" },
    ],
    admin: [
      { label: "Usuários", page: "usuarios" },
      { label: "Configurações", page: "configuracoes" },
    ]
  };

  const menuItems = menus[tipo] || [];

  return (
    <>
      <header className={styles.header}>
        <picture className={styles["header-logo__container"]}>
          <source media="(min-width: 887px)" srcSet={iconDesktop} />
          <img
            className={styles["header-logo"]}
            src={icon}
            alt="Logo Nutriplanner"
            onClick={() => navigate("/")}
          />
        </picture>

        <div className={styles["header-toggle-nav"]} onClick={toggle}>
          {/* ícone hamburguer */}
        </div>

        <div className={styles["header-nav"]}>
          {menuItems.map((item) => (
            <div
              key={item.page}
              className={styles["header-item"]}
              onClick={() => goTo(item.page)}
            >
              {item.label}
            </div>
          ))}
        </div>
      </header>

      {/* Menu mobile */}
      {menuOpen && (
        <nav className={styles["nav"]}>
          <div className={`${styles["nav-item"]} ${styles.end}`} onClick={toggle}>
            {/* ícone de fechar */}
          </div>

          {menuItems.map((item) => (
            <div
              key={item.page}
              className={styles["nav-item"]}
              onClick={() => goTo(item.page)}
            >
              <p className={styles["nav-item__text"]}>{item.label}</p>
            </div>
          ))}
        </nav>
      )}
    </>
  );
}
