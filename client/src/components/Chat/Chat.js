import { useState, useEffect } from 'react';
import { Button, Form, Offcanvas, Card, InputGroup, ListGroup, Image, Col } from 'react-bootstrap';
import BubbleIcon from '../../assets/img/chat-bubble-icon.png';
import styles from './Chat.module.css';
import ChatMessages from '../ChatMessages/ChatMessages';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserMessages, enviarMensagem, abrirChat, alternarChat, limparMensagens, fetchRecentContacts } from '../../redux/chatSlice';
import { updateUserById, queryUsers, clearSearchResults } from '../../redux/userSlice';

export default function Chat() {
    const [show, setShow] = useState(false); // Usado para mostrar a aba de usuarios do chat
    const [search, setSearch] = useState('');
    const [mensagem, setMensagem] = useState('');

    // Redux Selectors
    const targetUser = useSelector(state => state.chat.targetUser);
    const showChatWindow = useSelector(state => state.chat.showChatWindow);
    const currentUser = useSelector(state => state.user.userData);
    const recentContacts = useSelector(state => state.chat.recentContacts);
    const searchResults = useSelector(state => state.user.searchResults);

    const dispatch = useDispatch();

    useEffect(() => {
        if (show) {
            const contatos = currentUser?.contatosRecentes || [];
            dispatch(fetchRecentContacts(contatos));
        }
    }, [show, currentUser?.contatosRecentes, dispatch]);

    const handleOpenUserWindow = (user) => {
        dispatch(limparMensagens()); // Ao abrir uma conversa, limpa as mensagens antigas para forçar a atualizar o das mensagens estado
        dispatch(abrirChat(user));
        dispatch(fetchUserMessages({
            remetenteId: currentUser.id,
            destinatarioId: user.id // targetUser.id
        }));

        // Adicionar aos contatos recentes se não estiver lá
        const contatosAtuais = currentUser.contatosRecentes || [];
        if (!contatosAtuais.includes(user.id)) {
            const novosContatos = [...contatosAtuais, user.id];
            const usuarioAtualizado = {
                ...currentUser,
                contatosRecentes: novosContatos
            };
            dispatch(updateUserById(usuarioAtualizado));
        }
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
            dispatch(clearSearchResults());
            return;
        }

        dispatch(queryUsers(value));
    };

    function RecentContactList({ onOpen }) { // Renderiza lista de contatos recentes
        return (
            <>
                {recentContacts.map(user => (
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
        <>      {/* Botão flutuante */}
            <button className={styles.floatingBtn} onClick={() => setShow(true)} aria-label="Abrir chat">
                <Image className={styles.floatingIcon} src={BubbleIcon} />
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