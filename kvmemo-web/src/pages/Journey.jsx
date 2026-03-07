import { useState, useEffect, useRef, useCallback } from 'react'

/* ═══════════════════════════════════════════════════════════
   DESIGN TOKENS
═══════════════════════════════════════════════════════════ */
const C = {
  bg: '#020817', bg1: '#0a1628', bg2: '#0f1f36', bg3: '#162845',
  b0: '#1e3352', b1: '#254070', b2: '#2e5090',
  tw: '#f0f6fc', t1: '#c9d8f0', t2: '#7a9abf', t3: '#3d5a80', t4: '#1a2e4a',
  blue: '#3b82f6', blue2: '#60a5fa', blue3: '#93c5fd',
  cyan: '#06b6d4', cyan2: '#22d3ee',
  violet: '#8b5cf6', green: '#10b981', green2: '#34d399',
  amber: '#f59e0b', rose: '#f43f5e',
  alum: '#e8e8ed', alumDark: '#c8c8d0', alumEdge: '#b0b0b8',
  alumDeep: '#a0a0a8', chinColor: '#d4d4da', standC: '#ccccD4',
}

const AppleLogo = ({ size = 20, color = "#000" }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="black" class="bi bi-apple" viewBox="0 0 16 16">
      <path d="M11.182.008C11.148-.03 9.923.023 8.857 1.18c-1.066 1.156-.902 2.482-.878 2.516s1.52.087 2.475-1.258.762-2.391.728-2.43m3.314 11.733c-.048-.096-2.325-1.234-2.113-3.422s1.675-2.789 1.698-2.854-.597-.79-1.254-1.157a3.7 3.7 0 0 0-1.563-.434c-.108-.003-.483-.095-1.254.116-.508.139-1.653.589-1.968.607-.316.018-1.256-.522-2.267-.665-.647-.125-1.333.131-1.824.328-.49.196-1.422.754-2.074 2.237-.652 1.482-.311 3.83-.067 4.56s.625 1.924 1.273 2.796c.576.984 1.34 1.667 1.659 1.899s1.219.386 1.843.067c.502-.308 1.408-.485 1.766-.472.357.013 1.061.154 1.782.539.571.197 1.111.115 1.652-.105.541-.221 1.324-1.059 2.238-2.758q.52-1.185.473-1.282" />
      <path d="M11.182.008C11.148-.03 9.923.023 8.857 1.18c-1.066 1.156-.902 2.482-.878 2.516s1.52.087 2.475-1.258.762-2.391.728-2.43m3.314 11.733c-.048-.096-2.325-1.234-2.113-3.422s1.675-2.789 1.698-2.854-.597-.79-1.254-1.157a3.7 3.7 0 0 0-1.563-.434c-.108-.003-.483-.095-1.254.116-.508.139-1.653.589-1.968.607-.316.018-1.256-.522-2.267-.665-.647-.125-1.333.131-1.824.328-.49.196-1.422.754-2.074 2.237-.652 1.482-.311 3.83-.067 4.56s.625 1.924 1.273 2.796c.576.984 1.34 1.667 1.659 1.899s1.219.386 1.843.067c.502-.308 1.408-.485 1.766-.472.357.013 1.061.154 1.782.539.571.197 1.111.115 1.652-.105.541-.221 1.324-1.059 2.238-2.758q.52-1.185.473-1.282" />
    </svg>
  );
};

