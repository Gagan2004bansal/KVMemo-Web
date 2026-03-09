import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { C, F } from '../../constants/theme'

const LINKS = [
  { to:'/',              label:'Home' },
  { to:'/journey',       label:'Journey' },
  { to:'/playground',    label:'Playground' },
  { to:'/architecture',  label:'Architecture' },
  { to:'/roadmap',       label:'Roadmap' },
  { to:'/docs/getting-started', label:'Docs' },
]

export default function Topbar({ wsStatus, sidebarOpen, onToggle }) {
  const [scrolled, setScrolled] = useState(false)
  const loc = useLocation()
  const isDocs = loc.pathname.startsWith('/docs')

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', fn, { passive:true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const WS = {
    connected:    { col:C.green,  label:'Connected' },
    connecting:   { col:C.amber,  label:'Connecting' },
    disconnected: { col:C.t3,     label:'Offline' },
  }
  const ws = WS[wsStatus] ?? WS.disconnected

  return (
    <header style={{
      position:'fixed',top:0,left:0,right:0,zIndex:300,height:56,
      display:'flex',alignItems:'center',padding:'0 28px',
      borderBottom:`1px solid ${scrolled?C.b0:'transparent'}`,
      background:scrolled?'rgba(2,8,23,.92)':'transparent',
      backdropFilter:scrolled?'blur(20px)':'none',
      transition:'all .3s',fontFamily:F.body,
    }}>

      {/* Logo */}
      <Link to="/" style={{display:'flex',alignItems:'center',gap:10,marginRight:36,flexShrink:0}}>
        <div style={{
          width:32,height:32,borderRadius:9,flexShrink:0,
          background: 'blue',
          // background:`linear-gradient(135deg,${C.blue},${C.violet})`,
          display:'flex',alignItems:'center',justifyContent:'center',
          fontFamily:F.mono,fontSize:11,fontWeight:700,color:'#fff',
          boxShadow:`0 0 20px ${C.gB}`,
        }}>KV</div>
        <span style={{fontSize:15,fontWeight:700,color:C.tw,letterSpacing:'-.015em'}}>KVMemo</span>
        <span style={{fontSize:10,color:C.t3,padding:'1px 7px',borderRadius:5,border:`1px solid ${C.b0}`,fontFamily:F.mono}}>v0.1</span>
      </Link>

      {/* Nav */}
      <nav style={{display:'flex',gap:2,flex:1}}>
        {LINKS.map(({ to, label }) => {
          const active = to==='/'?loc.pathname==='/':loc.pathname.startsWith(to)
          return (
            <Link key={to} to={to} style={{
              padding:'6px 13px',borderRadius:7,fontSize:13.5,fontWeight:500,
              color:active?C.tw:C.t2,
              background:active?C.bg2:'transparent',
              border:`1px solid ${active?C.b0:'transparent'}`,
              transition:'all .15s',
            }}
              onMouseEnter={e=>{if(!active){e.currentTarget.style.color=C.t1;e.currentTarget.style.background=C.bg2+'80'}}}
              onMouseLeave={e=>{if(!active){e.currentTarget.style.color=C.t2;e.currentTarget.style.background='transparent'}}}
            >{label}</Link>
          )
        })}
      </nav>

      {/* Right */}
      <div style={{display:'flex',alignItems:'center',gap:12}}>
        {/* WS */}
        <div style={{display:'flex',alignItems:'center',gap:5,fontSize:11,color:ws.col,fontFamily:F.mono,flexShrink:0}}>
          <div style={{width:6,height:6,borderRadius:'50%',background:ws.col,boxShadow:`0 0 6px ${ws.col}`,animation:wsStatus==='connecting'?'pulse .9s ease infinite':'none'}}/>
          <span>{ws.label}</span>
        </div>

        {/* Sidebar toggle (docs only) */}
        {isDocs && (
          <button onClick={onToggle} style={{width:32,height:32,borderRadius:7,border:`1px solid ${C.b0}`,background:sidebarOpen?C.bg2:'transparent',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:4,transition:'all .15s'}}
            onMouseEnter={e=>e.currentTarget.style.borderColor=C.b1}
            onMouseLeave={e=>e.currentTarget.style.borderColor=C.b0}
          >
            {[0,1,2].map(i=>(
              <div key={i} style={{width:sidebarOpen&&i===1?10:15,height:1.5,background:C.t2,borderRadius:1,transition:'width .2s'}}/>
            ))}
          </button>
        )}

        {/* GitHub */}
        <a href="https://github.com/Gagan2004bansal/KVMemo" target="_blank" rel="noreferrer"
          style={{display:'flex',alignItems:'center',gap:7,padding:'7px 15px',borderRadius:8,border:`1px solid ${C.b0}`,background:C.bg1,color:C.t2,fontSize:12.5,fontWeight:500,transition:'all .15s',flexShrink:0}}
          onMouseEnter={e=>{e.currentTarget.style.borderColor=C.b1;e.currentTarget.style.color=C.tw}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor=C.b0;e.currentTarget.style.color=C.t2}}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
          </svg>
          GitHub
        </a>
      </div>
    </header>
  )
}
