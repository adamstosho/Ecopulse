
import React from "react";
import { useCarbonContext } from "../context/CarbonContext"
import Card from "../components/Card"
import Badge from "../components/Badge"
import { User, Award, TrendingDown, Calendar, Target, Download } from "lucide-react"
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const Profile = () => {
  const { activities, totalFootprint, dailyFootprints, badges, globalAverage } = useCarbonContext()

  const userName = localStorage.getItem("userName") || "Eco Warrior"
  const userEmail = localStorage.getItem("userEmail") || "user@example.com"

  // Calculate statistics
  const totalDays = Object.keys(dailyFootprints).length
  const averageDailyFootprint = totalDays > 0 ? totalFootprint / totalDays : 0
  const bestDay = Object.entries(dailyFootprints).reduce(
    (best, [date, footprint]) => (footprint < best.footprint ? { date, footprint } : best),
    { date: "", footprint: Number.POSITIVE_INFINITY },
  )
  const worstDay = Object.entries(dailyFootprints).reduce(
    (worst, [date, footprint]) => (footprint > worst.footprint ? { date, footprint } : worst),
    { date: "", footprint: 0 },
  )

  const categoryStats = activities.reduce((stats, activity) => {
    stats[activity.category] = (stats[activity.category] || 0) + 1
    return stats
  }, {})

  const mostUsedCategory = Object.entries(categoryStats).reduce(
    (most, [category, count]) => (count > most.count ? { category, count } : most),
    { category: "None", count: 0 },
  )

  const daysUnderAverage = Object.values(dailyFootprints).filter((footprint) => footprint < globalAverage).length

  const impactLevel =
    averageDailyFootprint < globalAverage * 0.7
      ? "Excellent"
      : averageDailyFootprint < globalAverage
        ? "Good"
        : averageDailyFootprint < globalAverage * 1.3
          ? "Average"
          : "Needs Improvement"

  const impactColor =
    impactLevel === "Excellent"
      ? "text-earth-green-600"
      : impactLevel === "Good"
        ? "text-sky-blue-600"
        : impactLevel === "Average"
          ? "text-sand-light-600"
          : "text-red-600"

  // PDF Download Handler
  const handleDownloadReport = async () => {
    const input = document.getElementById("profile-report-section")
    if (!input) return
    const canvas = await html2canvas(input, { scale: 2 })
    const imgData = canvas.toDataURL("image/png")
    const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" })
    const pageWidth = pdf.internal.pageSize.getWidth()
    const imgWidth = pageWidth - 40
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    pdf.addImage(imgData, "PNG", 20, 20, imgWidth, imgHeight)
    pdf.save(`EcoPulse-Report-${new Date().toISOString().split("T")[0]}.pdf`)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-end mb-4">
        <button
          onClick={handleDownloadReport}
          className="flex items-center px-4 py-2 bg-earth-green-600 text-white rounded-lg shadow hover:bg-earth-green-700 transition-colors"
        >
          <Download className="w-4 h-4 mr-2" />
          Download Report
        </button>
      </div>
      <div id="profile-report-section">
        {/* Profile Header */}
        <Card className="mb-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="w-24 h-24 bg-earth-green-100 rounded-full flex items-center justify-center">
              <User className="w-12 h-12 text-earth-green-600" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-3xl font-bold text-charcoal-800 mb-2">{userName}</h1>
              <p className="text-lg text-charcoal-600 mb-4">{userEmail}</p>
              <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                <Badge variant="info">
                  <Calendar className="w-3 h-3 mr-1" />
                  {totalDays} days tracking
                </Badge>
                <Badge variant={impactLevel === "Excellent" ? "success" : "default"}>
                  <Target className="w-3 h-3 mr-1" />
                  {impactLevel} impact
                </Badge>
                <Badge variant="achievement">
                  <Award className="w-3 h-3 mr-1" />
                  {badges.length} badges
                </Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card title="Total Impact" className="text-center">
            <div className="text-3xl font-bold text-charcoal-800 mb-2">{totalFootprint.toFixed(1)} kg CO2</div>
            <p className="text-sm text-charcoal-600">Lifetime emissions tracked</p>
          </Card>

          <Card title="Daily Average" className="text-center">
            <div className={`text-3xl font-bold mb-2 ${impactColor}`}>{averageDailyFootprint.toFixed(1)} kg CO2</div>
            <p className="text-sm text-charcoal-600">
              {averageDailyFootprint < globalAverage ? "Below" : "Above"} global average
            </p>
          </Card>

          <Card title="Best Day" className="text-center">
            <div className="text-3xl font-bold text-earth-green-600 mb-2">
              {bestDay.footprint === Number.POSITIVE_INFINITY ? "0.0" : bestDay.footprint.toFixed(1)} kg CO2
            </div>
            <p className="text-sm text-charcoal-600">
              {bestDay.date ? new Date(bestDay.date).toLocaleDateString() : "No data yet"}
            </p>
          </Card>

          <Card title="Activities Logged" className="text-center">
            <div className="text-3xl font-bold text-sky-blue-600 mb-2">{activities.length}</div>
            <p className="text-sm text-charcoal-600">Total activities</p>
          </Card>

          <Card title="Favorite Category" className="text-center">
            <div className="text-3xl font-bold text-sand-light-600 mb-2">
              {mostUsedCategory.category.charAt(0).toUpperCase() + mostUsedCategory.category.slice(1)}
            </div>
            <p className="text-sm text-charcoal-600">{mostUsedCategory.count} activities</p>
          </Card>

          <Card title="Green Days" className="text-center">
            <div className="text-3xl font-bold text-earth-green-600 mb-2">{daysUnderAverage}</div>
            <p className="text-sm text-charcoal-600">Days under global average</p>
          </Card>
        </div>

        {/* Achievements */}
        <Card title="Achievements" subtitle="Your environmental milestones" className="mb-8">
          {badges.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className="flex items-center space-x-3 p-4 bg-gradient-to-r from-earth-green-50 to-sky-blue-50 rounded-2xl border border-earth-green-200"
                >
                  <span className="text-3xl">{badge.icon}</span>
                  <div>
                    <h4 className="font-semibold text-charcoal-800">{badge.name}</h4>
                    <p className="text-sm text-charcoal-600">{badge.description}</p>
                    <p className="text-xs text-charcoal-500 mt-1">
                      Earned {new Date(badge.earnedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Award className="w-16 h-16 text-charcoal-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-charcoal-600 mb-2">No Achievements Yet</h3>
              <p className="text-charcoal-500">Start logging activities to unlock your first badge!</p>
            </div>
          )}
        </Card>

        {/* Recent Activity */}
        <Card title="Recent Activity" subtitle="Your latest environmental actions">
          {activities.length > 0 ? (
            <div className="space-y-3">
              {activities
                .slice(-5)
                .reverse()
                .map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 bg-sand-light-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-earth-green-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-earth-green-600">
                          {activity.category.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium text-charcoal-800">
                          {activity.subcategory.charAt(0).toUpperCase() + activity.subcategory.slice(1)}
                        </h4>
                        <p className="text-sm text-charcoal-600">
                          {activity.quantity}{" "}
                          {activity.category === "transport" ? "km" : activity.category === "diet" ? "meals" : "units"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-charcoal-800">{activity.emissions.toFixed(2)} kg CO2</div>
                      <div className="text-sm text-charcoal-500">{new Date(activity.timestamp).toLocaleDateString()}</div>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-8 text-charcoal-500">
              <TrendingDown className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No activities logged yet. Start tracking to see your impact!</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

export default Profile
