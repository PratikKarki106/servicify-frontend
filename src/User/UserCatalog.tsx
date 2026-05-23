import { useState, useEffect, useRef } from 'react';
import './UserCatalog.css';
import {
  FaSearch,
  FaRegClock,
  FaShoppingCart,
  FaFilter,
  FaTimes,
} from 'react-icons/fa';
import { getUserCatalogItems, getCompanies, getProducts, getVersions } from '../services/catalogService';
import type { CatalogItem, Company, Product, Version } from '../services/catalogService';
import UserSideTop from './UserSideTop';
import { addToCart, getCart, updateCartItem } from '../services/cartPurchaseService';
import { toast } from 'react-toastify';
import PayNow from './Payment/PayNow';

interface PartCardProps {
  item: CatalogItem;
  onAddToCart: (itemId: string) => void;
}

const PartCard: React.FC<PartCardProps> = ({ item, onAddToCart }) => {
  const companyName = typeof item.companyId === 'object' && item.companyId ? item.companyId.name : 'N/A';
  const productName = typeof item.productId === 'object' && item.productId ? item.productId.name : 'N/A';
  const versionName = typeof item.versionId === 'object' && item.versionId ? item.versionId.name : 'N/A';
  const ccName = typeof item.ccId === 'object' && item.ccId ? item.ccId.name : 'N/A';

  const formatTime = (minutes: number) => {
    return minutes;
  };

  return (
    <div className={`part-card ${!item.isActive ? 'part-card-out-of-stock' : ''}`}>
      <div className="part-card-image-wrapper">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.itemName}
            className="part-card-image"
          />
        ) : (
          <div className="part-card-image-placeholder">
            <FaShoppingCart className="placeholder-icon" />
          </div>
        )}
        {item.isActive ? (
          <span className="part-card-status-badge status-in-stock">
            In Stock
          </span>
        ) : (
          <span className="part-card-status-badge status-out-of-stock">
            Out of Stock
          </span>
        )}
      </div>

      <div className="part-card-content">
        <div className="part-card-header">
          <span className="part-card-brand">
            {companyName} • {productName} • {versionName} • {ccName}
          </span>
          <span className="part-card-time">
            <FaRegClock size={12} />
            {formatTime(item.estimatedTime)} min
          </span>
        </div>

        <h3 className="part-card-title">{item.itemName}</h3>

        <div className="part-card-footer">
          <span className="part-card-price">
            Nrs {item.totalCost.toLocaleString()}
          </span>
          <button
            className={`part-card-select-button ${!item.isActive ? 'button-disabled' : ''}`}
            disabled={!item.isActive}
            onClick={() => item.isActive && onAddToCart(item._id)}
          >
            <FaShoppingCart size={14} />
            {item.isActive ? 'Buy' : 'Out of Stock'}
          </button>
        </div>
      </div>
    </div>
  );
};

