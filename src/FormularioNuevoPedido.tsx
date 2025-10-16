import { useState } from 'react'
import type { Pedido, EstadoPedido } from './ListaPedidos.js'

interface NewOrderFormProps {
  onAdd: (pedido: Pedido) => void
}

function isValidString(str: string): boolean {
  return str.length >= 3 && isNaN(Number(str.trim()))
}

function NewOrderForm({ onAdd }: NewOrderFormProps) {
  const [customer, setCustomer] = useState<string>('')
  const [status, setStatus] = useState<EstadoPedido>('pending')
  const [items, setItems] = useState<Pedido['items']>([
    { name: '', quantity: 1, price: 0, productId: Date.now() }
  ])
  const [error, setError] = useState<string>('')

  const handleItemChange = (idx: number, field: keyof Pedido['items'][0], value: string | number) => {
    setItems(items =>
      items.map((item, i) =>
        i === idx ? { ...item, [field]: value } : item
      )
    )
  }

  const handleAddItem = () => {
    setItems([...items, { name: '', quantity: 1, price: 0, productId: Date.now() + Math.random() }])
  }

  const handleRemoveItem = (idx: number) => {
    setItems(items => items.filter((_, i) => i !== idx))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValidString(customer)) {
      setError('El nombre del cliente debe ser texto, no solo números, y tener al menos 3 caracteres.')
      return
    }
    for (let item of items) {
      if (!isValidString(item.name)) {
        setError('El nombre de cada producto debe ser texto, no solo números, y tener al menos 3 caracteres.')
        return
      }
      if (item.quantity <= 0 || item.price <= 0) {
        setError('Todos los productos deben tener cantidad mayor a 0 y precio mayor a 0.')
        return
      }
    }
    setError('')
    onAdd({
      id: Date.now(),
      customer,
      statusHistory: [{ status, date: new Date() }],
      items: items.map(item => ({
        ...item,
        quantity: Number(item.quantity),
        price: Number(item.price)
      })),
    })
    setCustomer('')
    setStatus('pending')
    setItems([{ name: '', quantity: 1, price: 0, productId: Date.now() }])
  }

  return (
    <form onSubmit={handleSubmit} className="nuevo-pedido-form">
      <h2>Nuevo Pedido</h2>
      {error && <p style={{color:'red'}}>{error}</p>}

      <fieldset>
        <legend>Cliente y Estado</legend>
        <div>
          <label htmlFor="cliente">Cliente:</label>
          <input
            id="cliente"
            placeholder="Nombre del cliente"
            value={customer}
            onChange={e => setCustomer(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="estado">Estado:</label>
          <select
            id="estado"
            value={status}
            onChange={e => setStatus(e.target.value as EstadoPedido)}
          >
            <option value="pending">Pendiente</option>
            <option value="shipped">Enviado</option>
            <option value="delivered">Entregado</option>
          </select>
        </div>
      </fieldset>

      <fieldset>
        <legend>Producto/s</legend>
        {items.map((item, idx) => (
          <div key={item.productId} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <div>
              <label>Nombre:</label>
              <input
                placeholder="Nombre del producto"
                value={item.name}
                onChange={e => handleItemChange(idx, 'name', e.target.value)}
              />
            </div>
            <div>
              <label>Cantidad:</label>
              <input
                type="number"
                min="1"
                placeholder="Cantidad"
                value={item.quantity === 0 ? '' : item.quantity}
                onChange={e => handleItemChange(idx, 'quantity', Number(e.target.value))}
                style={{ width: 60 }}
              />
            </div>
            <div>
              <label>Precio unitario:</label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute',
                  left: 6,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#888'
                }}>$</span>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="Precio"
                  value={item.price === 0 ? '' : item.price}
                  onChange={e => handleItemChange(idx, 'price', Number(e.target.value))}
                  style={{ paddingLeft: 18, width: 80 }}
                />
              </div>
            </div>
            {item.quantity > 1 && (
              <div style={{ fontSize: 12, color: '#555' }}>
                Total: ${item.price * item.quantity}
              </div>
            )}
            {idx > 0 && (
              <button
                type="button"
                onClick={() => handleRemoveItem(idx)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'red',
                  fontWeight: 'bold',
                  fontSize: 18,
                  cursor: 'pointer',
                  marginLeft: 4
                }}
                aria-label="Eliminar producto"
                title="Eliminar producto"
              >
                ×
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={handleAddItem} style={{ marginTop: 8 }}>
          Agregar Producto
        </button>
      </fieldset>

      <button type="submit" style={{ marginTop: 16 }}>Agregar Pedido</button>
    </form>
  )
}

export default NewOrderForm