import { type AdminOrder } from "./api";

export const MOCK_ORDERS: AdminOrder[] = [
  { id: "ORD-7392", customerName: "Rahul Krishnan", date: new Date().toISOString(), status: "pending", total: 4250 },
  { id: "ORD-7391", customerName: "Anjali Menon", date: new Date(Date.now() - 86400000).toISOString(), status: "processing", total: 1850 },
  { id: "ORD-7390", customerName: "Vishnu V", date: new Date(Date.now() - 172800000).toISOString(), status: "shipped", total: 6400 },
  { id: "ORD-7389", customerName: "Sneha Thomas", date: new Date(Date.now() - 259200000).toISOString(), status: "delivered", total: 950 },
  { id: "ORD-7388", customerName: "Deepak S", date: new Date(Date.now() - 432000000).toISOString(), status: "pending", total: 12400 },
];
