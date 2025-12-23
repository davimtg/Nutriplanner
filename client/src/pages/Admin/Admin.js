import React, { useState, useEffect } from 'react';
import { Container, Tabs, Tab, Table, Button, Modal, Form, Row, Col, Spinner, Toast, ToastContainer } from 'react-bootstrap';
import api from '../../services/api';

export default function Admin() {
    const [activeTab, setActiveTab] = useState('usuarios');
    const [loading, setLoading] = useState(false);

    // Data States
    // Old fetchData and useEffect removed - logic moved down
    // (kept variable declarations to avoid breaking the file structure logic flow)
    // Data States
    const [users, setUsers] = useState([]);
    const [receitas, setReceitas] = useState([]);
    const [alimentos, setAlimentos] = useState([]);

    // Edit Recipe State
    const [showEditRecipe, setShowEditRecipe] = useState(false);
    const [editingRecipe, setEditingRecipe] = useState(null);

    // Edit User State
    const [showEditUser, setShowEditUser] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    // Edit Alimento State
    const [showEditAlimento, setShowEditAlimento] = useState(false);
    const [editingAlimento, setEditingAlimento] = useState(null);

    // Edit Pedido State
    const [pedidos, setPedidos] = useState([]);
    const [showEditPedido, setShowEditPedido] = useState(false);
    const [editingPedido, setEditingPedido] = useState(null);

    // Edit Plano State
    const [planos, setPlanos] = useState([]);
    const [showEditPlano, setShowEditPlano] = useState(false);
    const [editingPlano, setEditingPlano] = useState(null);

    // Notification State (Toast)
    const [toast, setToast] = useState({ show: false, message: '', variant: 'success' });
    const showToast = (message, variant = 'success') => setToast({ show: true, message, variant });

    // Confirmation Modal State
    const [confirmModal, setConfirmModal] = useState({ show: false, title: '', message: '', action: null });
    const closeConfirmModal = () => setConfirmModal({ ...confirmModal, show: false });
    const openConfirmModal = (title, message, action) => setConfirmModal({ show: true, title, message, action });
    const handleConfirmAction = async () => {
        if (confirmModal.action) await confirmModal.action();
        closeConfirmModal();
    };


    // --- Users Handlers ---
    // --- Users Handlers ---
    const deleteUser = (id) => {
        openConfirmModal(
            'Excluir Usuário',
            'Tem certeza que deseja excluir este usuário?',
            async () => {
                try {
                    await api.delete(`/usuarios/${id}`);
                    setUsers(users.filter(u => u.id !== id));
                    showToast('Usuário removido.', 'success');
                } catch (error) {
                    console.error(error);
                    showToast('Erro ao remover usuário.', 'danger');
                }
            }
        );
    };

    const openEditUser = (user) => {
        setEditingUser({ ...user, tipo: user.tipo || { id: 1, name: 'cliente' }, endereco: user.endereco || {} });
        setShowEditUser(true);
    };

    const openCreateUser = () => {
        setEditingUser({
            nome: '',
            email: '',
            senha: '', // Senha é obrigatória na criação
            tipo: { id: 1, name: 'cliente' },
            idade: '',
            sexo: 'outro',
            objetivo: ''
        });
        setShowEditUser(true);
    };

    const saveUser = async () => {
        try {
            if (editingUser.id) {
                // Editar
                await api.put(`/usuarios/${editingUser.id}`, editingUser);
                showToast('Usuário atualizado com sucesso!', 'success');
            } else {
                // Criar
                if (!editingUser.senha) return showToast('Senha é obrigatória para novos usuários', 'warning');
                await api.post('/usuarios', editingUser);
                showToast('Usuário criado com sucesso!', 'success');
            }
            setShowEditUser(false);
            fetchData();
        } catch (error) {
            console.error(error);
            showToast('Erro ao salvar usuário.', 'danger');
        }
    };

    // --- Recipes Handlers ---
    // --- Recipes Handlers ---
    const deleteReceita = (id) => {
        openConfirmModal(
            'Excluir Receita',
            'Tem certeza que deseja excluir esta receita?',
            async () => {
                try {
                    await api.delete(`/receitas/${id}`);
                    setReceitas(receitas.filter(r => r.id !== id));
                    showToast('Receita removida.', 'success');
                } catch (error) {
                    console.error(error);
                    showToast('Erro ao remover receita.', 'danger');
                }
            }
        );
    };

    const openEditRecipe = (receita) => {
        setEditingRecipe({
            ...receita,
            ingredientes: receita.ingredientes || [],
            passos: receita.passos || [],
            tempo: receita.tempo || { preparacao: '', cozimento: '' },
            nutricional: receita.nutricional || { calorias: 0, carboidrato: 0, gordura: 0, proteina: 0 }
        });
        setShowEditRecipe(true);
    };

    const openCreateRecipe = () => {
        setEditingRecipe({
            nome: '',
            img: '',
            tipo: 'Prato Principal',
            sumario: '',
            porcao: '',
            ingredientes: [],
            passos: [],
            tempo: { preparacao: '', cozimento: '' },
            nutricional: { calorias: 0, carboidrato: 0, gordura: 0, proteina: 0 }
        });
        setShowEditRecipe(true);
    };

    // --- Helpers for Editing Recipe ---
    const handleEditChange = (field, value) => {
        setEditingRecipe(prev => ({ ...prev, [field]: value }));
    };

    const handleEditNestedChange = (parent, field, value) => {
        setEditingRecipe(prev => ({
            ...prev,
            [parent]: { ...prev[parent], [field]: value }
        }));
    };

    const handleEditArrayChange = (arrayName, index, value) => {
        const newArray = [...editingRecipe[arrayName]];
        newArray[index] = value;
        setEditingRecipe(prev => ({ ...prev, [arrayName]: newArray }));
    };

    const addEditArrayItem = (arrayName) => {
        setEditingRecipe(prev => ({ ...prev, [arrayName]: [...prev[arrayName], ""] }));
    };

    const removeEditArrayItem = (arrayName, index) => {
        const newArray = [...editingRecipe[arrayName]];
        newArray.splice(index, 1);
        setEditingRecipe(prev => ({ ...prev, [arrayName]: newArray }));
    };

    const saveRecipe = async () => {
        try {
            if (editingRecipe.id) {
                await api.put(`/receitas/${editingRecipe.id}`, editingRecipe);
                showToast('Receita atualizada com sucesso!', 'success');
            } else {
                await api.post('/receitas', editingRecipe);
                showToast('Receita criada com sucesso!', 'success');
            }
            setShowEditRecipe(false);
            fetchData(); // Refresh list
        } catch (error) {
            console.error(error);
            showToast('Erro ao salvar receita.', 'danger');
        }
    };

    // --- Alimentos Handlers ---
    // --- Alimentos Handlers ---
    const deleteAlimento = (id) => {
        openConfirmModal(
            'Excluir Alimento',
            'Tem certeza que deseja excluir este alimento?',
            async () => {
                try {
                    await api.delete(`/alimentos/${id}`);
                    setAlimentos(alimentos.filter(a => a.id !== id));
                    showToast('Alimento removido.', 'success');
                } catch (error) {
                    console.error(error);
                    showToast('Erro ao remover alimento.', 'danger');
                }
            }
        );
    };

    const openEditAlimento = (alimento) => {
        setEditingAlimento({ ...alimento });
        setShowEditAlimento(true);
    };

    const openCreateAlimento = () => {
        setEditingAlimento({
            nome: '',
            porcao: '',
            porcaoGramas: 100,
            calorias: 0,
            carboidrato: 0,
            proteina: 0,
            gordura: 0
        });
        setShowEditAlimento(true);
    };

    const saveAlimento = async () => {
        try {
            if (editingAlimento.id) {
                await api.put(`/alimentos/${editingAlimento.id}`, editingAlimento);
                showToast('Alimento atualizado com sucesso!', 'success');
            } else {
                await api.post('/alimentos', editingAlimento);
                showToast('Alimento criado com sucesso!', 'success');
            }
            setShowEditAlimento(false);
            fetchData();
        } catch (error) {
            console.error(error);
            showToast('Erro ao salvar alimento.', 'danger');
        }
    };


    // --- Pedidos Handlers ---
    const deletePedido = (id) => {
        openConfirmModal('Excluir Pedido', 'Tem certeza?', async () => {
            try {
                await api.delete(`/pedidos/${id}`);
                setPedidos(pedidos.filter(p => p.id !== id));
                showToast('Pedido removido.', 'success');
            } catch (err) { console.error(err); showToast('Erro ao remover pedido.', 'danger'); }
        });
    };

    const openEditPedido = (pedido) => {
        setEditingPedido({ ...pedido, data: pedido.data ? pedido.data.split('T')[0] : '' });
        setShowEditPedido(true);
    };

    const openCreatePedido = () => {
        setEditingPedido({ userId: '', data: new Date().toISOString().split('T')[0], status: 'Pendente', total: 0, itens: [] });
        setShowEditPedido(true);
    };

    const savePedido = async () => {
        try {
            if (editingPedido.id) {
                await api.put(`/pedidos/${editingPedido.id}`, editingPedido);
                showToast('Pedido atualizado!', 'success');
            } else {
                await api.post('/pedidos', editingPedido);
                showToast('Pedido criado!', 'success');
            }
            setShowEditPedido(false);
            fetchData();
        } catch (err) { console.error(err); showToast('Erro ao salvar pedido.', 'danger'); }
    };

    // --- Planos Handlers ---
    const deletePlano = (id) => {
        openConfirmModal('Excluir Plano', 'Tem certeza?', async () => {
            try {
                await api.delete(`/planos-alimentares/${id}`);
                setPlanos(planos.filter(p => p.id !== id));
                showToast('Plano removido.', 'success');
            } catch (err) { console.error(err); showToast('Erro ao remover plano.', 'danger'); }
        });
    };

    const openEditPlano = (plano) => {
        setEditingPlano({ ...plano, detalhamentoJSON: JSON.stringify(plano.detalhamento, null, 2) });
        setShowEditPlano(true);
    };

    const openCreatePlano = () => {
        setEditingPlano({ nome: '', objetivo: '', detalhamentoJSON: '{}' });
        setShowEditPlano(true);
    };

    const savePlano = async () => {
        try {
            const payload = { ...editingPlano };
            try {
                payload.detalhamento = JSON.parse(editingPlano.detalhamentoJSON);
            } catch (e) {
                return showToast('JSON de detalhamento inválido!', 'warning');
            }
            delete payload.detalhamentoJSON;

            if (editingPlano.id) {
                await api.put(`/planos-alimentares/${editingPlano.id}`, payload);
                showToast('Plano atualizado!', 'success');
            } else {
                await api.post('/planos-alimentares', payload);
                showToast('Plano criado!', 'success');
            }
            setShowEditPlano(false);
            fetchData();
        } catch (err) { console.error(err); showToast('Erro ao salvar plano.', 'danger'); }
    };

    const [searchText, setSearchText] = useState('');
    const [page, setPage] = useState(1);
    const LIMIT = 100;

    useEffect(() => {
        setPage(1); // Resetar página ao mudar de aba ou busca
    }, [activeTab]);

    useEffect(() => {
        fetchData();
    }, [activeTab, page]);

    // Disparar busca ao digitar (debounce simples ou onsearch)
    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1); // Resetar para primeira página na busca
        fetchData();
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            // Correção da construção da query string:
            // Se tem busca: ?q=texto&_page=1&_limit=100
            // Se não tem: ?_page=1&_limit=100
            const queryString = searchText
                ? `?q=${searchText}&_page=${page}&_limit=${LIMIT}`
                : `?_page=${page}&_limit=${LIMIT}`;

            if (activeTab === 'usuarios') {
                const res = await api.get(`/usuarios${queryString}`);
                setUsers(res.data);
            } else if (activeTab === 'receitas') {
                const res = await api.get(`/receitas${queryString}`);
                setReceitas(res.data);
            } else if (activeTab === 'alimentos') {
                const res = await api.get(`/alimentos${queryString}`);
                setAlimentos(res.data);
            } else if (activeTab === 'pedidos') {
                const res = await api.get(`/pedidos${queryString}`);
                setPedidos(res.data);
            } else if (activeTab === 'planos') {
                const res = await api.get(`/planos-alimentares${queryString}`);
                setPlanos(res.data);
            }
        } catch (error) {
            console.error('Erro ao buscar dados:', error);
            showToast('Erro ao carregar dados.', 'danger');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="my-5">
            <h1 className="mb-4">Painel Administrativo</h1>

            <Form className="mb-4 d-flex" onSubmit={handleSearch}>
                <Form.Control
                    type="text"
                    placeholder={`Pesquisar em ${activeTab}...`}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="me-2"
                />
                <Button variant="primary" type="submit">
                    Pesquisar
                </Button>
                <div className="ms-auto">
                    {activeTab === 'usuarios' && <Button variant="success" onClick={openCreateUser}>+ Novo Usuário</Button>}
                    {activeTab === 'receitas' && <Button variant="success" onClick={openCreateRecipe}>+ Nova Receita</Button>}
                    {activeTab === 'alimentos' && <Button variant="success" onClick={openCreateAlimento}>+ Novo Alimento</Button>}
                    {activeTab === 'pedidos' && <Button variant="success" onClick={openCreatePedido}>+ Novo Pedido</Button>}
                    {activeTab === 'planos' && <Button variant="success" onClick={openCreatePlano}>+ Novo Plano</Button>}
                </div>
            </Form>

            <Tabs
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k)}
                className="mb-3"
            >
                {/* TAB USUÁRIOS */}
                <Tab eventKey="usuarios" title="Usuários">
                    {loading ? <Spinner animation="border" /> : (
                        <Table striped bordered hover responsive>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nome</th>
                                    <th>Email</th>
                                    <th>Tipo</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u.id}>
                                        <td>{u.id}</td>
                                        <td>{u.nome}</td>
                                        <td>{u.email}</td>
                                        <td>{u.tipo?.name || u.tipo}</td>
                                        <td>
                                            <Button variant="warning" size="sm" className="me-2" onClick={() => openEditUser(u)}>
                                                Editar
                                            </Button>
                                            <Button variant="danger" size="sm" onClick={() => deleteUser(u.id)}>
                                                Excluir
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Tab>

                {/* TAB RECEITAS */}
                <Tab eventKey="receitas" title="Receitas">
                    {loading ? <Spinner animation="border" /> : (
                        <Table striped bordered hover responsive>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Imagem</th>
                                    <th>Nome</th>
                                    <th>Tipo</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {receitas.map(r => (
                                    <tr key={r.id}>
                                        <td>{r.id}</td>
                                        <td>
                                            {r.img ? (
                                                <img src={r.img.startsWith('data:') ? r.img : "https://placehold.co/50"} alt="mini" style={{ width: 50, height: 50, objectFit: 'cover' }} />
                                            ) : 'Sem img'}
                                        </td>
                                        <td>{r.nome}</td>
                                        <td>{r.tipo}</td>
                                        <td>
                                            <Button variant="warning" size="sm" className="me-2" onClick={() => openEditRecipe(r)}>
                                                Editar
                                            </Button>
                                            <Button variant="danger" size="sm" onClick={() => deleteReceita(r.id)}>
                                                Excluir
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Tab>

                {/* TAB ALIMENTOS */}
                <Tab eventKey="alimentos" title="Alimentos">
                    {loading ? <Spinner animation="border" /> : (
                        <>
                            <p className="text-muted">Exibindo os primeiros 100 alimentos.</p>
                            <Table striped bordered hover responsive>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Nome</th>
                                        <th>Calorias</th>
                                        <th>Porção</th>
                                        <th>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {alimentos.map(a => (
                                        <tr key={a.id}>
                                            <td>{a.id}</td>
                                            <td>{a.nome}</td>
                                            <td>{a.calorias}</td>
                                            <td>{a.porcao}</td>
                                            <td>
                                                <Button variant="warning" size="sm" className="me-2" onClick={() => openEditAlimento(a)}>
                                                    Editar
                                                </Button>
                                                <Button variant="danger" size="sm" onClick={() => deleteAlimento(a.id)}>
                                                    Excluir
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </>
                    )}
                </Tab>

                {/* TAB PEDIDOS */}
                <Tab eventKey="pedidos" title="Pedidos">
                    {loading ? <Spinner animation="border" /> : (
                        <Table striped bordered hover responsive>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>User ID</th>
                                    <th>Data</th>
                                    <th>Status</th>
                                    <th>Total</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pedidos.map(p => (
                                    <tr key={p.id}>
                                        <td>{p.id}</td>
                                        <td>{p.userId}</td>
                                        <td>{p.data ? new Date(p.data).toLocaleDateString() : '-'}</td>
                                        <td>{p.status}</td>
                                        <td>R$ {p.total}</td>
                                        <td>
                                            <Button variant="warning" size="sm" className="me-2" onClick={() => openEditPedido(p)}>Editar</Button>
                                            <Button variant="danger" size="sm" onClick={() => deletePedido(p.id)}>Excluir</Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Tab>

                {/* TAB PLANOS */}
                <Tab eventKey="planos" title="Planos Alimentares">
                    {loading ? <Spinner animation="border" /> : (
                        <Table striped bordered hover responsive>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nome</th>
                                    <th>Objetivo</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {planos.map(p => (
                                    <tr key={p.id}>
                                        <td>{p.id}</td>
                                        <td>{p.nome}</td>
                                        <td>{p.objetivo}</td>
                                        <td>
                                            <Button variant="warning" size="sm" className="me-2" onClick={() => openEditPlano(p)}>Editar</Button>
                                            <Button variant="danger" size="sm" onClick={() => deletePlano(p.id)}>Excluir</Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Tab>
            </Tabs>

            {/* Controles de Paginação */}
            <div className="d-flex justify-content-center align-items-center gap-3 mt-3 mb-5">
                <Button
                    variant="outline-secondary"
                    disabled={page === 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                >
                    &lt; Anterior
                </Button>
                <span>Página {page}</span>
                <Button
                    variant="outline-secondary"
                    // Desabilitar se array atual for menor que limite (fim da lista)
                    disabled={
                        (activeTab === 'usuarios' && users.length < LIMIT) ||
                        (activeTab === 'receitas' && receitas.length < LIMIT) ||
                        (activeTab === 'alimentos' && alimentos.length < LIMIT) ||
                        (activeTab === 'pedidos' && pedidos.length < LIMIT) ||
                        (activeTab === 'planos' && planos.length < LIMIT)
                    }
                    onClick={() => setPage(p => p + 1)}
                >
                    Próxima &gt;
                </Button>
            </div>

            {/* Modal Editar Receita (Simplificado) */}
            <Modal show={showEditRecipe} onHide={() => setShowEditRecipe(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{editingRecipe?.id ? 'Editar Receita' : 'Nova Receita'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {editingRecipe && (
                        <Form>
                            <Tabs defaultActiveKey="detalhes" className="mb-3">
                                {/* TAB DETALHES */}
                                <Tab eventKey="detalhes" title="Detalhes">
                                    <Row>
                                        <Col md={12}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Imagem (Preview)</Form.Label>
                                                <div className="d-flex align-items-center gap-3">
                                                    {editingRecipe.img && <img src={editingRecipe.img.startsWith('data:') ? editingRecipe.img : "https://placehold.co/50"} alt="preview" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: '8px' }} />}
                                                    <Form.Control
                                                        type="file"
                                                        accept=".jpg,.jpeg,.png"
                                                        onChange={(e) => {
                                                            const file = e.target.files[0];
                                                            if (file) {
                                                                const reader = new FileReader();
                                                                reader.onloadend = () => handleEditChange("img", reader.result);
                                                                reader.readAsDataURL(file);
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            </Form.Group>
                                        </Col>
                                        <Col md={8}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Nome</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    value={editingRecipe.nome}
                                                    onChange={(e) => handleEditChange('nome', e.target.value)}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Tipo</Form.Label>
                                                <Form.Select
                                                    value={editingRecipe.tipo}
                                                    onChange={(e) => handleEditChange('tipo', e.target.value)}
                                                >
                                                    <option value="Café da manhã">Café da manhã</option>
                                                    <option value="Café da tarde">Café da tarde</option>
                                                    <option value="Prato Principal">Prato Principal</option>
                                                    <option value="Sobremesa">Sobremesa</option>
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Sumário</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={3}
                                            value={editingRecipe.sumario}
                                            onChange={(e) => handleEditChange('sumario', e.target.value)}
                                        />
                                    </Form.Group>
                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Porção</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    value={editingRecipe.porcao}
                                                    onChange={(e) => handleEditChange('porcao', e.target.value)}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={3}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Tempo Prep.</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    value={editingRecipe.tempo?.preparacao}
                                                    onChange={(e) => handleEditNestedChange('tempo', 'preparacao', e.target.value)}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={3}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Tempo Coz.</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    value={editingRecipe.tempo?.cozimento}
                                                    onChange={(e) => handleEditNestedChange('tempo', 'cozimento', e.target.value)}
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </Tab>

                                {/* TAB PREPARO */}
                                <Tab eventKey="preparo" title="Preparo">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Ingredientes</Form.Label>
                                        {editingRecipe.ingredientes.map((ing, idx) => (
                                            <div key={idx} className="d-flex gap-2 mb-2">
                                                <Form.Control
                                                    value={ing}
                                                    onChange={(e) => handleEditArrayChange('ingredientes', idx, e.target.value)}
                                                />
                                                <Button variant="danger" onClick={() => removeEditArrayItem('ingredientes', idx)}>X</Button>
                                            </div>
                                        ))}
                                        <Button size="sm" onClick={() => addEditArrayItem('ingredientes')}>+ Adicionar Ingrediente</Button>
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Passos de Preparo</Form.Label>
                                        {editingRecipe.passos.map((passo, idx) => (
                                            <div key={idx} className="d-flex gap-2 mb-2">
                                                <Form.Control
                                                    as="textarea" rows={2}
                                                    value={passo}
                                                    onChange={(e) => handleEditArrayChange('passos', idx, e.target.value)}
                                                />
                                                <Button variant="danger" onClick={() => removeEditArrayItem('passos', idx)}>X</Button>
                                            </div>
                                        ))}
                                        <Button size="sm" onClick={() => addEditArrayItem('passos')}>+ Adicionar Passo</Button>
                                    </Form.Group>
                                </Tab>

                                {/* TAB NUTRICIONAL */}
                                <Tab eventKey="nutricional" title="Nutricional">
                                    <Row>
                                        <Col md={3}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Calorias</Form.Label>
                                                <Form.Control type="number" value={editingRecipe.nutricional?.calorias} onChange={(e) => handleEditNestedChange('nutricional', 'calorias', e.target.value)} />
                                            </Form.Group>
                                        </Col>
                                        <Col md={3}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Carbo (g)</Form.Label>
                                                <Form.Control type="number" value={editingRecipe.nutricional?.carboidrato} onChange={(e) => handleEditNestedChange('nutricional', 'carboidrato', e.target.value)} />
                                            </Form.Group>
                                        </Col>
                                        <Col md={3}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Proteína (g)</Form.Label>
                                                <Form.Control type="number" value={editingRecipe.nutricional?.proteina} onChange={(e) => handleEditNestedChange('nutricional', 'proteina', e.target.value)} />
                                            </Form.Group>
                                        </Col>
                                        <Col md={3}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Gordura (g)</Form.Label>
                                                <Form.Control type="number" value={editingRecipe.nutricional?.gordura} onChange={(e) => handleEditNestedChange('nutricional', 'gordura', e.target.value)} />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </Tab>
                            </Tabs>
                        </Form>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowEditRecipe(false)}>Cancelar</Button>
                    <Button variant="primary" onClick={saveRecipe}>Salvar Alterações</Button>
                </Modal.Footer>
            </Modal>

            {/* Modal Editar Pedido */}
            <Modal show={showEditPedido} onHide={() => setShowEditPedido(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>{editingPedido?.id ? 'Editar Pedido' : 'Novo Pedido'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {editingPedido && (
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label>ID do Usuário</Form.Label>
                                <Form.Control type="number" value={editingPedido.userId} onChange={(e) => setEditingPedido({ ...editingPedido, userId: e.target.value })} />
                            </Form.Group>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Data</Form.Label>
                                        <Form.Control type="date" value={editingPedido.data} onChange={(e) => setEditingPedido({ ...editingPedido, data: e.target.value })} />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Status</Form.Label>
                                        <Form.Select value={editingPedido.status} onChange={(e) => setEditingPedido({ ...editingPedido, status: e.target.value })}>
                                            <option value="Pendente">Pendente</option>
                                            <option value="Em Preparo">Em Preparo</option>
                                            <option value="Enviado">Enviado</option>
                                            <option value="Entregue">Entregue</option>
                                            <option value="Cancelado">Cancelado</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Form.Group className="mb-3">
                                <Form.Label>Total (R$)</Form.Label>
                                <Form.Control type="number" value={editingPedido.total} onChange={(e) => setEditingPedido({ ...editingPedido, total: e.target.value })} />
                            </Form.Group>
                        </Form>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowEditPedido(false)}>Cancelar</Button>
                    <Button variant="primary" onClick={savePedido}>Salvar</Button>
                </Modal.Footer>
            </Modal>

            {/* Modal Editar Plano */}
            <Modal show={showEditPlano} onHide={() => setShowEditPlano(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{editingPlano?.id ? 'Editar Plano' : 'Novo Plano'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {editingPlano && (
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label>Nome do Plano</Form.Label>
                                <Form.Control type="text" value={editingPlano.nome} onChange={(e) => setEditingPlano({ ...editingPlano, nome: e.target.value })} />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Objetivo</Form.Label>
                                <Form.Control type="text" value={editingPlano.objetivo} onChange={(e) => setEditingPlano({ ...editingPlano, objetivo: e.target.value })} />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Detalhamento (JSON)</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={10}
                                    value={editingPlano.detalhamentoJSON}
                                    onChange={(e) => setEditingPlano({ ...editingPlano, detalhamentoJSON: e.target.value })}
                                    style={{ fontFamily: 'monospace' }}
                                />
                                <Form.Text className="text-muted">
                                    Edite a estrutura JSON do plano alimentar com cuidado.
                                </Form.Text>
                            </Form.Group>
                        </Form>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowEditPlano(false)}>Cancelar</Button>
                    <Button variant="primary" onClick={savePlano}>Salvar</Button>
                </Modal.Footer>
            </Modal>

            {/* Modal Editar Usuário */}
            <Modal show={showEditUser} onHide={() => setShowEditUser(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{editingUser?.id ? 'Editar Usuário' : 'Novo Usuário'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {editingUser && (
                        <Form>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Nome</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={editingUser.nome}
                                            onChange={(e) => setEditingUser({ ...editingUser, nome: e.target.value })}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Email</Form.Label>
                                        <Form.Control
                                            type="email"
                                            value={editingUser.email}
                                            onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                            {!editingUser.id && ( // Apenas na criação
                                <Form.Group className="mb-3">
                                    <Form.Label>Senha</Form.Label>
                                    <Form.Control
                                        type="password"
                                        value={editingUser.senha}
                                        onChange={(e) => setEditingUser({ ...editingUser, senha: e.target.value })}
                                        placeholder="Defina a senha inicial"
                                    />
                                </Form.Group>
                            )}
                            <Row>
                                <Col md={4}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Tipo</Form.Label>
                                        <Form.Select
                                            value={editingUser.tipo?.id}
                                            onChange={(e) => {
                                                const id = parseInt(e.target.value);
                                                const types = { 0: 'admin', 1: 'cliente', 2: 'nutricionista', 3: 'mediador' };
                                                setEditingUser({ ...editingUser, tipo: { id, name: types[id] } });
                                            }}
                                        >
                                            <option value="0">Admin</option>
                                            <option value="1">Cliente</option>
                                            <option value="2">Nutricionista</option>
                                            <option value="3">Mediador</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Idade</Form.Label>
                                        <Form.Control
                                            type="number"
                                            value={editingUser.idade}
                                            onChange={(e) => setEditingUser({ ...editingUser, idade: e.target.value })}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Sexo</Form.Label>
                                        <Form.Select
                                            value={editingUser.sexo}
                                            onChange={(e) => setEditingUser({ ...editingUser, sexo: e.target.value })}
                                        >
                                            <option value="masculino">Masculino</option>
                                            <option value="feminino">Feminino</option>
                                            <option value="outro">Outro</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Form.Group className="mb-3">
                                <Form.Label>Objetivo</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={editingUser.objetivo}
                                    onChange={(e) => setEditingUser({ ...editingUser, objetivo: e.target.value })}
                                />
                            </Form.Group>
                        </Form>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowEditUser(false)}>Cancelar</Button>
                    <Button variant="primary" onClick={saveUser}>Salvar Alterações</Button>
                </Modal.Footer>
            </Modal>

            {/* Modal Editar Alimento */}
            <Modal show={showEditAlimento} onHide={() => setShowEditAlimento(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>{editingAlimento?.id ? 'Editar Alimento' : 'Novo Alimento'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {editingAlimento && (
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label>Nome</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={editingAlimento.nome}
                                    onChange={(e) => setEditingAlimento({ ...editingAlimento, nome: e.target.value })}
                                />
                            </Form.Group>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Porção (descrição)</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={editingAlimento.porcao}
                                            onChange={(e) => setEditingAlimento({ ...editingAlimento, porcao: e.target.value })}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Porção (gramas)</Form.Label>
                                        <Form.Control
                                            type="number"
                                            value={editingAlimento.porcaoGramas}
                                            onChange={(e) => setEditingAlimento({ ...editingAlimento, porcaoGramas: Number(e.target.value) })}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row>
                                <Col md={3}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Calorias</Form.Label>
                                        <Form.Control
                                            type="number"
                                            value={editingAlimento.calorias}
                                            onChange={(e) => setEditingAlimento({ ...editingAlimento, calorias: Number(e.target.value) })}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={3}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Carbo</Form.Label>
                                        <Form.Control
                                            type="number"
                                            value={editingAlimento.carboidrato}
                                            onChange={(e) => setEditingAlimento({ ...editingAlimento, carboidrato: Number(e.target.value) })}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={3}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Prot.</Form.Label>
                                        <Form.Control
                                            type="number"
                                            value={editingAlimento.proteina}
                                            onChange={(e) => setEditingAlimento({ ...editingAlimento, proteina: Number(e.target.value) })}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={3}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Gord.</Form.Label>
                                        <Form.Control
                                            type="number"
                                            value={editingAlimento.gordura}
                                            onChange={(e) => setEditingAlimento({ ...editingAlimento, gordura: Number(e.target.value) })}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Form>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowEditAlimento(false)}>Cancelar</Button>
                    <Button variant="primary" onClick={saveAlimento}>Salvar Alterações</Button>
                </Modal.Footer>
            </Modal>

            {/* Modal de Confirmação Genérico */}
            <Modal show={confirmModal.show} onHide={closeConfirmModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{confirmModal.title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>{confirmModal.message}</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={closeConfirmModal}>Cancelar</Button>
                    <Button variant="danger" onClick={handleConfirmAction}>Confirmar</Button>
                </Modal.Footer>
            </Modal>

            {/* Toast Notification Container */}
            <ToastContainer position="top-end" className="p-3" style={{ zIndex: 9999 }}>
                <Toast onClose={() => setToast({ ...toast, show: false })} show={toast.show} delay={3000} autohide bg={toast.variant}>
                    <Toast.Header>
                        <strong className="me-auto">NutriPlanner Admin</strong>
                    </Toast.Header>
                    <Toast.Body className={toast.variant === 'danger' ? 'text-white' : ''}>
                        {toast.message}
                    </Toast.Body>
                </Toast>
            </ToastContainer>

        </Container>
    );
}
