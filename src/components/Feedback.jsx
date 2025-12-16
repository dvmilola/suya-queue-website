import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useQueue } from '../context/QueueContext'
import { 
  FaStar, 
  FaSmile, 
  FaMeh, 
  FaFrown,
  FaCheckCircle,
  FaArrowRight,
  FaSpinner,
  FaHeart
} from 'react-icons/fa'
import { HiSparkles } from 'react-icons/hi'
import './Feedback.css'

function Feedback() {
  const navigate = useNavigate()
  const { userQueueNumber, googleFormUrl } = useQueue()
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [selectedTags, setSelectedTags] = useState([])

  const tags = [
    { id: 'fast', label: 'Fast Service', icon: FaArrowRight },
    { id: 'friendly', label: 'Friendly Staff', icon: FaSmile },
    { id: 'tasty', label: 'Great Taste', icon: FaHeart },
    { id: 'fresh', label: 'Fresh Ingredients', icon: FaCheckCircle },
    { id: 'value', label: 'Great Value', icon: FaStar }
  ]

  const toggleTag = (tagId) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (rating === 0) {
      alert('Please select a rating!')
      return
    }

    setSubmitting(true)

    try {
      // Store feedback in localStorage (we can add Google Forms integration later)
      const feedbackData = {
        queueNumber: userQueueNumber,
        rating,
        feedback,
        tags: selectedTags,
        timestamp: new Date().toISOString()
      }

      const existingFeedback = JSON.parse(localStorage.getItem('feedbackData') || '[]')
      existingFeedback.push(feedbackData)
      localStorage.setItem('feedbackData', JSON.stringify(existingFeedback))

      console.log('Feedback submitted:', feedbackData)
      
      // Show success animation
      setTimeout(() => {
        setSubmitted(true)
      }, 500)
    } catch (error) {
      console.error('Error submitting feedback:', error)
      alert('Error submitting feedback. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const getRatingEmoji = (rating) => {
    if (rating >= 4) return <FaSmile className="rating-emoji" />
    if (rating === 3) return <FaMeh className="rating-emoji" />
    return <FaFrown className="rating-emoji" />
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

  if (submitted) {
    return (
      <div className="feedback-screen">
        <div className="container">
          <motion.div
            className="feedback-content glass-card"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ 
                type: 'spring', 
                stiffness: 300, 
                damping: 20,
                delay: 0.2 
              }}
            >
              <FaCheckCircle className="success-icon" />
            </motion.div>
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Thank You!
            </motion.h2>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Your feedback helps us serve you better!
            </motion.p>
            <motion.button
              className="btn-primary"
              onClick={() => navigate('/')}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaArrowRight className="icon-inline" />
              Back to Home
              <FaArrowRight className="icon-inline" />
            </motion.button>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="feedback-screen">
      <div className="container">
        <motion.div
          className="feedback-content glass-card"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <h2 className="feedback-title">
              <HiSparkles className="title-icon" />
              How was your Suya Experience?
              <HiSparkles className="title-icon" />
            </h2>
            <p className="feedback-subtitle">
              Your feedback helps us improve!
            </p>
          </motion.div>

          <form onSubmit={handleSubmit}>
            <motion.div
              className="rating-section"
              variants={itemVariants}
            >
              <label className="rating-label">
                Rate your experience <span className="required">*</span>
              </label>
              <div className="stars-container">
                {[1, 2, 3, 4, 5].map((star) => (
                  <motion.button
                    key={star}
                    type="button"
                    className="star-button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    whileHover={{ scale: 1.2, rotate: 15 }}
                    whileTap={{ scale: 0.9 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: star * 0.1 }}
                  >
                    <FaStar
                      className={`star-icon ${
                        star <= (hoveredRating || rating) ? 'filled' : ''
                      }`}
                    />
                  </motion.button>
                ))}
              </div>
              {rating > 0 && (
                <motion.div
                  className="rating-emoji-container"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  {getRatingEmoji(rating)}
                  <span className="rating-text">
                    {rating === 5 && 'Excellent!'}
                    {rating === 4 && 'Great!'}
                    {rating === 3 && 'Good'}
                    {rating === 2 && 'Okay'}
                    {rating === 1 && 'Needs Improvement'}
                  </span>
                </motion.div>
              )}
            </motion.div>

            <motion.div
              className="tags-section"
              variants={itemVariants}
            >
              <label className="tags-label">
                What did you like? (Optional)
              </label>
              <div className="tags-container">
                {tags.map((tag) => {
                  const Icon = tag.icon
                  const isSelected = selectedTags.includes(tag.id)
                  return (
                    <motion.button
                      key={tag.id}
                      type="button"
                      className={`tag-button ${isSelected ? 'selected' : ''}`}
                      onClick={() => toggleTag(tag.id)}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: tag.id.charCodeAt(0) * 0.02 }}
                    >
                      <Icon className="tag-icon" />
                      {tag.label}
                    </motion.button>
                  )
                })}
              </div>
            </motion.div>

            <motion.div
              className="feedback-section"
              variants={itemVariants}
            >
              <label htmlFor="feedback-text" className="feedback-label">
                Additional Comments (Optional)
              </label>
              <motion.textarea
                id="feedback-text"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Tell us more about your experience..."
                className="feedback-textarea"
                rows="4"
                whileFocus={{ scale: 1.02 }}
              />
            </motion.div>

            <motion.button
              type="submit"
              className="btn-primary submit-feedback-btn"
              disabled={submitting || rating === 0}
              variants={itemVariants}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              {submitting ? (
                <span className="button-content">
                  <FaSpinner className="icon-spin" />
                  Submitting...
                </span>
              ) : (
                <span className="button-content">
                  <FaCheckCircle className="icon-inline" />
                  Submit Feedback
                  <FaCheckCircle className="icon-inline" />
                </span>
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  )
}

export default Feedback

