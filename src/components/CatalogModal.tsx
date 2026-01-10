import React, { useState, useEffect } from 'react';
import './CatalogModal.css';
import { FaTimes } from 'react-icons/fa';
import { createCatalogItem, updateCatalogItem } from '../services/catalogService';
import type { CatalogItem, CreateCatalogItemData } from '../services/catalogService';

interface CatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  item?: CatalogItem | null;
  isEditing: boolean;
}

const CatalogModal: React.FC<CatalogModalProps> = ({ isOpen, onClose, onSuccess, item, isEditing }) => {
  const [formData, setFormData] = useState<CreateCatalogItemData>({
    itemName: '',
    description: '',
    itemPrice: 0,
    serviceCharge: 0,
    estimatedTime: 60
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (item && isEditing) {
      setFormData({
        itemName: item.itemName,
        description: item.description || '',
        itemPrice: item.itemPrice,
        serviceCharge: item.serviceCharge,
        estimatedTime: item.estimatedTime,
      });
    } else {
      setFormData({
        itemName: '',
        description: '',
        itemPrice: 0,
        serviceCharge: 0,
        estimatedTime: 60,
      });
    }
  }, [item, isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'itemPrice' || name === 'serviceCharge' || name === 'estimatedTime') {
      setFormData(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.itemName || formData.itemPrice <= 0 || formData.serviceCharge < 0 || formData.estimatedTime <= 0) {
      setError('Please fill in all required fields with valid values');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (isEditing && item) {
        await updateCatalogItem(item._id, formData);
      } else {
        await createCatalogItem(formData);
      }

      onSuccess();
    } catch (err: any) {
      console.error('Error saving catalog item:', err);
      setError(err.message || 'Failed to save item');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const calculatedCost = formData.itemPrice + formData.serviceCharge;

  return (
    <>
      <div className="modal-overlay">
        <div className="catalog-modal">
          <div className="modal-header">
            <h2>{isEditing ? 'Edit Service' : 'Add New Service'}</h2>
            <button className="close-button" onClick={onClose}>
              <FaTimes />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Item Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="itemName"
                    value={formData.itemName}
                    onChange={handleChange}
                    placeholder="Enter service name"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group full-width">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Enter service description"
                    rows={3}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="itemPrice">Item Price ($) *</label>
                  <input
                    type="number"
                    id="itemPrice"
                    name="itemPrice"
                    value={formData.itemPrice}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="serviceCharge">Service Charge ($) *</label>
                  <input
                    type="number"
                    id="serviceCharge"
                    name="serviceCharge"
                    value={formData.serviceCharge}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="estimatedTime">Estimated Time (minutes) *</label>
                  <input
                    type="number"
                    id="estimatedTime"
                    name="estimatedTime"
                    value={formData.estimatedTime}
                    onChange={handleChange}
                    min="1"
                    step="1"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Total Cost</label>
                  <div className="total-cost-display">
                    ${calculatedCost.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="cancel-button" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="save-button" disabled={loading}>
                {loading ? 'Saving...' : isEditing ? 'Update Service' : 'Create Service'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default CatalogModal;