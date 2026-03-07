import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { C, F } from '../constants/theme'
import { Badge, SectionHead } from '../components/ui'

/* ──────────────────────────────────────────
   Mesh gradient background
────────────────────────────────────────── */
function MeshBg() {
  return (
    <div aria-hidden style={{position:'absolute',inset:0,overflow:'hidden',pointerEvents:'none',zIndex:0}}>
      <div style={{position:'absolute',width:900,height:900,borderRadius:'50%',background:`radial-gradient(circle,${C.gB} 0%,transparent 65%)`,top:-350,left:'10%',animation:'orb1 22s ease-in-out infinite'}}/>
      <div style={{position:'absolute',width:600,height:600,borderRadius:'50%',background:`radial-gradient(circle,${C.gV} 0%,transparent 65%)`,top:50,right:'5%',animation:'orb2 26s ease-in-out infinite'}}/>
      <div style={{position:'absolute',width:500,height:500,borderRadius:'50%',background:`radial-gradient(circle,${C.gC} 0%,transparent 65%)`,bottom:-100,left:'40%',animation:'orb3 18s ease-in-out infinite'}}/>
      {/* dot grid */}
      <div style={{position:'absolute',inset:0,backgroundImage:`radial-gradient(circle,${C.b0}99 1px,transparent 1px)`,backgroundSize:'44px 44px',maskImage:'radial-gradient(ellipse 90% 70% at 50% 0%,black 20%,transparent 100%)',WebkitMaskImage:'radial-gradient(ellipse 90% 70% at 50% 0%,black 20%,transparent 100%)'}}/>
      <div style={{position:'absolute',bottom:0,left:0,right:0,height:200,background:`linear-gradient(transparent,${C.bg})`}}/>
    </div>
  )
}

/* ──────────────────────────────────────────
   Animated live terminal
────────────────────────────────────────── */
const DEMO = [
  { d:350,  k:'cmd', v:'SET user:1 "Gagan Bansal" EX 60' },
  { d:850,  k:'ok',  v:'OK' },
  { d:1400, k:'cmd', v:'SET session:tok "xyz_jwt" EX 300' },
  { d:1900, k:'ok',  v:'OK' },
  { d:2450, k:'cmd', v:'GET user:1' },
  { d:2950, k:'ok',  v:'"Gagan Bansal"' },
  { d:3500, k:'cmd', v:'KEYS' },
  { d:4000, k:'ok',  v:'1) "user:1"\n2) "session:tok"' },
  { d:4550, k:'cmd', v:'TTL user:1' },
  { d:5050, k:'ok',  v:'(integer) 54' },
  { d:5600, k:'cmd', v:'DEL session:tok' },
  { d:6100, k:'ok',  v:'(integer) 1' },
  { d:6600, k:'cmd', v:'PING' },
  { d:7000, k:'ok',  v:'PONG' },
]

