import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUsers,
  faUserCheck,
  faUserClock,
  faCalendarAlt,
  faSearch,
  faEye,
  faTrash,
  faUserShield,
  faUser,
  faChevronLeft,
  faChevronRight
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar';
import adminUserService from '../services/adminUserService';
import type { User, UserStatistics } from '../services/adminUserService';
import './AdminUsers.css';

const AdminUsers: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState<UserStatistics | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'admin'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminUserService.getAllUsers({
        page: currentPage,
        limit: 10,
        search: searchTerm || undefined,
        role: roleFilter !== 'all' ? roleFilter : undefined,
      });

      if (response.success) {
        setUsers(response.data.users);
        setTotalPages(response.data.pagination.pages);
        setTotalUsers(response.data.pagination.total);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await adminUserService.getUserStatistics();
      if (response.success) {
        setStatistics(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchStatistics();
  }, [currentPage, searchTerm, roleFilter]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleViewDetails = (id: string) => {
    navigate(`/admin/users/${id}`);
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete user "${name}"? This will also delete all their appointments, payments, and packages.`)) {
      return;
    }

    try {
      await adminUserService.deleteUser(id);
      toast.success('User deleted successfully');
      fetchUsers();
      fetchStatistics();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete user');
    }
  };

  const handleRoleChange = async (id: string, currentRole: 'user' | 'admin') => {
    const newRole: 'user' | 'admin' = currentRole === 'user' ? 'admin' : 'user';
    if (!window.confirm(`Change this user's role to ${newRole}?`)) {
      return;
    }

    try {
      await adminUserService.updateUserRole(id, newRole);
      toast.success(`User role updated to ${newRole}`);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update user role');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <>
      <Sidebar />
      <div className="admin-users-container">
        {/* Header */}
        <div className="admin-users-header">
          <h1><FontAwesomeIcon icon={faUsers} /> User Management</h1>
          <p>View and manage all registered users</p>
        </div>

        {/* Statistics Cards */}
        <div className="admin-users-stats-grid">
          <div className="admin-users-stat-card">
            <div className="admin-users-stat-icon" style={{ backgroundColor: '#e3f2fd' }}>
              <FontAwesomeIcon icon={faUsers} style={{ color: '#1976d2' }} />
            </div>
            <div>
              <h3>Total Users</h3>
              <p className="admin-users-stat-value">{statistics?.totalUsers || 0}</p>
            </div>
          </div>

          <div className="admin-users-stat-card">
            <div className="admin-users-stat-icon" style={{ backgroundColor: '#e8f5e9' }}>
              <FontAwesomeIcon icon={faUserCheck} style={{ color: '#388e3c' }} />
            </div>
            <div>
              <h3>Verified Users</h3>
              <p className="admin-users-stat-value">{statistics?.verifiedUsers || 0}</p>
            </div>
          </div>

          <div className="admin-users-stat-card">
            <div className="admin-users-stat-icon" style={{ backgroundColor: '#fff3e0' }}>
              <FontAwesomeIcon icon={faUserClock} style={{ color: '#f57c00' }} />
            </div>
            <div>
              <h3>Unverified Users</h3>
              <p className="admin-users-stat-value">{statistics?.unverifiedUsers || 0}</p>
            </div>
          </div>

          <div className="admin-users-stat-card">
            <div className="admin-users-stat-icon" style={{ backgroundColor: '#fce4ec' }}>
              <FontAwesomeIcon icon={faCalendarAlt} style={{ color: '#c2185b' }} />
            </div>
            <div>
              <h3>New This Month</h3>
              <p className="admin-users-stat-value">{statistics?.newUsersThisMonth || 0}</p>
            </div>
          </div>
        </div>

        {/* Control Bar */}
        <div className="admin-users-control-bar">
          <div className="admin-users-search-box">
            <FontAwesomeIcon icon={faSearch} className="admin-users-search-icon" />
            <input
              type="text"
              className="admin-users-search-input"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>

          <select
            className="admin-users-filter-select"
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value as 'all' | 'user' | 'admin');
              setCurrentPage(1);
            }}
          >
            <option value="all">All Roles</option>
            <option value="user">Users Only</option>
            <option value="admin">Admins Only</option>
          </select>
        </div>

        {/* Users Table */}
        <div className="admin-users-table-container">
          {loading ? (
            <div className="admin-users-loading">
              <div className="admin-users-spinner"></div>
              <p>Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="admin-users-empty">
              <FontAwesomeIcon icon={faUser} size="3x" />
              <h3>No users found</h3>
              <p>Try adjusting your search or filter</p>
            </div>
          ) : (
            <>
              <div className="admin-users-table">
                <div className="admin-users-table-header">
                  <div className="admin-users-col" style={{ flex: 2 }}>User</div>
                  <div className="admin-users-col" style={{ flex: 1 }}>Role</div>
                  <div className="admin-users-col" style={{ flex: 1 }}>Status</div>
                  <div className="admin-users-col" style={{ flex: 1 }}>Joined</div>
                  <div className="admin-users-col" style={{ flex: 1 }}>Actions</div>
                </div>

                <div className="admin-users-table-body">
                  {users.map((user) => (
                    <div key={user._id} className="admin-users-table-row">
                      <div className="admin-users-col" style={{ flex: 2 }}>
                        <div className="admin-users-user-info">
                          {user.profilePictureUrl ? (
                            <img
                              src={user.profilePictureUrl}
                              alt={user.name}
                              className="admin-users-avatar"
                            />
                          ) : (
                            <div className="admin-users-avatar-placeholder">
                              <FontAwesomeIcon icon={faUser} />
                            </div>
                          )}
                          <div>
                            <div className="admin-users-name">{user.name || 'N/A'}</div>
                            <div className="admin-users-email">{user.email}</div>
                          </div>
                        </div>
                      </div>

                      <div className="admin-users-col" style={{ flex: 1 }}>
                        <span className={`admin-users-role-badge ${user.role}`}>
                          <FontAwesomeIcon icon={user.role === 'admin' ? faUserShield : faUser} />
                          {user.role === 'admin' ? 'Admin' : 'User'}
                        </span>
                      </div>

                      <div className="admin-users-col" style={{ flex: 1 }}>
                        <span className={`admin-users-status-badge ${user.isVerified ? 'verified' : 'unverified'}`}>
                          <FontAwesomeIcon icon={user.isVerified ? faUserCheck : faUserClock} />
                          {user.isVerified ? 'Verified' : 'Unverified'}
                        </span>
                      </div>

                      <div className="admin-users-col" style={{ flex: 1 }}>
                        <span className="admin-users-date">{formatDate(user.createdAt)}</span>
                      </div>

                      <div className="admin-users-col" style={{ flex: 1 }}>
                        <div className="admin-users-actions">
                          <button
                            className="admin-users-action-btn admin-users-view-btn"
                            onClick={() => handleViewDetails(user._id)}
                            title="View Details"
                          >
                            <FontAwesomeIcon icon={faEye} />
                          </button>
                          <button
                            className="admin-users-action-btn admin-users-role-btn"
                            onClick={() => handleRoleChange(user._id, user.role)}
                            title={`Change to ${user.role === 'user' ? 'Admin' : 'User'}`}
                          >
                            <FontAwesomeIcon icon={faUserShield} />
                          </button>
                          <button
                            className="admin-users-action-btn admin-users-delete-btn"
                            onClick={() => handleDeleteUser(user._id, user.name || user.email)}
                            title="Delete User"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pagination */}
              <div className="admin-users-pagination">
                <button
                  className="admin-users-page-btn"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <FontAwesomeIcon icon={faChevronLeft} />
                </button>
                <span className="admin-users-page-info">
                  Page {currentPage} of {totalPages} ({totalUsers} users)
                </span>
                <button
                  className="admin-users-page-btn"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <FontAwesomeIcon icon={faChevronRight} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminUsers;
