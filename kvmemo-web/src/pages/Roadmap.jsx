import { useState } from 'react'
import { C, F } from '../constants/theme'
import { SectionHead, Badge } from '../components/ui'

const PHASES = [
  {
    n:'01', label:'Core Engine', status:'complete', color:C.green, period:'Phase 1 — Current',
    headline:'The foundation — everything in RAM.',
    desc:'Complete in-memory engine with shard concurrency, TTL expiry, LRU eviction, and a full network stack. Builds cross-platform.',
    items:[
      { done:true,  text:'KVEngine — central orchestrator' },
      { done:true,  text:'ShardManager — configurable N shards' },
      { done:true,  text:'Shard — per-shard mutex, isolated hashmap' },
      { done:true,  text:'TTLIndex + TTLManager — background expiry' },
      { done:true,  text:'EvictionManager — LRU policy (pluggable)' },
      { done:true,  text:'MemoryTracker — hard limit enforcement' },
      { done:true,  text:'TcpServer, Connection, Framing' },
      { done:true,  text:'Parser, Dispatcher, CommandRegistry' },
      { done:true,  text:'Commands: SET GET DEL KEYS FLUSH PING TTL EXISTS' },
      { done:true,  text:'CMake — Linux / macOS / Windows (WSL2)' },
    ],
  },
  {
    n:'02', label:'Observability', status:'next', color:C.blue, period:'Phase 2 — Up Next',
    headline:'Metrics you can actually use.',
    desc:'MetricsRegistry, latency histograms, eviction rate, and a live WebSocket endpoint so the dashboard shows real data.',
    items:[
      { done:false, text:'MetricsRegistry — central metrics store' },
      { done:false, text:'Latency histograms — p50 / p95 / p99' },
      { done:false, text:'Memory usage — live bytes vs limit' },
      { done:false, text:'Eviction rate — keys/sec evicted' },
      { done:false, text:'Shard load distribution heatmap' },
      { done:false, text:'WebSocket /metrics endpoint' },
      { done:false, text:'Hit / miss ratio per command' },
    ],
  },
  {
    n:'03', label:'Persistence', status:'planned', color:C.amber, period:'Phase 3',
    headline:'Survive restarts. Keep your data.',
    desc:'Write-Ahead Log for durability on restart, RDB snapshots for backups, crash recovery that replays the log.',
    items:[
      { done:false, text:'Write-Ahead Log (WAL)' },
      { done:false, text:'RDB snapshot format' },
      { done:false, text:'Crash recovery — replay WAL on startup' },
      { done:false, text:'Configurable fsync policy' },
      { done:false, text:'Background snapshot thread (non-blocking)' },
    ],
  },
  {
    n:'04', label:'Replication', status:'planned', color:C.violet, period:'Phase 4',
    headline:'Primary / replica for high availability.',
    desc:'Async replication stream, replica lag monitoring, and automatic failover so a primary crash doesn\'t lose data.',
    items:[
      { done:false, text:'Primary / replica protocol' },
      { done:false, text:'Async replication stream' },
      { done:false, text:'Replica lag monitoring' },
      { done:false, text:'Replica promotion on primary failure' },
      { done:false, text:'Read-from-replica option' },
    ],
  },
  {
    n:'05', label:'Cluster Mode', status:'planned', color:C.cyan, period:'Phase 5',
    headline:'Horizontal scale across nodes.',
    desc:'Consistent hashing ring, automatic key routing, online rebalancing when nodes join or leave.',
    items:[
      { done:false, text:'Consistent hashing ring' },
      { done:false, text:'Multi-node key routing' },
      { done:false, text:'Online rebalancing — join / leave' },
      { done:false, text:'Cross-node request forwarding' },
      { done:false, text:'Cluster health dashboard' },
    ],
  },
]

const STATUS = {
  complete: { label:'Complete',  color:C.green },
  next:     { label:'Up Next',   color:C.blue },
  planned:  { label:'Planned',   color:C.t3 },
}

