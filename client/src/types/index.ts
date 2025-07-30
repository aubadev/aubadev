export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  stock: number;
  category: string;
  active: number;
  created_at: string;
}

export interface CartItem {
  productId: number;
  quantity: number;
  product?: Product;
}

export interface Order {
  id: string;
  user_id: number;
  total_amount: number;
  cryptocurrency: string;
  payment_address?: string;
  payment_status: 'pending' | 'confirmed' | 'failed';
  shipping_status: 'pending' | 'processing' | 'shipped' | 'delivered';
  created_at: string;
  shipped_at?: string;
  auto_delete_at: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: number;
  order_id: string;
  product_id: number;
  quantity: number;
  price: number;
  product_name?: string;
}

export interface PaymentInfo {
  orderId: string;
  paymentAddress: string;
  cryptocurrency: string;
  amount: number;
  usdAmount: number;
  expiresIn: number;
  qrCode: string;
  instructions: string;
}

export interface Cryptocurrency {
  name: string;
  symbol: string;
  decimals: number;
}