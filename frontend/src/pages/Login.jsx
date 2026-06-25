import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { FaUserCircle, FaLock, FaEnvelope, FaSignInAlt, FaUserPlus, FaLightbulb, FaComments, FaShieldAlt } from 'react-icons/fa'
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await login(email, password)
    
    if (result.success) {
      navigate('/public-complaints')
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
              {/* Left Side - Branding & Info */}
              <div className="col-lg-6 d-none d-lg-block">
                <div className="brand-section h-100 p-5 rounded-start-4">
                  <div className="d-flex flex-column h-100">
                    <div className="mb-5">
                      <div className="d-flex align-items-center mb-4">
                        <div className="brand-logo me-3">
                          <div className="logo-icon">
                            <FaLightbulb className="logo-main-icon" />
                            <FaComments className="logo-secondary-icon" />
                          </div>
                        </div>
                        <div>
                          <h1 className="brand-title mb-0">Resolve<span className="text-primary">It</span></h1>
                          <p className="brand-subtitle">Voice Your Concern, See It Resolved</p>
                        </div>
                      </div>
                      
                      <div className="tagline-section">
                        <h2 className="tagline mb-4">
                          Where <span className="text-highlight">Every Complaint</span><br />
                          Finds Its <span className="text-highlight">Solution</span>
                        </h2>
                        
                        <div className="features-list">
                          <div className="feature-item">
                            <FaShieldAlt className="feature-icon" />
                            <div>
                              <h5>Secure & Confidential</h5>
                              <p>Your identity is protected with enterprise-grade security</p>
                            </div>
                          </div>
                          
                          <div className="feature-item">
                            <FaComments className="feature-icon" />
                            <div>
                              <h5>Transparent Process</h5>
                              <p>Track your complaint's journey from submission to resolution</p>
                            </div>
                          </div>
                          
                          <div className="feature-item">
                            <FaLightbulb className="feature-icon" />
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
              
              {/* Right Side - Login Form */}
              <div className="col-lg-6">
                <div className="login-form-section h-100 p-4 p-md-5">
                  <div className="d-flex flex-column h-100">
                    {/* Mobile Logo */}
                    <div className="d-block d-lg-none text-center mb-4">
                      <div className="mobile-logo mb-3">
                        <FaLightbulb className="mobile-logo-icon" />
                      </div>
                      <h2 className="mobile-brand-title">Resolve<span className="text-primary">It</span></h2>
                      <p className="text-muted">Voice Your Concern, See It Resolved</p>
                    </div>
                    
                    <div className="text-center mb-5">
                      <div className="login-icon-container mb-3">
                        <FaUserCircle className="login-icon" />
                      </div>
                      <h3 className="login-title">Welcome Back</h3>
                      <p className="login-subtitle">Sign in to your account to continue</p>
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
                      <div className="mb-4">
                        <label htmlFor="email" className="form-label fw-semibold">
                          <FaEnvelope className="me-2" />
                          Email Address
                        </label>
                        <div className="input-group">
                          <span className="input-group-text">
                            <FaEnvelope className="text-muted" />
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
                      
                      <div className="mb-4">
                        <label htmlFor="password" className="form-label fw-semibold">
                          <FaLock className="me-2" />
                          Password
                        </label>
                        <div className="input-group">
                          <span className="input-group-text">
                            <FaLock className="text-muted" />
                          </span>
                          <input
                            type={showPassword ? "text" : "password"}
                            className="form-control form-control-lg"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                          />
                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? 'Hide' : 'Show'}
                          </button>
                        </div>
                        <div className="form-text d-flex justify-content-between mt-2">
                          <div>
                            <input type="checkbox" className="form-check-input me-2" id="remember" />
                            <label htmlFor="remember" className="form-check-label small">Remember me</label>
                          </div>
                          <a href="#" className="text-decoration-none small">Forgot password?</a>
                        </div>
                      </div>
                      
                      <button 
                        type="submit" 
                        className="btn btn-primary btn-lg w-100 py-3 mb-3 login-btn"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                            Authenticating...
                          </>
                        ) : (
                          <>
                            <FaSignInAlt className="me-2" />
                            Sign In to Dashboard
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
                        New to ResolveIt?{' '}
                        <Link to="/register" className="text-decoration-none fw-semibold register-link">
                          <FaUserPlus className="me-1" />
                          Create an Account
                        </Link>
                      </p>
                      
                      <div className="terms-text small text-muted">
                        By signing in, you agree to our{' '}
                        <a href="#" className="text-decoration-none">Terms of Service</a>{' '}
                        and{' '}
                        <a href="#" className="text-decoration-none">Privacy Policy</a>
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

export default Login