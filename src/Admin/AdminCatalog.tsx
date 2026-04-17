import { useState, useEffect } from 'react';
import './AdminCatalog.css';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaRegClock,
  FaToggleOn,
  FaToggleOff
} from 'react-icons/fa';
import { getAllCatalogItems, deleteCatalogItem, updateCatalogItem } from '../services/catalogService';
import type { CatalogItem } from '../services/catalogService';
import CatalogModal from '../components/CatalogModal';
import Sidebar from '../components/Sidebar';
import { appAlert, appConfirm } from '../services/dialogService';

const AdminCatalog = () => {
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const fetchCatalogItems = async () => {
    try {
      setLoading(true);

      const params: any = {
        sortBy: 'createdAt',
        sortOrder: 'desc'
      };

      const response = await getAllCatalogItems(params);

      if (response.success) {
        setCatalogItems(response.catalogItems || []);
      } else {
        throw new Error('Failed to fetch catalog items');
      }
    } catch (err: any) {
      console.error('Error fetching catalog items:', err);
      await appAlert({ title: 'Error', message: err.message || 'Error loading catalog items', variant: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalogItems();
  }, []);

  const handleCreateNew = () => {
    setSelectedItem(null);
    setIsEditing(false);
    setShowModal(true);
  };

  const handleEdit = (item: CatalogItem) => {
    setSelectedItem(item);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    const confirmed = await appConfirm({
      title: 'Delete item',
      message: 'Are you sure you want to delete this item?',
      confirmText: 'Delete item',
      variant: 'danger',
    });
    if (!confirmed) {
      return;
    }

    try {
      await deleteCatalogItem(id);
      setCatalogItems(prev => prev.filter(item => item._id !== id));
      await appAlert({ title: 'Deleted', message: 'Item deleted successfully', variant: 'success' });
    } catch (err: any) {
      console.error('Error deleting item:', err);
      await appAlert({ title: 'Error', message: err.message || 'Failed to delete item', variant: 'danger' });
    }
  };

  const handleToggleActive = async (item: CatalogItem) => {
    const newStatus = !item.isActive;
    try {
      await updateCatalogItem(item._id, { isActive: newStatus });
      setCatalogItems(prev => 
        prev.map(i => 
          i._id === item._id ? { ...i, isActive: newStatus } : i
        )
      );
      await appAlert({ 
        title: 'Success', 
        message: newStatus ? 'Item activated successfully' : 'Item deactivated successfully', 
        variant: 'success' 
      });
    } catch (err: any) {
      console.error('Error toggling item status:', err);
      await appAlert({ title: 'Error', message: err.message || 'Failed to update item status', variant: 'danger' });
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedItem(null);
  };

  const handleModalSuccess = () => {
    fetchCatalogItems();
    handleModalClose();
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const filteredItems = catalogItems.filter(item => {
    const companyName = typeof item.companyId === 'object' && item.companyId ? item.companyId.name : '';
    const productName = typeof item.productId === 'object' && item.productId ? item.productId.name : '';
    const versionName = typeof item.versionId === 'object' && item.versionId ? item.versionId.name : '';

    return (
      item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      versionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (loading) {
    return (
      <>
        <Sidebar />
        <div className="admin-catalog-container">
          <div className="admin-loading-container">
            <div className="admin-spinner"></div>
            <p>Loading catalog items...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Sidebar />
      <div className="admin-catalog-container">
        <div className="admin-search-bar">
          <div className="admin-search-input-container">
            <FaSearch className="admin-search-icon" />
            <input
              type="text"
              placeholder="Search items by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="admin-search-input"
            />
          </div>
          <button className='admin-new-item-button' onClick={handleCreateNew}>
            <FaPlus /> New Item
          </button>
        </div>

        <div className='admin-catalog-content-wrapper'>
          <div className='admin-catalog-list-container'>
            <div className='admin-catalog-header'>
              <div className='admin-header-cell admin-image-header'>IMAGE</div>
              <div className='admin-header-cell admin-name-header'>COMPANY</div>
              <div className='admin-header-cell admin-price-header'>PRODUCT</div>
              <div className='admin-header-cell admin-charge-header'>VERSION</div>
              <div className='admin-header-cell admin-charge-header'>CC</div>
              <div className='admin-header-cell admin-charge-header'>ITEM NAME</div>
              <div className='admin-header-cell admin-time-header'>SERVICE CHARGE</div>
              <div className='admin-header-cell admin-time-header'>TOTAL COST</div>
              <div className='admin-header-cell admin-time-header'>EST. TIME</div>
              <div className='admin-header-cell admin-actions-header'>ACTIONS</div>
            </div>

            <div className='admin-catalog-list'>
              {filteredItems.length === 0 ? (
                <div className="admin-no-items">
                  <p>No catalog items found</p>
                  <button onClick={handleCreateNew} className="admin-create-first-btn">
                    <FaPlus /> Create your first item
                  </button>
                </div>
              ) : (
                filteredItems.map((item: CatalogItem) => {
                  const companyName = typeof item.companyId === 'object' && item.companyId ? item.companyId.name : 'N/A';
                  const productName = typeof item.productId === 'object' && item.productId ? item.productId.name : 'N/A';
                  const versionName = typeof item.versionId === 'object' && item.versionId ? item.versionId.name : 'N/A';
                  const ccName = typeof item.ccId === 'object' && item.ccId ? item.ccId.name : 'N/A';

                  return (
                  <div key={item._id} className={`admin-catalog-row ${!item.isActive ? 'admin-row-inactive' : ''}`}>
                    <div className='admin-cell admin-image-cell'>
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.itemName} className="admin-item-image" />
                      ) : (
                        <div className="admin-item-image-placeholder">
                          <FaPlus className="placeholder-icon" />
                        </div>
                      )}
                    </div>
                    <div className='admin-cell admin-name-cell'>
                      <div className='admin-service-name'>
                        <span>{companyName}</span>
                      </div>
                    </div>
                    <div className='admin-cell admin-price-cell'>
                      <div className='admin-service-name'>
                        {productName}
                      </div>
                    </div>
                    <div className='admin-cell admin-charge-cell'>
                      <div className='admin-service-name'>
                        {versionName}
                      </div>
                    </div>
                    <div className='admin-cell admin-charge-cell'>
                      <div className='admin-service-name'>
                        {ccName}
                      </div>
                    </div>
                    <div className='admin-cell admin-charge-cell'>
                      <div className='admin-service-name'>
                        <span>{item.itemName}</span>
                      </div>
                    </div>
                    <div className='admin-cell admin-charge-cell'>
                      <div className='admin-charge-amount'>
                        Nrs {item.serviceCharge.toFixed(2)}
                      </div>
                    </div>
                    <div className='admin-cell admin-charge-cell'>
                      <div className='admin-charge-amount'>
                        Nrs {item.totalCost.toFixed(2)}
                      </div>
                    </div>
                    <div className='admin-cell admin-time-cell'>
                      <div className='admin-time-display'>
                        <FaRegClock className="admin-time-icon" />
                        {formatTime(item.estimatedTime)}
                      </div>
                    </div>
                    <div className='admin-cell admin-actions-cell'>
                      <div className='admin-action-buttons'>
                        <button
                          className={`admin-action-btn admin-toggle-btn ${item.isActive ? 'admin-active' : 'admin-inactive'}`}
                          onClick={() => handleToggleActive(item)}
                          title={item.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {item.isActive ? <FaToggleOn /> : <FaToggleOff />}
                        </button>
                        <button
                          className='admin-action-btn admin-edit-btn'
                          onClick={() => handleEdit(item)}
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          className='admin-action-btn admin-delete-btn'
                          onClick={() => handleDelete(item._id)}
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {showModal && (
          <CatalogModal
            isOpen={showModal}
            onClose={handleModalClose}
            onSuccess={handleModalSuccess}
            item={selectedItem}
            isEditing={isEditing}
          />
        )}
      </div>
    </>
  );
};

export default AdminCatalog;