"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, X, Plus, Search, Menu, RotateCcw, Clock, UserPlus, LogIn } from "lucide-react"

interface Event {
  id: string
  date: string
  title: string
  time?: string
  startTime?: string
  endTime?: string
  type: "timed" | "all-day"
  description?: string
  category?: string
}

interface Suggestion {
  id: string
  title: string
  category: string
  defaultTime?: string
}

export default function Calendar() {
  // Get current date in Indian time
  const getIndianDate = () => {
    const now = new Date()
    const indianTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }))
    return indianTime
  }

  const [currentDate, setCurrentDate] = useState(getIndianDate())
  const [selectedDate, setSelectedDate] = useState<number | null>(getIndianDate().getDate())
  const [inputValue, setInputValue] = useState("")
  const [searchValue, setSearchValue] = useState("")
  const [showMonthYearPicker, setShowMonthYearPicker] = useState(false)
  const [showEventDetails, setShowEventDetails] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [previewEvent, setPreviewEvent] = useState<Event | null>(null)
  const [highlightedEventId, setHighlightedEventId] = useState<string | null>(null)

  const [events, setEvents] = useState<Event[]>([
    // Sample events for demonstration
    {
      id: "1",
      date: `${getIndianDate().getFullYear()}-${getIndianDate().getMonth()}-${getIndianDate().getDate()}`,
      title: "Sleep",
      startTime: "00:00",
      endTime: "06:45",
      type: "timed",
      category: "personal",
    },
    {
      id: "2",
      date: `${getIndianDate().getFullYear()}-${getIndianDate().getMonth()}-${getIndianDate().getDate()}`,
      title: "Morning Workout",
      time: "07:00",
      type: "all-day",
      category: "fitness",
    },
    {
      id: "3",
      date: `${getIndianDate().getFullYear()}-${getIndianDate().getMonth()}-${getIndianDate().getDate()}`,
      title: "Team Meeting",
      startTime: "09:00",
      endTime: "10:00",
      type: "timed",
      category: "work",
    },
    {
      id: "4",
      date: `${getIndianDate().getFullYear()}-${getIndianDate().getMonth()}-${getIndianDate().getDate()}`,
      title: "Lunch Break",
      startTime: "12:00",
      endTime: "13:00",
      type: "timed",
      category: "personal",
    },
  ])

  // Predefined suggestions
  const suggestions: Suggestion[] = [
    { id: "s1", title: "Morning Workout", category: "fitness", defaultTime: "07:00" },
    { id: "s2", title: "Team Meeting", category: "work", defaultTime: "09:00" },
    { id: "s3", title: "Lunch Break", category: "personal", defaultTime: "12:00" },
    { id: "s4", title: "Doctor Appointment", category: "health", defaultTime: "14:00" },
    { id: "s5", title: "Birthday Party", category: "social", defaultTime: "18:00" },
    { id: "s6", title: "Study Session", category: "education", defaultTime: "19:00" },
    { id: "s7", title: "Grocery Shopping", category: "personal", defaultTime: "10:00" },
    { id: "s8", title: "Conference Call", category: "work", defaultTime: "15:00" },
    { id: "s9", title: "Yoga Class", category: "fitness", defaultTime: "06:00" },
    { id: "s10", title: "Movie Night", category: "entertainment", defaultTime: "20:00" },
  ]

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]

  // Generate years (current year ± 50 years)
  const currentYear = getIndianDate().getFullYear()
  const years = Array.from({ length: 101 }, (_, i) => currentYear - 50 + i)

  // Time intervals for organized slots
  const timeIntervals = [
    { start: "00:00", end: "06:00", label: "Night" },
    { start: "06:00", end: "12:00", label: "Morning" },
    { start: "12:00", end: "18:00", label: "Afternoon" },
    { start: "18:00", end: "24:00", label: "Evening" },
  ]

  // Get filtered suggestions based on input
  const getFilteredSuggestions = () => {
    if (!inputValue.trim()) return []
    return suggestions.filter((s) => s.title.toLowerCase().includes(inputValue.toLowerCase())).slice(0, 4)
  }

  // Get search results
  const getSearchResults = () => {
    if (!searchValue.trim()) return []
    return events.filter(
      (event) =>
        event.title.toLowerCase().includes(searchValue.toLowerCase()) ||
        event.category?.toLowerCase().includes(searchValue.toLowerCase()),
    )
  }

  // Parse time from text input
  const parseTimeFromText = (text: string) => {
    const timePattern = /(\d{1,2})\s*(am|pm|AM|PM)\s*(?:to|until|-)\s*(\d{1,2})\s*(am|pm|AM|PM)/
    const match = text.match(timePattern)

    if (match) {
      const [, startHour, startPeriod, endHour, endPeriod] = match

      let start24 = Number.parseInt(startHour)
      let end24 = Number.parseInt(endHour)

      if (startPeriod.toLowerCase() === "pm" && start24 !== 12) start24 += 12
      if (startPeriod.toLowerCase() === "am" && start24 === 12) start24 = 0
      if (endPeriod.toLowerCase() === "pm" && end24 !== 12) end24 += 12
      if (endPeriod.toLowerCase() === "am" && end24 === 12) end24 = 0

      return {
        startTime: `${start24.toString().padStart(2, "0")}:00`,
        endTime: `${end24.toString().padStart(2, "0")}:00`,
        title: text.replace(timePattern, "").trim(),
      }
    }

    // Single time pattern
    const singleTimePattern = /(\d{1,2})\s*(am|pm|AM|PM)/
    const singleMatch = text.match(singleTimePattern)

    if (singleMatch) {
      const [, hour, period] = singleMatch
      let hour24 = Number.parseInt(hour)

      if (period.toLowerCase() === "pm" && hour24 !== 12) hour24 += 12
      if (period.toLowerCase() === "am" && hour24 === 12) hour24 = 0

      return {
        time: `${hour24.toString().padStart(2, "0")}:00`,
        title: text.replace(singleTimePattern, "").trim(),
      }
    }

    return { title: text }
  }

  // Update preview event when input changes
  useEffect(() => {
    if (inputValue.trim() && selectedDate) {
      const parsed = parseTimeFromText(inputValue)
      const dateKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${selectedDate}`

      setPreviewEvent({
        id: "preview",
        date: dateKey,
        title: parsed.title || inputValue.trim(),
        startTime: parsed.startTime,
        endTime: parsed.endTime,
        time: parsed.time,
        type: parsed.startTime && parsed.endTime ? "timed" : "all-day",
      })
    } else {
      setPreviewEvent(null)
    }
  }, [inputValue, selectedDate, currentDate])

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate)
    if (direction === "prev") {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setCurrentDate(newDate)
  }

  const selectDate = (day: number) => {
    setSelectedDate(day)
  }

  const handleSuggestionClick = (suggestion: Suggestion) => {
    setInputValue(suggestion.title)
    setShowSuggestions(false)
  }

  const handleSearchResultClick = (event: Event) => {
    setHighlightedEventId(event.id)
    setShowSearchResults(false)
    setSearchValue("")

    // Navigate to the event's date
    const [year, month, day] = event.date.split("-").map(Number)
    setCurrentDate(new Date(year, month, 1))
    setSelectedDate(day)
  }

  const submitEvent = () => {
    if (inputValue.trim() && selectedDate) {
      const parsed = parseTimeFromText(inputValue)
      const dateKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${selectedDate}`
      const newEvent: Event = {
        id: Date.now().toString(),
        date: dateKey,
        title: parsed.title || inputValue.trim(),
        startTime: parsed.startTime,
        endTime: parsed.endTime,
        time: parsed.time,
        type: parsed.startTime && parsed.endTime ? "timed" : "all-day",
        category: "personal",
      }
      setEvents((prev) => [...prev, newEvent])
      setInputValue("")
      setPreviewEvent(null)
      setShowSuggestions(false)
    }
  }

  const getEventsForDate = (day: number) => {
    const dateKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${day}`
    const regularEvents = events.filter((event) => event.date === dateKey)
    const preview = previewEvent && previewEvent.date === dateKey ? [previewEvent] : []
    return [...regularEvents, ...preview]
  }

  const getEventsForTimeInterval = (interval: any, dayEvents: Event[]) => {
    return dayEvents.filter((event) => {
      if (event.time) {
        return event.time >= interval.start && event.time < interval.end
      }
      if (event.startTime) {
        return event.startTime >= interval.start && event.startTime < interval.end
      }
      return false
    })
  }

  const isToday = (day: number) => {
    const today = getIndianDate()
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    )
  }

  const getSelectedDateString = () => {
    if (!selectedDate) return ""
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDate)
    const dayName = date.toLocaleDateString("en-US", { weekday: "long" })
    const monthName = date.toLocaleDateString("en-US", { month: "short" })
    return `${dayName} — ${monthName} ${selectedDate}, ${currentDate.getFullYear()}`
  }

  const getWeekDates = () => {
    if (!selectedDate) return []

    const selectedDateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDate)
    const startOfWeek = new Date(selectedDateObj)
    startOfWeek.setDate(selectedDateObj.getDate() - selectedDateObj.getDay())

    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)
      return date
    })
  }

  const handleEventClick = (event: Event) => {
    if (event.id !== "preview") {
      setSelectedEvent(event)
      setShowEventDetails(true)
    }
  }

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="w-12 h-12"></div>)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const hasEvents = getEventsForDate(day).length > 0
      const todayClass = isToday(day)

      days.push(
        <button
          key={day}
          onClick={() => selectDate(day)}
          className={`w-12 h-12 flex items-center justify-center font-medium rounded-full transition-all hover:bg-gray-200 relative ${
            selectedDate === day
              ? "bg-red-500 text-white"
              : todayClass
                ? "bg-blue-500 text-white"
                : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          {day}
          {hasEvents && <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full"></div>}
        </button>,
      )
    }

    return days
  }

  const renderEventsByTimeSlots = () => {
    const selectedEvents = selectedDate ? getEventsForDate(selectedDate) : []

    return (
      <div className="space-y-6">
        {timeIntervals.map((interval) => {
          const intervalEvents = getEventsForTimeInterval(interval, selectedEvents)

          return (
            <div key={interval.label} className="border-b border-gray-100 pb-4">
              <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Clock size={18} />
                {interval.label} ({interval.start} - {interval.end})
              </h3>

              {intervalEvents.length > 0 ? (
                <div className="space-y-2">
                  {intervalEvents.map((event) => (
                    <div
                      key={event.id}
                      onClick={() => handleEventClick(event)}
                      className={`border-l-4 p-3 rounded-r-lg cursor-pointer transition-all hover:shadow-md ${
                        event.id === "preview"
                          ? "bg-blue-50 border-blue-400 opacity-70"
                          : highlightedEventId === event.id
                            ? "bg-yellow-100 border-yellow-500 shadow-lg"
                            : "bg-blue-50 border-blue-400"
                      }`}
                    >
                      <div className="font-medium text-gray-800">{event.title}</div>
                      {event.startTime && event.endTime && (
                        <div className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                          <Clock size={12} className="text-blue-400" />
                          {event.startTime} - {event.endTime}
                        </div>
                      )}
                      {event.time && (
                        <div className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                          <Clock size={12} className="text-blue-400" />
                          {event.time}
                        </div>
                      )}
                      <div className="absolute right-3 top-3">
                        <RotateCcw size={16} className="text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm italic">No events scheduled</p>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  const handleMonthYearSelect = (month: number, year: number) => {
    setCurrentDate(new Date(year, month, 1))
    setShowMonthYearPicker(false)
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-800">Smart Calendar</h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors">
              <LogIn size={20} />
              <span>Login</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors">
              <UserPlus size={20} />
              <span>Sign Up</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Panel - Calendar */}
        <div className="w-1/2 bg-white border-r border-gray-200  p-8 flex flex-col ">
          {/* Calendar Widget */}
          <div className="bg-white border-2 border-purple-300 rounded-lg p-6 mb-8 shadow-sm">
            {/* Header with navigation */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => navigateMonth("prev")}
                className="text-purple-500 hover:text-purple-600 transition-colors"
              >
                <ChevronLeft size={20} />
              </button>

              <button
                onClick={() => setShowMonthYearPicker(true)}
                className="text-gray-800 text-lg font-medium hover:text-purple-600 transition-colors"
              >
                {months[currentDate.getMonth()]} {currentDate.getFullYear()}
              </button>

              <button
                onClick={() => navigateMonth("next")}
                className="text-purple-500 hover:text-purple-600 transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Days of week header */}
            <div className="grid grid-cols-7 gap-1 mb-4">
              {daysOfWeek.map((day) => (
                <div key={day} className="text-gray-600 text-xs font-medium text-center py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">{renderCalendarDays()}</div>
          </div>

          {/* Input field with suggestions */}
          <div className="w-full relative">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value)
                    setShowSuggestions(e.target.value.length > 0)
                  }}
                  onFocus={() => setShowSuggestions(inputValue.length > 0)}
                  placeholder="TYPE HERE... (e.g., Birthday party from 12pm to 4pm)"
                  className="w-full bg-white border border-gray-300 text-gray-800 placeholder-gray-500 px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  onKeyPress={(e) => e.key === "Enter" && submitEvent()}
                />

                {/* Suggestions Dropdown */}
                {showSuggestions && getFilteredSuggestions().length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 mt-1">
                    {getFilteredSuggestions().map((suggestion) => (
                      <button
                        key={suggestion.id}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium text-gray-800">{suggestion.title}</div>
                        <div className="text-sm text-gray-500 capitalize">{suggestion.category}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={submitEvent}
                disabled={!inputValue.trim() || !selectedDate}
                className="bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                Submit
              </button>
            </div>

            {selectedDate && (
              <p className="text-gray-600 text-sm mt-2">
                Adding event to {months[currentDate.getMonth()]} {selectedDate}, {currentDate.getFullYear()}
              </p>
            )}
            {previewEvent && (
              <p className="text-purple-600 text-sm mt-1">
                Preview: {previewEvent.title}{" "}
                {previewEvent.startTime && previewEvent.endTime
                  ? `(${previewEvent.startTime} - ${previewEvent.endTime})`
                  : ""}
              </p>
            )}
          </div>
        </div>

        {/* Right Panel - Event Details */}
        <div className="w-1/2 bg-white">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <ChevronLeft className="text-red-500" size={24} />
                <h1 className="text-red-500 text-xl font-medium">{months[currentDate.getMonth()]}</h1>
              </div>
              <div className="flex items-center gap-4">
                <Menu className="text-red-500" size={20} />
                <div className="relative">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={searchValue}
                      onChange={(e) => {
                        setSearchValue(e.target.value)
                        setShowSearchResults(e.target.value.length > 0)
                      }}
                      placeholder="Search events..."
                      className="px-3 py-1 border border-gray-300 rounded text-sm outline-none focus:ring-2 focus:ring-red-500"
                    />
                    <Search className="text-red-500" size={20} />
                  </div>

                  {/* Search Results Dropdown */}
                  {showSearchResults && getSearchResults().length > 0 && (
                    <div className="absolute top-full right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 mt-1 w-64">
                      {getSearchResults().map((event) => (
                        <button
                          key={event.id}
                          onClick={() => handleSearchResultClick(event)}
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                        >
                          <div className="font-medium text-gray-800">{event.title}</div>
                          <div className="text-sm text-gray-500">
                            {event.date.split("-")[2]}/{event.date.split("-")[1]}/{event.date.split("-")[0]}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <Plus className="text-red-500" size={20} />
              </div>
            </div>

            {/* Week view */}
            <div className="grid grid-cols-7 gap-3">
              {getWeekDates().map((date, i) => {
                const day = date.getDate()
                const isSelected = selectedDate === day && date.getMonth() === currentDate.getMonth()
                const isCurrentMonth = date.getMonth() === currentDate.getMonth()
                const isToday = date.toDateString() === getIndianDate().toDateString()

                return (
                  <div key={i} className="text-center">
                    <div className="text-xs text-gray-500 mb-2 font-medium">
                      {["S", "M", "T", "W", "T", "F", "S"][i]}
                    </div>
                    <button
                      onClick={() => isCurrentMonth && selectDate(day)}
                      className={`w-10 h-10 rounded-full text-sm font-medium transition-colors ${
                        isSelected
                          ? "bg-red-500 text-white"
                          : isToday
                            ? "bg-blue-100 text-blue-600"
                            : isCurrentMonth
                              ? "text-gray-800 hover:bg-gray-100"
                              : "text-gray-400"
                      }`}
                    >
                      {day}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Event Details */}
          {selectedDate ? (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">{getSelectedDateString()}</h2>

              {/* Current time indicator */}
              <div className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-medium inline-block mb-6">
                {new Date().toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                  timeZone: "Asia/Kolkata",
                })}
              </div>

              {/* Organized Timeline by Time Slots */}
              <div className="max-h-[calc(100vh-400px)] overflow-y-auto">{renderEventsByTimeSlots()}</div>
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">
              <div className="mt-20">
                <Clock className="mx-auto mb-4 text-gray-300" size={48} />
                <p className="text-lg">Select a date to view events</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6 px-6">
        <div className="flex items-center justify-between">
          <div className="text-sm">© 2025 Smart Calendar. All rights reserved.</div>
          <div className="flex items-center gap-6 text-sm">
            <a href="#" className="hover:text-gray-300 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-gray-300 transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-gray-300 transition-colors">
              Contact Us
            </a>
          </div>
        </div>
      </footer>

      {/* Modals remain the same... */}
      {/* Month/Year Picker Modal */}
      {showMonthYearPicker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-80 max-h-96 overflow-y-auto shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-gray-800 text-lg font-medium">Select Month & Year</h3>
              <button onClick={() => setShowMonthYearPicker(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-gray-700 text-sm mb-2 block">Year</label>
                <select
                  value={currentDate.getFullYear()}
                  onChange={(e) => handleMonthYearSelect(currentDate.getMonth(), Number.parseInt(e.target.value))}
                  className="w-full bg-white border border-gray-300 text-gray-800 p-2 rounded outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-gray-700 text-sm mb-2 block">Month</label>
                <div className="grid grid-cols-3 gap-2">
                  {months.map((month, index) => (
                    <button
                      key={month}
                      onClick={() => handleMonthYearSelect(index, currentDate.getFullYear())}
                      className={`p-2 rounded text-sm transition-colors ${
                        currentDate.getMonth() === index
                          ? "bg-purple-500 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {month.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Event Details Modal */}
      {showEventDetails && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-gray-800 text-lg font-medium">Event Details</h3>
              <button onClick={() => setShowEventDetails(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-800">{selectedEvent.title}</h4>
                {selectedEvent.startTime && selectedEvent.endTime && (
                  <div className="flex items-center gap-2 text-gray-600 mt-2">
                    <Clock size={16} />
                    <span>
                      {selectedEvent.startTime} - {selectedEvent.endTime}
                    </span>
                  </div>
                )}
                {selectedEvent.time && (
                  <div className="flex items-center gap-2 text-gray-600 mt-2">
                    <Clock size={16} />
                    <span>{selectedEvent.time}</span>
                  </div>
                )}
                {selectedEvent.category && (
                  <div className="text-sm text-gray-500 mt-2 capitalize">Category: {selectedEvent.category}</div>
                )}
              </div>

              <div className="pt-4 border-t">
                <button
                  onClick={() => {
                    setEvents((prev) => prev.filter((e) => e.id !== selectedEvent.id))
                    setShowEventDetails(false)
                    setHighlightedEventId(null)
                  }}
                  className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition-colors"
                >
                  Delete Event
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
