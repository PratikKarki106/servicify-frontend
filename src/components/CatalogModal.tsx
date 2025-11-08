import React, { useState, useEffect, useRef, useCallback } from 'react';
import './CatalogModal.css';
import { FaTimes, FaPlus } from 'react-icons/fa';
import { createCatalogItem, updateCatalogItem, uploadCatalogItemImage } from '../services/catalogService';
import type { CatalogItem, CreateCatalogItemData } from '../services/catalogService';
import { getAllCompanies, createCompany } from '../services/companyService';
import { getAllProducts, createProduct } from '../services/productService';
import { getAllVersions, createVersion } from '../services/versionService';
import { getAllCCs, createCC } from '../services/ccService';

interface CatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  item?: CatalogItem | null;
  isEditing: boolean;
}

interface Company {
  _id: string;
  name: string;
}

interface Product {
  _id: string;
  name: string;
  companyId: string;
}

interface Version {
  _id: string;
  name: string;
  companyId: string;
  productId: string;
}

interface CC {
  _id: string;
  name: string;
  companyId: string;
  productId: string;
  versionId: string;
}

const CatalogModal: React.FC<CatalogModalProps> = ({ isOpen, onClose, onSuccess, item, isEditing }) => {
  const [formData, setFormData] = useState<CreateCatalogItemData>({
    companyId: '',
    productId: '',
    versionId: '',
    ccId: '',
    itemName: '',
    description: '',
    itemPrice: 0,
    serviceCharge: 0,
    estimatedTime: 60,
    imageObjectKey: ''
  });

  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const [imageUploading, setImageUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dropdown states
  const [companies, setCompanies] = useState<Company[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [versions, setVersions] = useState<Version[]>([]);
  const [ccs, setCCs] = useState<CC[]>([]);

  // Search states
  const [companySearch, setCompanySearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [versionSearch, setVersionSearch] = useState('');
  const [ccSearch, setCcSearch] = useState('');

  // Dropdown visibility
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [showVersionDropdown, setShowVersionDropdown] = useState(false);
  const [showCCDropdown, setShowCCDropdown] = useState(false);

  // Modal states for adding new items
  const [showAddCompanyModal, setShowAddCompanyModal] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showAddVersionModal, setShowAddVersionModal] = useState(false);
  const [showAddCCModal, setShowAddCCModal] = useState(false);

  const [newCompanyName, setNewCompanyName] = useState('');
  const [newProductName, setNewProductName] = useState('');
  const [newVersionName, setNewVersionName] = useState('');
  const [newCCName, setNewCCName] = useState('');

  const companyDropdownRef = useRef<HTMLDivElement>(null);
  const productDropdownRef = useRef<HTMLDivElement>(null);
  const versionDropdownRef = useRef<HTMLDivElement>(null);
  const ccDropdownRef = useRef<HTMLDivElement>(null);

  // Load initial data
  useEffect(() => {
    if (isOpen) {
      loadCompanies();
    }
  }, [isOpen]);

  // Load data when editing
  useEffect(() => {
    if (item && isEditing) {
      const companyId = typeof item.companyId === 'object' && item.companyId ? item.companyId._id : item.companyId;
      const productId = typeof item.productId === 'object' && item.productId ? item.productId._id : item.productId;
      const versionId = typeof item.versionId === 'object' && item.versionId ? item.versionId._id : item.versionId;
      const ccId = typeof item.ccId === 'object' && item.ccId ? item.ccId._id : item.ccId;

      const companyName = typeof item.companyId === 'object' && item.companyId ? item.companyId.name : '';
      const productName = typeof item.productId === 'object' && item.productId ? item.productId.name : '';
      const versionName = typeof item.versionId === 'object' && item.versionId ? item.versionId.name : '';
      const ccName = typeof item.ccId === 'object' && item.ccId ? item.ccId.name : '';

      setFormData({
        companyId: companyId || '',
        productId: productId || '',
        versionId: versionId || '',
        ccId: ccId || '',
        itemName: item.itemName,
        description: item.description || '',
        itemPrice: item.itemPrice,
        serviceCharge: item.serviceCharge,
        estimatedTime: item.estimatedTime,
        imageObjectKey: item.imageObjectKey || '',
      });

      setImagePreviewUrl(item.imageUrl || '');
      setCompanySearch(companyName);
      setProductSearch(productName);
      setVersionSearch(versionName);
      setCcSearch(ccName);

      // Load related data
      if (companyId) {
        loadProducts(companyId);
      }
      if (companyId && productId) {
        loadVersions(companyId, productId);
      }
      if (companyId && productId && versionId) {
        loadCCs(companyId, productId, versionId);
      }
    } else {
      resetForm();
    }
  }, [item, isEditing]);

  // Load products when company changes
  useEffect(() => {
    if (formData.companyId && !isEditing) {
      loadProducts(formData.companyId);
      setFormData(prev => ({ ...prev, productId: '', versionId: '', ccId: '' }));
      setProducts([]);
      setVersions([]);
      setCCs([]);
    }
  }, [formData.companyId]);

  // Load versions when product changes
  useEffect(() => {
    if (formData.productId && !isEditing) {
      loadVersions(formData.companyId, formData.productId);
      setFormData(prev => ({ ...prev, versionId: '', ccId: '' }));
      setVersions([]);
      setCCs([]);
    }
  }, [formData.productId]);

  // Load CCs when version changes
  useEffect(() => {
    if (formData.versionId && !isEditing) {
      loadCCs(formData.companyId, formData.productId, formData.versionId);
      setFormData(prev => ({ ...prev, ccId: '' }));
      setCCs([]);
    }
  }, [formData.versionId]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (companyDropdownRef.current && !companyDropdownRef.current.contains(event.target as Node)) {
        setShowCompanyDropdown(false);
      }
      if (productDropdownRef.current && !productDropdownRef.current.contains(event.target as Node)) {
        setShowProductDropdown(false);
      }
      if (versionDropdownRef.current && !versionDropdownRef.current.contains(event.target as Node)) {
        setShowVersionDropdown(false);
      }
      if (ccDropdownRef.current && !ccDropdownRef.current.contains(event.target as Node)) {
        setShowCCDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const resetForm = () => {
    setFormData({
      companyId: '',
      productId: '',
      versionId: '',
      ccId: '',
      itemName: '',
      description: '',
      itemPrice: 0,
      serviceCharge: 0,
      estimatedTime: 60,
      imageObjectKey: '',
    });
    setImagePreviewUrl('');
    setCompanySearch('');
    setProductSearch('');
    setVersionSearch('');
    setCcSearch('');
    setCompanies([]);
    setProducts([]);
    setVersions([]);
    setCCs([]);
  };

  const loadCompanies = async (search = '') => {
    try {
      const response = await getAllCompanies(search);
      if (response.success) {
        setCompanies(response.companies || []);
      }
    } catch (err) {
      console.error('Error loading companies:', err);
    }
  };

  const loadProducts = async (companyId: string, search = '') => {
    try {
      const response = await getAllProducts({ companyId, search });
      if (response.success) {
        setProducts(response.products || []);
      }
    } catch (err) {
      console.error('Error loading products:', err);
    }
  };

  const loadVersions = async (companyId: string, productId: string, search = '') => {
    try {
      const response = await getAllVersions({ companyId, productId, search });
      if (response.success) {
        setVersions(response.versions || []);
      }
    } catch (err) {
      console.error('Error loading versions:', err);
    }
  };

  const loadCCs = async (companyId: string, productId: string, versionId: string, search = '') => {
    try {
      const response = await getAllCCs({ companyId, productId, versionId, search });
      if (response.success) {
        setCCs(response.ccs || []);
      }
    } catch (err) {
      console.error('Error loading CCs:', err);
    }
  };

  const handleCompanySearch = useCallback((value: string) => {
    setCompanySearch(value);
    setFormData(prev => ({ ...prev, companyId: '' }));
    loadCompanies(value);
    setShowCompanyDropdown(true);
  }, []);

  const handleProductSearch = useCallback((value: string) => {
    setProductSearch(value);
    setFormData(prev => ({ ...prev, productId: '' }));
    if (formData.companyId) {
      loadProducts(formData.companyId, value);
    }
    setShowProductDropdown(true);
  }, [formData.companyId]);

  const handleVersionSearch = useCallback((value: string) => {
    setVersionSearch(value);
    setFormData(prev => ({ ...prev, versionId: '' }));
    if (formData.companyId && formData.productId) {
      loadVersions(formData.companyId, formData.productId, value);
    }
    setShowVersionDropdown(true);
  }, [formData.companyId, formData.productId]);

  const selectCompany = (company: Company) => {
    setFormData(prev => ({ ...prev, companyId: company._id }));
    setCompanySearch(company.name);
    setShowCompanyDropdown(false);
  };

  const selectProduct = (product: Product) => {
    setFormData(prev => ({ ...prev, productId: product._id }));
    setProductSearch(product.name);
    setShowProductDropdown(false);
  };

  const selectVersion = (version: Version) => {
    setFormData(prev => ({ ...prev, versionId: version._id }));
    setVersionSearch(version.name);
    setShowVersionDropdown(false);
  };

  const handleCcSearch = useCallback((value: string) => {
    setCcSearch(value);
    setFormData(prev => ({ ...prev, ccId: '' }));
    if (formData.companyId && formData.productId && formData.versionId) {
      loadCCs(formData.companyId, formData.productId, formData.versionId, value);
    }
    setShowCCDropdown(true);
  }, [formData.companyId, formData.productId, formData.versionId]);

  const selectCC = (cc: CC) => {
    setFormData(prev => ({ ...prev, ccId: cc._id }));
    setCcSearch(cc.name);
    setShowCCDropdown(false);
  };

  const handleAddNewCC = async () => {
    if (!newCCName.trim() || !formData.companyId || !formData.productId || !formData.versionId) return;

    try {
      const response = await createCC({
        name: newCCName,
        companyId: formData.companyId,
        productId: formData.productId,
        versionId: formData.versionId
      });
      if (response.success) {
        setFormData(prev => ({ ...prev, ccId: response.cc._id }));
        setCcSearch(response.cc.name);
        setShowAddCCModal(false);
        setNewCCName('');
        loadCCs(formData.companyId, formData.productId, formData.versionId);
      }
    } catch (err) {
      console.error('Error creating CC:', err);
      setError('Failed to create CC');
    }
  };

  const handleAddNewCompany = async () => {
    if (!newCompanyName.trim()) return;

    try {
      const response = await createCompany({ name: newCompanyName });
      if (response.success) {
        setFormData(prev => ({ ...prev, companyId: response.company._id }));
        setCompanySearch(response.company.name);
        setShowAddCompanyModal(false);
        setNewCompanyName('');
        loadCompanies();
      }
    } catch (err) {
      console.error('Error creating company:', err);
      setError('Failed to create company');
    }
  };

  const handleAddNewProduct = async () => {
    if (!newProductName.trim() || !formData.companyId) return;

    try {
      const response = await createProduct({
        name: newProductName,
        companyId: formData.companyId
      });
      if (response.success) {
        setFormData(prev => ({ ...prev, productId: response.product._id }));
        setProductSearch(response.product.name);
        setShowAddProductModal(false);
        setNewProductName('');
        loadProducts(formData.companyId);
      }
    } catch (err) {
      console.error('Error creating product:', err);
      setError('Failed to create product');
    }
  };

  const handleAddNewVersion = async () => {
    if (!newVersionName.trim() || !formData.companyId || !formData.productId) return;

    try {
      const response = await createVersion({
        name: newVersionName,
        companyId: formData.companyId,
        productId: formData.productId
      });
      if (response.success) {
        setFormData(prev => ({ ...prev, versionId: response.version._id }));
        setVersionSearch(response.version.name);
        setShowAddVersionModal(false);
        setNewVersionName('');
        loadVersions(formData.companyId, formData.productId);
      }
    } catch (err) {
      console.error('Error creating version:', err);
      setError('Failed to create version');
    }
  };

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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    try {
      setImageUploading(true);
      setError(null);
      const res = await uploadCatalogItemImage(file);
      if (res.success && res.imageObjectKey) {
        setFormData(prev => ({ ...prev, imageObjectKey: res.imageObjectKey }));
        setImagePreviewUrl(res.imageUrl);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to upload image');
    } finally {
      setImageUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.companyId || !formData.productId || !formData.versionId || !formData.ccId ||
      !formData.itemName || formData.itemPrice <= 0 || formData.serviceCharge < 0 || formData.estimatedTime <= 0) {
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

              {/* Company Dropdown */}
              <div className="form-row">
                <div className="form-group" ref={companyDropdownRef}>
                  <label>Company Name*</label>
                  <input
                    type="text"
                    value={companySearch}
                    onChange={(e) => handleCompanySearch(e.target.value)}
                    onFocus={() => setShowCompanyDropdown(true)}
                    placeholder="Search or add company..."
                    required
                  />
                  {showCompanyDropdown && (
                    <div className="dropdown-list">
                      <div
                        className="dropdown-item dropdown-add-new"
                        onClick={() => setShowAddCompanyModal(true)}
                      >
                        <FaPlus /> Add New Company
                      </div>
                      {companies.length > 0 ? (
                        companies.map(company => (
                          <div
                            key={company._id}
                            className="dropdown-item"
                            onClick={() => selectCompany(company)}
                          >
                            {company.name}
                          </div>
                        ))
                      ) : (
                        companySearch && (
                          <div className="dropdown-no-results">
                            No companies found. Click "Add New Company" to create one.
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Product Dropdown */}
              <div className="form-row" ref={productDropdownRef}>
                <div className="form-group">
                  <label>Product Name *</label>
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => handleProductSearch(e.target.value)}
                    onFocus={() => setShowProductDropdown(true)}
                    placeholder="Search or add product..."
                    disabled={!formData.companyId}
                    required
                  />
                  {showProductDropdown && (
                    <div className="dropdown-list">
                      <div
                        className="dropdown-item dropdown-add-new"
                        onClick={() => setShowAddProductModal(true)}
                      >
                        <FaPlus /> Add New Product
                      </div>
                      {products.length > 0 ? (
                        products.map(product => (
                          <div
                            key={product._id}
                            className="dropdown-item"
                            onClick={() => selectProduct(product)}
                          >
                            {product.name}
                          </div>
                        ))
                      ) : (
                        productSearch && (
                          <div className="dropdown-no-results">
                            No products found. Click "Add New Product" to create one.
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Version Dropdown */}
              <div className="form-row" ref={versionDropdownRef}>
                <div className="form-group">
                  <label>Version *</label>
                  <input
                    type="text"
                    value={versionSearch}
                    onChange={(e) => handleVersionSearch(e.target.value)}
                    onFocus={() => setShowVersionDropdown(true)}
                    placeholder="Search or add version..."
                    disabled={!formData.productId}
                    required
                  />
                  {showVersionDropdown && (
                    <div className="dropdown-list">
                      <div
                        className="dropdown-item dropdown-add-new"
                        onClick={() => setShowAddVersionModal(true)}
                      >
                        <FaPlus /> Add New Version
                      </div>
                      {versions.length > 0 ? (
                        versions.map(version => (
                          <div
                            key={version._id}
                            className="dropdown-item"
                            onClick={() => selectVersion(version)}
                          >
                            {version.name}
                          </div>
                        ))
                      ) : (
                        versionSearch && (
                          <div className="dropdown-no-results">
                            No versions found. Click "Add New Version" to create one.
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* CC Dropdown */}
              <div className="form-row" ref={ccDropdownRef}>
                <div className="form-group">
                  <label>CC *</label>
                  <input
                    type="text"
                    value={ccSearch}
                    onChange={(e) => handleCcSearch(e.target.value)}
                    onFocus={() => setShowCCDropdown(true)}
                    placeholder="Search or add CC..."
                    disabled={!formData.versionId}
                    required
                  />
                  {showCCDropdown && (
                    <div className="dropdown-list">
                      <div
                        className="dropdown-item dropdown-add-new"
                        onClick={() => setShowAddCCModal(true)}
                      >
                        <FaPlus /> Add New CC
                      </div>
                      {ccs.length > 0 ? (
                        ccs.map(cc => (
                          <div
                            key={cc._id}
                            className="dropdown-item"
                            onClick={() => selectCC(cc)}
                          >
                            {cc.name}
                          </div>
                        ))
                      ) : (
                        ccSearch && (
                          <div className="dropdown-no-results">
                            No CCs found. Click "Add New CC" to create one.
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Item Name */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="itemName">Item Name *</label>
                  <input
                    type="text"
                    id="itemName"
                    name="itemName"
                    value={formData.itemName}
                    onChange={handleChange}
                    placeholder="Enter item name"
                    required
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div className="form-row">
                <div className="form-group full-width">
                  <label>Item Image</label>
                  <div className="image-upload-container">
                    {imagePreviewUrl ? (
                      <div className="image-preview-wrapper">
                        <img src={imagePreviewUrl} alt="Preview" className="image-preview" />
                        <button
                          type="button"
                          className="remove-image-btn"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, imageObjectKey: '' }));
                            setImagePreviewUrl('');
                          }}
                        >
                          <FaTimes />
                        </button>
                      </div>
                    ) : (
                      <div className="image-upload-placeholder">
                        <input
                          type="file"
                          id="imageUpload"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e)}
                          className="image-input"
                          disabled={imageUploading}
                        />
                        <label htmlFor="imageUpload" className="image-upload-label">
                          <FaPlus className="upload-icon" />
                          {imageUploading ? 'Uploading…' : 'Click to upload image'}
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="itemPrice">Item Price (Nrs) *</label>
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
                  <label htmlFor="serviceCharge">Service Charge (Nrs) *</label>
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
                  <label>Total Cost (Nrs)</label>
                  <div className="total-cost-display">
                    Nrs {calculatedCost.toFixed(2)}
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

      {/* Add Company Modal */}
      {showAddCompanyModal && (
        <div className="modal-overlay" onClick={() => setShowAddCompanyModal(false)}>
          <div className="add-item-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Company</h2>
              <button className="close-button" onClick={() => setShowAddCompanyModal(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <input
                type="text"
                value={newCompanyName}
                onChange={(e) => setNewCompanyName(e.target.value)}
                placeholder="Enter company name"
                autoFocus
              />
            </div>
            <div className="modal-footer">
              <button className="cancel-button" onClick={() => setShowAddCompanyModal(false)}>
                Cancel
              </button>
              <button className="save-button" onClick={handleAddNewCompany}>
                Add Company
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddProductModal && (
        <div className="modal-overlay" onClick={() => setShowAddProductModal(false)}>
          <div className="add-item-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Product</h2>
              <button className="close-button" onClick={() => setShowAddProductModal(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <input
                type="text"
                value={newProductName}
                onChange={(e) => setNewProductName(e.target.value)}
                placeholder="Enter product name"
                autoFocus
              />
            </div>
            <div className="modal-footer">
              <button className="cancel-button" onClick={() => setShowAddProductModal(false)}>
                Cancel
              </button>
              <button className="save-button" onClick={handleAddNewProduct}>
                Add Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Version Modal */}
      {showAddVersionModal && (
        <div className="modal-overlay" onClick={() => setShowAddVersionModal(false)}>
          <div className="add-item-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Version</h2>
              <button className="close-button" onClick={() => setShowAddVersionModal(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <input
                type="text"
                value={newVersionName}
                onChange={(e) => setNewVersionName(e.target.value)}
                placeholder="Enter version name"
                autoFocus
              />
            </div>
            <div className="modal-footer">
              <button className="cancel-button" onClick={() => setShowAddVersionModal(false)}>
                Cancel
              </button>
              <button className="save-button" onClick={handleAddNewVersion}>
                Add Version
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add CC Modal */}
      {showAddCCModal && (
        <div className="modal-overlay" onClick={() => setShowAddCCModal(false)}>
          <div className="add-item-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New CC</h2>
              <button className="close-button" onClick={() => setShowAddCCModal(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <input
                type="text"
                value={newCCName}
                onChange={(e) => setNewCCName(e.target.value)}
                placeholder="Enter CC name"
                autoFocus
              />
            </div>
            <div className="modal-footer">
              <button className="cancel-button" onClick={() => setShowAddCCModal(false)}>
                Cancel
              </button>
              <button className="save-button" onClick={handleAddNewCC}>
                Add CC
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CatalogModal;
