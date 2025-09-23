import profile from '../../images/profilePic/testPng.png';
import './Perfil.css';
import { useState } from 'react';
import { Button, Form, Container, Row, Col, Image } from 'react-bootstrap';



export default function Perfil(props) {


  const [editando, setEditando] = useState(false);
  const [formData, setFormData] = useState(props.userData);

  const handleClick = (e) => {
    setEditando((prev) => !prev)
    handleSubmit(e);

  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    props.setUserData(formData);

  };

  return (
    <Container>
      <Row className="align-items-center">
        <Col xs={12} md={4} className=" mt-4 mb-2 d-flex justify-content-center">
          <Image src={profile} roundedCircle />
        </Col>
        <Col xs={12} md={8} className=" mb-1 d-flex justify-content-center">
          <Row className="nomeUsuario"><h1>{props.userData.nome}</h1></Row>
        </Col>
      </Row>
      <Row>
        <Button variant="success" type="submit" onClick={handleClick}>
          {editando ? 'Salvar Configurações' : 'Alterar Configurações'}
        </Button>
      </Row>
      <Row>
        <fieldset disabled={!editando} >
          <Form>
            <Row>
              <Form.Group as={Col}>
                <Form.Label>Nome</Form.Label>
                <Form.Control type="text" name="nome" value={formData.nome}
                  onChange={handleChange}
                  onFocus={() => setFormData((prev) => ({ ...prev, nome: '' }))}
                  isInvalid={!formData.nome.trim()} />
                <Form.Control.Feedback type="invalid">
                  Por favor digite um nome
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group as={Col} xs={4} md={4} controlId="formBasicPassword">
                <Form.Label>Senha
                </Form.Label>
                <Form.Control type="password" name="senha" placeholder="******"
                  onChange={handleChange}
                  onFocus={() => setFormData((prev) => ({ ...prev, senha: '' }))}
                  isInvalid={!formData.nome.trim()} />
                <Form.Control.Feedback type="invalid">
                  Por favor digite uma senha
                </Form.Control.Feedback>
              </Form.Group>
            </Row>
            <Row>

              <Form.Group as={Col} xs={9} md={9} controlId="formBasicEmail">
                <Form.Label>Email
                </Form.Label>
                <Form.Control type="email" name="email" value={formData.email}
                  onChange={handleChange}
                  onFocus={() => setFormData((prev) => ({ ...prev, email: '' }))} />
              </Form.Group>
              <Form.Group as={Col} xs={3} md={3}>
                <Form.Label>Idade
                </Form.Label>
                <Form.Control type="number" min="0" max="200" name="idade" value={formData.idade}
                  onFocus={() => setFormData((prev) => ({ ...prev, idade: '' }))}
                  onChange={handleChange} />
              </Form.Group>

            </Row>
            <Row>
              <Form.Group as={Col} xs={4} md={4} style={{ minWidth: '120px' }}>
                <Form.Label>Cep</Form.Label>
                <Form.Control type="text" name="cep" value={formData.cep}
                  onChange={handleChange}
                  onFocus={() => setFormData((prev) => ({ ...prev, cep: '' }))} />
              </Form.Group>
              <Form.Group as={Col} xs={2} md={2}>
                <Form.Label>Estado</Form.Label>
                <Form.Control type="text" name="estado" value={formData.estado}
                  onChange={handleChange}
                  onFocus={() => setFormData((prev) => ({ ...prev, estado: '' }))} />
              </Form.Group>
              <Form.Group as={Col} xs={2} md={2}><Form.Label>Numero</Form.Label>
                <Form.Control type="number" name="numero" value={formData.numero}
                  onChange={handleChange}
                  onFocus={() => setFormData((prev) => ({ ...prev, numero: '' }))} />
              </Form.Group>
              <Form.Group as={Col} xs={4} md={4}><Form.Label>Cidade</Form.Label>
                <Form.Control type="text" name="cidade" value={formData.cidade}
                  onChange={handleChange}
                  onFocus={() => setFormData((prev) => ({ ...prev, cidade: '' }))} />
              </Form.Group>
              <Form.Group as={Col} xs={12} md={6}><Form.Label>Rua</Form.Label>
                <Form.Control type="text" name="rua" value={formData.rua}
                  onChange={handleChange}
                  onFocus={() => setFormData((prev) => ({ ...prev, rua: '' }))} />
              </Form.Group>

              <Form.Group as={Col} xs={12} md={6}><Form.Label>Bairro</Form.Label>
                <Form.Control type="text" name="bairro" value={formData.bairro}
                  onChange={handleChange}
                  onFocus={() => setFormData((prev) => ({ ...prev, bairro: '' }))} />
              </Form.Group>
            </Row>
            <Row>
              <Col><Form.Label>Complemento</Form.Label>
                <Form.Control type="text" name="complemento" placeholder={formData.complemento}
                  onChange={handleChange}
                  onFocus={() => setFormData((prev) => ({ ...prev, complemento: '' }))} />
              </Col>
            </Row>


          </Form>
        </fieldset >
      </Row >
    </Container >
  );
}

