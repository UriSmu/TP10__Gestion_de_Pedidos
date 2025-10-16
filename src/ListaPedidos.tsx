import OrderItem from './PedidoItem.js'

export type EstadoPedido = 'pending' | 'shipped' | 'delivered';

export interface Pedido {
  id: number
  customer: string
  statusHistory: { status: EstadoPedido; date: Date }[]
  items: {
    productId: number
    name: string
    quantity: number
    price: number
  }[]
}

interface OrderListProps {
  orders: Pedido[]
  setOrders: React.Dispatch<React.SetStateAction<Pedido[]>>
}

function OrderList({ orders, setOrders }: OrderListProps) {
  const handleChangeStatus = (id: number, newStatus: EstadoPedido) => {
    setOrders(orders =>
      orders.map(o => {
        const currentStatus = o.statusHistory.length > 0
          ? o.statusHistory[o.statusHistory.length - 1]?.status
          : 'pending'
        const allowed =
          (currentStatus === 'pending' && (newStatus === 'shipped' || newStatus === 'delivered')) ||
          (currentStatus === 'shipped' && newStatus === 'delivered')
        if (o.id === id && allowed) {
          return {
            ...o,
            statusHistory: [
              ...o.statusHistory,
              { status: newStatus, date: new Date() }
            ]
          }
        }
        return o
      })
    )
  }

  return (
    <div>
      {orders.length === 0 ? (
        <p>No hay pedidos para mostrar.</p>
      ) : (
        orders.map((order) => (
          <OrderItem key={order.id} {...order} onChangeStatus={handleChangeStatus} />
        ))
      )}
    </div>
  )
}

export default OrderList