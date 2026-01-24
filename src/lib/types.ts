export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  subcategory?: string;
  images: string[];
  colors?: string[];
  dimensions?: {
    width: number;
    height: number;
    depth: number;
  };
  materials?: string[];
  inStock: boolean;
  rating: number;
  reviewCount: number;
  vendor: string;
  tags?: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
}

export interface RoomDesign {
  id: string;
  roomType: string;
  style: string;
  budget: 'budget' | 'mid-range' | 'luxury';
  mood: string;
  products: Product[];
  aiNotes: string;
  imageUrl?: string;
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  productCount: number;
  slug: string;
}
