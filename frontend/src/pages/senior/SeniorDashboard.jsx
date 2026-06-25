import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { dashboardAPI, complaintAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { 
  FaUsers, FaArrowUp, FaClock, FaCheckCircle,
  FaChartLine, FaSync, FaEye
} from 'react-icons/fa'

const SeniorDashboard = () => {
  const [stats, setStats] = useState(null)
  const [escalatedComplaints, setEscalatedComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { user } = useAuth()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError('')

      // Fetch dashboard stats and escalated complaints in parallel
      const [dashboardRes, escalatedRes] = await Promise.all([
        dashboardAPI.getSeniorDashboard(),
        complaintAPI.getEscalatedComplaints()
      ])

      // Check if dashboard response has error
      if (dashboardRes.error) {
        throw new Error(dashboardRes.error + ': ' + (dashboardRes.message || ''))
      }

      // Set dashboard stats
      setStats(dashboardRes)

      // Handle escalated complaints response
      if (escalatedRes && escalatedRes.success === true) {
        setEscalatedComplaints(escalatedRes.data || [])
      } else if (Array.isArray(escalatedRes)) {
        setEscalatedComplaints(escalatedRes)
      } else if (escalatedRes.data && Array.isArray(escalatedRes.data)) {
        setEscalatedComplaints(escalatedRes.data)
      } else {
        setEscalatedComplaints([])
      }

    } catch (err) {
      console.error('Dashboard error:', err)
      setError(err.message || 'Failed to load dashboard data. Please try again.')
      setStats(null)
      setEscalatedComplaints([])
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (e) {
      return 'Invalid date'
    }
  }

  const getStatusBadgeClass = (status) => {
    if (!status) return 'badge bg-secondary'
    
    switch(status.toUpperCase()) {
      case 'NEW': return 'badge bg-info';
      case 'UNDER_REVIEW': return 'badge bg-warning';
      case 'RESOLVED': return 'badge bg-success';
      default: return 'badge bg-secondary';
    }
  }

  const formatStatus = (status) => {
    if (!status) return 'Unknown'
    return status.replace('_', ' ')
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="ms-3 text-muted">Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-2 text-primary">Senior Employee Dashboard</h1>
          <p className="text-muted">
            Welcome back, <strong>{user?.fullName}</strong> 
            {user?.role && <span className="ms-2 badge bg-info">{user.role.replace('_', ' ')}</span>}
          </p>
        </div>
        <div>
          <button 
            className="btn btn-outline-primary me-2" 
            onClick={fetchDashboardData}
            disabled={loading}
          >
            <FaSync className={`me-2 ${loading ? 'fa-spin' : ''}`} /> 
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
          <Link to="/public-complaints" className="btn btn-primary">
            <FaEye className="me-2" /> View Public Complaints
          </Link>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <strong>Error:</strong> {error}
          <button type="button" className="btn-close" onClick={() => setError('')}></button>
        </div>
      )}

      {/* Stats Cards - Middle Section */}
      <div className="row justify-content-center mb-4">
        <div className="col-lg-8">
          <div className="row">
            <div className="col-xl-3 col-md-6 mb-4">
              <div className="card border-left-primary shadow h-100 py-2">
                <div className="card-body">
                  <div className="row no-gutters align-items-center">
                    <div className="col mr-2">
                      <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                        Total Assigned
                      </div>
                      <div className="h5 mb-0 font-weight-bold text-gray-800">
                        {stats?.totalComplaints || 0}
                      </div>
                    </div>
                    <div className="col-auto">
                      <FaUsers className="fa-2x text-gray-300" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xl-3 col-md-6 mb-4">
              <div className="card border-left-warning shadow h-100 py-2">
                <div className="card-body">
                  <div className="row no-gutters align-items-center">
                    <div className="col mr-2">
                      <div className="text-xs font-weight-bold text-warning text-uppercase mb-1">
                        Escalated to Me
                      </div>
                      <div className="h5 mb-0 font-weight-bold text-gray-800">
                        {escalatedComplaints.length}
                      </div>
                    </div>
                    <div className="col-auto">
                      <FaArrowUp className="fa-2x text-gray-300" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xl-3 col-md-6 mb-4">
              <div className="card border-left-info shadow h-100 py-2">
                <div className="card-body">
                  <div className="row no-gutters align-items-center">
                    <div className="col mr-2">
                      <div className="text-xs font-weight-bold text-info text-uppercase mb-1">
                        In Progress
                      </div>
                      <div className="h5 mb-0 font-weight-bold text-gray-800">
                        {stats?.inProgressComplaints || 0}
                      </div>
                    </div>
                    <div className="col-auto">
                      <FaClock className="fa-2x text-gray-300" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xl-3 col-md-6 mb-4">
              <div className="card border-left-success shadow h-100 py-2">
                <div className="card-body">
                  <div className="row no-gutters align-items-center">
                    <div className="col mr-2">
                      <div className="text-xs font-weight-bold text-success text-uppercase mb-1">
                        Resolved
                      </div>
                      <div className="h5 mb-0 font-weight-bold text-gray-800">
                        {stats?.resolvedComplaints || 0}
                      </div>
                    </div>
                    <div className="col-auto">
                      <FaCheckCircle className="fa-2x text-gray-300" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics - Centered in the middle */}
      <div className="row justify-content-center mb-4">
        <div className="col-lg-8">
          <div className="card shadow mb-4">
            <div className="card-header py-3">
              <h6 className="m-0 font-weight-bold text-primary">
                <FaChartLine className="me-2" />
                Performance Metrics
              </h6>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6 mb-3">
                  <div className="card bg-light">
                    <div className="card-body text-center">
                      <div className="h2 mb-0 text-info">
                        {stats?.averageResolutionTime ? 
                          `${stats.averageResolutionTime.toFixed(1)}h` : '0h'}
                      </div>
                      <small className="text-muted">Avg. Resolution Time</small>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 mb-3">
                  <div className="card bg-light">
                    <div className="card-body text-center">
                      <div className="h2 mb-0 text-warning">{stats?.complaintsPastDue || 0}</div>
                      <small className="text-muted">Past Due Complaints</small>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 mb-3">
                  <div className="card bg-light">
                    <div className="card-body text-center">
                      <div className="h2 mb-0 text-success">
                        {stats?.assignedToMe || 0}
                      </div>
                      <small className="text-muted">Assigned to Me</small>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 mb-3">
                  <div className="card bg-light">
                    <div className="card-body text-center">
                      <div className="h2 mb-0 text-danger">
                        {stats?.newComplaints || 0}
                      </div>
                      <small className="text-muted">New Complaints</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-4 text-center text-muted small">
        <p>Last updated: {new Date().toLocaleString()}</p>
        <p>Showing data for: Senior Employee Dashboard</p>
      </div>
    </div>
  )
}

export default SeniorDashboard