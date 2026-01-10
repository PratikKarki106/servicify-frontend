import { useState, useEffect } from 'react';
import './AdminCatalog.css';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSearch,
  FaRegClock
} from 'react-icons/fa';
import { getAllCatalogItems, deleteCatalogItem } from '../services/catalogService';
import type { CatalogItem } from '../services/catalogService';
import CatalogModal from '../components/CatalogModal';
import Sidebar from '../components/Sidebar';

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
      alert(err.message || 'Error loading catalog items');
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
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }
    
    try {
      await deleteCatalogItem(id);
      setCatalogItems(prev => prev.filter(item => item._id !== id));
      alert('Item deleted successfully');
    } catch (err: any) {
      console.error('Error deleting item:', err);
      alert(err.message || 'Failed to delete item');
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

  const filteredItems = catalogItems.filter(item => 
    item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              <div className='admin-header-cell admin-name-header'>NAME</div>
              <div className='admin-header-cell admin-price-header'>ITEM PRICE</div>
              <div className='admin-header-cell admin-charge-header'>SERVICE CHARGE</div>
              <div className='admin-header-cell admin-charge-header'>TOTAL COST</div>
              <div className='admin-header-cell admin-time-header'>ESTIMATED TIME</div>
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
                filteredItems.map((item: CatalogItem) => (
                  <div key={item._id} className='admin-catalog-row'>
                    <div className='admin-cell admin-name-cell'>
                      <div className='admin-service-name'>
                        <span>{item.itemName}</span>
                      </div>
                      <div className='admin-service-description'>
                        {item.description || 'No description'}
                      </div>
                    </div>
                    <div className='admin-cell admin-price-cell'>
                      <div className='admin-price-amount'>
                        Nrs {item.itemPrice.toFixed(2)}
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
                ))
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