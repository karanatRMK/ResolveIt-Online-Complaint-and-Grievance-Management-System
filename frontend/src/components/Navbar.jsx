import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useEffect, useState } from 'react'
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAuthenticated, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setDropdownOpen(false)
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  // Handle navbar scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Don't show navbar on auth pages when not authenticated
  if (location.pathname === '/login' || location.pathname === '/register') {
    if (!isAuthenticated) {
      return null
    }
  }

  // Show loading state
  if (loading) {
    return (
      <nav className="navbar navbar-expand-lg fixed-top" style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        minHeight: '60px',
        padding: '0.5rem 0'
      }}>
        <div className="container">
          <div className="navbar-brand text-white fw-bold py-0">
            <div className="d-flex align-items-center">
              <div className="logo-animation me-2">
                <i className="bi bi-lightbulb"></i>
                <i className="bi bi-chat-dots logo-secondary"></i>
              </div>
              Resolve<span className="text-warning">It</span>
            </div>
          </div>
          <div className="ms-auto">
            <div className="spinner-border spinner-border-sm text-light" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className={`navbar navbar-expand-lg fixed-top ${scrolled ? 'navbar-scrolled' : ''}`} style={{ minHeight: '65px' }}>
      <div className="container py-0">
        <Link className="navbar-brand py-1" to="/">
          <div className="d-flex align-items-center">
            <div className="logo-wrapper me-2">
              <i className="bi bi-lightbulb logo-main"></i>
              <i className="bi bi-chat-dots logo-secondary"></i>
            </div>
            <div>
              <span className="brand-text fw-bold">Resolve<span className="text-primary">It</span></span>
              <small className="brand-subtitle d-none d-md-block">Voice Your Concern</small>
            </div>
          </div>
        </Link>
        
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
          style={{ padding: '0.25rem 0.5rem' }}
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav mx-auto">
            <li className="nav-item">
              <Link 
                className={`nav-link ${location.pathname === '/public-complaints' ? 'active' : ''}`} 
                to="/public-complaints"
                style={{ padding: '0.5rem 1rem' }}
              >
                <i className="bi bi-eye me-1"></i>
                Public Complaints
                {location.pathname === '/public-complaints' && <span className="nav-indicator"></span>}
              </Link>
            </li>
            
            {isAuthenticated && user && (
              <>
                {/* REGULAR USER sees these */}
                {user.role === 'USER' && (
                  <>
                    {/* DASHBOARD LINK FOR REGULAR USERS */}
                    <li className="nav-item">
                      <Link 
                        className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`} 
                        to="/dashboard"
                        style={{ padding: '0.5rem 1rem' }}
                      >
                        <i className="bi bi-speedometer2 me-1"></i>
                        Dashboard
                        {location.pathname === '/dashboard' && <span className="nav-indicator"></span>}
                      </Link>
                    </li>
                    
                    <li className="nav-item">
                      <Link 
                        className={`nav-link ${location.pathname === '/my-complaints' ? 'active' : ''}`} 
                        to="/my-complaints"
                        style={{ padding: '0.5rem 1rem' }}
                      >
                        <i className="bi bi-list-check me-1"></i>
                        My Complaints
                        {location.pathname === '/my-complaints' && <span className="nav-indicator"></span>}
                      </Link>
                    </li>
                    
                    <li className="nav-item">
                      <Link 
                        className={`nav-link ${location.pathname === '/submit' ? 'active' : ''}`} 
                        to="/submit"
                        style={{ padding: '0.5rem 1rem' }}
                      >
                        <i className="bi bi-plus-circle me-1"></i>
                        Submit Complaint
                        {location.pathname === '/submit' && <span className="nav-indicator"></span>}
                      </Link>
                    </li>
                    
                    <li className="nav-item">
                      <Link 
                        className={`nav-link nav-link-employee ${location.pathname === '/request-employee' ? 'active' : ''}`} 
                        to="/request-employee"
                        style={{ padding: '0.5rem 1rem' }}
                      >
                        <i className="bi bi-person-badge me-1"></i>
                        Become Employee
                        {location.pathname === '/request-employee' && <span className="nav-indicator"></span>}
                      </Link>
                    </li>
                  </>
                )}
                
                {/* EMPLOYEE sees only these */}
                {user.role === 'EMPLOYEE' && (
                  <>
                    <li className="nav-item">
                      <Link 
                        className={`nav-link ${location.pathname === '/employee/dashboard' ? 'active' : ''}`} 
                        to="/employee/dashboard"
                        style={{ padding: '0.5rem 1rem' }}
                      >
                        <i className="bi bi-briefcase me-1"></i>
                        Employee Dashboard
                        {location.pathname === '/employee/dashboard' && <span className="nav-indicator"></span>}
                      </Link>
                    </li>
                    
                    {/* ADDED: Request Senior Employee Link */}
                    <li className="nav-item">
                      <Link 
                        className={`nav-link ${location.pathname === '/employee/request-senior' ? 'active' : ''}`} 
                        to="/employee/request-senior"
                        style={{ padding: '0.5rem 1rem' }}
                      >
                        <i className="bi bi-arrow-up-circle me-1"></i>
                        Request Senior Role
                        {location.pathname === '/employee/request-senior' && <span className="nav-indicator"></span>}
                      </Link>
                    </li>
                  </>
                )}

                {/* SENIOR_EMPLOYEE sees these */}
                {user.role === 'SENIOR_EMPLOYEE' && (
                  <>
                    <li className="nav-item">
                      <Link 
                        className={`nav-link ${location.pathname === '/senior/dashboard' ? 'active' : ''}`} 
                        to="/senior/dashboard"
                        style={{ padding: '0.5rem 1rem' }}
                      >
                        <i className="bi bi-shield me-1"></i>
                        Senior Dashboard
                        {location.pathname === '/senior/dashboard' && <span className="nav-indicator"></span>}
                      </Link>
                    </li>
                    
                    <li className="nav-item">
                      <Link 
                        className={`nav-link ${location.pathname === '/senior/escalated' ? 'active' : ''}`} 
                        to="/senior/escalated"
                        style={{ padding: '0.5rem 1rem' }}
                      >
                        <i className="bi bi-arrow-up-circle me-1"></i>
                        Escalated Complaints
                        {location.pathname === '/senior/escalated' && <span className="nav-indicator"></span>}
                      </Link>
                    </li>
                  </>
                )}
                
                {/* ADMIN sees these */}
                {user.role === 'ADMIN' && (
                  <>
                    <li className="nav-item">
                      <Link 
                        className={`nav-link ${location.pathname === '/admin/dashboard' ? 'active' : ''}`} 
                        to="/admin/dashboard"
                        style={{ padding: '0.5rem 1rem' }}
                      >
                        <i className="bi bi-speedometer2 me-1"></i>
                        Admin Dashboard
                        {location.pathname === '/admin/dashboard' && <span className="nav-indicator"></span>}
                      </Link>
                    </li>
                    
                    <li className="nav-item">
                      <Link 
                        className={`nav-link ${location.pathname === '/admin/complaints' ? 'active' : ''}`} 
                        to="/admin/complaints"
                        style={{ padding: '0.5rem 1rem' }}
                      >
                        <i className="bi bi-list-task me-1"></i>
                        Manage Complaints
                        {location.pathname === '/admin/complaints' && <span className="nav-indicator"></span>}
                      </Link>
                    </li>
                    
                    <li className="nav-item">
                      <Link 
                        className={`nav-link ${location.pathname === '/admin/employee-requests' ? 'active' : ''}`} 
                        to="/admin/employee-requests"
                        style={{ padding: '0.5rem 1rem' }}
                      >
                        <i className="bi bi-people me-1"></i>
                        Employee Requests
                        {location.pathname === '/admin/employee-requests' && <span className="nav-indicator"></span>}
                      </Link>
                    </li>
                    
                    <li className="nav-item">
                      <Link 
                        className={`nav-link ${location.pathname === '/admin/senior-requests' ? 'active' : ''}`} 
                        to="/admin/senior-requests"
                        style={{ padding: '0.5rem 1rem' }}
                      >
                        <i className="bi bi-person-up me-1"></i>
                        Senior Requests
                        {location.pathname === '/admin/senior-requests' && <span className="nav-indicator"></span>}
                      </Link>
                    </li>
                    
                    <li className="nav-item">
                      <Link 
                        className={`nav-link ${location.pathname === '/admin/employees' ? 'active' : ''}`} 
                        to="/admin/employees"
                        style={{ padding: '0.5rem 1rem' }}
                      >
                        <i className="bi bi-person-gear me-1"></i>
                        Manage Employees
                        {location.pathname === '/admin/employees' && <span className="nav-indicator"></span>}
                      </Link>
                    </li>
                  </>
                )}
              </>
            )}
          </ul>
          
          <ul className="navbar-nav">
            {isAuthenticated && user ? (
              <li className="nav-item dropdown position-static">
                <a 
                  className="nav-link dropdown-toggle user-dropdown py-2" 
                  href="#" 
                  role="button" 
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setDropdownOpen(!dropdownOpen)
                  }}
                  style={{ padding: '0.5rem 0.75rem' }}
                >
                  <div className="d-flex align-items-center">
                    <div className="user-avatar me-2">
                      {user.fullName ? user.fullName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                    </div>
                    <div className="d-none d-md-block">
                      <div className="user-name" style={{ fontSize: '0.9rem', lineHeight: '1' }}>{user.fullName || user.email.split('@')[0]}</div>
                      <div className="user-role">
                        <span className={`badge user-role-badge ${
                          user.role === 'ADMIN' ? 'bg-danger' :
                          user.role === 'EMPLOYEE' ? 'bg-success' : 
                          user.role === 'SENIOR_EMPLOYEE' ? 'bg-warning' : 'bg-primary'
                        }`} style={{ fontSize: '0.7rem', padding: '0.2rem 0.4rem' }}>
                          {user.role}
                        </span>
                      </div>
                    </div>
                    <i className="bi bi-chevron-down ms-1"></i>
                  </div>
                </a>
                <ul className={`dropdown-menu dropdown-menu-end ${dropdownOpen ? 'show' : ''}`} style={{ 
                  marginTop: '0.5rem', 
                  borderTop: '3px solid #667eea',
                  minWidth: '220px'
                }}>
                  <li className="dropdown-header py-2 px-3">
                    <div className="d-flex align-items-center">
                      <div className="user-avatar me-2" style={{ width: '40px', height: '40px' }}>
                        {user.fullName ? user.fullName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="fw-bold" style={{ fontSize: '0.95rem' }}>{user.fullName || user.email.split('@')[0]}</div>
                        <small className="text-muted" style={{ fontSize: '0.8rem' }}>{user.email}</small>
                      </div>
                    </div>
                  </li>
                  <li><hr className="dropdown-divider my-2" /></li>
                  
                  {/* Removed "My Profile" option */}
                  
                  {/* Only show "My Complaints" and "Submit Complaint" for regular USERS */}
                  {user.role === 'USER' && (
                    <>
                      <li>
                        <Link className="dropdown-item py-2" to="/my-complaints">
                          <i className="bi bi-list-check me-2"></i>
                          My Complaints
                        </Link>
                      </li>
                      
                      <li>
                        <Link className="dropdown-item py-2" to="/submit">
                          <i className="bi bi-plus-circle me-2"></i>
                          Submit Complaint
                        </Link>
                      </li>
                    </>
                  )}
                  
                  {/* Role-specific dropdown items */}
                  {user.role === 'EMPLOYEE' && (
                    <>
                      <li>
                        <Link className="dropdown-item py-2" to="/employee/dashboard">
                          <i className="bi bi-briefcase me-2"></i>
                          Employee Dashboard
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item py-2" to="/employee/request-senior">
                          <i className="bi bi-arrow-up-circle me-2"></i>
                          Request Senior Role
                        </Link>
                      </li>
                    </>
                  )}
                  
                  {user.role === 'SENIOR_EMPLOYEE' && (
                    <>
                      <li>
                        <Link className="dropdown-item py-2" to="/senior/dashboard">
                          <i className="bi bi-shield me-2"></i>
                          Senior Dashboard
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item py-2" to="/senior/escalated">
                          <i className="bi bi-arrow-up-circle me-2"></i>
                          Escalated Complaints
                        </Link>
                      </li>
                    </>
                  )}
                  
                  {user.role === 'ADMIN' && (
                    <>
                      <li>
                        <Link className="dropdown-item py-2" to="/admin/dashboard">
                          <i className="bi bi-speedometer2 me-2"></i>
                          Admin Dashboard
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item py-2" to="/admin/complaints">
                          <i className="bi bi-list-task me-2"></i>
                          Manage Complaints
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item py-2" to="/admin/senior-requests">
                          <i className="bi bi-person-up me-2"></i>
                          Senior Requests
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item py-2" to="/admin/employees">
                          <i className="bi bi-person-gear me-2"></i>
                          Manage Employees
                        </Link>
                      </li>
                    </>
                  )}
                  
                  <li><hr className="dropdown-divider my-2" /></li>
                  
                  <li>
                    <button className="dropdown-item text-danger py-2" onClick={handleLogout}>
                      <i className="bi bi-box-arrow-right me-2"></i>
                      Logout
                    </button>
                  </li>
                </ul>
              </li>
            ) : (
              <div className="d-flex gap-2 align-items-center">
                <li className="nav-item">
                  <Link 
                    className={`btn btn-outline-light btn-sm ${location.pathname === '/login' ? 'active' : ''}`} 
                    to="/login"
                    style={{ padding: '0.375rem 0.75rem' }}
                  >
                    <i className="bi bi-box-arrow-in-right me-1"></i>
                    Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link 
                    className={`btn btn-primary btn-sm ${location.pathname === '/register' ? 'active' : ''}`} 
                    to="/register"
                    style={{ padding: '0.375rem 0.75rem' }}
                  >
                    <i className="bi bi-person-plus me-1"></i>
                    Register
                  </Link>
                </li>
              </div>
            )}
          </ul>
        </div>
      </div>
    </nav>
  )
}

export default Navbar