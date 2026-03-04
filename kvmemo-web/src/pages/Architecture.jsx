import { useState } from 'react'
import { C, F } from '../constants/theme'
import { SectionHead, Badge } from '../components/ui'

const COMPONENTS = {
  kv_engine:        { id:'kv_engine',        label:'KVEngine',        file:'kv_engine.h',        color:C.violet, layer:'core',     calls:['shard_manager','ttl_index','eviction_manager','memory_tracker'], calledBy:['dispatcher'],    desc:'Central orchestrator. Owns the public API (set, get, del, keys). Delegates storage to ShardManager, expiry to TTLIndex, memory to EvictionManager. Never touches raw data directly.' },
  shard_manager:    { id:'shard_manager',    label:'ShardManager',    file:'shard_manager.h',    color:C.blue,   layer:'storage',  calls:['shard'],                                                        calledBy:['kv_engine'],     desc:'Routes keys via hash(key) % N to the correct Shard. Owns N Shard instances. Shard count is configurable at startup — changing it affects distribution, not code.' },
  shard:            { id:'shard',            label:'Shard',           file:'shard.h',            color:C.blue2,  layer:'storage',  calls:[],                                                               calledBy:['shard_manager'], desc:'One shard = one unordered_map + one std::mutex. Read = shared_lock. Write = unique_lock. Completely isolated — one shard\'s lock never blocks another shard.' },
  ttl_index:        { id:'ttl_index',        label:'TTLIndex',        file:'ttl_index.h',        color:C.amber,  layer:'ttl',      calls:[],                                                               calledBy:['kv_engine','ttl_manager'], desc:'std::map<time_point, vector<string>> sorted by expiry deadline. On SET with EX, KVEngine registers the key. TTLManager polls collect_expired() every 100ms.' },
  ttl_manager:      { id:'ttl_manager',      label:'TTLManager',      file:'ttl_manager.h',      color:C.rose,   layer:'ttl',      calls:['ttl_index','kv_engine'],                                        calledBy:[],                desc:'Background std::thread waking every 100ms. Calls TTLIndex::collect_expired(), then KVEngine::del() for each expired key. Completely off the request path.' },
  eviction_manager: { id:'eviction_manager', label:'EvictionManager', file:'eviction_manager.h', color:C.green,  layer:'eviction', calls:[],                                                               calledBy:['kv_engine'],     desc:'Implements the EvictionPolicy interface (default: LRU via doubly-linked list + hashmap). When MemoryTracker signals a breach, KVEngine asks EvictionManager for victim keys.' },
  memory_tracker:   { id:'memory_tracker',   label:'MemoryTracker',   file:'memory_tracker.h',   color:C.cyan,   layer:'eviction', calls:[],                                                               calledBy:['kv_engine'],     desc:'Tracks live bytes. On SET: adds key+value length. On DEL/eviction: subtracts. Fires a callback when usage > limit (default 512MB), signalling KVEngine to evict.' },
  dispatcher:       { id:'dispatcher',       label:'Dispatcher',      file:'dispatcher.h',       color:C.blue,   layer:'protocol', calls:['command_registry','kv_engine'],                                 calledBy:['connection'],    desc:'Receives a typed Request from Parser. Looks up command in CommandRegistry to find the right handler, then calls handler.execute(request) and returns a Result.' },
  command_registry: { id:'command_registry', label:'CommandRegistry', file:'command_registry.h', color:C.t2,     layer:'protocol', calls:[],                                                               calledBy:['dispatcher'],    desc:'HashMap of command_name → unique_ptr<CommandHandler>. Adding a new command = one register_command() call at startup. No changes to Dispatcher or Engine needed.' },
  parser:           { id:'parser',           label:'Parser',          file:'parser.h',           color:C.amber,  layer:'protocol', calls:[],                                                               calledBy:['connection'],    desc:'Deserializes raw JSON bytes into a typed Request{ command, key, value, ttl, id }. Returns Result::Err for malformed messages — never throws.' },
  connection:       { id:'connection',       label:'Connection',      file:'connection.h',       color:C.blue2,  layer:'network',  calls:['parser','dispatcher'],                                          calledBy:['tcp_server'],    desc:'Owns one client socket. Reads bytes into a buffer, uses Framing to extract messages, calls Parser → Dispatcher. Writes serialized response back. One Connection per client.' },
  tcp_server:       { id:'tcp_server',       label:'TcpServer',       file:'tcp_server.h',       color:C.cyan,   layer:'network',  calls:['connection'],                                                   calledBy:[],                desc:'Binds to the configured port. Accepts incoming TCP connections in a loop. For each socket, creates a Connection and dispatches it to the thread pool.' },
}

