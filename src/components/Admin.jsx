import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useQueue } from '../context/QueueContext'
import { 
  FaCog, 
  FaTable, 
  FaFileAlt, 
  FaCrosshairs, 
  FaArrowRight, 
  FaRedo, 
  FaCheckCircle,
  FaExclamationTriangle,
  FaPepperHot,
  FaUtensils,
  FaChild,
  FaList,
  FaSpinner
} from 'react-icons/fa'
import { HiSparkles } from 'react-icons/hi'
import './Admin.css'

function Admin() {
  const navigate = useNavigate()
  const {
    currentServing,
    activeQueue,
    queueData, // Get full queue data to prevent flickering
    updateCurrentServing,
    resetQueue,
    googleSheetsUrl,
    googleFormUrl,
    statusSheetGid,
    statusFormUrl,
    saveGoogleSheetsUrl,
    saveGoogleFormUrl,
    saveStatusSheetGid,
    saveStatusFormUrl,
    fetchQueueData
  } = useQueue()

  const [servingInput, setServingInput] = useState(currentServing)
  const [showSetup, setShowSetup] = useState(!googleSheetsUrl || !googleFormUrl)

  useEffect(() => {
    setServingInput(currentServing)
  }, [currentServing])

  useEffect(() => {
    if (googleSheetsUrl) {
      fetchQueueData()
      const interval = setInterval(fetchQueueData, 3000) // Reduced to 3s for real-time updates
      return () => clearInterval(interval)
    }
  }, [googleSheetsUrl, fetchQueueData])

  const handleUpdateServing = () => {
    const input = servingInput.trim().toUpperCase()
    if (!input.match(/^SU-\d{3}$/)) {
      alert('Please enter a valid queue number (e.g., SU-042)')
      return
    }
    updateCurrentServing(input)
    alert(`Updated! Now serving: ${input}`)
  }

  const handleIncrement = () => {
    const currentNum = parseInt(currentServing.replace('SU-', ''))
    const nextNum = currentNum + 1
    const nextQueueNumber = `SU-${String(nextNum).padStart(3, '0')}`
    setServingInput(nextQueueNumber)
    updateCurrentServing(nextQueueNumber)
  }

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset the entire queue? This cannot be undone.')) {
      resetQueue()
      setServingInput('SU-000')
      alert('Queue has been reset!')
    }
  }

  const handleSetupSubmit = (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const sheetsUrl = formData.get('sheetsUrl')
    const formUrl = formData.get('formUrl')
    const statusGid = formData.get('statusGid')
    const statusFormUrlInput = formData.get('statusFormUrl')
    const statusFormEntryId = formData.get('statusFormEntryId')
    
    if (sheetsUrl) saveGoogleSheetsUrl(sheetsUrl)
    if (formUrl) saveGoogleFormUrl(formUrl)
    if (statusGid) saveStatusSheetGid(statusGid.trim() || null)
    if (statusFormUrlInput) saveStatusFormUrl(statusFormUrlInput.trim())
    if (statusFormEntryId) localStorage.setItem('statusFormEntryId', statusFormEntryId.trim())
    
    setShowSetup(false)
    alert('Configuration saved!')
  }

  // Use activeQueue from context (already filtered and sorted)
  const waitingQueue = activeQueue

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
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 12,
      },
    },
  }

  const getPepperIcon = (pepper) => {
    const levels = {
      'no-pepper': 0,
      'normal': 1,
      'extra': 2
    }
    const count = levels[pepper] || 0
    return Array(count + 1).fill(0).map((_, i) => (
      <FaPepperHot key={i} className="pepper-icon-small" />
    ))
  }

  const getPortionIcon = (portion) => {
    return portion === 'kids' ? <FaChild className="portion-icon-small" /> : <FaUtensils className="portion-icon-small" />
  }

  return (
    <div className="admin-screen">
      <div className="container">
        <motion.div
          className="admin-content glass-card"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.button
            className="back-btn"
            onClick={() => navigate('/queue')}
            whileHover={{ x: -5 }}
            whileTap={{ scale: 0.95 }}
            variants={itemVariants}
          >
            ← Back to Queue
          </motion.button>
          
          <motion.h2
            variants={itemVariants}
            className="admin-title"
          >
            <FaCog className="title-icon" />
            Admin Dashboard
            <FaCog className="title-icon" />
          </motion.h2>

          <AnimatePresence mode="wait">
            {showSetup ? (
              <motion.div
                className="setup-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                variants={itemVariants}
              >
                <h3>
                  <FaCog className="icon-inline" />
                  Initial Setup
                </h3>
                <p className="setup-note">
                  Configure your Google Forms and Sheets URLs. See README for detailed instructions.
                </p>
                <form onSubmit={handleSetupSubmit} className="setup-form">
                  <div className="form-group">
                    <label htmlFor="sheetsUrl">
                      <FaTable className="label-icon" />
                      Google Sheets URL (for reading queue data):
                    </label>
                    <input
                      type="url"
                      id="sheetsUrl"
                      name="sheetsUrl"
                      placeholder="https://docs.google.com/spreadsheets/d/..."
                      defaultValue={googleSheetsUrl}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="formUrl">
                      <FaFileAlt className="label-icon" />
                      Google Form URL (for submissions):
                    </label>
                    <input
                      type="url"
                      id="formUrl"
                      name="formUrl"
                      placeholder="https://docs.google.com/forms/d/..."
                      defaultValue={googleFormUrl}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="statusGid">
                      <FaCog className="label-icon" />
                      Status Sheet GID (for cross-device sync):
                    </label>
                    <input
                      type="text"
                      id="statusGid"
                      name="statusGid"
                      placeholder="373003429"
                      defaultValue={statusSheetGid || '373003429'}
                      className="form-input"
                    />
                    <small style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', display: 'block', marginTop: '5px' }}>
                      GID from your Status sheet tab URL (e.g., #gid=373003429)
                    </small>
                  </div>
                  <motion.button
                    type="submit"
                    className="btn-primary"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <FaCheckCircle className="icon-inline" />
                    Save Configuration
                  </motion.button>
                  <motion.button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setShowSetup(false)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Skip for Now
                  </motion.button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="admin-controls"
                  variants={itemVariants}
                >
                  <div className="control-group">
                    <label htmlFor="current-serving-input" className="control-label">
                      <FaCrosshairs className="label-icon" />
                      Current Serving Number:
                    </label>
                    <div className="input-group">
                      <motion.input
                        type="text"
                        id="current-serving-input"
                        value={servingInput}
                        onChange={(e) => setServingInput(e.target.value.toUpperCase())}
                        placeholder="SU-000"
                        maxLength={6}
                        className="form-input"
                        whileFocus={{ scale: 1.02 }}
                      />
                      <motion.button
                        className="btn-primary"
                        onClick={handleUpdateServing}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        style={{ width: 'auto', padding: '12px 24px', fontSize: '14px' }}
                      >
                        Update
                      </motion.button>
                    </div>
                  </div>
                  
                  <div className="control-group">
                    <motion.button
                      className="btn-secondary"
                      onClick={handleIncrement}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <FaArrowRight className="icon-inline" />
                      Next Customer
                      <FaArrowRight className="icon-inline" />
                    </motion.button>
                    <motion.button
                      className="btn-danger"
                      onClick={handleReset}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <FaRedo className="icon-inline" />
                      Reset Queue
                    </motion.button>
                  </div>

                  <div className="control-group">
                    <motion.button
                      className="btn-link"
                      onClick={() => setShowSetup(true)}
                      whileHover={{ scale: 1.05 }}
                    >
                      <FaCog className="icon-inline" />
                      Configure Google Sheets/Forms
                    </motion.button>
                  </div>
                </motion.div>

                <motion.div
                  className="queue-list-section"
                  variants={itemVariants}
                >
                  <h3>
                    <FaList className="section-icon" />
                    Queue List ({waitingQueue.length} waiting)
                  </h3>
                  <div className="queue-list">
                    <AnimatePresence>
                      {waitingQueue.length === 0 ? (
                        <motion.p
                          className="empty-queue"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <HiSparkles className="icon-inline" />
                          No one in queue
                          <HiSparkles className="icon-inline" />
                        </motion.p>
                      ) : (
                        waitingQueue.map((item, index) => {
                          return (
                            <motion.div
                              key={item.queueNumber}
                              className="queue-item"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                              transition={{ delay: index * 0.05 }}
                              whileHover={{ scale: 1.02, x: 5 }}
                            >
                              <div className="queue-item-info">
                                <div className="queue-item-number">{item.queueNumber}</div>
                                <div className="queue-item-details">
                                  {item.name} • {getPepperIcon(item.pepper)} {item.pepper} • {getPortionIcon(item.portion)} {item.portion}
                                </div>
                              </div>
                              <motion.div
                                className="queue-item-status waiting"
                                animate={{
                                  scale: [1, 1.1, 1],
                                }}
                                transition={{
                                  duration: 2,
                                  repeat: Infinity,
                                  ease: 'easeInOut',
                                }}
                              >
                                Waiting
                              </motion.div>
                            </motion.div>
                          )
                        })
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}

export default Admin
