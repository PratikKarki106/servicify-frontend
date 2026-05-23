import { useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import './AdminHistory.css';
import Sidebar from '../components/Sidebar';
import {
  FaHistory,
  FaCalendarAlt,
  FaFilter,
  FaFileCsv,
  FaTools,
  FaCheckCircle,
  FaChevronUp,
  FaChevronDown,
  FaSpinner,
  FaSearch,
  FaCubes,
} from 'react-icons/fa';
import { fetchHistory, exportHistoryToCSV } from '../services/History';
import { getAllPurchases } from '../services/cartPurchaseService';
import type {
  HistoryFilters,
  HistoryGroup,
  HistoryItem,
  AppointmentHistoryItem,
  PackageHistoryItem,
} from '../services/History';

type UnifiedType = 'appointment' | 'package' | 'catalog';

interface CatalogHistoryItem {
  _id: string;
  _type: 'catalog';
  purchaseCode: string;
  userName: string;
  userEmail: string;
  itemsCount: number;
  totalAmount: number;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  createdAt: string;
}

type UnifiedHistoryItem = (AppointmentHistoryItem & { _type: 'appointment' }) | (PackageHistoryItem & { _type: 'package' }) | CatalogHistoryItem;

interface CatalogPurchaseApi {
  _id: string;
  purchaseCode: string;
  paymentStatus?: 'pending' | 'completed' | 'failed' | 'refunded';
  totalAmount?: number;
  createdAt: string;
  items?: Array<unknown>;
  userId?: {
    name?: string;
    email?: string;
  };
}

interface UnifiedHistoryGroup {
  date: string;
  items: UnifiedHistoryItem[];
  totalRevenue: number;
  appointmentCount: number;
  packageCount: number;
  catalogCount: number;
}

const COLORS = {
  primary: '#4fc3f7',
  success: '#00796B',
  warning: '#f59e0b',
  danger: '#C62828',
  confirmed: '#2E7D32',
  booked: '#1976D2',
};

const STATUS_COLORS: Record<string, string> = {
  completed: COLORS.success,
  confirmed: COLORS.confirmed,
  'in-progress': COLORS.primary,
  payment: COLORS.warning,
  booked: COLORS.booked,
  cancelled: COLORS.danger,
  pending: '#f59e0b',
  failed: COLORS.danger,
  refunded: '#6b7280',
};

const APPOINTMENT_STATUS_OPTIONS = ['booked', 'confirmed', 'in-progress', 'payment', 'completed', 'cancelled'];
const PAYMENT_STATUS_OPTIONS = ['pending', 'completed', 'failed', 'refunded'];
const ALL_STATUS_OPTIONS = [...APPOINTMENT_STATUS_OPTIONS, ...PAYMENT_STATUS_OPTIONS];
const ITEMS_PER_PAGE = 5;

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const formatCurrency = (amount: number): string => `Rs. ${amount.toLocaleString()}`;
const getStatusLabel = (status: string): string => status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ');
const isAppointmentItem = (item: UnifiedHistoryItem): item is AppointmentHistoryItem & { _type: 'appointment' } =>
  item._type === 'appointment';
const isCatalogItem = (item: UnifiedHistoryItem): item is CatalogHistoryItem => item._type === 'catalog';

const getItemDate = (item: UnifiedHistoryItem): string =>
  isAppointmentItem(item) ? item.createdAt : isCatalogItem(item) ? item.createdAt : item.purchasedAt;

const getItemStatus = (item: UnifiedHistoryItem): string =>
  isAppointmentItem(item) ? item.status : isCatalogItem(item) ? item.paymentStatus : item.paymentStatus;

const getItemAmount = (item: UnifiedHistoryItem): number =>
  isAppointmentItem(item) ? item.totalAmount || 0 : isCatalogItem(item) ? Number(item.totalAmount || 0) : item.amount || 0;

const isFilterActive = (filters: HistoryFilters): boolean =>
  filters.type !== 'all' || filters.status !== 'all' || Boolean(filters.startDate) || Boolean(filters.endDate);

const ResultsSkeleton = () => (
  <div className="history-groups">
    {[...Array(3)].map((_, i) => (
      <div className="skeleton skeleton-group" key={i} />
    ))}
  </div>
);

const HistoryItemCard = ({ item, showDate = false }: { item: UnifiedHistoryItem; showDate?: boolean }) => {
  const status = getItemStatus(item);
  const statusColor = STATUS_COLORS[status.toLowerCase()] || COLORS.primary;

  return (
    <div className="history-item-card">
      <div className="history-item-header">
        <div className="history-item-type">
          {isAppointmentItem(item) ? (
            <>
              <FaTools className="type-icon" />
              <span className="type-label">Appointment</span>
            </>
          ) : isCatalogItem(item) ? (
            <>
              <FaCubes className="type-icon" />
              <span className="type-label">Catalog</span>
            </>
          ) : (
            <>
              <FaCubes className="type-icon" />
              <span className="type-label">Package</span>
            </>
          )}
        </div>
        <div className="history-item-status" style={{ background: `${statusColor}18`, color: statusColor }}>
          {getStatusLabel(status)}
        </div>
      </div>

      <div className="history-item-body">
        <div className="history-item-info">
          {showDate && (
            <div className="info-row">
              <span className="info-label">Date:</span>
              <span className="info-value">{formatDate(getItemDate(item))}</span>
            </div>
          )}
          {isAppointmentItem(item) ? (
            <>
              <div className="info-row"><span className="info-label">Service:</span><span className="info-value">{getStatusLabel(item.serviceType)}</span></div>
              <div className="info-row"><span className="info-label">Customer:</span><span className="info-value">{item.name}</span></div>
              <div className="info-row"><span className="info-label">Vehicle:</span><span className="info-value">{item.vehicleInfo.name} {item.vehicleInfo.model}</span></div>
              <div className="info-row"><span className="info-label">Time:</span><span className="info-value">{item.time}</span></div>
            </>
          ) : isCatalogItem(item) ? (
            <>
              <div className="info-row"><span className="info-label">Order:</span><span className="info-value">{item.purchaseCode}</span></div>
              <div className="info-row"><span className="info-label">Customer:</span><span className="info-value">{item.userName || 'N/A'}</span></div>
              <div className="info-row"><span className="info-label">Email:</span><span className="info-value">{item.userEmail || 'N/A'}</span></div>
              <div className="info-row"><span className="info-label">Items:</span><span className="info-value">{item.itemsCount}</span></div>
            </>
          ) : (
            <>
              <div className="info-row"><span className="info-label">Package:</span><span className="info-value">{item.packageName}</span></div>
              <div className="info-row"><span className="info-label">Customer:</span><span className="info-value">{item.userName}</span></div>
              <div className="info-row"><span className="info-label">Credits:</span><span className="info-value">{item.totalCredits} credits</span></div>
              <div className="info-row"><span className="info-label">Valid Until:</span><span className="info-value">{formatDate(item.expiryDate)}</span></div>
            </>
          )}
        </div>
        <div className="history-item-amount">
          <div className="amount-label">Amount</div>
          <div className="amount-value">{formatCurrency(getItemAmount(item))}</div>
        </div>
      </div>
    </div>
  );
};

const HistoryGroupSection = ({
  group,
  expanded,
  onToggle,
}: {
  group: UnifiedHistoryGroup;
  expanded: boolean;
  onToggle: () => void;
}) => (
  <div className={`history-group ${expanded ? 'expanded' : ''}`}>
    <div className="history-group-header" onClick={onToggle} role="button" tabIndex={0} aria-expanded={expanded}>
      <div className="group-date-section">
        <div className="group-date">
          <FaCalendarAlt className="date-icon" />
          <span>{formatDate(group.date)}</span>
        </div>
        <div className="group-stats">
          <span className="stat">{group.appointmentCount} appointments</span>
          <span className="stat">{group.packageCount} packages</span>
          <span className="stat">{group.catalogCount} catalogs</span>
          <span className="stat revenue">{formatCurrency(group.totalRevenue)}</span>
        </div>
      </div>
      <div className="group-toggle">{expanded ? <FaChevronUp /> : <FaChevronDown />}</div>
    </div>
    {expanded && (
      <div className="history-group-items">
        {group.items.map((item) => (
          <HistoryItemCard key={`${item._type}-${item._id}`} item={item} />
        ))}
      </div>
    )}
  </div>
);

const FilterPanel = ({
  filters,
  onFilterChange,
  isOpen,
}: {
  filters: HistoryFilters;
  onFilterChange: (filters: HistoryFilters) => void;
  isOpen: boolean;
}) => {
  const startDateRef = useRef<HTMLInputElement>(null);
  const endDateRef = useRef<HTMLInputElement>(null);
  if (!isOpen) return null;
  const handleChange = (key: keyof HistoryFilters, value: string) => onFilterChange({ ...filters, [key]: value });

  const openPicker = (ref: { current: HTMLInputElement | null }) => {
    if (!ref.current) return;
    const input = ref.current as HTMLInputElement & { showPicker?: () => void };
    if (typeof input.showPicker === 'function') {
      input.showPicker();
    } else {
      input.focus();
    }
  };

  return (
    <div className="filter-panel">
      <div className="filter-panel-content">
        <div className="filter-row">
          <div className="filter-group">
            <label className="filter-label"><FaSearch /> Type</label>
            <select className="filter-select" value={filters.type || 'all'} onChange={(e) => handleChange('type', e.target.value)}>
              <option value="all">All Types</option>
              <option value="appointment">Appointments</option>
              <option value="package">Packages</option>
              <option value="catalog">Catalogs</option>
            </select>
          </div>
          <div className="filter-group">
            <label className="filter-label"><FaCheckCircle /> Status</label>
            <select className="filter-select" value={filters.status || 'all'} onChange={(e) => handleChange('status', e.target.value)}>
              <option value="all">All Statuses</option>
              {ALL_STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>{getStatusLabel(status)}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label className="filter-label"><FaCalendarAlt /> Start Date</label>
            <div className="filter-date-wrapper">
              <button
                type="button"
                className="filter-date-icon"
                onClick={() => openPicker(startDateRef)}
                aria-label="Open start date calendar"
              >
                <FaCalendarAlt />
              </button>
              <input
                ref={startDateRef}
                type="date"
                className="filter-date with-icon"
                value={filters.startDate || ''}
                onChange={(e) => handleChange('startDate', e.target.value)}
                readOnly
                onClick={() => openPicker(startDateRef)}
              />
            </div>
          </div>
          <div className="filter-group">
            <label className="filter-label"><FaCalendarAlt /> End Date</label>
            <div className="filter-date-wrapper">
              <button
                type="button"
                className="filter-date-icon"
                onClick={() => openPicker(endDateRef)}
                aria-label="Open end date calendar"
              >
                <FaCalendarAlt />
              </button>
              <input
                ref={endDateRef}
                type="date"
                className="filter-date with-icon"
                value={filters.endDate || ''}
                onChange={(e) => handleChange('endDate', e.target.value)}
                readOnly
                onClick={() => openPicker(endDateRef)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminHistory = () => {
  const [filters, setFilters] = useState<HistoryFilters>({
    type: 'all',
    status: 'all',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 100,
  });
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [exportLoading, setExportLoading] = useState(false);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const historyQuery = useQuery({
    queryKey: ['history', filters.startDate, filters.endDate],
    queryFn: () =>
      fetchHistory({
        type: 'all',
        status: 'all',
        startDate: filters.startDate,
        endDate: filters.endDate,
        page: 1,
        limit: 500,
      }),
    placeholderData: (previousData) => previousData,
  });

  const catalogQuery = useQuery({
    queryKey: ['catalog-purchases'],
    queryFn: getAllPurchases,
    placeholderData: (previousData) => previousData,
  });

  const historyData = historyQuery.data?.data;
  const isInitialLoading = (historyQuery.isLoading || catalogQuery.isLoading) && !historyData;
  const isRefreshing = (historyQuery.isFetching || catalogQuery.isFetching) && !!historyData;

  const allUnifiedItems = useMemo(() => {
    const historyItems: UnifiedHistoryItem[] = (historyData?.groups || []).flatMap((group: HistoryGroup) =>
      group.items.map((item: HistoryItem) => ({
        ...item,
        _type: ('appointmentId' in item ? 'appointment' : 'package') as UnifiedType,
      })) as UnifiedHistoryItem[]
    );

    const catalogItems: UnifiedHistoryItem[] = ((catalogQuery.data?.data || []) as CatalogPurchaseApi[]).map((purchase) => ({
      _id: purchase._id,
      _type: 'catalog',
      purchaseCode: purchase.purchaseCode,
      userName: purchase.userId?.name || 'N/A',
      userEmail: purchase.userId?.email || 'N/A',
      itemsCount: purchase.items?.length || 0,
      totalAmount: Number(purchase.totalAmount || 0),
      paymentStatus: purchase.paymentStatus || 'pending',
      createdAt: purchase.createdAt,
    }));

    return [...historyItems, ...catalogItems].sort(
      (a, b) => new Date(getItemDate(b)).getTime() - new Date(getItemDate(a)).getTime()
    );
  }, [historyData?.groups, catalogQuery.data?.data]);

  const filteredItems = useMemo(() => {
    return allUnifiedItems.filter((item) => {
      if (filters.type && filters.type !== 'all' && item._type !== filters.type) return false;

      if (filters.status && filters.status !== 'all') {
        const itemStatus = getItemStatus(item).toLowerCase();
        if (itemStatus !== filters.status.toLowerCase()) return false;
      }

      const itemDate = new Date(getItemDate(item));
      if (filters.startDate) {
        const start = new Date(filters.startDate);
        start.setHours(0, 0, 0, 0);
        if (itemDate < start) return false;
      }
      if (filters.endDate) {
        const end = new Date(filters.endDate);
        end.setHours(23, 59, 59, 999);
        if (itemDate > end) return false;
      }

      return true;
    });
  }, [allUnifiedItems, filters]);

  const groupedItems = useMemo(() => {
    const groupsMap = new Map<string, UnifiedHistoryGroup>();

    filteredItems.forEach((item) => {
      const dateKey = new Date(getItemDate(item)).toISOString().split('T')[0];
      if (!groupsMap.has(dateKey)) {
        groupsMap.set(dateKey, {
          date: dateKey,
          items: [],
          totalRevenue: 0,
          appointmentCount: 0,
          packageCount: 0,
          catalogCount: 0,
        });
      }

      const group = groupsMap.get(dateKey)!;
      group.items.push(item);
      group.totalRevenue += getItemAmount(item);
      if (item._type === 'appointment') group.appointmentCount += 1;
      if (item._type === 'package') group.packageCount += 1;
      if (item._type === 'catalog') group.catalogCount += 1;
    });

    return [...groupsMap.values()]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .map((group) => ({
        ...group,
        items: group.items.sort((a, b) => new Date(getItemDate(b)).getTime() - new Date(getItemDate(a)).getTime()),
      }));
  }, [filteredItems]);

  const filterApplied = isFilterActive(filters);
  const totalItems = filterApplied ? filteredItems.length : groupedItems.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const effectivePage = Math.min(currentPage, totalPages);

  const paginatedFilteredItems = useMemo(() => {
    const startIndex = (effectivePage - 1) * ITEMS_PER_PAGE;
    return filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredItems, effectivePage]);

  const paginatedGroupedItems = useMemo(() => {
    const startIndex = (effectivePage - 1) * ITEMS_PER_PAGE;
    return groupedItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [groupedItems, effectivePage]);

  const handleFilterChange = (newFilters: HistoryFilters) => {
    setFilters({ ...newFilters, page: 1 });
    setCurrentPage(1);
  };

  const handleExport = async () => {
    try {
      setExportLoading(true);
      await exportHistoryToCSV({
        ...filters,
        type: filters.type === 'catalog' ? 'all' : filters.type,
      });
    } catch (err) {
      console.error('Export failed:', err);
      alert('Failed to export history. Please try again.');
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <>
      <Sidebar />
      <div className="history-container">
        <div className="history-content">
          <div className="history-header">
            <div>
              <h1 className="history-title"><FaHistory className="title-icon" /> History</h1>
              <p className="history-subtitle">Complete record of all appointments, packages, and catalogs</p>
            </div>
            <div className="history-actions">
              <button
                className={`header-action-btn filter-toggle-btn ${isFilterPanelOpen ? 'active' : ''}`}
                onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
              >
                <FaFilter /> Filters
              </button>
              <button
                className="header-action-btn export-btn"
                onClick={handleExport}
                disabled={exportLoading}
              >
                {exportLoading ? <FaSpinner className="spin-icon" /> : <FaFileCsv />}
                <span className="export-label">{exportLoading ? 'Exporting...' : 'Export CSV'}</span>
              </button>
            </div>
          </div>

          <FilterPanel filters={filters} onFilterChange={handleFilterChange} isOpen={isFilterPanelOpen} />

          <div className="history-results-container" style={{ position: 'relative' }}>
            {isRefreshing && (
              <div className="refreshing-overlay">
                <FaSpinner className="spin-icon" />
                <span>Fetching results...</span>
              </div>
            )}

            {isInitialLoading ? (
              <ResultsSkeleton />
            ) : historyQuery.isError || catalogQuery.isError ? (
              <div className="error-state">
                <div className="error-icon">⚠️</div>
                <h2>Failed to Load History</h2>
                <p>{(historyQuery.error as Error)?.message || (catalogQuery.error as Error)?.message || 'Failed to load history data'}</p>
                <button className="retry-btn" onClick={() => { historyQuery.refetch(); catalogQuery.refetch(); }}>
                  <FaSpinner className="retry-icon" /> Try Again
                </button>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📜</div>
                <h2>No History Found</h2>
                <p>No history data available for the selected filters.</p>
              </div>
            ) : filterApplied ? (
              <div className="history-groups">
                {paginatedFilteredItems.map((item) => (
                  <HistoryItemCard key={`${item._type}-${item._id}`} item={item} showDate />
                ))}
              </div>
            ) : (
              <div className="history-groups">
                {paginatedGroupedItems.map((group) => (
                  <HistoryGroupSection
                    key={group.date}
                    group={group}
                    expanded={expandedGroups.has(group.date)}
                    onToggle={() =>
                      setExpandedGroups((prev) => {
                        const next = new Set(prev);
                        if (next.has(group.date)) next.delete(group.date);
                        else next.add(group.date);
                        return next;
                      })
                    }
                  />
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="history-inline-pagination">
                <button
                  className="history-inline-pagination-btn"
                  onClick={() => setCurrentPage(Math.max(1, effectivePage - 1))}
                  disabled={effectivePage === 1}
                >
                  {'<'}
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    className={`history-inline-pagination-btn ${pageNum === effectivePage ? 'active' : ''}`}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                ))}
                <button
                  className="history-inline-pagination-btn"
                  onClick={() => setCurrentPage(Math.min(totalPages, effectivePage + 1))}
                  disabled={effectivePage === totalPages}
                >
                  {'>'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminHistory;
