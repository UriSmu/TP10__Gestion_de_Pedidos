interface OrderFilterProps {
  filter: '' | 'pending' | 'shipped' | 'delivered'
  onChange: (filter: '' | 'pending' | 'shipped' | 'delivered') => void
}

function OrderFilter({ filter, onChange }: OrderFilterProps) {
  return (
    <div>
      <label>Filtrar por estado: </label>
      <select value={filter} onChange={e => onChange(e.target.value as '' | 'pending' | 'shipped' | 'delivered')}>
        <option value="">Todos</option>
        <option value="pending">Pendiente</option>
        <option value="shipped">Enviado</option>
        <option value="delivered">Entregado</option>
      </select>
    </div>
  )
}

export default OrderFilter