const LAYERS = [
  { id:'network',  label:'Network Layer',   color:C.cyan,   ids:['tcp_server','connection'] },
  { id:'protocol', label:'Protocol Layer',  color:C.amber,  ids:['parser','command_registry','dispatcher'] },
  { id:'core',     label:'Engine Core',     color:C.violet, ids:['kv_engine'] },
  { id:'storage',  label:'Storage Layer',   color:C.blue,   ids:['shard_manager','shard'] },
  { id:'ttl',      label:'TTL Layer',       color:C.rose,   ids:['ttl_index','ttl_manager'] },
  { id:'eviction', label:'Eviction Layer',  color:C.green,  ids:['eviction_manager','memory_tracker'] },
]

function Node({ comp, active, related, onSelect }) {
  const isActive  = active === comp.id
  const isRelated = related.includes(comp.id)
  const dim       = active && !isActive && !isRelated

  return (
    <div onClick={()=>onSelect(comp.id)} style={{
      padding:'10px 14px',borderRadius:9,textAlign:'center',cursor:'pointer',
      border:`1.5px solid ${isActive?comp.color+'88':isRelated?comp.color+'44':C.b0}`,
      background:isActive?`${comp.color}18`:isRelated?`${comp.color}0a`:C.bg2,
      opacity:dim?.22:1,
      boxShadow:isActive?`0 0 22px ${comp.color}22`:'none',
      transition:'all .18s',
    }}
      onMouseEnter={e=>{if(!isActive){e.currentTarget.style.borderColor=`${comp.color}55`;e.currentTarget.style.background=`${comp.color}0f`}}}
      onMouseLeave={e=>{if(!isActive){e.currentTarget.style.borderColor=isRelated?`${comp.color}44`:C.b0;e.currentTarget.style.background=isRelated?`${comp.color}0a`:C.bg2}}}
    >
      <div style={{fontSize:12,fontWeight:700,color:isActive?comp.color:isRelated?comp.color:C.t1}}>{comp.label}</div>
      <div style={{fontSize:9.5,color:C.t3,fontFamily:F.mono,marginTop:2}}>{comp.file}</div>
    </div>
  )
}

