import PropTypes from 'prop-types'
import OrderItem from './PedidoItem'

function OrderList({ orders, setOrders }) {
  // Cambiar estado de pedido
  const handleChangeStatus = (id, newStatus) => {
    setOrders(orders => orders.map(o => o.id === id ? { ...o, status: newStatus } : o))
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

OrderList.propTypes = {
  orders: PropTypes.array.isRequired,
  setOrders: PropTypes.func.isRequired,
}

export default OrderList
