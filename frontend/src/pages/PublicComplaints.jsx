import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { complaintAPI, likeAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { FaHeart, FaRegHeart, FaEye, FaComment, FaPaperclip, FaUser, FaCalendar, FaFire, FaSyncAlt, FaInbox, FaExclamationTriangle, FaInfoCircle, FaArrowUp, FaFilter, FaSort } from 'react-icons/fa'
import './PublicComplaints.css';

const PublicComplaints = () => {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [liking, setLiking] = useState({})
  const [likeStatuses, setLikeStatuses] = useState({})
  const { isAuthenticated, user } = useAuth()
  const [filter, setFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')

  useEffect(() => {
    fetchComplaints()
  }, [filter, sortBy])

  useEffect(() => {
    if (complaints.length > 0) {
      fetchLikeStatuses()
    }
  }, [complaints])

  const fetchComplaints = async () => {
    try {
      setLoading(true)
      const response = await complaintAPI.getPublicComplaints()
      
      let data = Array.isArray(response) ? response : 
                (response && Array.isArray(response.data) ? response.data : [])
      
      // Apply filters
      if (filter !== 'all') {
        data = data.filter(complaint => complaint.status === filter)
      }
      
      // Apply sorting
      data.sort((a, b) => {
        switch(sortBy) {
          case 'newest':
            return new Date(b.createdAt) - new Date(a.createdAt)
          case 'oldest':
            return new Date(a.createdAt) - new Date(b.createdAt)
          case 'most-liked':
            return (b.likeCount || 0) - (a.likeCount || 0)
          case 'most-commented':
            return (b.commentCount || 0) - (a.commentCount || 0)
          default:
            return 0
        }
      })
      
      setComplaints(data)
    } catch (err) {
      console.error('❌ Fetch error:', err)
      setError('Failed to fetch complaints. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const fetchLikeStatuses = async () => {
    try {
      const statuses = {}
      for (const complaint of complaints) {
        try {
          if (isAuthenticated) {
            const data = await likeAPI.getLikeStatus(complaint.id)
            statuses[complaint.id] = data.hasLiked || false
          }
        } catch (err) {
          statuses[complaint.id] = false
        }
      }
      setLikeStatuses(statuses)
    } catch (err) {
      console.error('Failed to fetch like statuses:', err)
    }
  }

  const handleLike = async (complaintId) => {
    if (!isAuthenticated) {
      setError('Please login to like complaints')
      setTimeout(() => setError(''), 3000)
      return
    }

    setLiking(prev => ({ ...prev, [complaintId]: true }))
    
    try {
      const result = await likeAPI.toggleLike(complaintId)
      
      if (result.error) {
        setError(result.message || 'Failed to like complaint')
        setTimeout(() => setError(''), 3000)
      } else {
        setComplaints(prevComplaints => 
          prevComplaints.map(complaint => {
            if (complaint.id === complaintId) {
              return {
                ...complaint,
                likeCount: result.likeCount || 0
              }
            }
            return complaint
          })
        )
        
        setLikeStatuses(prev => ({
          ...prev,
          [complaintId]: result.liked || false
        }))
      }
    } catch (err) {
      console.error('Failed to toggle like:', err)
      setError('Failed to like complaint. Please try again.')
      setTimeout(() => setError(''), 3000)
    } finally {
      setLiking(prev => ({ ...prev, [complaintId]: false }))
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date'
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays/7)} weeks ago`
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      'NEW': { label: 'New', className: 'status-new', icon: '🆕' },
      'UNDER_REVIEW': { label: 'Under Review', className: 'status-review', icon: '🔍' },
      'RESOLVED': { label: 'Resolved', className: 'status-resolved', icon: '✅' },
    }
    
    return statusMap[status] || { label: status || 'Unknown', className: 'status-unknown', icon: '❓' }
  }

  const getUrgencyBadge = (urgency) => {
    const urgencyMap = {
      'HIGH': { className: 'urgency-high', icon: <FaFire /> },
      'MEDIUM': { className: 'urgency-medium', icon: '⚠️' },
      'LOW': { className: 'urgency-low', icon: '⏳' }
    }
    
    return urgencyMap[urgency] || { className: 'urgency-none', icon: '' }
  }

  if (loading) {
    return (
      <div className="public-complaints-container">
        <div className="loading-overlay">
          <div className="spinner-container">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <div className="loading-text mt-3">
              <h4>Loading Public Complaints</h4>
              <p className="text-muted">Fetching community issues...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="public-complaints-container">
      {/* Header Section */}
      <div className="complaints-header mb-5">
        <div className="row align-items-center">
          <div className="col-md-8">
            <h1 className="display-5 fw-bold mb-3">
              Community <span className="text-gradient">Complaints</span>
            </h1>
            <p className="lead text-muted mb-0">
              Voice concerns, support others, and track resolutions together
            </p>
          </div>
          <div className="col-md-4 text-md-end">
            <Link to="/submit" className="btn btn-primary btn-lg px-4">
              <FaArrowUp className="me-2" />
              Submit New Issue
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Card */}
      <div className="row mb-5">
        <div className="col-12">
          <div className="stats-card">
            <div className="row">
              <div className="col-md-3 col-6 mb-3 mb-md-0">
                <div className="stat-item">
                  <div className="stat-icon total">
                    <FaInbox />
                  </div>
                  <div className="stat-content">
                    <div className="stat-number">{complaints.length}</div>
                    <div className="stat-label">Total Issues</div>
                  </div>
                </div>
              </div>
              <div className="col-md-3 col-6 mb-3 mb-md-0">
                <div className="stat-item">
                  <div className="stat-icon resolved">
                    <FaInfoCircle />
                  </div>
                  <div className="stat-content">
                    <div className="stat-number">
                      {complaints.filter(c => c.status === 'RESOLVED').length}
                    </div>
                    <div className="stat-label">Resolved</div>
                  </div>
                </div>
              </div>
              <div className="col-md-3 col-6">
                <div className="stat-item">
                  <div className="stat-icon likes">
                    <FaHeart />
                  </div>
                  <div className="stat-content">
                    <div className="stat-number">
                      {complaints.reduce((sum, c) => sum + (c.likeCount || 0), 0)}
                    </div>
                    <div className="stat-label">Total Likes</div>
                  </div>
                </div>
              </div>
              <div className="col-md-3 col-6">
                <div className="stat-item">
                  <div className="stat-icon comments">
                    <FaComment />
                  </div>
                  <div className="stat-content">
                    <div className="stat-number">
                      {complaints.reduce((sum, c) => sum + (c.commentCount || 0), 0)}
                    </div>
                    <div className="stat-label">Comments</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Sort */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="filter-section">
            <label className="filter-label"><FaFilter className="me-2" />Filter by Status:</label>
            <div className="filter-buttons">
              {['all', 'NEW', 'UNDER_REVIEW', 'RESOLVED'].map(status => (
                <button
                  key={status}
                  className={`filter-btn ${filter === status ? 'active' : ''}`}
                  onClick={() => setFilter(status)}
                >
                  {status === 'all' ? 'All' : getStatusBadge(status).label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="sort-section">
            <label className="sort-label"><FaSort className="me-2" />Sort by:</label>
            <select 
              className="form-select sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="most-liked">Most Liked</option>
              <option value="most-commented">Most Commented</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="alert alert-danger alert-dismissible fade show animate__animated animate__shakeX" role="alert">
              <div className="d-flex align-items-center">
                <FaExclamationTriangle className="me-3 flex-shrink-0" />
                <div className="flex-grow-1">{error}</div>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setError('')}
                ></button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Complaints Grid */}
      {!loading && complaints.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <FaInbox />
          </div>
          <h3>No complaints found</h3>
          <p className="text-muted mb-4">
            {filter === 'all' 
              ? 'Be the first to submit a public complaint!' 
              : `No ${filter.toLowerCase().replace('_', ' ')} complaints found`}
          </p>
          <div className="d-flex gap-3 justify-content-center flex-wrap">
            <Link to="/submit" className="btn btn-primary">
              <FaArrowUp className="me-2" />
              Submit Complaint
            </Link>
            <button 
              className="btn btn-outline-primary"
              onClick={fetchComplaints}
            >
              <FaSyncAlt className="me-2" />
              Refresh
            </button>
          </div>
        </div>
      ) : (
        <div className="row">
          {complaints.map(complaint => {
            const hasLiked = likeStatuses[complaint.id] || false
            const isLiking = liking[complaint.id] || false
            const status = getStatusBadge(complaint.status)
            const urgency = getUrgencyBadge(complaint.urgency)
            
            return (
              <div key={complaint.id} className="col-xl-4 col-lg-6 mb-4">
                <div className="complaint-card">
                  {/* Card Header */}
                  <div className="card-header">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <span className={`status-badge ${status.className}`}>
                          {status.icon} {status.label}
                        </span>
                        {urgency.icon && (
                          <span className={`urgency-badge ${urgency.className}`}>
                            {urgency.icon} {complaint.urgency}
                          </span>
                        )}
                      </div>
                      <div className="complaint-meta">
                        <FaCalendar className="me-1" />
                        <small>{formatDate(complaint.createdAt)}</small>
                      </div>
                    </div>
                    
                    <div className="category-badge">
                      {complaint.category || 'General'}
                    </div>
                  </div>

                  {/* Card Body - Title Section */}
                  <div className="card-body">
                    <h3 className="complaint-title">
                      {complaint.title || 'Untitled Complaint'}
                    </h3>
                    
                    {complaint.anonymous ? (
                      <div className="user-info-section">
                        <div className="anonymous-tag">
                          <FaUser className="me-2" />
                          Anonymous Submission
                        </div>
                      </div>
                    ) : complaint.userFullName && (
                      <div className="user-info-section">
                        <div className="user-info">
                          <FaUser className="me-2" />
                          Submitted by: {complaint.userFullName}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Footer */}
                  <div className="card-footer">
                    <div className="footer-content">
                      <div className="engagement-stats">
                        <button
                          className={`like-btn ${hasLiked ? 'liked' : ''}`}
                          onClick={() => handleLike(complaint.id)}
                          disabled={isLiking}
                          title={isAuthenticated 
                            ? (hasLiked ? "Click to unlike" : "Click to like") 
                            : "Login to like"}
                        >
                          {isLiking ? (
                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          ) : hasLiked ? (
                            <FaHeart className="me-2" />
                          ) : (
                            <FaRegHeart className="me-2" />
                          )}
                          <span className="like-count">{complaint.likeCount || 0}</span>
                        </button>
                        
                        <div className="comment-stat">
                          <FaComment className="me-2" />
                          <span>{complaint.commentCount || 0}</span>
                        </div>
                        
                        {complaint.attachmentCount > 0 && (
                          <div className="attachment-stat">
                            <FaPaperclip className="me-2" />
                            <span>{complaint.attachmentCount}</span>
                          </div>
                        )}
                      </div>
                      
                      <Link 
                        to={`/complaints/${complaint.id}`}
                        className="view-details-btn"
                      >
                        <FaEye className="me-2" />
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Refresh Section */}
      {complaints.length > 0 && (
        <div className="row mt-5">
          <div className="col-12">
            <div className="refresh-section text-center">
              <div className="refresh-card">
                <h5 className="mb-3">
                  Showing <span className="text-primary">{complaints.length}</span> complaint{complaints.length !== 1 ? 's' : ''}
                  {filter !== 'all' && (
                    <span className="text-muted"> • Filtered by: {filter.toLowerCase().replace('_', ' ')}</span>
                  )}
                </h5>
                <div className="d-flex gap-3 justify-content-center flex-wrap">
                  <button 
                    className="btn btn-gradient"
                    onClick={fetchComplaints}
                    disabled={loading}
                  >
                    <FaSyncAlt className={`me-2 ${loading ? 'spin' : ''}`} />
                    {loading ? 'Refreshing...' : 'Refresh Complaints'}
                  </button>
                  <Link to="/submit" className="btn btn-outline-primary">
                    <FaArrowUp className="me-2" />
                    Submit New Complaint
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PublicComplaints