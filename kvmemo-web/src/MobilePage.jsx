import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

/* ─── tokens ─────────────────────────────── */
const bg    = '#020817'
const bg1   = '#070f1e'
const b0    = '#1e3352'
const b1    = '#254070'
const tw    = '#f0f6fc'
const t2    = '#7a9abf'
const t3    = '#3d5a80'
const blue  = '#3b82f6'
const blue2 = '#60a5fa'
const violet= '#8b5cf6'
const green = '#10b981'
const mono  = "'JetBrains Mono', monospace"
const sans  = "'DM Sans', sans-serif"

/* ─── styles injected once ───────────────── */
function Styles() {
  useEffect(() => {
    if (document.getElementById('mp-css')) return
    const s = document.createElement('style')
    s.id = 'mp-css'
    s.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,700;9..40,800;9..40,900&family=JetBrains+Mono:wght@400;500&display=swap');

      @keyframes mp-orb1  { 0%,100%{transform:translate(0,0)} 50%{transform:translate(20px,-20px)} }
      @keyframes mp-orb2  { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-15px,18px)} }
      @keyframes mp-pulse { 0%,100%{opacity:1} 50%{opacity:.3} }
      @keyframes mp-blink { 0%,49%{opacity:1} 50%,100%{opacity:0} }
      @keyframes mp-slideU{ from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
      @keyframes mp-shimmer{
        0%  { background-position: 200% center }
        100%{ background-position: -200% center }
      }
      @keyframes mp-typeIn {
        from { width: 0 }
        to   { width: 100% }
      }

      .mp-shimmer {
        background: linear-gradient(90deg, #c9d8f0 0%, #f0f6fc 28%, #60a5fa 45%, #a78bfa 55%, #f0f6fc 72%, #c9d8f0 100%);
        background-size: 200% auto;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        animation: mp-shimmer 5s linear infinite;
      }

      .mp-btn-primary {
        display: flex; align-items: center; justify-content: center; gap: 6px;
        padding: 14px 0;
        border-radius: 12px;
        background: ${blue};
        color: #fff;
        font-size: 15px; font-weight: 700;
        font-family: ${sans};
        text-decoration: none;
        border: none; cursor: pointer;
        box-shadow: 0 0 28px rgba(59,130,246,.35);
        transition: opacity .15s, transform .15s;
        width: 100%;
      }
      .mp-btn-primary:active { opacity:.85; transform:scale(.98); }

      .mp-btn-ghost {
        display: flex; align-items: center; justify-content: center; gap: 6px;
        padding: 14px 0;
        border-radius: 12px;
        background: ${bg1};
        color: ${t2};
        font-size: 15px; font-weight: 500;
        font-family: ${sans};
        text-decoration: none;
        border: 1px solid ${b0}; cursor: pointer;
        transition: all .15s;
        width: 100%;
      }
      .mp-btn-ghost:active { border-color: ${b1}; color: ${tw}; transform:scale(.98); }

      .mp-card {
        padding: 18px;
        border-radius: 13px;
        border: 1px solid ${b0};
        background: ${bg1};
        animation: mp-slideU .4s ease both;
      }
    `
    document.head.appendChild(s)
    return () => document.getElementById('mp-css')?.remove()
  }, [])
  return null
}

/* ─── mini live terminal ─────────────────── */
const CMDS = [
  { d: 500,  k:'cmd', v:'SET user:1 "Gagan" EX 60' },
  { d: 1100, k:'ok',  v:'OK' },
  { d: 1700, k:'cmd', v:'GET user:1' },
  { d: 2200, k:'ok',  v:'"Gagan"' },
  { d: 2800, k:'cmd', v:'TTL user:1' },
  { d: 3300, k:'ok',  v:'(integer) 54' },
  { d: 3800, k:'cmd', v:'PING' },
  { d: 4200, k:'ok',  v:'PONG' },
]

function MiniTerminal() {
  const [lines, setLines] = useState([])
  const [blink, setBlink] = useState(true)
  const ref = useRef(null)

  const run = () => {
    CMDS.forEach(({ d, k, v }) =>
      setTimeout(() => setLines(p => [...p.slice(-12), { k, v }]), d)
    )
  }

  useEffect(() => {
    run()
    const loop = setInterval(() => { setLines([]); setTimeout(run, 200) }, 6000)
    const bl   = setInterval(() => setBlink(p => !p), 520)
    return () => { clearInterval(loop); clearInterval(bl) }
  }, [])

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight
  }, [lines])

  return (
    <div style={{
      borderRadius: 12,
      border: `1px solid ${b1}`,
      background: '#030810',
      overflow: 'hidden',
      boxShadow: `0 0 0 1px ${b0}, 0 20px 50px rgba(0,0,0,.6), 0 0 40px rgba(59,130,246,.06)`,
    }}>
      {/* chrome */}
      <div style={{ display:'flex', alignItems:'center', gap:5, padding:'8px 12px', borderBottom:`1px solid ${b0}`, background:'rgba(0,0,0,.3)' }}>
        {['#ff5f57','#febc2e','#28c840'].map(c => (
          <div key={c} style={{ width:9, height:9, borderRadius:'50%', background:c, opacity:.85 }} />
        ))}
        <span style={{ marginLeft:8, fontSize:10, color:t3, fontFamily:mono }}>kvmemo · live demo</span>
        <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:4 }}>
          <div style={{ width:5, height:5, borderRadius:'50%', background:green, boxShadow:`0 0 5px ${green}`, animation:'mp-pulse 2s ease infinite' }} />
          <span style={{ fontSize:9, color:green, fontFamily:mono }}>connected</span>
        </div>
      </div>
      {/* body */}
      <div ref={ref} style={{ height:150, overflowY:'auto', padding:'10px 14px', fontFamily:mono, fontSize:11.5, lineHeight:1.9 }}>
        <div style={{ color:t3, marginBottom:6, fontSize:10 }}># KVMemo v0.1.0 · in-memory · C++20</div>
        {lines.map((l, i) => (
          <div key={i}>
            {l.k === 'cmd'
              ? <span><span style={{ color:blue2, marginRight:8 }}>❯</span><span style={{ color:tw }}>{l.v}</span></span>
              : <span style={{ color:green, paddingLeft:18 }}>{l.v}</span>
            }
          </div>
        ))}
        <span style={{ color:blue2, opacity:blink?1:0, transition:'opacity .06s' }}>█</span>
      </div>
    </div>
  )
}

/* ─── stat pill ──────────────────────────── */
function Stat({ value, label, color }) {
  return (
    <div style={{
      flex: 1,
      padding: '14px 10px',
      borderRadius: 11,
      border: `1px solid ${b0}`,
      background: bg1,
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{ position:'absolute', top:0, left:'15%', right:'15%', height:2, background:`linear-gradient(90deg,transparent,${color},transparent)`, opacity:.8 }} />
      <div style={{ fontSize:20, fontWeight:800, color:tw, letterSpacing:'-.03em', fontFamily:mono }}>{value}</div>
      <div style={{ fontSize:10, color:t2, marginTop:3, lineHeight:1.4 }}>{label}</div>
    </div>
  )
}

/* ─── feature row ────────────────────────── */
function Feature({ icon, title, desc, color, delay }) {
  return (
    <div className="mp-card" style={{ animationDelay:`${delay}s`, display:'flex', gap:14, alignItems:'flex-start' }}>
      <div style={{
        width:36, height:36, borderRadius:9, flexShrink:0,
        background:`${color}18`, border:`1px solid ${color}28`,
        display:'flex', alignItems:'center', justifyContent:'center', fontSize:17,
      }}>{icon}</div>
      <div style={{ flex:1, minWidth:0 }}>
        <p style={{ margin:'0 0 4px', fontSize:13.5, fontWeight:700, color:tw, fontFamily:sans }}>{title}</p>
        <p style={{ margin:0, fontSize:12, color:t2, lineHeight:1.6 }}>{desc}</p>
      </div>
    </div>
  )
}

/* ─── main ───────────────────────────────── */
export default function MobilePage() {
  return (
    <div style={{ fontFamily:sans, background:bg, minHeight:'100vh', paddingTop:0, overflowX:'hidden' }}>
      <Styles />

      {/* ── BG orbs ── */}
      <div aria-hidden style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0, overflow:'hidden' }}>
        <div style={{ position:'absolute', width:360, height:360, borderRadius:'50%', background:'radial-gradient(circle,rgba(59,130,246,.08) 0%,transparent 65%)', top:-120, left:'-10%', animation:'mp-orb1 18s ease-in-out infinite' }} />
        <div style={{ position:'absolute', width:280, height:280, borderRadius:'50%', background:'radial-gradient(circle,rgba(139,92,246,.06) 0%,transparent 65%)', top:40, right:'-8%', animation:'mp-orb2 22s ease-in-out infinite' }} />
        <div style={{ position:'absolute', inset:0, backgroundImage:`radial-gradient(circle,rgba(30,51,82,.5) 1px,transparent 1px)`, backgroundSize:'36px 36px', maskImage:'radial-gradient(ellipse 90% 70% at 50% 0%,black 20%,transparent 100%)', WebkitMaskImage:'radial-gradient(ellipse 90% 70% at 50% 0%,black 20%,transparent 100%)' }} />
      </div>

      <div style={{ position:'relative', zIndex:1, padding:'0 20px', maxWidth:480, margin:'0 auto' }}>

        {/* ── HERO ── */}
        <section style={{ paddingTop:36, paddingBottom:32, textAlign:'center' }}>

          {/* badge */}
          <div style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'4px 12px', borderRadius:99, border:`1px solid ${b1}`, background:`${blue}0d`, marginBottom:18 }}>
            <div style={{ width:6, height:6, borderRadius:'50%', background:green, boxShadow:`0 0 6px ${green}`, animation:'mp-pulse 2s ease infinite' }} />
            <span style={{ fontSize:10.5, color:t2, letterSpacing:'.04em' }}>C++20 · In-Memory · Production Grade</span>
          </div>

          {/* headline */}
          <h1 style={{ fontSize:'clamp(32px,9vw,44px)', fontWeight:900, letterSpacing:'-.04em', lineHeight:1.06, marginBottom:14, color:tw }}>
            KVMemo<br />
            <span className="mp-shimmer">in-memory</span><br />
            <span style={{ color:t2, fontWeight:700, fontSize:'clamp(26px,7vw,36px)' }}>store in C++20</span>
          </h1>

          <p style={{ fontSize:14, color:t2, lineHeight:1.75, marginBottom:28, maxWidth:340, margin:'0 auto 28px' }}>
            High-performance key-value store with shard-based concurrency, TTL scheduling, and pluggable LRU eviction — zero dependencies.
          </p>

          {/* CTAs */}
          {/* <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:28 }}>
            <Link to="/docs/getting-started" className="mp-btn-primary">
              Get Started →
            </Link>
            <Link to="/playground" className="mp-btn-ghost">
              Try Playground
            </Link>
          </div> */}

          {/* PC notice */}
          <div style={{
            display:'inline-flex', alignItems:'center', gap:8,
            padding:'10px 16px', borderRadius:10,
            border:`1px solid ${violet}33`, background:`${violet}0a`,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="3" width="20" height="14" rx="2" stroke={violet} strokeWidth="1.8" fill="none"/>
              <path d="M8 21h8M12 17v4" stroke={violet} strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
            <span style={{ fontSize:12, color:`${violet}cc`, fontFamily:mono }}>
              Full experience on desktop
            </span>
          </div>
        </section>

        {/* ── TERMINAL ── */}
        <section style={{ marginBottom:32 }}>
          <MiniTerminal />
        </section>

        {/* ── STATS ── */}
        <section style={{ marginBottom:32 }}>
          <div style={{ display:'flex', gap:10 }}>
            <Stat value="~19M"  label={<>ops/sec<br/>GET bench</>}       color={blue}   />
            <Stat value="O(1)"  label={<>GET / SET<br/>hash sharded</>}   color={violet} />
            <Stat value="100ms" label={<>TTL tick<br/>background</>}      color={green}  />
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section style={{ marginBottom:36 }}>
          <p style={{ fontSize:11, fontWeight:600, letterSpacing:'.1em', textTransform:'uppercase', color:blue, marginBottom:6 }}>Core Features</p>
          <h2 style={{ fontSize:22, fontWeight:800, color:tw, letterSpacing:'-.03em', marginBottom:18 }}>
            Built for speed.<br />Designed to learn from.
          </h2>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            <Feature icon="⚡" color={blue}   title="Sub-ms latency"        desc="RAM-first. No disk on the hot path. GET/SET in single-digit microseconds."      delay={0}    />
            <Feature icon="🔀" color={violet} title="Shard concurrency"     desc="64 independent mutexes — no global lock, throughput scales with cores."         delay={.05}  />
            <Feature icon="⏱" color={green}  title="TTL scheduling"        desc="Background TTLManager evicts expired keys every 100ms, off the request path."   delay={.10}  />
            <Feature icon="🧠" color={blue}   title="Pluggable LRU"         desc="Eviction policy is a pure interface. Swap LRU for LFU without touching the engine." delay={.15} />
            <Feature icon="🔌" color={violet} title="JSON / WebSocket wire" desc="Plain JSON over WS. Connect from any language — no custom parser needed."      delay={.20}  />
            <Feature icon="🏗" color={green}  title="SOLID architecture"    desc="7 focused components, zero cross-layer mutation. Engine orchestrates, never implements." delay={.25} />
          </div>
        </section>

        {/* ── QUICK START ── */}
        <section style={{ marginBottom:36 }}>
          <div className="mp-card" style={{ animationDelay:'.3s' }}>
            <p style={{ margin:'0 0 12px', fontSize:11, fontWeight:600, letterSpacing:'.08em', textTransform:'uppercase', color:t3, fontFamily:mono }}>Quick Start</p>
            <div style={{ display:'flex', flexDirection:'column', gap:8, fontFamily:mono, fontSize:12 }}>
              {[
                { step:'1', cmd:'git clone github.com/Gagan2004bansal/KVMemo', color:blue2 },
                { step:'2', cmd:'cd KVMemo && mkdir build && cd build', color:t2 },
                { step:'3', cmd:'cmake .. && cmake --build .', color:t2 },
                { step:'4', cmd:'./kvmemo-server', color:green },
              ].map(({ step, cmd, color: col }) => (
                <div key={step} style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
                  <span style={{ color:t3, flexShrink:0, width:14 }}>{step}.</span>
                  <span style={{ color:col, wordBreak:'break-all', lineHeight:1.5 }}>{cmd}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA BOTTOM ── */}
        <section style={{ paddingBottom:60, textAlign:'center' }}>
          <div style={{ height:1, background:`linear-gradient(90deg,transparent,${b0},transparent)`, marginBottom:36 }} />
          <p style={{ fontSize:11, fontWeight:600, letterSpacing:'.1em', textTransform:'uppercase', color:blue, marginBottom:12 }}>MIT License · Zero Dependencies</p>
          <h2 style={{ fontSize:26, fontWeight:900, color:tw, letterSpacing:'-.03em', marginBottom:10 }}>Clone. Build. Learn.</h2>
          <p style={{ fontSize:13.5, color:t2, lineHeight:1.75, marginBottom:24 }}>Zero dependencies. Read the source — every component is focused, clean, and documented.</p>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            <a href="https://github.com/Gagan2004bansal/KVMemo" target="_blank" rel="noreferrer" className="mp-btn-primary">
              ⭐ Star on GitHub
            </a>
            <Link to="/docs/getting-started" className="mp-btn-ghost">
              Read the Docs
            </Link>
          </div>
        </section>

      </div>
    </div>
  )
}