/* ═══════════════════════════════════════════════════════════
   GLOBAL STYLES
═══════════════════════════════════════════════════════════ */
function Styles() {
  useEffect(() => {
    if (document.getElementById('kj2')) return
    const s = document.createElement('style')
    s.id = 'kj2'
    s.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&family=JetBrains+Mono:wght@400;500;600&display=swap');
      *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
      html{scroll-behavior:smooth}
      body{background:#020817;color:#c9d8f0;font-family:'DM Sans',sans-serif;overflow-x:hidden;-webkit-font-smoothing:antialiased}
      ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:#1e3352;border-radius:2px}
      ::selection{background:rgba(59,130,246,.25);color:#f0f6fc}

      @keyframes fadeUp   {from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}
      @keyframes fadeIn   {from{opacity:0}to{opacity:1}}
      @keyframes slideL   {from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:none}}
      @keyframes blink    {0%,100%{opacity:1}50%{opacity:0}}
      @keyframes pulse    {0%,100%{opacity:1}50%{opacity:.2}}
      @keyframes shimmer  {0%{background-position:200% center}100%{background-position:-200% center}}
      @keyframes float    {0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}
      @keyframes orb1     {0%,100%{transform:translate(0,0)}50%{transform:translate(50px,-40px)}}
      @keyframes orb2     {0%,100%{transform:translate(0,0)}50%{transform:translate(-40px,50px)}}
      @keyframes screenOn {0%{opacity:0;filter:brightness(0) blur(4px)}50%{opacity:.9;filter:brightness(1.3) blur(0px)}100%{opacity:1;filter:brightness(1)}}
      @keyframes glow     {0%,100%{opacity:.7}50%{opacity:1}}
      @keyframes popIn    {0%{opacity:0;transform:scale(.94) translateY(4px)}100%{opacity:1;transform:none}}
      @keyframes bounce   {0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}

      .shimmer-text{
        background:linear-gradient(90deg,#c9d8f0 0%,#f0f6fc 30%,#60a5fa 50%,#f0f6fc 70%,#c9d8f0 100%);
        background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
        animation:shimmer 4s linear infinite;
      }
    `
    document.head.appendChild(s)
    return () => document.getElementById('kj2')?.remove()
  }, [])
  return null
}

/* ═══════════════════════════════════════════════════════════
   ACT DATA
═══════════════════════════════════════════════════════════ */
const ACTS = [
  {
    id: 0, emoji: '📦', title: 'Download', tagline: "Get the code", color: C.blue,
    lines: [
      { t: 200, k: 'sys', v: '# ─── Step 1: Download KVMemo ───────────────────' },
      { t: 900, k: 'sys', v: '# Like cloning a recipe book onto your shelf' },
      { t: 1500, k: 'cmd', v: 'git clone https://github.com/Gagan2004bansal/KVMemo.git' },
      { t: 2100, k: 'info', v: "Cloning into 'KVMemo'..." },
      { t: 2500, k: 'prog', v: 'remote: Enumerating objects: 247, done.' },
      { t: 2900, k: 'prog', v: 'remote: Counting objects: 100% (247/247)' },
      { t: 3300, k: 'prog', v: 'Receiving objects: 100% (247/247), 84.3 KiB | 2.1 MiB/s' },
      { t: 3700, k: 'prog', v: 'Resolving deltas: 100% (89/89), done.' },
      { t: 4200, k: 'ok', v: '✓  Repository cloned — KVMemo/ is on your machine!' },
      { t: 4700, k: 'cmd', v: 'cd KVMemo' },
      { t: 5100, k: 'ok', v: '✓  You are inside the KVMemo folder.' },
    ],
  },
  {
    id: 1, emoji: '🗂', title: 'Explore', tagline: "See what's inside", color: C.cyan,
    lines: [
      { t: 200, k: 'sys', v: '# ─── Step 2: Explore the project ───────────────' },
      { t: 900, k: 'sys', v: '# 12 components, 0 external dependencies' },
      { t: 1500, k: 'cmd', v: 'ls -la' },
      { t: 1900, k: 'tree', v: 'KVMemo/' },
      { t: 2020, k: 'tree', v: '├── src/' },
      { t: 2140, k: 'tree', v: '│   ├── engine/      ← KVEngine, ShardManager, Shard' },
      { t: 2280, k: 'tree', v: '│   ├── ttl/         ← TTLIndex + TTLManager (100ms)' },
      { t: 2420, k: 'tree', v: '│   ├── eviction/    ← LRU EvictionManager' },
      { t: 2560, k: 'tree', v: '│   ├── server/      ← TcpServer, Connection' },
      { t: 2700, k: 'tree', v: '│   └── protocol/    ← Parser, Dispatcher, Registry' },
      { t: 2840, k: 'tree', v: '├── tests/' },
      { t: 2980, k: 'tree', v: '└── CMakeLists.txt' },
      { t: 3500, k: 'ok', v: '✓  Each folder owns exactly one concern.' },
      { t: 3900, k: 'ok', v: '✓  Zero third-party libraries — built from scratch!' },
    ],
  },
  {
    id: 2, emoji: '⚙️', title: 'Build', tagline: "Compile it", color: C.amber,
    lines: [
      { t: 200, k: 'sys', v: '# ─── Step 3: Build with CMake ──────────────────' },
      { t: 900, k: 'sys', v: '# Translates C++ source into a runnable binary' },
      { t: 1500, k: 'cmd', v: 'mkdir build && cd build' },
      { t: 2000, k: 'cmd', v: 'cmake .. -DCMAKE_BUILD_TYPE=Release' },
      { t: 2500, k: 'info', v: '-- CXX compiler: GNU 12.3.0' },
      { t: 2800, k: 'info', v: '-- C++20 standard: enabled' },
      { t: 3100, k: 'info', v: '-- Optimization: -O2 -DNDEBUG' },
      { t: 3500, k: 'cmd', v: 'cmake --build . --parallel 8' },
      { t: 3900, k: 'prog', v: '[ 12%] Compiling kv_engine.cpp' },
      { t: 4300, k: 'prog', v: '[ 37%] Compiling shard_manager.cpp' },
      { t: 4700, k: 'prog', v: '[ 62%] Compiling ttl_manager.cpp' },
      { t: 5100, k: 'prog', v: '[ 88%] Compiling tcp_server.cpp' },
      { t: 5500, k: 'prog', v: '[100%] Linking → kvmemo-server' },
      { t: 6000, k: 'ok', v: '✓  Build complete! Binary ready: ./kvmemo-server' },
    ],
  },
  {
    id: 3, emoji: '🚀', title: 'Run & Use', tagline: "It's alive!", color: C.green,
    lines: [
      { t: 200, k: 'sys', v: '# ─── Step 4: Start the server ──────────────────' },
      { t: 900, k: 'cmd', v: './kvmemo-server' },
      { t: 1300, k: 'logo', v: '' },
      { t: 1400, k: 'logo', v: '  ██╗  ██╗██╗   ██╗███╗   ███╗███████╗███╗   ███╗ ██████╗' },
      { t: 1500, k: 'logo', v: '  ██║ ██╔╝██║   ██║████╗ ████║██╔════╝████╗ ████║██╔═══██╗' },
      { t: 1600, k: 'logo', v: '  █████╔╝ ██║   ██║██╔████╔██║█████╗  ██╔████╔██║██║   ██║' },
      { t: 1700, k: 'logo', v: '  ██╔═██╗ ╚██╗ ██╔╝██║╚██╔╝██║██╔══╝  ██║╚██╔╝██║██║   ██║' },
      { t: 1800, k: 'logo', v: '  ██║  ██╗  ╚████╔╝ ██║ ╚═╝ ██║███████╗██║ ╚═╝ ██║╚██████╔╝' },
      { t: 1900, k: 'logo', v: '  ╚═╝  ╚═╝   ╚═══╝  ╚═╝     ╚═╝╚══════╝╚═╝     ╚═╝ ╚═════╝' },
      { t: 2000, k: 'logo', v: '' },
      { t: 2100, k: 'ok', v: '  v0.1.0-dev  ·  C++20  ·  16 shards  ·  MIT License' },
      { t: 2400, k: 'sys', v: '' },
      { t: 2600, k: 'info', v: '[server]   Bound to 127.0.0.1:6379' },
      { t: 2900, k: 'info', v: '[shards]   16 shards initialized' },
      { t: 3200, k: 'info', v: '[ttl]      TTLManager started — tick: 100ms' },
      { t: 3500, k: 'ok', v: '[ready]    ✓  Accepting connections...' },
      { t: 4000, k: 'sys', v: '' },
      { t: 4100, k: 'sys', v: '# Try some commands:' },
      { t: 4600, k: 'cmd', v: 'SET name "Gagan Bansal" EX 60' },
      { t: 5000, k: 'ok', v: '→ OK' },
      { t: 5300, k: 'cmd', v: 'GET name' },
      { t: 5700, k: 'ok', v: '→ "Gagan Bansal"' },
      { t: 6000, k: 'cmd', v: 'TTL name' },
      { t: 6400, k: 'ok', v: '→ (integer) 57' },
      { t: 6700, k: 'cmd', v: 'PING' },
      { t: 7100, k: 'ok', v: '→ PONG  🎉  You\'re in!' },
    ],
  },
]

/* ═══════════════════════════════════════════════════════════
   TERMINAL
═══════════════════════════════════════════════════════════ */
function Terminal({ act, screenOn, onComplete }) {
  const [lines, setLines] = useState([])
  const [blink, setBlink] = useState(true)
  const [done, setDone] = useState(false)
  const bodyRef = useRef(null)
  const timers = useRef([])
  const actData = ACTS[act]

  useEffect(() => {
    timers.current.forEach(id => { clearTimeout(id); clearInterval(id) })
    timers.current = []
    setLines([])
    setDone(false)
    if (!screenOn) return

    actData.lines.forEach(({ t, k, v }) => {
      const id = setTimeout(() => {
        setLines(p => [...p, { k, v }])
        requestAnimationFrame(() => {
          if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight
        })
      }, t)
      timers.current.push(id)
    })

    const maxT = Math.max(...actData.lines.map(l => l.t)) + 900
    const did = setTimeout(() => { setDone(true); onComplete?.() }, maxT)
    timers.current.push(did)

    const bl = setInterval(() => setBlink(p => !p), 530)
    timers.current.push(bl)
    return () => { timers.current.forEach(id => { clearTimeout(id); clearInterval(id) }) }
  }, [act, screenOn])

  const col = k => ({
    sys: '#334e6a', cmd: '#e8f0fc', ok: '#34d399',
    info: '#4a7499', prog: '#60a5fa', tree: '#22d3ee', logo: '#3b82f6',
  }[k] || '#c9d8f0')

  if (!screenOn) {
    return (
      <div style={{ width: '100%', height: '100%', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 10 }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#1e3352' }} />
        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: '#1a2e4a', letterSpacing: '.14em', textTransform: 'uppercase' }}>Display Off</span>
      </div>
    )
  }

  return (
    <div style={{ width: '100%', height: '100%', background: '#04080f', display: 'flex', flexDirection: 'column', animation: 'screenOn .65s ease both', overflow: 'hidden' }}>
      {/* Chrome bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 14px', background: 'rgba(0,0,0,.55)', borderBottom: '1px solid rgba(255,255,255,.05)', flexShrink: 0 }}>
        {['#ff5f57', '#febc2e', '#28c840'].map(c => (
          <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c, opacity: .85, cursor: 'pointer', transition: 'filter .15s' }}
            onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.3)'}
            onMouseLeave={e => e.currentTarget.style.filter = ''}
          />
        ))}
        <span style={{ marginLeft: 8, fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: '#2e4a68' }}>
          kvmemo@studio — {actData.title.toLowerCase()}
        </span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: actData.color, boxShadow: `0 0 5px ${actData.color}`, animation: 'glow 2s ease infinite' }} />
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8.5, color: actData.color }}>{actData.emoji} {actData.title}</span>
        </div>
      </div>

      {/* Scanlines */}
      <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,.05) 3px,rgba(0,0,0,.05) 4px)', pointerEvents: 'none', zIndex: 3, borderRadius: 'inherit' }} />

      {/* Lines */}
      <div ref={bodyRef} style={{ flex: 1, overflowY: 'auto', padding: '10px 16px 4px', scrollbarWidth: 'none' }}>
        {lines.map((l, i) => (
          <div key={i} style={{ display: 'flex', fontFamily: "'JetBrains Mono',monospace", fontSize: 9.5, lineHeight: 1.9, color: col(l.k), animation: i === lines.length - 1 ? 'slideL .1s ease' : 'none', whiteSpace: 'pre' }}>
            {l.k === 'cmd' && <span style={{ color: actData.color, marginRight: 7, flexShrink: 0 }}>❯</span>}
            <span style={{ wordBreak: 'break-all', whiteSpace: 'pre-wrap' }}>{l.v}</span>
          </div>
        ))}
        {done && (
          <div style={{ margin: '8px 0 4px', padding: '6px 12px', borderRadius: 5, background: `${actData.color}18`, border: `1px solid ${actData.color}40`, display: 'flex', alignItems: 'center', gap: 8, animation: 'popIn .3s ease' }}>
            <span style={{ fontSize: 12 }}>{actData.emoji}</span>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: actData.color, fontWeight: 600 }}>{actData.tagline} — complete</span>
          </div>
        )}
        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: actData.color, opacity: blink ? 1 : 0, transition: 'opacity .08s' }}>█</span>
      </div>

      {/* Status bar */}
      <div style={{ padding: '3px 14px', borderTop: '1px solid rgba(255,255,255,.03)', background: 'rgba(0,0,0,.4)', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: "'JetBrains Mono',monospace", fontSize: 8, color: '#254070' }}>
          <div style={{ width: 4, height: 4, borderRadius: '50%', background: C.green, boxShadow: `0 0 4px ${C.green}`, animation: 'glow 1.5s ease infinite' }} />
          KVMemo v0.1.0
        </div>
        <span style={{ marginLeft: 'auto', fontFamily: "'JetBrains Mono',monospace", fontSize: 8, color: '#254070' }}>step {act + 1}/4</span>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   APPLE STUDIO DISPLAY
═══════════════════════════════════════════════════════════ */
function StudioDisplay({ act, screenOn, onComplete, onToggle }) {
  const [hovered, setHovered] = useState(false)

  // Proportions based on real 27" Studio Display: 623.9 x 478.9mm body
  // Screen 600.0 x 337.5mm (16:9) inside the chassis
  const W = 740    // chassis width  (px)
  const bezelT = 15     // top + side bezel (thin)
  const bezelS = 15
  const chin = 60     // bottom chin (thicker, contains camera)
  const sW = W - bezelS * 2
  const sH = Math.round(sW * 9 / 16)
  const totalH = bezelT + sH + chin

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

      {/* ── DISPLAY ── */}
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          position: 'relative', width: W, height: totalH,
          animation: hovered ? 'none' : 'float 5.5s ease-in-out infinite',
          filter: [
            'drop-shadow(0 35px 70px rgba(0,0,0,.6))',
            `drop-shadow(0 0 ${screenOn ? 90 : 20}px rgba(59,130,246,${screenOn ? .14 : .03}))`,
          ].join(' '),
          transition: 'filter .7s ease',
          willChange: 'transform',
        }}
      >

        {/* Outer chassis — aluminum */}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 20,
          background: `linear-gradient(170deg, ${C.alum} 0%, ${C.alumDark} 55%, #b4b4bc 100%)`,
          boxShadow: [
            'inset 0 1.5px 0 rgba(255,255,255,.75)',
            'inset 0 -1.5px 0 rgba(0,0,0,.12)',
            'inset 1.5px 0 0 rgba(255,255,255,.35)',
            'inset -1.5px 0 0 rgba(0,0,0,.08)',
            '0 1px 0 rgba(255,255,255,.12)',
          ].join(','),
        }} />

        {/* Highlight edge — top rounded chamfer */}
        <div style={{ position: 'absolute', top: 0, left: 20, right: 20, height: 1.5, borderRadius: 1, background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,.6) 20%, rgba(255,255,255,.8) 50%, rgba(255,255,255,.6) 80%, transparent 100%)' }} />

        {/* Chin (slightly lighter) */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: chin,
          borderRadius: '0 0 20px 20px',
          background: `linear-gradient(180deg, ${C.chinColor} 0%, #c8c8d0 100%)`,
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,.2)',
        }}>
          {/* FaceTime camera + Studio Display label */}
          <div style={{ position: 'absolute', top: '46%', left: '50%', transform: 'translate(-50%,-50%)', display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Camera lens */}
            {/* <div style={{ width:10, height:10, borderRadius:'50%', background:'#1c1c1e', border:'1.5px solid #3a3a3e', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'inset 0 0 4px rgba(0,0,0,.6), 0 0 0 1px rgba(255,255,255,.06)' }}>
              <div style={{ width:4, height:4, borderRadius:'50%', background:'#2a2a2e' }}/>
            </div> */}
            <AppleLogo size={24} color="#000" />
            {/* <span style={{ fontSize:9.5, color:'#888', fontFamily:"'DM Sans',sans-serif", letterSpacing:'.04em' }}>Studio Display</span> */}
          </div>

          {/* Power LED (clickable) */}
          <div onClick={onToggle} title={screenOn ? 'Turn off' : 'Turn on'} style={{
            position: 'absolute', bottom: 13, right: 20, width: 11, height: 11,
            borderRadius: '50%', cursor: 'pointer', zIndex: 10, transition: 'all .3s',
            background: screenOn ? C.green : '#404048',
            boxShadow: screenOn ? `0 0 8px ${C.green}, 0 0 18px ${C.green}55` : 'none',
            animation: screenOn ? 'glow 2.5s ease infinite' : 'none',
          }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.4)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          />

          {/* Bottom port row */}
          <div style={{ position: 'absolute', bottom: 4, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 5, alignItems: 'center' }}>
            {[14, 8, 8, 8].map((w, i) => <div key={i} style={{ width: w, height: 3, borderRadius: 1.5, background: '#aaaaB2', opacity: .4 }} />)}
          </div>
        </div>

        {/* ── SCREEN ── */}
        <div style={{
          position: 'absolute', top: bezelT, left: bezelS, width: sW, height: sH,
          borderRadius: 5, overflow: 'hidden',
          background: '#000',
          boxShadow: [
            'inset 0 0 0 1px rgba(0,0,0,.5)',
            screenOn ? `0 0 0 1px rgba(30,51,82,.4), 0 0 50px rgba(6,18,40,.9)` : '0 0 0 1px rgba(0,0,0,.4)',
          ].join(','),
          transition: 'box-shadow .5s ease',
        }}>
          <Terminal act={act} screenOn={screenOn} onComplete={onComplete} />

          {/* Glare */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(130deg,rgba(255,255,255,.04) 0%,transparent 45%,transparent 75%,rgba(255,255,255,.02) 100%)', pointerEvents: 'none', zIndex: 10 }} />

          {/* Subtle vignette */}
          {screenOn && <div style={{ position: 'absolute', inset: 0, boxShadow: 'inset 0 0 40px rgba(0,0,0,.35)', pointerEvents: 'none', zIndex: 9 }} />}
        </div>
      </div>

      {/* ── STAND ── (tilt-adjustable style — straight single-arm) */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: -3 }}>
        {/* Neck — tapers slightly */}
        <div style={{
          width: 72, height: 120,
          background: `linear-gradient(180deg, ${C.alumDark} 0%, ${C.standC} 45%, ${C.alumEdge} 100%)`,
          clipPath: 'polygon(28% 0%, 72% 0%, 82% 100%, 18% 100%)',
          position: 'relative',
          boxShadow: '2px 0 8px rgba(0,0,0,.18), -1px 0 4px rgba(0,0,0,.1)',
        }}>
          {/* Center groove */}
          <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 2.5, height: '100%', background: 'linear-gradient(180deg,rgba(0,0,0,.12),rgba(0,0,0,.06))', borderRadius: 2 }} />
        </div>

        {/* Foot */}
        <div style={{
          width: 230, height: 20, marginTop: -2,
          borderRadius: '0 0 14px 14px',
          background: `linear-gradient(180deg, ${C.alumEdge} 0%, ${C.alumDeep} 55%, #888892 100%)`,
          boxShadow: [
            '0 4px 18px rgba(0,0,0,.38)',
            'inset 0 1px 0 rgba(255,255,255,.28)',
            'inset 0 -1.5px 0 rgba(0,0,0,.22)',
          ].join(','),
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: 0, left: '15%', right: '15%', height: 1, background: 'rgba(255,255,255,.45)', borderRadius: 1 }} />
        </div>

        {/* Floor shadow */}
        <div style={{ width: 320, height: 10, borderRadius: '50%', background: 'radial-gradient(ellipse,rgba(0,0,0,.28) 0%,transparent 70%)', filter: 'blur(8px)', marginTop: 6 }} />
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   ACT TABS
═══════════════════════════════════════════════════════════ */
function ActTabs({ active, onSelect, completed }) {
  return (
    <div style={{ display: 'flex', gap: 7, justifyContent: 'center', flexWrap: 'wrap' }}>
      {ACTS.map(a => {
        const sel = active === a.id
        const done = completed.has(a.id)
        return (
          <button key={a.id} onClick={() => onSelect(a.id)} style={{
            display: 'flex', alignItems: 'center', gap: 9,
            padding: '10px 20px', borderRadius: 12,
            border: `1px solid ${sel ? a.color + '66' : done ? a.color + '28' : C.b0}`,
            background: sel ? `${a.color}14` : done ? `${a.color}07` : C.bg1,
            cursor: 'pointer', outline: 'none',
            boxShadow: sel ? `0 0 24px ${a.color}22,inset 0 0 0 1px ${a.color}22` : 'none',
            transition: 'all .2s',
          }}
            onMouseEnter={e => { if (!sel) { e.currentTarget.style.borderColor = `${a.color}40`; e.currentTarget.style.background = `${a.color}09` } }}
            onMouseLeave={e => { if (!sel) { e.currentTarget.style.borderColor = done ? `${a.color}28` : C.b0; e.currentTarget.style.background = done ? `${a.color}07` : C.bg1 } }}
          >
            <span style={{ fontSize: 16 }}>{done && !sel ? '✓' : a.emoji}</span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: sel ? a.color : done ? a.color + '99' : C.t1, fontFamily: "'DM Sans',sans-serif" }}>
                <span style={{ opacity: .45, marginRight: 5, fontFamily: "'JetBrains Mono',monospace", fontSize: 9.5 }}>{String(a.id + 1).padStart(2, '0')}</span>
                {a.title}
              </div>
              <div style={{ fontSize: 9.5, color: sel ? a.color + 'cc' : C.t3, fontFamily: "'DM Sans',sans-serif" }}>{a.tagline}</div>
            </div>
          </button>
        )
      })}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   PROGRESS RAIL
═══════════════════════════════════════════════════════════ */
function ProgressRail({ active, completed }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, margin: '22px 0 30px' }}>
      {ACTS.map((a, i) => {
        const done = completed.has(a.id)
        const sel = active === a.id
        return (
          <div key={a.id} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {sel && <div style={{ position: 'absolute', width: 24, height: 24, borderRadius: '50%', background: `${a.color}20`, animation: 'pulse 1.5s ease infinite' }} />}
              <div style={{ width: sel ? 15 : 10, height: sel ? 15 : 10, borderRadius: '50%', zIndex: 1, background: sel ? a.color : done ? a.color : C.b0, boxShadow: sel ? `0 0 14px ${a.color}` : done ? `0 0 6px ${a.color}55` : 'none', transition: 'all .3s' }} />
            </div>
            {i < ACTS.length - 1 && (
              <div style={{ width: 90, height: 2, background: C.b0, margin: '0 3px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(90deg,${ACTS[i].color},${ACTS[i + 1].color})`, transform: done ? 'scaleX(1)' : 'scaleX(0)', transformOrigin: 'left', transition: 'transform .6s ease' }} />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   CONTROLS
═══════════════════════════════════════════════════════════ */
function Controls({ screenOn, playing, onToggle, onPlay, onPause, onRestart }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, flexWrap: 'wrap', margin: '14px 0 18px' }}>
      <button onClick={onToggle} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 16px', borderRadius: 9, border: `1px solid ${screenOn ? C.green + '44' : C.b0}`, background: screenOn ? `${C.green}0a` : C.bg1, color: screenOn ? C.green2 : C.t2, fontSize: 12, fontWeight: 600, cursor: 'pointer', outline: 'none', transition: 'all .2s', fontFamily: "'DM Sans',sans-serif" }}
        onMouseEnter={e => e.currentTarget.style.opacity = '.75'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}
      >
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: screenOn ? C.green : '#505058', display: 'inline-block', boxShadow: screenOn ? `0 0 6px ${C.green}` : 'none', flexShrink: 0 }} />
        {screenOn ? 'Display On' : 'Display Off'}
      </button>

      <button onClick={playing ? onPause : onPlay} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 24px', borderRadius: 9, border: `1px solid ${playing ? C.blue + '66' : C.b1}`, background: playing ? `${C.blue}14` : C.bg1, color: playing ? C.blue2 : C.t1, fontSize: 12, fontWeight: 700, cursor: 'pointer', outline: 'none', transition: 'all .2s', fontFamily: "'DM Sans',sans-serif", boxShadow: playing ? `0 0 20px ${C.blue}20` : 'none' }}
        onMouseEnter={e => e.currentTarget.style.opacity = '.8'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}
      >
        {playing ? <><span style={{ display: 'inline-block', width: 8, height: 8, background: C.blue2, borderRadius: 1 }} /> Pause</> : <><span>▶</span> Auto-play all</>}
      </button>

      <button onClick={onRestart} style={{ padding: '7px 16px', borderRadius: 9, border: `1px solid ${C.b0}`, background: 'transparent', color: C.t2, fontSize: 12, cursor: 'pointer', outline: 'none', transition: 'all .15s', fontFamily: "'DM Sans',sans-serif" }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = C.b1; e.currentTarget.style.color = C.t1 }} onMouseLeave={e => { e.currentTarget.style.borderColor = C.b0; e.currentTarget.style.color = C.t2 }}
      >↺ Restart</button>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   FLOW DIAGRAM
═══════════════════════════════════════════════════════════ */
const FLOWS = [
  { nodes: [{ l: 'GitHub', c: C.blue }, { l: 'git clone', c: C.blue2 }, { l: 'Local disk', c: C.cyan }], desc: 'Git downloads all objects over HTTPS and reconstructs the full repository — every file, commit, and history — on your machine.' },
  { nodes: [{ l: 'src/', c: C.cyan }, { l: 'engine/', c: C.violet }, { l: 'ttl/', c: C.amber }, { l: 'eviction/', c: C.green }, { l: 'server/', c: C.blue }], desc: '12 components, 5 layers. No cross-layer mutation. Each folder owns exactly one concern and never reaches into another.' },
  { nodes: [{ l: 'CMakeLists.txt', c: C.amber }, { l: 'CMake', c: C.amber }, { l: 'GCC/Clang', c: C.rose }, { l: '12× .o files', c: C.violet }, { l: 'kvmemo-server', c: C.green }], desc: 'CMake resolves dependencies and build order. Each .cpp compiles to machine code (.o), then the linker combines all into one binary.' },
  { nodes: [{ l: 'TCP socket', c: C.cyan }, { l: 'Parser', c: C.amber }, { l: 'Dispatcher', c: C.blue }, { l: 'KVEngine', c: C.violet }, { l: 'Shard[N]', c: C.blue2 }, { l: '→ OK', c: C.green }], desc: 'Every command takes this exact path in < 1ms. The shard\'s mutex is the only lock — 15 other shards stay fully unblocked.' },
]

function FlowDiagram({ activeAct }) {
  const { nodes, desc } = FLOWS[activeAct]
  return (
    <div style={{ borderRadius: 12, border: `1px solid ${C.b0}`, background: C.bg1, padding: '16px 20px', marginBottom: 18 }}>
      <p style={{ fontSize: 10, color: C.t3, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 12, fontFamily: "'JetBrains Mono',monospace" }}>What's happening under the hood</p>
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 5, marginBottom: 12 }}>
        {nodes.map((n, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ padding: '5px 12px', borderRadius: 6, background: `${n.c}14`, border: `1px solid ${n.c}30`, color: n.c, fontSize: 11, fontFamily: "'JetBrains Mono',monospace", animation: `fadeIn .3s ${i * .07}s ease both` }}>{n.l}</div>
            {i < nodes.length - 1 && <span style={{ color: C.t4, fontSize: 12, flexShrink: 0 }}>→</span>}
          </div>
        ))}
      </div>
      <p key={activeAct} style={{ fontSize: 12.5, color: C.t2, lineHeight: 1.75, animation: 'fadeIn .3s ease' }}>{desc}</p>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   STEP CARDS
═══════════════════════════════════════════════════════════ */
const STEPS = [
  {
    color: C.blue, icon: '📦', n: '01', title: 'Download the Project',
    simple: '"Like copying a recipe book from the library — you get the full source code on your shelf."',
    analogy: "Git downloads the entire codebase from GitHub — every C++ file, build script, and test. You now own a working copy you can build anything from. Think of it as cloning a recipe book: the original stays on GitHub, your copy lives locally.",
    tech: "git clone traverses GitHub's object store over HTTPS, transfers pack files (compressed commits + file trees), then reconstructs the working tree in a new KVMemo/ directory on disk.",
    cmd: 'git clone https://github.com/Gagan2004bansal/KVMemo.git', time: '~10 seconds'
  },
  {
    color: C.cyan, icon: '🗂', n: '02', title: 'Explore the Files',
    simple: '"Checking where the ingredients are before you start cooking."',
    analogy: "Before making a complex dish you check which ingredients are where. KVMemo has 12 C++ components each in its own folder — the engine folder handles data, ttl/ manages expiry timers, eviction/ decides what to throw out when memory fills up.",
    tech: "src/ is split into 5 layers: engine (KVEngine, ShardManager, Shard), ttl (TTLIndex, TTLManager), eviction (LRUCache, EvictionManager, MemoryTracker), server (TcpServer, Connection, Framing), protocol (Parser, Dispatcher, CommandRegistry).",
    cmd: 'ls -la  (Windows: dir)', time: 'instant'
  },
  {
    color: C.amber, icon: '⚙️', n: '03', title: 'Compile & Build',
    simple: '"Translate the human-readable recipe into instructions your CPU can actually execute."',
    analogy: "C++ source code is written for humans to read. Your processor only understands machine code (binary). CMake figures out the compilation order for all 12 files, the compiler translates each one, and the linker stitches them together into one executable.",
    tech: "CMake reads CMakeLists.txt → generates platform Makefiles → GCC/Clang compiles each .cpp with -O2 -std=c++20 → linker combines 12 object files into the final kvmemo-server binary (ELF on Linux, Mach-O on macOS).",
    cmd: 'mkdir build && cd build && cmake .. && cmake --build . --parallel', time: '30–90 seconds'
  },
  {
    color: C.green, icon: '🚀', n: '04', title: 'Run & Use KVMemo',
    simple: '"Opening the restaurant: start the server, walk in, and place your order."',
    analogy: "./kvmemo-server is like opening a restaurant's doors — it binds to port 6379 and waits for customers. You (the client) walk in via terminal or the Playground page and order: SET name Gagan. The kitchen (KVEngine routes to a Shard) stores it. GET name returns it in < 1ms.",
    tech: "Server boots 16 shards, starts TTLManager thread (100ms eviction tick), binds TCP socket, spawns thread pool. Each command path: socket → Framing → Parser → Dispatcher → CommandHandler → KVEngine → ShardManager → Shard[N] → response.",
    cmd: './kvmemo-server', time: 'starts in < 1s'
  },
]

function StepCard({ step, active, idx }) {
  const [expanded, setExpanded] = useState(false)
  const { color, icon, n, title, simple, analogy, tech, cmd, time } = step
  const isActive = active === idx

  return (
    <div style={{ borderRadius: 14, overflow: 'hidden', border: `1px solid ${isActive ? color + '50' : C.b0}`, background: isActive ? `${color}07` : C.bg1, boxShadow: isActive ? `0 0 36px ${color}12` : 'none', transition: 'all .3s' }}>
      {isActive && <div style={{ height: 2, background: `linear-gradient(90deg,transparent,${color},transparent)` }} />}
      <div style={{ padding: '20px 22px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
          <div style={{ flexShrink: 0, textAlign: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: 13, background: `${color}18`, border: `1.5px solid ${color}38`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 5 }}>{icon}</div>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, fontWeight: 700, color }}>#{n}</span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: isActive ? color : C.tw, letterSpacing: '-.01em', fontFamily: "'DM Sans',sans-serif" }}>{title}</h3>
              <span style={{ fontSize: 9.5, padding: '2px 9px', borderRadius: 99, background: `${color}14`, color, border: `1px solid ${color}28`, fontFamily: "'JetBrains Mono',monospace" }}>~{time}</span>
              {isActive && <span style={{ fontSize: 9, padding: '2px 9px', borderRadius: 99, background: `${C.blue}18`, color: C.blue2, border: `1px solid ${C.blue}30`, animation: 'pulse 1.5s ease infinite' }}>● playing now</span>}
            </div>
            <p style={{ fontSize: 13.5, color: isActive ? C.t1 : C.t2, lineHeight: 1.6, marginBottom: 12, fontStyle: 'italic', opacity: .88 }}>{simple}</p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 8, border: `1px solid ${C.b0}`, background: '#04070e', marginBottom: 12, maxWidth: '100%', overflowX: 'auto' }}>
              <span style={{ color, flexShrink: 0, fontFamily: "'JetBrains Mono',monospace", fontSize: 11 }}>$</span>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: C.t1, wordBreak: 'break-all' }}>{cmd}</span>
            </div>
            <button onClick={() => setExpanded(p => !p)} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11.5, color: expanded ? color : C.t3, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: "'DM Sans',sans-serif", transition: 'color .15s', fontWeight: expanded ? 600 : 400 }}>
              <span style={{ transition: 'transform .2s', transform: expanded ? 'rotate(90deg)' : 'none', display: 'inline-block', fontSize: 9 }}>▶</span>
              {expanded ? 'Hide explanation' : 'Understand the "why" →'}
            </button>
          </div>
        </div>
        {expanded && (
          <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, animation: 'fadeIn .2s ease' }}>
            <div style={{ padding: '14px 16px', borderRadius: 11, background: `${color}0a`, border: `1px solid ${color}22` }}>
              <p style={{ fontSize: 10, fontWeight: 700, color, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 9 }}>🧠 Simple Analogy</p>
              <p style={{ fontSize: 12.5, color: C.t2, lineHeight: 1.8 }}>{analogy}</p>
            </div>
            <div style={{ padding: '14px 16px', borderRadius: 11, background: C.bg2, border: `1px solid ${C.b0}` }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: C.t2, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 9 }}>⚙️ What Actually Happens</p>
              <p style={{ fontSize: 12.5, color: C.t2, lineHeight: 1.8 }}>{tech}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   HERO
