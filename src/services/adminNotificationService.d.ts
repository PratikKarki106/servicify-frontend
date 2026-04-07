export interface AdminNotification {
  _id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  read?: boolean;
  metadata?: {
    appointmentId?: number;
    serviceType?: string;
    [key: string]: any;
  };
  createdAt: string;
  updatedAt: string;
}

export interface GetAdminNotificationsResponse {
  success: boolean;
  notifications?: AdminNotification[];
  message?: string;
}

export interface GetUnreadCountResponse {
  success: boolean;
  count?: number;
  message?: string;
}

export interface MarkAsReadResponse {
  success: boolean;
  notification?: AdminNotification;
  message?: string;
}

export interface MarkAllAsReadResponse {
  success: boolean;
  count?: number;
  message?: string;
}

export interface DeleteNotificationResponse {
  success: boolean;
  message?: string;
}

export const getAdminNotifications: () => Promise<GetAdminNotificationsResponse>;
export const getUnreadCount: () => Promise<GetUnreadCountResponse>;
export const markAsRead: (notificationId: string) => Promise<MarkAsReadResponse>;
export const markAllAsRead: () => Promise<MarkAllAsReadResponse>;
export const deleteNotification: (notificationId: string) => Promise<DeleteNotificationResponse>;
