import { io, Socket } from 'socket.io-client';
import type { Appointment } from '../types/appointment';

// Define the shape of appointment data received from WebSocket
interface AppointmentUpdate {
  appointmentId: string;
  status: string; // Backend sends string, frontend will cast appropriately
  previousStatus: string;
  message: string;
}

interface AppointmentCreated {
  appointment: Appointment;
  message?: string;
}

class WebSocketService {
  private socket: Socket | null = null;
  private baseUrl: string;

  constructor() {
    // Get the current IP/Hostname from the browser's URL bar
    const hostname = window.location.hostname;
    const BACKEND_PORT = 5000;
    
    // Logic: If I am on localhost, use localhost. Otherwise, use the IP I'm currently on.
    this.baseUrl = hostname === 'localhost'
      ? `http://localhost:${BACKEND_PORT}`
      : `http://${hostname}:${BACKEND_PORT}`;
  }

  connect(userId?: string | number, role?: 'user' | 'admin') {
    if (this.socket?.connected) {
      if (role === 'admin') this.socket.emit('join_admin_room');
      else if (userId != null) this.socket.emit('join_user_room', String(userId));
      return this.socket;
    }

    this.socket = io(this.baseUrl, {
      transports: ['websocket'],
      auth: {
        token: localStorage.getItem('token')
      }
    });

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server:', this.socket?.id);
      if (role === 'admin') {
        this.socket?.emit('join_admin_room');
      } else if (userId != null) {
        this.socket?.emit('join_user_room', String(userId));
      }
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });

    return this.socket;
  }

  connectForAdmin() {
    return this.connect(undefined, 'admin');
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  onNewMessage(callback: (msg: { _id: string; senderId: string; senderRole: string; receiverId: string; content: string; createdAt: string }) => void) {
    this.socket?.on('new_message', callback);
  }

  offNewMessage() {
    this.socket?.off('new_message');
  }

  sendChatMessage(senderId: string, senderRole: 'user' | 'admin', receiverId: string, content: string) {
    this.socket?.emit('send_message', { senderId, senderRole, receiverId, content });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  subscribeToAppointmentUpdates(
    onStatusUpdate: (data: AppointmentUpdate) => void,
    onNewAppointment: (data: AppointmentCreated) => void
  ) {
    if (!this.socket) {
      console.error('WebSocket not connected');
      return;
    }

    // Listen for appointment status updates
    this.socket.on('appointment_status_updated', (data: AppointmentUpdate) => {
      console.log('Appointment status updated:', data);
      onStatusUpdate(data);
    });

    // Listen for new appointments
    this.socket.on('appointment_created', (data: AppointmentCreated) => {
      console.log('New appointment created:', data);
      onNewAppointment(data);
    });
  }

  subscribeToBillUpdates(
    onBillUpdate: (data: { appointmentId: string; message: string }) => void
  ) {
    if (!this.socket) {
      console.error('WebSocket not connected');
      return;
    }

    // Listen for bill updates
    this.socket.on('bill_updated', (data: { appointmentId: string; message: string }) => {
      console.log('Bill updated:', data);
      onBillUpdate(data);
    });
  }

  unsubscribeFromUpdates() {
    if (!this.socket) return;

    this.socket.off('appointment_status_updated');
    this.socket.off('appointment_created');
    this.socket.off('bill_updated');
  }
}

export const websocketService = new WebSocketService();