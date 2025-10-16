import type { Pedido } from './ListaPedidos.js';

export function guardarPedidos(orders: Pedido[]): void;
export function leerPedidos(): Pedido[] | null;