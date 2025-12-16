import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useQueue } from '../context/QueueContext'
import { FaBell, FaGamepad, FaCheckCircle, FaStar, FaSpinner } from 'react-icons/fa'
import { HiSparkles } from 'react-icons/hi'
import './QueueStatus.css'

function QueueStatus() {
  const navigate = useNavigate()
  const { userQueueNumber, currentServing, activeQueue, queueData, fetchQueueData } = useQueue()
  const [hasPlayedSound, setHasPlayedSound] = useState(false)
  const previousServingRef = useRef(currentServing)
  
  // Track loading timeout for error handling - MUST be declared before any conditional returns
  const [loadingTimeout, setLoadingTimeout] = useState(false)
  const [loadingStartTime] = useState(() => Date.now())
  
  // Force re-render when userQueueNumber is assigned - MUST be declared before any conditional returns
  const [renderKey, setRenderKey] = useState(0)

  // Generate notification sound using Web Audio API
  // Note: Audio file support removed since file doesn't exist - using Web Audio API directly
  const playNotificationSound = async () => {
    // Use Web Audio API directly (more reliable, no file needed)
    playWebAudioSound()
  }

  // Web Audio API fallback
  const playWebAudioSound = async () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext
      const audioContext = new AudioContext()
      
      // Resume audio context if suspended (required by browser autoplay policy)
      if (audioContext.state === 'suspended') {
        console.log('Resuming audio context...')
        await audioContext.resume()
        console.log('Audio context resumed, state:', audioContext.state)
      }
      
      // Create a more noticeable notification sound (bell-like chime)
      const oscillator1 = audioContext.createOscillator()
      const oscillator2 = audioContext.createOscillator()
      const oscillator3 = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator1.connect(gainNode)
      oscillator2.connect(gainNode)
      oscillator3.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      // Create a pleasant three-tone chime (like a bell)
      const now = audioContext.currentTime
      
      // First tone (low)
      oscillator1.frequency.setValueAtTime(523.25, now) // C5
      oscillator1.type = 'sine'
      
      // Second tone (middle)
      oscillator2.frequency.setValueAtTime(659.25, now) // E5
      oscillator2.type = 'sine'
      
      // Third tone (high)
      oscillator3.frequency.setValueAtTime(783.99, now) // G5
      oscillator3.type = 'sine'
      
      // Volume envelope - louder and more noticeable
      gainNode.gain.setValueAtTime(0, now)
      gainNode.gain.linearRampToValueAtTime(0.6, now + 0.01) // Louder
      gainNode.gain.exponentialRampToValueAtTime(0.3, now + 0.2)
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.8)
      
      // Start oscillators
      oscillator1.start(now)
      oscillator2.start(now)
      oscillator3.start(now)
      
      // Stop oscillators
      oscillator1.stop(now + 0.8)
      oscillator2.stop(now + 0.8)
      oscillator3.stop(now + 0.8)
      
      // Play a second chime after a short delay for emphasis
      setTimeout(() => {
        try {
          const now2 = audioContext.currentTime
          const osc1 = audioContext.createOscillator()
          const osc2 = audioContext.createOscillator()
          const gain = audioContext.createGain()
          
          osc1.connect(gain)
          osc2.connect(gain)
          gain.connect(audioContext.destination)
          
          osc1.frequency.setValueAtTime(659.25, now2) // E5
          osc2.frequency.setValueAtTime(783.99, now2) // G5
          osc1.type = 'sine'
          osc2.type = 'sine'
          
          gain.gain.setValueAtTime(0, now2)
          gain.gain.linearRampToValueAtTime(0.5, now2 + 0.01)
          gain.gain.exponentialRampToValueAtTime(0.01, now2 + 0.5)
          
          osc1.start(now2)
          osc2.start(now2)
          osc1.stop(now2 + 0.5)
          osc2.stop(now2 + 0.5)
        } catch (e) {
          console.log('Second chime failed:', e)
        }
      }, 300)
      
    } catch (error) {
      console.log('Could not play notification sound:', error)
    }
  }

  useEffect(() => {
    // Check if there's a pending submission - wait for it to be matched
    const pendingSubmission = sessionStorage.getItem('pendingSubmission')
    
    if (!userQueueNumber) {
      // If there's a pending submission, don't redirect immediately
      // Give time for the form submission to appear in Google Sheets and be matched
      if (pendingSubmission) {
        console.log('⏳ Pending submission found, waiting for queue number assignment...')
        // Fetch queue data to trigger matching
        fetchQueueData()
        // Set up polling to keep trying to match
        const interval = setInterval(() => {
          fetchQueueData()
        }, 3000)
        return () => clearInterval(interval)
      } else {
        // No pending submission and no queue number - redirect to registration
        navigate('/register')
        return
      }
    }

    // User has queue number - proceed normally
    // Initial fetch
    fetchQueueData()
    
    // Set up polling interval - reduced to 3 seconds for real-time updates
    const interval = setInterval(() => {
      fetchQueueData()
    }, 3000)
    
    return () => clearInterval(interval)
  }, [userQueueNumber, navigate, fetchQueueData])

  // Check if it's user's turn and play sound
  useEffect(() => {
    if (!userQueueNumber) return
    
    const isUserTurn = userQueueNumber === currentServing
    const wasUserTurn = previousServingRef.current === userQueueNumber
    const servingChanged = currentServing !== previousServingRef.current
    
    console.log('Notification check:', {
      isUserTurn,
      wasUserTurn,
      servingChanged,
      currentServing,
      userQueueNumber,
      hasPlayedSound
    })
    
    // Play sound when it becomes user's turn (not if it was already their turn)
    if (isUserTurn && !wasUserTurn && servingChanged) {
      console.log('🎵 Playing notification sound - It\'s your turn!')
      playNotificationSound()
      setHasPlayedSound(true)
      
      // Show browser notification if permitted
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Your Turn!', {
          body: `Queue number ${userQueueNumber} - Please come forward!`,
          icon: '/assets/Screenshot 2025-12-15 at 21.41.07.png',
          badge: '/assets/Screenshot 2025-12-15 at 21.41.07.png',
          tag: 'queue-turn', // Prevent duplicate notifications
          requireInteraction: false
        })
      }
    }
    
    // Reset sound flag when serving number changes (so it can play again if needed)
    if (servingChanged) {
      previousServingRef.current = currentServing
      // Reset hasPlayedSound if we're no longer the current serving
      if (!isUserTurn) {
        setHasPlayedSound(false)
      }
    }
  }, [currentServing, userQueueNumber, hasPlayedSound])

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  // If there's a pending submission but no userQueueNumber yet, show loading state
  const pendingSubmission = sessionStorage.getItem('pendingSubmission')
  
  // Set timeout for loading state (30 seconds) - MUST be before conditional returns
  useEffect(() => {
    if (!userQueueNumber && pendingSubmission) {
      const timeout = setTimeout(() => {
        const elapsed = Date.now() - loadingStartTime
        if (elapsed >= 30000) { // 30 seconds
          console.warn('⚠️ Loading timeout: Queue number not found after 30 seconds')
          setLoadingTimeout(true)
        }
      }, 30000)
      
      return () => clearTimeout(timeout)
    } else {
      setLoadingTimeout(false)
    }
  }, [userQueueNumber, pendingSubmission, loadingStartTime])
  
  // Force re-render when userQueueNumber is assigned - MUST be before conditional returns
  useEffect(() => {
    if (userQueueNumber) {
      console.log('🔄 QueueStatus: User queue number assigned, triggering re-render')
      // Trigger immediate re-render
      setRenderKey(prev => prev + 1)
      // Also trigger after a delay to ensure activeQueue is fully updated
      const timer1 = setTimeout(() => {
        setRenderKey(prev => prev + 1)
      }, 300)
      const timer2 = setTimeout(() => {
        setRenderKey(prev => prev + 1)
      }, 800)
      return () => {
        clearTimeout(timer1)
        clearTimeout(timer2)
      }
    }
  }, [userQueueNumber])
  
  // Calculate values needed for rendering - MUST be before conditional returns
  const userInActiveQueue = userQueueNumber ? activeQueue.find(item => item.queueNumber === userQueueNumber) : null
  // Find user's entry in full queue data to get their name
  const userEntry = userQueueNumber ? queueData.find(item => item.queueNumber === userQueueNumber) : null
  const userName = userEntry?.name || 'Guest'
  const userPosition = userInActiveQueue ? activeQueue.findIndex(item => item.queueNumber === userQueueNumber) + 1 : 0
  const isUserTurn = userQueueNumber === currentServing
  const isUserNext = userPosition > 0 && userPosition <= activeQueue.length
  const currentNum = parseInt(currentServing.replace('SU-', ''))
  const userNum = userQueueNumber ? parseInt(userQueueNumber.replace('SU-', '')) : 0
  const peopleAhead = Math.max(0, userNum - currentNum - 1)
  const userHasBeenServed = userQueueNumber ? (!isUserTurn && userNum <= currentNum) : false
  
  // Debug logging - MUST be before conditional returns
  useEffect(() => {
    if (userQueueNumber) {
      console.log('🎮 QueueStatus Debug:')
      console.log('  userQueueNumber:', userQueueNumber)
      console.log('  currentServing:', currentServing)
      console.log('  userNum:', userNum, 'currentNum:', currentNum)
      console.log('  userInActiveQueue:', userInActiveQueue)
      console.log('  isUserTurn:', isUserTurn)
      console.log('  userHasBeenServed:', userHasBeenServed)
      console.log('  activeQueue length:', activeQueue.length)
      console.log('  Should show entertainment?', !userHasBeenServed)
    }
  }, [userQueueNumber, currentServing, userInActiveQueue, isUserTurn, userHasBeenServed, activeQueue.length, userNum, currentNum])
  
  if (!userQueueNumber && !pendingSubmission) {
    // No queue number and no pending submission - should redirect to register
    // (handled in useEffect, but return null here to prevent flash)
    return null
  }

  // Show loading state if we have a pending submission but no queue number yet
  if (!userQueueNumber && pendingSubmission) {
    return (
      <div className="queue-screen">
        <div className="container">
          <motion.div
            className="queue-content glass-card"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {loadingTimeout ? (
              <>
                <h2 className="queue-title">
                  <FaBell className="title-decoration" />
                  Having Trouble?
                  <FaBell className="title-decoration" />
                </h2>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    textAlign: 'center',
                    padding: '20px'
                  }}
                >
                  <p className="status-message" style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '20px', fontSize: '16px' }}>
                    We're having trouble retrieving your queue number.
                    <br />
                    <br />
                    Please try refreshing the page.
                  </p>
                  <motion.button
                    className="btn-primary"
                    onClick={() => window.location.reload()}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      marginTop: '15px',
                      padding: '14px 28px',
                      fontSize: '16px'
                    }}
                  >
                    <FaSpinner className="icon-inline" />
                    Refresh Page
                    <FaSpinner className="icon-inline" />
                  </motion.button>
                </motion.div>
              </>
            ) : (
              <>
                <h2 className="queue-title">
                  <FaBell className="title-decoration" />
                  Getting Your Queue Number...
                  <FaBell className="title-decoration" />
                </h2>
                <motion.div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    margin: '30px auto'
                  }}
                >
                  <FaSpinner 
                    className="icon-spin"
                    style={{
                      fontSize: '60px',
                      color: '#ffd700'
                    }}
                  />
                </motion.div>
                <p className="status-message" style={{ textAlign: 'center', color: 'rgba(255,255,255,0.8)' }}>
                  Please wait while we retrieve your queue number from Google Sheets.
                  <br />
                  This may take a few moments...
                </p>
              </>
            )}
          </motion.div>
        </div>
      </div>
    )
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15,
      },
    },
  }

  const numberVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        type: 'spring',
        stiffness: 200,
        damping: 15,
      },
    },
    pulse: {
      scale: [1, 1.1, 1],
      transition: {
        duration: 0.5,
        repeat: Infinity,
        repeatDelay: 2,
      },
    },
  }

  return (
    <div className="queue-screen">
      <div className="container">
        <motion.div
          className="queue-content glass-card"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            className="queue-header"
            variants={itemVariants}
          >
            <motion.img
              src="/assets/Screenshot 2025-12-15 at 21.41.07.png"
              alt="Suya"
              className="header-image"
              onError={(e) => {
                e.target.style.display = 'none'
              }}
              whileHover={{ scale: 1.05, rotate: 2 }}
              transition={{ type: 'spring', stiffness: 300 }}
            />
            <h2 className="queue-title">
              <FaBell className="title-decoration" />
              Your Queue Status
              <FaBell className="title-decoration" />
            </h2>
          </motion.div>
          
          <motion.div
            className={`queue-card ${isUserTurn ? 'active-turn' : ''}`}
            variants={itemVariants}
            animate={isUserTurn ? {
              boxShadow: [
                '0 0 20px rgba(255, 215, 0, 0.5)',
                '0 0 40px rgba(255, 215, 0, 0.8)',
                '0 0 20px rgba(255, 215, 0, 0.5)',
              ],
            } : {}}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <div className="queue-number-display">
              <motion.span
                className="queue-label"
                variants={itemVariants}
              >
                Hi {userName}, your number is
              </motion.span>
              <motion.span
                className="queue-number"
                variants={numberVariants}
                animate={isUserTurn ? 'pulse' : ''}
              >
                {userQueueNumber}
              </motion.span>
              {isUserTurn && (
                <motion.div
                  className="turn-indicator"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                >
                  <FaCheckCircle className="icon-inline" />
                  YOUR TURN!
                  <FaCheckCircle className="icon-inline" />
                </motion.div>
              )}
            </div>
          </motion.div>

          <motion.div
            className="current-serving"
            variants={itemVariants}
          >
            <motion.span
              className="serving-label"
              animate={{
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              Now Serving
            </motion.span>
            <motion.span
              className="serving-number"
              key={currentServing}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 20,
              }}
            >
              {currentServing}
            </motion.span>
            {peopleAhead > 0 && (
              <motion.div
                className="people-ahead"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {peopleAhead} {peopleAhead === 1 ? 'person' : 'people'} ahead of you
              </motion.div>
            )}
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              key={isUserTurn ? 'turn' : userHasBeenServed ? 'served' : 'wait'}
              className={`status-message ${isUserTurn ? 'active' : ''}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <p>
                {isUserTurn 
                  ? (
                    <>
                      <FaCheckCircle className="icon-inline" />
                      It's your turn! Please come forward.
                    </>
                  )
                  : userHasBeenServed
                    ? (
                      <>
                        <FaCheckCircle className="icon-inline" />
                        You've been served! Thank you for visiting.
                      </>
                    )
                    : isUserNext && userPosition > 0
                      ? (
                        <>
                          <HiSparkles className="icon-inline" />
                          You're #{userPosition} in line. Please relax. We'll call you shortly.
                          <HiSparkles className="icon-inline" />
                        </>
                      )
                      : (
                        <>
                          <HiSparkles className="icon-inline" />
                          Please relax. We'll call you shortly.
                          <HiSparkles className="icon-inline" />
                        </>
                      )}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Always show entertainment section when waiting, feedback when served */}
          {/* Recalculate userHasBeenServed inline to ensure it's always current */}
          {(() => {
            // Recalculate with current values to ensure accuracy
            const currentUserNum = userQueueNumber ? parseInt(userQueueNumber.replace('SU-', '')) : 0
            const currentServingNum = parseInt(currentServing.replace('SU-', ''))
            const isCurrentlyTurn = userQueueNumber === currentServing
            const isCurrentlyServed = userQueueNumber ? (!isCurrentlyTurn && currentUserNum <= currentServingNum) : false
            
            // Show entertainment if user has queue number and hasn't been served
            // Default to showing entertainment if we have a queue number (safer default)
            const shouldShowEntertainment = userQueueNumber && !isCurrentlyServed
            
            return shouldShowEntertainment ? (
              <motion.div
                key={`entertainment-${renderKey}`}
                className="entertainment-section"
                variants={itemVariants}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h3>
                  <FaGamepad className="section-icon" />
                  While You Wait...
                </h3>
                <p style={{ marginBottom: '15px', color: 'rgba(255,255,255,0.8)' }}>
                  Pass the time with some fun activities!
                </p>
                <motion.button
                  className="btn-secondary"
                  onClick={() => navigate('/trivia')}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaGamepad className="icon-inline" />
                  Play Christmas Trivia
                  <FaGamepad className="icon-inline" />
                </motion.button>
                <motion.button
                  className="btn-secondary"
                  onClick={playNotificationSound}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  style={{ marginTop: '10px', fontSize: '14px', padding: '12px 20px' }}
                >
                  <FaBell className="icon-inline" />
                  Test Notification Sound
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                key={`feedback-${renderKey}`}
                className="feedback-prompt-section"
                variants={itemVariants}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h3>
                  <FaStar className="section-icon" />
                  Share Your Experience
                </h3>
                <p style={{ marginBottom: '15px', color: 'rgba(255,255,255,0.8)' }}>
                  We'd love to hear your feedback on the Suya experience!
                </p>
                <motion.button
                  className="btn-primary"
                  onClick={() => navigate('/feedback')}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaStar className="icon-inline" />
                  Rate Your Experience
                  <FaStar className="icon-inline" />
                </motion.button>
              </motion.div>
            )
          })()}
        </motion.div>
      </div>
    </div>
  )
}

export default QueueStatus
