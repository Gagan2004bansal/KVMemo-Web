import { C, F } from '../../constants/theme'
import { DocHeader, H2, P, CodeBlock, Callout } from '../../components/ui'

export default function GettingStarted() {
  return (
    <div style={{fontFamily:F.body,padding:'48px 0'}}>
      <DocHeader breadcrumb="// docs / getting-started" title="Getting Started" sub="Build KVMemo from source in under 5 minutes. All you need is a C++20 compiler and CMake."/>

      <H2>Prerequisites</H2>
      {[
        {t:'CMake',v:'≥ 3.20',n:'Build system'},
        {t:'GCC / Clang',v:'C++20',n:'GCC 12+ or Clang 15+'},
        {t:'Git',v:'any',n:'To clone the repository'},
      ].map(({t,v,n})=>(
        <div key={t} style={{display:'grid',gridTemplateColumns:'140px 90px 1fr',gap:10,padding:'9px 14px',marginBottom:7,borderRadius:8,border:`1px solid ${C.b0}`,background:C.bg1,fontSize:12.5,alignItems:'center'}}>
          <span style={{color:C.t1,fontWeight:600}}>{t}</span>
          <span style={{color:C.amber,fontFamily:F.mono,fontSize:12}}>{v}</span>
          <span style={{color:C.t2}}>{n}</span>
        </div>
      ))}
      <Callout type="tip">On Windows use WSL2 (Ubuntu 22.04+). All three platforms are supported.</Callout>

      <H2>Clone & Build</H2>
      <CodeBlock label="bash" code={"git clone https://github.com/Gagan2004bansal/KVMemo.git\ncd KVMemo"}/>
      <CodeBlock label="Linux / macOS" code={"mkdir build && cd build\ncmake .. -DCMAKE_BUILD_TYPE=Release\ncmake --build . --parallel\n./kvmemo-server"}/>
      <CodeBlock label="Windows (MinGW)" code={'mkdir build && cd build\ncmake .. -G "MinGW Makefiles" -DCMAKE_BUILD_TYPE=Release\ncmake --build . --parallel\nkvmemo-server.exe'}/>

      <H2>Run the Server</H2>
      <CodeBlock label="bash" code={"./kvmemo-server\n\n# [KVMemo] Starting on 127.0.0.1:6379\n# [KVMemo] ShardManager — 64 shards initialized\n# [KVMemo] TTLManager started — tick: 100ms\n# [KVMemo] Ready."}/>
      <CodeBlock label="optional flags" code={"./kvmemo-server --port 6380 --shards 128 --memory-limit 256MB"}/>

      <H2>Connect a Client</H2>
      <P>KVMemo speaks JSON over WebSocket. Use any WS client or the built-in Playground tab.</P>
      <CodeBlock label="wscat (npm install -g wscat)" code={'wscat -c ws://localhost:6379/ws\n\n> {"id":1,"command":"SET","key":"name","value":"Gagan","ttl":60}\n< {"id":1,"result":"OK"}\n> {"id":2,"command":"GET","key":"name"}\n< {"id":2,"result":"Gagan"}'}/>
      <Callout type="info">Playground connects to ws://localhost:8080/ws by default. Start your server first.</Callout>

      <H2>Project Structure</H2>
      <CodeBlock label="source tree" code={"KVMemo/\n├── src/\n│   ├── engine/    ← KVEngine, ShardManager, Shard\n│   ├── ttl/       ← TTLIndex, TTLManager\n│   ├── eviction/  ← EvictionManager, LRUCache, EvictionPolicy\n│   ├── server/    ← TcpServer, Connection, Framing\n│   ├── protocol/  ← Parser, Dispatcher, CommandRegistry\n│   └── metrics/   ← MemoryTracker\n├── tests/\n└── CMakeLists.txt"}/>
    </div>
  )
}
