
import { useState } from 'react';
import { Button, Form, Offcanvas, Card, InputGroup, ListGroup, Image, Row, Col } from 'react-bootstrap';
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
	const [showBtn, setShowBtn] = useState(true);
	const [search, setSearch] = useState('');
	const [searchResults, setSearchResults] = useState([]);

	const handleShow = () => { setShow(true); setShowBtn(false); }
	const handleClose = () =>{ setShow(false); setShowBtn(true); }

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

return (<>
	{showBtn && (
	<Button className={styles.floatingBtn} variant="success" onClick={handleShow} aria-label="Abrir chat">
		<Image className={styles.floatingIcon} src={BubbleIcon} />
	</Button>)}

	<Offcanvas show={show} onHide={handleClose} placement="end" scroll={true} backdrop={false} className={styles.chatOffcanvas}>
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
					<Col>{searchResults.map(user => (
						<Card as={Button} variant="success" className={styles.chatCard}>
							<Card.Body key={user.id} >
								<Card.Title>{user.name}</Card.Title>
								<Card.Text>{user.type}</Card.Text>
							</Card.Body>
						</Card>
					))}
					</Col>
					)}
				</div>
			) : (
				<div>
					<h6>Contatos recentes</h6>
					<Col>{recentContacts.map(contact => (
						<Card as={Button} variant="success" className={styles.chatCard} key={contact.id}>
							<Card.Body>
								<Card.Title>{contact.name}</Card.Title>
								<Card.Text>{contact.type}</Card.Text>
							</Card.Body>
						</Card>))}
					</Col>
				</div>
			)}
		</Offcanvas.Body>
	</Offcanvas>
</>
	);
}

