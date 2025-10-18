import { useSelector } from 'react-redux';

export default function ChatMessages({ currentUserId }) {
  const mensagens = useSelector(state => state.mensagens?.lista || []);

  return (
    <div className="chat-messages">
      {mensagens.map((msg, index) => (
        <div key={index} className={msg.remetenteId === currentUserId ? 'msg-enviada' : 'msg-recebida'}>
          <p>{msg.conteudo}</p>
          <small>{new Date(msg.timestamp).toLocaleString()}</small>
        </div>
      ))}
    </div>
  );
}