import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { seniorRequestAPI } from '../../services/api'
import { 
  FaUsers, FaCheckCircle, FaTimes, FaClock, 
  FaFilter, FaSync, FaEye, FaUserGraduate,
  FaComment, FaHistory, FaArrowUp, FaExclamationTriangle,
  FaChartBar, FaUserCheck, FaTag, FaInfoCircle,
  FaUser, FaChartLine, FaFileAlt, FaStar, FaCrown,
  FaSort, FaSortUp, FaSortDown, FaSearch
} from 'react-icons/fa'

const SeniorRequests = () => {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [processing, setProcessing] = useState({})
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  })
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [sortConfig, setSortConfig] = useState({ key: 'requestedAt', direction: 'desc' })
  const { user } = useAuth()

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      setError('')
      
      const response = await seniorRequestAPI.getAllRequests()
      
      if (response && response.success) {
        const requestsData = response.data || []
        
        setRequests(requestsData)
        
        const total = requestsData.length
        const pending = requestsData.filter(r => r.status === 'PENDING').length
        const approved = requestsData.filter(r => r.status === 'APPROVED').length
        const rejected = requestsData.filter(r => r.status === 'REJECTED').length
        
        setStats({ total, pending, approved, rejected })
      } else {
        setError(response?.error || 'Failed to load senior requests')
        setRequests([])
      }
      
    } catch (err) {
      setError(err.message || 'Failed to load senior requests. Please try again.')
      setRequests([])
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (requestId, employeeId) => {
    if (!window.confirm('Are you sure you want to approve this senior request?\n\nThis will promote the employee to Senior role.')) {
      return
    }

    const feedback = window.prompt('Add optional notes for the employee (or leave empty):', 'Congratulations! Your request has been approved.')
    
    setProcessing(prev => ({ ...prev, [requestId]: 'approving' }))
    
    try {
      const response = await seniorRequestAPI.approveRequest(requestId, employeeId)
      
      if (response && response.success) {
        alert('✅ Request approved successfully!\nEmployee has been promoted to Senior role.')
        fetchRequests()
      } else {
        alert('❌ Failed to approve request: ' + (response?.error || 'Unknown error'))
      }
    } catch (err) {
      alert('❌ Failed to approve request: ' + (err.response?.data?.error || err.message || 'Unknown error'))
    } finally {
      setProcessing(prev => ({ ...prev, [requestId]: null }))
    }
  }

  const handleReject = async (requestId, employeeName) => {
    const feedback = window.prompt(`Please provide a reason for rejecting ${employeeName}'s request (required):`, '')
    if (feedback === null) return
    if (feedback.trim() === '') {
      alert('Rejection reason is required.')
      return
    }

    if (!window.confirm(`Are you sure you want to reject ${employeeName}'s request?\n\nReason: ${feedback}`)) {
      return
    }

    setProcessing(prev => ({ ...prev, [requestId]: 'rejecting' }))
    
    try {
      const response = await seniorRequestAPI.rejectRequest(requestId, feedback)
      
      if (response && response.success) {
        alert('✅ Request rejected successfully!')
        fetchRequests()
      } else {
        alert('❌ Failed to reject request: ' + (response?.error || 'Unknown error'))
      }
    } catch (err) {
      alert('❌ Failed to reject request: ' + (err.response?.data?.error || err.message || 'Unknown error'))
    } finally {
      setProcessing(prev => ({ ...prev, [requestId]: null }))
    }
  }

  const handleSort = (key) => {
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const getFilteredRequests = () => {
    let filtered = requests
    
    if (filter !== 'all') {
      filtered = filtered.filter(r => r.status === filter)
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(r => 
        (r.employeeName && r.employeeName.toLowerCase().includes(term)) ||
        (r.employeeEmail && r.employeeEmail.toLowerCase().includes(term)) ||
        (r.reason && r.reason.toLowerCase().includes(term)) ||
        (r.qualifications && r.qualifications.toLowerCase().includes(term))
      )
    }
    
    filtered.sort((a, b) => {
      if (sortConfig.key === 'employeeName') {
        const nameA = a.employeeName || ''
        const nameB = b.employeeName || ''
        return sortConfig.direction === 'asc' 
          ? nameA.localeCompare(nameB)
          : nameB.localeCompare(nameA)
      }
      
      if (sortConfig.key === 'requestedAt') {
        const dateA = new Date(a.requestedAt || 0)
        const dateB = new Date(b.requestedAt || 0)
        return sortConfig.direction === 'asc' 
          ? dateA - dateB
          : dateB - dateA
      }
      
      if (sortConfig.key === 'resolutionRate') {
        const rateA = a.resolutionRate || 0
        const rateB = b.resolutionRate || 0
        return sortConfig.direction === 'asc' 
          ? rateA - rateB
          : rateB - rateA
      }
      
      return 0
    })
    
    return filtered
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return 'Invalid date'
      
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (error) {
      return 'Invalid date'
    }
  }

  const getStatusBadge = (status) => {
    switch(status) {
      case 'PENDING': return { 
        class: 'badge bg-warning text-dark', 
        icon: <FaClock />, 
        label: 'Pending Review'
      }
      case 'APPROVED': return { 
        class: 'badge bg-success', 
        icon: <FaCheckCircle />, 
        label: 'Approved'
      }
      case 'REJECTED': return { 
        class: 'badge bg-danger', 
        icon: <FaTimes />, 
        label: 'Rejected'
      }
      default: return { 
        class: 'badge bg-secondary', 
        icon: null, 
        label: status
      }
    }
  }

  const getResolutionBadge = (rate) => {
    if (rate >= 90) return 'success'
    if (rate >= 80) return 'warning'
    return 'danger'
  }

  const showRequestDetails = (request) => {
    setSelectedRequest(request)
  }

  const closeDetails = () => {
    setSelectedRequest(null)
  }

  const refreshData = () => {
    fetchRequests()
  }

  const clearFilters = () => {
    setFilter('all')
    setSearchTerm('')
    setSortConfig({ key: 'requestedAt', direction: 'desc' })
  }

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort className="text-muted" />
    return sortConfig.direction === 'asc' 
      ? <FaSortUp className="text-primary" /> 
      : <FaSortDown className="text-primary" />
  }

  if (loading) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center" style={{ height: '60vh' }}>
        <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Loading senior requests...</p>
      </div>
    )
  }

  const filteredRequests = getFilteredRequests()
  const hasFilters = filter !== 'all' || searchTerm

  return (
    <div className="container-fluid px-3">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h2 mb-1 fw-bold">
            <FaCrown className="me-2 text-warning" />
            Senior Promotion Requests
          </h1>
          <p className="text-muted mb-0">Review and manage employee requests for senior position promotion</p>
        </div>
        <div className="d-flex gap-2">
          <button 
            className="btn btn-outline-primary d-flex align-items-center"
            onClick={refreshData}
            disabled={loading}
          >
            <FaSync className={`me-2 ${loading ? 'fa-spin' : ''}`} />
            Refresh
          </button>
          <Link to="/admin/dashboard" className="btn btn-outline-secondary d-flex align-items-center">
            <FaArrowUp className="me-2" />
            Dashboard
          </Link>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show mb-4" role="alert">
          <div className="d-flex align-items-center">
            <FaExclamationTriangle className="me-2 flex-shrink-0" />
            <div className="flex-grow-1">
              <strong>Error:</strong> {error}
              <div className="mt-2">
                <button 
                  className="btn btn-sm btn-outline-danger"
                  onClick={refreshData}
                >
                  Try Again
                </button>
              </div>
            </div>
            <button type="button" className="btn-close" onClick={() => setError('')}></button>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="row mb-4 g-4">
        <div className="col-xl-3 col-md-6">
          <div className="card border-primary border-2 h-100 hover-lift">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center">
                <div className="me-3">
                  <div className="text-muted small text-uppercase fw-bold mb-1">Total Requests</div>
                  <div className="h2 mb-0 text-primary fw-bold">{stats.total}</div>
                  <small className="text-muted">All requests</small>
                </div>
                <div className="stat-icon bg-primary bg-opacity-10 text-primary p-3 rounded-circle">
                  <FaUsers className="fs-3" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6">
          <div className="card border-warning border-2 h-100 hover-lift">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center">
                <div className="me-3">
                  <div className="text-muted small text-uppercase fw-bold mb-1">Pending Review</div>
                  <div className="h2 mb-0 text-warning fw-bold">{stats.pending}</div>
                  <small className="text-muted">Awaiting decision</small>
                </div>
                <div className="stat-icon bg-warning bg-opacity-10 text-warning p-3 rounded-circle">
                  <FaClock className="fs-3" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6">
          <div className="card border-success border-2 h-100 hover-lift">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center">
                <div className="me-3">
                  <div className="text-muted small text-uppercase fw-bold mb-1">Approved</div>
                  <div className="h2 mb-0 text-success fw-bold">{stats.approved}</div>
                  <small className="text-muted">Promoted to Senior</small>
                </div>
                <div className="stat-icon bg-success bg-opacity-10 text-success p-3 rounded-circle">
                  <FaCheckCircle className="fs-3" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6">
          <div className="card border-danger border-2 h-100 hover-lift">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center">
                <div className="me-3">
                  <div className="text-muted small text-uppercase fw-bold mb-1">Rejected</div>
                  <div className="h2 mb-0 text-danger fw-bold">{stats.rejected}</div>
                  <small className="text-muted">Requests denied</small>
                </div>
                <div className="stat-icon bg-danger bg-opacity-10 text-danger p-3 rounded-circle">
                  <FaTimes className="fs-3" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card mb-4 border shadow-sm">
        <div className="card-body p-4">
          <div className="row g-3 align-items-end">
            <div className="col-lg-3 col-md-6">
              <label className="form-label fw-bold mb-1 d-flex align-items-center">
                <FaFilter className="me-2" />
                Filter by Status
              </label>
              <select 
                className="form-select"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All Statuses ({stats.total})</option>
                <option value="PENDING">Pending ({stats.pending})</option>
                <option value="APPROVED">Approved ({stats.approved})</option>
                <option value="REJECTED">Rejected ({stats.rejected})</option>
              </select>
            </div>
            
            <div className="col-lg-5 col-md-6">
              <label className="form-label fw-bold mb-1 d-flex align-items-center">
                <FaSearch className="me-2" />
                Search Requests
              </label>
              <div className="input-group">
                <span className="input-group-text bg-transparent border-end-0">
                  <FaSearch className="text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search by employee name, email, or reason..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button 
                    className="btn btn-outline-secondary border-start-0"
                    type="button"
                    onClick={() => setSearchTerm('')}
                  >
                    <FaTimes />
                  </button>
                )}
              </div>
            </div>
            
            <div className="col-lg-2 col-md-6">
              <button 
                className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center"
                onClick={clearFilters}
                disabled={!hasFilters}
              >
                <FaTimes className="me-2" />
                Clear Filters
              </button>
            </div>
            
            <div className="col-lg-2 col-md-6">
              <button 
                className="btn btn-primary w-100 d-flex align-items-center justify-content-center"
                onClick={refreshData}
                disabled={loading}
              >
                <FaSync className={`me-2 ${loading ? 'fa-spin' : ''}`} />
                Refresh Data
              </button>
            </div>
          </div>
          
          <div className="row mt-4">
            <div className="col-12">
              <div className="alert alert-light border mb-0 py-2">
                <div className="d-flex align-items-center">
                  <FaInfoCircle className="me-2 text-primary" />
                  <div className="flex-grow-1">
                    Showing <strong>{filteredRequests.length}</strong> of <strong>{requests.length}</strong> requests
                    {hasFilters && ' (filtered)'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="card border shadow">
        <div className="card-header bg-white border-bottom py-3">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <FaUserGraduate className="me-3 fs-4 text-primary" />
              <div>
                <h5 className="mb-0 fw-bold">Senior Promotion Requests</h5>
                <small className="text-muted">Manage employee promotion requests</small>
              </div>
            </div>
            <div className="d-flex align-items-center gap-2">
              <span className="badge bg-primary px-3 py-2">
                Total: {requests.length}
              </span>
              <span className="badge bg-success px-3 py-2">
                Pending: {stats.pending}
              </span>
            </div>
          </div>
        </div>
        
        <div className="card-body p-0">
          {requests.length === 0 ? (
            <div className="text-center py-5">
              <div className="mb-4">
                <FaUserGraduate className="display-1 text-muted opacity-50" />
              </div>
              <h4 className="text-muted mb-3">No Senior Requests Found</h4>
              <p className="text-muted mb-4 px-3">
                No employees have submitted requests for senior position promotion yet.
              </p>
              <div className="d-flex justify-content-center gap-3">
                <button 
                  className="btn btn-primary d-flex align-items-center"
                  onClick={refreshData}
                  disabled={loading}
                >
                  <FaSync className={`me-2 ${loading ? 'fa-spin' : ''}`} />
                  Check Again
                </button>
                <Link to="/admin/employees" className="btn btn-outline-primary d-flex align-items-center">
                  <FaUsers className="me-2" />
                  View Employees
                </Link>
              </div>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-5">
              <FaFilter className="display-1 text-muted mb-3" />
              <h4 className="mb-3">No Matching Requests</h4>
              <p className="text-muted mb-4 px-3">
                No requests match your current filters. Try adjusting your search criteria.
              </p>
              <button 
                className="btn btn-primary d-flex align-items-center mx-auto"
                onClick={clearFilters}
              >
                <FaTimes className="me-2" />
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: '80px' }} className="ps-4">
                      <button 
                        className="btn btn-sm p-0 border-0 bg-transparent d-flex align-items-center fw-bold"
                        onClick={() => handleSort('id')}
                      >
                        ID {getSortIcon('id')}
                      </button>
                    </th>
                    <th>
                      <button 
                        className="btn btn-sm p-0 border-0 bg-transparent d-flex align-items-center fw-bold"
                        onClick={() => handleSort('employeeName')}
                      >
                        Employee Details {getSortIcon('employeeName')}
                      </button>
                    </th>
                    <th style={{ width: '180px' }}>
                      <button 
                        className="btn btn-sm p-0 border-0 bg-transparent d-flex align-items-center fw-bold"
                        onClick={() => handleSort('requestedAt')}
                      >
                        Request Date {getSortIcon('requestedAt')}
                      </button>
                    </th>
                    <th style={{ width: '150px' }}>
                      <button 
                        className="btn btn-sm p-0 border-0 bg-transparent d-flex align-items-center fw-bold"
                        onClick={() => handleSort('resolutionRate')}
                      >
                        Performance {getSortIcon('resolutionRate')}
                      </button>
                    </th>
                    <th style={{ width: '140px' }}>
                      Status
                    </th>
                    <th style={{ width: '180px' }} className="pe-4 text-end">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map(request => {
                    const status = getStatusBadge(request.status)
                    const resolutionBadge = getResolutionBadge(request.resolutionRate || 0)
                    
                    return (
                      <tr key={request.id} className={request.status === 'PENDING' ? 'table-warning-light' : ''}>
                        <td className="ps-4">
                          <span className="badge bg-secondary px-3 py-2">#{request.id}</span>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-3">
                              <FaUser className="text-primary" size="16" />
                            </div>
                            <div>
                              <div className="fw-bold mb-1">{request.employeeName || 'Unknown'}</div>
                              <small className="text-muted d-block">{request.employeeEmail || 'No email'}</small>
                              <small className="badge bg-info text-dark">
                                ID: {request.employeeId || 'N/A'}
                              </small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="small">
                            <div className="d-flex align-items-center mb-1">
                              <FaClock className="me-2 text-muted" size="14" />
                              {formatDate(request.requestedAt)}
                            </div>
                            {request.reviewedAt && (
                              <div className="text-muted">
                                <small>
                                  <FaHistory className="me-1" size="12" />
                                  Reviewed: {formatDate(request.reviewedAt)}
                                </small>
                              </div>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <FaChartBar className={`me-3 fs-5 text-${resolutionBadge}`} />
                            <div className="w-100">
                              <div className="d-flex justify-content-between mb-1">
                                <span className="fw-bold">{Math.round(request.resolutionRate || 0)}%</span>
                                <span className="text-muted small">{request.resolvedComplaints || 0}/{request.totalComplaints || 0}</span>
                              </div>
                              <div className="progress" style={{ height: '6px' }}>
                                <div 
                                  className={`progress-bar bg-${resolutionBadge}`}
                                  style={{ width: `${request.resolutionRate || 0}%` }}
                                ></div>
                              </div>
                              <div className="text-end mt-1">
                                {(request.resolutionRate || 0) >= 80 && (
                                  <small className={`text-${resolutionBadge} fw-bold`}>
                                    <FaStar size="10" className="me-1" />
                                    Eligible
                                  </small>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${status.class} px-3 py-2 d-inline-flex align-items-center`}>
                            {status.icon} <span className="ms-1">{status.label}</span>
                          </span>
                        </td>
                        <td className="pe-4">
                          <div className="d-flex justify-content-end gap-2">
                            <button
                              className="btn btn-sm btn-outline-primary d-flex align-items-center"
                              onClick={() => showRequestDetails(request)}
                              title="View Details"
                              disabled={processing[request.id]}
                            >
                              <FaEye />
                            </button>
                            
                            {request.status === 'PENDING' && (
                              <>
                                <button
                                  className="btn btn-sm btn-outline-success d-flex align-items-center"
                                  onClick={() => handleApprove(request.id, request.employeeId)}
                                  disabled={processing[request.id]}
                                  title="Approve Request"
                                >
                                  {processing[request.id] === 'approving' ? (
                                    <span className="spinner-border spinner-border-sm"></span>
                                  ) : (
                                    <FaCheckCircle />
                                  )}
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-danger d-flex align-items-center"
                                  onClick={() => handleReject(request.id, request.employeeName)}
                                  disabled={processing[request.id]}
                                  title="Reject Request"
                                >
                                  {processing[request.id] === 'rejecting' ? (
                                    <span className="spinner-border spinner-border-sm"></span>
                                  ) : (
                                    <FaTimes />
                                  )}
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {filteredRequests.length > 0 && (
          <div className="card-footer bg-white border-top py-3">
            <div className="d-flex justify-content-between align-items-center">
              <div className="text-muted">
                <FaInfoCircle className="me-2" />
                Showing {filteredRequests.length} of {requests.length} requests
              </div>
              <div className="d-flex gap-2">
                <button 
                  className="btn btn-sm btn-outline-primary d-flex align-items-center"
                  onClick={refreshData}
                  disabled={loading}
                >
                  <FaSync className={`me-2 ${loading ? 'fa-spin' : ''}`} />
                  Refresh
                </button>
                <button 
                  className="btn btn-sm btn-primary d-flex align-items-center"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                >
                  <FaArrowUp className="me-2" />
                  Back to Top
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Request Details Modal */}
      {selectedRequest && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-primary text-white py-3">
                <div className="d-flex align-items-center">
                  <FaUserGraduate className="me-3 fs-4" />
                  <div>
                    <h5 className="modal-title mb-0 fw-bold">Request Details</h5>
                    <small className="opacity-75">ID: #{selectedRequest.id}</small>
                  </div>
                </div>
                <button type="button" className="btn-close btn-close-white" onClick={closeDetails}></button>
              </div>
              
              <div className="modal-body p-4">
                <div className="row g-4 mb-4">
                  <div className="col-md-6">
                    <div className="card border h-100">
                      <div className="card-header bg-light py-3">
                        <h6 className="mb-0 fw-bold d-flex align-items-center">
                          <FaUser className="me-2" />
                          Employee Information
                        </h6>
                      </div>
                      <div className="card-body">
                        <div className="mb-3">
                          <label className="form-label text-muted mb-1">Full Name</label>
                          <div className="fw-bold text-primary fs-5">{selectedRequest.employeeName || 'Unknown'}</div>
                        </div>
                        <div className="mb-3">
                          <label className="form-label text-muted mb-1">Email Address</label>
                          <div className="text-break">{selectedRequest.employeeEmail || 'No email'}</div>
                        </div>
                        <div className="mb-3">
                          <label className="form-label text-muted mb-1">Employee ID</label>
                          <div className="badge bg-secondary fs-6 px-3 py-2">{selectedRequest.employeeId || 'N/A'}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <div className="card border h-100">
                      <div className="card-header bg-light py-3">
                        <h6 className="mb-0 fw-bold d-flex align-items-center">
                          <FaFileAlt className="me-2" />
                          Request Information
                        </h6>
                      </div>
                      <div className="card-body">
                        <div className="mb-3">
                          <label className="form-label text-muted mb-1">Status</label>
                          <div>
                            <span className={`badge ${getStatusBadge(selectedRequest.status).class} fs-6 px-3 py-2 d-inline-flex align-items-center`}>
                              {getStatusBadge(selectedRequest.status).icon} 
                              <span className="ms-2">{getStatusBadge(selectedRequest.status).label}</span>
                            </span>
                          </div>
                        </div>
                        <div className="mb-3">
                          <label className="form-label text-muted mb-1">Submission Date</label>
                          <div>{formatDate(selectedRequest.requestedAt)}</div>
                        </div>
                        {selectedRequest.reviewedAt && (
                          <div className="mb-3">
                            <label className="form-label text-muted mb-1">Review Date</label>
                            <div>{formatDate(selectedRequest.reviewedAt)}</div>
                          </div>
                        )}
                        {selectedRequest.adminNotes && (
                          <div className="mb-3">
                            <label className="form-label text-muted mb-1">Admin Notes</label>
                            <div className="alert alert-info p-3 mb-0">{selectedRequest.adminNotes}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Performance Stats */}
                <div className="card border-info mb-4">
                  <div className="card-header bg-info text-white py-3">
                    <h6 className="mb-0 fw-bold d-flex align-items-center">
                      <FaChartLine className="me-2" />
                      Performance Statistics
                    </h6>
                  </div>
                  <div className="card-body p-4">
                    <div className="row text-center mb-4">
                      <div className="col-4">
                        <div className="display-5 fw-bold text-primary">{selectedRequest.totalComplaints || 0}</div>
                        <small className="text-muted">Total Assigned</small>
                      </div>
                      <div className="col-4">
                        <div className="display-5 fw-bold text-success">{selectedRequest.resolvedComplaints || 0}</div>
                        <small className="text-muted">Resolved</small>
                      </div>
                      <div className="col-4">
                        <div className="display-5 fw-bold text-warning">{Math.round(selectedRequest.resolutionRate || 0)}%</div>
                        <small className="text-muted">Success Rate</small>
                      </div>
                    </div>
                    <div className="progress" style={{ height: '20px' }}>
                      <div 
                        className="progress-bar bg-success" 
                        style={{ width: `${selectedRequest.resolutionRate || 0}%` }}
                        role="progressbar"
                      >
                        <span className="fw-bold">{Math.round(selectedRequest.resolutionRate || 0)}%</span>
                      </div>
                    </div>
                    <div className="text-center mt-3">
                      <small className="text-muted">
                        Minimum required: 80% | Current: {Math.round(selectedRequest.resolutionRate || 0)}%
                      </small>
                    </div>
                  </div>
                </div>

                {/* Application Details */}
                <div className="card border">
                  <div className="card-header bg-light py-3">
                    <h6 className="mb-0 fw-bold d-flex align-items-center">
                      <FaComment className="me-2" />
                      Application Details
                    </h6>
                  </div>
                  <div className="card-body p-4">
                    <div className="mb-4">
                      <h6 className="mb-3 text-primary">Reason for Request</h6>
                      <div className="alert alert-light p-4 border">
                        {selectedRequest.reason || 'No reason provided'}
                      </div>
                    </div>

                    {selectedRequest.qualifications && (
                      <div className="mb-4">
                        <h6 className="mb-3 text-primary">Qualifications</h6>
                        <div className="alert alert-light p-4 border">
                          {selectedRequest.qualifications}
                        </div>
                      </div>
                    )}

                    {selectedRequest.experience && (
                      <div className="mb-4">
                        <h6 className="mb-3 text-primary">Experience</h6>
                        <div className="alert alert-light p-4 border">
                          {selectedRequest.experience}
                        </div>
                      </div>
                    )}

                    {selectedRequest.additionalInfo && (
                      <div className="mb-4">
                        <h6 className="mb-3 text-primary">Additional Information</h6>
                        <div className="alert alert-light p-4 border">
                          {selectedRequest.additionalInfo}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="modal-footer py-3">
                <button type="button" className="btn btn-outline-secondary" onClick={closeDetails}>
                  Close
                </button>
                {selectedRequest.status === 'PENDING' && (
                  <div className="d-flex gap-3">
                    <button
                      type="button"
                      className="btn btn-danger d-flex align-items-center"
                      onClick={() => {
                        handleReject(selectedRequest.id, selectedRequest.employeeName)
                        closeDetails()
                      }}
                      disabled={processing[selectedRequest.id]}
                    >
                      {processing[selectedRequest.id] === 'rejecting' ? (
                        <span className="spinner-border spinner-border-sm me-2"></span>
                      ) : (
                        <FaTimes className="me-2" />
                      )}
                      Reject Request
                    </button>
                    <button
                      type="button"
                      className="btn btn-success d-flex align-items-center"
                      onClick={() => {
                        handleApprove(selectedRequest.id, selectedRequest.employeeId)
                        closeDetails()
                      }}
                      disabled={processing[selectedRequest.id]}
                    >
                      {processing[selectedRequest.id] === 'approving' ? (
                        <span className="spinner-border spinner-border-sm me-2"></span>
                      ) : (
                        <FaCheckCircle className="me-2" />
                      )}
                      Approve Request
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom CSS */}
      <style jsx>{`
        .hover-lift {
          transition: all 0.3s ease;
        }
        
        .hover-lift:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }
        
        .table-warning-light {
          background-color: rgba(255, 193, 7, 0.05) !important;
        }
        
        .stat-icon {
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .btn-outline-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(13, 110, 253, 0.2);
        }
        
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(13, 110, 253, 0.3);
        }
        
        .progress {
          border-radius: 10px;
        }
        
        .progress-bar {
          border-radius: 10px;
        }
      `}</style>
    </div>
  )
}

export default SeniorRequests