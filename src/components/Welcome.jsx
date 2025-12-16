import { useNavigate } from 'react-router-dom'
import { HiSparkles } from 'react-icons/hi'
import { FaArrowRight } from 'react-icons/fa'
import './Welcome.css'

function Welcome() {
  const navigate = useNavigate()

  return (
    <div className="welcome-screen">
      <div className="container">
        <div className="welcome-content">
          <div className="logo-container">
            <img
              src="/assets/Screenshot 2025-12-15 at 21.41.07.png"
              alt="Suya"
              className="suya-image"
              onError={(e) => {
                e.target.style.display = 'none'
              }}
            />
          </div>

          <h1 className="welcome-title">
            Welcome to the{' '}
            <span className="highlight-text">Suya Experience</span>
          </h1>

          <p className="subtitle">
            <HiSparkles className="icon-inline" />
            Scan, relax, and we'll serve you shortly
            <HiSparkles className="icon-inline" />
          </p>

          <button
            className="btn-primary"
            onClick={() => navigate('/register')}
          >
            <span className="button-content">
              <FaArrowRight className="icon-inline" />
              Join the Queue
              <FaArrowRight className="icon-inline" />
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Welcome
