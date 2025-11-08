import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import {
  createAdminLoyaltyOffer,
  deleteAdminLoyaltyOffer,
  getAdminLoyaltyOffers,
  updateAdminLoyaltyOffer
} from "../services/loyaltyService";
import type { AdminLoyaltyOffer } from "../services/loyaltyService";
import { appConfirm } from "../services/dialogService";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faPlus, 
  faEdit, 
  faTrash, 
  faCheckCircle, 
  faTimesCircle, 
  faGift, 
  faCoins, 
  faUsers, 
  faChartLine,
  faHistory,
  faEnvelope,
  faInfoCircle
} from "@fortawesome/free-solid-svg-icons";
import "./AdminLoyalty.css";

interface OfferForm {
  name: string;
  valueInRupees: string;
  pointsRequired: string;
  isActive: boolean;
}

const defaultForm: OfferForm = {
  name: "",
  valueInRupees: "",
  pointsRequired: "",
  isActive: true
};

const readErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === "object" && error !== null) {
    const maybeResponse = (error as { response?: { data?: { error?: string } } }).response;
    if (maybeResponse?.data?.error) return maybeResponse.data.error;
  }
  return fallback;
};

const AdminLoyalty = () => {
  const [offers, setOffers] = useState<AdminLoyaltyOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState<AdminLoyaltyOffer | null>(null);
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
  const [form, setForm] = useState<OfferForm>(defaultForm);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const data = await getAdminLoyaltyOffers();
      setOffers(data);
    } catch (error: unknown) {
      toast.error(readErrorMessage(error, "Failed to load redeem offers."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const selectedOffer = useMemo(
    () => offers.find((offer) => offer._id === selectedOfferId) || null,
    [offers, selectedOfferId]
  );

  const openCreate = () => {
    setEditingOffer(null);
    setForm(defaultForm);
    setShowModal(true);
  };

  const openEdit = (offer: AdminLoyaltyOffer) => {
    setEditingOffer(offer);
    setForm({
      name: offer.name,
      valueInRupees: String(offer.valueInRupees),
      pointsRequired: String(offer.pointsRequired),
      isActive: offer.isActive
    });
    setShowModal(true);
  };

  const onChange = (key: keyof OfferForm, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const saveOffer = async () => {
    const name = form.name.trim();
    const valueInRupees = Number(form.valueInRupees);
    const pointsRequired = Number(form.pointsRequired);

    if (!name || Number.isNaN(valueInRupees) || Number.isNaN(pointsRequired)) {
      toast.error("Please fill all required fields.");
      return;
    }
    if (valueInRupees <= 0 || pointsRequired <= 0) {
      toast.error("Please enter valid positive values.");
      return;
    }

    try {
      setSaving(true);
      if (editingOffer) {
        await updateAdminLoyaltyOffer(editingOffer._id, {
          name,
          valueInRupees,
          pointsRequired,
          isActive: form.isActive
        });
        toast.success("Redeem offer updated.");
      } else {
        await createAdminLoyaltyOffer({
          name,
          valueInRupees,
          pointsRequired,
          isActive: form.isActive
        });
        toast.success("Redeem offer created.");
      }

      setShowModal(false);
      setEditingOffer(null);
      await fetchOffers();
    } catch (error: unknown) {
      toast.error(readErrorMessage(error, "Failed to save offer."));
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (offer: AdminLoyaltyOffer) => {
    try {
      await updateAdminLoyaltyOffer(offer._id, { isActive: !offer.isActive });
      toast.success(`Offer ${offer.isActive ? "deactivated" : "activated"}.`);
      await fetchOffers();
    } catch (error: unknown) {
      toast.error(readErrorMessage(error, "Failed to update offer status."));
    }
  };

  const deleteOffer = async (offer: AdminLoyaltyOffer) => {
    const confirmed = await appConfirm({
      title: "Delete redeem offer",
      message: `Delete "${offer.name}" permanently?`,
      confirmText: "Delete",
      variant: "danger"
    });
    if (!confirmed) return;

    try {
      await deleteAdminLoyaltyOffer(offer._id);
      toast.success("Redeem offer deleted.");
      if (selectedOfferId === offer._id) setSelectedOfferId(null);
      await fetchOffers();
    } catch (error: unknown) {
      toast.error(readErrorMessage(error, "Failed to delete offer."));
    }
  };

  return (
    <>
      <Sidebar />
      <div className="admin-loyalty-main">
        <div className="admin-loyalty-header">
          <div>
            <h1>Manage Redeem</h1>
            <p>Create and manage loyalty discount offers for users.</p>
          </div>
          <button className="admin-loyalty-create-btn" onClick={openCreate}>
            <FontAwesomeIcon icon={faPlus} />
            Create Offer
          </button>
        </div>

        {loading ? (
          <div className="admin-loyalty-loading">
             <div className="loading-spinner"></div>
             <p>Loading redeem offers...</p>
          </div>
        ) : (
          <div className="admin-loyalty-content">
            <div className="admin-loyalty-grid">
              {offers.length === 0 ? (
                <div className="admin-loyalty-empty">
                  <FontAwesomeIcon icon={faGift} className="empty-icon" />
                  <p>No redeem offers yet. Create your first loyalty reward.</p>
                </div>
              ) : (
                offers.map((offer, index) => (
                  <div
                    key={offer._id}
                    className={`admin-loyalty-card ${selectedOfferId === offer._id ? "selected" : ""}`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                    onClick={() => setSelectedOfferId(offer._id)}
                  >
                    <div className="card-top">
                      <div className="card-title-area">
                        <h3>{offer.name}</h3>
                        <span className={`status-pill ${offer.isActive ? "active" : "inactive"}`}>
                          {offer.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <div className="card-actions">
                        <button 
                          className="action-icon-btn" 
                          title="Edit"
                          onClick={(e) => { e.stopPropagation(); openEdit(offer); }}
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button 
                          className={`action-icon-btn ${offer.isActive ? "warning" : "success"}`}
                          title={offer.isActive ? "Deactivate" : "Activate"}
                          onClick={(e) => { e.stopPropagation(); toggleActive(offer); }}
                        >
                          <FontAwesomeIcon icon={offer.isActive ? faTimesCircle : faCheckCircle} />
                        </button>
                        <button 
                          className="action-icon-btn danger" 
                          title="Delete"
                          onClick={(e) => { e.stopPropagation(); deleteOffer(offer); }}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </div>

                    <div className="card-main-stats">
                      <div className="stat-box">
                        <span className="stat-label">Discount</span>
                        <span className="stat-value discount">Rs. {offer.valueInRupees.toLocaleString()}</span>
                      </div>
                      <div className="stat-box">
                        <span className="stat-label">Required Points</span>
                        <span className="stat-value points">
                          <FontAwesomeIcon icon={faCoins} style={{ marginRight: '6px' }} />
                          {offer.pointsRequired}
                        </span>
                      </div>
                    </div>

                    <div className="card-footer-stats">
                      <div className="footer-stat">
                        <FontAwesomeIcon icon={faUsers} />
                        <span>{offer.uniqueUserCount} Users</span>
                      </div>
                      <div className="footer-stat">
                        <FontAwesomeIcon icon={faChartLine} />
                        <span>{offer.redemptionCount} Redeemed</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="admin-loyalty-details">
              {!selectedOffer ? (
                <div className="admin-loyalty-detail-empty">
                  <FontAwesomeIcon icon={faInfoCircle} className="empty-icon" />
                  <p>Select an offer to view detailed redemption history and user stats.</p>
                </div>
              ) : (
                <>
                  <h2>{selectedOffer.name}</h2>
                  <p style={{ color: '#94a3b8', marginBottom: '20px' }}>Detailed redemption statistics</p>

                  <div className="details-overview">
                    <div className="overview-card">
                      <div className="overview-label">Total Discount Given</div>
                      <div className="overview-value" style={{ color: '#10b981' }}>
                        Rs. {selectedOffer.totalDiscountGiven.toLocaleString()}
                      </div>
                    </div>
                    <div className="overview-card" style={{ display: 'flex', gap: '20px' }}>
                      <div style={{ flex: 1 }}>
                         <div className="overview-label">Unique Users</div>
                         <div className="overview-value">{selectedOffer.uniqueUserCount}</div>
                      </div>
                      <div style={{ flex: 1 }}>
                         <div className="overview-label">Redemption Rate</div>
                         <div className="overview-value">{selectedOffer.redemptionCount}</div>
                      </div>
                    </div>
                  </div>

                  <h4 style={{ margin: '25px 0 15px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FontAwesomeIcon icon={faHistory} />
                    Recent Redemptions
                  </h4>

                  <div className="admin-loyalty-users">
                    {selectedOffer.redeemedUsers.length === 0 ? (
                      <div className="admin-loyalty-no-users">
                        <p>No users have redeemed this reward yet.</p>
                      </div>
                    ) : (
                      selectedOffer.redeemedUsers.map((user) => (
                        <div key={String(user.userId)} className="admin-loyalty-user-card">
                          <div className="user-top">
                            <strong>{user.name}</strong>
                            <span>
                              <FontAwesomeIcon icon={faEnvelope} style={{ marginRight: '6px' }} />
                              {user.email}
                            </span>
                          </div>
                          <div className="user-stats">
                            <div className="user-stat-item">
                               <span className="user-stat-label">Count</span>
                               <span className="user-stat-value">{user.redeemedCount}</span>
                            </div>
                            <div className="user-stat-item">
                               <span className="user-stat-label">Points</span>
                               <span className="user-stat-value">{user.totalPointsUsed}</span>
                            </div>
                            <div className="user-stat-item">
                               <span className="user-stat-label">Saved</span>
                               <span className="user-stat-value" style={{ color: '#10b981' }}>Rs. {user.totalDiscountApplied}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="admin-loyalty-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-loyalty-modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editingOffer ? "Edit Reward" : "New Reward"}</h2>
            <div className="admin-loyalty-form">
              <label>
                Reward Name
                <input 
                  type="text"
                  placeholder="e.g. Bronze Discount"
                  value={form.name} 
                  onChange={(e) => onChange("name", e.target.value)} 
                />
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <label>
                  Discount (Rs.)
                  <input
                    type="number"
                    min="1"
                    placeholder="100"
                    value={form.valueInRupees}
                    onChange={(e) => onChange("valueInRupees", e.target.value)}
                  />
                </label>
                <label>
                  Points Needed
                  <input
                    type="number"
                    min="1"
                    placeholder="500"
                    value={form.pointsRequired}
                    onChange={(e) => onChange("pointsRequired", e.target.value)}
                  />
                </label>
              </div>
              <label className="inline-checkbox" style={{ marginTop: '10px' }}>
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => onChange("isActive", e.target.checked)}
                />
                Make reward available immediately
              </label>
            </div>
            <div className="admin-loyalty-modal-actions">
              <button className="secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button 
                className="admin-loyalty-create-btn" 
                onClick={saveOffer} 
                disabled={saving}
                style={{ padding: '12px 30px' }}
              >
                {saving ? "Processing..." : editingOffer ? "Update Reward" : "Create Reward"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminLoyalty;
