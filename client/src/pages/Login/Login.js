import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Login.module.css";
import icon from "../../assets/img/logotipo/icon/nutriplanner-gradient.svg";

export default function Login() {
  const [userType, setUserType] = useState("cliente");
  const navigate = useNavigate();

  function entrar() {
  if (userType === "nutricionista") {
    navigate("/pacientes");
  } else {
    navigate(`/${userType}-dashboard`);
  }
}

  return (
    <div className={styles["login"]}>
      <div className={styles["login-header"]}>
        <img
          className={styles["login-logo"]}
          src={icon}
          alt="Logo Nutriplanner"
        />
        <h1 className={styles["login-title"]}>Login em Nutriplanner</h1>
        <h2 className={styles["login-subtitle"]}>
          Conecte-se agora com os maiores nutricionistas do mercado e atinja a
          saúde dos sonhos.
        </h2>
      </div>

      <div className={styles["login-multi"]}>
        {["cliente", "nutricionista", "mediador"].map((type, idx, arr) => (
          <div
            key={type}
            className={`
              ${styles["login-multi__button"]}
              ${userType === type ? styles.selected : ""}
              ${idx === 0 ? styles.start : idx === arr.length - 1 ? styles.end : ""}
            `}
            onClick={() => setUserType(type)}
          >
            <p className={styles["login-multi__button-text"]}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </p>
          </div>
        ))}
      </div>

      <div className={styles["login-form"]}>
        <input type="text" className={styles["login-input"]} placeholder="E-mail" />
        <input type="password" className={styles["login-input"]} placeholder="Senha" />
        <a className={styles["login-reset-password"]} href="/esqueci-minha-senha">
          Esqueci minha senha
        </a>
        <button className={styles["login-submit"]} onClick={entrar}>
          Entrar
        </button>
      </div>

      <div className={styles["login-register"]}>
        <p className={styles["login-register__text"]}>
          Não tem uma conta? <a href="/registrar">Registre-se.</a>
        </p>
      </div>
    </div>
  );
}
