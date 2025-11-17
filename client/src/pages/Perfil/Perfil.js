import profile from '../../assets/img/profilePic/testPng.png';
import styles from './Perfil.module.css';
import { useState } from 'react';
import { Button, Form, Container, Row, Col, Image, Tab, Tabs, Spinner } from 'react-bootstrap';
import { setUserData } from '../../redux/userSlice'
import { useSelector, useDispatch } from 'react-redux';

export default function Perfil() {
  const [editando, setEditando] = useState(false);
  const [loading, setLoading] = useState(false);
  const formData = useSelector((state) => state.user.userData);
  const dispatch = useDispatch();

  const handleClick = async (e) => {
    e.preventDefault();
    if (editando) {
      await handleSubmit(); // salva no backend
    }
    setEditando((prev) => !prev);
  }

const handleChange = (e) => {
  const { name, value } = e.target;

  if (name.startsWith('endereco.')) {
    const campo = name.split('.')[1];

    if (campo === 'cep') {
      const cepLimpo = value.replace(/[^\d]/g, ''); // remove tudo que não for número
      if (cepLimpo.length > 8) return;

      const cepFormatado = cepLimpo.length > 5
        ? cepLimpo.slice(0, 5) + '-' + cepLimpo.slice(5)
        : cepLimpo;

      const enderecoAtualizado = {
        ...formData.endereco,
        [campo]: cepFormatado
      };

      dispatch(setUserData({
        ...formData,
        endereco: enderecoAtualizado
      }));
      return;
    }

    if (campo === 'estado') {
      if (/\d/.test(value)) return;
      if (value.length > 2) return;
    }

    if (campo === 'cidade') {
      if (/\d/.test(value)) return;
    }

    const enderecoAtualizado = {
      ...formData.endereco,
      [campo]: value
    };

    dispatch(setUserData({
      ...formData,
      endereco: enderecoAtualizado
    }));
  } else {
    dispatch(setUserData({
      ...formData,
      [name]: value
    }));
  }
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
      dispatch(setUserData(updatedUser));
      alert('Informações atualizadas com sucesso!');
    } catch (err) {
      console.error(err);
      alert('Falha ao atualizar usuário.');
    } finally {
      setLoading(false);
    }
  };
  console.log(formData);
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
                <Form.Control type="text" name="endereco.rua" value={formData.endereco.rua} onChange={handleChange} disabled={!editando} />
              </Form.Group>
              <Form.Group as={Col} md={2} controlId="numero">
                <Form.Label>Número</Form.Label>
                <Form.Control type="number" name="endereco.numero" value={formData.endereco.numero} onChange={handleChange} disabled={!editando} />
              </Form.Group>
              <Form.Group as={Col} md={4} controlId="bairro">
                <Form.Label>Bairro</Form.Label>
                <Form.Control type="text" name="endereco.bairro" value={formData.endereco.bairro} onChange={handleChange} disabled={!editando} />
              </Form.Group>
            </Row>
            <Row className="mt-3">
              <Form.Group as={Col} md={4} controlId="cidade">
                <Form.Label>Cidade</Form.Label>
                <Form.Control type="text" name="endereco.cidade" value={formData.endereco.cidade} onChange={handleChange} disabled={!editando} />
              </Form.Group>
              <Form.Group as={Col} md={4} controlId="estado">
                <Form.Label>Estado</Form.Label>
                <Form.Control type="text" name="endereco.estado" value={formData.endereco.estado} onChange={handleChange} disabled={!editando} />
              </Form.Group>
              <Form.Group as={Col} md={4} controlId="cep">
                <Form.Label>CEP</Form.Label>
                <Form.Control type="text" name="endereco.cep" value={formData.endereco.cep} onChange={handleChange} disabled={!editando} />
              </Form.Group>
            </Row>
            <Row className="mt-3">
              <Form.Group as={Col} md={12} controlId="complemento">
                <Form.Label>Complemento</Form.Label>
                <Form.Control type="text" name="endereco.complemento" value={formData.endereco.complemento} onChange={handleChange} disabled={!editando} />
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
