import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { complaintAPI } from '../services/api'
import { 
  FaEye, FaPlus, FaSync, FaCalendar, 
  FaHeart, FaUserCheck, FaTag, 
  FaPaperclip, FaExclamationTriangle,
  FaInbox, FaCheckCircle, FaClock,
  FaFileAlt, FaChartLine, FaFire,
  FaRegClock, FaCircle
} from 'react-icons/fa'
import './MyComplaints.css'

const MyComplaints = () => {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchComplaints()
  }, [])

  const fetchComplaints = async () => {
    try {
      setLoading(true)
      const response = await complaintAPI.getMyComplaints()
      
      let complaintsData = []
      
      if (Array.isArray(response)) {
        complaintsData = response
      } else if (response && Array.isArray(response.data)) {
        complaintsData = response.data
      } else if (response && typeof response === 'object' && response.data) {
        complaintsData = [response.data]
      }
      
      const filteredComplaints = complaintsData.filter(complaint => 
        complaint.userId !== null && complaint.userId !== undefined
      )
      
      setComplaints(filteredComplaints)
      setError('')
      
    } catch (err) {
      if (err.status === 401) {
        setError('Your session has expired. Please login again.')
        setTimeout(() => {
          window.location.href = '/login'
        }, 2000)
      } else {
        setError(`Failed to fetch complaints: ${err.message || 'Unknown error'}`)
      }
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Just now'
    
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return 'Invalid date'
      
      const now = new Date()
      const diffMs = now - date
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
      
      if (diffDays === 0) {
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
        if (diffHours === 0) {
          const diffMinutes = Math.floor(diffMs / (1000 * 60))
          return `${diffMinutes}m ago`
        }
        return `${diffHours}h ago`
      } else if (diffDays < 7) {
        return `${diffDays}d ago`
      } else {
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        })
      }
    } catch (error) {
      return 'Invalid date'
    }
  }

  const getStatusConfig = (status) => {
    const statusMap = {
      'NEW': { 
        class: 'new', 
        label: 'NEW', 
        pillClass: 'status-new-pill',
        barClass: 'status-new-bar',
        color: '#2196F3'
      },
      'UNDER_REVIEW': { 
        class: 'review', 
        label: 'UNDER REVIEW', 
        pillClass: 'status-review-pill',
        barClass: 'status-review-bar',
        color: '#FF9800'
      },
      'RESOLVED': { 
        class: 'resolved', 
        label: 'RESOLVED', 
        pillClass: 'status-resolved-pill',
        barClass: 'status-resolved-bar',
        color: '#F44336'
      },
      'IN_PROGRESS': { 
        class: 'progress', 
        label: 'IN PROGRESS', 
        pillClass: 'status-progress-pill',
        barClass: 'status-progress-bar',
        color: '#4CAF50'
      }
    }
    
    return statusMap[status?.toUpperCase()] || { 
      class: 'unknown', 
      label: 'UNKNOWN', 
      pillClass: 'status-new-pill',
      barClass: 'status-new-bar',
      color: '#757575'
    }
  }

  const getUrgencyConfig = (urgency) => {
    const urgencyMap = {
      'HIGH': { 
        class: 'high', 
        label: 'HIGH',
        indicatorClass: 'urgency-high',
        color: '#D32F2F'
      },
      'MEDIUM': { 
        class: 'medium', 
        label: 'MEDIUM',
        indicatorClass: 'urgency-medium',
        color: '#F57C00'
      },
      'LOW': { 
        class: 'low', 
        label: 'LOW',
        indicatorClass: 'urgency-low',
        color: '#388E3C'
      },
      'NORMAL': { 
        class: 'normal', 
        label: 'NORMAL',
        indicatorClass: 'urgency-normal',
        color: '#1976D2'
      }
    }
    
    return urgencyMap[urgency?.toUpperCase()] || { 
      class: 'normal', 
      label: 'NORMAL',
      indicatorClass: 'urgency-normal',
      color: '#1976D2'
    }
  }

  // Loading skeleton
  if (loading) {
    return (
      <div className="my-complaints-container">
        <div className="clean-header">
          <div className="header-left">
            <h1 className="page-title">My Complaints</h1>
            <p className="page-subtitle">Track and manage your submitted complaints</p>
          </div>
        </div>

        <div className="loading-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="loading-card">
              <div className="loading-line short"></div>
              <div className="loading-line medium"></div>
              <div className="loading-line long"></div>
              <div className="loading-line short"></div>
              <div className="loading-line medium"></div>
              <div className="loading-line short"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const stats = {
    total: complaints.length,
    resolved: complaints.filter(c => c.status === 'RESOLVED').length,
    pending: complaints.filter(c => c.status === 'UNDER_REVIEW' || c.status === 'IN_PROGRESS').length,
    new: complaints.filter(c => c.status === 'NEW').length
  }

  return (
    <div className="my-complaints-container">
      {/* Clean Header */}
      <div className="clean-header">
        <div className="header-left">
          <h1 className="page-title">My Complaints</h1>
          <p className="page-subtitle">Track and manage your submitted complaints</p>
        </div>
        
        <div className="header-right">
          <button 
            onClick={fetchComplaints}
            disabled={loading}
            className="btn"
          >
            <FaSync className={loading ? 'spin' : ''} />
            Refresh
          </button>
          <Link to="/submit" className="btn primary">
            <FaPlus />
            New Complaint
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-container">
        <div className="stat-card-clean">
          <div className="stat-icon-clean" style={{background: '#2196F3'}}>
            <FaInbox />
          </div>
          <div className="stat-content-clean">
            <h3 className="stat-number-clean">{stats.total}</h3>
            <p className="stat-label-clean">Total Complaints</p>
          </div>
        </div>
        
        <div className="stat-card-clean">
          <div className="stat-icon-clean" style={{background: '#FF9800'}}>
            <FaFire />
          </div>
          <div className="stat-content-clean">
            <h3 className="stat-number-clean">{stats.new}</h3>
            <p className="stat-label-clean">New</p>
          </div>
        </div>
        
        <div className="stat-card-clean">
          <div className="stat-icon-clean" style={{background: '#4CAF50'}}>
            <FaChartLine />
          </div>
          <div className="stat-content-clean">
            <h3 className="stat-number-clean">{stats.pending}</h3>
            <p className="stat-label-clean">In Progress</p>
          </div>
        </div>
        
        <div className="stat-card-clean">
          <div className="stat-icon-clean" style={{background: '#F44336'}}>
            <FaCheckCircle />
          </div>
          <div className="stat-content-clean">
            <h3 className="stat-number-clean">{stats.resolved}</h3>
            <p className="stat-label-clean">Resolved</p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-alert">
          <FaExclamationTriangle />
          <p>{error}</p>
        </div>
      )}

      {/* Complaints Grid */}
      {!loading && complaints.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <FaInbox />
          </div>
          <h2 className="empty-title">No complaints yet</h2>
          <p className="empty-subtitle">
            You haven't submitted any non-anonymous complaints. Start by creating your first complaint.
          </p>
          <div className="d-flex gap-2">
            <Link to="/submit" className="btn primary">
              <FaPlus />
              Create Complaint
            </Link>
            <button className="btn" onClick={fetchComplaints}>
              <FaSync />
              Refresh
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="complaints-grid">
            {complaints.map((complaint, index) => {
              const status = getStatusConfig(complaint.status)
              const urgency = getUrgencyConfig(complaint.urgency)
              
              return (
                <div key={complaint.id || index} className="complaint-card">
                  {/* Status Indicator Bar (Top thin line) */}
                  <div className={`status-indicator-bar ${status.barClass}`}></div>
                  
                  {/* Urgency Indicator */}
                  <div className={`urgency-indicator ${urgency.indicatorClass}`}>
                    <FaCircle size={6} />
                    {urgency.label}
                  </div>

                  {/* Card Header */}
                  <div className="card-header">
                    <div className="category-chip">
                      <FaTag size={10} />
                      {complaint.category || 'General'}
                    </div>
                    <div className="posted-date">
                      <FaRegClock size={10} />
                      {formatDate(complaint.createdAt)}
                    </div>
                  </div>
                  
                  {/* Card Body */}
                  <div className="card-body">
                    <h3 className="card-title">
                      {complaint.title || 'Untitled Complaint'}
                    </h3>
                    
                    <p className="card-description">
                      {complaint.description || 'No description provided'}
                    </p>

                    {/* Stats Section */}
                    <div className="card-stats">
                      {complaint.likeCount > 0 && (
                        <div className="stat-item likes">
                          <FaHeart />
                          <span>{complaint.likeCount}</span>
                        </div>
                      )}
                      
                      {complaint.attachmentCount > 0 && (
                        <div className="stat-item attachments">
                          <FaPaperclip />
                          <span>{complaint.attachmentCount}</span>
                        </div>
                      )}
                      
                      <div className="stat-item id">
                        ID: #{complaint.id || 'N/A'}
                      </div>
                    </div>

                    {/* Assigned Section with Status */}
                    <div className="assigned-section">
                      <div className="assigned-content">
                        <div className="assigned-info">
                          <FaUserCheck size={14} />
                          <div>
                            <div className="assigned-label">Assigned To</div>
                            <div className="assigned-name">
                              {complaint.assignedEmployeeName || 'Not assigned yet'}
                            </div>
                          </div>
                        </div>
                        {/* Status pill */}
                        <span className={`status-pill ${status.pillClass}`}>
                          {status.label}
                        </span>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="card-footer">
                      <div className="footer-content">
                        <div className="updated-info">
                          <FaCalendar size={12} />
                          <span>Updated {formatDate(complaint.updatedAt)}</span>
                        </div>
                        
                        <Link 
                          to={`/complaints/${complaint.id}`}
                          className="view-details-btn"
                        >
                          <FaEye />
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Refresh Section */}
          {complaints.length > 0 && (
            <div className="refresh-section">
              <div className="refresh-card">
                <div className="refresh-text">
                  <h4>Showing {complaints.length} complaint{complaints.length !== 1 ? 's' : ''}</h4>
                  <p>Last updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <div className="refresh-actions">
                  <button 
                    className="btn"
                    onClick={fetchComplaints}
                    disabled={loading}
                  >
                    <FaSync className={loading ? 'spin' : ''} />
                    Refresh
                  </button>
                  <Link to="/submit" className="btn primary">
                    <FaPlus />
                    New Complaint
                  </Link>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default MyComplaints