function Terminal() {
  const [lines, setLines]   = useState([])
  const [blink, setBlink]   = useState(true)
  const bodyRef             = useRef(null)

  const run = () => DEMO.forEach(({ d, k, v }) =>
    setTimeout(() => setLines(p => [...p.slice(-22), { k, v }]), d)
  )

  useEffect(() => {
    run()
    const loop = setInterval(() => { setLines([]); setTimeout(run, 200) }, 9500)
    const bl   = setInterval(() => setBlink(p => !p), 520)
    return () => { clearInterval(loop); clearInterval(bl) }
  }, [])

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight
  }, [lines])

  return (
    <div style={{borderRadius:16,border:`1px solid ${C.b1}`,background:C.bg1,overflow:'hidden',boxShadow:`0 0 0 1px ${C.b0},0 32px 80px rgba(0,0,0,.6),0 0 80px ${C.gB}`}}>
      {/* chrome */}
      <div style={{display:'flex',alignItems:'center',gap:6,padding:'10px 16px',borderBottom:`1px solid ${C.b0}`,background:'rgba(0,0,0,.3)'}}>
        {['#ff5f57','#febc2e','#28c840'].map(c=><div key={c} style={{width:11,height:11,borderRadius:'50%',background:c,opacity:.9}}/>)}
        <span style={{marginLeft:10,fontSize:11,color:C.t3,fontFamily:F.mono}}>kvmemo — live demo</span>
        <div style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:5,fontSize:10,color:C.green,fontFamily:F.mono}}>
          <div style={{width:5,height:5,borderRadius:'50%',background:C.green,boxShadow:`0 0 6px ${C.green}`}}/>
          simulated
        </div>
      </div>
      {/* body */}
      <div ref={bodyRef} style={{height:280,overflowY:'auto',padding:'14px 18px',fontFamily:F.mono,fontSize:12.5,lineHeight:2}}>
        <div style={{color:C.t3,marginBottom:10,fontSize:11}}>
          {'# KVMemo v0.1.0  ·  64 shards  ·  LRU eviction  ·  in-memory'}
        </div>
        {lines.map((l,i)=>(
          <div key={i} style={{animation:'slideL .14s ease'}}>
            {l.k==='cmd'
              ? <div><span style={{color:C.blue,marginRight:9}}>❯</span><span style={{color:C.tw}}>{l.v}</span></div>
              : l.v.split('\n').map((line,j)=><div key={j} style={{color:C.green2,paddingLeft:20}}>{line}</div>)
            }
          </div>
        ))}
        <span style={{color:C.blue2,opacity:blink?1:0,transition:'opacity .08s'}}>█</span>
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────
   Scroll-triggered stat card
