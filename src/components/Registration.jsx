import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useQueue } from '../context/QueueContext'
import { 
  FaUser, 
  FaPepperHot, 
  FaUtensils, 
  FaChild, 
  FaCheck,
  FaSpinner,
  FaArrowRight
} from 'react-icons/fa'
import { HiSparkles } from 'react-icons/hi'
import './Registration.css'

function Registration() {
  const navigate = useNavigate()
  const { saveUserQueueNumber, googleFormUrl } = useQueue()
  const [formData, setFormData] = useState({
    name: '',
    pepper: '',
    portion: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [focusedField, setFocusedField] = useState(null)
  const submissionInProgress = useRef(false) // Prevent duplicate submissions

  // Debug: Log Google Form URL on mount
  useEffect(() => {
    console.log('Registration component mounted. Google Form URL:', googleFormUrl || 'NOT CONFIGURED')
    if (!googleFormUrl) {
      console.warn('⚠️ Google Form URL is not configured!')
      console.warn('Go to /admin to configure your Google Form URL')
    }
  }, [googleFormUrl])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Prevent duplicate submissions (React StrictMode in dev causes double renders)
    if (submissionInProgress.current) {
      console.warn('⚠️ Submission already in progress, ignoring duplicate submit')
      return
    }
    
    submissionInProgress.current = true
    setSubmitting(true)

    console.log('Form submission started', { googleFormUrl, formData })

    // Require Google Form URL - no localStorage fallback
    if (!googleFormUrl) {
      // Show a more helpful message and navigate to admin
      const shouldConfigure = window.confirm(
        '⚠️ Google Form URL is not configured.\n\n' +
        'Click OK to go to the setup page and configure it.\n' +
        'This only needs to be done once per device.'
      )
      if (shouldConfigure) {
        navigate('/admin')
      }
      setSubmitting(false)
      submissionInProgress.current = false
      return
    }

    try {
      console.log('Google Form URL found, attempting submission...')
      
      // Extract form ID - handles multiple URL formats
      let formId = null
      
      // Check if it's a short URL (forms.gle/XXXXX)
      if (googleFormUrl.includes('forms.gle/')) {
        alert('⚠️ Short URL detected. Please use the full Google Form URL instead.')
        setSubmitting(false)
        submissionInProgress.current = false
        return
      }
      
      // Try /e/ format first (newer format like: /forms/d/e/FORM_ID)
      const formIdMatchE = googleFormUrl.match(/\/forms\/d\/e\/([a-zA-Z0-9-_]+)/)
      if (formIdMatchE) {
        formId = formIdMatchE[1]
      } else {
        // Try /d/ format (older format)
        const formIdMatchD = googleFormUrl.match(/\/forms\/d\/([a-zA-Z0-9-_]+)/)
        if (formIdMatchD) {
          formId = formIdMatchD[1]
        }
      }
      
      if (!formId) {
        alert('❌ Could not extract form ID from URL. Please check your Google Form URL.')
        setSubmitting(false)
        submissionInProgress.current = false
        return
      }

      const formAction = `https://docs.google.com/forms/d/e/${formId}/formResponse`
      console.log('Form ID extracted:', formId)
      console.log('Form action URL:', formAction)
      
      // Entry IDs from your Google Form (extracted from Network tab)
      const entryIds = {
        name: 'entry.310430013',    // Name or Nickname field
        pepper: 'entry.1825114017',  // Pepper Level field
        portion: 'entry.682541457'  // Portion Type field
      }
      console.log('Entry IDs:', entryIds)

      // Map form values to Google Form format
      const pepperMap = {
        'no-pepper': 'No Pepper',
        'normal': 'Normal',
        'extra': 'Extra'
      }
      
      const portionMap = {
        'regular': 'Regular',
        'kids': 'Kids'
      }

      // Prepare form data for submission using URLSearchParams
      const formDataToSubmit = new URLSearchParams()
      formDataToSubmit.append(entryIds.name, formData.name || '')
      formDataToSubmit.append(entryIds.pepper, pepperMap[formData.pepper] || formData.pepper || 'Normal')
      formDataToSubmit.append(entryIds.portion, portionMap[formData.portion] || formData.portion || 'Regular')
      
      console.log('About to submit form to:', formAction)
      console.log('Form data to submit:', {
        [entryIds.name]: formData.name || '',
        [entryIds.pepper]: pepperMap[formData.pepper] || formData.pepper || 'Normal',
        [entryIds.portion]: portionMap[formData.portion] || formData.portion || 'Regular'
      })
      
      // Submit to Google Form - REQUIRED, no localStorage fallback
      await fetch(formAction, {
        method: 'POST',
        mode: 'no-cors', // Required for Google Forms (they don't allow CORS)
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formDataToSubmit
      })
      
      console.log('✅ Form submitted successfully to Google Form')
      console.log('✅ Your submission will appear in Google Sheets shortly')
      
      // Store submission details in sessionStorage temporarily to match user to their entry
      // This will be used to find their queue number from Google Sheets
      sessionStorage.setItem('pendingSubmission', JSON.stringify({
        name: formData.name || 'Guest',
        pepper: formData.pepper,
        portion: formData.portion || 'regular',
        timestamp: new Date().toISOString()
      }))
      
      console.log('✅ Submission details stored. Queue number will be assigned from Google Sheets.')
      
      // Navigate to queue - the queue number will be determined from Google Sheets
      navigate('/queue')
      
    } catch (error) {
      console.error('❌ Google Form submission failed:', error)
      alert('❌ Failed to submit form. Please check your internet connection and try again. Make sure Google Form URL is configured correctly in Admin settings.')
      setSubmitting(false)
      submissionInProgress.current = false
      return
    } finally {
      setSubmitting(false)
      // Reset submission flag after navigation completes
      setTimeout(() => {
        submissionInProgress.current = false
      }, 3000)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 12,
      },
    },
  }

  const pepperOptions = [
    { value: 'no-pepper', label: 'No Pepper', icon: FaPepperHot, level: 0 },
    { value: 'normal', label: 'Normal', icon: FaPepperHot, level: 1 },
    { value: 'extra', label: 'Extra', icon: FaPepperHot, level: 2 },
  ]

  const portionOptions = [
    { value: 'regular', label: 'Regular', icon: FaUtensils },
    { value: 'kids', label: 'Kids', icon: FaChild },
  ]

  return (
    <div className="registration-screen">
      <div className="container">
        <motion.div
          className="form-container glass-card"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <h2 className="form-title">
              <HiSparkles className="title-icon" />
              Join the Queue
              <HiSparkles className="title-icon" />
            </h2>
            <p className="form-subtitle">Tell us your preferences</p>
          </motion.div>

          {/* Show setup link if Google Form URL is not configured */}
          {!googleFormUrl && (
            <motion.div
              className="setup-prompt"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: 'rgba(255, 193, 7, 0.2)',
                border: '2px solid rgba(255, 193, 7, 0.5)',
                borderRadius: '10px',
                padding: '15px',
                marginBottom: '20px',
                textAlign: 'center'
              }}
            >
              <p style={{ color: '#fff', marginBottom: '10px', fontSize: '14px' }}>
                ⚠️ Google Form URL is not configured
              </p>
              <motion.button
                type="button"
                onClick={() => navigate('/admin')}
                style={{
                  background: 'rgba(255, 193, 7, 0.3)',
                  border: '1px solid rgba(255, 193, 7, 0.6)',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Configure Now →
              </motion.button>
            </motion.div>
          )}
          
          <form onSubmit={handleSubmit}>
            <motion.div
              className="form-group"
              variants={itemVariants}
            >
              <label htmlFor="name" className="form-label">
                <FaUser className="label-icon" />
                Name or Nickname (Optional)
              </label>
              <motion.input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField(null)}
                placeholder="Enter your name"
                className={`form-input ${focusedField === 'name' ? 'focused' : ''}`}
                whileFocus={{ scale: 1.02 }}
              />
            </motion.div>

            <motion.div
              className="form-group"
              variants={itemVariants}
            >
              <label className="form-label">
                <FaPepperHot className="label-icon" />
                Pepper Level <span className="required">*</span>
              </label>
              <div className="radio-group">
                {pepperOptions.map((option, index) => {
                  const Icon = option.icon
                  return (
                    <motion.label
                      key={option.value}
                      className={`radio-option ${formData.pepper === option.value ? 'selected' : ''}`}
                      whileHover={{ scale: 1.05, x: 5 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <input
                        type="radio"
                        name="pepper"
                        value={option.value}
                        checked={formData.pepper === option.value}
                        onChange={handleChange}
                        required
                      />
                      <span className="radio-content">
                        <span className="radio-emoji">
                          {Array(option.level + 1).fill(0).map((_, i) => (
                            <Icon key={i} className="pepper-icon" />
                          ))}
                        </span>
                        <span className="radio-text">{option.label}</span>
                      </span>
                      {formData.pepper === option.value && (
                        <motion.div
                          className="radio-check"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        >
                          <FaCheck />
                        </motion.div>
                      )}
                    </motion.label>
                  )
                })}
              </div>
            </motion.div>

            <motion.div
              className="form-group"
              variants={itemVariants}
            >
              <label className="form-label">
                <FaUtensils className="label-icon" />
                Portion Type (Optional)
              </label>
              <div className="radio-group">
                {portionOptions.map((option, index) => {
                  const Icon = option.icon
                  return (
                    <motion.label
                      key={option.value}
                      className={`radio-option ${formData.portion === option.value ? 'selected' : ''}`}
                      whileHover={{ scale: 1.05, x: 5 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <input
                        type="radio"
                        name="portion"
                        value={option.value}
                        checked={formData.portion === option.value}
                        onChange={handleChange}
                      />
                      <span className="radio-content">
                        <span className="radio-emoji">
                          <Icon className="portion-icon" />
                        </span>
                        <span className="radio-text">{option.label}</span>
                      </span>
                      {formData.portion === option.value && (
                        <motion.div
                          className="radio-check"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        >
                          <FaCheck />
                        </motion.div>
                      )}
                    </motion.label>
                  )
                })}
              </div>
            </motion.div>

            <motion.button
              type="submit"
              className="btn-primary"
              disabled={submitting || !formData.pepper}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              variants={itemVariants}
            >
              <AnimatePresence mode="wait">
                {submitting ? (
                  <motion.span
                    key="submitting"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="button-content"
                  >
                    <FaSpinner className="icon-spin" />
                    Submitting...
                  </motion.span>
                ) : (
                  <motion.span
                    key="submit"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="button-content"
                  >
                    <FaArrowRight className="icon-inline" />
                    Get My Queue Number
                    <FaArrowRight className="icon-inline" />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  )
}

export default Registration
