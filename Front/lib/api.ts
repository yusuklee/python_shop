const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ============ Types ============

// Member
export interface Member {
  id: number;
  name: string;
  password: string;
  zip: string;
  addr1: string;
  addr2: string;
}

export interface MemberCreate {
  name: string;
  password: string;
  zip: string;
  addr1: string;
  addr2: string;
}

// Item (polymorphic: ITEM, BOOK, ALBUM, MOVIE)
export interface Item {
  id: number;
  name: string;
  price: number;
  stock: number;
  type: string;
  // Book fields
  author?: string;
  isbn?: number;
  // Album fields
  artist?: string;
  etc?: string;
  // Movie fields
  director?: string;
  actor?: string;
}

export interface BookCreate {
  name: string;
  price: number;
  stock: number;
  author: string;
  isbn: number;
}

export interface AlbumCreate {
  name: string;
  price: number;
  stock: number;
  artist: string;
  etc?: string;
}

export interface MovieCreate {
  name: string;
  price: number;
  stock: number;
  director: string;
  actor: string;
}

export interface ItemUpdate {
  name: string;
  price: number;
  stock: number;
}

// Category
export interface Category {
  id: number;
  name: string;
  description: string;
  parent_id?: number;
  children?: Category[];
}

// Order
export interface OrderItem {
  item_id: number;
  count: number;
}

export interface OrderCreate {
  zip: string;
  addr1: string;
  addr2: string;
  items: OrderItem[];
}

export interface OrderItemDetail {
  item_id: number;
  count: number;
  item_name: string;
}

export interface Order {
  id: number;
  total_price: number;
  order_date: string;
  status: string;
  member_id: number;
  order_items: OrderItemDetail[]; // Added order_items to Order interface
}

// ============ API Functions ============

// Member API
export const memberApi = {
  getAll: async (): Promise<Member[]> => {
    const res = await fetch(`${API_BASE_URL}/member/show/all`);
    if (!res.ok) throw new Error("Failed to fetch members");
    return res.json();
  },

  getById: async (id: number): Promise<Member> => {
    const res = await fetch(`${API_BASE_URL}/member/show/${id}`);
    if (!res.ok) throw new Error("Member not found");
    return res.json();
  },

  create: async (data: MemberCreate): Promise<Member> => {
    const res = await fetch(`${API_BASE_URL}/member/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.detail || "Failed to create member");
    }
    return res.json();
  },

  update: async (id: number, data: Partial<MemberCreate>): Promise<Member> => {
    const res = await fetch(`${API_BASE_URL}/member/update/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update member");
    return res.json();
  },

  delete: async (id: number): Promise<Member> => {
    const res = await fetch(`${API_BASE_URL}/member/delete/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete member");
    return res.json();
  },
};

// Item API
export const itemApi = {
  getAll: async (): Promise<Item[]> => {
    const res = await fetch(`${API_BASE_URL}/item/show/all`);
    if (!res.ok) throw new Error("Failed to fetch items");
    return res.json();
  },

  getById: async (id: number): Promise<Item> => {
    const res = await fetch(`${API_BASE_URL}/item/show/${id}`);
    if (!res.ok) throw new Error("Item not found");
    return res.json();
  },

  createBook: async (data: BookCreate): Promise<Item> => {
    const res = await fetch(`${API_BASE_URL}/item/create/book`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.detail || "Failed to create book");
    }
    return res.json();
  },

  createAlbum: async (data: AlbumCreate): Promise<Item> => {
    const res = await fetch(`${API_BASE_URL}/item/create/album`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.detail || "Failed to create album");
    }
    return res.json();
  },

  createMovie: async (data: MovieCreate): Promise<Item> => {
    const res = await fetch(`${API_BASE_URL}/item/create/movie`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.detail || "Failed to create movie");
    }
    return res.json();
  },

  update: async (id: number, data: ItemUpdate): Promise<Item> => {
    const res = await fetch(`${API_BASE_URL}/item/update/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update item");
    return res.json();
  },

  delete: async (id: number): Promise<Item> => {
    const res = await fetch(`${API_BASE_URL}/item/delete/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete item");
    return res.json();
  },
};

// Category API
export const categoryApi = {
  getById: async (id: number): Promise<Category> => {
    const res = await fetch(`${API_BASE_URL}/category/show/${id}`);
    if (!res.ok) throw new Error("Category not found");
    return res.json();
  },

  create: async (name: string, des: string): Promise<Category> => {
    const res = await fetch(`${API_BASE_URL}/category/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, des }),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.detail || "Failed to create category");
    }
    return res.json();
  },

  update: async (ca_name: string, name: string, des: string): Promise<Category> => {
    const res = await fetch(`${API_BASE_URL}/category/update`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ca_name, name, des }),
    });
    if (!res.ok) throw new Error("Failed to update category");
    return res.json();
  },

  delete: async (ca_name: string): Promise<boolean> => {
    const res = await fetch(`${API_BASE_URL}/category/delete/${ca_name}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete category");
    return res.json();
  },

  addChild: async (ca_name: string, child_name: string): Promise<Category> => {
    const res = await fetch(`${API_BASE_URL}/category/add_child`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ca_name, child_name }),
    });
    if (!res.ok) throw new Error("Failed to add child");
    return res.json();
  },

  addParent: async (ca_name: string, parent_name: string): Promise<Category> => {
    const res = await fetch(`${API_BASE_URL}/category/add_parent`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ca_name, parent_name }),
    });
    if (!res.ok) throw new Error("Failed to add parent");
    return res.json();
  },

  connectItem: async (item_id: number, ca_name: string): Promise<boolean> => {
    const res = await fetch(`${API_BASE_URL}/category/connect`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ item_id, ca_name }),
    });
    if (!res.ok) throw new Error("Failed to connect item");
    return res.json();
  },
};

// Order API
export const orderApi = {
  create: async (memberId: number, data: OrderCreate): Promise<Order> => {
    const res = await fetch(`${API_BASE_URL}/order/create/${memberId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.detail || "Failed to create order");
    }
    return res.json();
  },

  getByMemberId: async (memberId: number): Promise<Order[]> => {
    const res = await fetch(`${API_BASE_URL}/order/show/member/${memberId}`);
    if (!res.ok) throw new Error("Failed to fetch member orders");
    return res.json();
  },
};
