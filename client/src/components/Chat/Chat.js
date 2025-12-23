import { useState, useEffect, useRef } from 'react';
import { Button, Form, Offcanvas, Card, InputGroup, ListGroup, Image, Col, Badge } from 'react-bootstrap';
import BubbleIcon from '../../assets/img/chat-bubble-icon.png';
import styles from './Chat.module.css';
import ChatMessages from '../ChatMessages/ChatMessages';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserMessages, enviarMensagem, abrirChat, alternarChat, limparMensagens, fetchUnreadMessages, markMessagesAsRead } from '../../redux/chatSlice';
import api from '../../services/api';

export default function Chat() {
    const [show, setShow] = useState(false); // Usado para mostrar a aba de usuarios do chat
    const [search, setSearch] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [mensagem, setMensagem] = useState('');
    const [allUsers, setAllUsers] = useState([]);
    const targetUser = useSelector(state => state.chat.targetUser);
    const showChatWindow = useSelector(state => state.chat.showChatWindow); // Usado para mostrar um chat com um usuario 
    const currentUser = useSelector(state => state.user.userData);
    const unreadCounts = useSelector(state => state.chat.unreadCounts); // Mapa { senderId: count }

    const dispatch = useDispatch();

    const targetUserRef = useRef(targetUser);
    const showChatWindowRef = useRef(showChatWindow);

    useEffect(() => {
        targetUserRef.current = targetUser;
        showChatWindowRef.current = showChatWindow;
    }, [targetUser, showChatWindow]);

    useEffect(() => {
        if (!currentUser) return;
        // Poll unread messages every 5 seconds
        const interval = setInterval(() => {
            dispatch(fetchUnreadMessages(currentUser.id)).then((action) => {
                const unreadMsgs = action.payload || [];
                const currentTarget = targetUserRef.current;
                const isWindowOpen = showChatWindowRef.current;

                // If chat is open with the sender of a new message
                if (isWindowOpen && currentTarget) {
                    const hasNewFromTarget = unreadMsgs.some(m => m.remetenteId === currentTarget.id);

                    if (hasNewFromTarget) {
                        // Mark as read and refresh messages
                        dispatch(markMessagesAsRead({ remetenteId: currentTarget.id, destinatarioId: currentUser.id }));
                        dispatch(fetchUserMessages({
                            remetenteId: currentUser.id,
                            destinatarioId: currentTarget.id
                        }));
                    }
                }
            });
        }, 5000);
        // Initial fetch
        dispatch(fetchUnreadMessages(currentUser.id));

        return () => clearInterval(interval);
    }, [currentUser, dispatch]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await api.get('/usuarios');
                setAllUsers(res.data || []);
            } catch (error) {
                console.error('Erro ao carregar usuários:', error);
            }
        };
        // Carrega sempre ao montar para garantir dados frescos, ou quando abrir
        if (show || currentUser) fetchUsers();
    }, [show, currentUser]);

    const handleOpenUserWindow = (user) => {
        dispatch(limparMensagens()); // Ao abrir uma conversa, limpa as mensagens antigas para forçar a atualizar o das mensagens estado
        dispatch(abrirChat(user));

        // Mark messages as read immediately
        if (currentUser) {
            dispatch(markMessagesAsRead({ remetenteId: user.id, destinatarioId: currentUser.id }));
        }

        dispatch(fetchUserMessages({
            remetenteId: currentUser.id,
            destinatarioId: user.id // targetUser.id
        }));
    };

    const toggleChatWindow = () => {
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

    function RecentContactList({ onOpen }) { // Renderiza lista de contatos recentes
        const contatos = currentUser?.contatosRecentes || [];
        // Identify users with unread messages
        const unreadIds = Object.keys(unreadCounts).map(Number);
        // Merge and unique
        const allIds = Array.from(new Set([...contatos, ...unreadIds]));

        // Filtra usuarios
        let users = allUsers.filter(user => allIds.includes(user.id));

        // Ordenacao: quem tem mais msg nao lida aparece primeiro
        users.sort((a, b) => {
            const countA = unreadCounts[a.id] || 0;
            const countB = unreadCounts[b.id] || 0;
            return countB - countA;
        });

        return (
            <>
                {users.map(user => {
                    const unread = unreadCounts[user.id] || 0;
                    return (
                        <Card key={user.id} className="mb-3" style={{ cursor: 'pointer' }} onClick={() => onOpen(user)}>
                            <Card.Body className="d-flex justify-content-between align-items-center">
                                <div>
                                    <Card.Title className="mb-0">{user.nome}</Card.Title>
                                    <Card.Subtitle className="text-muted small">{user.tipo?.name}</Card.Subtitle>
                                </div>
                                <div className="d-flex align-items-center gap-2">
                                    {unread > 0 && <Badge bg="danger" pill>{unread}</Badge>}
                                    <Button variant="outline-success" size="sm" onClick={(e) => { e.stopPropagation(); onOpen(user); }}>
                                        Conversar
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    );
                })}
            </>
        );
    }

    if (!currentUser) return null;

    // Total unread messages
    const totalUnread = Object.values(unreadCounts).reduce((acc, curr) => acc + curr, 0);

    return (
        <>      {/* Botão flutuante */}
            <button className={styles.floatingBtn} onClick={() => setShow(true)} aria-label="Abrir chat">
                <Image className={styles.floatingIcon} src={BubbleIcon} />
                {totalUnread > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.7em' }}>
                        {totalUnread > 99 ? '99+' : totalUnread}
                        <span className="visually-hidden">unread messages</span>
                    </span>
                )}
            </button>
            {/* Offcanvas de usuarios para conversar */}
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
                                <RecentContactList onOpen={handleOpenUserWindow} /> {/* Função que mostra a lista de contatos recentes do usuario atual */}
                            </ListGroup>
                        </div>
                    )}
                </Offcanvas.Body>
            </Offcanvas>
            {/* Offcanvas da conversa com um usuario */}
            <Offcanvas className={styles.chatOffcanvas} show={showChatWindow} onHide={toggleChatWindow} placement="end">
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>Chat com {targetUser?.nome}</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body className={`${styles.chatOffcanvas} d-flex flex-column h-100`}>
                    <Col xs={12} className={styles.chatWindow}>
                        <ChatMessages currentUserId={currentUser.id} /> {/* Componente que mostra as mensagens dos usuarios */}
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
