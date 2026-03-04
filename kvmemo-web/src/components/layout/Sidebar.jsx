import { useLocation, NavLink } from 'react-router-dom'
import { C, F } from '../../constants/theme'

const NAV = [
  { group:'Getting Started', items:[
    { to:'/docs/getting-started', label:'Introduction' },
    { to:'/docs/commands',        label:'Commands' },
    { to:'/docs/call-stack',      label:'Call Stack' },
  ]},
  { group:'Community', items:[
    { to:'/docs/contributing', label:'Contributing' },
    { to:'/docs/faq',          label:'FAQ' },
    { to:'/docs/changelog',    label:'Changelog' },
  ]},
]

export default function Sidebar({ open }) {
  const { pathname } = useLocation()

  return (
    <aside style={{
      position:'fixed',top:56,left:0,bottom:0,
      width:open?236:0,overflow:'hidden',
      borderRight:`1px solid ${open?C.b0:'transparent'}`,
      background:'rgba(2,8,23,.97)',
      transition:'width .26s cubic-bezier(.22,1,.36,1),border-color .26s',
      zIndex:200,fontFamily:F.body,
    }}>
      <div style={{width:236,height:'100%',overflowY:'auto',padding:'28px 0 32px'}}>
        {NAV.map(section => (
          <div key={section.group} style={{marginBottom:32}}>
            <p style={{padding:'0 20px 10px',fontSize:10.5,fontWeight:600,letterSpacing:'.09em',textTransform:'uppercase',color:C.t3}}>{section.group}</p>
            {section.items.map(({ to, label }) => {
              const active = pathname===to
              return (
                <NavLink key={to} to={to} style={{
                  display:'block',padding:'7px 20px',fontSize:13,
                  fontWeight:active?600:400,
                  color:active?C.tw:C.t2,
                  background:active?`${C.blue}12`:'transparent',
                  borderLeft:`2px solid ${active?C.blue:'transparent'}`,
                  transition:'all .15s',
                }}
                  onMouseEnter={e=>{if(!active){e.currentTarget.style.color=C.t1;e.currentTarget.style.background=C.bg2+'80'}}}
                  onMouseLeave={e=>{if(!active){e.currentTarget.style.color=C.t2;e.currentTarget.style.background='transparent'}}}
                >{label}</NavLink>
              )
            })}
          </div>
        ))}

        <div style={{margin:'0 14px',padding:'14px 16px',borderRadius:10,border:`1px solid ${C.b0}`,background:C.bg1}}>
          <p style={{fontSize:12,fontWeight:600,color:C.t1,marginBottom:6}}>KVMemo</p>
          <p style={{fontSize:11,color:C.t3,fontFamily:F.mono,lineHeight:1.7}}>v0.1.0-dev · C++20<br/>MIT License</p>
          <a href="https://github.com/Gagan2004bansal/KVMemo" target="_blank" rel="noreferrer"
            style={{display:'inline-block',marginTop:10,fontSize:11,color:C.blue,transition:'color .15s'}}
            onMouseEnter={e=>e.target.style.color=C.blue2}
            onMouseLeave={e=>e.target.style.color=C.blue}
          >View on GitHub →</a>
        </div>
      </div>
    </aside>
  )
}
