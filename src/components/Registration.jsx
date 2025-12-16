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

    try {
      const queueNumber = generateQueueNumber()
      
      if (googleFormUrl) {
        console.log('Google Form URL found, attempting submission...')
        try {
          // Extract form ID - handles multiple URL formats
          let formId = null
          
          // Check if it's a short URL (forms.gle/XXXXX) and try to resolve it
          if (googleFormUrl.includes('forms.gle/')) {
            console.warn('⚠️ Short URL detected. Attempting to resolve to full URL...')
            console.warn('For better reliability, use the full URL: https://docs.google.com/forms/d/e/FORM_ID/viewform')
            
            // Try to resolve short URL by making a HEAD request
            try {
              const response = await fetch(googleFormUrl, { 
                method: 'HEAD', 
                redirect: 'follow',
                mode: 'no-cors' // This won't work for getting the redirect URL
              })
              
              // Since we can't read the redirect with no-cors, we need to use the full URL
              // The user should use: https://docs.google.com/forms/d/e/1FAIpQLSctFgoQkg8aTeron5gon5uC1thSqk8xmx1caadCmuMzk0frmg/viewform
              throw new Error('Short URL (forms.gle) detected. Please use the full Google Form URL instead. Your full URL should be: https://docs.google.com/forms/d/e/1FAIpQLSctFgoQkg8aTeron5gon5uC1thSqk8xmx1caadCmuMzk0frmg/viewform')
            } catch (resolveError) {
              throw new Error('Short URL (forms.gle) detected. Please use the full Google Form URL instead. Your full URL should be: https://docs.google.com/forms/d/e/1FAIpQLSctFgoQkg8aTeron5gon5uC1thSqk8xmx1caadCmuMzk0frmg/viewform')
            }
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
          
          if (formId) {
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
            
            // Use ONLY fetch API - single submission method to avoid duplicates
            // With no-cors mode, we can't read the response, but the submission will work
            fetch(formAction, {
              method: 'POST',
              mode: 'no-cors', // Required for Google Forms (they don't allow CORS)
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: formDataToSubmit
            }).then(() => {
              console.log('✅ Form submitted successfully via fetch (single submission)')
              console.log('Check Network tab - you should see ONE request to formResponse')
            }).catch((error) => {
              console.error('❌ Fetch submission failed:', error)
              // Don't retry - just log the error
            })
          } else {
            console.error('Could not extract form ID from URL:', googleFormUrl)
          }
        } catch (formError) {
          console.error('Google Form submission failed:', formError)
          console.error('Error details:', {
            message: formError.message,
            stack: formError.stack,
            formUrl: googleFormUrl
          })
          console.warn('Form will still be saved to localStorage. Make sure entry IDs are configured correctly. See GOOGLE_SETUP_WALKTHROUGH.md')
        }
      } else {
        console.warn('No Google Form URL configured. Form will only be saved to localStorage.')
        console.warn('To enable Google Forms submission, configure the URL in /admin')
      }
      
      saveUserQueueNumber(queueNumber)
      
      const queueItems = JSON.parse(localStorage.getItem('localQueue') || '[]')
      queueItems.push({
        queueNumber,
        name: formData.name || 'Guest',
        pepper: formData.pepper,
        portion: formData.portion || 'regular',
        timestamp: new Date().toISOString()
      })
      localStorage.setItem('localQueue', JSON.stringify(queueItems))
      
      navigate('/queue')
    } catch (error) {
      console.error('Error submitting form:', error)
      const queueNumber = generateQueueNumber()
      saveUserQueueNumber(queueNumber)
      navigate('/queue')
    } finally {
      setSubmitting(false)
      // Reset submission flag after navigation completes
      setTimeout(() => {
        submissionInProgress.current = false
      }, 3000)
    }
  }

  const generateQueueNumber = () => {
    const existingItems = JSON.parse(localStorage.getItem('localQueue') || '[]')
    const nextNumber = existingItems.length + 1
    return `SU-${String(nextNumber).padStart(3, '0')}`
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
