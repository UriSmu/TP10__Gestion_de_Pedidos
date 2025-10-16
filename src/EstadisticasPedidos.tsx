interface OrderStatsProps {
  total: number
  pending: number
  shipped: number
  delivered: number
}

function OrderStats({ total, pending, shipped, delivered }: OrderStatsProps) {
  return (
    <div className="estadisticas-pedidos">
      <h4>Estadísticas</h4>
      <p>Total: {total}</p>
      <p>Pendientes: {pending}</p>
      <p>Enviados: {shipped}</p>
      <p>Entregados: {delivered}</p>
    </div>
  )
}

export default OrderStats