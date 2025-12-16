import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'

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
  const [statusSheetGid, setStatusSheetGid] = useState(() => {
    return localStorage.getItem('statusSheetGid') || '373003429' // Default to user's status sheet GID
  })
  const [statusFormUrl, setStatusFormUrl] = useState(() => {
    return localStorage.getItem('statusFormUrl') || 'https://docs.google.com/forms/d/e/1FAIpQLSffuGdmjKo2RDGXzVnH6mbSYTwYmmy-j4r7mnvga8IO9TTAQQ/viewform'
  })

  // Compute active queue (filter out served customers)
  // Only show customers whose queue number is greater than currentServing
  // Use useMemo to prevent unnecessary recalculations and flickering
  const activeQueue = useMemo(() => {
    return queueData.filter(item => {
      const itemNum = parseInt(item.queueNumber.replace('SU-', ''))
      const servingNum = parseInt(currentServing.replace('SU-', ''))
      return itemNum > servingNum
    }).sort((a, b) => {
      // Sort by queue number to maintain order
      const aNum = parseInt(a.queueNumber.replace('SU-', ''))
      const bNum = parseInt(b.queueNumber.replace('SU-', ''))
      return aNum - bNum
    })
  }, [queueData, currentServing])

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


  // Fetch current serving from status sheet
  const fetchCurrentServingFromStatus = useCallback(async () => {
    if (!googleSheetsUrl) return null
    
    // Use statusSheetGid if provided, otherwise default to user's status sheet GID
    const gidToUse = statusSheetGid || '373003429'
    
    try {
      const sheetId = extractSheetId(googleSheetsUrl)
      if (!sheetId) return null
      
      const statusCsvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gidToUse}`
      const response = await fetch(statusCsvUrl)
      
      if (!response.ok) return null
      
      const csvText = await response.text()
      if (csvText.includes('<!DOCTYPE html>') || csvText.includes('<html')) return null
      
      const rows = parseCSV(csvText)
      if (rows.length === 0) return null
      
      const firstRow = rows[0]
      let servingValue = null
      
      // Check if first row has "Current Serving" header
      if (firstRow[0] && firstRow[0].toLowerCase().includes('current serving')) {
        servingValue = firstRow[1] ? firstRow[1].trim().toUpperCase() : null
      } else if (firstRow[0] && firstRow[0].match(/^SU-\d{3}$/i)) {
        // Direct value in first cell
        servingValue = firstRow[0].trim().toUpperCase()
      } else if (firstRow[1] && firstRow[1].match(/^SU-\d{3}$/i)) {
        // Value in second cell
        servingValue = firstRow[1].trim().toUpperCase()
      }
      
      if (servingValue && servingValue.match(/^SU-\d{3}$/i)) {
        return servingValue
      }
    } catch (error) {
      console.warn('Error fetching current serving from status sheet:', error)
    }
    
    return null
  }, [googleSheetsUrl, statusSheetGid])

  // Load queue data from Google Sheets or localStorage
  const fetchQueueData = useCallback(async () => {
    // First, try to fetch current serving from status sheet
    if (googleSheetsUrl) {
      const servingFromStatus = await fetchCurrentServingFromStatus()
      if (servingFromStatus && servingFromStatus !== currentServing) {
        setCurrentServing(servingFromStatus)
        localStorage.setItem('currentServing', servingFromStatus)
        console.log(`✅ Updated currentServing from Status sheet: ${servingFromStatus}`)
      }
    }
    
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
          
          if (rows.length > 0) {
            // Process queue data (no need to check for status row since we fetch from separate status sheet)
            if (rows.length > 1) {
              // First row is header
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
              
              // Process data rows (skip header row)
              const dataRows = rows.slice(1)
              const data = dataRows.map((row, index) => {
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
            console.log(`✅ Loaded ${data.length} queue items from Google Sheets`)
            return
            }
          }
        }
      } catch (error) {
        console.error('❌ Error fetching from Google Sheets:', error)
        console.error('Error details:', error.message)
        // Don't fall back to localStorage - only use Google Sheets
        setQueueData([])
        console.warn('⚠️ Queue data will only load from Google Sheets. Make sure your sheet is public and URL is correct.')
      }
    } else {
      // No Google Sheets URL configured - clear queue data
      setQueueData([])
      console.warn('⚠️ No Google Sheets URL configured. Queue data will be empty until configured.')
    }
  }, [googleSheetsUrl, currentServing, fetchCurrentServingFromStatus])

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

  const updateCurrentServing = async (number) => {
    setCurrentServing(number)
    localStorage.setItem('currentServing', number)
    
    // Automatically update Status sheet via Google Form if configured
    if (statusFormUrl) {
      try {
        // Extract form ID from status form URL
        let formId = null
        const formIdMatchE = statusFormUrl.match(/\/forms\/d\/e\/([a-zA-Z0-9-_]+)/)
        if (formIdMatchE) {
          formId = formIdMatchE[1]
        } else {
          const formIdMatchD = statusFormUrl.match(/\/forms\/d\/([a-zA-Z0-9-_]+)/)
          if (formIdMatchD) {
            formId = formIdMatchD[1]
          }
        }
        
        if (formId) {
          const formAction = `https://docs.google.com/forms/d/e/${formId}/formResponse`
          
          // Entry ID for the status form field (you'll need to configure this)
          // For now, we'll use a common entry ID pattern - you may need to update this
          const statusEntryId = localStorage.getItem('statusFormEntryId') || 'entry.0' // Default, should be configured
          
          const formData = new URLSearchParams()
          formData.append(statusEntryId, number)
          
          // Submit to form (no-cors mode)
          await fetch(formAction, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData,
          })
          
          console.log(`✅ Submitted status update to Google Form: ${number}`)
        }
      } catch (error) {
        console.warn('Failed to submit status update to Google Form:', error)
        // Continue anyway - localStorage update still works
      }
    }
    
    console.log(`Updated currentServing to ${number}`)
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

  const saveStatusSheetGid = (gid) => {
    setStatusSheetGid(gid)
    if (gid) {
      localStorage.setItem('statusSheetGid', gid)
    } else {
      localStorage.removeItem('statusSheetGid')
    }
  }

  const saveStatusFormUrl = (url) => {
    setStatusFormUrl(url)
    if (url) {
      localStorage.setItem('statusFormUrl', url)
    } else {
      localStorage.removeItem('statusFormUrl')
    }
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
        saveStatusSheetGid,
        saveStatusFormUrl,
        statusSheetGid,
        statusFormUrl,
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

