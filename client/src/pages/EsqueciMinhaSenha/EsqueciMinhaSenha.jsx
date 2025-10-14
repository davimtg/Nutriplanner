import { useState } from "react";
import styles from "./EsqueciMinhaSenha.module.css";
import icon from "../../assets/img/logotipo/icon/nutriplanner-gradient.svg";
import { Modal, Button } from "react-bootstrap";

export default function EsqueciSenha() {
  const [email, setEmail] = useState("");
  const [showModal, setShowModal] = useState(false);

  const enviar = (e) => {
    e.preventDefault();
    setShowModal(true); // mostra o modal
  };

  const handleClose = () => setShowModal(false);

  return (
    <div className={styles["login"]}>
      <div className={styles["login-header"]}>
        <img
          className={styles["login-logo"]}
          src={icon}
          alt="Logo Nutriplanner"
        />
        <h1 className={styles["login-title"]}>Esqueci minha senha</h1>
        <h2 className={styles["login-subtitle"]}>
          Insira seu e-mail abaixo para receber um link de redefinição de senha.
        </h2>
      </div>

      <div className={styles["login-form"]}>
        <input
          type="email"
          className={styles["login-input"]}
          placeholder="Seu e-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button className={styles["login-submit"]} onClick={enviar}>
          Enviar link
        </button>
      </div>

      <div className={styles["login-register"]}>
        <p className={styles["login-register__text"]}>
          Lembrou sua senha? <a href="/login">Faça login.</a>
        </p>
      </div>

      {/* Modal Bootstrap */}
      <Modal show={showModal} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Link de redefinição enviado</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Um link de redefinição de senha foi enviado para <b>{email}</b>.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="success" onClick={handleClose}>
            Fechar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
