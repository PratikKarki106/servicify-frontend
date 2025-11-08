import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../services/axiosInstance';

export interface SidebarBadges {
  appointments: number;
  manageVehicles: number;
  messages: number;
}

const POLL_INTERVAL_MS = 30_000; // refresh every 30 seconds

const useSidebarBadges = (): SidebarBadges => {
  const [badges, setBadges] = useState<SidebarBadges>({
    appointments: 0,
    manageVehicles: 0,
    messages: 0,
  });

  const fetchBadges = useCallback(async () => {
    try {
      const [appointmentsRes, vehiclesRes, messagesRes] = await Promise.allSettled([
        // Pending appointments = those with status 'booked' (not yet confirmed/actioned)
        axiosInstance.get('/appointments/appointment', {
          params: { status: 'booked', limit: 1 },
        }),
        // Pending vehicles = those with status 'pending' (not yet verified/rejected)
        axiosInstance.get('/vehicles/admin/vehicles', {
          params: { status: 'pending' },
        }),
        // Unread messages sent by users to admin
        axiosInstance.get('/messages/admin/unread-count'),
      ]);

      let appointmentCount = 0;
      if (appointmentsRes.status === 'fulfilled') {
        appointmentCount =
          appointmentsRes.value.data?.pagination?.total ?? 0;
      }

      let vehicleCount = 0;
      if (vehiclesRes.status === 'fulfilled') {
        const data = vehiclesRes.value.data?.data;
        vehicleCount = Array.isArray(data) ? data.length : 0;
      }

      let messageCount = 0;
      if (messagesRes.status === 'fulfilled') {
        messageCount = messagesRes.value.data?.count ?? 0;
      }

      setBadges({
        appointments: appointmentCount,
        manageVehicles: vehicleCount,
        messages: messageCount,
      });
    } catch {
      // Silently ignore — badge counts are best-effort
    }
  }, []);

  useEffect(() => {
    fetchBadges();
    const intervalId = setInterval(fetchBadges, POLL_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, [fetchBadges]);

  return badges;
};

export default useSidebarBadges;