═══════════════════════════════════════════════════════════ */
function Hero() {
  return (
    <div style={{ textAlign: 'center', padding: '80px 20px 52px', position: 'relative' }}>
      <div aria-hidden style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle,rgba(59,130,246,.07) 0%,transparent 65%)', top: -260, left: '14%', animation: 'orb1 18s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle,rgba(139,92,246,.06) 0%,transparent 65%)', top: -120, right: '10%', animation: 'orb2 23s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle,rgba(30,51,82,.6) 1px,transparent 1px)', backgroundSize: '44px 44px', maskImage: 'radial-gradient(ellipse 80% 70% at 50% 0%,black 30%,transparent 100%)', WebkitMaskImage: 'radial-gradient(ellipse 80% 70% at 50% 0%,black 30%,transparent 100%)' }} />
      </div>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '4px 14px', borderRadius: 99, border: `1px solid ${C.b1}`, background: `${C.blue}0d`, marginBottom: 22 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.green, boxShadow: `0 0 6px ${C.green}`, animation: 'glow 2s ease infinite' }} />
          <span style={{ fontSize: 11, color: C.t2, letterSpacing: '.04em' }}>Interactive Demo — Phase 1 Walkthrough</span>
        </div>
        <h1 style={{ fontSize: 'clamp(34px,5.5vw,64px)', fontWeight: 800, color: C.tw, letterSpacing: '-.04em', lineHeight: 1.06, marginBottom: 18, fontFamily: "'DM Sans',sans-serif" }}>
          KVMemo from <span className="shimmer-text">zero to running</span><br />in 4 steps
        </h1>
        <p style={{ fontSize: 15, color: C.t2, lineHeight: 1.8, maxWidth: 540, margin: '0 auto 10px' }}>
          Watch the entire setup play out live on the Studio Display — then read the plain-English explanation below.
        </p>
        <p style={{ fontSize: 11, color: C.t3, fontFamily: "'JetBrains Mono',monospace" }}>
          click a tab · press auto-play · click the green power LED on the display
        </p>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   COMPLETION
