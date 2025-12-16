import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const QueueContext = createContext()

export function QueueProvider({ children }) {
  const [currentServing, setCurrentServing] = useState(() => {
    return localStorage.getItem('currentServing') || 'SU-000'
  })
  const [queueData, setQueueData] = useState([])
  const [userQueueNumber, setUserQueueNumber] = useState(() => {
    return localStorage.getItem('userQueueNumber') || null
  })
  const [googleSheetsUrl, setGoogleSheetsUrl] = useState(() => {
    return localStorage.getItem('googleSheetsUrl') || ''
  })
  const [googleFormUrl, setGoogleFormUrl] = useState(() => {
    return localStorage.getItem('googleFormUrl') || ''
  })

  // Compute active queue (filter out served customers)
  // Only show customers whose queue number is greater than currentServing
  const activeQueue = queueData.filter(item => {
    const itemNum = parseInt(item.queueNumber.replace('SU-', ''))
    const servingNum = parseInt(currentServing.replace('SU-', ''))
    return itemNum > servingNum
  }).sort((a, b) => {
    // Sort by queue number to maintain order
    const aNum = parseInt(a.queueNumber.replace('SU-', ''))
    const bNum = parseInt(b.queueNumber.replace('SU-', ''))
    return aNum - bNum
  })

  // Extract sheet ID and gid from Google Sheets URL
  const extractSheetId = (url) => {
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)
    return match ? match[1] : null
  }
  
  // Extract gid (tab ID) from Google Sheets URL if present
  const extractGid = (url) => {
    const gidMatch = url.match(/[#&]gid=(\d+)/)
    return gidMatch ? gidMatch[1] : '0' // Default to 0 if not found
  }

  // Simple CSV parser
  const parseCSV = (text) => {
    const lines = text.split('\n')
    return lines.map(line => {
      const result = []
      let current = ''
      let inQuotes = false

      for (let i = 0; i < line.length; i++) {
        const char = line[i]
        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim())
          current = ''
        } else {
          current += char
        }
      }
      result.push(current.trim())
      return result
    }).filter(row => row.some(cell => cell))
  }

  // Load queue data from Google Sheets or localStorage
  const fetchQueueData = useCallback(async () => {
    // Try Google Sheets first
    if (googleSheetsUrl) {
      try {
        // Convert Google Sheets URL to CSV export URL
        const sheetId = extractSheetId(googleSheetsUrl)
        const gid = extractGid(googleSheetsUrl) // Get gid from URL if present
        if (sheetId) {
          const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`
          
          const response = await fetch(csvUrl)
          
          if (!response.ok) {
            // 400 errors usually mean the sheet isn't public or URL is wrong
            if (response.status === 400) {
              throw new Error('Sheet is not public or URL is incorrect. Please make the sheet public (Share → Anyone with link → Viewer). See TROUBLESHOOTING_400_ERROR.md for help.')
            }
            throw new Error(`HTTP error! status: ${response.status}`)
          }
          
          const csvText = await response.text()
          
          // Check if we got an error page instead of CSV
          if (csvText.includes('<!DOCTYPE html>') || csvText.includes('<html') || csvText.includes('Sign in')) {
            throw new Error('Sheet is not public. Please make it public (Share → Anyone with link → Viewer). See TROUBLESHOOTING_400_ERROR.md for help.')
          }
          
          // Check if CSV is empty or just headers
          if (!csvText || csvText.trim().length === 0) {
            console.log('CSV is empty - no data yet')
            setQueueData([])
            return
          }
          
          const rows = parseCSV(csvText)
          
          if (rows.length > 1) {
            // Skip header row - Google Forms typically has: Timestamp, Name, Pepper Level, Portion Type
            // But we'll be flexible with column order
            const headerRow = rows[0]
            
            // Find column indices (case-insensitive search)
            const findColumnIndex = (searchTerms) => {
              for (let i = 0; i < headerRow.length; i++) {
                const header = headerRow[i].toLowerCase()
                if (searchTerms.some(term => header.includes(term))) {
                  return i
                }
              }
              return null
            }
            
            const timestampIndex = findColumnIndex(['timestamp', 'time', 'date']) ?? 0
            const nameIndex = findColumnIndex(['name', 'nickname']) ?? 1
            const pepperIndex = findColumnIndex(['pepper', 'spice']) ?? 2
            const portionIndex = findColumnIndex(['portion', 'size', 'type']) ?? 3
            
            const data = rows.slice(1).map((row, index) => {
              // Normalize pepper values
              let pepper = (row[pepperIndex] || '').toLowerCase()
              if (pepper.includes('no') || pepper === 'no pepper') {
                pepper = 'no-pepper'
              } else if (pepper.includes('extra')) {
                pepper = 'extra'
              } else {
                pepper = 'normal'
              }
              
              // Normalize portion values
              let portion = (row[portionIndex] || 'regular').toLowerCase()
              if (portion.includes('kid') || portion.includes('child')) {
                portion = 'kids'
              } else {
                portion = 'regular'
              }
              
              return {
                number: index + 1,
                queueNumber: `SU-${String(index + 1).padStart(3, '0')}`,
                timestamp: row[timestampIndex] || '',
                name: row[nameIndex] || 'Guest',
                pepper: pepper,
                portion: portion
              }
            })
            
            setQueueData(data)
            console.log(`Loaded ${data.length} queue items from Google Sheets`)
            return
          }
        }
      } catch (error) {
        console.warn('Error fetching from Google Sheets, using localStorage:', error)
        console.warn('Error details:', error.message)
      }
    }
    
    // Fallback to localStorage
    try {
      const localQueue = JSON.parse(localStorage.getItem('localQueue') || '[]')
      const data = localQueue.map((item, index) => ({
        number: index + 1,
        queueNumber: item.queueNumber || `SU-${String(index + 1).padStart(3, '0')}`,
        timestamp: item.timestamp || '',
        name: item.name || 'Guest',
        pepper: item.pepper || 'normal',
        portion: item.portion || 'regular'
      }))
      setQueueData(data)
      console.log(`Loaded ${data.length} queue items from localStorage`)
    } catch (error) {
      console.error('Error loading from localStorage:', error)
    }
  }, [googleSheetsUrl])

  // Poll Google Sheets every 3 seconds for real-time updates
  useEffect(() => {
    if (googleSheetsUrl) {
      fetchQueueData()
      const interval = setInterval(fetchQueueData, 3000) // Reduced from 8s to 3s for faster updates
      return () => clearInterval(interval)
    } else {
      // If no Google Sheets URL, load from localStorage once
      fetchQueueData()
    }
  }, [googleSheetsUrl, fetchQueueData])

  // Poll currentServing from localStorage every 2 seconds for real-time updates
  // This allows cross-tab synchronization within the same browser
  useEffect(() => {
    const checkCurrentServing = () => {
      const storedServing = localStorage.getItem('currentServing') || 'SU-000'
      if (storedServing !== currentServing) {
        setCurrentServing(storedServing)
      }
    }
    
    // Check immediately
    checkCurrentServing()
    
    // Then check every 2 seconds
    const interval = setInterval(checkCurrentServing, 2000)
    return () => clearInterval(interval)
  }, [currentServing])

  // Listen for storage events (for cross-tab updates in same browser)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'currentServing' && e.newValue) {
        setCurrentServing(e.newValue)
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const updateCurrentServing = (number) => {
    setCurrentServing(number)
    localStorage.setItem('currentServing', number)
  }

  const saveUserQueueNumber = (number) => {
    setUserQueueNumber(number)
    localStorage.setItem('userQueueNumber', number)
  }

  const saveGoogleSheetsUrl = (url) => {
    setGoogleSheetsUrl(url)
    localStorage.setItem('googleSheetsUrl', url)
  }

  const saveGoogleFormUrl = (url) => {
    setGoogleFormUrl(url)
    localStorage.setItem('googleFormUrl', url)
  }

  const resetQueue = () => {
    setCurrentServing('SU-000')
    setQueueData([])
    setUserQueueNumber(null)
    localStorage.removeItem('userQueueNumber')
    localStorage.removeItem('currentServing')
    localStorage.removeItem('localQueue')
  }

  return (
    <QueueContext.Provider
      value={{
        currentServing,
        queueData, // Full queue data (all entries from Google Sheets)
        activeQueue, // Filtered queue (only waiting customers)
        userQueueNumber,
        googleSheetsUrl,
        googleFormUrl,
        updateCurrentServing,
        saveUserQueueNumber,
        saveGoogleSheetsUrl,
        saveGoogleFormUrl,
        resetQueue,
        fetchQueueData
      }}
    >
      {children}
    </QueueContext.Provider>
  )
}

export function useQueue() {
  const context = useContext(QueueContext)
  if (!context) {
    throw new Error('useQueue must be used within QueueProvider')
  }
  return context
}

