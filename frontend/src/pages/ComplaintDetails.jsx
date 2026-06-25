import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { complaintAPI, commentAPI, likeAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

// Import components
import InternalNotes from '../components/InternalNotes'
import EscalateComplaint from '../components/EscalateComplaint'
import AttachmentDisplay from '../components/AttachmentDisplay'

// Import icons
import {
  FaArrowLeft,
  FaExclamationTriangle,
  FaCalendar,
  FaClock,
  FaTag,
  FaEye,
  FaHeart,
  FaComment,
  FaInfoCircle,
  FaSpinner,
  FaUser,
  FaUserCheck,
  FaGlobe,
  FaUserSecret,
  FaPaperPlane,
  FaSignInAlt,
  FaCheckCircle,
  FaUserPlus,
  FaCog,
  FaComments,
  FaChartLine,
  FaHistory,
  FaCopy,
  FaPrint,
  FaArrowUp,
  FaFileAlt
} from 'react-icons/fa'

// Import CSS
import './ComplaintDetails.css'

const ComplaintDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  
  const [complaint, setComplaint] = useState(null)
  const [timeline, setTimeline] = useState([])
  const [comments, setComments] = useState([])
  const [likeCount, setLikeCount] = useState(0)
  const [hasLiked, setHasLiked] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [likeLoading, setLikeLoading] = useState(false)
  const [commentLoading, setCommentLoading] = useState(false)
  const [error, setError] = useState('')
  const [copySuccess, setCopySuccess] = useState('')
  const [activeTab, setActiveTab] = useState('details')

  useEffect(() => {
    fetchComplaintDetails()
  }, [id])

  const fetchComplaintDetails = async () => {
    try {
      setLoading(true)
      setError('')
      
      // Fetch complaint details
      const complaintRes = await complaintAPI.getComplaintById(id)
      const complaintData = complaintRes.data || complaintRes
      setComplaint(complaintData)
      
      // Set like count from complaint data
      if (complaintData.likeCount !== undefined) {
        setLikeCount(complaintData.likeCount)
      } else if (complaintData.likesCount !== undefined) {
        setLikeCount(complaintData.likesCount)
      }
      
      // Fetch comments
      const commentsRes = await commentAPI.getComments(id)
      setComments(commentsRes.data || commentsRes || [])
      
      // Check if user has liked this complaint (only if authenticated)
      if (isAuthenticated) {
        await fetchLikeStatus()
      } else {
        setHasLiked(false)
      }
      
    } catch (err) {
      console.error('Failed to fetch complaint details:', err)
      setError('Failed to load complaint details. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const fetchLikeStatus = async () => {
    try {
      const data = await likeAPI.getLikeStatus(id)
      setHasLiked(data.hasLiked || false)
      if (data.likeCount !== undefined) {
        setLikeCount(data.likeCount)
      }
    } catch (err) {
      console.error('Failed to fetch like status:', err)
      setHasLiked(false)
    }
  }

  const handleLikeToggle = async () => {
    if (!isAuthenticated) {
      alert('Please login to like complaints')
      navigate('/login')
      return
    }

    setLikeLoading(true)
    try {
      const result = await likeAPI.toggleLike(id)
      
      if (result.error) {
        alert(result.message || 'Failed to like complaint')
      } else {
        setLikeCount(result.likeCount || 0)
        setHasLiked(result.liked || false)
        
        setComplaint(prev => ({
          ...prev,
          likeCount: result.likeCount || 0
        }))
      }
    } catch (err) {
      console.error('Failed to toggle like:', err)
      alert('Failed to like complaint. Please try again.')
    } finally {
      setLikeLoading(false)
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      alert('Please enter a comment')
      return
    }
    
    if (!isAuthenticated) {
      alert('Please login to add comments')
      navigate('/login')
      return
    }
    
    setCommentLoading(true)
    try {
      const response = await commentAPI.addComment(id, newComment)
      
      setComments(prev => [...prev, response.data || response])
      setNewComment('')
      
      setComplaint(prev => ({
        ...prev,
        commentCount: (prev.commentCount || 0) + 1
      }))
      
      alert('Comment added successfully!')
    } catch (err) {
      console.error('Failed to add comment:', err)
      alert('Failed to add comment. Please try again.')
    } finally {
      setCommentLoading(false)
    }
  }

  const handleCopyLink = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url)
      .then(() => {
        setCopySuccess('Link copied to clipboard!')
        setTimeout(() => setCopySuccess(''), 3000)
      })
      .catch(err => {
        console.error('Failed to copy link:', err)
        setCopySuccess('Failed to copy link')
      })
  }

  const handlePrint = () => {
    window.print()
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date'
    
    try {
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (error) {
      return 'Invalid date'
    }
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'NEW':
        return 'badge-status-new'
      case 'UNDER_REVIEW':
        return 'badge-status-review'
      case 'RESOLVED':
        return 'badge-status-resolved'
      default:
        return 'badge-status-default'
    }
  }

  const getUrgencyBadgeClass = (urgency) => {
    switch (urgency) {
      case 'HIGH':
        return 'badge-urgency-high'
      case 'MEDIUM':
        return 'badge-urgency-medium'
      case 'NORMAL':
        return 'badge-urgency-normal'
      default:
        return 'badge-urgency-default'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'NEW':
        return 'New'
      case 'UNDER_REVIEW':
        return 'Under Review'
      case 'RESOLVED':
        return 'Resolved'
      default:
        return status || 'Unknown'
    }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner-large"></div>
        <p className="loading-text">Loading complaint details...</p>
      </div>
    )
  }

  if (!complaint) {
    return (
      <div className="container error-container">
        <div className="error-card">
          <div className="error-icon">
            <FaExclamationTriangle />
          </div>
          <div className="error-content">
            <h2>Complaint not found</h2>
            <p>The complaint you're looking for doesn't exist or you don't have permission to view it.</p>
            <button 
              className="btn-back"
              onClick={() => navigate(-1)}
            >
              <FaArrowLeft />
              Go Back
            </button>
          </div>
        </div>
      </div>
    )
  }

  const isOwner = user && complaint.userId && user.id === complaint.userId
  const canComment = isAuthenticated && (isOwner || complaint.isPublic || user?.role === 'EMPLOYEE' || user?.role === 'ADMIN' || user?.role === 'SENIOR_EMPLOYEE')

  return (
    <div className="complaint-details-container">
      {/* Navigation Header */}
      <div className="navigation-header">
        <button 
          className="btn-navigation"
          onClick={() => navigate(-1)}
        >
          <FaArrowLeft />
          <span>Back to Complaints</span>
        </button>
        
        <div className="header-actions">
          <button 
            className="btn-action-secondary"
            onClick={handleCopyLink}
            title="Copy link to complaint"
          >
            <FaCopy />
            <span>Copy Link</span>
          </button>
          <button 
            className="btn-action-secondary"
            onClick={handlePrint}
            title="Print complaint details"
          >
            <FaPrint />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert-error">
          <div className="alert-content">
            <FaExclamationTriangle />
            <div className="alert-message">{error}</div>
          </div>
          <button className="alert-close" onClick={() => setError('')}>×</button>
        </div>
      )}

      {/* Copy Success Alert */}
      {copySuccess && (
        <div className="alert-success">
          <div className="alert-content">
            <FaCheckCircle />
            <div className="alert-message">{copySuccess}</div>
          </div>
          <button className="alert-close" onClick={() => setCopySuccess('')}>×</button>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="main-content-grid">
        {/* Left Column - Main Content */}
        <div className="main-content-column">
          {/* Complaint Header Card */}
          <div className="content-card complaint-header-card">
            <div className="card-header-enhanced">
              <div className="complaint-title-section">
                <div className="complaint-meta">
                  <span className="complaint-id">ID: #{complaint.id}</span>
                  <span className="complaint-date">
                    <FaCalendar />
                    {formatDate(complaint.createdAt)}
                  </span>
                </div>
                <h1 className="complaint-title">{complaint.title}</h1>
                <div className={`status-badge ${getStatusBadgeClass(complaint.status)}`}>
                  {getStatusText(complaint.status)}
                </div>
              </div>
            </div>

            <div className="card-body-enhanced">
              {/* Tags and Categories */}
              <div className="tags-container">
                <div className="tag-category">
                  <FaTag />
                  <span>{complaint.category || 'Uncategorized'}</span>
                </div>
                <div className={`urgency-badge ${getUrgencyBadgeClass(complaint.urgency)}`}>
                  <FaClock />
                  <span>{complaint.urgency || 'NORMAL'}</span>
                </div>
                {complaint.anonymous && (
                  <div className="tag-anonymous">
                    <FaUserSecret />
                    <span>Anonymous</span>
                  </div>
                )}
                {complaint.isPublic && (
                  <div className="tag-public">
                    <FaGlobe />
                    <span>Public</span>
                  </div>
                )}
              </div>

              {/* Description Section */}
              <div className="description-section">
                <div className="section-title">
                  <FaFileAlt />
                  <h3>Description</h3>
                </div>
                <div className="description-content">
                  {complaint.description}
                </div>
              </div>

              {/* User Information Grid */}
              <div className="user-info-grid">
                {!complaint.anonymous && complaint.userFullName && (
                  <div className="user-info-item">
                    <div className="user-avatar user-avatar-primary">
                      <FaUser />
                    </div>
                    <div className="user-details">
                      <h5>Submitted by</h5>
                      <p className="user-name">{complaint.userFullName}</p>
                      {complaint.userEmail && (
                        <p className="user-email">{complaint.userEmail}</p>
                      )}
                    </div>
                  </div>
                )}
                
                {complaint.assignedEmployeeName && (
                  <div className="user-info-item">
                    <div className="user-avatar user-avatar-warning">
                      <FaUserCheck />
                    </div>
                    <div className="user-details">
                      <h5>Assigned to</h5>
                      <p className="user-name">{complaint.assignedEmployeeName}</p>
                      {complaint.assignedEmployeeId && (
                        <p className="user-id">Employee ID: {complaint.assignedEmployeeId}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Escalation Info */}
              {complaint.escalatedToName && (
                <div className="escalation-notice">
                  <div className="escalation-header">
                    <FaArrowUp />
                    <h4>Escalated Complaint</h4>
                  </div>
                  <div className="escalation-content">
                    <div className="escalation-details">
                      <div className="detail-item">
                        <strong>Escalated to:</strong>
                        <span>{complaint.escalatedToName}</span>
                      </div>
                      <div className="detail-item">
                        <strong>Date:</strong>
                        <span>{formatDate(complaint.escalationDate)}</span>
                      </div>
                      {complaint.escalationReason && (
                        <div className="detail-item full-width">
                          <strong>Reason:</strong>
                          <p>{complaint.escalationReason}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Attachments Section */}
          <div className="content-card">
            <div className="card-header-enhanced">
              <div className="section-title">
                <FaFileAlt />
                <h3>Attachments</h3>
              </div>
            </div>
            <div className="card-body-enhanced">
              <AttachmentDisplay complaintId={id} />
            </div>
          </div>

          {/* Comments Section */}
          <div className="content-card comments-section">
            <div className="card-header-enhanced">
              <div className="section-title">
                <FaComment />
                <h3>Comments ({complaint.commentCount || comments.length || 0})</h3>
              </div>
            </div>
            
            <div className="card-body-enhanced">
              {/* Add Comment Form */}
              {canComment && (
                <div className="comment-form-container">
                  <div className="comment-form-header">
                    <FaInfoCircle />
                    <span>Add your comment{complaint.anonymous && ' • This complaint was submitted anonymously'}</span>
                  </div>
                  
                  <div className="form-group">
                    <textarea
                      className="form-control comment-textarea"
                      rows="4"
                      placeholder="Type your comment here..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      disabled={commentLoading}
                      maxLength={1000}
                    />
                    <div className="form-footer">
                      <div className="character-count">
                        {newComment.length}/1000 characters
                      </div>
                      <button
                        className="btn-primary btn-comment"
                        onClick={handleAddComment}
                        disabled={commentLoading || !newComment.trim()}
                      >
                        {commentLoading ? (
                          <>
                            <FaSpinner className="spinner-icon" />
                            <span>Posting...</span>
                          </>
                        ) : (
                          <>
                            <FaPaperPlane />
                            <span>Post Comment</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Comments List */}
              <div className="comments-container">
                {comments.length === 0 ? (
                  <div className="no-comments">
                    <FaComment />
                    <h4>No comments yet</h4>
                    {!canComment && isAuthenticated && (
                      <div className="comment-restriction">
                        <FaInfoCircle />
                        <span>You cannot comment on this complaint</span>
                      </div>
                    )}
                    {!isAuthenticated && (
                      <button 
                        className="btn-secondary"
                        onClick={() => navigate('/login')}
                      >
                        <FaSignInAlt />
                        <span>Login to comment</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="comments-list">
                    {comments.map(comment => (
                      <div key={comment.id || Math.random()} className="comment-item">
                        <div className="comment-header">
                          <div className="comment-author">
                            <div className="comment-avatar">
                              <FaUser />
                            </div>
                            <div className="comment-meta">
                              <h6>{comment.user?.fullName || 'Unknown User'}</h6>
                              {comment.user?.role && (
                                <small>{comment.user.role}</small>
                              )}
                            </div>
                          </div>
                          <div className="comment-time">
                            <FaClock />
                            <span>{formatDate(comment.createdAt)}</span>
                          </div>
                        </div>
                        <div className="comment-content">
                          {comment.comment}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="sidebar-column">
          {/* Like Section */}
          {complaint.isPublic && (
            <div className="content-card like-card">
              <div className="like-section">
                <div className="like-icon">
                  <FaHeart />
                </div>
                <div className="like-count-display">{likeCount}</div>
                <p className="like-label">People showing support</p>
                <button
                  className={`btn-like ${hasLiked ? 'liked' : ''}`}
                  onClick={handleLikeToggle}
                  disabled={likeLoading}
                >
                  {likeLoading ? (
                    <>
                      <FaSpinner className="spinner-icon" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <FaHeart />
                      <span>{hasLiked ? 'Remove Like' : 'Like Complaint'}</span>
                    </>
                  )}
                </button>
                
                {!isAuthenticated && (
                  <button 
                    className="btn-secondary btn-login-like"
                    onClick={() => navigate('/login')}
                  >
                    <FaSignInAlt />
                    <span>Login to Show Support</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Stats Card */}
          <div className="content-card stats-card">
            <div className="card-header-enhanced">
              <div className="section-title">
                <FaChartLine />
                <h3>Statistics</h3>
              </div>
            </div>
            <div className="card-body-enhanced">
              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-number stat-number-likes">{likeCount}</div>
                  <div className="stat-label">Likes</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number stat-number-comments">
                    {complaint.commentCount || comments.length || 0}
                  </div>
                  <div className="stat-label">Comments</div>
                </div>
              </div>
              
              <div className="info-list">
                <div className="info-item">
                  <FaCalendar />
                  <div className="info-content">
                    <div className="info-label">Created</div>
                    <div className="info-value">{formatDate(complaint.createdAt)}</div>
                  </div>
                </div>
                
                <div className="info-item">
                  <FaClock />
                  <div className="info-content">
                    <div className="info-label">Last Updated</div>
                    <div className="info-value">{formatDate(complaint.updatedAt)}</div>
                  </div>
                </div>
                
                <div className="info-item">
                  <FaTag />
                  <div className="info-content">
                    <div className="info-label">Category</div>
                    <div className="info-value">{complaint.category || 'Not specified'}</div>
                  </div>
                </div>
                
                <div className="info-item">
                  <FaEye />
                  <div className="info-content">
                    <div className="info-label">Visibility</div>
                    <div className="info-value">{complaint.isPublic ? 'Public' : 'Private'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Internal Notes */}
          {(user?.role === 'ADMIN' || user?.role === 'SENIOR_EMPLOYEE' || user?.role === 'EMPLOYEE') && (
            <div className="content-card">
              <div className="card-header-enhanced">
                <div className="section-title">
                  <FaComments />
                  <h3>Internal Notes</h3>
                </div>
              </div>
              <div className="card-body-enhanced">
                <InternalNotes complaintId={id} />
              </div>
            </div>
          )}

          {/* Quick Actions */}
          {(user?.role === 'EMPLOYEE' || user?.role === 'ADMIN' || user?.role === 'SENIOR_EMPLOYEE') && (
            <div className="content-card quick-actions-card">
              <div className="card-header-enhanced">
                <div className="section-title">
                  <FaCog />
                  <h3>Quick Actions</h3>
                </div>
              </div>
              <div className="card-body-enhanced">
                <div className="quick-actions">
                  {/* Admin-specific actions */}
                  {user?.role === 'ADMIN' && (
                    <button 
                      className="quick-action-btn"
                      onClick={() => alert('Assign to Employee feature coming soon!')}
                    >
                      <FaUserPlus />
                      <span>Assign to Employee</span>
                    </button>
                  )}
                  
                  {/* Internal Notes Button */}
                  {(user?.role === 'EMPLOYEE' || user?.role === 'ADMIN' || user?.role === 'SENIOR_EMPLOYEE') && (
                    <button 
                      className="quick-action-btn"
                      onClick={() => document.querySelector('.internal-notes-section')?.scrollIntoView({ behavior: 'smooth' })}
                    >
                      <FaComments />
                      <span>View Internal Notes</span>
                    </button>
                  )}
                  
                  {/* Escalation Control for Admin */}
                  {user?.role === 'ADMIN' && complaint?.status === 'UNDER_REVIEW' && !complaint.escalatedToName && (
                    <button 
                      className="quick-action-btn btn-escalate"
                      onClick={() => document.querySelector('.escalation-section')?.scrollIntoView({ behavior: 'smooth' })}
                    >
                      <FaArrowUp />
                      <span>Escalate Complaint</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Escalation Section (Admin only) */}
          {user?.role === 'ADMIN' && complaint?.status === 'UNDER_REVIEW' && (
            <div className="content-card escalation-card" id="escalation-section">
              <div className="card-header-enhanced header-danger">
                <div className="section-title">
                  <FaArrowUp />
                  <h3>Escalation Control</h3>
                </div>
              </div>
              <div className="card-body-enhanced">
                {complaint?.escalatedToName ? (
                  <div className="escalation-status">
                    <div className="escalation-info">
                      <strong>Already escalated to:</strong>
                      <p className="escalated-person">{complaint.escalatedToName}</p>
                      {complaint.escalationReason && (
                        <>
                          <strong>Reason:</strong>
                          <p className="escalation-reason">{complaint.escalationReason}</p>
                        </>
                      )}
                      <small className="escalation-date">
                        Escalated on: {formatDate(complaint.escalationDate)}
                      </small>
                    </div>
                  </div>
                ) : (
                  <EscalateComplaint 
                    complaintId={id} 
                    onEscalated={() => fetchComplaintDetails()}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ComplaintDetails