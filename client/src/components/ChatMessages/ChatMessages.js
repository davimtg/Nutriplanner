import { useSelector } from 'react-redux';
import { useEffect, useRef } from 'react';
import { Card, CardBody } from 'react-bootstrap';
import styles from './ChatMessages.module.css';

export default function ChatMessages({ currentUserId }) {
  const mensagens = useSelector(state => state.chat?.lista || []);
  const mensagensOrdenadas = [...mensagens].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  const mensagensEndRef = useRef(null);

  useEffect(() => {
    if (mensagensEndRef.current) {
      mensagensEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [mensagensOrdenadas]);

  return (
    <div className={styles.chatMessagesContainer}>
      <div className={styles.chatMessage}>
        {mensagensOrdenadas.map((msg, index) => (
          <Card
            key={index}
            className={`${styles.mensagemCard} ${msg.remetenteId === currentUserId ? styles.enviada : styles.recebida}`}
          >
            <Card.Header>
              <span className={styles.remetente}>{msg.remetenteNome}</span>
            </Card.Header>
            <Card.Body className={styles.mensagemConteudo}>
              {msg.conteudo}
            </Card.Body>
            <CardBody className={styles.timestamp}>
              <span>{new Date(msg.timestamp).toLocaleString()}</span>
            </CardBody>
          </Card>
        ))}
        <div ref={mensagensEndRef} />
      </div>
    </div>
  );
}
