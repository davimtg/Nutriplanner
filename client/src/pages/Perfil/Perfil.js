import profile from '../../assets/img/profilePic/testPng.png';
import styles from './Perfil.module.css';
import { useState, useEffect } from 'react';
import { Button, Form, Container, Row, Col, Image, Tab, Tabs, Spinner, Alert, Card, Modal } from 'react-bootstrap';
import { setUserData, updateUserById, fetchUserById } from '../../redux/userSlice'
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { clearUser } from '../../redux/userSlice';
import api from '../../services/api';

export default function Perfil() {
  const [editando, setEditando] = useState(false);
  const [novaSenha, setNovaSenha] = useState('');
  const [loadingLocal, setLoadingLocal] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const formData = useSelector((state) => state.user.userData);
  const loadingRedux = useSelector((state) => state.user.loading);
  const loading = loadingLocal || loadingRedux;

  // states p nutris
  const [nutricionistas, setNutricionistas] = useState([]);
  const [selectedNutriId, setSelectedNutriId] = useState("");

  // states de enderecos
  const [novoEndereco, setNovoEndereco] = useState({ apelido: '', rua: '', numero: '', bairro: '', cidade: '', estado: '', cep: '', complemento: '' });
  const [showModalEndereco, setShowModalEndereco] = useState(false);
  const [editingAddressIndex, setEditingAddressIndex] = useState(-1); // -1 = criando novo

  useEffect(() => {
    if (formData?.id) {
      dispatch(fetchUserById(formData.id));
    }
  }, [dispatch, formData?.id]);

  useEffect(() => {
    // carrega nutris
    const loadNutris = async () => {
      try {
        const usersRes = await api.get("/usuarios");
        const nutris = usersRes.data.filter(u => u.tipo?.name?.toLowerCase() === 'nutricionista');
        setNutricionistas(nutris);
      } catch (error) {
        console.error("Erro ao carregar nutricionistas:", error);
      }
    };
    loadNutris();
  }, []);

  useEffect(() => {
    if (formData?.nutricionistaId) {
      setSelectedNutriId(formData.nutricionistaId);
    }
  }, [formData]);

  const handleClick = async (e) => {
    e.preventDefault();
    if (editando) {
      await handleSubmit(); // salva no backend
    }
    setEditando((prev) => !prev);
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    dispatch(clearUser());
    navigate('/login');
  };

  const formatCEP = (value) => {
    const cepLimpo = value.replace(/[^\d]/g, '');
    if (cepLimpo.length > 8) return value.slice(0, 9);
    return cepLimpo.length > 5
      ? cepLimpo.slice(0, 5) + '-' + cepLimpo.slice(5)
      : cepLimpo;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith('endereco.')) {
      const campo = name.split('.')[1];
      const enderecoAtual = formData.endereco || {};

      if (campo === 'cep') {
        const formatted = formatCEP(value);
        if (formatted.length > 9) return;
        dispatch(setUserData({
          ...formData,
          endereco: { ...enderecoAtual, [campo]: formatted }
        }));
        return;
      }

      if ((campo === 'estado' || campo === 'cidade') && /\d/.test(value)) return;
      if (campo === 'estado' && value.length > 2) return;

      dispatch(setUserData({
        ...formData,
        endereco: { ...enderecoAtual, [campo]: value }
      }));
    } else {
      dispatch(setUserData({
        ...formData,
        [name]: value
      }));
    }
  };

  const handleSubmit = async () => {
    setLoadingLocal(true);
    try {
      const payload = { ...formData };
      delete payload.senha; // Remove hash atual

      if (novaSenha && novaSenha.trim() !== '') {
        payload.senha = novaSenha;
      }

      await dispatch(updateUserById(payload)).unwrap();
      alert('Informações atualizadas com sucesso!');
      setNovaSenha('');
    } catch (err) {
      console.error(err);
      alert('Falha ao atualizar usuário.');
    } finally {
      setLoadingLocal(false);
    }
  };

  const handleSaveNutri = async () => {
    if (!formData) return;
    setLoadingLocal(true);
    try {
      const payload = { ...formData, nutricionistaId: Number(selectedNutriId) };
      delete payload.senha; // Segurança

      await dispatch(updateUserById(payload)).unwrap();
      alert("Nutricionista definido com sucesso!");
    } catch (err) {
      console.error(err);
      alert("Erro ao definir nutricionista.");
    } finally {
      setLoadingLocal(false);
    }
  };

  // --- gestao de enderecos ---
  const handleOpenAddModal = () => {
    setNovoEndereco({ apelido: '', rua: '', numero: '', bairro: '', cidade: '', estado: '', cep: '', complemento: '' });
    setEditingAddressIndex(-1);
    setShowModalEndereco(true);
  }

  const handleEditEndereco = (index) => {
    const enderecosAtuais = formData.enderecos || [];
    if (enderecosAtuais[index]) {
      setNovoEndereco(enderecosAtuais[index]);
      setEditingAddressIndex(index);
      setShowModalEndereco(true);
    }
  }

  const handleSaveEndereco = () => {
    if (!novoEndereco.apelido || !novoEndereco.rua) {
      alert("Preencha pelo menos Apelido e Rua.");
      return;
    }

    const enderecosAtuais = formData.enderecos ? [...formData.enderecos] : [];
    if (enderecosAtuais.length === 0 && formData.endereco && formData.endereco.rua) {
      enderecosAtuais.push({ ...formData.endereco, apelido: 'Principal (Antigo)' });
    }

    if (editingAddressIndex >= 0) {
      enderecosAtuais[editingAddressIndex] = novoEndereco;
    } else {
      enderecosAtuais.push(novoEndereco);
    }

    dispatch(setUserData({ ...formData, enderecos: enderecosAtuais }));
    setShowModalEndereco(false);
    if (!editando) setEditando(true); // Ativa salvar p persistir
  };

  const handleRemoveEndereco = (index) => {
    if (!window.confirm("Remover este endereço?")) return;
    const novaLista = (formData.enderecos || []).filter((_, i) => i !== index);
    dispatch(setUserData({ ...formData, enderecos: novaLista }));
    if (!editando) setEditando(true);
  };

  if (!formData) return <Spinner animation="border" />;

  const enderecosList = formData.enderecos || [];
  const temEnderecoUnico = !enderecosList.length && formData.endereco && formData.endereco.rua;

  return (
    <Container className="mt-4">
      <Row className="align-items-center mb-4">
        <Col xs={12} md={4} className="d-flex flex-column align-items-center">
          <Image
            src={formData.foto || profile}
            roundedCircle
            width={150}
            height={150}
            style={{ objectFit: 'cover', marginBottom: '10px' }}
          />
          {editando && (
            <Form.Group controlId="formFile" className="mb-3">
              <Form.Label>Alterar Foto</Form.Label>
              <Form.Control
                type="file"
                size="sm"
                accept=".jpg,.jpeg,.png"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      handleChange({ target: { name: 'foto', value: reader.result } });
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </Form.Group>
          )}
        </Col>
        <Col xs={12} md={8} className="d-flex flex-column justify-content-center align-items-center">
          <h2 className={styles.nomeUsuario}>{formData.nome}</h2>
          <div className="d-flex gap-2 mt-2">
            <Button
              variant={editando ? "success" : "primary"}
              onClick={handleClick}
              disabled={loading}
            >
              {loading ? <Spinner animation="border" size="sm" /> : editando ? 'Salvar Configurações' : 'Alterar Configurações'}
            </Button>
            <Button variant="danger" onClick={handleLogout}>Sair</Button>
          </div>
        </Col>
      </Row>

      <Tabs defaultActiveKey="basicas" id="perfil-tabs" className="mb-3">
        <Tab eventKey="basicas" title="Informações básicas">
          <Form>
            <Row className="mt-3">
              <Form.Group as={Col} md={6} controlId="nome">
                <Form.Label>Nome</Form.Label>
                <Form.Control type="text" name="nome" value={formData.nome || ''} onChange={handleChange} disabled={!editando} />
              </Form.Group>
              <Form.Group as={Col} md={6} controlId="email">
                <Form.Label>Email</Form.Label>
                <Form.Control type="email" name="email" value={formData.email || ''} onChange={handleChange} disabled={!editando} />
              </Form.Group>
            </Row>
            <Row className="mt-3">
              <Form.Group as={Col} md={6} controlId="senha">
                <Form.Label>Senha</Form.Label>
                <Form.Control type="password" name="senha" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} disabled={!editando} placeholder={editando ? "Digite nova senha para alterar" : ""} />
              </Form.Group>
              <Form.Group as={Col} md={3} controlId="idade">
                <Form.Label>Idade</Form.Label>
                <Form.Control type="number" min="0" max="200" name="idade" value={formData.idade || ''} onChange={handleChange} disabled={!editando} />
              </Form.Group>
              <Form.Group as={Col} md={3} controlId="sexo">
                <Form.Label>Sexo</Form.Label>
                <Form.Select name="sexo" value={formData.sexo || ''} onChange={handleChange} disabled={!editando}>
                  <option value="">Selecione</option>
                  <option value="masculino">Masculino</option>
                  <option value="feminino">Feminino</option>
                  <option value="outro">Outro</option>
                </Form.Select>
              </Form.Group>
            </Row>
          </Form>
        </Tab>

        <Tab eventKey="enderecos" title="Endereços">
          <div className="p-3">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5>Meus Endereços</h5>
              <Button variant="outline-primary" size="sm" onClick={handleOpenAddModal} disabled={!editando}>+ Adicionar Endereço</Button>
            </div>

            {enderecosList.length === 0 && !temEnderecoUnico && (
              <p className="text-muted">Nenhum endereço cadastrado. Adicione um para facilitar suas entregas.</p>
            )}

            <Row xs={1} md={2} className="g-3">
              {temEnderecoUnico && (
                <Col>
                  <Card className="h-100 border-warning">
                    <Card.Body>
                      <Card.Title>Principal (Legado)</Card.Title>
                      <Card.Text>
                        {formData.endereco.rua}, {formData.endereco.numero}<br />
                        {formData.endereco.bairro} - {formData.endereco.cidade}
                      </Card.Text>
                      <div className="text-muted small">Este endereço será migrado ao salvar novos.</div>
                      {editando && (
                        <div className="d-flex gap-2 justify-content-end mt-2">
                          <Button variant="outline-secondary" size="sm" onClick={() => {
                            setNovoEndereco({ ...formData.endereco, apelido: 'Principal' });
                            setEditingAddressIndex(-1);
                            setShowModalEndereco(true);
                          }}>Migrar p/ Lista</Button>
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              )}

              {enderecosList.map((end, idx) => (
                <Col key={idx}>
                  <Card className="h-100">
                    <Card.Body>
                      <Card.Title>{end.apelido || `Endereço ${idx + 1}`}</Card.Title>
                      <Card.Text>
                        {end.rua}, {end.numero} {end.complemento ? ` - ${end.complemento}` : ''}<br />
                        {end.bairro}, {end.cidade} - {end.estado}<br />
                        CEP: {end.cep}
                      </Card.Text>
                      {editando && (
                        <div className="d-flex gap-2 justify-content-end">
                          <Button variant="outline-secondary" size="sm" onClick={() => handleEditEndereco(idx)}>Editar</Button>
                          <Button variant="outline-danger" size="sm" onClick={() => handleRemoveEndereco(idx)}>Remover</Button>
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        </Tab>

        <Tab eventKey="nutricionista" title="Nutricionista">
          <div className="p-3">
            <h5 className="mb-3">Meu Nutricionista</h5>
            <Alert variant="info">Selecione o profissional que irá acompanhar sua dieta.</Alert>
            <Row className="align-items-end">
              <Col md={8}>
                <Form.Group controlId="nutricionistaId">
                  <Form.Label>Selecione um Nutricionista</Form.Label>
                  <Form.Select
                    value={selectedNutriId}
                    onChange={(e) => setSelectedNutriId(e.target.value)}
                    disabled={!editando && !formData.nutricionistaId}
                  >
                    <option value="">-- Sem Nutricionista --</option>
                    {nutricionistas.map(n => (
                      <option key={n.id} value={n.id}>{n.nome}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Button variant="primary" onClick={handleSaveNutri} className="mt-2" disabled={loading || !editando}>
                  {loading ? <Spinner animation="border" size="sm" /> : 'Atualizar Nutricionista'}
                </Button>
              </Col>
            </Row>
          </div>
        </Tab>

        <Tab eventKey="nutricionais" title="Informações nutricionais">
          <Form>
            <Row className="mt-3">
              <Form.Group as={Col} md={4} controlId="altura">
                <Form.Label>Altura (cm)</Form.Label>
                <Form.Control type="number" name="altura" value={formData.altura || ''} onChange={handleChange} disabled={!editando} />
              </Form.Group>
              <Form.Group as={Col} md={4} controlId="peso">
                <Form.Label>Peso (kg)</Form.Label>
                <Form.Control type="number" name="peso" value={formData.peso || ''} onChange={handleChange} disabled={!editando} />
              </Form.Group>
              <Form.Group as={Col} md={4} controlId="objetivo">
                <Form.Label>Objetivo</Form.Label>
                <Form.Control type="text" name="objetivo" value={formData.objetivo || ''} onChange={handleChange} disabled={!editando} />
              </Form.Group>
            </Row>
            <Row className="mt-3">
              <Form.Group as={Col} md={6} controlId="planoId">
                <Form.Label>Plano Atual (ID)</Form.Label>
                <Form.Control type="text" name="planoId" value={formData.planoId || ''} disabled />
              </Form.Group>
            </Row>
          </Form>
        </Tab>
      </Tabs>

      <Modal show={showModalEndereco} onHide={() => setShowModalEndereco(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editingAddressIndex >= 0 ? 'Editar Endereço' : 'Adicionar Endereço'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Apelido do Local (Ex: Casa, Trabalho)</Form.Label>
              <Form.Control type="text" placeholder="Nome para este endereço"
                value={novoEndereco.apelido}
                onChange={e => setNovoEndereco({ ...novoEndereco, apelido: e.target.value })}
              />
            </Form.Group>
            <Row className="mb-3">
              <Col md={9}>
                <Form.Label>Rua</Form.Label>
                <Form.Control type="text" value={novoEndereco.rua}
                  onChange={e => setNovoEndereco({ ...novoEndereco, rua: e.target.value })}
                />
              </Col>
              <Col md={3}>
                <Form.Label>Número</Form.Label>
                <Form.Control type="text" value={novoEndereco.numero}
                  onChange={e => setNovoEndereco({ ...novoEndereco, numero: e.target.value })}
                />
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Label>Bairro</Form.Label>
                <Form.Control type="text" value={novoEndereco.bairro}
                  onChange={e => setNovoEndereco({ ...novoEndereco, bairro: e.target.value })}
                />
              </Col>
              <Col md={6}>
                <Form.Label>Cidade</Form.Label>
                <Form.Control type="text" value={novoEndereco.cidade}
                  onChange={e => setNovoEndereco({ ...novoEndereco, cidade: e.target.value })}
                />
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Label>Estado</Form.Label>
                <Form.Control type="text" value={novoEndereco.estado}
                  onChange={e => {
                    if (/\d/.test(e.target.value)) return;
                    if (e.target.value.length > 2) return;
                    setNovoEndereco({ ...novoEndereco, estado: e.target.value.toUpperCase() });
                  }}
                />
              </Col>
              <Col md={6}>
                <Form.Label>CEP</Form.Label>
                <Form.Control type="text" value={novoEndereco.cep}
                  onChange={e => setNovoEndereco({ ...novoEndereco, cep: formatCEP(e.target.value) })}
                />
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Complemento</Form.Label>
              <Form.Control type="text" value={novoEndereco.complemento}
                onChange={e => setNovoEndereco({ ...novoEndereco, complemento: e.target.value })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModalEndereco(false)}>Cancelar</Button>
          <Button variant="primary" onClick={handleSaveEndereco}>
            {editingAddressIndex >= 0 ? 'Salvar Alterações' : 'Adicionar à Lista'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}