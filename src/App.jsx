import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import OrderList from './ListaPedidos'
import OrderFilter from './FiltroPedidos'
import OrderStats from './EstadisticasPedidos'
import NewOrderForm from './FormularioNuevoPedido'
import { guardarPedidos, leerPedidos } from './localStoragePedidos'
import './estiloPedidos.css'

function Dashboard({ orders, setOrders }) {
  const [filter, setFilter] = useState('')
  const navigate = useNavigate()

  const filteredOrders = filter ? orders.filter(o => o.status === filter) : orders
  const total = orders.length
  const pending = orders.filter(o => o.status === 'pending').length
  const shipped = orders.filter(o => o.status === 'shipped').length
  const delivered = orders.filter(o => o.status === 'delivered').length

  return (
    <div className="dashboard">
      <h1>Gestión de Pedidos - MailAméricas</h1>
      <OrderStats total={total} pending={pending} shipped={shipped} delivered={delivered} />
      <OrderFilter filter={filter} onChange={setFilter} />
      <h2>Lista de Pedidos</h2>
      <OrderList orders={filteredOrders} setOrders={setOrders} />
    </div>
  )
}

function App() {
  const [orders, setOrders] = useState([])

  useEffect(() => {
    const saved = leerPedidos()
    if (saved && saved.length > 0) setOrders(saved)
    else if (!saved) setOrders([
      {
        id: 1,
        customer: 'Juan Pérez',
        date: new Date('2025-09-10'),
        status: 'pending',
        items: [
          { productId: 101, name: 'Mouse', quantity: 2, price: 1500 },
          { productId: 102, name: 'Teclado', quantity: 1, price: 3000 },
        ],
      },
      {
        id: 2,
        customer: 'Ana Gómez',
        date: new Date('2025-09-12'),
        status: 'shipped',
        items: [
          { productId: 103, name: 'Monitor', quantity: 1, price: 20000 },
        ],
      },
      {
        id: 3,
        customer: 'Carlos Ruiz',
        date: new Date('2025-09-15'),
        status: 'delivered',
        items: [
          { productId: 104, name: 'Notebook', quantity: 1, price: 120000 },
        ],
      },
    ])
  }, [])

  useEffect(() => {
    guardarPedidos(orders)
  }, [orders])

  return (
    <BrowserRouter>
      <div className="main-layout">
        <nav className="nav">
          <Link to="/">Pedidos</Link>
          <Link to="/nuevo">Nuevo Pedido</Link>
        </nav>
        <Routes>
          <Route path="/" element={<Dashboard orders={orders} setOrders={setOrders} />} />
          <Route path="/nuevo" element={<NewOrderForm onAdd={nuevo => setOrders([nuevo, ...orders])} />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
