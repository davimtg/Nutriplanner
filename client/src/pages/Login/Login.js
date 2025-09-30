import React from 'react';
import styles from "./Login.module.css"
import { Container, Row, Col, Image, Form, Button, ButtonGroup, ToggleButton } from 'react-bootstrap';
import { useState } from 'react';
import logo from '../../assets/img/logotipo/icon/nutriplanner-claro.svg';
import { Link } from 'react-router-dom';

export default function Login(props) {
    const [formData, setFormData] = useState(props.loginData);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        props.setLoginData(formData);
    };
    const handleTypeChange = (newType) => {
        setFormData({
            ...formData,
            userType: newType
        });
    };

    return (
        <Container className={`${styles.Login} py-5`}>
            <Row className={`justify-content-center text-center mb-4 ${styles.LoginHeader}`}>
                <Col xs="auto">
                    <Image src={logo} alt="Logo Nutriplanner" className={`${styles.LoginLogo} mb-3`} />
                </Col>
                <Col xs={12}>
                    <h1 className={styles.LoginTitle}>Nutriplanner</h1>
                    <h2 className={styles.LoginSubtitle}>
                        Conecte-se agora com os maiores nutricionistas do mercado e atinja a saúde dos sonhos.
                    </h2>
                </Col>
            </Row>

            <Row className={`justify-content-center mb-4 ${styles.LoginMulti}`}>
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
                            variant={formData.userType === value ? 'success' : 'outline-success'}
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

            <Row className="justify-content-center">
                <Col xs={12} md={12}>
                    <Form onSubmit={handleSubmit} className={styles.LoginForm}>
                        <Form.Control
                            type="email"
                            name="email"
                            placeholder="E-mail"
                            value={formData.email}
                            onChange={handleChange}
                            className={`mb-3 ${styles.LoginInput}`}
                            required
                        />

                        <Form.Control
                            type="password"
                            name="password"
                            placeholder="Senha"
                            value={formData.password}
                            onChange={handleChange}
                            className={`mb-2 ${styles.LoginInput}`}
                            required
                        />

                        <div className="text-end mb-3">
                            <a href="#" className={styles.LoginResetPassword}>Esqueci minha senha</a>
                        </div>

                        <Button variant="success" type="submit" className={`w-100 ${styles.LoginSubmit}`}>
                            Entrar
                        </Button>
                    </Form>

                    <div className={`${styles.LoginRegister} text-center mt-4`}>
                        <p className={styles.LoginRegisterText}>
                            Não tem uma conta? <Link to="/registrar">Registre-se</Link>
                        </p>
                    </div>
                </Col>
            </Row>
        </Container>
    );
}