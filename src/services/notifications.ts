import axiosInstance from './axiosInstance';

export interface Notification {
  _id: string;
  userId: number;
  title: string;
  message: string;
  type: 'appointment' | 'service' | 'offer' | 'reminder' | 'general';
  read: boolean;
  metadata?: {
    appointmentId?: string;
    serviceId?: string;
    link?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface GetNotificationsResponse {
  success: boolean;
  notifications: Notification[];
}

export interface GetUnreadCountResponse {
  success: boolean;
  count: number;
}

export interface MarkAsReadResponse {
  success: boolean;
  notification: Notification;
}

export interface MarkAllAsReadResponse {
  success: boolean;
  message: string;
}

export const notificationService = {
  // Get all notifications for a user
  getNotifications: async (userId: number): Promise<GetNotificationsResponse> => {
    const response = await axiosInstance.get(`/notifications/user/${userId}`);
    return response.data;
  },

  // Get unread notification count for a user
  getUnreadCount: async (userId: number): Promise<GetUnreadCountResponse> => {
    const response = await axiosInstance.get(`/notifications/user/${userId}/unread-count`);
    return response.data;
  },

  // Mark a single notification as read
  markAsRead: async (notificationId: string): Promise<MarkAsReadResponse> => {
    const response = await axiosInstance.patch(`/notifications/${notificationId}/read`);
    return response.data;
  },

  // Mark all notifications as read for a user
  markAllAsRead: async (userId: number): Promise<MarkAllAsReadResponse> => {
    const response = await axiosInstance.patch(`/notifications/user/${userId}/mark-all-read`);
    return response.data;
  },
};