import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { PDFViewer, pdf } from "@react-pdf/renderer";
import AppointmentPDF from "../../Admin/AppointmentPDF";
import { getPublicInvoiceByToken } from "../../services/bookAppointment";
import type { Appointment } from "../../types/appointment";
import "./InvoiceViewer.css";

interface InvoiceResponse {
  success: boolean;
  appointment: Appointment & {
    billItems?: Array<{
      id: string;
      itemName: string;
      itemPrice: number;
      serviceCharge?: number;
    }>;
  };
  totals: {
    subtotal: number;
    serviceCharge: number;
    total: number;
  };
}

const InvoiceViewer = () => {
  const { appointmentId } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invoice, setInvoice] = useState<InvoiceResponse | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const loadInvoice = async () => {
      if (!appointmentId || !token) {
        setError("Invalid invoice link");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await getPublicInvoiceByToken(appointmentId, token);
        if (!response.success) {
          throw new Error(response.message || "Failed to load invoice");
        }
        setInvoice(response);
      } catch (err: any) {
        setError(err.message || "Invalid or expired invoice link");
      } finally {
        setLoading(false);
      }
    };

    loadInvoice();
  }, [appointmentId, token]);

  const billItems = useMemo(
    () => (invoice?.appointment?.billItems || []).map((item: any, index) => ({
      id: item.id || `item-${index}`,
      itemName: item.itemName,
      itemPrice: item.itemPrice,
      serviceCharge: item.serviceCharge || 0
    })),
    [invoice]
  );

  const handleDownload = async () => {
    if (!invoice?.appointment) return;

    try {
      setDownloading(true);
      const blob = await pdf(
        <AppointmentPDF appointment={invoice.appointment} billItems={billItems} />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `invoice-${invoice.appointment.appointmentId}.pdf`;
      anchor.click();

      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      console.error("Failed to download invoice PDF", err);
      alert("Failed to download PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="invoice-page">
        <div className="invoice-message-card">Loading invoice...</div>
      </div>
    );
  }

  if (error || !invoice?.appointment) {
    return (
      <div className="invoice-page">
        <div className="invoice-message-card error">{error || "Invoice not found"}</div>
      </div>
    );
  }

  return (
    <div className="invoice-page">
      <div className="invoice-toolbar">
        <div>
          <h1>Servicify Invoice</h1>
          <p>Appointment #{invoice.appointment.appointmentId}</p>
        </div>
        <button
          className="invoice-download-btn"
          onClick={handleDownload}
          disabled={downloading}
        >
          {downloading ? "Preparing PDF..." : "Download PDF"}
        </button>
      </div>

      <div className="invoice-viewer-shell">
        <PDFViewer className="invoice-pdf-viewer" showToolbar>
          <AppointmentPDF appointment={invoice.appointment} billItems={billItems} />
        </PDFViewer>
      </div>
    </div>
  );
};

export default InvoiceViewer;
