import axios from 'axios';

const API_URL = 'http://localhost:5000/admin/notifications';

// Get all admin notifications
export const getAdminNotifications = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching admin notifications:', error);
    return {
      success: false,
      message: error.message
    };
  }
};

// Get unread notification count
export const getUnreadCount = async () => {
  try {
    const response = await axios.get(`${API_URL}/unread-count`);
    return response.data;
  } catch (error) {
    console.error('Error fetching unread count:', error);
    return {
      success: false,
      message: error.message
    };
  }
};

// Mark notification as read
export const markAsRead = async (notificationId) => {
  try {
    const response = await axios.patch(`${API_URL}/${notificationId}/read`);
    return response.data;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return {
      success: false,
      message: error.message
    };
  }
};

// Mark all notifications as read
export const markAllAsRead = async () => {
  try {
    const response = await axios.patch(`${API_URL}/mark-all-read`);
    return response.data;
  } catch (error) {
    console.error('Error marking all as read:', error);
    return {
      success: false,
      message: error.message
    };
  }
};

// Delete notification
export const deleteNotification = async (notificationId) => {
  try {
    const response = await axios.delete(`${API_URL}/${notificationId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting notification:', error);
    return {
      success: false,
      message: error.message
    };
  }
};
