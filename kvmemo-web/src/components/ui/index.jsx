import { C, F } from '../../constants/theme'

// ── Badge ─────────────────────────────────────────────
export function Badge({ children, color = C.blue, dot = false }) {
  return (
    <span style={{
      display:'inline-flex',alignItems:'center',gap:5,
      padding:'3px 10px',borderRadius:999,
      fontSize:10.5,fontWeight:600,letterSpacing:'.04em',
      background:`${color}18`,color,border:`1px solid ${color}30`,
    }}>
      {dot && <span style={{width:5,height:5,borderRadius:'50%',background:color,boxShadow:`0 0 5px ${color}`}}/>}
      {children}
    </span>
  )
}

// ── SectionHead ───────────────────────────────────────
export function SectionHead({ eyebrow, title, sub, center=true }) {
  return (
    <div style={{textAlign:center?'center':'left',marginBottom:56}}>
      {eyebrow && <p style={{fontSize:11,fontWeight:600,letterSpacing:'.12em',textTransform:'uppercase',color:C.blue,marginBottom:14}}>{eyebrow}</p>}
      <h2 style={{fontSize:'clamp(26px,3.5vw,40px)',fontWeight:800,color:C.tw,letterSpacing:'-.03em',lineHeight:1.1,marginBottom:sub?14:0,fontFamily:F.display}}>{title}</h2>
      {sub && <p style={{fontSize:15,color:C.t2,lineHeight:1.75,maxWidth:560,margin:center?'0 auto':'0'}}>{sub}</p>}
    </div>
  )
}

// ── Card ──────────────────────────────────────────────
export function Card({ children, style={}, hover=false, accent }) {
  return (
    <div className={hover?'hcard':''} style={{
      border:`1px solid ${C.b0}`,borderRadius:14,
      background:C.bg1,padding:'22px 24px',
      position:'relative',overflow:'hidden',
      ...(accent?{boxShadow:`inset 0 0 40px ${accent}`}:{}),
      ...style,
    }}>
      {children}
    </div>
  )
}

// ── Divider ───────────────────────────────────────────
export function Divider({ my=64 }) {
  return <div style={{height:1,background:`linear-gradient(90deg,transparent,${C.b0},transparent)`,margin:`${my}px 0`}}/>
}

// ── CodeBlock ─────────────────────────────────────────
export function CodeBlock({ code, label }) {
  const copy = () => navigator.clipboard?.writeText(code)
  const color = line => {
    if (!line.trim()) return C.t3
    if (line.startsWith('#')||line.startsWith('//')) return C.t3
    if (line.startsWith('←')||line.startsWith('< ')) return C.green2
    if (line.includes('"OK"')||line.startsWith('✓')) return C.green2
    if (line.startsWith('>')||line.startsWith('$ ')||line.startsWith('❯')) return C.blue2
    if (line.startsWith('[')) return C.cyan2
    return C.t1
  }
  return (
    <div style={{borderRadius:12,border:`1px solid ${C.b0}`,overflow:'hidden',background:C.bg1,marginBottom:16}}>
      {label && (
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 16px',borderBottom:`1px solid ${C.b0}`,background:'rgba(0,0,0,.2)'}}>
          <span style={{fontSize:11,color:C.t3,fontFamily:F.mono,letterSpacing:'.06em'}}>{label}</span>
          <button onClick={copy} style={{fontSize:10,color:C.t3,background:'none',border:`1px solid ${C.b0}`,borderRadius:4,padding:'2px 8px',transition:'all .15s',fontFamily:F.mono}}
            onMouseEnter={e=>{e.currentTarget.style.color=C.tw;e.currentTarget.style.borderColor=C.b1}}
            onMouseLeave={e=>{e.currentTarget.style.color=C.t3;e.currentTarget.style.borderColor=C.b0}}
          >copy</button>
        </div>
      )}
      <div style={{padding:'14px 18px',overflowX:'auto'}}>
        {code.split('\n').map((line,i)=>(
          <div key={i} style={{display:'flex',fontFamily:F.mono,fontSize:12.5,lineHeight:1.9}}>
            <span style={{color:C.t4,userSelect:'none',minWidth:28,textAlign:'right',paddingRight:14,fontSize:11,flexShrink:0}}>{i+1}</span>
            <span style={{color:color(line)}}>{line||'\u00a0'}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Callout ───────────────────────────────────────────
export function Callout({ type='info', children }) {
  const map={info:{c:C.blue,l:'Note'},tip:{c:C.green,l:'Tip'},warn:{c:C.amber,l:'Warning'}}
  const {c,l}=map[type]??map.info
  return (
    <div style={{borderRadius:10,border:`1px solid ${c}28`,borderLeft:`3px solid ${c}`,padding:'12px 18px',marginBottom:18,background:`${c}08`,fontSize:13,color:C.t1,lineHeight:1.75}}>
      <span style={{color:c,fontWeight:700,marginRight:8,fontSize:11,textTransform:'uppercase',letterSpacing:'.07em'}}>{l}</span>
      {children}
    </div>
  )
}

// ── Tag (inline code) ─────────────────────────────────
export function Tag({ children, color=C.blue }) {
  return <code style={{fontFamily:F.mono,fontSize:'.88em',color,background:`${color}12`,padding:'1px 6px',borderRadius:4,border:`1px solid ${color}20`}}>{children}</code>
}

// ── DocHeader ─────────────────────────────────────────
export function DocHeader({ breadcrumb, title, sub }) {
  return (
    <div style={{marginBottom:40,paddingBottom:32,borderBottom:`1px solid ${C.b0}`}}>
      <p style={{fontSize:11,color:C.t3,letterSpacing:'.1em',textTransform:'uppercase',marginBottom:12,fontFamily:F.mono}}>{breadcrumb}</p>
      <h1 style={{fontSize:'clamp(24px,3vw,34px)',fontWeight:800,color:C.tw,letterSpacing:'-.025em',lineHeight:1.15,marginBottom:sub?12:0,fontFamily:F.display}}>{title}</h1>
      {sub && <p style={{fontSize:14,color:C.t2,lineHeight:1.75,maxWidth:580}}>{sub}</p>}
    </div>
  )
}

// ── Prose helpers ─────────────────────────────────────
export function H2({ children }) {
  return <h2 style={{fontSize:18,fontWeight:700,color:C.tw,letterSpacing:'-.015em',marginTop:40,marginBottom:14,paddingBottom:10,borderBottom:`1px solid ${C.b0}`,fontFamily:F.display}}>{children}</h2>
}
export function P({ children }) {
  return <p style={{fontSize:13.5,color:C.t2,lineHeight:1.85,marginBottom:16}}>{children}</p>
}
