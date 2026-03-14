import { FaTrash, FaFileInvoice, FaSearch } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { getAllCatalogItems } from '../services/catalogService';
import type { CatalogItem } from '../services/catalogService';
import './BillSection.css';

interface BillItem {
  id: string;
  itemName: string;
  itemPrice: number;
  serviceCharge?: number;
}

interface BillSectionProps {
  billItems: BillItem[];
  onAddBillItem: (item: Omit<BillItem, 'id'>) => void;
  onRemoveBillItem: (id: string) => void;
  isSaving?: boolean;
  saveError?: string | null;
  onSaveComplete?: () => void;
}

const BillSection = ({ billItems, onAddBillItem, onRemoveBillItem, isSaving = false, saveError = null, onSaveComplete }: BillSectionProps) => {
  const [isAddingItem, setIsAddingItem] = useState<boolean>(false);
  const [newItem, setNewItem] = useState<Omit<BillItem, 'id'>>({
    itemName: '',
    itemPrice: 0,
    serviceCharge: 0
  });
  
  // Catalog search state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<CatalogItem[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

  const handleAddBillItem = () => {
    if (!newItem.itemName || newItem.itemPrice <= 0) {
      alert('Please enter item name and valid price');
      return;
    }

    onAddBillItem({
      itemName: newItem.itemName,
      itemPrice: newItem.itemPrice,
      serviceCharge: newItem.serviceCharge || 0
    });
    
    // Reset form for next item (keep form open for bulk adding)
    setNewItem({ itemName: '', itemPrice: 0, serviceCharge: 0 });
    setSearchQuery('');
    setFilteredItems(catalogItems);
  };

  // Close the add item form
  const handleCloseForm = () => {
    setIsAddingItem(false);
    setNewItem({ itemName: '', itemPrice: 0, serviceCharge: 0 });
    setSearchQuery('');
    setFilteredItems(catalogItems);
    setShowSuggestions(false);
  };

  // Fetch catalog items when opening the add item form
  useEffect(() => {
    if (isAddingItem) {
      fetchCatalogItems();
    }
  }, [isAddingItem]);

  const fetchCatalogItems = async () => {
    try {
      setIsSearching(true);
      const response = await getAllCatalogItems({ isActive: true });
      if (response.success) {
        setCatalogItems(response.catalogItems || []);
        setFilteredItems(response.catalogItems || []);
      }
    } catch (error: any) {
      console.error('Error fetching catalog items:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Filter catalog items based on search query
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = catalogItems.filter(item =>
        item.itemName.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredItems(filtered);
    } else {
      setFilteredItems(catalogItems);
    }
  }, [searchQuery, catalogItems]);

  // Handle selecting a catalog item
  const handleSelectCatalogItem = (item: CatalogItem) => {
    setNewItem({
      itemName: item.itemName,
      itemPrice: item.itemPrice,
      serviceCharge: item.serviceCharge
    });
    setSearchQuery(item.itemName);
    setShowSuggestions(false);
  };

  const calculateSubtotal = () => {
    return billItems.reduce((sum, item) => sum + item.itemPrice, 0);
  };

  const calculateTotalServiceCharge = () => {
    return billItems.reduce((sum, item) => sum + (item.serviceCharge || 0), 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTotalServiceCharge();
  };

  return (
    <div className="bill-container">
      <div className="bill-header">
        <h4 className="bill-title">Invoice</h4>
        <div className="bill-header-actions">
          {isSaving && (
            <span className="saving-indicator">
              <span className="spinner-small"></span> Saving...
            </span>
          )}
          {saveError && (
            <span className="save-error">{saveError}</span>
          )}
          {!isSaving && !saveError && billItems.length > 0 && (
            <span className="saved-indicator">✓ Saved</span>
          )}
        </div>
        <span className="bill-date">
          {new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </span>
      </div>

      {billItems.length > 0 ? (
        <>
          <table className="bill-table">
            <thead>
              <tr>
                <th>S.N</th>
                <th>Item Name</th>
                <th>Item Price</th>
                <th>Service Charge</th>
                <th>Total</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {billItems.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td className="bill-item-name">{item.itemName}</td>
                  <td className="bill-amount">Rs. {item.itemPrice.toFixed(2)}</td>
                  <td className="bill-amount">Rs. {(item.serviceCharge || 0).toFixed(2)}</td>
                  <td className="bill-amount">Rs. {(item.itemPrice + (item.serviceCharge || 0)).toFixed(2)}</td>
                  <td>
                    <button
                      className="remove-item-btn"
                      onClick={() => onRemoveBillItem(item.id)}
                      title="Remove item"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="bill-summary">
            <div className="bill-row">
              <span className="bill-label">Subtotal:</span>
              <span className="bill-value">Rs. {calculateSubtotal().toFixed(2)}</span>
            </div>
            <div className="bill-row">
              <span className="bill-label">Service Charge:</span>
              <span className="bill-value">Rs. {calculateTotalServiceCharge().toFixed(2)}</span>
            </div>
            <div className="bill-row bill-total">
              <span className="bill-label">Total Amount:</span>
              <span className="bill-value">Rs. {calculateTotal().toFixed(2)}</span>
            </div>
          </div>
        </>
      ) : (
        <div className="empty-bill">
          <p>No items added to bill yet.</p>
        </div>
      )}

      {isAddingItem ? (
        <div className="add-bill-item">
          <h4>Add New Item</h4>
          
          {/* Catalog Search */}
          <div className="catalog-search-container">
            <label>Search from Catalog</label>
            <div className="catalog-search-wrapper">
              <FaSearch className="search-icon" />
              <input
                type="text"
                className="catalog-search-input"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                  // Clear form when typing to allow manual entry
                  if (e.target.value === '') {
                    setNewItem({ itemName: '', itemPrice: 0, serviceCharge: 0 });
                  }
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Type to search catalog items..."
              />
            </div>
            
            {/* Search Suggestions Dropdown */}
            {showSuggestions && filteredItems.length > 0 && (
              <div className="suggestions-dropdown">
                {filteredItems.map((item) => (
                  <div
                    key={item._id}
                    className="suggestion-item"
                    onClick={() => handleSelectCatalogItem(item)}
                  >
                    <div className="suggestion-name">{item.itemName}</div>
                    <div className="suggestion-price">
                      Rs. {item.itemPrice.toFixed(2)} 
                      {item.serviceCharge > 0 && ` + Rs. ${item.serviceCharge.toFixed(2)} (Service)`}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {showSuggestions && searchQuery && filteredItems.length === 0 && (
              <div className="no-results">
                <p>No catalog items found. Fill in the details manually below.</p>
              </div>
            )}
          </div>

          {/* Manual Entry Form */}
          <div className="bill-form-row">
            <div className="bill-form-group">
              <label>Item Name</label>
              <input
                type="text"
                value={newItem.itemName}
                onChange={(e) => setNewItem({ ...newItem, itemName: e.target.value })}
                onBlur={() => setShowSuggestions(false)}
                placeholder="e.g., Oil Change"
              />
            </div>
            <div className="bill-form-group">
              <label>Item Price (Rs.)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={newItem.itemPrice || ''}
                onChange={(e) => setNewItem({ ...newItem, itemPrice: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
              />
            </div>
            <div className="bill-form-group">
              <label>Service Charge (Rs.)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={newItem.serviceCharge || ''}
                onChange={(e) => setNewItem({ ...newItem, serviceCharge: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
              />
            </div>
            <div className="bill-form-actions">
              <button className="add-item-btn" onClick={handleAddBillItem}>
                Add Item
              </button>
              <button
                className="add-item-btn cancel-btn"
                onClick={() => {
                  handleCloseForm();
                  onSaveComplete?.();
                }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          className="add-item-btn"
          onClick={() => setIsAddingItem(true)}
          style={{ marginBottom: '20px', width: '100%' }}
        >
          + Add Bill Item
        </button>
      )}
    </div>
  );
};

export default BillSection;
