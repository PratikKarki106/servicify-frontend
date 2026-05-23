import React, { useEffect, useState } from "react";
import { getLoyaltyBalance } from "../../services/loyaltyService";
import { useNavigate } from "react-router-dom";

interface PointsBalanceProps {
  compact?: boolean;
}

const PointsBalance: React.FC<PointsBalanceProps> = ({ compact = false }) => {
  const [balance, setBalance] = useState(0);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getLoyaltyBalance();
        setBalance(data?.pointsBalance || 0);
      } catch (_error) {
        setBalance(0);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const value = balance * 5;

  return (
    <div className={`loyalty-balance-card ${compact ? "compact" : ""}`}>
      <p className="loyalty-label">Loyalty Points</p>
      <h3>{loading ? "..." : balance}</h3>
      <p className="loyalty-subtext">Redeemable value: Rs. {value}</p>
      <button onClick={() => navigate('/user/settings')}> Redeem </button>
    </div>
  );
};

export default PointsBalance;
