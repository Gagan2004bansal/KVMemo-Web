import { useState, useRef, useEffect, useCallback } from 'react'
import { C, F } from '../../constants/theme'
import { DocHeader } from '../../components/ui'

const STEPS = [
  { id:1, label:'Client — serialize',    layer:'client',   color:C.cyan,   file:'kv_client.h',       conn:{label:'raw bytes → TCP',       color:C.cyan},   note:'kv_client serializes Request to JSON and sends it over the TCP socket.' },
  { id:2, label:'TCP Accept',           layer:'network',  color:C.blue,   file:'tcp_server.h',       conn:{label:'Connection object',      color:C.blue},   note:'TcpServer.accept() hands the socket to the thread pool, creating a Connection.' },
  { id:3, label:'Buffer & Frame',       layer:'network',  color:C.blue2,  file:'connection.h',       conn:{label:'framed message',         color:C.amber},  note:'Connection reads bytes into a buffer. Framing extracts complete JSON messages.' },
  { id:4, label:'Parse',                layer:'protocol', color:C.amber,  file:'parser.h',           conn:{label:'Request{}',              color:C.amber},  note:'Parser deserializes JSON → Request{ SET, "name", "Gagan", ttl:60 }. Returns Err for bad input — never throws.' },
  { id:5, label:'Dispatch',             layer:'protocol', color:C.amber,  file:'dispatcher.h',       conn:{label:'kv_engine.set()',        color:C.violet}, note:'Dispatcher looks up "SET" in CommandRegistry, finds SetHandler, calls handler.execute(request).' },
  { id:6, label:'Engine — route shard', layer:'engine',   color:C.violet, file:'kv_engine.h',        conn:{label:'shard[hash("name")%16]', color:C.blue},   note:'KVEngine calls ShardManager: hash("name") % 16 → shard index N.' },
  { id:7, label:'Shard — insert',       layer:'storage',  color:C.blue,   file:'shard.h',            conn:{label:'TTL + eviction signals', color:C.amber},  note:'shard[N].set("name","Gagan") acquires unique_lock, inserts into unordered_map, releases lock.' },
  { id:8, label:'TTL + Eviction',       layer:'engine',   color:C.violet, file:'kv_engine.h',        conn:{label:'Status::OK()',           color:C.violet}, note:'KVEngine registers TTL: ttl_index.insert("name", now+60s). Then eviction_manager.track_access("name"). Then memory_tracker.add(size).' },
  { id:9, label:'Response → Client',    layer:'client',   color:C.cyan,   file:'kv_client.h',        isLast:true,                                          note:'Dispatcher wraps Result in a Response, serializer encodes it, Connection writes bytes back to the socket. Client reads + deserializes → "OK".' },
]

