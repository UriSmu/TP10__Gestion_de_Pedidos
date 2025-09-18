// Utilidades para persistir pedidos en localStorage
export function guardarPedidos(orders) {
  localStorage.setItem('orders', JSON.stringify(orders))
}

export function leerPedidos() {
  const data = localStorage.getItem('orders')
  if (!data) return null
  try {
    const arr = JSON.parse(data)
    // Convertir fechas a objetos Date
    return arr.map(o => ({ ...o, date: new Date(o.date) }))
  } catch {
    return null
  }
}
