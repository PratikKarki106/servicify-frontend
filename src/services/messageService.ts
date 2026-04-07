import axiosInstance from "./axiosInstance";

const getAuthToken = () => localStorage.getItem("token");

export interface Message {
  _id: string;
  senderId: string;
  senderRole: "user" | "admin";
  receiverId: string;
  receiverRole?: "user" | "admin";
  content: string;
  read?: boolean;
  createdAt: string;
}

export interface Conversation {
  userId: string;
  userName?: string;
  userEmail?: string;
  lastMessage?: {
    content: string;
    createdAt: string;
    senderId: string;
  } | null;
}

export const getConversations = async (): Promise<{ success: boolean; conversations: Conversation[] }> => {
  const token = getAuthToken();
  if (!token) {
    return { success: true, conversations: [] };
  }
  const { data } = await axiosInstance.get("/messages/conversations", {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
};

export const getMessages = async (
  partnerId: string
): Promise<{ success: boolean; messages: Message[] }> => {
  const token = getAuthToken();
  if (!token) {
    return { success: true, messages: [] };
  }
  try {
    const { data } = await axiosInstance.get(
      `/messages/conversation/${encodeURIComponent(partnerId)}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return data;
  } catch (err: unknown) {
    const status = (err as { response?: { status?: number } })?.response?.status;
    if (status === 404) {
      return { success: true, messages: [] };
    }
    throw err;
  }
};

export const createMessage = async (
  receiverId: string,
  content: string
): Promise<{ success: boolean; message: Message }> => {
  const token = getAuthToken();
  const { data } = await axiosInstance.post(
    "/messages",
    { receiverId, content },
    { headers: token ? { Authorization: `Bearer ${token}` } : {} }
  );
  return data;
};

// Note: This endpoint may not exist in the backend
// If it doesn't exist, the user name will default to "User #ID"
export const getUserById = async (
  userId: string
): Promise<{ success: boolean; user?: { name: string; email: string } }> => {
  const token = getAuthToken();
  try {
    // This endpoint may need to be created in the backend
    const { data } = await axiosInstance.get(
      `/users/${userId}`,  // Alternative endpoint that might exist
      { headers: token ? { Authorization: `Bearer ${token}` } : {} }
    );
    return { success: true, user: data.user };
  } catch (err: unknown) {
    // If the specific endpoint doesn't exist, we can't get the name
    console.warn(`Could not fetch user by ID: ${userId}`, err);
    return { success: false };
  }
};
