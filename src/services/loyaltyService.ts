import axiosInstance from "./axiosInstance";

export interface LoyaltyOffer {
  _id: string;
  name: string;
  pointsRequired: number;
  valueInRupees: number;
  conditionsJson: Record<string, unknown>;
  isActive: boolean;
}

export interface AdminRedeemedUser {
  userId: string;
  name: string;
  email: string;
  redeemedCount: number;
  totalPointsUsed: number;
  totalDiscountApplied: number;
  lastRedeemedAt: string;
}

export interface AdminLoyaltyOffer extends LoyaltyOffer {
  redemptionCount: number;
  uniqueUserCount: number;
  totalPointsRedeemed: number;
  totalDiscountGiven: number;
  redeemedUsers: AdminRedeemedUser[];
}

export interface LoyaltyBalance {
  pointsBalance: number;
  lifetimePointsEarned: number;
  lifetimePointsRedeemed: number;
  lastActivityDate: string;
}

export const getLoyaltyBalance = async (): Promise<LoyaltyBalance> => {
  const response = await axiosInstance.get("/api/loyalty/balance");
  return response.data.data;
};

export const getLoyaltyOffers = async (): Promise<LoyaltyOffer[]> => {
  const response = await axiosInstance.get("/api/loyalty/offers");
  return response.data.data || [];
};

export const getLoyaltyTransactions = async (page = 1, limit = 10) => {
  const response = await axiosInstance.get(`/api/loyalty/transactions?page=${page}&limit=${limit}`);
  return response.data;
};

export const redeemLoyaltyOffer = async (offerId: string, orderId: string | number, canCombineCoupons = false) => {
  const response = await axiosInstance.post("/api/loyalty/redeem", {
    offerId,
    orderId,
    canCombineCoupons,
  });
  return response.data;
};

export const getAdminLoyaltyOffers = async (): Promise<AdminLoyaltyOffer[]> => {
  const response = await axiosInstance.get("/api/loyalty/admin/offers");
  return response.data.data || [];
};

export const createAdminLoyaltyOffer = async (payload: {
  name: string;
  pointsRequired: number;
  valueInRupees: number;
  isActive?: boolean;
}) => {
  const response = await axiosInstance.post("/api/loyalty/admin/offers", payload);
  return response.data;
};

export const updateAdminLoyaltyOffer = async (
  offerId: string,
  payload: Partial<{
    name: string;
    pointsRequired: number;
    valueInRupees: number;
    isActive: boolean;
  }>
) => {
  const response = await axiosInstance.put(`/api/loyalty/admin/offers/${offerId}`, payload);
  return response.data;
};

export const deleteAdminLoyaltyOffer = async (offerId: string) => {
  const response = await axiosInstance.delete(`/api/loyalty/admin/offers/${offerId}`);
  return response.data;
};