═══════════════════════════════════════════════════════════ */
function CompletionBanner() {
  return (
    <div style={{ textAlign: 'center', padding: '52px 20px 0', animation: 'fadeUp .7s ease' }}>
      <div style={{ height: 1, background: `linear-gradient(90deg,transparent,${C.b0},transparent)`, marginBottom: 48 }} />
      <div style={{ fontSize: 42, marginBottom: 16, animation: 'bounce 1.2s ease infinite' }}>🎉</div>
      <h2 style={{ fontSize: 'clamp(22px,3.5vw,38px)', fontWeight: 800, color: C.tw, letterSpacing: '-.03em', marginBottom: 12, fontFamily: "'DM Sans',sans-serif" }}>You've seen the full journey!</h2>
      <p style={{ fontSize: 14, color: C.t2, lineHeight: 1.8, maxWidth: 460, margin: '0 auto 32px' }}>
        4 commands, under 2 minutes. A complete in-memory key-value store — built from scratch in C++20 — running on your machine.
      </p>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        <a href="https://github.com/Gagan2004bansal/KVMemo" target="_blank" rel="noreferrer" style={{ padding: '11px 28px', borderRadius: 9, background: C.tw, color: C.bg, fontSize: 13, fontWeight: 800, textDecoration: 'none', transition: 'opacity .15s' }}
          onMouseEnter={e => e.currentTarget.style.opacity = '.85'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >⭐ Star on GitHub</a>
        <a href="https://github.com/Gagan2004bansal/KVMemo/archive/refs/heads/main.zip" style={{ padding: '11px 28px', borderRadius: 9, border: `1px solid ${C.b1}`, background: C.bg1, color: C.t1, fontSize: 13, fontWeight: 500, textDecoration: 'none', transition: 'all .15s' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = C.b2; e.currentTarget.style.color = C.tw }} onMouseLeave={e => { e.currentTarget.style.borderColor = C.b1; e.currentTarget.style.color = C.t1 }}
        >⬇ Download ZIP</a>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   ROOT
═══════════════════════════════════════════════════════════ */
export default function Journey() {
  const [act, setAct] = useState(0)
  const [completed, setComp] = useState(new Set())
  const [screenOn, setScreen] = useState(true)
  const [playing, setPlaying] = useState(false)
  const autoRef = useRef(null)

  const onComplete = useCallback(() => {
    setComp(p => new Set([...p, act]))
  }, [act])

  useEffect(() => {
    if (!playing) { clearTimeout(autoRef.current); return }
    if (completed.has(act)) {
      const next = act + 1
      if (next >= ACTS.length) { setPlaying(false); return }
      autoRef.current = setTimeout(() => setAct(next), 1300)
    }
    return () => clearTimeout(autoRef.current)
  }, [playing, completed, act])

  const handlePlay = () => { setAct(0); setComp(new Set()); setScreen(true); setTimeout(() => setPlaying(true), 80) }
  const handleRestart = () => { setAct(0); setComp(new Set()); setPlaying(false); setScreen(true) }
  const allDone = completed.size === ACTS.length

  return (
    <>
      <Styles />
      <div style={{ minHeight: '100vh', background: C.bg }}>
        <Hero />
        <div style={{ maxWidth: 1020, margin: '0 auto', padding: '0 24px 100px' }}>
          <ActTabs active={act} onSelect={a => { setAct(a); setPlaying(false) }} completed={completed} />
          <Controls screenOn={screenOn} playing={playing} onToggle={() => setScreen(p => !p)} onPlay={handlePlay} onPause={() => setPlaying(false)} onRestart={handleRestart} />

          {/* Studio Display — hero piece */}
          <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0 0', background: 'radial-gradient(ellipse 65% 50% at 50% 30%,rgba(59,130,246,.055) 0%,transparent 70%)', borderRadius: 20 }}>
            <StudioDisplay act={act} screenOn={screenOn} onComplete={onComplete} onToggle={() => setScreen(p => !p)} />
          </div>

          <ProgressRail active={act} completed={completed} />
          <FlowDiagram activeAct={act} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {STEPS.map((step, i) => <StepCard key={i} step={step} active={act} idx={i} />)}
          </div>

          {allDone && <CompletionBanner />}
          {!allDone && (
            <p style={{ textAlign: 'center', marginTop: 40, fontSize: 11, color: C.t4, fontFamily: "'JetBrains Mono',monospace" }}>
              complete all 4 steps to unlock the summary ↑
            </p>
          )}
        </div>
      </div>
    </>
  )
}