export default function Roadmap() {
  const [active, setActive] = useState(0)
  const phase = PHASES[active]

  return (
    <div style={{fontFamily:F.body,padding:'80px 40px',maxWidth:1200,margin:'0 auto'}}>
      <SectionHead eyebrow="Roadmap" title="5 phases. From zero to cluster." sub="Each phase ships working, tested code before the next begins." titleSize="clamp(28px,3.5vw,42px)" center/>

      {/* Tab selector */}
      <div style={{display:'flex',gap:0,borderRadius:12,border:`1px solid ${C.b0}`,background:C.bg1,padding:6,marginBottom:36,overflow:'hidden'}}>
        {PHASES.map((p,i)=>{
          const sel = active===i
          const st  = STATUS[p.status]
          return (
            <button key={i} onClick={()=>setActive(i)} style={{flex:1,padding:'12px 8px',borderRadius:8,border:'none',background:sel?C.bg3:'transparent',cursor:'pointer',transition:'all .18s',boxShadow:sel?`inset 0 0 0 1px ${p.color}33`:'none',outline:'none'}}>
              <div style={{fontSize:10,fontWeight:600,color:sel?p.color:C.t3,fontFamily:F.mono,marginBottom:3}}>Phase {p.n}</div>
              <div style={{fontSize:13,fontWeight:sel?700:500,color:sel?C.tw:C.t2,lineHeight:1.3}}>{p.label}</div>
              <div style={{marginTop:6,display:'flex',justifyContent:'center'}}>
                <span style={{fontSize:9,padding:'2px 7px',borderRadius:99,background:`${st.color}15`,color:st.color,border:`1px solid ${st.color}28`}}>{st.label}</span>
              </div>
            </button>
          )
        })}
      </div>

      {/* Progress bar */}
      <div style={{height:3,borderRadius:2,background:C.b0,marginBottom:36,overflow:'hidden'}}>
        <div style={{height:'100%',borderRadius:2,background:`linear-gradient(90deg,${C.green},${C.blue})`,width:`${((active+1)/PHASES.length)*100}%`,transition:'width .4s ease',boxShadow:`0 0 12px ${phase.color}`}}/>
      </div>

      {/* Phase card */}
      <div key={active} style={{animation:'fadeUp .28s ease',border:`1px solid ${phase.color}28`,borderRadius:16,background:C.bg1,overflow:'hidden'}}>
        {/* Header */}
        <div style={{padding:'32px 36px 28px',borderBottom:`1px solid ${C.b0}`,background:`${phase.color}07`,display:'grid',gridTemplateColumns:'1fr auto',alignItems:'start',gap:20}}>
          <div>
            <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:12}}>
              <span style={{fontFamily:F.mono,fontSize:13,fontWeight:600,color:phase.color}}>{phase.period}</span>
              <Badge color={STATUS[phase.status].color}>{STATUS[phase.status].label}</Badge>
            </div>
            <h2 style={{fontSize:'clamp(20px,3vw,30px)',fontWeight:800,color:C.tw,letterSpacing:'-.025em',marginBottom:12,fontFamily:F.display}}>{phase.headline}</h2>
            <p style={{fontSize:14,color:C.t2,lineHeight:1.75,maxWidth:560}}>{phase.desc}</p>
          </div>
          <div style={{fontSize:80,fontWeight:800,color:`${phase.color}18`,fontFamily:F.mono,lineHeight:1,userSelect:'none'}}>{phase.n}</div>
        </div>

        {/* Items */}
        <div style={{padding:'28px 36px',display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:10}}>
          {phase.items.map((item,i)=>(
            <div key={i} style={{display:'flex',alignItems:'flex-start',gap:10,padding:'10px 14px',borderRadius:8,border:`1px solid ${item.done?phase.color+'28':C.b0}`,background:item.done?`${phase.color}08`:C.bg2}}>
              <div style={{width:18,height:18,borderRadius:5,flexShrink:0,marginTop:1,display:'flex',alignItems:'center',justifyContent:'center',background:item.done?`${phase.color}20`:C.bg3,border:`1px solid ${item.done?phase.color+'44':C.b0}`}}>
                {item.done ? <span style={{fontSize:10,color:phase.color}}>✓</span> : <span style={{fontSize:8,color:C.t4}}>○</span>}
              </div>
              <span style={{fontSize:13,color:item.done?C.t1:C.t2,lineHeight:1.55}}>{item.text}</span>
            </div>
          ))}
        </div>

        {/* Nav */}
        <div style={{padding:'16px 36px',borderTop:`1px solid ${C.b0}`,display:'flex',justifyContent:'space-between'}}>
          <button onClick={()=>setActive(p=>Math.max(0,p-1))} disabled={active===0} style={{padding:'8px 20px',borderRadius:7,border:`1px solid ${C.b0}`,background:'transparent',color:active===0?C.t4:C.t1,fontSize:13,cursor:active===0?'default':'pointer',fontFamily:F.body,transition:'all .15s'}}
            onMouseEnter={e=>{if(active>0)e.currentTarget.style.borderColor=C.b1}}
            onMouseLeave={e=>e.currentTarget.style.borderColor=C.b0}
          >← Previous</button>
          <span style={{fontSize:12,color:C.t3,alignSelf:'center',fontFamily:F.mono}}>{active+1} / {PHASES.length}</span>
          <button onClick={()=>setActive(p=>Math.min(PHASES.length-1,p+1))} disabled={active===PHASES.length-1} style={{padding:'8px 20px',borderRadius:7,border:`1px solid ${C.b0}`,background:'transparent',color:active===PHASES.length-1?C.t4:C.t1,fontSize:13,cursor:active===PHASES.length-1?'default':'pointer',fontFamily:F.body,transition:'all .15s'}}
            onMouseEnter={e=>{if(active<PHASES.length-1)e.currentTarget.style.borderColor=C.b1}}
            onMouseLeave={e=>e.currentTarget.style.borderColor=C.b0}
          >Next →</button>
        </div>
      </div>
    </div>
  )
}
