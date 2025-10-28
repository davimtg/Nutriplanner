import { useState, useEffect } from 'react';
import { Button, Form, Offcanvas, Card, InputGroup, ListGroup, Image, Col } from 'react-bootstrap';
import BubbleIcon from '../../assets/img/chat-bubble-icon.png';
import styles from './Chat.module.css';
import ChatMessages from '../ChatMessages/ChatMessages';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserMessages, enviarMensagem, abrirChat, alternarChat } from '../../redux/chatSlice';

export default function Chat() {
    const [show, setShow] = useState(false);
    const [search, setSearch] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [mensagem, setMensagem] = useState('');
    const [allUsers, setAllUsers] = useState([]);
    const targetUser = useSelector(state => state.chat.targetUser);
    const showChatWindow = useSelector(state => state.chat.showChatWindow);
    const currentUser = useSelector(state => state.user.userData);

    const dispatch = useDispatch();

    useEffect(() => {
        const fetchUsers = async () => { // Carrega todos os usuarios (temporario)
            try {
                const res = await fetch('http://localhost:3001/usuarios');
                const data = await res.json();
                setAllUsers(data['lista-de-usuarios'] || []);
            } catch (error) {
                console.error('Erro ao carregar usuários:', error);
            }
        };
        fetchUsers();
    }, []);

    useEffect(() => { // Carrega todas as mensagens do servidor
        if (targetUser && currentUser) {
            dispatch(fetchUserMessages({
                remetenteId: currentUser.id,
                destinatarioId: targetUser.id
            }));
        }
    }, [targetUser, dispatch, currentUser]);

    const handleOpenUserWindow = (user) => {
        dispatch(abrirChat(user));
    };

    const handleCloseChatWindow = () => {
        dispatch(alternarChat());
    };

    const handleEnviarMensagem = () => {
        if (!mensagem.trim()) return;
        const novaMensagem = {
            conteudo: mensagem,
            remetenteNome: currentUser.nome,
            destinatarioNome: targetUser.nome,
            remetenteId: currentUser.id,
            destinatarioId: targetUser.id,
            timestamp: new Date().toISOString(),
            status: 'enviada'
        };
        dispatch(enviarMensagem(novaMensagem));
        setMensagem('');
    };

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearch(value);
        if (value.trim() === '') {
            setSearchResults([]);
            return;
        }
        const results = allUsers.filter(user =>
            user.nome.toLowerCase().includes(value.toLowerCase())
        );
        setSearchResults(results);
    };

    function RecentContactList({ onOpen }) {
        const contatos = currentUser?.contatosRecentes || [];
        const users = allUsers.filter(user => contatos.includes(user.id));
        return (
            <>
                {users.map(user => (
                    <Card key={user.id} className="mb-3">
                        <Card.Body>
                            <Card.Title>{user.nome}</Card.Title>
                            <Card.Subtitle className="mb-2 text-muted">{user.tipo?.name}</Card.Subtitle>
                            <Button variant="success" onClick={() => onOpen(user)}>
                                Conversar
                            </Button>
                        </Card.Body>
                    </Card>
                ))}
            </>
        );
    }

    if (!currentUser) return null;

    return (
        <>
            <button className={styles.floatingBtn} onClick={() => setShow(true)} aria-label="Abrir chat">
                <Image className={styles.floatingIcon} src={BubbleIcon} />
            </button>

            <Offcanvas show={show} onHide={() => setShow(false)} placement="end">
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>Chat</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    <Form className="mb-3">
                        <InputGroup>
                            <Form.Control
                                placeholder="Pesquisar usuário..."
                                value={search}
                                onChange={handleSearch}
                            />
                        </InputGroup>
                    </Form>

                    {search ? (
                        <div>
                            <h6>Resultados da pesquisa</h6>
                            {searchResults.length === 0 ? (
                                <div>Nenhum usuário encontrado.</div>
                            ) : (
                                <ListGroup>
                                    {searchResults.map(user => (
                                        <ListGroup.Item key={user.id}>
                                            <div className="d-flex justify-content-between align-items-center">
                                                <div>
                                                    <strong>{user.nome}</strong><br />
                                                    <small>{user.tipo?.name}</small>
                                                </div>
                                                <Button size="sm" onClick={() => handleOpenUserWindow(user)}>Conversar</Button>
                                            </div>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            )}
                        </div>
                    ) : (
                        <div>
                            <h6>Contatos recentes</h6>
                            <ListGroup>
                                <RecentContactList onOpen={handleOpenUserWindow} />
                            </ListGroup>
                        </div>
                    )}
                </Offcanvas.Body>
            </Offcanvas>

            <Offcanvas className={styles.chatOffcanvas} show={showChatWindow} onHide={handleCloseChatWindow} placement="end">
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>Chat com {targetUser?.nome}</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body className={`${styles.chatOffcanvas} d-flex flex-column h-100`}>
                    <Col xs={12} className={styles.chatWindow}>
                        <ChatMessages currentUserId={currentUser.id} />
                    </Col>
                    <Col xs={12}>
                        <Form className={styles.chatInputArea}>
                            <Form.Control as="textarea" placeholder="Envie uma Mensagem"
                                value={mensagem}
                                onChange={e => setMensagem(e.target.value)}
                                onKeyDown={e => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleEnviarMensagem();
                                    }
                                }} />
                        </Form>
                    </Col>
                </Offcanvas.Body>
            </Offcanvas>
        </>
    );
}
