import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FaCheckCircle, FaTimesCircle, FaTrophy, FaRedo, FaQuestionCircle } from 'react-icons/fa'
import { getRandomQuestions } from '../data/triviaQuestions'
import './Trivia.css'

function Trivia() {
  const navigate = useNavigate()
  const [triviaQuestions, setTriviaQuestions] = useState(() => getRandomQuestions(10))
  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [gameComplete, setGameComplete] = useState(false)

  const currentQuestion = triviaQuestions[currentIndex]

  const handleAnswer = (index) => {
    if (showFeedback) return

    setSelectedAnswer(index)
    setShowFeedback(true)

    if (index === currentQuestion.correct) {
      setScore(prev => prev + 1)
    }

    setTimeout(() => {
      if (currentIndex < triviaQuestions.length - 1) {
        setCurrentIndex(prev => prev + 1)
        setSelectedAnswer(null)
        setShowFeedback(false)
      } else {
        setGameComplete(true)
      }
    }, 2000)
  }

  const resetGame = () => {
    // Get new random questions for each game
    setTriviaQuestions(getRandomQuestions(10))
    setCurrentIndex(0)
    setScore(0)
    setSelectedAnswer(null)
    setShowFeedback(false)
    setGameComplete(false)
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

  if (gameComplete) {
    const percentage = (score / triviaQuestions.length) * 100
    const isPerfect = score === triviaQuestions.length
    const isGreat = percentage >= 60

    return (
      <div className="trivia-screen">
        <div className="container">
          <motion.div
            className="trivia-content glass-card"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 100, damping: 15 }}
          >
            <motion.button
              className="back-btn"
              onClick={() => navigate('/queue')}
              whileHover={{ x: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              ← Back to Queue
            </motion.button>
            
            <motion.div
              className="trivia-results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <motion.h2
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              >
                <FaTrophy className="icon-inline" />
                Trivia Complete!
                <FaTrophy className="icon-inline" />
              </motion.h2>
              
              <motion.div
                className="final-score"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 150, damping: 15, delay: 0.2 }}
              >
                <motion.p
                  className="score-number"
                  animate={{
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    repeatDelay: 1,
                  }}
                >
                  {score} / {triviaQuestions.length}
                </motion.p>
                <motion.p
                  className="score-message"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  {isPerfect
                    ? (
                      <>
                        <FaTrophy className="icon-inline" />
                        Perfect score! You're a Christmas expert!
                        <FaTrophy className="icon-inline" />
                      </>
                    )
                    : isGreat
                      ? 'Great job! You know your Christmas!'
                      : 'Keep practicing! The spirit is with you!'}
                </motion.p>
                <motion.div
                  className="score-percentage"
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 1, delay: 0.6, ease: 'easeOut' }}
                />
              </motion.div>
              
              <motion.button
                className="btn-primary"
                onClick={resetGame}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaRedo className="icon-inline" />
                Play Again
                <FaRedo className="icon-inline" />
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="trivia-screen">
      <div className="container">
        <motion.div
          className="trivia-content glass-card"
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
            className="trivia-title"
          >
            <FaQuestionCircle className="icon-inline" />
            Christmas Trivia
            <FaQuestionCircle className="icon-inline" />
          </motion.h2>
          
          <motion.div
            className="trivia-container"
            variants={itemVariants}
          >
            <motion.div
              className="trivia-progress"
              key={`progress-${currentIndex}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              Question {currentIndex + 1} of {triviaQuestions.length}
              <motion.div
                className="progress-bar"
                initial={{ width: 0 }}
                animate={{ width: `${((currentIndex + 1) / triviaQuestions.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </motion.div>

            <motion.div
              className="trivia-question"
              key={`question-${currentIndex}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 100, damping: 12 }}
            >
              <p>{currentQuestion.question}</p>
            </motion.div>
            
            <div className="trivia-options">
              {currentQuestion.options.map((option, index) => {
                let className = 'trivia-option'
                if (showFeedback) {
                  if (index === currentQuestion.correct) {
                    className += ' correct'
                  } else if (index === selectedAnswer && index !== currentQuestion.correct) {
                    className += ' incorrect'
                  } else {
                    className += ' disabled'
                  }
                }

                return (
                  <motion.button
                    key={`question-${currentIndex}-option-${index}`}
                    className={className}
                    onClick={() => handleAnswer(index)}
                    disabled={showFeedback}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, type: 'spring', stiffness: 100 }}
                    whileHover={!showFeedback ? { scale: 1.05, x: 5 } : {}}
                    whileTap={!showFeedback ? { scale: 0.95 } : {}}
                  >
                    {option}
                  </motion.button>
                )
              })}
            </div>
            
            <AnimatePresence>
              {showFeedback && (
                <motion.div
                  key={`feedback-${currentIndex}`}
                  className={`trivia-feedback ${selectedAnswer === currentQuestion.correct ? 'correct' : 'incorrect'}`}
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                >
                  {selectedAnswer === currentQuestion.correct
                    ? (
                      <>
                        <FaCheckCircle className="icon-inline" />
                        Correct! Well done!
                      </>
                    )
                    : (
                      <>
                        <FaTimesCircle className="icon-inline" />
                        Not quite. Try the next one!
                      </>
                    )}
                </motion.div>
              )}
            </AnimatePresence>
            
            <motion.div
              className="trivia-score"
              key={`score-${score}-${currentIndex}`}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <p>
                Score: <span className="score-value">{score}</span> / {triviaQuestions.length}
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

export default Trivia
