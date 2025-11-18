export interface OrderItem {
  id: string;
  size: string;
  quantity: number;
}

export interface SoldItem extends OrderItem {
  soldTo: string;
}

export interface PriceItem {
  size: string;
  taer: number;
  opt: number;
  nacenka: number;
}
