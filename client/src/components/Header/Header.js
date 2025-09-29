import { useState } from "react";
import styles from "./Header.module.css";
import iconDesktop from "../../assets/img/logotipo/icon/nutriplanner-gradient.svg";
import icon from "../../assets/img/logotipo/solid/nutriplanner-horizontal-colorido.svg";


export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  function toggle() {
    setMenuOpen(!menuOpen);
  }

  function goTo(page) {
    window.location.href = page;
  }

  return (
    <>
      <header className={styles.header}>
        <picture className={styles["header-logo__container"]}>
          <source media="(min-width: 887px)" srcSet={iconDesktop} />
          <img
            className={styles["header-logo"]}
            src={icon}
            alt="Logo Nutriplanner"
          />
        </picture>


        <div className={styles["header-toggle-nav"]} onClick={toggle}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={styles["icon"]}
          >
            <circle cx="12" cy="12" r="1" />
            <circle cx="12" cy="5" r="1" />
            <circle cx="12" cy="19" r="1" />
          </svg>
        </div>

        <div className={styles["header-nav"]}>
          <div className={styles["header-item"]} onClick={() => goTo("cliente-dashboard")}>
            Dashboard
          </div>
          <div className={styles["header-item"]} onClick={() => goTo("receitas")}>
            Receitas
          </div>
          <div className={styles["header-item"]} onClick={() => goTo("planejamento")}>
            Planejamento
          </div>
          <div className={styles["header-item"]} onClick={() => goTo("relatorio")}>
            Relatório
          </div>
          <div className={styles["header-item"]} onClick={() => goTo("compras")}>
            Compras
          </div>
          <div className={styles["header-item"]} onClick={() => goTo("nutricionista")}>
            Nutricionista
          </div>
          <div className={styles["header-item"]} onClick={() => goTo("cliente-perfil")}>
            Perfil
          </div>
        </div>
      </header>

      {menuOpen && (
        <nav className={styles["nav"]}>
          <div className={`${styles["nav-item"]} ${styles.end}`} onClick={toggle}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={styles["icon"]}
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </div>

          <div className={styles["nav-item"]} onClick={() => goTo("cliente-dashboard")}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles["icon"]}><rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" /></svg>
            <p className={styles["nav-item__text"]}>Dashboard</p>
          </div>
          <div className={styles["nav-item"]} onClick={() => goTo("receitas")}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles["icon"]}><path d="M12 6.528V3a1 1 0 0 1 1-1h0" /><path d="M18.237 21A15 15 0 0 0 22 11a6 6 0 0 0-10-4.472A6 6 0 0 0 2 11a15.1 15.1 0 0 0 3.763 10 3 3 0 0 0 3.648.648 5.5 5.5 0 0 1 5.178 0A3 3 0 0 0 18.237 21" /></svg>
            <p className={styles["nav-item__text"]}>Receitas</p>
          </div>
          <div className={styles["nav-item"]} onClick={() => goTo("planejamento")}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles["icon"]}><path d="M8 2v4" /><path d="M16 2v4" /><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M3 10h18" /></svg>
            <p className={styles["nav-item__text"]}>Planejamento</p>
          </div>
          <div className={styles["nav-item"]} onClick={() => goTo("relatorio")}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles["icon"]}><path d="M6 5h12" /><path d="M4 12h10" /><path d="M12 19h8" /></svg>
            <p className={styles["nav-item__text"]}>Relatório</p>
          </div>
          <div className={styles["nav-item"]} onClick={() => goTo("compras")}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles["icon"]}><circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" /></svg>
            <p className={styles["nav-item__text"]}>Compras</p>
          </div>
          <div className={styles["nav-item"]} onClick={() => goTo("nutricionista")}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles["icon"]}><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" /><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" /></svg>
            <p className={styles["nav-item__text"]}>Nutricionistas</p>
          </div>
          <div className={styles["nav-item"]} onClick={() => goTo("cliente-perfil")}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles["icon"]}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
            <p className={styles["nav-item__text"]}>Perfil</p>
          </div>
        </nav>
      )}
    </>
  );
}
