import axiosInstance from "./axiosInstance";

export const getCart = async () => {
  const res = await axiosInstance.get("/api/cart");
  return res.data;
};

export const addToCart = async (catalogItemId: string, quantity = 1) => {
  const res = await axiosInstance.post("/api/cart/add", { catalogItemId, quantity });
  return res.data;
};

export const updateCartItem = async (catalogItemId: string, quantity: number) => {
  const res = await axiosInstance.patch("/api/cart/item", { catalogItemId, quantity });
  return res.data;
};

export const checkoutCart = async () => {
  const res = await axiosInstance.post("/api/cart/checkout");
  return res.data;
};

export const getMyPurchases = async () => {
  const res = await axiosInstance.get("/api/purchases/me");
  return res.data;
};

export const getAllPurchases = async () => {
  const res = await axiosInstance.get("/api/purchases/admin");
  return res.data;
};
