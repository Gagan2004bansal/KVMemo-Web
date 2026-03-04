import { useState, useRef, useCallback } from 'react'
import { C, F } from '../constants/theme'
import { useWebSocket, WS_URL } from '../hooks/useWebSocket'

const VALID = new Set(['SET','GET','DEL','KEYS','FLUSH','PING','TTL','EXISTS'])
const QUICK = ['PING','SET user:1 "Gagan" 30','GET user:1','TTL user:1','KEYS','DEL user:1','FLUSH']

export default function Playground() {
  const { status, connect, disconnect, send } = useWebSocket()
  const [input, setInput]   = useState('')
  const [history, setHist]  = useState([])
  const [hIdx, setHIdx]     = useState(-1)
  const [logs, setLogs]     = useState([
    { t:'sys', m:`KVMemo Shell  ·  ${WS_URL}` },
    { t:'sys', m:"Type 'connect' to connect, or 'help' for commands." },
    { t:'sys', m:'─'.repeat(50) },
  ])
  const logRef  = useRef(null)
  const inpRef  = useRef(null)

  const push = (t, m) => setLogs(p => {
    const next = [...p.slice(-150), { t, m }]
    requestAnimationFrame(()=>{ if(logRef.current) logRef.current.scrollTop=logRef.current.scrollHeight })
    return next
  })

  const run = useCallback(async () => {
    const raw = input.trim(); if(!raw) return
    setInput(''); setHIdx(-1)
    setHist(p=>[raw,...p.slice(0,99)])
    push('cmd', raw)

    const parts = raw.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g)??[]
    const op = parts[0]?.toUpperCase()??''

    if (op==='CONNECT')    { connect(); push('sys',`Connecting to ${WS_URL}…`); return }
    if (op==='DISCONNECT') { disconnect(); push('sys','Disconnected.'); return }
    if (op==='CLEAR')      { setLogs([]); return }
    if (op==='HELP') {
      ['  SET key value [ttl]   store a key','  GET key                 retrieve value','  DEL key                 delete key','  KEYS                    list all keys','  TTL key                 remaining TTL','  EXISTS key              1 if exists','  FLUSH                   clear entire store','  PING                    heartbeat → PONG','  connect / disconnect    WebSocket control','  clear                   clear terminal'].forEach(l=>push('sys',l))
      return
    }
    if (!VALID.has(op)) { push('err',`ERR unknown command '${parts[0]}'`); return }
    if (status!=='connected') { push('err',"ERR not connected — type 'connect' first"); return }

    const t0  = performance.now()
    const res = await send({ command:op, key:parts[1], value:parts[2]?.replace(/^["']|["']$/g,''), ttl:parts[3]?parseInt(parts[3]):undefined })
    const ms  = (performance.now()-t0).toFixed(1)

    if (res.error) { push('err',`ERR ${res.error}`) }
    else {
      const v = res.result??res.data
      const d = v===null||v===undefined?'(nil)':Array.isArray(v)?v.map((x,i)=>`${i+1}) "${x}"`).join('\n'):typeof v==='object'?JSON.stringify(v,null,2):String(v)
      push('ok',`${d}   (${ms}ms)`)
    }
  }, [input, status, send, connect, disconnect])

  const onKey = e => {
    if (e.key==='Enter') { run(); return }
    if (e.key==='ArrowUp')   { e.preventDefault(); const i=Math.min(hIdx+1,history.length-1); setHIdx(i); setInput(history[i]??'') }
    if (e.key==='ArrowDown') { e.preventDefault(); const i=Math.max(hIdx-1,-1); setHIdx(i); setInput(i===-1?'':history[i]??'') }
  }

  const WS_UI = { connected:{col:C.green,label:'Connected'}, connecting:{col:C.amber,label:'Connecting…'}, disconnected:{col:C.t3,label:'Offline'} }
  const st = WS_UI[status]
  const LC = { cmd:C.t1, ok:C.green2, err:C.rose, sys:C.t3 }

  return (
    <div style={{fontFamily:F.body,padding:'80px 40px',maxWidth:1040,margin:'0 auto'}}>
      <div style={{marginBottom:32}}>
        <p style={{fontSize:11,fontWeight:600,letterSpacing:'.12em',textTransform:'uppercase',color:C.blue,marginBottom:12}}>Playground</p>
        <h1 style={{fontSize:'clamp(26px,3.5vw,36px)',fontWeight:800,color:C.tw,letterSpacing:'-.025em',marginBottom:12,fontFamily:F.display}}>Live Shell</h1>
        <p style={{fontSize:14,color:C.t2,lineHeight:1.7}}>Connect to your local KVMemo instance and run commands interactively.</p>
      </div>

      {/* Connection bar */}
      <div style={{display:'flex',alignItems:'center',gap:14,padding:'10px 16px',borderRadius:10,border:`1px solid ${status==='connected'?C.green+'44':C.b0}`,background:status==='connected'?`${C.green}08`:C.bg1,marginBottom:16,transition:'all .2s'}}>
        <div style={{width:7,height:7,borderRadius:'50%',background:st.col,boxShadow:status==='connected'?`0 0 8px ${C.green}`:'none',animation:status==='connecting'?'pulse .9s ease infinite':'none'}}/>
        <span style={{fontSize:12.5,color:C.t2,fontFamily:F.mono,flex:1}}>{WS_URL}</span>
        <span style={{fontSize:11,color:st.col,fontFamily:F.mono}}>{st.label}</span>
        <button onClick={status==='connected'?disconnect:connect} style={{padding:'5px 16px',borderRadius:6,fontSize:12,fontWeight:600,border:`1px solid ${status==='connected'?C.rose+'55':C.b1}`,background:'transparent',color:status==='connected'?C.rose:C.t1,transition:'all .15s'}}
          onMouseEnter={e=>e.currentTarget.style.opacity='.75'}
          onMouseLeave={e=>e.currentTarget.style.opacity='1'}
        >{status==='connected'?'Disconnect':'Connect'}</button>
      </div>

      {/* Terminal */}
      <div style={{borderRadius:14,border:`1px solid ${C.b1}`,background:C.bg1,overflow:'hidden',boxShadow:`0 0 60px rgba(0,0,0,.4)`}}>
        <div style={{display:'flex',alignItems:'center',gap:6,padding:'10px 16px',borderBottom:`1px solid ${C.b0}`,background:'rgba(0,0,0,.25)'}}>
          {['#ff5f57','#febc2e','#28c840'].map(c=><div key={c} style={{width:11,height:11,borderRadius:'50%',background:c,opacity:.9}}/>)}
          <span style={{marginLeft:10,fontSize:11,color:C.t3,fontFamily:F.mono}}>kvmemo-shell</span>
          <span style={{marginLeft:'auto',fontSize:10,color:C.t3,fontFamily:F.mono}}>↑↓ history</span>
        </div>

        <div ref={logRef} style={{height:380,overflowY:'auto',padding:'14px 20px',fontFamily:F.mono,fontSize:13,lineHeight:1.9}}>
          {logs.map((l,i)=>(
            <div key={i} style={{color:LC[l.t]??C.t1,animation:i===logs.length-1?'slideL .12s ease':'none',whiteSpace:'pre-wrap',wordBreak:'break-all'}}>
              {l.t==='cmd'?<><span style={{color:C.blue,marginRight:9}}>❯</span>{l.m}</>:l.m}
            </div>
          ))}
          <span style={{color:C.blue2,animation:'blink .9s ease infinite'}}>█</span>
        </div>

        <div style={{borderTop:`1px solid ${C.b0}`,display:'flex',alignItems:'center',padding:'10px 20px',gap:10,background:`${C.blue}05`}}>
          <span style={{color:C.blue,fontSize:16,flexShrink:0}}>❯</span>
          <input ref={inpRef} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={onKey}
            placeholder={status==='connected'?'SET key value [ttl]':"type 'connect' to start"}
            style={{flex:1,background:'transparent',border:'none',outline:'none',color:C.tw,fontFamily:F.mono,fontSize:13,caretColor:C.blue2}}
            autoComplete="off" spellCheck={false}
          />
          <button onClick={run} style={{padding:'5px 18px',borderRadius:6,border:`1px solid ${C.b1}`,background:'transparent',color:C.t1,fontFamily:F.body,fontSize:12,fontWeight:600,transition:'all .15s'}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=C.b2;e.currentTarget.style.color=C.tw}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor=C.b1;e.currentTarget.style.color=C.t1}}
          >Run</button>
        </div>

        <div style={{borderTop:`1px solid ${C.b0}`,padding:'10px 20px',display:'flex',flexWrap:'wrap',gap:7}}>
          {QUICK.map(q=>(
            <button key={q} onClick={()=>{setInput(q);inpRef.current?.focus()}} style={{padding:'4px 11px',borderRadius:6,border:`1px solid ${C.b0}`,background:'transparent',color:C.t2,fontFamily:F.mono,fontSize:11,cursor:'pointer',transition:'all .12s'}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=C.b1;e.currentTarget.style.color=C.t1}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=C.b0;e.currentTarget.style.color=C.t2}}
            >{q}</button>
          ))}
        </div>
      </div>
      <p style={{marginTop:12,fontSize:11,color:C.t3,fontFamily:F.mono}}>Protocol: JSON over WebSocket · <span style={{color:C.t2}}>{'{command, key, value, ttl, id}'}</span></p>
    </div>
  )
}
