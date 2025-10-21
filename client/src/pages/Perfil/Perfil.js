import profile from '../../assets/img/profilePic/testPng.png';
import styles from './Perfil.module.css';
import { useState } from 'react';
import { Button, Form, Container, Row, Col, Image, Tab, Tabs, Spinner } from 'react-bootstrap';

export default function Perfil(props) {
  const [editando, setEditando] = useState(false);
  const [formData, setFormData] = useState({
    nome: props.userData.nome || "",
    email: props.userData.email || "",
    senha: props.userData.senha || "",
    idade: props.userData.idade || "",
    sexo: props.userData.sexo || "",
    rua: props.userData.rua || "",
    numero: props.userData.numero || "",
    bairro: props.userData.bairro || "",
    cidade: props.userData.cidade || "",
    estado: props.userData.estado || "",
    cep: props.userData.cep || "",
    complemento: props.userData.complemento || "",
    altura: props.userData.altura || "",
    peso: props.userData.peso || "",
    objetivo: props.userData.objetivo || "",
    planoId: props.userData.planoId || "",
    id: props.userData.id
  });
  const [loading, setLoading] = useState(false);

  const handleClick = async (e) => {
    e.preventDefault();
    if (editando) {
      await handleSubmit(); // salva no backend
    }
    setEditando((prev) => !prev);
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3001/usuarios/lista-de-usuarios/${formData.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error('Erro ao atualizar usuário');

      const updatedUser = await res.json();
      props.setUserData(updatedUser);
      alert('Informações atualizadas com sucesso!');
    } catch (err) {
      console.error(err);
      alert('Falha ao atualizar usuário.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-4">
      <Row className="align-items-center mb-4">
        <Col xs={12} md={4} className="d-flex justify-content-center">
          <Image src={profile} roundedCircle width={150} height={150} />
        </Col>
        <Col xs={12} md={8} className="d-flex flex-column justify-content-center align-items-center">
          <h2 className={styles.nomeUsuario}>{formData.nome}</h2>
          <Button 
            variant={editando ? "success" : "primary"} 
            onClick={handleClick} 
            className="mt-2" 
            disabled={loading}
          >
            {loading ? <Spinner animation="border" size="sm" /> : editando ? 'Salvar Configurações' : 'Alterar Configurações'}
          </Button>
        </Col>
      </Row>

      <Tabs defaultActiveKey="basicas" id="perfil-tabs" className="mb-3">
        {/* Informações básicas */}
        <Tab eventKey="basicas" title="Informações básicas">
          <Form>
            <Row className="mt-3">
              <Form.Group as={Col} md={6} controlId="nome">
                <Form.Label>Nome</Form.Label>
                <Form.Control type="text" name="nome" value={formData.nome} onChange={handleChange} disabled={!editando} />
              </Form.Group>
              <Form.Group as={Col} md={6} controlId="email">
                <Form.Label>Email</Form.Label>
                <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} disabled={!editando} />
              </Form.Group>
            </Row>
            <Row className="mt-3">
              <Form.Group as={Col} md={6} controlId="senha">
                <Form.Label>Senha</Form.Label>
                <Form.Control type="password" name="senha" value={formData.senha} onChange={handleChange} disabled={!editando} />
              </Form.Group>
              <Form.Group as={Col} md={3} controlId="idade">
                <Form.Label>Idade</Form.Label>
                <Form.Control type="number" min="0" max="200" name="idade" value={formData.idade} onChange={handleChange} disabled={!editando} />
              </Form.Group>
              <Form.Group as={Col} md={3} controlId="sexo">
                <Form.Label>Sexo</Form.Label>
                <Form.Select name="sexo" value={formData.sexo} onChange={handleChange} disabled={!editando}>
                  <option value="">Selecione</option>
                  <option value="masculino">Masculino</option>
                  <option value="feminino">Feminino</option>
                  <option value="outro">Outro</option>
                </Form.Select>
              </Form.Group>
            </Row>
          </Form>
        </Tab>

        {/* Endereço */}
        <Tab eventKey="endereco" title="Endereço">
          <Form>
            <Row className="mt-3">
              <Form.Group as={Col} md={6} controlId="rua">
                <Form.Label>Rua</Form.Label>
                <Form.Control type="text" name="rua" value={formData.rua} onChange={handleChange} disabled={!editando} />
              </Form.Group>
              <Form.Group as={Col} md={2} controlId="numero">
                <Form.Label>Número</Form.Label>
                <Form.Control type="number" name="numero" value={formData.numero} onChange={handleChange} disabled={!editando} />
              </Form.Group>
              <Form.Group as={Col} md={4} controlId="bairro">
                <Form.Label>Bairro</Form.Label>
                <Form.Control type="text" name="bairro" value={formData.bairro} onChange={handleChange} disabled={!editando} />
              </Form.Group>
            </Row>
            <Row className="mt-3">
              <Form.Group as={Col} md={4} controlId="cidade">
                <Form.Label>Cidade</Form.Label>
                <Form.Control type="text" name="cidade" value={formData.cidade} onChange={handleChange} disabled={!editando} />
              </Form.Group>
              <Form.Group as={Col} md={4} controlId="estado">
                <Form.Label>Estado</Form.Label>
                <Form.Control type="text" name="estado" value={formData.estado} onChange={handleChange} disabled={!editando} />
              </Form.Group>
              <Form.Group as={Col} md={4} controlId="cep">
                <Form.Label>CEP</Form.Label>
                <Form.Control type="text" name="cep" value={formData.cep} onChange={handleChange} disabled={!editando} />
              </Form.Group>
            </Row>
            <Row className="mt-3">
              <Form.Group as={Col} md={12} controlId="complemento">
                <Form.Label>Complemento</Form.Label>
                <Form.Control type="text" name="complemento" value={formData.complemento} onChange={handleChange} disabled={!editando} />
              </Form.Group>
            </Row>
          </Form>
        </Tab>

        {/* Informações nutricionais */}
        <Tab eventKey="nutricionais" title="Informações nutricionais">
          <Form>
            <Row className="mt-3">
              <Form.Group as={Col} md={4} controlId="altura">
                <Form.Label>Altura (cm)</Form.Label>
                <Form.Control type="number" name="altura" value={formData.altura} onChange={handleChange} disabled={!editando} />
              </Form.Group>
              <Form.Group as={Col} md={4} controlId="peso">
                <Form.Label>Peso (kg)</Form.Label>
                <Form.Control type="number" name="peso" value={formData.peso} onChange={handleChange} disabled={!editando} />
              </Form.Group>
              <Form.Group as={Col} md={4} controlId="objetivo">
                <Form.Label>Objetivo</Form.Label>
                <Form.Control type="text" name="objetivo" value={formData.objetivo} onChange={handleChange} disabled={!editando} />
              </Form.Group>
            </Row>
            <Row className="mt-3">
              <Form.Group as={Col} md={6} controlId="planoId">
                <Form.Label>Plano</Form.Label>
                <Form.Control type="text" name="planoId" value={formData.planoId} onChange={handleChange} disabled={!editando} />
              </Form.Group>
            </Row>
          </Form>
        </Tab>
      </Tabs>
    </Container>
  );
}
