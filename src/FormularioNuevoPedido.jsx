import PropTypes from 'prop-types'
import { useState } from 'react'

function NewOrderForm({ onAdd }) {
  const [customer, setCustomer] = useState('')
  const [status, setStatus] = useState('pending')
  const [items, setItems] = useState([{ name: '', quantity: 1, price: 0, productId: Date.now() }])
  const [error, setError] = useState('')

  const handleItemChange = (idx, field, value) => {
    setItems(items => items.map((item, i) => i === idx ? { ...item, [field]: value } : item))
  }

  const handleAddItem = () => {
    setItems([...items, { name: '', quantity: 1, price: 0, productId: Date.now() + Math.random() }])
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (customer.length < 3) {
      setError('El nombre del cliente debe tener al menos 3 caracteres.')
      return
    }
    for (let item of items) {
      if (!item.name || item.quantity <= 0 || item.price <= 0) {
        setError('Todos los productos deben tener nombre, cantidad mayor a 0 y precio mayor a 0.')
        return
      }
    }
    setError('')
    onAdd({
      id: Date.now(),
      customer,
      date: new Date(),
      status,
      items: items.map(item => ({ ...item, quantity: Number(item.quantity), price: Number(item.price) })),
    })
    setCustomer('')
    setStatus('pending')
    setItems([{ name: '', quantity: 1, price: 0, productId: Date.now() }])
  }

  return (
    <form onSubmit={handleSubmit}>
      <h4>Nuevo Pedido</h4>
      {error && <p style={{color:'red'}}>{error}</p>}
      <input placeholder="Cliente" value={customer} onChange={e => setCustomer(e.target.value)} />
      <select value={status} onChange={e => setStatus(e.target.value)}>
        <option value="pending">Pendiente</option>
        <option value="shipped">Enviado</option>
        <option value="delivered">Entregado</option>
      </select>
      <h5>Productos</h5>
      {items.map((item, idx) => (
        <div key={item.productId}>
          <input placeholder="Nombre" value={item.name} onChange={e => handleItemChange(idx, 'name', e.target.value)} />
          <input type="number" min="1" placeholder="Cantidad" value={item.quantity} onChange={e => handleItemChange(idx, 'quantity', e.target.value)} />
          <input type="number" min="0.01" step="0.01" placeholder="Precio" value={item.price} onChange={e => handleItemChange(idx, 'price', e.target.value)} />
        </div>
      ))}
      <button type="button" onClick={handleAddItem}>Agregar Producto</button>
      <button type="submit">Agregar Pedido</button>
    </form>
  )
}

NewOrderForm.propTypes = {
  onAdd: PropTypes.func.isRequired,
}

export default NewOrderForm
