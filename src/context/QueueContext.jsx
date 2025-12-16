import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'

const QueueContext = createContext()

export function QueueProvider({ children }) {
  const [currentServing, setCurrentServing] = useState(() => {
    return localStorage.getItem('currentServing') || 'SU-000'
  })
  const [queueData, setQueueData] = useState([])
  const [userQueueNumber, setUserQueueNumber] = useState(() => {
    // Try to get from sessionStorage first (from current session)
    return sessionStorage.getItem('userQueueNumber') || null
  })
  // ============================================
  // HARDCODED CONFIGURATION - NO USER SETUP NEEDED!
  // ============================================
  // All URLs are hardcoded here so users don't need to configure anything
  // Just access the site and it works!
  
  // ============================================
  // HARDCODED CONFIGURATION - NO USER SETUP NEEDED!
  // ============================================
  // All URLs are hardcoded here so users don't need to configure anything
  // Just access the site and it works!
  
      const HARDCODED_GOOGLE_SHEETS_URL = 'https://docs.google.com/spreadsheets/d/1rSZoNeQjKfWLW0aJoZqs38aG9BMTMz547MVP6QFiNtw/edit'
      const HARDCODED_GOOGLE_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSctFgoQkg8aTeron5gon5uC1thSqk8xmx1caadCmuMzk0frmg/viewform'
      const HARDCODED_STATUS_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSffuGdmjKo2RDGXzVnH6mbSYTwYmmy-j4r7mnvga8IO9TTAQQ/viewform'
      const HARDCODED_STATUS_SHEET_GID = '373003429'
      const HARDCODED_STATUS_FORM_ENTRY_ID = 'entry.1883307002'
      const HARDCODED_FORM_RESPONSES_GID = '781723879' // GID for "Form Responses 1" tab
  
  const [googleSheetsUrl, setGoogleSheetsUrl] = useState(() => {
    // Always use hardcoded URL - users don't need to configure
    return HARDCODED_GOOGLE_SHEETS_URL || localStorage.getItem('googleSheetsUrl') || ''
  })
  
  const [googleFormUrl, setGoogleFormUrl] = useState(() => {
    // Always use hardcoded URL - users don't need to configure
    return HARDCODED_GOOGLE_FORM_URL || localStorage.getItem('googleFormUrl') || ''
  })
  
  const [statusSheetGid, setStatusSheetGid] = useState(() => {
    // Always use hardcoded GID - users don't need to configure
    return HARDCODED_STATUS_SHEET_GID
  })
  
  const [statusFormUrl, setStatusFormUrl] = useState(() => {
    // Always use hardcoded URL - users don't need to configure
    return HARDCODED_STATUS_FORM_URL
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
        if (!googleSheetsUrl) {
          console.log('⚠️ Cannot fetch status: Google Sheets URL not configured')
          return null
        }
        
        // Use statusSheetGid if provided, otherwise default to user's status sheet GID
        const gidToUse = statusSheetGid || '373003429'
        console.log('📊 Fetching current serving from Status sheet (GID:', gidToUse + ')')
        
        try {
          const sheetId = extractSheetId(googleSheetsUrl)
          if (!sheetId) {
            console.error('❌ Could not extract sheet ID from URL')
            return null
          }
          
          const statusCsvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gidToUse}`
          console.log('Fetching from:', statusCsvUrl)
          
          const response = await fetch(statusCsvUrl)
          
          if (!response.ok) {
            console.error('❌ Status sheet fetch failed:', response.status, response.statusText)
            return null
          }
          
          const csvText = await response.text()
          if (csvText.includes('<!DOCTYPE html>') || csvText.includes('<html')) {
            console.error('❌ Got HTML instead of CSV - sheet might not be public')
            return null
          }
          
          const rows = parseCSV(csvText)
          if (rows.length === 0) {
            console.warn('⚠️ Status sheet is empty')
            return null
          }
          
          console.log('Status sheet rows:', rows)
          const firstRow = rows[0]
          console.log('First row:', firstRow)
          
          let servingValue = null
          
          // Check if first row has "Current Serving" header
          if (firstRow[0] && firstRow[0].toLowerCase().includes('current serving')) {
            servingValue = firstRow[1] ? firstRow[1].trim().toUpperCase() : null
            console.log('Found "Current Serving" header, value:', servingValue)
          } else if (firstRow[0] && firstRow[0].match(/^SU-\d{3}$/i)) {
            // Direct value in first cell
            servingValue = firstRow[0].trim().toUpperCase()
            console.log('Found direct value in A1:', servingValue)
          } else if (firstRow[1] && firstRow[1].match(/^SU-\d{3}$/i)) {
            // Value in second cell
            servingValue = firstRow[1].trim().toUpperCase()
            console.log('Found value in B1:', servingValue)
          } else {
            console.warn('⚠️ Could not find queue number in Status sheet')
            console.warn('Expected format: A1="Current Serving", B1="SU-XXX" or A1="SU-XXX"')
          }
          
          if (servingValue && servingValue.match(/^SU-\d{3}$/i)) {
            console.log('✅ Found current serving from Status sheet:', servingValue)
            return servingValue
          } else {
            console.warn('⚠️ Status sheet B1 is empty or formula not working')
            console.log('🔄 Trying fallback: Reading directly from "Form Responses 2" tab...')
            
            // Fallback: Read directly from "Form Responses 2" tab (GID: 1767023494)
            // This is where the Status Form writes responses
            try {
              const formResponses2Gid = '1767023494' // GID for "Form Responses 2" tab
              const formResponses2Url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${formResponses2Gid}`
              console.log('Fetching from Form Responses 2:', formResponses2Url)
              
              const fallbackResponse = await fetch(formResponses2Url)
              if (fallbackResponse.ok) {
                const fallbackCsv = await fallbackResponse.text()
                if (!fallbackCsv.includes('<!DOCTYPE html>') && !fallbackCsv.includes('<html')) {
                  const fallbackRows = parseCSV(fallbackCsv)
                  console.log('Form Responses 2 rows:', fallbackRows)
                  console.log('Form Responses 2 row count:', fallbackRows.length)
                  
                  if (fallbackRows.length > 1) {
                    // Find "Current Serving" column (should be column B, index 1)
                    const headerRow = fallbackRows[0]
                    console.log('Form Responses 2 header row:', headerRow)
                    let servingColumnIndex = 1 // Default to column B (index 1)
                    
                    // Try to find "Current Serving" column
                    for (let i = 0; i < headerRow.length; i++) {
                      const header = headerRow[i] ? headerRow[i].toLowerCase() : ''
                      console.log(`Checking header[${i}]:`, header)
                      if (header.includes('current serving') || header.includes('serving')) {
                        servingColumnIndex = i
                        console.log('✅ Found "Current Serving" column at index:', servingColumnIndex)
                        break
                      }
                    }
                    
                    console.log('Using column index:', servingColumnIndex)
                    
                    // Get the LAST (most recent) non-empty value in that column
                    // Start from the end (most recent) and work backwards
                    let latestValue = null
                    for (let i = fallbackRows.length - 1; i >= 1; i--) {
                      const row = fallbackRows[i]
                      console.log(`Checking row ${i}:`, row)
                      const value = row[servingColumnIndex] ? row[servingColumnIndex].trim().toUpperCase() : null
                      console.log(`Value at column ${servingColumnIndex}:`, value)
                      if (value && value.match(/^SU-\d{3,4}$/i)) { // Allow 3 or 4 digits (SU-999 or SU-1000)
                        latestValue = value
                        console.log(`✅ Found valid queue number: ${value} (row ${i})`)
                        // Continue to check if there's a more recent one, but this is the latest so far
                        // Actually, since we're going from newest to oldest, the first match is the latest
                        break
                      }
                    }
                    
                    if (latestValue) {
                      console.log('✅ Found current serving from Form Responses 2 (fallback, latest):', latestValue)
                      return latestValue
                    }
                    
                    // If not found in expected column, search all columns in all rows
                    console.log('⚠️ Not found in expected column, searching all columns...')
                    for (let i = fallbackRows.length - 1; i >= 1; i--) {
                      const row = fallbackRows[i]
                      for (let col = 0; col < row.length; col++) {
                        const value = row[col] ? row[col].trim().toUpperCase() : null
                        if (value && value.match(/^SU-\d{3,4}$/i)) { // Allow 3 or 4 digits
                          console.log(`✅ Found current serving from Form Responses 2 (fallback, column ${col}):`, value)
                          return value
                        }
                      }
                    }
                    
                    console.warn('⚠️ No valid queue number found in Form Responses 2')
                    console.warn('Searched column index:', servingColumnIndex)
                    console.warn('All rows:', fallbackRows)
                  } else {
                    console.warn('⚠️ Form Responses 2 has no data rows (only header)')
                  }
                }
              }
            } catch (fallbackError) {
              console.warn('⚠️ Fallback to Form Responses 2 also failed:', fallbackError)
              console.error('Fallback error details:', fallbackError.message)
            }
            
            console.warn('⚠️ Invalid queue number format:', servingValue)
          }
        } catch (error) {
          console.error('❌ Error fetching current serving from status sheet:', error)
          console.error('Error details:', error.message)
        }
        
        return null
      }, [googleSheetsUrl, statusSheetGid])

  // Load queue data from Google Sheets or localStorage
  const fetchQueueData = useCallback(async () => {
    // First, try to fetch current serving from status sheet
    // Only update if Status sheet has a newer/higher number (to prevent overwriting admin updates)
    if (googleSheetsUrl) {
      const servingFromStatus = await fetchCurrentServingFromStatus()
      if (servingFromStatus) {
        const statusNum = parseInt(servingFromStatus.replace('SU-', ''))
        const currentNum = parseInt(currentServing.replace('SU-', ''))
        
        // Only update if Status sheet has a higher number (more recent)
        // This prevents Status sheet from overwriting admin's "Next Customer" updates
        if (statusNum > currentNum) {
          setCurrentServing(servingFromStatus)
          localStorage.setItem('currentServing', servingFromStatus)
          console.log(`✅ Updated currentServing from Status sheet: ${servingFromStatus}`)
        } else if (servingFromStatus !== currentServing && statusNum === currentNum) {
          // Same number, just sync it
          setCurrentServing(servingFromStatus)
          localStorage.setItem('currentServing', servingFromStatus)
        }
      }
    }
    
    // Try Google Sheets first
    if (googleSheetsUrl) {
      try {
        // Convert Google Sheets URL to CSV export URL
        const sheetId = extractSheetId(googleSheetsUrl)
        let gid = extractGid(googleSheetsUrl) // Get gid from URL if present
        
        // Use hardcoded GID for "Form Responses 1" tab if not specified in URL
        if (!gid || gid === '0') {
          gid = HARDCODED_FORM_RESPONSES_GID
          console.log(`📋 Using hardcoded GID for "Form Responses 1" tab: ${gid}`)
        }
        
        if (sheetId) {
          // Try fetching with the GID
          let csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`
          console.log(`📥 Fetching queue data from: ${csvUrl}`)
          let response = await fetch(csvUrl)
          
          if (!response.ok) {
            // 400 errors usually mean the sheet isn't public or URL is wrong
            if (response.status === 400) {
              console.error('❌ 400 Error: Google Sheet is not public OR wrong GID!')
              console.error('📋 SOLUTION 1: Make your Google Sheet public:')
              console.error('   1. Open your Google Sheet')
              console.error('   2. Click "Share" button (top right)')
              console.error('   3. Click "Change to anyone with the link"')
              console.error('   4. Set permission to "Viewer"')
              console.error('   5. Click "Done"')
              console.error('')
              console.error('📋 SOLUTION 2: Find the correct GID for "Form Responses 1" tab:')
              console.error('   1. Open your Google Sheet')
              console.error('   2. Click on the "Form Responses 1" tab (at the bottom)')
              console.error('   3. Look at the URL in your browser - it will show #gid=XXXXXXXXX')
              console.error('   4. Copy that number (the XXXXXXXXX part)')
              console.error(`   5. Update your sheet URL to include it: https://docs.google.com/spreadsheets/d/${sheetId}/edit#gid=XXXXXXXXX`)
              console.error('   6. The app will automatically use that GID')
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
              
              console.log('📊 Column indices found:', {
                timestamp: timestampIndex,
                name: nameIndex,
                pepper: pepperIndex,
                portion: portionIndex,
                headerRow: headerRow
              })
              
              // Process data rows (skip header row)
              const dataRows = rows.slice(1)
              console.log(`📋 Processing ${dataRows.length} data rows from Google Sheets`)
              
              const data = dataRows.map((row, index) => {
                const name = (row[nameIndex] || '').trim() || 'Guest'
                console.log(`Row ${index + 1}: name="${name}", pepper="${row[pepperIndex]}", portion="${row[portionIndex]}"`)
                
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
                  name: name,
                  pepper: pepper,
                  portion: portion
                }
              })
              
              setQueueData(data)
            console.log(`✅ Loaded ${data.length} queue items from Google Sheets`)
            
            // Try to match user to their submission in the queue data
            // This happens after form submission when user navigates to queue
            const pendingSubmission = sessionStorage.getItem('pendingSubmission')
            if (pendingSubmission) {
              try {
                const submission = JSON.parse(pendingSubmission)
                // Find the most recent entry that matches the submission
                // Match by name (if provided) and timestamp being recent (within last 5 minutes)
                const submissionTime = new Date(submission.timestamp).getTime()
                const fiveMinutesAgo = Date.now() - 5 * 60 * 1000
                
                // Find matching entry - most recent one that matches
                let matchedEntry = null
                for (let i = data.length - 1; i >= 0; i--) {
                  const entry = data[i]
                  const entryTime = entry.timestamp ? new Date(entry.timestamp).getTime() : 0
                  
                  // Check if this entry matches (by name if provided, or just by being recent)
                  const nameMatches = !submission.name || submission.name === 'Guest' || 
                    entry.name.toLowerCase().includes(submission.name.toLowerCase()) ||
                    submission.name.toLowerCase().includes(entry.name.toLowerCase())
                  
                  // Match by pepper and portion preferences too
                  const pepperMatches = entry.pepper === submission.pepper
                  const portionMatches = entry.portion === submission.portion
                  
                  // Time should be within 5 minutes of submission
                  const timeMatches = entryTime > fiveMinutesAgo && entryTime <= submissionTime + 120000 // Within 2 minutes of submission
                  
                  // Prefer entries that match name AND preferences, but also accept just recent entries
                  if (timeMatches && (nameMatches || (pepperMatches && portionMatches))) {
                    matchedEntry = entry
                    break
                  }
                }
                
                if (matchedEntry) {
                  setUserQueueNumber(matchedEntry.queueNumber)
                  sessionStorage.setItem('userQueueNumber', matchedEntry.queueNumber)
                  sessionStorage.removeItem('pendingSubmission')
                  console.log(`✅ Matched user to queue number: ${matchedEntry.queueNumber}`)
                } else {
                  console.log('⏳ Waiting for submission to appear in Google Sheets... (will keep checking)')
                  // Keep pendingSubmission for next poll - will try again in 3 seconds
                }
              } catch (error) {
                console.warn('Error matching user submission:', error)
              }
            }
            
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
      const interval = setInterval(fetchQueueData, 3000) // Poll every 3 seconds for real-time updates
      return () => clearInterval(interval)
    } else {
      // If no Google Sheets URL, clear queue data
      setQueueData([])
      console.warn('⚠️ No Google Sheets URL configured. Queue data will be empty until configured.')
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
        console.log('🔄 Attempting to submit status update to Google Form...')
        console.log('Status Form URL:', statusFormUrl)
        
        // Extract form ID from status form URL
        let formId = null
        const formIdMatchE = statusFormUrl.match(/\/forms\/d\/e\/([a-zA-Z0-9-_]+)/)
        if (formIdMatchE) {
          formId = formIdMatchE[1]
          console.log('✅ Extracted form ID (e format):', formId)
        } else {
          const formIdMatchD = statusFormUrl.match(/\/forms\/d\/([a-zA-Z0-9-_]+)/)
          if (formIdMatchD) {
            formId = formIdMatchD[1]
            console.log('✅ Extracted form ID (d format):', formId)
          } else {
            console.error('❌ Could not extract form ID from URL:', statusFormUrl)
          }
        }
        
        if (formId) {
          const formAction = `https://docs.google.com/forms/d/e/${formId}/formResponse`
          
          // Entry ID for the status form field - HARDCODED, no user configuration needed
          const finalEntryId = HARDCODED_STATUS_FORM_ENTRY_ID
          console.log('🔑 Using Entry ID:', finalEntryId)
          
          if (finalEntryId === 'entry.1883307002') {
            console.log('✅ Using correct Entry ID: entry.1883307002')
          }
          
          const formData = new URLSearchParams()
          formData.append(finalEntryId, number)
          
          console.log('Submitting to:', formAction)
          console.log('Form data:', { [finalEntryId]: number })
          
          // Submit to form (no-cors mode)
          const response = await fetch(formAction, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData,
          })
          
          // Note: no-cors mode means we can't read the response, but that's OK
          console.log(`✅ Submitted status update to Google Form: ${number}`)
          console.log('📝 Check "Form Responses 2" tab in Google Sheets to verify the submission appeared')
        } else {
          console.error('❌ Cannot submit: Form ID not found')
        }
      } catch (error) {
        console.error('❌ Failed to submit status update to Google Form:', error)
        console.error('Error details:', error.message)
        // Continue anyway - localStorage update still works
      }
    } else {
      console.warn('⚠️ Status Form URL not configured. Status updates will only be local (not synced across devices).')
      console.warn('⚠️ Go to Admin → Configure → Enter Status Form URL')
    }
    
    console.log(`✅ Updated currentServing to ${number}`)
  }

  const saveUserQueueNumber = (number) => {
    setUserQueueNumber(number)
    // Store in sessionStorage (not localStorage) - only for current session
    sessionStorage.setItem('userQueueNumber', number)
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
    sessionStorage.removeItem('userQueueNumber')
    sessionStorage.removeItem('pendingSubmission')
    localStorage.removeItem('currentServing')
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

