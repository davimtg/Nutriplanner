import React, { useEffect, useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import api from '../../services/api';

const PedidoConfirmacaoModal = () => {
    const [show, setShow] = useState(false);
    const [pendencias, setPendencias] = useState([]);
    const [itemAtual, setItemAtual] = useState(null);
    const { userData: user } = useSelector((state) => state.user);

    useEffect(() => {
        const checkPendencias = async () => {
            if (!user || !user.id) return;

            try {
                // 1. Buscar pedidos aguardando confirmação
                const pedidosRes = await api.get(`/pedidos?userId=${user.id}`);
                const pedidosAguardando = pedidosRes.data.filter(p => {
                    const statusName = typeof p.status === 'string' ? p.status : p.status?.name;
                    return statusName === 'Aguardando Confirmação';
                });

                // 2. Buscar notificações de cancelamento (mensagens do tipo pedido_cancelado e não lidas)
                const mensagensRes = await api.get(`/mensagens?destinatarioId=${user.id}&lida=false`);
                const notifCancelamento = mensagensRes.data.filter(m => m.tipo === 'pedido_cancelado');

                // 3. Combinar tudo
                const todasPendencias = [
                    ...notifCancelamento.map(m => ({ ...m, isCancelamento: true })),
                    ...pedidosAguardando.map(p => ({ ...p, isCancelamento: false }))
                ];

                if (todasPendencias.length > 0) {
                    setPendencias(todasPendencias);
                    setItemAtual(todasPendencias[0]);
                    setShow(true);
                }
            } catch (error) {
                console.error('Erro ao verificar pendências:', error);
            }
        };

        checkPendencias();
    }, [user]);

    const handleMarcarLida = async () => {
        if (!itemAtual || !itemAtual.isCancelamento) return;

        try {
            await api.patch(`/mensagens/${itemAtual.id}`, { lida: true });

            const novaLista = pendencias.filter(p => p.id !== itemAtual.id);
            setPendencias(novaLista);

            if (novaLista.length > 0) {
                setItemAtual(novaLista[0]);
            } else {
                setShow(false);
            }
        } catch (error) {
            console.error('Erro ao marcar como lida:', error);
        }
    };

    const handleConfirmarRecebimento = async () => {
        if (!itemAtual) return;

        try {
            await api.patch(`/pedidos/${itemAtual.id}`, { status: 'Concluído' });

            // Remover da lista
            const novaLista = pendencias.filter(p => p.id !== itemAtual.id);
            setPendencias(novaLista);

            if (novaLista.length > 0) {
                setItemAtual(novaLista[0]);
            } else {
                setShow(false);
            }

            alert('Pedido confirmado com sucesso!');
        } catch (error) {
            console.error('Erro ao confirmar pedido:', error);
            alert('Erro ao confirmar pedido. Tente novamente.');
        }
    };

    const handleFechar = () => {
        setShow(false);
    };

    if (!itemAtual) return null;

    const isCancelamento = itemAtual.isCancelamento;

    return (
        <Modal show={show} onHide={handleFechar} centered backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>
                    {isCancelamento ? '❌ Pedido Cancelado' : '🛒 Confirmar Recebimento do Pedido'}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="text-center mb-3">
                    <h5>Pedido #{itemAtual.pedidoId || itemAtual.id}</h5>
                    {isCancelamento ? (
                        <div className="alert alert-danger mt-3">
                            <p className="mb-0">
                                <strong>⚠️ Este pedido foi cancelado pelo mediador.</strong>
                            </p>
                            <p className="small mb-0 mt-2">
                                {itemAtual.texto}
                            </p>
                        </div>
                    ) : (
                        <>
                            <p className="text-muted">
                                O mediador finalizou as compras do seu pedido.
                            </p>
                            <p className="mb-3">
                                Por favor, confirme se você recebeu todos os itens corretamente.
                            </p>
                        </>
                    )}
                </div>

                {pendencias.length > 1 && (
                    <p className="small text-muted">
                        Você tem {pendencias.length} {isCancelamento ? 'notificações' : 'pedidos aguardando confirmação'}.
                    </p>
                )}
            </Modal.Body>
            <Modal.Footer className="d-flex justify-content-end">
                {isCancelamento ? (
                    <Button variant="primary" onClick={handleMarcarLida} className="w-100">
                        OK, Entendi
                    </Button>
                ) : (
                    <>
                        <Button variant="secondary" onClick={handleFechar} className="me-2">
                            Depois
                        </Button>
                        <Button variant="success" onClick={handleConfirmarRecebimento}>
                            ✓ Confirmar Recebimento
                        </Button>
                    </>
                )}
            </Modal.Footer>
        </Modal>
    );
};

export default PedidoConfirmacaoModal;
