import React from "react"
import { CarbonProvider } from "./context/CarbonContext"
import Dashboard from "./pages/Dashboard"
import Settings from "./pages/Settings"
import Profile from "./pages/Profile"
import { Menu, Home, SettingsIcon, User } from "lucide-react"
import { useNavigate } from "react-router-dom"

function App() {
  const [currentPage, setCurrentPage] = React.useState("dashboard")
  const navigate = useNavigate()

  React.useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission()
    }
    let intervalId
    if ("Notification" in window && Notification.permission === "granted") {
      intervalId = setInterval(() => {
        new Notification("EcoPulse Reminder", {
          body: "Don't forget to log your activities today or check your eco tips! 🌱",
          icon: "/ecopulse-logo.svg"
        })
      }, 21600000) 
    }
    return () => clearInterval(intervalId)
  }, [])

  const navigation = [
    { id: "dashboard", label: "Dashboard", icon: Home, component: Dashboard },
    { id: "settings", label: "Settings", icon: SettingsIcon, component: Settings },
    { id: "profile", label: "Profile", icon: User, component: Profile },
  ]

  const CurrentComponent = navigation.find((nav) => nav.id === currentPage)?.component || Dashboard

  return (
    <CarbonProvider>
      <div className="min-h-screen bg-sand-light-50">
        {/* Navigation */}
        <nav className="bg-earth-green-600 text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-2">
                <img
                  src="/ecopulse-logo.svg"
                  alt="EcoPulse Logo"
                  className="w-8 h-8 cursor-pointer hover:scale-110 transition-transform"
                  onClick={() => navigate("/")}
                />
                <h1 className="text-xl font-bold">EcoPulse</h1>
              </div>
              <div className="flex space-x-4">
                {navigation.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setCurrentPage(id)}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                      currentPage === id
                        ? "bg-earth-green-700 text-white"
                        : "text-earth-green-100 hover:bg-earth-green-500"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="animate-fade-in">
          <CurrentComponent />
        </main>
      </div>
    </CarbonProvider>
  )
}

export default App
