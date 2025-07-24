import React from "react";

import { createContext, useContext, useReducer, useEffect } from "react"
import PropTypes from "prop-types"
import { useLocalStorage } from "../hooks/useLocalStorage"

const CarbonContext = createContext()

const EMISSION_FACTORS = {
  transport: {
    car: 0.21, // per km
    bus: 0.089, // per km
    train: 0.041, // per km
    bike: 0, // per km
    walk: 0, // per km
    plane: 0.255, // per km
  },
  diet: {
    meat: 6.61, // per meal
    vegetarian: 1.05, // per meal
    vegan: 0.63, // per meal
  },
  energy: {
    electricity: 0.5, // per kWh
    gas: 2.0, // per cubic meter
    heating: 0.185, // per kWh
  },
}

const GLOBAL_AVERAGE_DAILY = 11.0 // kg CO2 per day

const initialState = {
  activities: [],
  totalFootprint: 0,
  dailyFootprints: {},
  badges: [],
  tips: [],
}

function carbonReducer(state, action) {
  switch (action.type) {
    case "LOAD_DATA":
      return { ...state, ...action.payload }

    case "ADD_ACTIVITY":
      const newActivity = {
        ...action.payload,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
      }

      // Calculate emissions
      const category = newActivity.category
      const subcategory = newActivity.subcategory
      const quantity = Number.parseFloat(newActivity.quantity) || 0
      const emissions = (EMISSION_FACTORS[category]?.[subcategory] || 0) * quantity

      newActivity.emissions = emissions

      const updatedActivities = [...state.activities, newActivity]
      const newTotal = updatedActivities.reduce((sum, activity) => sum + activity.emissions, 0)

      // Update daily footprints
      const today = new Date().toISOString().split("T")[0]
      const todayActivities = updatedActivities.filter((activity) => activity.timestamp.split("T")[0] === today)
      const todayTotal = todayActivities.reduce((sum, activity) => sum + activity.emissions, 0)

      const updatedDailyFootprints = {
        ...state.dailyFootprints,
        [today]: todayTotal,
      }

      return {
        ...state,
        activities: updatedActivities,
        totalFootprint: newTotal,
        dailyFootprints: updatedDailyFootprints,
      }

    case "REMOVE_ACTIVITY":
      const filteredActivities = state.activities.filter((activity) => activity.id !== action.payload)
      const recalculatedTotal = filteredActivities.reduce((sum, activity) => sum + activity.emissions, 0)

      return {
        ...state,
        activities: filteredActivities,
        totalFootprint: recalculatedTotal,
      }

    case "AWARD_BADGE":
      if (state.badges.find((badge) => badge.id === action.payload.id)) {
        return state
      }
      return {
        ...state,
        badges: [...state.badges, { ...action.payload, earnedAt: new Date().toISOString() }],
      }

    case "UPDATE_TIPS":
      return {
        ...state,
        tips: action.payload,
      }

    default:
      return state
  }
}

export function CarbonProvider({ children }) {
  const [state, dispatch] = useReducer(carbonReducer, initialState)
  const [storedData, setStoredData] = useLocalStorage("carbonFootprintData", initialState)

  // Load data from localStorage on mount
  useEffect(() => {
    if (storedData && storedData.activities) {
      dispatch({ type: "LOAD_DATA", payload: storedData })
    }
  }, [])

  // Save data to localStorage whenever state changes
  useEffect(() => {
    setStoredData(state)
  }, [state])

  // Generate personalized tips based on activities
  useEffect(() => {
    const categoryTotals = state.activities.reduce((totals, activity) => {
      totals[activity.category] = (totals[activity.category] || 0) + activity.emissions
      return totals
    }, {})

    const highestCategory = Object.keys(categoryTotals).reduce(
      (a, b) => (categoryTotals[a] > categoryTotals[b] ? a : b),
      "transport",
    )

    const tips = generateTips(highestCategory, state.activities)
    if (JSON.stringify(tips) !== JSON.stringify(state.tips)) {
      dispatch({ type: "UPDATE_TIPS", payload: tips })
    }
  }, [state])

  // Check for badge achievements
  useEffect(() => {
    checkBadgeAchievements(state, dispatch)
  }, [state.activities, state.dailyFootprints])

  const addActivity = (activity) => {
    dispatch({ type: "ADD_ACTIVITY", payload: activity })
  }

  const removeActivity = (activityId) => {
    dispatch({ type: "REMOVE_ACTIVITY", payload: activityId })
  }

  const value = {
    ...state,
    addActivity,
    removeActivity,
    globalAverage: GLOBAL_AVERAGE_DAILY,
    emissionFactors: EMISSION_FACTORS,
  }

  return <CarbonContext.Provider value={value}>{children}</CarbonContext.Provider>
}

function generateTips(highestCategory, activities) {
  const tipsByCategory = {
    transport: [
      "Try biking or walking for short trips to reduce your carbon footprint",
      "Consider carpooling or using public transportation",
      "Plan your trips efficiently to reduce unnecessary driving",
    ],
    diet: [
      "Try having one meat-free day per week",
      "Choose locally sourced and seasonal foods",
      "Reduce food waste by planning your meals",
    ],
    energy: [
      "Switch to LED bulbs to reduce electricity consumption",
      "Unplug electronics when not in use",
      "Consider adjusting your thermostat by 1-2 degrees",
    ],
  }

  return tipsByCategory[highestCategory] || tipsByCategory.transport
}

function checkBadgeAchievements(state, dispatch) {
  const { activities } = state

  // Bike Commuter Badge
  const bikeTrips = activities.filter((a) => a.subcategory === "bike").length
  if (bikeTrips >= 5) {
    dispatch({
      type: "AWARD_BADGE",
      payload: {
        id: "bike-commuter",
        name: "Bike Commuter",
        description: "Completed 5 bike trips",
        icon: "🚴‍♂️",
      },
    })
  }

  // Green Eater Badge
  const veganMeals = activities.filter((a) => a.subcategory === "vegan").length
  if (veganMeals >= 10) {
    dispatch({
      type: "AWARD_BADGE",
      payload: {
        id: "green-eater",
        name: "Green Eater",
        description: "Had 10 vegan meals",
        icon: "🌱",
      },
    })
  }

  // Energy Saver Badge
  const today = new Date().toISOString().split("T")[0]
  const todayFootprint = state.dailyFootprints[today] || 0
  if (todayFootprint < GLOBAL_AVERAGE_DAILY * 0.7) {
    dispatch({
      type: "AWARD_BADGE",
      payload: {
        id: "energy-saver",
        name: "Energy Saver",
        description: "Daily footprint 30% below global average",
        icon: "⚡",
      },
    })
  }
}

export function useCarbonContext() {
  const context = useContext(CarbonContext)
  if (!context) {
    throw new Error("useCarbonContext must be used within a CarbonProvider")
  }
  return context
}

CarbonProvider.propTypes = {
  children: PropTypes.node.isRequired,
}