const UserCatalog = () => {
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Filter states
  const [showFilterDropdown, setShowFilterDropdown] = useState<boolean>(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [versions, setVersions] = useState<Version[]>([]);

  // Selected filter values
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [selectedVersion, setSelectedVersion] = useState<string>('');

  // Applied filter values (used for actual filtering)
  const [appliedCompany, setAppliedCompany] = useState<string>('');
  const [appliedProduct, setAppliedProduct] = useState<string>('');
  const [appliedVersion, setAppliedVersion] = useState<string>('');
  const [cartCount, setCartCount] = useState(0);
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [showPayNow, setShowPayNow] = useState(false);
  const [cartSubtotal, setCartSubtotal] = useState(0);
  const [cartItems, setCartItems] = useState<any[]>([]);

  const filterContainerRef = useRef<HTMLDivElement>(null);

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

  const fetchFilterData = async () => {
    try {
      const [companiesRes, productsRes, versionsRes] = await Promise.all([
        getCompanies(),
        getProducts(),
        getVersions()
      ]);

      if (companiesRes.success) {
        setCompanies(companiesRes.companies || []);
      }
      if (productsRes.success) {
        setProducts(productsRes.products || []);
      }
      if (versionsRes.success) {
        setVersions(versionsRes.versions || []);
      }
    } catch (err) {
      console.error('Error fetching filter data:', err);
    }
  };

  useEffect(() => {
    fetchCatalogItems();
    fetchFilterData();
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await getCart();
      const items = response?.data?.items || [];
      setCartItems(items);
      setCartCount(items.reduce((sum: number, i: any) => sum + (i.quantity || 0), 0));
      setCartSubtotal(response?.data?.subtotal || 0);
    } catch (_error) {
      setCartCount(0);
      setCartSubtotal(0);
    }
  };

  const handleAddToCart = async (itemId: string) => {
    try {
      await addToCart(itemId, 1);
      await fetchCart();
      toast.success('Item added to cart');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to add item');
    }
  };

  const handleAdjustQuantity = async (catalogItemId: string, nextQuantity: number) => {
    try {
      await updateCartItem(catalogItemId, nextQuantity);
      await fetchCart();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update cart');
    }
  };

  // Handle company selection change
  const handleCompanyChange = (companyId: string) => {
    setSelectedCompany(companyId);
    setSelectedProduct('');
    setSelectedVersion('');
  };

  // Handle product selection change
  const handleProductChange = (productId: string) => {
    setSelectedProduct(productId);
    setSelectedVersion('');
  };

  // Apply filters
  const handleApplyFilters = () => {
    setAppliedCompany(selectedCompany);
    setAppliedProduct(selectedProduct);
    setAppliedVersion(selectedVersion);
    setShowFilterDropdown(false);
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSelectedCompany('');
    setSelectedProduct('');
    setSelectedVersion('');
    setAppliedCompany('');
    setAppliedProduct('');
    setAppliedVersion('');
  };

  // Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterContainerRef.current && !filterContainerRef.current.contains(event.target as Node)) {
        setShowFilterDropdown(false);
      }
    };

    if (showFilterDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showFilterDropdown]);

  // Get filtered products based on selected company
  const getFilteredProducts = () => {
    if (!selectedCompany) return products;
    return products.filter(p => {
      const prodCompanyId = typeof p.companyId === 'object' && p.companyId ? p.companyId._id : p.companyId;
      return prodCompanyId === selectedCompany;
    });
  };

  // Get filtered versions based on selected company and product
  const getFilteredVersions = () => {
    let filtered = versions;

    if (selectedCompany) {
      filtered = filtered.filter(v => {
        const verCompanyId = typeof v.companyId === 'object' && v.companyId ? v.companyId._id : v.companyId;
        return verCompanyId === selectedCompany;
      });
    }

    if (selectedProduct) {
      filtered = filtered.filter(v => {
        const verProductId = typeof v.productId === 'object' && v.productId ? v.productId._id : v.productId;
        return verProductId === selectedProduct;
      });
    }

    return filtered;
  };

  // Check if any filters are active
  const hasActiveFilters = appliedCompany || appliedProduct || appliedVersion;

  const filteredItems = catalogItems.filter(item => {
    const companyName = typeof item.companyId === 'object' && item.companyId ? item.companyId.name : '';
    const productId = typeof item.productId === 'object' && item.productId ? item.productId._id : item.productId;
    const versionId = typeof item.versionId === 'object' && item.versionId ? item.versionId._id : item.versionId;
    const productName = typeof item.productId === 'object' && item.productId ? item.productId.name : '';
    const versionName = typeof item.versionId === 'object' && item.versionId ? item.versionId.name : '';

    // Apply search filter
    const matchesSearch = (
      item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      versionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Apply company filter
    const matchesCompany = !appliedCompany || (typeof item.companyId === 'object' && item.companyId ? item.companyId._id === appliedCompany : item.companyId === appliedCompany);

    // Apply product filter
    const matchesProduct = !appliedProduct || productId === appliedProduct;

    // Apply version filter
    const matchesVersion = !appliedVersion || versionId === appliedVersion;

    return matchesSearch && matchesCompany && matchesProduct && matchesVersion;
  });

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
        <div className="catalog-header-section">
          <p style={{ fontWeight: "600", fontSize: "20px" }}>Available Items</p>
          <p className="catalog-subtitle">Browse our complete range of automotive parts and services</p>
        </div>

        <div className="catalog-search-bar">
          <div className="catalog-search-container">
            <div className="catalog-search-input-wrapper" ref={filterContainerRef}>
              <FaSearch className="catalog-search-icon" />
              <input
                type="text"
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="catalog-search-input"
              />
              <button
                className={`catalog-filter-button ${hasActiveFilters ? 'active' : ''}`}
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                title="Filter services"
              >
                <FaFilter />
              </button>

              {showFilterDropdown && (
                <div className="catalog-filter-dropdown">
                  <div className="filter-dropdown-header">
                    <h3>Filter Services</h3>
                    <button
                      className="filter-close-button"
                      onClick={() => setShowFilterDropdown(false)}
                    >
                      <FaTimes />
                    </button>
                  </div>

                  <div className="filter-dropdown-content">
                    <div className="filter-group">
                      <label className="filter-label">Company</label>
                      <select
                        className="filter-select"
                        value={selectedCompany}
                        onChange={(e) => handleCompanyChange(e.target.value)}
                      >
                        <option value="">All Companies</option>
                        {companies.map(company => (
                          <option key={company._id} value={company._id}>
                            {company.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="filter-group">
                      <label className="filter-label">Product</label>
                      <select
                        className="filter-select"
                        value={selectedProduct}
                        onChange={(e) => handleProductChange(e.target.value)}
                      >
                        <option value="">All Products</option>
                        {getFilteredProducts().map(product => (
                          <option key={product._id} value={product._id}>
                            {product.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="filter-group">
                      <label className="filter-label">Version</label>
                      <select
                        className="filter-select"
                        value={selectedVersion}
                        onChange={(e) => setSelectedVersion(e.target.value)}
                      >
                        <option value="">All Versions</option>
                        {getFilteredVersions().map(version => (
                          <option key={version._id} value={version._id}>
                            {version.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="filter-dropdown-actions">
                    <button
                      className="filter-clear-button"
                      onClick={handleClearFilters}
                    >
                      Clear All
                    </button>
                    <button
                      className="filter-apply-button"
                      onClick={handleApplyFilters}
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="catalog-results-count">
            Showing {filteredItems.length} services
          </div>
          <button className="catalog-cart-button" onClick={() => setShowCartDrawer(true)}>
            <FaShoppingCart /> Cart ({cartCount})
          </button>
        </div>

        <div className="parts-grid">
          {filteredItems.length === 0 ? (
            <div className="no-items">
              <p>No services found matching your criteria</p>
            </div>
          ) : (
            filteredItems.map((item: CatalogItem) => (
              <PartCard key={item._id} item={item} onAddToCart={handleAddToCart} />
            ))
          )}
        </div>

        {showCartDrawer && (
          <div className="catalog-checkout-overlay" onClick={() => setShowCartDrawer(false)}>
            <div className="catalog-cart-drawer" onClick={(e) => e.stopPropagation()}>
              <div className="catalog-drawer-header">
                <h3>Your Cart</h3>
                <button onClick={() => setShowCartDrawer(false)} className="filter-close-button"><FaTimes /></button>
              </div>
              <div className="catalog-drawer-items">
                {cartItems.length === 0 ? (
                  <p>No items in cart.</p>
                ) : (
                  cartItems.map((item: any) => (
                    <div key={item.catalogItemId?._id || item.catalogItemId} className="catalog-drawer-item">
                      <div>
                        <strong>{item.itemSnapshot?.itemName || item.catalogItemId?.itemName || 'Item'}</strong>
                        <p>Nrs {Number(item.totalPrice || 0).toFixed(2)}</p>
                      </div>
                      <div className="catalog-qty-controls">
                        <button onClick={() => handleAdjustQuantity(item.catalogItemId?._id || item.catalogItemId, item.quantity - 1)}>-</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => handleAdjustQuantity(item.catalogItemId?._id || item.catalogItemId, item.quantity + 1)}>+</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="catalog-drawer-footer">
                <h4>Total: Nrs {cartSubtotal.toFixed(2)}</h4>
                <button
                  onClick={() => {
                    setShowPayNow(true);
                    setShowCartDrawer(false);
                  }}
                  className="filter-apply-button"
                  disabled={cartItems.length === 0}
                >
                  Proceed to Payment
                </button>
              </div>
            </div>
          </div>
        )}

        <PayNow
          isOpen={showPayNow}
          onClose={() => setShowPayNow(false)}
          paymentType="purchase"
          itemId="cart"
          amount={cartSubtotal}
          itemName="Cart Purchase"
        />

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
