import PropTypes from 'prop-types'

function OrderItem({ id, customer, date, status, items, onChangeStatus }) {
  return (
    <div className="pedido-item">
      <h3>Pedido #{id}</h3>
      <p><b>Cliente:</b> {customer}</p>
      <p><b>Fecha:</b> {date.toLocaleDateString()}</p>
      <p><b>Estado:</b> 
        <select value={status} onChange={e => onChangeStatus && onChangeStatus(id, e.target.value)}>
          <option value="pending">Pendiente</option>
          <option value="shipped">Enviado</option>
          <option value="delivered">Entregado</option>
        </select>
      </p>
      <ul>
        {items.map((item) => (
          <li key={item.productId}>
            {item.name} - Cantidad: {item.quantity} - Precio: ${item.price}
          </li>
        ))}
      </ul>
    </div>
  )
}

OrderItem.propTypes = {
  id: PropTypes.number.isRequired,
  customer: function(props, propName, componentName) {
    if (typeof props[propName] !== 'string' || props[propName].length < 3) {
      return new Error('El customer debe ser un string de al menos 3 caracteres.');
    }
  },
  date: PropTypes.instanceOf(Date),
  status: PropTypes.oneOf(['pending', 'shipped', 'delivered']),
  items: PropTypes.arrayOf(PropTypes.shape({
    productId: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    quantity: function(props, propName, componentName) {
      if (typeof props[propName] !== 'number' || props[propName] <= 0) {
        return new Error('La cantidad debe ser un número mayor a 0.');
      }
    },
    price: PropTypes.number.isRequired,
  })).isRequired,
  onChangeStatus: PropTypes.func,
}

OrderItem.defaultProps = {
  status: 'pending',
  date: new Date(),
}

export default OrderItem
