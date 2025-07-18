export interface Product {
  id: string;
  name: string;
  category: string;
  quantity: number;
  minQuantity: number;
  costPrice: number;
  sellingPrice: number;
  supplier: string;
  barcode?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Sale {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  date: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}