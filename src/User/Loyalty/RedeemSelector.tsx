import React, { useEffect, useState } from "react";
import { getLoyaltyOffers, redeemLoyaltyOffer, type LoyaltyOffer } from "../../services/loyaltyService";

interface RedeemSelectorProps {
  orderId: string | number;
  onRedeemed?: (summary: { pointsUsed: number; discountApplied: number }) => void;
}

const RedeemSelector: React.FC<RedeemSelectorProps> = ({ orderId, onRedeemed }) => {
  const [offers, setOffers] = useState<LoyaltyOffer[]>([]);
  const [selectedOffer, setSelectedOffer] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const loadOffers = async () => {
      const data = await getLoyaltyOffers();
      setOffers(data);
    };
    loadOffers();
  }, []);

  const handleRedeem = async () => {
    if (!selectedOffer) return;
    setLoading(true);
    setFeedback(null);
    try {
      const response = await redeemLoyaltyOffer(selectedOffer, orderId, false);
      onRedeemed?.(response.data);
      setFeedback({ type: "success", text: "Offer redeemed successfully." });
    } catch (error: any) {
      const message = error?.response?.data?.error || "Unable to redeem this offer right now.";
      setFeedback({ type: "error", text: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="loyalty-redeem-card">
      <label className="loyalty-redeem-label">Apply points offer</label>
      <select className="loyalty-redeem-select" value={selectedOffer} onChange={(e) => setSelectedOffer(e.target.value)}>
        <option value="">Choose an offer</option>
        {offers.map((offer) => (
          <option key={offer._id} value={offer._id}>
            {offer.name} ({offer.pointsRequired} pts)
          </option>
        ))}
      </select>
      {offers.length === 0 && <p className="paynow-redemption-summary">No active offers available.</p>}
      <button type="button" className="loyalty-redeem-button" onClick={handleRedeem} disabled={!selectedOffer || loading}>
        {loading ? "Applying..." : "Redeem Offer"}
      </button>
      {feedback && (
        <p className={`paynow-redemption-summary ${feedback.type === "error" ? "paynow-redemption-error" : ""}`}>
          {feedback.text}
        </p>
      )}
    </div>
  );
};

export default RedeemSelector;
