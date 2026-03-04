import { C, F } from '../../constants/theme'
import { DocHeader, H2, P, CodeBlock } from '../../components/ui'

const CMDS = [
  { cmd:'SET',    color:C.green,  syntax:'SET key value [EX seconds]', ret:'OK',              desc:'Store a key-value pair. Optional EX sets TTL in seconds.',             ex:'{"command":"SET","key":"user:1","value":"Gagan","ttl":60}\n← {"result":"OK"}',   args:[{n:'key',r:true,d:'Key to store'},{n:'value',r:true,d:'Value to associate'},{n:'EX sec',r:false,d:'TTL in seconds'}] },
  { cmd:'GET',    color:C.blue2,  syntax:'GET key',                    ret:'value or null',   desc:'Retrieve a value by key. Returns null if missing or expired.',          ex:'{"command":"GET","key":"user:1"}\n← {"result":"Gagan"}',                          args:[{n:'key',r:true,d:'Key to retrieve'}] },
  { cmd:'DEL',    color:C.rose,   syntax:'DEL key',                    ret:'1 or 0',          desc:'Delete a key. Removes its TTL entry and updates memory tracking.',      ex:'{"command":"DEL","key":"user:1"}\n← {"result":1}',                               args:[{n:'key',r:true,d:'Key to delete'}] },
  { cmd:'KEYS',   color:C.amber,  syntax:'KEYS',                       ret:'array of keys',   desc:'List all live (non-expired) keys in the store.',                       ex:'{"command":"KEYS"}\n← {"result":["user:1","session:abc"]}',                       args:[] },
  { cmd:'TTL',    color:C.amber,  syntax:'TTL key',                    ret:'-2 / -1 / secs',  desc:'-2 = key not found, -1 = no TTL, otherwise remaining seconds.',        ex:'{"command":"TTL","key":"session:abc"}\n← {"result":42}',                          args:[{n:'key',r:true,d:'Key to inspect'}] },
  { cmd:'EXISTS', color:C.violet, syntax:'EXISTS key',                 ret:'1 or 0',          desc:'Check if a key exists. Expired keys return 0.',                        ex:'{"command":"EXISTS","key":"user:1"}\n← {"result":1}',                            args:[{n:'key',r:true,d:'Key to check'}] },
  { cmd:'FLUSH',  color:C.rose,   syntax:'FLUSH',                      ret:'OK',              desc:'Delete all keys. Resets TTL index and memory tracker.',                ex:'{"command":"FLUSH"}\n← {"result":"OK"}',                                         args:[] },
  { cmd:'PING',   color:C.green,  syntax:'PING',                       ret:'PONG',            desc:'Heartbeat — useful for measuring round-trip latency.',                  ex:'{"command":"PING"}\n← {"result":"PONG"}',                                        args:[] },
]

export default function Commands() {
  return (
    <div style={{fontFamily:F.body,padding:'48px 0'}}>
      <DocHeader breadcrumb="// docs / commands" title="Commands" sub="Full reference for all KVMemo commands. Send JSON over WebSocket — id field required for request/response correlation."/>
      <CodeBlock label="Request format"  code={'{ "id": 1, "command": "SET", "key": "k", "value": "v", "ttl": 60 }'}/>
      <CodeBlock label="Response format" code={'{ "id": 1, "result": "OK" }   // success\n{ "id": 1, "error":  "msg" }   // error'}/>

      <div style={{marginTop:36,display:'flex',flexDirection:'column',gap:20}}>
        {CMDS.map(cmd=>(
          <div key={cmd.cmd} style={{border:`1px solid ${cmd.color}22`,borderLeft:`3px solid ${cmd.color}`,borderRadius:12,padding:'20px 22px',background:`${cmd.color}05`}}>
            <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:10}}>
              <span style={{fontSize:15,fontWeight:800,color:cmd.color,fontFamily:F.mono}}>{cmd.cmd}</span>
              <code style={{fontSize:12,color:C.t1,background:C.bg2,padding:'3px 10px',borderRadius:5,fontFamily:F.mono}}>{cmd.syntax}</code>
            </div>
            <P>{cmd.desc}</P>
            {cmd.args.length>0 && (
              <div style={{marginBottom:14}}>
                <p style={{fontSize:10.5,color:C.t3,letterSpacing:'.1em',textTransform:'uppercase',marginBottom:8}}>Arguments</p>
                {cmd.args.map(a=>(
                  <div key={a.n} style={{display:'grid',gridTemplateColumns:'100px 70px 1fr',gap:8,padding:'7px 12px',marginBottom:5,borderRadius:6,border:`1px solid ${C.b0}`,background:C.bg2,fontSize:12,alignItems:'center'}}>
                    <span style={{color:cmd.color,fontWeight:600,fontFamily:F.mono}}>{a.n}</span>
                    <span style={{color:a.r?C.rose:C.t3,fontSize:10,textTransform:'uppercase',letterSpacing:'.07em'}}>{a.r?'required':'optional'}</span>
                    <span style={{color:C.t2}}>{a.d}</span>
                  </div>
                ))}
              </div>
            )}
            <p style={{fontSize:11,color:C.t3,marginBottom:10}}><span style={{letterSpacing:'.08em',textTransform:'uppercase',marginRight:8}}>Returns</span><span style={{color:C.t1}}>{cmd.ret}</span></p>
            <CodeBlock label="Example" code={cmd.ex}/>
          </div>
        ))}
      </div>
    </div>
  )
}
