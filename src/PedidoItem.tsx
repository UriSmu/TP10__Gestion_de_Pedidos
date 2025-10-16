type EstadoPedido = 'pending' | 'shipped' | 'delivered';

interface OrderItemProps {
  id: number
  customer: string
  statusHistory: { status: EstadoPedido; date: Date }[]
  items: {
    productId: number
    name: string
    quantity: number
    price: number
  }[]
  onChangeStatus?: (id: number, newStatus: EstadoPedido) => void
}

function getNextStatus(current: EstadoPedido): EstadoPedido[] {
  if (current === 'pending') return ['shipped', 'delivered']
  if (current === 'shipped') return ['delivered']
  return []
}

function OrderItem({
  id,
  customer,
  statusHistory,
  items,
  onChangeStatus,
}: OrderItemProps) {
  const currentStatus: EstadoPedido = statusHistory.length > 0
    ? statusHistory[statusHistory.length - 1].status ?? 'pending'
    : 'pending';

  return (
    <div className="pedido-item">
      <h3>Pedido #{id}</h3>
      <p><b>Cliente:</b> {customer}</p>
      <p>
        <b>Historial de Estado:</b><br />
        {statusHistory.length > 0 ? statusHistory.map((h, idx) => (
          <span key={idx}>
            {h.date && typeof h.date === 'string'
              ? new Date(h.date).toLocaleDateString()
              : h.date instanceof Date && !isNaN(h.date.getTime())
                ? h.date.toLocaleDateString()
                : ''
            }
            {' - '}
            {h.status === 'pending' ? 'Pendiente' : h.status === 'shipped' ? 'Enviado' : 'Entregado'}
            {idx < statusHistory.length - 1 ? ' | ' : ''}
          </span>
        )) : <span>Sin historial</span>}
      </p>
      <p>
        <b>Estado actual:</b>
        <select
          value={currentStatus}
          onChange={e =>
            onChangeStatus && onChangeStatus(id, e.target.value as EstadoPedido)
          }
          disabled={getNextStatus(currentStatus).length === 0}
        >
          <option value={currentStatus}>
            {currentStatus === 'pending' ? 'Pendiente' : currentStatus === 'shipped' ? 'Enviado' : 'Entregado'}
          </option>
          {getNextStatus(currentStatus).map(s => (
            <option key={s} value={s}>
              {s === 'pending' ? 'Pendiente' : s === 'shipped' ? 'Enviado' : 'Entregado'}
            </option>
          ))}
        </select>
      </p>
      <ul>
        {items.map((item) => (
          <li key={item.productId}>
            {item.name} - Cantidad: {item.quantity}
            {item.quantity > 1
              ? (
                <>
                  {' - Precio unitario: $' + item.price}
                  {' - Total: $' + (item.price * item.quantity)}
                </>
              )
              : (
                <> - Precio: ${item.price}</>
              )
            }
          </li>
        ))}
      </ul>
    </div>
  )
}

export default OrderItem