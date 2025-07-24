import React from "react"
import { useState, useEffect } from "react"
import { Line, Pie, Bar } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  TimeScale,
  Filler,
} from "chart.js"
import "chartjs-adapter-date-fns"
import { useCarbonContext } from "../context/CarbonContext"
import Card from "../components/Card"
import Button from "../components/Button"
import FormInput from "../components/FormInput"
import Badge from "../components/Badge"
import Modal from "../components/Modal"
import { Plus, Award, Lightbulb } from "lucide-react"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement, TimeScale, Filler)

const Dashboard = () => {
  const { activities, totalFootprint, dailyFootprints, badges, tips, globalAverage, addActivity } = useCarbonContext()

  // Goal state (weekly)
  const [weeklyGoal, setWeeklyGoal] = useState(() => localStorage.getItem("weeklyGoal") || "20")
  const [showCelebrate, setShowCelebrate] = useState(false)

  // Get current week range (Monday to Sunday)
  function getWeekRange(date = new Date()) {
    const d = new Date(date)
    const day = d.getDay() || 7 
    const monday = new Date(d)
    monday.setDate(d.getDate() - day + 1)
    monday.setHours(0,0,0,0)
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    sunday.setHours(23,59,59,999)
    return { from: monday, to: sunday }
  }
  const weekRange = getWeekRange()

  // Calculate current week footprint
  const currentWeekFootprint = React.useMemo(() => {
    return activities
      .filter(a => {
        const ts = new Date(a.timestamp)
        return ts >= weekRange.from && ts <= weekRange.to
      })
      .reduce((sum, a) => sum + a.emissions, 0)
  }, [activities, weekRange.from, weekRange.to])

  // Progress calculation
  const progress = Math.min(1, currentWeekFootprint / Number(weeklyGoal))
  const achieved = currentWeekFootprint <= Number(weeklyGoal)

  // Persist goal
  useEffect(() => {
    localStorage.setItem("weeklyGoal", weeklyGoal)
  }, [weeklyGoal])

  // Celebrate on achieve
  useEffect(() => {
    if (achieved && currentWeekFootprint > 0) {
      setShowCelebrate(true)
      setTimeout(() => setShowCelebrate(false), 5000)
    }
  }, [achieved, currentWeekFootprint])

  // Filter state
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [dateRange, setDateRange] = useState({ from: "", to: "" })

  // Filtered activities
  const filteredActivities = React.useMemo(() => {
    return activities.filter((a) => {
      const matchCategory = selectedCategory === "all" || a.category === selectedCategory
      const matchDate = (!dateRange.from || new Date(a.timestamp) >= new Date(dateRange.from)) &&
                        (!dateRange.to || new Date(a.timestamp) <= new Date(dateRange.to))
      return matchCategory && matchDate
    })
  }, [activities, selectedCategory, dateRange])

  // Monthly bar chart data
  const monthlyData = React.useMemo(() => {
    const months = {}
    filteredActivities.forEach((a) => {
      const month = new Date(a.timestamp).toLocaleString("default", { year: "numeric", month: "short" })
      months[month] = (months[month] || 0) + a.emissions
    })
    const labels = Object.keys(months)
    return {
      labels,
      datasets: [
        {
          label: "Monthly CO2 (kg)",
          data: Object.values(months),
          backgroundColor: "#964B00",
        },
      ],
    }
  }, [filteredActivities])

  const [showActivityModal, setShowActivityModal] = useState(false)
  const [activityForm, setActivityForm] = useState({
    category: "transport",
    subcategory: "car",
    quantity: "",
    date: new Date().toISOString().split("T")[0],
  })

  const handleInputChange = (field) => (e) => {
    const value = e.target.value
    setActivityForm((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "category" && { subcategory: getSubcategories(value)[0] }),
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (activityForm.quantity && Number.parseFloat(activityForm.quantity) > 0) {
      addActivity(activityForm)
      setActivityForm({
        category: "transport",
        subcategory: "car",
        quantity: "",
        date: new Date().toISOString().split("T")[0],
      })
      setShowActivityModal(false)
    }
  }

  const getSubcategories = (category) => {
    const subcategories = {
      transport: ["car", "bus", "train", "bike", "walk", "plane"],
      diet: ["meat", "vegetarian", "vegan"],
      energy: ["electricity", "gas", "heating"],
    }
    return subcategories[category] || []
  }

  // --- Streak Calculation ---
  const streak = React.useMemo(() => {
    const days = Object.keys(dailyFootprints).sort()
    let maxStreak = 0, currentStreak = 0
    let prevDate = null
    days.forEach(date => {
      if (dailyFootprints[date] > 0) {
        if (prevDate) {
          const diff = (new Date(date) - new Date(prevDate)) / (1000 * 60 * 60 * 24)
          currentStreak = diff === 1 ? currentStreak + 1 : 1
        } else {
          currentStreak = 1
        }
        maxStreak = Math.max(maxStreak, currentStreak)
        prevDate = date
      } else {
        currentStreak = 0
        prevDate = null
      }
    })
    return maxStreak
  }, [dailyFootprints])

  // --- Trend Line for Daily Chart ---
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - i)
    return date.toISOString().split("T")[0]
  }).reverse()
  const dailyData = last7Days.map(date => dailyFootprints[date] || 0)
  // Simple linear regression for trend line
  function getTrendLine(data) {
    const n = data.length
    const xSum = data.reduce((sum, _, i) => sum + i, 0)
    const ySum = data.reduce((sum, y) => sum + y, 0)
    const xySum = data.reduce((sum, y, i) => sum + i * y, 0)
    const xxSum = data.reduce((sum, _, i) => sum + i * i, 0)
    const slope = (n * xySum - xSum * ySum) / (n * xxSum - xSum * xSum || 1)
    const intercept = (ySum - slope * xSum) / n
    return data.map((_, i) => slope * i + intercept)
  }
  const trendLine = getTrendLine(dailyData)

  // --- What If Scenario ---
  const [whatIfReduction, setWhatIfReduction] = useState(10)
  const whatIfData = dailyData.map(y => Math.max(0, y * (1 - whatIfReduction / 100)))

  // --- Enhanced Daily Trend Chart Data ---
  const lineChartData = React.useMemo(() => ({
    labels: last7Days.map(date => new Date(date).toLocaleDateString()),
    datasets: [
      {
        label: "Daily Footprint (kg CO2)",
        data: dailyData,
        borderColor: "#4a9f4a",
        backgroundColor: "rgba(74, 159, 74, 0.1)",
        tension: 0.4,
        fill: true,
        pointRadius: 4,
      },
      {
        label: "Trend Line",
        data: trendLine,
        borderColor: "#d4a73a",
        borderDash: [6, 6],
        pointRadius: 0,
        fill: false,
        tension: 0.2,
      },
      {
        label: `What If (-${whatIfReduction}% Daily)` ,
        data: whatIfData,
        borderColor: "#0ea5e9",
        borderDash: [2, 2],
        pointRadius: 0,
        fill: false,
        tension: 0.2,
      },
      {
        label: "Global Average",
        data: last7Days.map(() => globalAverage),
        borderColor: "#888888",
        borderDash: [2, 2],
        pointRadius: 0,
        fill: false,
        tension: 0.2,
      },
    ],
  }), [dailyData, trendLine, whatIfData, whatIfReduction, globalAverage, last7Days])

  // Memoize categoryTotals to avoid recalculating on every render
  const categoryTotals = React.useMemo(() => {
    return filteredActivities.reduce((totals, activity) => {
      totals[activity.category] = (totals[activity.category] || 0) + activity.emissions
      return totals
    }, {})
  }, [filteredActivities])

  const pieChartData = React.useMemo(() => ({
    labels: Object.keys(categoryTotals).map((cat) => cat.charAt(0).toUpperCase() + cat.slice(1)),
    datasets: [
      {
        data: Object.values(categoryTotals),
        backgroundColor: ["#4a9f4a", "#0ea5e9", "#ebc44e"],
        borderWidth: 2,
        borderColor: "#ffffff",
      },
    ],
  }), [categoryTotals])

  const chartOptions = React.useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
      },
    },
    animation: {
      duration: 800,
      easing: "easeInOutQuart",
    },
  }), [])

  const todayFootprint = dailyFootprints[new Date().toISOString().split("T")[0]] || 0
  const comparisonPercentage = (((todayFootprint - globalAverage) / globalAverage) * 100).toFixed(1)

  // --- Personalized Recommendations ---
  const recommendations = React.useMemo(() => {
    // Find highest emission category
    const totals = activities.reduce((acc, a) => {
      acc[a.category] = (acc[a.category] || 0) + a.emissions
      return acc
    }, {})
    const highest = Object.entries(totals).sort((a, b) => b[1] - a[1])[0]?.[0]
    if (!highest) {
      return [
        "Start by logging your daily activities to get personalized eco tips!",
        "Try tracking your transport, diet, and energy use for a full picture.",
      ]
    }
    const recs = {
      transport: [
        "Try biking or walking for short trips this week.",
        "Plan your trips to reduce unnecessary driving.",
        "Consider carpooling or using public transport for your commute.",
      ],
      diet: [
        "Have a meat-free day this week to lower your carbon footprint.",
        "Choose more plant-based meals or local produce.",
        "Reduce food waste by planning your meals ahead.",
      ],
      energy: [
        "Switch off lights and electronics when not in use.",
        "Try reducing your air conditioning or heating by 1-2 degrees.",
        "Consider switching to LED bulbs or unplugging devices overnight.",
      ],
    }
    // Suggest a challenge if a category is missing
    const missing = ["transport", "diet", "energy"].filter(cat => !totals[cat])
    if (missing.length) {
      return [
        ...recs[highest].slice(0, 2),
        `Try logging your ${missing[0]} activities to discover more ways to reduce your impact!`,
      ]
    }
    return recs[highest]
  }, [activities])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Streak Indicator */}
      <div className="mb-4 flex items-center gap-3">
        <span className="text-2xl">🔥</span>
        <span className="text-lg font-semibold text-earth-green-700">Streak: {streak} day{streak === 1 ? "" : "s"} logging in a row!</span>
      </div>
      {/* Weekly Goal Setting & Progress Tracking */}
      <div className="mb-8 p-4 rounded-xl bg-sand-light-100 border border-sand-light-200">
        <div className="flex flex-col md:flex-row md:items-end gap-4 md:gap-8">
          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-1">Weekly CO₂ Goal (kg)</label>
            <input
              type="number"
              min="1"
              value={weeklyGoal}
              onChange={e => setWeeklyGoal(e.target.value)}
              className="px-3 py-2 border border-sand-light-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-earth-green-500"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-charcoal-700 mb-1">Progress</label>
            <div className="w-full bg-sand-light-200 rounded-full h-6 overflow-hidden">
              <div
                className={`h-6 rounded-full transition-all duration-700 ${achieved ? "bg-earth-green-500" : "bg-sky-blue-500"}`}
                style={{ width: `${Math.min(100, Math.round(progress * 100))}%` }}
              ></div>
            </div>
            <div className="mt-1 text-sm text-charcoal-700">
              {achieved
                ? "🎉 Goal achieved! Well done! 🎉"
                : `Current: ${currentWeekFootprint.toFixed(1)} kg / Goal: ${Number(weeklyGoal).toFixed(1)} kg`}
            </div>
          </div>
        </div>
        {showCelebrate && (
          <div className="mt-4 text-center text-xl font-bold text-earth-green-700 animate-bounce">
            🎉 Congratulations! You are within your weekly CO₂ goal! 🎉
          </div>
        )}
      </div>
      {/* Filter UI */}
      <div className="flex flex-wrap gap-4 mb-6 items-end">
        <div>
          <label className="block text-sm font-medium text-charcoal-700 mb-1">Category</label>
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-sand-light-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-earth-green-500"
          >
            <option value="all">All</option>
            <option value="transport">Transport</option>
            <option value="diet">Diet</option>
            <option value="energy">Energy</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-charcoal-700 mb-1">From</label>
          <input
            type="date"
            value={dateRange.from}
            onChange={e => setDateRange(r => ({ ...r, from: e.target.value }))}
            className="px-3 py-2 border border-sand-light-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-earth-green-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-charcoal-700 mb-1">To</label>
          <input
            type="date"
            value={dateRange.to}
            onChange={e => setDateRange(r => ({ ...r, to: e.target.value }))}
            className="px-3 py-2 border border-sand-light-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-earth-green-500"
          />
        </div>
      </div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-charcoal-800 mb-2">Carbon Footprint Dashboard</h1>
          <p className="text-lg text-charcoal-600">Track your daily environmental impact</p>
        </div>
        <Button onClick={() => setShowActivityModal(true)} className="mt-4 sm:mt-0">
          <Plus className="w-4 h-4 mr-2" />
          Add Activity
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card title="Today's Footprint" className="text-center">
          <div className="text-3xl font-bold text-earth-green-600 mb-2">{todayFootprint.toFixed(2)} kg CO2</div>
          <div className={`text-sm ${comparisonPercentage > 0 ? "text-red-600" : "text-earth-green-600"}`}>
            {comparisonPercentage > 0 ? "+" : ""}
            {comparisonPercentage}% vs global average
          </div>
        </Card>

        <Card title="Total Activities" className="text-center">
          <div className="text-3xl font-bold text-sky-blue-600 mb-2">{activities.length}</div>
          <div className="text-sm text-charcoal-600">Activities logged</div>
        </Card>

        <Card title="Badges Earned" className="text-center">
          <div className="text-3xl font-bold text-sand-light-600 mb-2">{badges.length}</div>
          <div className="text-sm text-charcoal-600">Achievements unlocked</div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card title="Daily Trend" subtitle="Last 7 days">
          <div className="h-64">
            <Line data={lineChartData} options={chartOptions} />
          </div>
        </Card>
        <Card title="Monthly Trend" subtitle="CO2 by Month">
          <div className="h-64">
            <Bar data={monthlyData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
          </div>
        </Card>
        <Card title="Category Breakdown" subtitle="Total emissions by category">
          <div className="h-64">
            {Object.keys(categoryTotals).length > 0 ? (
              <Pie data={pieChartData} options={chartOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-charcoal-500">
                No data available. Add some activities to see your breakdown.
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Tips and Badges */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Personalized Tips" subtitle="Ways to reduce your footprint">
          <div className="space-y-3">
            {tips.map((tip, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-earth-green-50 rounded-lg">
                <Lightbulb className="w-5 h-5 text-earth-green-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-charcoal-700">{tip}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card title="Badges" subtitle="Achievements for eco-friendly actions">
          <div className="flex flex-wrap gap-3">
            {badges.length > 0 ? (
              badges.map((badge, idx) => (
                <Badge key={idx} variant="achievement" icon={badge.icon}>
                  {badge.name}
                </Badge>
              ))
            ) : (
              <div className="text-charcoal-500">No badges earned yet.</div>
            )}
          </div>
        </Card>
      </div>

      {/* Activity Modal */}
      <Modal isOpen={showActivityModal} onClose={() => setShowActivityModal(false)} title="Add New Activity">
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput label="Date" type="date" value={activityForm.date} onChange={handleInputChange("date")} required />

          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-2">Category *</label>
            <select
              value={activityForm.category}
              onChange={handleInputChange("category")}
              className="w-full px-4 py-2 border border-sand-light-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-earth-green-500 focus:border-transparent"
              required
            >
              <option value="transport">Transport</option>
              <option value="diet">Diet</option>
              <option value="energy">Energy</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-2">Type *</label>
            <select
              value={activityForm.subcategory}
              onChange={handleInputChange("subcategory")}
              className="w-full px-4 py-2 border border-sand-light-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-earth-green-500 focus:border-transparent"
              required
            >
              {getSubcategories(activityForm.category).map((sub) => (
                <option key={sub} value={sub}>
                  {sub.charAt(0).toUpperCase() + sub.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <FormInput
            label="Quantity"
            type="number"
            step="0.1"
            min="0"
            value={activityForm.quantity}
            onChange={handleInputChange("quantity")}
            placeholder={
              activityForm.category === "transport"
                ? "Distance (km)"
                : activityForm.category === "diet"
                  ? "Number of meals"
                  : "Amount (kWh or m³)"
            }
            required
          />

          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowActivityModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Add Activity
            </Button>
          </div>
        </form>
      </Modal>

      {/* What If Scenario */}
      <div className="my-8 p-6 rounded-2xl bg-sky-blue-50 border border-sky-blue-200 max-w-xl mx-auto flex flex-col items-center">
        <h3 className="text-lg font-bold text-sky-blue-800 mb-2">What If Scenario</h3>
        <p className="mb-2 text-charcoal-700">See your daily trend if you reduce your footprint by:
          <input
            type="number"
            min="0"
            max="100"
            value={whatIfReduction}
            onChange={e => setWhatIfReduction(Number(e.target.value))}
            className="mx-2 w-16 px-2 py-1 border border-sky-blue-200 rounded focus:ring-2 focus:ring-sky-blue-400"
          />%
        </p>
        <p className="text-sky-blue-700">Try different values to see the impact!</p>
      </div>

      {/* Personalized Recommendations */}
      <div className="my-8 p-6 rounded-2xl bg-forest-dark-50 border border-forest-dark-200 max-w-xl mx-auto flex flex-col items-center animate-fade-in">
        <h3 className="text-lg font-bold text-forest-dark-800 mb-2">Personalized Recommendations</h3>
        <ul className="list-disc list-inside text-forest-dark-700 space-y-2">
          {recommendations.map((rec, i) => (
            <li key={i}>{rec}</li>
          ))}
        </ul>
      </div>

      {/* Nigeria Emission Factor Note */}
      <div className="mt-8 mb-2 p-4 rounded-xl bg-sky-blue-50 border border-sky-blue-200 text-sky-blue-900 text-sm">
        <strong>Note for Nigerian users:</strong> Emission factors in this app are based on international averages. For electricity, a higher emission factor (0.8 kg CO₂/kWh) is used to reflect Nigeria's grid mix, which relies more on fossil fuels. <br/>
        <span className="block mt-1">Reference: <a href="https://www.iea.org/countries/nigeria" target="_blank" rel="noopener noreferrer" className="underline">International Energy Agency (IEA) - Nigeria</a></span>
      </div>
    </div>
  )
}

export default Dashboard
