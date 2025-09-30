
import { useState } from 'react';
import { Button, Form, Offcanvas, Card, InputGroup, ListGroup, Image } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import BubbleIcon from '../../assets/img/chat-bubble-icon.png';
import styles from './Chat.module.css';
import './Chat.module.css'

// Mock data para contatos recentes e resultados de pesquisa
const recentContacts = [
	{ id: 1, name: 'Maria Silva', type: 'Nutricionista' },
	{ id: 2, name: 'João Souza', type: 'Usuário' },
	{ id: 3, name: 'Ana Paula', type: 'Mediador' },
];

const allUsers = [
	{ id: 1, name: 'Maria Silva', type: 'Nutricionista' },
	{ id: 2, name: 'João Souza', type: 'Usuário' },
	{ id: 3, name: 'Ana Paula', type: 'Mediador' },
	{ id: 4, name: 'Carlos Mendes', type: 'Usuário' },
	{ id: 5, name: 'Fernanda Lima', type: 'Nutricionista' },
];

export default function Chat() {
	const [show, setShow] = useState(false);
	const [search, setSearch] = useState('');
	const [searchResults, setSearchResults] = useState([]);

	const handleShow = () => setShow(true);
	const handleClose = () => setShow(false);

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
										{searchResults.map(user => (
											<ListGroup.Item key={user.id}>
												<Card>
													<Card.Body>
														<Card.Title>{user.name}</Card.Title>
														<Card.Text>{user.type}</Card.Text>
													</Card.Body>
												</Card>
											</ListGroup.Item>
										))}
									</ListGroup>
								)}
							</div>
						) : (
							<div>
								<h6>Contatos recentes</h6>
								<ListGroup>
									{recentContacts.map(contact => (
										<ListGroup.Item key={contact.id}>
											<Card>
												<Card.Body>
													<Card.Title>{contact.name}</Card.Title>
													<Card.Text>{contact.type}</Card.Text>
												</Card.Body>
											</Card>
										</ListGroup.Item>
									))}
								</ListGroup>
							</div>
						)}
					</Offcanvas.Body>
				</Offcanvas>
			</>
		);
}