export default function CallStackDoc() {
  const [active, setActive]   = useState(null)
  const [playing, setPlaying] = useState(false)
  const [pIdx, setPIdx]       = useState(-1)
  const timer = useRef(null)

  const play = useCallback(() => {
    clearInterval(timer.current)
    setPlaying(true); setActive(null); setPIdx(-1)
    let i = 0
    timer.current = setInterval(() => {
      setActive(STEPS[i].id); setPIdx(i)
      if (++i >= STEPS.length) { clearInterval(timer.current); setPlaying(false) }
    }, 700)
  }, [])

  useEffect(() => () => clearInterval(timer.current), [])

  const cur = active ? STEPS.find(s=>s.id===active) : null

  return (
    <div style={{fontFamily:F.body,padding:'48px 0'}}>
      <DocHeader breadcrumb="// docs / call-stack" title="Full Call Stack" sub='Step-by-step trace of SET name "Gagan" EX 60 — from client to response.'/>

      <div style={{display:'inline-flex',alignItems:'center',gap:10,padding:'8px 20px',borderRadius:8,border:`1px solid ${C.b1}`,background:C.bg1,fontFamily:F.mono,fontSize:13,marginBottom:32}}>
        <span style={{color:C.t3,fontSize:10,letterSpacing:'.1em',textTransform:'uppercase'}}>input</span>
        <span style={{color:C.violet}}>SET </span><span style={{color:C.amber}}>name </span><span style={{color:C.t1}}>Gagan </span><span style={{color:C.cyan}}>EX </span><span style={{color:C.amber}}>60</span>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 290px',gap:18}}>
        {/* Steps */}
        <div style={{border:`1px solid ${C.b0}`,borderRadius:14,background:C.bg1,overflow:'hidden'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 20px',borderBottom:`1px solid ${C.b0}`}}>
            <span style={{fontSize:11,color:C.t3,fontFamily:F.mono}}>{STEPS.length} steps</span>
            <div style={{display:'flex',gap:8}}>
              <button onClick={play} disabled={playing} style={{padding:'5px 18px',borderRadius:6,border:`1px solid ${playing?C.b0:C.b1}`,background:'transparent',color:playing?C.t3:C.t1,fontFamily:F.body,fontSize:12,fontWeight:600,transition:'all .15s'}}>{playing?'▶ running…':'▶ Animate'}</button>
              <button onClick={()=>{setActive(null);setPIdx(-1);clearInterval(timer.current);setPlaying(false)}} style={{padding:'5px 12px',borderRadius:6,border:`1px solid ${C.b0}`,background:'transparent',color:C.t2,fontFamily:F.body,fontSize:12,cursor:'pointer'}}>Reset</button>
            </div>
          </div>
          <div style={{height:3,background:C.b0}}>
            <div style={{height:'100%',background:`linear-gradient(90deg,${C.blue},${C.violet})`,width:active?`${(pIdx+1)/STEPS.length*100}%`:'0%',transition:'width .38s ease'}}/>
          </div>

          <div style={{padding:'16px 20px'}}>
            {STEPS.map((step)=>{
              const isActive = active===step.id
              const dim = active&&!isActive
              return (
                <div key={step.id}>
                  <div onClick={()=>setActive(p=>p===step.id?null:step.id)} style={{display:'grid',gridTemplateColumns:'38px 1fr',cursor:'pointer',opacity:dim?.22:1,transition:'opacity .3s'}}>
                    <div style={{display:'flex',flexDirection:'column',alignItems:'center'}}>
                      <div style={{width:26,height:26,borderRadius:6,border:`1.5px solid ${isActive?step.color+'88':C.b0}`,background:isActive?`${step.color}18`:C.bg2,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:F.mono,fontSize:9,fontWeight:700,color:isActive?step.color:C.t3,transition:'all .18s'}}>{step.id}</div>
                      {!step.isLast&&<div style={{width:1,flex:1,minHeight:10,background:`linear-gradient(${step.color}30,transparent)`}}/>}
                    </div>
                    <div style={{marginLeft:10,marginBottom:step.isLast?0:6,padding:'10px 14px',borderRadius:9,border:`1px solid ${isActive?step.color+'55':C.b0}`,background:isActive?`${step.color}08`:C.bg2,transition:'all .18s'}}
                      onMouseEnter={e=>{if(!isActive)e.currentTarget.style.borderColor=`${step.color}33`}}
                      onMouseLeave={e=>{if(!isActive)e.currentTarget.style.borderColor=C.b0}}
                    >
                      <div style={{fontSize:9.5,color:C.t3,letterSpacing:'.1em',textTransform:'uppercase',marginBottom:3}}>{step.label}</div>
                      <div style={{fontSize:11,color:isActive?step.color:C.t2,fontWeight:600,fontFamily:F.mono}}>{step.file}</div>
                    </div>
                  </div>
                  {!step.isLast&&step.conn&&(
                    <div style={{display:'flex',paddingLeft:38,height:26,alignItems:'center',gap:8}}>
                      <svg width="2" height="26" style={{overflow:'visible',flexShrink:0}}>
                        <line x1="1" y1="0" x2="1" y2="20" stroke={step.conn.color} strokeWidth="1.5" strokeOpacity=".35" strokeDasharray="4 3" style={{animation:'dash 1s linear infinite'}}/>
                        <path d="M-3 16 L1 24 L5 16" fill="none" stroke={step.conn.color} strokeWidth="1.5" strokeOpacity=".45"/>
                      </svg>
                      <span style={{fontSize:9.5,padding:'1px 8px',borderRadius:4,background:`${step.conn.color}10`,border:`1px solid ${step.conn.color}22`,color:step.conn.color,fontFamily:F.mono}}>{step.conn.label}</span>
                    </div>
                  )}
                </div>
              )
            })}
            <div style={{textAlign:'center',marginTop:14,opacity:active===9?1:.18,transition:'opacity .35s'}}>
              <div style={{display:'inline-flex',alignItems:'center',gap:14,padding:'10px 28px',borderRadius:8,border:`1px solid ${C.green+'55'}`,background:`${C.green}08`}}>
                <span style={{fontSize:9,color:C.t3,letterSpacing:'.12em',textTransform:'uppercase'}}>output</span>
                <span style={{fontSize:16,fontWeight:800,color:C.green2,fontFamily:F.mono}}>OK</span>
                <span style={{fontSize:11,color:C.t2}}>key stored · TTL 60s</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detail */}
        <div style={{position:'sticky',top:72}}>
          {cur ? (
            <div key={cur.id} style={{border:`1px solid ${cur.color}33`,borderRadius:14,background:C.bg1,overflow:'hidden',animation:'fadeUp .22s ease'}}>
              <div style={{padding:'16px 18px',borderBottom:`1px solid ${C.b0}`,background:`${cur.color}0a`}}>
                <div style={{fontFamily:F.mono,fontSize:10,color:cur.color,marginBottom:4}}>Step {cur.id} · {cur.layer}</div>
                <div style={{fontSize:15,fontWeight:800,color:cur.color,marginBottom:2,fontFamily:F.display}}>{cur.label}</div>
                <div style={{fontSize:11,color:C.t3,fontFamily:F.mono}}>{cur.file}</div>
              </div>
              <div style={{padding:'14px 18px'}}>
                <p style={{fontSize:12.5,color:C.t2,lineHeight:1.8,marginBottom:14}}>{cur.note}</p>
                {cur.conn&&<div style={{padding:'8px 12px',borderRadius:7,background:`${cur.conn.color}08`,border:`1px solid ${cur.conn.color}22`}}>
                  <span style={{fontSize:9.5,color:C.t3,letterSpacing:'.1em',textTransform:'uppercase',marginRight:8}}>passes</span>
                  <span style={{fontFamily:F.mono,fontSize:11,color:cur.conn.color}}>{cur.conn.label}</span>
                </div>}
              </div>
              <div style={{padding:'10px 18px',borderTop:`1px solid ${C.b0}`}}>
                <button onClick={()=>setActive(null)} style={{fontSize:11,color:C.t3,background:'none',border:'none',cursor:'pointer',fontFamily:F.body,transition:'color .15s'}}
                  onMouseEnter={e=>e.currentTarget.style.color=C.t1}
                  onMouseLeave={e=>e.currentTarget.style.color=C.t3}
                >✕ close</button>
              </div>
            </div>
          ) : (
            <div style={{border:`1px solid ${C.b0}`,borderRadius:14,background:C.bg1,padding:'32px 20px',textAlign:'center'}}>
              <div style={{fontSize:28,marginBottom:10}}>🔍</div>
              <p style={{fontSize:13,color:C.t1,fontWeight:600,marginBottom:8,fontFamily:F.display}}>Inspect a step</p>
              <p style={{fontSize:12,color:C.t2,lineHeight:1.7}}>Click any step or press <span style={{color:C.blue}}>▶ Animate</span> to auto-play the full flow.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