export default function Architecture() {
  const [active, setActive] = useState(null)
  const toggle = id => setActive(p=>p===id?null:id)
  const cur     = active ? COMPONENTS[active] : null
  const related = cur ? [...(cur.calls||[]),...(cur.calledBy||[])] : []

  return (
    <div style={{fontFamily:F.body,padding:'80px 40px',maxWidth:1200,margin:'0 auto'}}>
      <SectionHead eyebrow="System Design" title="Component Architecture" sub="Click any component to inspect its role, file, and dependency relationships." titleSize="clamp(28px,3.5vw,42px)" center/>

      <div style={{display:'grid',gridTemplateColumns:'1fr 320px',gap:20,alignItems:'start'}}>

        {/* Component map */}
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          {LAYERS.map(layer=>(
            <div key={layer.id} style={{border:`1px solid ${layer.color}20`,borderRadius:12,padding:'16px 18px',background:`${layer.color}05`,position:'relative'}}>
              <div style={{position:'absolute',top:-10,left:14,fontSize:10,fontWeight:600,letterSpacing:'.08em',textTransform:'uppercase',padding:'2px 10px',borderRadius:999,background:C.bg1,color:layer.color,border:`1px solid ${layer.color}28`}}>{layer.label}</div>
              <div style={{marginTop:8,display:'flex',gap:10,flexWrap:'wrap'}}>
                {layer.ids.map(id=>(
                  <Node key={id} comp={COMPONENTS[id]} active={active} related={related} onSelect={toggle}/>
                ))}
              </div>
            </div>
          ))}
          {!active && <p style={{textAlign:'center',fontSize:12,color:C.t3,marginTop:6,fontFamily:F.mono}}>↑  click any node to inspect</p>}
        </div>

        {/* Detail panel */}
        <div style={{position:'sticky',top:72}}>
          {cur ? (
            <div key={cur.id} style={{border:`1px solid ${cur.color}33`,borderRadius:14,background:C.bg1,overflow:'hidden',animation:'fadeUp .22s ease'}}>
              <div style={{padding:'18px 20px 16px',borderBottom:`1px solid ${C.b0}`,background:`${cur.color}0c`}}>
                <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}>
                  <div style={{width:10,height:10,borderRadius:'50%',background:cur.color,boxShadow:`0 0 8px ${cur.color}`}}/>
                  <span style={{fontSize:16,fontWeight:800,color:cur.color,fontFamily:F.display}}>{cur.label}</span>
                </div>
                <div style={{fontFamily:F.mono,fontSize:11,color:C.t3,marginBottom:8}}>{cur.file}</div>
                <Badge color={cur.color}>{cur.layer} layer</Badge>
              </div>
              <div style={{padding:'16px 20px'}}>
                <p style={{fontSize:12.5,color:C.t2,lineHeight:1.8,marginBottom:18}}>{cur.desc}</p>
                {cur.calls?.length>0 && (
                  <div style={{marginBottom:14}}>
                    <p style={{fontSize:10,color:C.t3,letterSpacing:'.1em',textTransform:'uppercase',marginBottom:8}}>Calls →</p>
                    <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                      {cur.calls.map(id=>(
                        <button key={id} onClick={()=>toggle(id)} style={{padding:'3px 10px',borderRadius:6,border:`1px solid ${COMPONENTS[id]?.color}33`,background:`${COMPONENTS[id]?.color}10`,color:COMPONENTS[id]?.color,fontSize:11,fontWeight:600,cursor:'pointer',fontFamily:F.body,transition:'opacity .15s'}}
                          onMouseEnter={e=>e.currentTarget.style.opacity='.7'}
                          onMouseLeave={e=>e.currentTarget.style.opacity='1'}
                        >{COMPONENTS[id]?.label}</button>
                      ))}
                    </div>
                  </div>
                )}
                {cur.calledBy?.length>0 && (
                  <div>
                    <p style={{fontSize:10,color:C.t3,letterSpacing:'.1em',textTransform:'uppercase',marginBottom:8}}>Called by ←</p>
                    <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                      {cur.calledBy.map(id=>(
                        <button key={id} onClick={()=>toggle(id)} style={{padding:'3px 10px',borderRadius:6,border:`1px solid ${COMPONENTS[id]?.color}33`,background:`${COMPONENTS[id]?.color}10`,color:COMPONENTS[id]?.color,fontSize:11,fontWeight:600,cursor:'pointer',fontFamily:F.body,transition:'opacity .15s'}}
                          onMouseEnter={e=>e.currentTarget.style.opacity='.7'}
                          onMouseLeave={e=>e.currentTarget.style.opacity='1'}
                        >{COMPONENTS[id]?.label}</button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div style={{padding:'10px 20px',borderTop:`1px solid ${C.b0}`}}>
                <button onClick={()=>setActive(null)} style={{fontSize:11,color:C.t3,background:'none',border:'none',cursor:'pointer',fontFamily:F.body,transition:'color .15s'}}
                  onMouseEnter={e=>e.currentTarget.style.color=C.t1}
                  onMouseLeave={e=>e.currentTarget.style.color=C.t3}
                >✕ close</button>
              </div>
            </div>
          ) : (
            <div style={{border:`1px solid ${C.b0}`,borderRadius:14,background:C.bg1,padding:'32px 24px',textAlign:'center'}}>
              <div style={{fontSize:28,marginBottom:12}}>🔍</div>
              <p style={{fontSize:13,color:C.t1,fontWeight:600,marginBottom:8,fontFamily:F.display}}>Select a component</p>
              <p style={{fontSize:12,color:C.t2,lineHeight:1.7}}>Click any node to see its role, file location, and dependency relationships.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
