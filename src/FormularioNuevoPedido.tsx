import { useState, useRef, useEffect } from 'react'
import type { Pedido, EstadoPedido } from './ListaPedidos.js'

interface NewOrderFormProps {
  onAdd: (pedido: Pedido) => void
  existingCustomers?: string[]
  existingProducts?: { name: string, price: number }[]
}

function isValidString(str: string): boolean {
  return str.length >= 3 && isNaN(Number(str.trim()))
}

function getUniqueCustomers(orders: Pedido[]): string[] {
  const set = new Set<string>()
  for (const o of orders) set.add(o.customer)
  return Array.from(set)
}

function getUniqueProducts(orders: Pedido[]): { name: string, price: number }[] {
  const map = new Map<string, number>()
  for (const o of orders) {
    for (const item of o.items) {
      if (!map.has(item.name)) {
        map.set(item.name, item.price)
      }
    }
  }
  return Array.from(map.entries()).map(([name, price]) => ({ name, price }))
}

function NewOrderForm({
  onAdd,
  existingCustomers = [],
  existingProducts = [],
}: NewOrderFormProps) {
  const [customer, setCustomer] = useState<string>('')
  const [status, setStatus] = useState<EstadoPedido>('pending')
  const [items, setItems] = useState<Pedido['items']>([
    { name: '', quantity: 1, price: 0, productId: Date.now() }
  ])
  const [error, setError] = useState<string>('')

  // Autocomplete state for customer
  const [customerSuggestions, setCustomerSuggestions] = useState<string[]>([])
  const [showCustomerSuggestions, setShowCustomerSuggestions] = useState(false)
  const customerInputRef = useRef<HTMLInputElement>(null)

  // Autocomplete state for products
  const [productSuggestions, setProductSuggestions] = useState<string[][]>(
    [[]]
  )
  const [showProductSuggestions, setShowProductSuggestions] = useState<boolean[]>(
    [false]
  )

  useEffect(() => {
    setProductSuggestions(items.map(() => []))
    setShowProductSuggestions(items.map(() => false))
  }, [items.length])

  // Customer autocomplete logic
  const handleCustomerChange = (val: string) => {
    setCustomer(val)
    if (val.length >= 1) {
      const filtered = existingCustomers.filter(c =>
        c.toLowerCase().includes(val.toLowerCase())
      )
      setCustomerSuggestions(filtered)
      setShowCustomerSuggestions(filtered.length > 0)
    } else {
      setShowCustomerSuggestions(false)
    }
  }

  const handleCustomerSuggestionClick = (suggestion: string) => {
    setCustomer(suggestion)
    setShowCustomerSuggestions(false)
    customerInputRef.current?.blur()
  }

  // Product autocomplete logic
  const handleItemChange = (
    idx: number,
    field: keyof Pedido['items'][0],
    value: string | number
  ) => {
    setItems(items =>
      items.map((item, i) =>
        i === idx ? { ...item, [field]: value } : item
      )
    )
    if (field === 'name' && typeof value === 'string') {
      if (value.length >= 1) {
        const filtered = existingProducts
          .filter(p => p.name.toLowerCase().includes(value.toLowerCase()))
          .map(p => p.name)
        setProductSuggestions(sugs =>
          sugs.map((arr, i) => (i === idx ? filtered : arr))
        )
        setShowProductSuggestions(shows =>
          shows.map((show, i) => (i === idx ? filtered.length > 0 : show))
        )
      } else {
        setShowProductSuggestions(shows =>
          shows.map((show, i) => (i === idx ? false : show))
        )
      }
    }
  }

  const handleProductSuggestionClick = (idx: number, suggestion: string) => {
    // Find price for this product
    const prod = existingProducts.find(p => p.name === suggestion)
    setItems(items =>
      items.map((item, i) =>
        i === idx
          ? {
              ...item,
              name: suggestion,
              price: prod ? prod.price : item.price,
            }
          : item
      )
    )
    setShowProductSuggestions(shows =>
      shows.map((show, i) => (i === idx ? false : show))
    )
  }

  const handleAddItem = () => {
    setItems([
      ...items,
      { name: '', quantity: 1, price: 0, productId: Date.now() + Math.random() },
    ])
    setProductSuggestions(sugs => [...sugs, []])
    setShowProductSuggestions(shows => [...shows, false])
  }

  const handleRemoveItem = (idx: number) => {
    setItems(items => items.filter((_, i) => i !== idx))
    setProductSuggestions(sugs => sugs.filter((_, i) => i !== idx))
    setShowProductSuggestions(shows => shows.filter((_, i) => i !== idx))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValidString(customer)) {
      setError(
        'El nombre del cliente debe ser texto, no solo números, y tener al menos 3 caracteres.'
      )
      return
    }
    for (let item of items) {
      if (!isValidString(item.name)) {
        setError(
          'El nombre de cada producto debe ser texto, no solo números, y tener al menos 3 caracteres.'
        )
        return
      }
      if (item.quantity <= 0 || item.price <= 0) {
        setError(
          'Todos los productos deben tener cantidad mayor a 0 y precio mayor a 0.'
        )
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
        price: Number(item.price),
      })),
    })
    setCustomer('')
    setStatus('pending')
    setItems([{ name: '', quantity: 1, price: 0, productId: Date.now() }])
    setProductSuggestions([[]])
    setShowProductSuggestions([false])
  }

  return (
    <form onSubmit={handleSubmit} className="nuevo-pedido-form" autoComplete="off">
      <h2>Nuevo Pedido</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <fieldset>
        <legend>Cliente y Estado</legend>
        <div style={{ position: 'relative' }}>
          <label htmlFor="cliente">Cliente:</label>
          <input
            id="cliente"
            placeholder="Nombre del cliente"
            value={customer}
            onChange={e => handleCustomerChange(e.target.value)}
            onFocus={() => {
              if (customer.length >= 1 && customerSuggestions.length > 0)
                setShowCustomerSuggestions(true)
            }}
            onBlur={() => setTimeout(() => setShowCustomerSuggestions(false), 120)}
            ref={customerInputRef}
            autoComplete="off"
          />
          {showCustomerSuggestions && (
            <ul
              style={{
                position: 'absolute',
                zIndex: 10,
                background: 'white',
                border: '1px solid #ccc',
                width: '100%',
                listStyle: 'none',
                margin: 0,
                padding: 0,
                maxHeight: 120,
                overflowY: 'auto',
              }}
              className="autocomplete-list"
            >
              {customerSuggestions.map(sug => (
                <li
                  key={sug}
                  style={{
                    padding: '4px 8px',
                    cursor: 'pointer',
                  }}
                  onMouseDown={e => {
                    e.preventDefault()
                    handleCustomerSuggestionClick(sug)
                  }}
                >
                  {sug}
                </li>
              ))}
            </ul>
          )}
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
          <div
            key={item.productId}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 8,
              position: 'relative',
            }}
          >
            <div style={{ position: 'relative' }}>
              <label>Nombre:</label>
              <input
                placeholder="Nombre del producto"
                value={item.name}
                onChange={e => handleItemChange(idx, 'name', e.target.value)}
                onFocus={() => {
                  if (
                    item.name.length >= 1 &&
                    productSuggestions[idx] &&
                    productSuggestions[idx].length > 0
                  )
                    setShowProductSuggestions(shows =>
                      shows.map((show, i) => (i === idx ? true : show))
                    )
                }}
                onBlur={() =>
                  setTimeout(
                    () =>
                      setShowProductSuggestions(shows =>
                        shows.map((show, i) => (i === idx ? false : show))
                      ),
                    120
                  )
                }
                autoComplete="off"
              />
              {showProductSuggestions[idx] && productSuggestions[idx] && (
                <ul
                  style={{
                    position: 'absolute',
                    zIndex: 10,
                    background: 'white',
                    border: '1px solid #ccc',
                    width: '100%',
                    listStyle: 'none',
                    margin: 0,
                    padding: 0,
                    maxHeight: 120,
                    overflowY: 'auto',
                  }}
                  className="autocomplete-list"
                >
                  {productSuggestions[idx].map(sug => (
                    <li
                      key={sug}
                      style={{
                        padding: '4px 8px',
                        cursor: 'pointer',
                      }}
                      onMouseDown={e => {
                        e.preventDefault()
                        handleProductSuggestionClick(idx, sug)
                      }}
                    >
                      {sug}
                    </li>
                  ))}
                </ul>
              )}
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
                <span
                  style={{
                    position: 'absolute',
                    left: 6,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#888',
                  }}
                >
                  $
                </span>
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
                  marginLeft: 4,
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

      <button type="submit" style={{ marginTop: 16 }}>
        Agregar Pedido
      </button>
    </form>
  )
}

export default NewOrderForm