import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Welcome from './components/Welcome'
import Registration from './components/Registration'
import QueueStatus from './components/QueueStatus'
import Trivia from './components/Trivia'
import Admin from './components/Admin'
import Feedback from './components/Feedback'
import { QueueProvider } from './context/QueueContext'

function App() {
  return (
    <QueueProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/register" element={<Registration />} />
          <Route path="/queue" element={<QueueStatus />} />
          <Route path="/trivia" element={<Trivia />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </QueueProvider>
  )
}

export default App

