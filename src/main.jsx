/**
 * Main entry point for the Eco-Footprint Tracker Dashboard
 * Initializes React app with TailwindCSS styles
 */
import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App.jsx"
import Landing from "./pages/Landing.jsx"
import Dashboard from "./pages/Dashboard.jsx"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import "./styles/tailwind.css"

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<App />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
