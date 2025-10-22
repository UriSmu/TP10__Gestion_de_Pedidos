import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import OrderList from './ListaPedidos.js'
import type { Pedido } from './ListaPedidos.js'
import OrderFilter from './FiltroPedidos.js'
import OrderStats from './EstadisticasPedidos.js'
import NewOrderForm from './FormularioNuevoPedido.js'
import { guardarPedidos, leerPedidos } from './localStoragePedidos.js'
import './estiloPedidos.css'
import './App.css'

// Helper functions for autocomplete
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

function useTheme() {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme')
    if (saved === 'dark' || saved === 'light') return saved
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  return [theme, setTheme] as const
}

function ThemeToggle({ theme, setTheme }: { theme: string, setTheme: (t: string) => void }) {
  return (
    <button
      className="theme-toggle"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label="Cambiar modo claro/oscuro"
      style={{
        marginLeft: 'auto',
        marginRight: '0',
        background: 'none',
        border: 'none',
        fontSize: '1.5rem',
        cursor: 'pointer',
        color: 'var(--color-primary-light)',
        transition: 'color .2s'
      }}
    >
      {theme === 'dark' ? '🌙' : '☀️'}
    </button>
  )
}

function Dashboard({ orders, setOrders }: { orders: Pedido[], setOrders: React.Dispatch<React.SetStateAction<Pedido[]>> }) {
  const [filter, setFilter] = useState<'' | 'pending' | 'shipped' | 'delivered'>('')
  const filteredOrders = filter
    ? orders.filter(o =>
        o.statusHistory.length > 0 &&
        o.statusHistory[o.statusHistory.length - 1]?.status === filter
      )
    : orders
  const total = orders.length
  const pending = orders.filter(o =>
    o.statusHistory.length > 0 &&
    o.statusHistory[o.statusHistory.length - 1]?.status === 'pending'
  ).length
  const shipped = orders.filter(o =>
    o.statusHistory.length > 0 &&
    o.statusHistory[o.statusHistory.length - 1]?.status === 'shipped'
  ).length
  const delivered = orders.filter(o =>
    o.statusHistory.length > 0 &&
    o.statusHistory[o.statusHistory.length - 1]?.status === 'delivered'
  ).length

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

const PEDIDOS_DEFAULT: Pedido[] = [
  {
    id: 1,
    customer: 'Juan Pérez',
    statusHistory: [
      { status: 'pending', date: new Date('2025-09-09') }
    ],
    items: [
      { productId: 101, name: 'Mouse', quantity: 2, price: 1500 },
      { productId: 102, name: 'Teclado', quantity: 1, price: 3000 },
    ],
  },
  {
    id: 2,
    customer: 'Ana Gómez',
    statusHistory: [
      { status: 'pending', date: new Date('2025-09-12') },
      { status: 'shipped', date: new Date('2025-09-13') }
    ],
    items: [
      { productId: 103, name: 'Monitor', quantity: 1, price: 20000 },
    ],
  },
  {
    id: 3,
    customer: 'Carlos Ruiz',
    statusHistory: [
      { status: 'pending', date: new Date('2025-09-15') },
      { status: 'shipped', date: new Date('2025-09-16') },
      { status: 'delivered', date: new Date('2025-09-17') }
    ],
    items: [
      { productId: 104, name: 'Notebook', quantity: 1, price: 120000 },
    ],
  },
]

function NavBar({ theme, setTheme }: { theme: string, setTheme: (t: string) => void }) {
  const location = useLocation()
  return (
    <nav className="nav" style={{ display: 'flex', alignItems: 'center' }}>
      <Link to="/" className={location.pathname === "/" ? "active" : ""}>Pedidos</Link>
      <Link to="/nuevo" className={location.pathname === "/nuevo" ? "active" : ""}>Nuevo Pedido</Link>
      <ThemeToggle theme={theme} setTheme={setTheme} />
    </nav>
  )
}

function App() {
  const [orders, setOrders] = useState<Pedido[]>([])
  const loadedFromStorage = useRef(false)
  const [theme, setTheme] = useTheme()

  useEffect(() => {
    if (!loadedFromStorage.current) {
      const saved = leerPedidos()
      if (saved && Array.isArray(saved)) {
        setOrders(saved)
      } else {
        setOrders(PEDIDOS_DEFAULT)
      }
      loadedFromStorage.current = true
    }
  }, [])

  useEffect(() => {
    if (loadedFromStorage.current) {
      guardarPedidos(orders)
    }
  }, [orders])

  useEffect(() => {
    document.body.className = theme === 'dark' ? 'dark' : ''
  }, [theme])

  // Prepare autocomplete data
  const existingCustomers = getUniqueCustomers(orders)
  const existingProducts = getUniqueProducts(orders)

  return (
    <BrowserRouter>
      <div className="main-layout">
        <NavBar theme={theme} setTheme={setTheme} />
        <Routes>
          <Route path="/" element={<Dashboard orders={orders} setOrders={setOrders} />} />
          <Route
            path="/nuevo"
            element={
              <NewOrderForm
                onAdd={nuevo => setOrders([nuevo, ...orders])}
                existingCustomers={existingCustomers}
                existingProducts={existingProducts}
              />
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App