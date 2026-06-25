import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'

const Register = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)
  
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!agreeTerms) {
      setError('You must agree to the Terms of Service and Privacy Policy')
      return
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    
    setError('')
    setLoading(true)

    const result = await register(name, email, password)
    
    if (result.success) {
      navigate('/login')
    } else {
      setError(result.message)
    }
    
    setLoading(false)
  }

  return (
    <div className="login-container">
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-xl-10 col-lg-12 col-md-9">
            <div className="row g-0">
              {/* Left Side - Branding & Info (Same as Login) */}
              <div className="col-lg-6 d-none d-lg-block">
                <div className="brand-section h-100 p-5 rounded-start-4">
                  <div className="d-flex flex-column h-100">
                    <div className="mb-5">
                      <div className="d-flex align-items-center mb-4">
                        <div className="brand-logo me-3">
                          <div className="logo-icon">
                            <i className="bi bi-lightbulb logo-main-icon"></i>
                            <i className="bi bi-chat-dots logo-secondary-icon"></i>
                          </div>
                        </div>
                        <div>
                          <h1 className="brand-title mb-0">Resolve<span className="text-primary">It</span></h1>
                          <p className="brand-subtitle">Voice Your Concern, See It Resolved</p>
                        </div>
                      </div>
                      
                      <div className="tagline-section">
                        <h2 className="tagline mb-4">
                          Join <span className="text-highlight">Thousands</span> of<br />
                          <span className="text-highlight">Active Citizens</span> Today
                        </h2>
                        
                        <div className="features-list">
                          <div className="feature-item">
                            <i className="bi bi-shield-check feature-icon"></i>
                            <div>
                              <h5>Secure & Confidential</h5>
                              <p>Your identity is protected with enterprise-grade security</p>
                            </div>
                          </div>
                          
                          <div className="feature-item">
                            <i className="bi bi-chat-dots feature-icon"></i>
                            <div>
                              <h5>Transparent Process</h5>
                              <p>Track your complaint's journey from submission to resolution</p>
                            </div>
                          </div>
                          
                          <div className="feature-item">
                            <i className="bi bi-people feature-icon"></i>
                            <div>
                              <h5>Community Driven</h5>
                              <p>Join hands to make our community a better place</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-auto">
                      <div className="stats-card">
                        <div className="row text-center">
                          <div className="col-4">
                            <div className="stat-number">1K+</div>
                            <div className="stat-label">Issues Resolved</div>
                          </div>
                          <div className="col-4">
                            <div className="stat-number">500+</div>
                            <div className="stat-label">Happy Citizens</div>
                          </div>
                          <div className="col-4">
                            <div className="stat-number">24/7</div>
                            <div className="stat-label">Support</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Right Side - Registration Form */}
              <div className="col-lg-6">
                <div className="login-form-section h-100 p-4 p-md-5">
                  <div className="d-flex flex-column h-100">
                    {/* Mobile Logo */}
                    <div className="d-block d-lg-none text-center mb-4">
                      <div className="mobile-logo mb-3">
                        <i className="bi bi-lightbulb mobile-logo-icon"></i>
                      </div>
                      <h2 className="mobile-brand-title">Resolve<span className="text-primary">It</span></h2>
                      <p className="text-muted">Join our community today</p>
                    </div>
                    
                    <div className="text-center mb-5">
                      <div className="login-icon-container mb-3">
                        <i className="bi bi-person-plus login-icon"></i>
                      </div>
                      <h3 className="login-title">Create Account</h3>
                      <p className="login-subtitle">Join ResolveIt and start making a difference</p>
                    </div>
                    
                    {error && (
                      <div className="alert alert-danger alert-dismissible fade show animate__animated animate__shakeX" role="alert">
                        <div className="d-flex align-items-center">
                          <i className="bi bi-exclamation-triangle-fill me-2"></i>
                          <div className="flex-grow-1">{error}</div>
                          <button 
                            type="button" 
                            className="btn-close" 
                            onClick={() => setError('')}
                          ></button>
                        </div>
                      </div>
                    )}
                    
                    <form onSubmit={handleSubmit} className="mb-4">
                      <div className="mb-3">
                        <label htmlFor="name" className="form-label fw-semibold">
                          <i className="bi bi-person me-2"></i>
                          Full Name
                        </label>
                        <div className="input-group">
                          <span className="input-group-text">
                            <i className="bi bi-person text-muted"></i>
                          </span>
                          <input
                            type="text"
                            className="form-control form-control-lg"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your full name"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <label htmlFor="email" className="form-label fw-semibold">
                          <i className="bi bi-envelope me-2"></i>
                          Email Address
                        </label>
                        <div className="input-group">
                          <span className="input-group-text">
                            <i className="bi bi-envelope text-muted"></i>
                          </span>
                          <input
                            type="email"
                            className="form-control form-control-lg"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email address"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <label htmlFor="password" className="form-label fw-semibold">
                          <i className="bi bi-lock me-2"></i>
                          Password
                        </label>
                        <div className="input-group">
                          <span className="input-group-text">
                            <i className="bi bi-lock text-muted"></i>
                          </span>
                          <input
                            type={showPassword ? "text" : "password"}
                            className="form-control form-control-lg"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Create password"
                            required
                            minLength="6"
                          />
                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? 'Hide' : 'Show'}
                          </button>
                        </div>
                        <div className="password-strength mt-2">
                          <div className="progress" style={{ height: '4px' }}>
                            <div 
                              className={`progress-bar ${password.length >= 6 ? password.length >= 8 ? 'bg-success' : 'bg-warning' : 'bg-danger'}`}
                              style={{ width: `${Math.min(password.length * 10, 100)}%` }}
                            ></div>
                          </div>
                          <small className="text-muted">
                            {password.length < 6 ? 'Weak' : password.length < 8 ? 'Medium' : 'Strong'} password
                          </small>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <label htmlFor="confirmPassword" className="form-label fw-semibold">
                          <i className="bi bi-lock-fill me-2"></i>
                          Confirm Password
                        </label>
                        <div className="input-group">
                          <span className="input-group-text">
                            <i className="bi bi-lock-fill text-muted"></i>
                          </span>
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            className="form-control form-control-lg"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm password"
                            required
                            minLength="6"
                          />
                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? 'Hide' : 'Show'}
                          </button>
                        </div>
                        {confirmPassword && password !== confirmPassword && (
                          <small className="text-danger d-block mt-1">
                            <i className="bi bi-exclamation-circle me-1"></i>
                            Passwords don't match
                          </small>
                        )}
                      </div>
                      
                      <div className="mb-4">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="agreeTerms"
                            checked={agreeTerms}
                            onChange={(e) => setAgreeTerms(e.target.checked)}
                          />
                          <label className="form-check-label small" htmlFor="agreeTerms">
                            I agree to the{' '}
                            <a href="#" className="text-decoration-none">Terms of Service</a>{' '}
                            and{' '}
                            <a href="#" className="text-decoration-none">Privacy Policy</a>
                          </label>
                        </div>
                      </div>
                      
                      <button 
                        type="submit" 
                        className="btn btn-primary btn-lg w-100 py-3 mb-3 login-btn"
                        disabled={loading || !agreeTerms}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                            Creating Account...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-person-plus me-2"></i>
                            Create Account
                          </>
                        )}
                      </button>
                      
                      <div className="text-center mb-4">
                        <div className="divider">
                          <span className="divider-text">or continue with</span>
                        </div>
                        
                        <div className="d-flex justify-content-center gap-3 mt-3">
                          <button type="button" className="btn btn-outline-dark btn-sm social-btn">
                            <i className="bi bi-google"></i>
                          </button>
                          <button type="button" className="btn btn-outline-dark btn-sm social-btn">
                            <i className="bi bi-github"></i>
                          </button>
                          <button type="button" className="btn btn-outline-dark btn-sm social-btn">
                            <i className="bi bi-facebook"></i>
                          </button>
                        </div>
                      </div>
                    </form>
                    
                    <div className="mt-auto text-center">
                      <p className="mb-3 text-muted">
                        Already have an account?{' '}
                        <Link to="/login" className="text-decoration-none fw-semibold register-link">
                          <i className="bi bi-box-arrow-in-right me-1"></i>
                          Sign In Here
                        </Link>
                      </p>
                      
                      <div className="terms-text small text-muted">
                        <i className="bi bi-shield-check me-1"></i>
                        Your information is secured with industry-standard encryption
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register