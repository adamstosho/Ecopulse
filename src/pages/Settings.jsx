import React from "react"
import { useCarbonContext } from "../context/CarbonContext"
import Card from "../components/Card"
import Button from "../components/Button"
import FormInput from "../components/FormInput"
import Modal from "../components/Modal"
import { SettingsIcon, Download, Upload, Trash2, AlertTriangle } from "lucide-react"

const Settings = () => {
  const { activities, totalFootprint } = useCarbonContext()
  const [showClearModal, setShowClearModal] = React.useState(false)
  const [userSettings, setUserSettings] = React.useState({
    name: localStorage.getItem("userName") || "",
    email: localStorage.getItem("userEmail") || "",
    notifications: localStorage.getItem("notifications") !== "false",
    units: localStorage.getItem("units") || "metric",
  })

  const handleSettingChange = (field) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value
    setUserSettings((prev) => ({ ...prev, [field]: value }))
    localStorage.setItem(field === "name" ? "userName" : field === "email" ? "userEmail" : field, value.toString())
  }

  const exportData = () => {
    const data = {
      activities,
      totalFootprint,
      exportDate: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `carbon-footprint-data-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const importData = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result)
          if (data.activities && Array.isArray(data.activities)) {
            localStorage.setItem("carbonFootprintData", JSON.stringify(data))
            window.location.reload() // Simple way to reload the context
          } else {
            alert("Invalid file format")
          }
        } catch (error) {
          alert("Error reading file")
        }
      }
      reader.readAsText(file)
    }
  }

  const clearAllData = () => {
    localStorage.removeItem("carbonFootprintData")
    localStorage.removeItem("userName")
    localStorage.removeItem("userEmail")
    setShowClearModal(false)
    window.location.reload()
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center mb-8">
        <SettingsIcon className="w-8 h-8 text-earth-green-600 mr-3" />
        <div>
          <h1 className="text-3xl font-bold text-charcoal-800">Settings</h1>
          <p className="text-lg text-charcoal-600">Manage your preferences and data</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Profile Settings */}
        <Card title="Profile Settings" subtitle="Update your personal information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Name"
              value={userSettings.name}
              onChange={handleSettingChange("name")}
              placeholder="Enter your name"
            />
            <FormInput
              label="Email"
              type="email"
              value={userSettings.email}
              onChange={handleSettingChange("email")}
              placeholder="Enter your email"
            />
          </div>
        </Card>

        {/* App Preferences */}
        <Card title="App Preferences" subtitle="Customize your experience">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-charcoal-800">Notifications</h4>
                <p className="text-sm text-charcoal-600">Receive daily reminders and tips</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={userSettings.notifications}
                  onChange={handleSettingChange("notifications")}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-sand-light-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-earth-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-earth-green-600"></div>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-2">Units</label>
              <select
                value={userSettings.units}
                onChange={handleSettingChange("units")}
                className="w-full md:w-48 px-4 py-2 border border-sand-light-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-earth-green-500 focus:border-transparent"
              >
                <option value="metric">Metric (km, kg)</option>
                <option value="imperial">Imperial (miles, lbs)</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Data Management */}
        <Card title="Data Management" subtitle="Export, import, or clear your data">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={exportData} variant="outline" className="flex-1 bg-transparent">
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>

              <label className="flex-1">
                <input
                  type="file"
                  accept=".json"
                  onChange={importData}
                  className="hidden"
                  id="import-data-input"
                />
                <Button
                  as="span"
                  variant="outline"
                  className="w-full cursor-pointer bg-transparent"
                  onClick={() => document.getElementById('import-data-input').click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Import Data
                </Button>
              </label>
            </div>

            <div className="pt-4 border-t border-sand-light-200">
              <Button
                onClick={() => setShowClearModal(true)}
                variant="outline"
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All Data
              </Button>
              <p className="text-sm text-charcoal-500 mt-2">
                This will permanently delete all your activities and settings.
              </p>
            </div>
          </div>
        </Card>

        {/* Statistics */}
        <Card title="Data Statistics" subtitle="Overview of your tracked data">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-earth-green-600">{activities.length}</div>
              <div className="text-sm text-charcoal-600">Total Activities</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-sky-blue-600">{totalFootprint.toFixed(1)}</div>
              <div className="text-sm text-charcoal-600">Total CO2 (kg)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-sand-light-600">
                {activities.length > 0 ? (totalFootprint / activities.length).toFixed(1) : "0"}
              </div>
              <div className="text-sm text-charcoal-600">Avg per Activity</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-forest-dark-600">
                {activities.length > 0
                  ? Math.ceil((Date.now() - new Date(activities[0]?.timestamp).getTime()) / (1000 * 60 * 60 * 24))
                  : 0}
              </div>
              <div className="text-sm text-charcoal-600">Days Tracking</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Clear Data Confirmation Modal */}
      <Modal isOpen={showClearModal} onClose={() => setShowClearModal(false)} title="Clear All Data">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-lg font-semibold text-charcoal-800 mb-2">Are you sure you want to clear all data?</p>
          <p className="text-charcoal-600 mb-6">
            This action cannot be undone. All your activities, settings, and achievements will be permanently deleted.
          </p>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={() => setShowClearModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={clearAllData} className="flex-1 bg-red-600 hover:bg-red-700 focus:ring-red-500">
              Clear All Data
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Settings
