export function guardarPedidos(orders) {
  try {
    localStorage.setItem('orders', JSON.stringify(orders))
  } catch (e) {
    console.error('Error guardando pedidos en localStorage:', e)
  }
}

export function leerPedidos() {
  const data = localStorage.getItem('orders')
  if (!data) return null
  try {
    const arr = JSON.parse(data)
    // Convertir fechas de statusHistory a objetos Date
    return arr.map(o => ({
      ...o,
      statusHistory: Array.isArray(o.statusHistory)
        ? o.statusHistory.map(h => ({
            ...h,
            date: new Date(h.date)
          }))
        : [],
    }))
  } catch {
    return null
  }
}