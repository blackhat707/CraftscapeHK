import type { Product } from './product.types';

export type OrderStatus = '待處理' | '已發貨' | '已完成' | '已取消';

export interface Order {
  id: string;
  customerName: string;
  product: Product;
  quantity: number;
  total: number;
  date: string;
  status: OrderStatus;
}

