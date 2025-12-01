import React from 'react'
import { createRoot } from 'react-dom/client'
import DemoApp from './features/pages/DemoApp.jsx'
import './index.css'

document.addEventListener('DOMContentLoaded', function() {
  createRoot(document.getElementById('root'))
    .render(<DemoApp />)
})
