import { useState, useEffect } from 'react'
import { adminAPI } from '../../services/api'
import { Link } from 'react-router-dom'

const ManageComplaints = () => {
  const [complaints, setComplaints] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState({})
  const [selectedComplaint, setSelectedComplaint] = useState(null)
  const [assignEmployeeId, setAssignEmployeeId] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError('')
      
      const [complaintsRes, employeesRes] = await Promise.all([
        adminAPI.getAllComplaints(),
        adminAPI.getEmployees()
      ])
      
      const complaintsData = complaintsRes?.data || complaintsRes || []
      const employeesData = employeesRes?.data || employeesRes || []
      
      setComplaints(Array.isArray(complaintsData) ? complaintsData : [])
      setEmployees(Array.isArray(employeesData) ? employeesData : [])
      
    } catch (err) {
      console.error('Failed to fetch data:', err)
      setError('Failed to load data. Please try again.')
      setComplaints([])
      setEmployees([])
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (complaintId, newStatus) => {
    setUpdating(prev => ({ ...prev, [complaintId]: true }))
    
    try {
      const updateData = {
        status: newStatus
      }
      
      console.log('Update data:', updateData)
      
      await adminAPI.updateComplaintStatus(complaintId, updateData)
      
      await fetchData()
      
      setSelectedComplaint(null)
      setAssignEmployeeId('')
      
      alert(`Complaint status updated to ${newStatus} successfully!`)
    } catch (err) {
      console.error('Failed to update complaint:', err)
      alert(`Failed to update complaint. ${err.response?.data?.message || 'Please try again.'}`)
    } finally {
      setUpdating(prev => ({ ...prev, [complaintId]: false }))
    }
  }

  const handleAssignEmployee = async (complaintId) => {
    if (!assignEmployeeId) {
      alert('Please select an employee first')
      return
    }
    
    setUpdating(prev => ({ ...prev, [complaintId]: true }))
    
    try {
      const updateData = {
        assignEmployeeId: assignEmployeeId
      }
      
      await adminAPI.updateComplaintStatus(complaintId, updateData)
      
      await fetchData()
      
      setSelectedComplaint(null)
      setAssignEmployeeId('')
      
      alert('Employee assigned successfully!')
    } catch (err) {
      console.error('Failed to assign employee:', err)
      alert(`Failed to assign employee. ${err.response?.data?.message || 'Please try again.'}`)
    } finally {
      setUpdating(prev => ({ ...prev, [complaintId]: false }))
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch (error) {
      return 'Invalid date'
    }
  }

  const statusOptions = ['NEW', 'UNDER_REVIEW', 'RESOLVED']

  const getStatusBadgeClass = (status) => {
    if (!status) return 'bg-secondary'
    
    switch(status) {
      case 'NEW': return 'bg-info';
      case 'UNDER_REVIEW': return 'bg-warning';
      case 'RESOLVED': return 'bg-success';
      default: return 'bg-secondary';
    }
  }

  const getUrgencyBadgeClass = (urgency) => {
    if (!urgency) return 'bg-secondary'
    
    switch(urgency) {
      case 'HIGH': return 'bg-danger';
      case 'MEDIUM': return 'bg-warning';
      case 'NORMAL': return 'bg-info';
      default: return 'bg-secondary';
    }
  }

  if (loading) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center" style={{ height: '60vh' }}>
        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Loading complaints data...</p>
      </div>
    )
  }

  return (
    <div className="container-fluid px-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Manage Complaints</h2>
          <p className="text-muted mb-0">Admin panel for managing all system complaints</p>
        </div>
        <div className="d-flex gap-2">
          <button 
            className="btn btn-outline-primary"
            onClick={fetchData}
            disabled={loading}
          >
            <i className="bi bi-arrow-clockwise me-2"></i>
            Refresh
          </button>
          <Link to="/admin/dashboard" className="btn btn-outline-secondary">
            <i className="bi bi-arrow-left me-2"></i>
            Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Stats Overview with Logos on Right */}
      <div className="row mb-4">
        {/* Total Complaints Card */}
        <div className="col-md-3 mb-3">
          <div className="card stat-card border-start border-primary border-4 h-100 hover-lift">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title text-muted mb-2">Total Complaints</h6>
                  <h2 className="fw-bold mb-0">{complaints.length}</h2>
                  <small className="text-muted">All system complaints</small>
                </div>
                <div className="stat-icon bg-primary bg-opacity-10 text-primary p-3 rounded-circle">
                  <i className="bi bi-list-check fs-3"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Assigned Complaints Card */}
        <div className="col-md-3 mb-3">
          <div className="card stat-card border-start border-success border-4 h-100 hover-lift">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title text-muted mb-2">Assigned</h6>
                  <h2 className="fw-bold mb-0">{complaints.filter(c => c.assignedEmployeeId).length}</h2>
                  <small className="text-muted">With assigned employees</small>
                </div>
                <div className="stat-icon bg-success bg-opacity-10 text-success p-3 rounded-circle">
                  <i className="bi bi-person-check fs-3"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Non-Anonymous Card */}
        <div className="col-md-3 mb-3">
          <div className="card stat-card border-start border-info border-4 h-100 hover-lift">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title text-muted mb-2">Non-Anonymous</h6>
                  <h2 className="fw-bold mb-0">{complaints.filter(c => !c.anonymous).length}</h2>
                  <small className="text-muted">Visible user complaints</small>
                </div>
                <div className="stat-icon bg-info bg-opacity-10 text-info p-3 rounded-circle">
                  <i className="bi bi-person fs-3"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Employees Card */}
        <div className="col-md-3 mb-3">
          <div className="card stat-card border-start border-warning border-4 h-100 hover-lift">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title text-muted mb-2">Employees</h6>
                  <h2 className="fw-bold mb-0">{employees.length}</h2>
                  <small className="text-muted">Total system employees</small>
                </div>
                <div className="stat-icon bg-warning bg-opacity-10 text-warning p-3 rounded-circle">
                  <i className="bi bi-people fs-3"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Management Panel */}
      {selectedComplaint && (
        <div className="card shadow-lg mb-4 border-primary">
          <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center py-3">
            <div className="d-flex align-items-center">
              <i className="bi bi-gear me-3 fs-4"></i>
              <div>
                <h5 className="mb-0 fw-bold">Manage Complaint #{selectedComplaint.id}</h5>
                <small>{selectedComplaint.title}</small>
              </div>
            </div>
            <button 
              className="btn btn-sm btn-light"
              onClick={() => {
                setSelectedComplaint(null)
                setAssignEmployeeId('')
              }}
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
          
          <div className="card-body">
            <div className="row g-4">
              {/* Status Management */}
              <div className="col-lg-6">
                <div className="card h-100 border">
                  <div className="card-header bg-light">
                    <h6 className="mb-0 fw-bold">
                      <i className="bi bi-flag me-2"></i>
                      Status Management
                    </h6>
                  </div>
                  <div className="card-body">
                    <div className="mb-4">
                      <label className="form-label fw-semibold">Current Status:</label>
                      <div>
                        <span className={`badge ${getStatusBadgeClass(selectedComplaint.status)} fs-6 px-3 py-2`}>
                          {selectedComplaint.status || 'UNKNOWN'}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="form-label fw-semibold mb-3">Update Status:</label>
                      <div className="d-flex flex-wrap gap-2">
                        {statusOptions.map(status => (
                          <button
                            key={status}
                            className={`btn ${
                              selectedComplaint.status === status 
                                ? 'btn-primary' 
                                : 'btn-outline-primary'
                            } flex-fill hover-scale`}
                            onClick={() => {
                              if (window.confirm(`Change status to ${status}?`)) {
                                handleStatusUpdate(selectedComplaint.id, status)
                              }
                            }}
                            disabled={updating[selectedComplaint.id]}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Employee Assignment */}
              <div className="col-lg-6">
                <div className="card h-100 border">
                  <div className="card-header bg-light">
                    <h6 className="mb-0 fw-bold">
                      <i className="bi bi-person-badge me-2"></i>
                      Employee Assignment
                    </h6>
                  </div>
                  <div className="card-body">
                    <div className="mb-4">
                      <label className="form-label fw-semibold">Currently Assigned:</label>
                      <div>
                        {selectedComplaint.assignedEmployeeName 
                          ? <span className="badge bg-success fs-6 px-3 py-2">{selectedComplaint.assignedEmployeeName}</span>
                          : <span className="badge bg-secondary fs-6 px-3 py-2">Unassigned</span>
                        }
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <label className="form-label fw-semibold">Assign to Employee:</label>
                      <select
                        className="form-select hover-scale"
                        value={assignEmployeeId}
                        onChange={(e) => setAssignEmployeeId(e.target.value)}
                      >
                        <option value="">-- Select Employee --</option>
                        {employees.length > 0 ? (
                          employees.map(employee => (
                            <option key={employee.id} value={employee.id}>
                              {employee.fullName} ({employee.email})
                            </option>
                          ))
                        ) : (
                          <option value="" disabled>No employees available</option>
                        )}
                      </select>
                    </div>
                    
                    <div className="d-grid">
                      <button
                        className="btn btn-success hover-scale"
                        onClick={() => handleAssignEmployee(selectedComplaint.id)}
                        disabled={!assignEmployeeId || updating[selectedComplaint.id]}
                      >
                        {updating[selectedComplaint.id] ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Assigning...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-person-check me-2"></i>
                            Assign Selected Employee
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Complaints Table */}
      <div className="card shadow hover-lift">
        <div className="card-header bg-white border-bottom">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h5 className="mb-0 fw-bold">All Complaints</h5>
              <small className="text-muted">Total: {complaints.length} complaints</small>
            </div>
            <div className="d-flex gap-2">
              <span className="badge bg-info">
                NEW: {complaints.filter(c => c.status === 'NEW').length}
              </span>
              <span className="badge bg-warning">
                REVIEW: {complaints.filter(c => c.status === 'UNDER_REVIEW').length}
              </span>
              <span className="badge bg-success">
                RESOLVED: {complaints.filter(c => c.status === 'RESOLVED').length}
              </span>
            </div>
          </div>
        </div>
        
        <div className="card-body p-0">
          {complaints.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-inbox display-1 text-muted mb-3"></i>
              <h4>No complaints found</h4>
              <p className="text-muted mb-4">
                There are no complaints in the system yet
              </p>
              <button 
                className="btn btn-primary hover-scale"
                onClick={fetchData}
              >
                <i className="bi bi-arrow-clockwise me-2"></i>
                Refresh
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th width="60">ID</th>
                    <th>Complaint</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Urgency</th>
                    <th>Submitted By</th>
                    <th>Assigned To</th>
                    <th>Created</th>
                    <th width="140">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.map(complaint => (
                    <tr key={complaint.id} className="align-middle hover-row">
                      <td>
                        <span className="badge bg-secondary">#{complaint.id}</span>
                      </td>
                      <td>
                        <div className="fw-semibold">{complaint.title}</div>
                        <small className="text-muted d-block" style={{ maxWidth: '200px' }}>
                          {complaint.description?.substring(0, 80)}...
                        </small>
                      </td>
                      <td>
                        <span className="badge bg-secondary">
                          {complaint.category || 'General'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(complaint.status)}`}>
                          {complaint.status || 'UNKNOWN'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${getUrgencyBadgeClass(complaint.urgency)}`}>
                          {complaint.urgency || 'NORMAL'}
                        </span>
                      </td>
                      <td>
                        {complaint.anonymous 
                          ? <span className="badge bg-dark">Anonymous</span>
                          : complaint.userFullName 
                            ? <div className="text-primary fw-semibold">{complaint.userFullName}</div>
                            : <span className="text-muted">N/A</span>
                        }
                      </td>
                      <td>
                        {complaint.assignedEmployeeName 
                          ? <div className="text-success fw-semibold">{complaint.assignedEmployeeName}</div>
                          : <span className="text-muted">Unassigned</span>
                        }
                      </td>
                      <td>
                        <small className="text-muted">
                          {formatDate(complaint.createdAt)}
                        </small>
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          <button
                            className="btn btn-sm btn-primary hover-scale"
                            onClick={() => {
                              setSelectedComplaint(complaint)
                              setAssignEmployeeId(complaint.assignedEmployeeId || '')
                            }}
                            title="Manage"
                          >
                            <i className="bi bi-gear"></i>
                          </button>
                          <Link
                            to={`/complaints/${complaint.id}`}
                            className="btn btn-sm btn-outline-secondary hover-scale"
                            title="View"
                          >
                            <i className="bi bi-eye"></i>
                          </Link>
                          <button
                            className="btn btn-sm btn-success hover-scale"
                            onClick={() => {
                              if (window.confirm(`Mark complaint as RESOLVED?`)) {
                                handleStatusUpdate(complaint.id, 'RESOLVED')
                              }
                            }}
                            title="Mark Resolved"
                          >
                            <i className="bi bi-check-lg"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {complaints.length > 0 && (
          <div className="card-footer bg-white border-top py-3">
            <div className="d-flex justify-content-between align-items-center">
              <div className="text-muted">
                Showing {complaints.length} complaint{complaints.length !== 1 ? 's' : ''}
              </div>
              <div className="d-flex gap-2">
                <button 
                  className="btn btn-sm btn-outline-primary hover-scale"
                  onClick={fetchData}
                >
                  <i className="bi bi-arrow-clockwise me-2"></i>
                  Refresh List
                </button>
                <button 
                  className="btn btn-sm btn-primary hover-scale"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                >
                  <i className="bi bi-arrow-up me-2"></i>
                  Back to Top
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add custom CSS for hover effects */}
      <style jsx>{`
        .hover-lift {
          transition: all 0.3s ease;
        }
        
        .hover-lift:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1) !important;
        }
        
        .hover-scale {
          transition: all 0.2s ease;
        }
        
        .hover-scale:hover {
          transform: scale(1.05);
        }
        
        .hover-row:hover {
          background-color: rgba(0, 123, 255, 0.05);
        }
        
        .stat-card {
          transition: all 0.3s ease;
          cursor: pointer;
        }
        
        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }
        
        .stat-icon {
          transition: all 0.3s ease;
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .stat-card:hover .stat-icon {
          transform: scale(1.1);
        }
        
        /* Primary card hover effect */
        .border-primary:hover {
          border-color: #0d6efd !important;
          background-color: rgba(13, 110, 253, 0.02);
        }
        
        /* Success card hover effect */
        .border-success:hover {
          border-color: #198754 !important;
          background-color: rgba(25, 135, 84, 0.02);
        }
        
        /* Info card hover effect */
        .border-info:hover {
          border-color: #0dcaf0 !important;
          background-color: rgba(13, 202, 240, 0.02);
        }
        
        /* Warning card hover effect */
        .border-warning:hover {
          border-color: #ffc107 !important;
          background-color: rgba(255, 193, 7, 0.02);
        }
        
        .btn-outline-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(13, 110, 253, 0.2);
        }
        
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(13, 110, 253, 0.3);
        }
        
        .btn-success:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(25, 135, 84, 0.3);
        }
      `}</style>
    </div>
  )
}

export default ManageComplaints