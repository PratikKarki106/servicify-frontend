import { useState, useEffect } from 'react';
import './UserCatalog.css';
import {
  FaSearch,
  FaRegClock,
} from 'react-icons/fa';
import { getUserCatalogItems } from '../services/catalogService';
import type { CatalogItem } from '../services/catalogService';
import UserSideTop from './UserSideTop';

const UserCatalog = () => {
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const fetchCatalogItems = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getUserCatalogItems();
      
      if (response.success) {
        setCatalogItems(response.catalogItems || []);
      } else {
        setError('Failed to fetch catalog items');
      }
    } catch (err: any) {
      console.error('Error fetching catalog items:', err);
      setError(err.message || 'Error loading catalog items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalogItems();
  }, []);


  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} minutes`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours} hours ${mins} minutes` : `${hours} hours`;
  };

  const filteredItems = catalogItems.filter(item => 
    item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <UserSideTop>
        <div className="user-catalog-container">
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading services...</p>
          </div>
        </div>
      </UserSideTop>
    );
  }

  if (error) {
    return (
      <UserSideTop>
        <div className="user-catalog-container">
          <div className="error-container">
            <h3>Error Loading Services</h3>
            <p>{error}</p>
            <button
              onClick={() => fetchCatalogItems()}
              className="retry-button"
            >
              Retry
            </button>
          </div>
        </div>
      </UserSideTop>
    );
  }

  return (
    <UserSideTop>
      <div className="user-catalog-container">

        <div className="search-bar">
          <div className="search-input-container">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="results-count">
            Showing {filteredItems.length} services
          </div>
        </div>

        <div className='catalog-content-wrapper'>
          <div className='catalog-list-container'>
            <div className='catalog-header'>
              <div className='header-cell name-header'>SERVICE</div>
              <div className='header-cell price-header'>ITEM PRICE</div>
              <div className='header-cell charge-header'>SERVICE CHARGE</div>
              <div className='header-cell total-header'>TOTAL</div>
              <div className='header-cell time-header'>ESTIMATED TIME</div>
            </div>

            <div className='catalog-list'>
              {filteredItems.length === 0 ? (
                <div className="no-items">
                  <p>No services found matching your criteria</p>
                </div>
              ) : (
                filteredItems.map((item: CatalogItem) => (
                  <div key={item._id} className='catalog-row'>
                    <div className='cell name-cell'>
                      <div className='service-name'>
                        <div>
                          <span className='service-title'>{item.itemName}</span>
                        </div>
                      </div>
                      <div className='service-description'>
                        {item.description || 'Comprehensive service for optimal performance'}
                      </div>
                    </div>
                    <div className='cell price-cell'>
                      <div className='price-display'>
                        <p className='price-amount'>Nrs</p>
                        <span className='price-amount'>{item.itemPrice.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className='cell charge-cell'>
                      <div className='charge-display'>
                        <p className='price-amount'>Nrs</p>
                        <span className='charge-amount'>{item.serviceCharge.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className='cell total-cell'>
                      <div className='total-display'>
                        <p className='total-amount'>Nrs</p>
                        <span className='total-amount'>{item.totalCost.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className='cell time-cell'>
                      <div className='time-display'>
                        <FaRegClock className="time-icon" />
                        <span>{formatTime(item.estimatedTime)}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className='catalog-footer'>
          <div className='footer-note'>
            <p><strong>Note:</strong> Prices are indicative. Final cost may vary based on vehicle condition and additional requirements.</p>
            <p>All prices include GST. Book your appointment today!</p>
          </div>
        </div>
      </div>
    </UserSideTop>
  );
};

export default UserCatalog;