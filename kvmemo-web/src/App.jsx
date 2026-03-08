import { useState } from 'react'
import { BrowserRouter, Routes, Route, useLocation, Outlet } from 'react-router-dom'
import { useGlobalStyles } from './hooks/useGlobalStyles'
import { useWebSocket } from './hooks/useWebSocket'
import Topbar from './components/layout/Topbar'
import Sidebar from './components/layout/Sidebar'
import { C } from './constants/theme'

// Pages
import Home from './pages/Home'
import Playground from './pages/Playground'
import Architecture from './pages/Architecture'
import Roadmap from './pages/Roadmap'
import GettingStarted from './pages/docs/GettingStarted'
import Commands from './pages/docs/Commands'
import Journey from './pages/Journey'
import CallStack from './pages/docs/CallStack'
import CppConcepts from './pages/docs/CppConcepts'
import { Contributing, FAQ, Changelog } from './pages/docs/Other'
import CodeExplorer from './pages/docs/CodeExplorer'

/* ── Docs layout (sidebar + main content) ── */
function DocsLayout({ sidebarOpen }) {
  return (
    <div style={{ display: 'flex', paddingTop: 56 }}>
      <Sidebar open={sidebarOpen} />
      <main style={{
        flex: 1, minWidth: 0,
        marginLeft: sidebarOpen ? 236 : 0,
        transition: 'margin-left .26s cubic-bezier(.22,1,.36,1)',
        padding: '0 48px',
        maxWidth: 800,
      }}>
        <Outlet />
      </main>
    </div>
  )
}

/* ── Full-width page layout ── */
function PageLayout({ children }) {
  return (
    <div style={{ paddingTop: 56 }}>
      {children}
    </div>
  )
}

function AppInner() {
  useGlobalStyles()
  const { status } = useWebSocket()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const location = useLocation()
  const isDocs = location.pathname.startsWith('/docs')

  return (
    <>
      <Topbar wsStatus={status} sidebarOpen={sidebarOpen} onToggle={() => setSidebarOpen(p => !p)} />

      <Routes>
        <Route path="/" element={<PageLayout><Home /></PageLayout>} />
        <Route path="/journey" element={<PageLayout><Journey /></PageLayout>} />
        <Route path="/playground" element={<PageLayout><Playground /></PageLayout>} />
        <Route path="/architecture" element={<PageLayout><Architecture /></PageLayout>} />
        <Route path="/roadmap" element={<PageLayout><Roadmap /></PageLayout>} />

        {/* Docs */}
        <Route element={<DocsLayout sidebarOpen={sidebarOpen} />}>
          <Route path="/docs/getting-started" element={<GettingStarted />} />
          <Route path="/docs/commands"        element={<Commands />} />
          <Route path="/docs/call-stack"      element={<CallStack />} />
          <Route path="/docs/contributing"    element={<Contributing />} />
          <Route path="/docs/faq"             element={<FAQ />} />
          <Route path="/docs/changelog"       element={<Changelog />} />
        </Route>

        <Route path="/docs/code-explorer" element={<div style={{paddingTop:"56px",height:"calc(100vh - 56px)",width: "100%", display:"flex",flexDirection:"column"}}><CodeExplorer /></div>} />
        <Route path="/docs/cpp-concepts" element={<div style={{paddingTop:"56px"}}><CppConcepts /></div>} />

        {/* Redirect /docs → /docs/getting-started */}
        <Route path="/docs" element={<PageLayout><GettingStarted /></PageLayout>} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  )
}
