import { Product, Order, PaymentInfo, Cryptocurrency } from '../types';

const API_BASE = '/api';

class ApiService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  // Products
  async getProducts(category?: string, search?: string): Promise<Product[]> {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (search) params.append('search', search);
    
    const response = await fetch(`${API_BASE}/products?${params}`);
    if (!response.ok) throw new Error('Failed to fetch products');
    return response.json();
  }

  async getProduct(id: number): Promise<Product> {
    const response = await fetch(`${API_BASE}/products/${id}`);
    if (!response.ok) throw new Error('Failed to fetch product');
    return response.json();
  }

  async getCategories(): Promise<string[]> {
    const response = await fetch(`${API_BASE}/products/categories/list`);
    if (!response.ok) throw new Error('Failed to fetch categories');
    return response.json();
  }

  // Orders
  async createOrder(items: { productId: number; quantity: number }[], cryptocurrency: string): Promise<{ orderId: string; totalAmount: number; cryptocurrency: string; status: string; message: string }> {
    const response = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ items, cryptocurrency }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create order');
    }
    
    return response.json();
  }

  async getOrders(): Promise<Order[]> {
    const response = await fetch(`${API_BASE}/orders`, {
      headers: this.getAuthHeaders(),
    });
    
    if (!response.ok) throw new Error('Failed to fetch orders');
    return response.json();
  }

  async getOrder(orderId: string): Promise<Order> {
    const response = await fetch(`${API_BASE}/orders/${orderId}`, {
      headers: this.getAuthHeaders(),
    });
    
    if (!response.ok) throw new Error('Failed to fetch order');
    return response.json();
  }

  // Payments
  async getCryptocurrencies(): Promise<Record<string, Cryptocurrency>> {
    const response = await fetch(`${API_BASE}/payments/cryptocurrencies`);
    if (!response.ok) throw new Error('Failed to fetch cryptocurrencies');
    return response.json();
  }

  async createPayment(orderId: string): Promise<PaymentInfo> {
    const response = await fetch(`${API_BASE}/payments/create-payment`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ orderId }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create payment');
    }
    
    return response.json();
  }

  async getPaymentStatus(orderId: string): Promise<{ orderId: string; status: string; confirmations: number; paymentAddress?: string; message?: string }> {
    const response = await fetch(`${API_BASE}/payments/status/${orderId}`, {
      headers: this.getAuthHeaders(),
    });
    
    if (!response.ok) throw new Error('Failed to check payment status');
    return response.json();
  }
}

export const apiService = new ApiService();