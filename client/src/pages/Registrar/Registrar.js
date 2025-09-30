import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Image, Form, Button, ButtonGroup, ToggleButton } from 'react-bootstrap';
import logo from '../../assets/img/logotipo/icon/nutriplanner-claro.svg';
import { Link } from 'react-router-dom';
import styles from "./Registrar.module.css"


export default function Registrar(props) {
  const [formData, setFormData] = useState(props.RegistrarData);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTypeChange = (newType) => {
    setFormData((prev) => ({
      ...prev,
      userType: newType
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    props.setRegistrarData(formData);
  };

  return (
    <Container className={`${styles.login} py-5`}>
      <Row className={`${styles.loginHeader} justify-content-center text-center mb-4`}>
        <Col xs="auto">
          <Image
            src={logo}
            alt="Logo Nutriplanner"
            className={`${styles.loginLogo} mb-3`}
          />
        </Col>
        <Col xs={12}>
          <h1 className={styles.loginTitle}>Registre-se em Nutriplanner</h1>
        </Col>
        <Col xs={12}>
          <h2 className={styles.loginSubtitle}>
            Faça seu registro e aprenda com nossos profissionais e colaboradores a ter a saúde perfeita.
          </h2>
        </Col>
      </Row>
      <Row className="justify-content-center mb-4">
        <ButtonGroup>
          {[
            { value: 'cliente', label: 'Cliente' },
            { value: 'nutricionista', label: 'Nutricionista' },
            { value: 'comprador', label: 'Comprador' }
          ].map(({ value, label }) => (
            <ToggleButton
              key={value}
              id={`type-${value}`}
              type="radio"
              variant={
                formData.userType === value
                  ? 'success'
                  : 'outline-success'
              }
              name="userType"
              value={value}
              checked={formData.userType === value}
              onChange={() => handleTypeChange(value)}
            >
              {label}
            </ToggleButton>
          ))}
        </ButtonGroup>
      </Row>

      {/* Formulário de registro */}
      <Row className="justify-content-center">
        <Col xs={12} md={12}>
          <Form onSubmit={handleSubmit} className="login-form">
            <Form.Control
              type="text"
              name="fullName"
              placeholder="Nome Completo"
              value={formData.fullName}
              onChange={handleChange}
              className="mb-3 login-input"
              required
            />

            <Form.Control
              type="email"
              name="email"
              placeholder="Digite seu E-mail"

              onChange={handleChange}
              className="mb-3 login-input"
              required
            />

            <Form.Control
              type="password"
              name="password"
              placeholder="Digite sua Senha"
              value={formData.password}
              onChange={handleChange}
              className="mb-3 login-input"
              required
            />

            <Form.Control
              type="password"
              name="confirmPassword"
              placeholder="Repita Senha"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="mb-3 login-input"
              required
            />

            <Button
              variant="success"
              type="submit"
              className="w-100 login-submit"
            >
              Registrar
            </Button>
          </Form>

          <div className="login-Registrar text-center mt-4">
            <p className="login-Registrar__text">
              Já tem uma conta? <Link to="/login">Faça o login</Link>
            </p>
          </div>
        </Col>
      </Row>
    </Container>
  );
}