────────────────────────────────────────── */
function StatCard({ value, label, sub, color, delay=0 }) {
  const [vis, setVis] = useState(false)
  const ref           = useRef(null)
  useEffect(() => {
    const obs = new IntersectionObserver(([e])=>{ if(e.isIntersecting) setVis(true) },{ threshold:.4 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  return (
    <div ref={ref} style={{
      padding:'20px 22px',borderRadius:12,
      border:`1px solid ${C.b0}`,background:C.bg1,
      position:'relative',overflow:'hidden',
      opacity:vis?1:0,transform:vis?'none':'translateY(14px)',
      transition:`opacity .5s ${delay}s,transform .5s ${delay}s`,
    }}>
      <div style={{position:'absolute',top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,transparent,${color},transparent)`,opacity:.7}}/>
      <div style={{fontSize:'clamp(20px,2.8vw,30px)',fontWeight:800,color:C.tw,letterSpacing:'-.03em',fontFamily:F.mono,marginBottom:5}}>{value}</div>
      <div style={{fontSize:13,fontWeight:600,color:C.t1,marginBottom:3}}>{label}</div>
      {sub&&<div style={{fontSize:11,color:C.t3}}>{sub}</div>}
    </div>
  )
}

/* ──────────────────────────────────────────
   Scroll-triggered feature card
────────────────────────────────────────── */
function FeatureCard({ icon, title, desc, color, delay=0 }) {
  const [vis, setVis] = useState(false)
  const ref           = useRef(null)
  useEffect(() => {
    const obs = new IntersectionObserver(([e])=>{ if(e.isIntersecting) setVis(true) },{ threshold:.2 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  return (
    <div ref={ref} style={{
      padding:'22px',borderRadius:12,border:`1px solid ${C.b0}`,background:C.bg1,
      opacity:vis?1:0,transform:vis?'none':'translateY(16px)',
      transition:`opacity .5s ${delay}s,transform .5s ${delay}s,border-color .2s,box-shadow .2s`,
    }}
      onMouseEnter={e=>{e.currentTarget.style.borderColor=`${color}44`;e.currentTarget.style.boxShadow=`0 0 28px ${color}14`}}
      onMouseLeave={e=>{e.currentTarget.style.borderColor=C.b0;e.currentTarget.style.boxShadow='none'}}
    >
      <div style={{width:38,height:38,borderRadius:9,background:`${color}15`,border:`1px solid ${color}22`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:19,marginBottom:14}}>{icon}</div>
      <div style={{fontSize:14,fontWeight:700,color:C.tw,marginBottom:7,fontFamily:F.display}}>{title}</div>
      <div style={{fontSize:12.5,color:C.t2,lineHeight:1.75}}>{desc}</div>
    </div>
  )
}

/* ──────────────────────────────────────────
   Constants
────────────────────────────────────────── */
const STATS = [
  { value:'~19M',  label:'ops / sec',   sub:'GET · 64-shard bench', color:C.blue,   delay:0    },
  { value:'~12M',  label:'ops / sec',   sub:'SET · 64-shard bench', color:C.cyan,   delay:.06  },
  { value:'100ms', label:'TTL tick',    sub:'background thread',   color:C.green,  delay:.12  },
  { value:'O(1)',  label:'GET / SET',   sub:'hash-sharded store',  color:C.violet, delay:.18  },
]

const FEATURES = [
  { icon:'⚡', color:C.amber,  title:'Sub-ms latency',          desc:'RAM-first. No disk on the hot path. GET/SET finish in single-digit microseconds.' },
  { icon:'🔀', color:C.blue,   title:'Shard concurrency',       desc:'64 independent shard mutexes — no global lock, throughput scales with cores.' },
  { icon:'⏱',  color:C.rose,   title:'TTL scheduling',          desc:'Background TTLManager thread evicts expired keys every 100ms, off the request path.' },
  { icon:'🧠', color:C.violet, title:'Pluggable LRU eviction',  desc:'Eviction policy is a pure interface. Swap LRU for LFU without touching the engine.' },
  { icon:'📊', color:C.cyan,   title:'Memory tracking',         desc:'Per-write byte accounting with configurable hard limit. Fires eviction before OOM.' },
  { icon:'🔌', color:C.green,  title:'JSON / WebSocket wire',   desc:'Plain JSON over WS. Connect from any language in seconds — no custom parser.' },
  { icon:'🏗',  color:C.blue2,  title:'SOLID architecture',      desc:'7 focused components, zero cross-layer mutation. Engine orchestrates, never implements.' },
  { icon:'🌍', color:C.amber,  title:'Cross-platform C++20',    desc:'Linux, macOS, Windows (WSL2). CMake 3.20+ with GCC 12+ or Clang 15+.' },
]

const PIPELINE = [
  { n:'01', label:'Client',   file:'kv_client.h',     color:C.cyan   },
  { n:'02', label:'Server',   file:'tcp_server.h',    color:C.blue   },
  { n:'03', label:'Parser',   file:'parser.h',        color:C.amber  },
  { n:'04', label:'Engine',   file:'kv_engine.h',     color:C.violet, active:true },
  { n:'05', label:'Storage',  file:'shard_manager.h', color:C.green  },
]

/* ──────────────────────────────────────────
   HOME PAGE
────────────────────────────────────────── */
export default function Home() {
  return (
    <div style={{fontFamily:F.body}}>

      {/* ═══ HERO ═════════════════════════════ */}
      <section style={{position:'relative',minHeight:'100vh',display:'flex',alignItems:'center',paddingTop:56}}>
        <MeshBg/>
        <div style={{position:'relative',zIndex:1,width:'100%',maxWidth:1200,margin:'0 auto',padding:'72px 40px',display:'grid',gridTemplateColumns:'1fr 1fr',gap:72,alignItems:'center'}}>

          {/* Left */}
          <div>
            <div className="fu" style={{animationDelay:'0s',marginBottom:22}}>
              <Badge dot color={C.green}>C++20 · In-Memory · Production Grade</Badge>
            </div>

            <h1 className="fu" style={{animationDelay:'.08s',fontSize:'clamp(40px,5.5vw,66px)',fontWeight:800,color:C.tw,letterSpacing:'-.035em',lineHeight:1.06,marginBottom:24,fontFamily:F.display}}>
              KVMemo<br/><span className="shimmer">in-memory</span><br/>store in C++20
            </h1>

            <p className="fu" style={{animationDelay:'.16s',fontSize:16,color:C.t2,lineHeight:1.8,marginBottom:36,maxWidth:480}}>
              High-performance key-value store with shard-based concurrency, TTL scheduling, and pluggable LRU eviction — zero dependencies.
            </p>

            <div className="fu" style={{animationDelay:'.24s',display:'flex',gap:12,flexWrap:'wrap',marginBottom:36}}>
              <Link to="/docs/getting-started" style={{padding:'11px 26px',borderRadius:9,background:C.blue,color:'#fff',fontSize:14,fontWeight:700,boxShadow:`0 0 28px ${C.gB}`,transition:'all .2s'}}
                onMouseEnter={e=>{e.currentTarget.style.background=C.blue2;e.currentTarget.style.boxShadow='0 0 44px rgba(59,130,246,.38)'}}
                onMouseLeave={e=>{e.currentTarget.style.background=C.blue;e.currentTarget.style.boxShadow=`0 0 28px ${C.gB}`}}
              >Get Started →</Link>
              <Link to="/playground" style={{padding:'11px 26px',borderRadius:9,border:`1px solid ${C.b1}`,background:C.bg1,color:C.t1,fontSize:14,fontWeight:500,transition:'all .2s'}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=C.b2;e.currentTarget.style.color=C.tw}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=C.b1;e.currentTarget.style.color=C.t1}}
              >Try Playground</Link>
            </div>

            <div className="fu" style={{animationDelay:'.32s'}}>
              <p style={{fontSize:11,color:C.t3,letterSpacing:'.08em',textTransform:'uppercase',marginBottom:8}}>Quick Start</p>
              <div style={{display:'inline-flex',alignItems:'center',gap:10,padding:'10px 18px',borderRadius:9,border:`1px solid ${C.b0}`,background:C.bg1,fontFamily:F.mono,fontSize:12.5,color:C.t2}}>
                <span style={{color:C.blue}}>$</span>
                <span>git clone</span>
                <span style={{color:C.green}}>github.com/Gagan2004bansal/KVMemo</span>
              </div>
            </div>
          </div>

          {/* Right — terminal */}
          <div className="fu" style={{animationDelay:'.16s'}}>
            <Terminal/>
          </div>
        </div>
      </section>

      {/* ═══ STATS ════════════════════════════ */}
      <section style={{padding:'0 40px 80px',maxWidth:1200,margin:'0 auto'}}>
        <div style={{height:1,background:`linear-gradient(90deg,transparent,${C.b0},transparent)`,marginBottom:60}}/>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14}}>
          {STATS.map((s,i)=><StatCard key={i} {...s}/>)}
        </div>
      </section>

      {/* ═══ FEATURES ═════════════════════════ */}
      <section style={{padding:'80px 40px',maxWidth:1200,margin:'0 auto'}}>
        <SectionHead eyebrow="Core Features" title="Built for speed. Designed to learn from." sub="Every component has a single responsibility. Swap policies, tune shard count, add commands — without touching the engine."/>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14}}>
          {FEATURES.map((f,i)=><FeatureCard key={f.title} {...f} delay={i*.04}/>)}
        </div>
      </section>

      {/* ═══ ARCH TEASER ══════════════════════ */}
      <section style={{padding:'80px 40px',maxWidth:1200,margin:'0 auto'}}>
        <div style={{borderRadius:18,border:`1px solid ${C.b0}`,background:C.bg1,padding:'52px 56px',position:'relative',overflow:'hidden'}}>
          <div aria-hidden style={{position:'absolute',top:-120,right:-120,width:480,height:480,borderRadius:'50%',background:`radial-gradient(circle,${C.gV} 0%,transparent 70%)`,pointerEvents:'none'}}/>
          <div style={{position:'relative',zIndex:1,display:'grid',gridTemplateColumns:'1fr 1fr',gap:56,alignItems:'center'}}>
            <div>
              <p style={{fontSize:11,fontWeight:600,letterSpacing:'.1em',textTransform:'uppercase',color:C.violet,marginBottom:14}}>Architecture</p>
              <h2 style={{fontSize:'clamp(22px,3vw,34px)',fontWeight:800,color:C.tw,letterSpacing:'-.03em',lineHeight:1.18,marginBottom:18,fontFamily:F.display}}>9-step call stack.<br/>Every byte tracked.</h2>
              <p style={{fontSize:14,color:C.t2,lineHeight:1.8,marginBottom:28}}>
                See how <code style={{fontFamily:F.mono,color:C.blue2,background:`${C.blue}12`,padding:'1px 7px',borderRadius:5}}>SET name Gagan EX 60</code> flows: TCP socket → parser → shard routing → TTL index → eviction check → response.
              </p>
              <div style={{display:'flex',gap:10}}>
                <Link to="/architecture" style={{padding:'9px 22px',borderRadius:8,background:C.violet,color:'#fff',fontSize:13,fontWeight:700,transition:'opacity .15s'}}
                  onMouseEnter={e=>e.currentTarget.style.opacity='.82'}
                  onMouseLeave={e=>e.currentTarget.style.opacity='1'}
                >View Architecture</Link>
                <Link to="/docs/call-stack" style={{padding:'9px 22px',borderRadius:8,border:`1px solid ${C.b1}`,background:'transparent',color:C.t1,fontSize:13,transition:'all .15s'}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=C.b2;e.currentTarget.style.color=C.tw}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor=C.b1;e.currentTarget.style.color=C.t1}}
                >Call Stack Docs</Link>
              </div>
            </div>

            {/* mini pipeline */}
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {PIPELINE.map((item,i)=>(
                <div key={i} style={{display:'flex',alignItems:'center',gap:10}}>
                  <div style={{width:30,height:30,borderRadius:7,flexShrink:0,border:`1.5px solid ${item.active?item.color+'88':item.color+'33'}`,background:`${item.color}${item.active?'18':'0a'}`,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:F.mono,fontSize:9,fontWeight:700,color:item.color}}>{item.n}</div>
                  <div style={{flex:1,padding:'8px 14px',borderRadius:8,border:`1px solid ${item.active?item.color+'44':C.b0}`,background:item.active?`${item.color}10`:C.bg2,display:'flex',justifyContent:'space-between',alignItems:'center',transition:'all .2s'}}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor=`${item.color}44`;e.currentTarget.style.background=`${item.color}10`}}
                    onMouseLeave={e=>{if(!item.active){e.currentTarget.style.borderColor=C.b0;e.currentTarget.style.background=C.bg2}}}
                  >
                    <span style={{fontSize:12.5,fontWeight:item.active?700:500,color:item.active?item.color:C.t1}}>{item.label}</span>
                    <span style={{fontSize:10.5,color:C.t3,fontFamily:F.mono}}>{item.file}</span>
                  </div>
                </div>
              ))}
              <p style={{textAlign:'center',fontSize:10.5,color:C.t3,marginTop:4,fontFamily:F.mono}}>+4 more steps → response</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CTA ══════════════════════════════ */}
      <section style={{padding:'80px 40px 120px',maxWidth:1200,margin:'0 auto',textAlign:'center'}}>
        <div style={{height:1,background:`linear-gradient(90deg,transparent,${C.b0},transparent)`,marginBottom:64}}/>
        <p style={{fontSize:11,fontWeight:600,letterSpacing:'.1em',textTransform:'uppercase',color:C.blue,marginBottom:16}}>KVMemo - MIT License</p>
        <h2 style={{fontSize:'clamp(28px,4vw,50px)',fontWeight:800,color:C.tw,letterSpacing:'-.035em',lineHeight:1.1,marginBottom:18,fontFamily:F.display}}>Clone. Build. Learn.</h2>
        <p style={{fontSize:15,color:C.t2,marginBottom:36,maxWidth:420,margin:'0 auto 36px'}}>Zero dependencies. MIT license. Read the source — every component is focused, clean, and documented.</p>
        <div style={{display:'flex',gap:12,justifyContent:'center'}}>
          <a href="https://github.com/Gagan2004bansal/KVMemo" target="_blank" rel="noreferrer"
            style={{padding:'12px 30px',borderRadius:9,background:C.tw,color:C.bg,fontSize:14,fontWeight:800,transition:'opacity .15s'}}
            onMouseEnter={e=>e.currentTarget.style.opacity='.88'}
            onMouseLeave={e=>e.currentTarget.style.opacity='1'}
          >⭐ Star on GitHub</a>
          <Link to="/docs/getting-started" style={{padding:'12px 30px',borderRadius:9,border:`1px solid ${C.b1}`,background:C.bg1,color:C.t1,fontSize:14,fontWeight:500,transition:'all .15s'}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=C.b2;e.currentTarget.style.color=C.tw}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor=C.b1;e.currentTarget.style.color=C.t1}}
          >Read the Docs</Link>
        </div>
      </section>
    </div>
  )
}
