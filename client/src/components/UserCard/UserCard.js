import { Card, Button } from 'react-bootstrap';
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";


export default function UserCard({ user, onOpen }) {




  return (
    <Card className="mb-3">
      <Card.Body>
        <Card.Title>{user.nome}</Card.Title>
        <Card.Subtitle className="mb-2 text-muted">{user.tipo?.name}</Card.Subtitle>
        <Button variant="primary" onClick={() => onOpen(user)}>
          Ver perfil
        </Button>
      </Card.Body>
    </Card>
  );
}
