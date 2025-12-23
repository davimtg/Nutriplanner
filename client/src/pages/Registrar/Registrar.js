import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUserType, setUserData } from "../../redux/userSlice";
import api from "../../services/api";
import styles from "./Registrar.module.css";
import icon from "../../assets/img/logotipo/icon/nutriplanner-gradient.svg";

export default function Registrar() {
  const [selectedType, setSelectedType] = useState("cliente");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmSenha, setConfirmSenha] = useState("");

  const navigate = useNavigate();
  const dispatch = useDispatch();

  function irParaLogin() {
    navigate("/login");
  }

  async function handleRegister() {
    if (!nome || !email || !senha || !confirmSenha) {
      alert("Preencha todos os campos.");
      return;
    }

    if (senha !== confirmSenha) {
      alert("As senhas não coincidem.");
      return;
    }

    try {
      const { data } = await api.post("/auth/register", {
        nome,
        email,
        senha,
        tipo: selectedType, // Backend vai mapear string para objeto
      });

      const { user, token } = data;

      // Salvar token
      localStorage.setItem("token", token);

      // Atualizar Redux e localStorage (via userSlice)
      dispatch(setUserType(user.tipo));
      dispatch(setUserData(user));

      alert("Registro realizado com sucesso!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Erro no registro:", error);
      const msg = error.response?.data?.message || "Erro ao tentar registrar.";
      alert(msg);
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
        <h1 className={styles["login-title"]}>Registre-se em Nutriplanner</h1>
        <h2 className={styles["login-subtitle"]}>
          Faça seu registro e aprenda com nossos profissionais e colaboradores
          a ter a saúde perfeita.
        </h2>
      </div>

      <div className={styles["login-multi"]}>
        {["cliente", "nutricionista", "mediador"].map((type, idx, arr) => (
          <div
            key={type}
            className={`
              ${styles["login-multi__button"]}
              ${selectedType === type ? styles.selected : ""}
              ${idx === 0 ? styles.start : idx === arr.length - 1 ? styles.end : ""}
            `}
            onClick={() => setSelectedType(type)}
          >
            <p className={styles["login-multi__button-text"]}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </p>
          </div>
        ))}
      </div>

      <div className={styles["login-form"]}>
        <input
          type="text"
          className={styles["login-input"]}
          placeholder="Nome Completo"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />
        <input
          type="text"
          className={styles["login-input"]}
          placeholder="Digite seu E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          className={styles["login-input"]}
          placeholder="Digite sua Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />
        <input
          type="password"
          className={styles["login-input"]}
          placeholder="Repita Senha"
          value={confirmSenha}
          onChange={(e) => setConfirmSenha(e.target.value)}
        />
        <button className={styles["login-submit"]} onClick={handleRegister}>Registrar</button>
      </div>

      <div className={styles["login-register"]}>
        <p className={styles["login-register__text"]}>
          Já tem uma conta? <a href="/login">Faça o login.</a>
        </p>
      </div>
    </div>
  );
}
