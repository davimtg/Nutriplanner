import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUserType, setUserData } from "../../redux/userSlice";
import styles from "./Login.module.css";
import icon from "../../assets/img/logotipo/icon/nutriplanner-gradient.svg";

export default function Login() {
  const userTypes = [
    { id: 0, name: "admin" },
    { id: 1, name: "cliente" },
    { id: 2, name: "nutricionista" },
    { id: 3, name: "mediador" },
  ];

  const [selectedType, setSelectedType] = useState(userTypes[1]);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  async function entrar() {
  try {
    const res = await fetch("http://localhost:3001/usuarios");
    if (!res.ok) throw new Error("Falha ao conectar ao servidor");

    const data = await res.json();

    // pega a lista de usuários, evitando undefined
    const usuarios = data?.["lista-de-usuarios"] || [];

    // procura o usuário com email e senha
    console.log(usuarios);

    const user = usuarios.find(u => u.email === email && u.senha === senha);

    if (!user) {
      alert("Usuário ou senha incorretos.");
      return;
    }

    // salva no Redux
    dispatch(setUserType(user.tipo));
    dispatch(setUserData(user));

    navigate("/dashboard");
  } catch (error) {
    console.error("Erro no login:", error);
    alert("Erro ao tentar fazer login. Verifique a conexão com o servidor.");
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
        {userTypes
          .filter((type) => type.name !== "admin")
          .map((type, idx, arr) => (
            <div
              key={type.id}
              className={`
                ${styles["login-multi__button"]}
                ${selectedType.id === type.id ? styles.selected : ""}
                ${idx === 0 ? styles.start : idx === arr.length - 1 ? styles.end : ""}
              `}
              onClick={() => setSelectedType(type)}
            >
              <p className={styles["login-multi__button-text"]}>
                {type.name.charAt(0).toUpperCase() + type.name.slice(1)}
              </p>
            </div>
          ))}
      </div>

      <div className={styles["login-form"]}>
        <input
          type="text"
          className={styles["login-input"]}
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          className={styles["login-input"]}
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />
        <a
          className={styles["login-reset-password"]}
          href="/esqueci-minha-senha"
        >
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
