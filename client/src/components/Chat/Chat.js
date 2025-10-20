
import { useState, useEffect } from 'react';
import { Button, Form, Offcanvas, Card, InputGroup, ListGroup, Image, Modal, Container, Col, Row } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import BubbleIcon from '../../assets/img/chat-bubble-icon.png';
import styles from './Chat.module.css';
import './Chat.module.css'
import UserCard from '../UserCard/UserCard'
import ChatMessages from '../ChatMessages/ChatMessages'
import { useDispatch, useSelector } from 'react-redux';
import { addMensagem, fetchUserMessages } from '../../redux/chatSlice';


// Mock data para contatos recentes e resultados de pesquisa


const allUsers = [
	{ id: 1, name: 'Maria Silva', type: 'Nutricionista' },
	{ id: 2, name: 'João Souza', type: 'Usuário' },
	{ id: 3, name: 'Ana Paula', type: 'Mediador' },
	{ id: 4, name: 'Carlos Mendes', type: 'Usuário' },
	{ id: 5, name: 'Fernanda Lima', type: 'Nutricionista' },
];

export default function Chat() {
	const [show, setShow] = useState(false);
	const [showChatWindow, setShowChatWindow] = useState(false);
	const [search, setSearch] = useState('');
	const [searchResults, setSearchResults] = useState([]);
	const handleShow = () => setShow(prev => !prev);
	const handleClose = () => setShow(false);
	const [mensagem, setMensagem] = useState('');
	const dispatch = useDispatch();
	const [targetUser, setTargetUser] = useState(null);
	const currentUser = useSelector(state => state.user.currentUser);

	useEffect(() => {
		if (targetUser && currentUser) {
			dispatch(fetchUserMessages({
				remetenteId: currentUser.id,
				destinatarioId: targetUser.id
			}));
		}
	}, [targetUser, dispatch, currentUser]);

	const handleOpenUserWindow = (user) => {
		setTargetUser(user);
		setShowChatWindow(true);
	};
	const handleCloseChatWindow = () => {
		setShowChatWindow(false);
		setTargetUser(null);
	};
	if (!currentUser) {
		return (<></>
		);
	}



	const handleSearch = (e) => {
		const value = e.target.value;
		setSearch(value);
		if (value.trim() === '') {
			setSearchResults([]);
			return;
		}
		const results = allUsers.filter(user =>
			user.name.toLowerCase().includes(value.toLowerCase())
		);
		setSearchResults(results);
	};



	function RecentContactList({ onOpen }) {
		const currentUser = useSelector(state => state.user.currentUser);
		const [users, setUsers] = useState([]);

		useEffect(() => {
			(async () => {
				try {
					const ids = currentUser?.contatosRecentes || [];
					const requests = ids.map(id =>
						fetch(`http://localhost:3001/usuarios/${id}`).then(res => res.json())
					);
					const results = await Promise.all(requests);
					setUsers(results);
				} catch (error) {
					console.error("Erro ao buscar contatos recentes:", error);
				}
			})();
		}, [currentUser]);
		return (<>
			{users.map(user => (
				<UserCard key={user.id} user={user} onOpen={onOpen} />
			))}
		</>);
	}

	const handleEnviarMensagem = async () => {
		if (!mensagem.trim()) return;
		console.log("enviou");
		const novaMensagem = {
			conteudo: mensagem,
			remetenteId: currentUser.id,
			destinatarioId: targetUser.id,
			timestamp: new Date().toISOString(),
			status: 'enviada'
		};

		try {
			const response = await fetch('http://localhost:3001/mensagens', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(novaMensagem)
			});

			const dadosSalvos = await response.json();
			dispatch(addMensagem(dadosSalvos));
			setMensagem(''); // limpa campo de texto
		} catch (error) {
			console.error('Erro ao enviar mensagem:', error);
		}
	};

	return (
		<>
			<Button className={styles.floatingBtn} onClick={handleShow} aria-label="Abrir chat">
				<Image className={styles.floatingIcon} src={BubbleIcon} />
			</Button>

			<Offcanvas show={show} onHide={handleClose} placement="end">
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
					<Offcanvas.Title>Chat com {targetUser?.name}</Offcanvas.Title>
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
