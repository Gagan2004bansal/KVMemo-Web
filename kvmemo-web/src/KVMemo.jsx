import { useState, useEffect, useRef, useCallback } from "react";

/* ─────────────────────────────────────────────
   GLOBAL STYLES injected once
───────────────────────────────────────────── */
const GlobalStyle = () => {
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Orbitron:wght@700;800;900&display=swap');

      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      :root {
        --bg:       #030508;
        --bg1:      #06090f;
        --bg2:      #0a0e18;
        --surface:  #0d1120;
        --border:   #141d33;
        --border2:  #1c2740;
        --cyan:     #00e5ff;
        --cyan2:    #00b8cc;
        --purple:   #a855f7;
        --pink:     #f43f5e;
        --green:    #10b981;
        --amber:    #f59e0b;
        --text:     #ccd6f0;
        --muted:    #4a5a7a;
        --muted2:   #687a9b;
        --font-display: 'Orbitron', monospace;
        --font-mono: 'JetBrains Mono', monospace;
      }
      html { scroll-behavior: smooth; }
      body {
        background: var(--bg);
        color: var(--text);
        font-family: var(--font-mono);
        overflow-x: hidden;
      }
      ::-webkit-scrollbar { width: 4px; }
      ::-webkit-scrollbar-track { background: var(--bg); }
      ::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 4px; }

      @keyframes pulse-ring {
        0%,100% { opacity: 0.6; transform: scale(1); }
        50% { opacity: 0.15; transform: scale(1.04); }
      }
      @keyframes float {
        0%,100% { transform: translateY(0px); }
        50% { transform: translateY(-8px); }
      }
      @keyframes scan {
        0% { transform: translateY(-100%); }
        100% { transform: translateY(100vh); }
      }
      @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
      @keyframes flow-r { to { stroke-dashoffset: -24; } }
      @keyframes glow-text {
        0%,100% { text-shadow: 0 0 20px rgba(0,229,255,0.5), 0 0 40px rgba(0,229,255,0.2); }
        50%      { text-shadow: 0 0 40px rgba(0,229,255,0.8), 0 0 80px rgba(0,229,255,0.3); }
      }
      @keyframes fadeUp {
        from { opacity:0; transform:translateY(24px); }
        to   { opacity:1; transform:none; }
      }
      @keyframes slideIn {
        from { opacity:0; transform:translateX(-16px); }
        to   { opacity:1; transform:none; }
      }
      @keyframes spin { to { transform: rotate(360deg); } }
      @keyframes progress-fill {
        from { width: 0%; }
        to   { width: var(--target-w); }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);
  return null;
};

/* ─────────────────────────────────────────────
   SCANLINE BACKGROUND
───────────────────────────────────────────── */
const ScanlineBg = () => (
  <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
    {/* dot grid */}
    <div style={{
      position: "absolute", inset: 0,
      backgroundImage: "radial-gradient(rgba(0,229,255,0.04) 1px, transparent 1px)",
      backgroundSize: "32px 32px",
    }} />
    {/* scan line */}
    <div style={{
      position: "absolute", left: 0, right: 0, height: "2px",
      background: "linear-gradient(90deg, transparent, rgba(0,229,255,0.06), transparent)",
      animation: "scan 8s linear infinite",
    }} />
    {/* corner glow blobs */}
    <div style={{ position:"absolute", width:600, height:600, borderRadius:"50%", background:"var(--cyan)", filter:"blur(140px)", opacity:0.04, top:-200, left:-200 }} />
    <div style={{ position:"absolute", width:500, height:500, borderRadius:"50%", background:"var(--purple)", filter:"blur(140px)", opacity:0.05, bottom:-160, right:-160 }} />
    <div style={{ position:"absolute", width:400, height:400, borderRadius:"50%", background:"var(--pink)", filter:"blur(160px)", opacity:0.04, top:"40%", left:"50%" }} />
  </div>
);

/* ─────────────────────────────────────────────
   NAV
───────────────────────────────────────────── */
const Nav = () => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  const links = ["Playground", "Architecture", "How It Works", "Benchmarks", "Roadmap"];
  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      padding: "0 32px",
      height: 60,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      background: scrolled ? "rgba(3,5,8,0.92)" : "transparent",
      borderBottom: scrolled ? "1px solid var(--border)" : "1px solid transparent",
      backdropFilter: scrolled ? "blur(16px)" : "none",
      transition: "all 0.3s",
      fontFamily: "var(--font-mono)",
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 6,
          background: "linear-gradient(135deg, var(--cyan), var(--purple))",
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize: 12, fontWeight: 700, color: "#000",
          fontFamily: "var(--font-display)",
        }}>KV</div>
        <span style={{ fontFamily:"var(--font-display)", fontSize:14, fontWeight:800, color:"var(--cyan)", letterSpacing:"0.1em" }}>KVMemo</span>
      </div>

      <div style={{ display:"flex", gap:28 }}>
        {links.map(l => (
          <a key={l} href={`#${l.toLowerCase().replace(/ /g,"-")}`}
            style={{ fontSize:11, color:"var(--muted2)", letterSpacing:"0.1em", textDecoration:"none", textTransform:"uppercase", transition:"color 0.2s" }}
            onMouseEnter={e => e.target.style.color="var(--cyan)"}
            onMouseLeave={e => e.target.style.color="var(--muted2)"}
          >{l}</a>
        ))}
      </div>

      <a href="https://github.com/Gagan2004bansal/KVMemo" target="_blank" rel="noreferrer"
        style={{
          display:"flex", alignItems:"center", gap:8,
          padding:"7px 16px", borderRadius:8,
          border:"1.5px solid var(--border2)",
          fontSize:11, color:"var(--text)", textDecoration:"none",
          letterSpacing:"0.08em", textTransform:"uppercase",
          background:"rgba(255,255,255,0.02)",
          transition:"all 0.2s",
        }}
        onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--cyan)";e.currentTarget.style.color="var(--cyan)";}}
        onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border2)";e.currentTarget.style.color="var(--text)";}}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
        </svg>
        GitHub
      </a>
    </nav>
  );
};

/* ─────────────────────────────────────────────
   HERO
───────────────────────────────────────────── */
const Hero = () => {
  const [tick, setTick] = useState(true);
  useEffect(() => {
    const t = setInterval(() => setTick(p => !p), 530);
    return () => clearInterval(t);
  }, []);

  return (
    <section style={{
      minHeight: "100vh", display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      padding:"100px 32px 60px", position:"relative", zIndex:1,
      textAlign:"center",
    }}>
      {/* Badge */}
      <div style={{
        display:"inline-flex", alignItems:"center", gap:8,
        padding:"5px 14px", borderRadius:999,
        border:"1px solid rgba(0,229,255,0.25)",
        background:"rgba(0,229,255,0.06)",
        fontSize:10, letterSpacing:"0.18em", textTransform:"uppercase",
        color:"var(--cyan)", marginBottom:32,
        animation:"fadeUp 0.5s ease both",
      }}>
        <span style={{ width:6, height:6, borderRadius:"50%", background:"var(--cyan)", display:"inline-block", animation:"blink 1.2s ease infinite" }} />
        C++20 · In-Memory · Production Grade
      </div>

      {/* Main title */}
      <h1 style={{
        fontFamily:"var(--font-display)", fontSize:"clamp(48px,8vw,96px)",
        fontWeight:900, letterSpacing:"-0.02em", lineHeight:1,
        animation:"fadeUp 0.5s 0.1s ease both, glow-text 3s ease infinite",
        color:"var(--cyan)", marginBottom:4,
      }}>
        KVMemo
      </h1>
      <div style={{
        fontFamily:"var(--font-display)", fontSize:"clamp(12px,2vw,18px)",
        fontWeight:700, letterSpacing:"0.3em", color:"var(--muted2)",
        textTransform:"uppercase", marginBottom:28,
        animation:"fadeUp 0.5s 0.15s ease both",
      }}>
        In-Memory Key-Value Store
      </div>

      {/* Terminal tagline */}
      <div style={{
        fontFamily:"var(--font-mono)", fontSize:"clamp(14px,2vw,18px)",
        color:"var(--text)", opacity:0.75,
        marginBottom:52, maxWidth:560,
        animation:"fadeUp 0.5s 0.25s ease both",
        lineHeight:1.7,
      }}>
        High-performance Redis-like engine built with <span style={{color:"var(--cyan)"}}>C++20</span>.
        Shard-based concurrency, TTL scheduling, pluggable eviction —
        designed for <span style={{color:"var(--purple)"}}>production</span>.
        <span style={{ color:"var(--cyan)", animation:"blink 0.53s infinite" }}>{tick ? "█" : " "}</span>
      </div>

      {/* CTA row */}
      <div style={{ display:"flex", gap:16, flexWrap:"wrap", justifyContent:"center", animation:"fadeUp 0.5s 0.35s ease both" }}>
        <a href="#playground"
          style={{
            padding:"13px 32px", borderRadius:10,
            background:"var(--cyan)", color:"#000",
            fontFamily:"var(--font-mono)", fontSize:13, fontWeight:700,
            letterSpacing:"0.1em", textTransform:"uppercase",
            textDecoration:"none",
            boxShadow:"0 0 32px rgba(0,229,255,0.35)",
            transition:"all 0.2s",
          }}
          onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 0 56px rgba(0,229,255,0.6)";e.currentTarget.style.transform="translateY(-2px)";}}
          onMouseLeave={e=>{e.currentTarget.style.boxShadow="0 0 32px rgba(0,229,255,0.35)";e.currentTarget.style.transform="none";}}
        >
          Try Playground
        </a>
        <a href="https://github.com/Gagan2004bansal/KVMemo" target="_blank" rel="noreferrer"
          style={{
            padding:"13px 32px", borderRadius:10,
            border:"1.5px solid var(--border2)",
            background:"rgba(255,255,255,0.02)",
            color:"var(--text)",
            fontFamily:"var(--font-mono)", fontSize:13, fontWeight:600,
            letterSpacing:"0.1em", textTransform:"uppercase",
            textDecoration:"none",
            transition:"all 0.2s",
          }}
          onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--cyan)";e.currentTarget.style.color="var(--cyan)";}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border2)";e.currentTarget.style.color="var(--text)";}}
        >
          View Source
        </a>
      </div>

      {/* Stat pills */}
      <div style={{
        display:"flex", gap:20, marginTop:64, flexWrap:"wrap", justifyContent:"center",
        animation:"fadeUp 0.5s 0.5s ease both",
      }}>
        {[
          { v:"C++20", l:"Language" },
          { v:"Shard-based", l:"Concurrency" },
          { v:"LRU / LFU", l:"Eviction" },
          { v:"TTL", l:"Expiration" },
          { v:"MIT", l:"License" },
        ].map(({ v, l }) => (
          <div key={l} style={{
            padding:"10px 20px", borderRadius:8,
            border:"1px solid var(--border2)",
            background:"rgba(255,255,255,0.02)",
            textAlign:"center",
          }}>
            <div style={{ fontFamily:"var(--font-display)", fontSize:13, fontWeight:700, color:"var(--cyan)", letterSpacing:"0.05em" }}>{v}</div>
            <div style={{ fontSize:9, color:"var(--muted)", letterSpacing:"0.12em", textTransform:"uppercase", marginTop:2 }}>{l}</div>
          </div>
        ))}
      </div>
    </section>
  );
};

/* ─────────────────────────────────────────────
   PLAYGROUND
───────────────────────────────────────────── */
const Playground = () => {
  const [store, setStore] = useState({});
  const [ttlMap, setTtlMap] = useState({});
  const [cmd, setCmd] = useState("");
  const [logs, setLogs] = useState([
    { type:"info", text:"KVMemo shell ready. Type SET key value [TTL] | GET key | DEL key | KEYS | FLUSH" },
    { type:"info", text:'Try: SET user:1 "Gagan" 30' },
  ]);
  const logRef = useRef(null);
  const inputRef = useRef(null);

  // TTL expiry checker
  useEffect(() => {
    const t = setInterval(() => {
      const now = Date.now();
      setTtlMap(prev => {
        const expired = Object.entries(prev).filter(([, exp]) => exp <= now).map(([k]) => k);
        if (expired.length === 0) return prev;
        const next = { ...prev };
        expired.forEach(k => delete next[k]);
        setStore(s => {
          const ns = { ...s };
          expired.forEach(k => { delete ns[k]; });
          return ns;
        });
        setLogs(l => [...l, ...expired.map(k => ({ type:"expire", text:`[TTL] "${k}" expired and evicted` }))]);
        return next;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logs]);

  const addLog = (type, text) => setLogs(l => [...l.slice(-60), { type, text }]);

  const run = useCallback(() => {
    const raw = cmd.trim();
    if (!raw) return;
    addLog("cmd", `> ${raw}`);
    setCmd("");

    const parts = raw.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) || [];
    const op = parts[0]?.toUpperCase();

    if (op === "SET") {
      const key = parts[1];
      const val = parts[2]?.replace(/^["']|["']$/g, "");
      const ttl = parseInt(parts[3]);
      if (!key || !val) { addLog("error", "ERR syntax: SET key value [TTL_seconds]"); return; }
      setStore(s => ({ ...s, [key]: val }));
      if (!isNaN(ttl) && ttl > 0) {
        setTtlMap(t => ({ ...t, [key]: Date.now() + ttl * 1000 }));
        addLog("ok", `OK (TTL: ${ttl}s)`);
      } else {
        setTtlMap(t => { const n={...t}; delete n[key]; return n; });
        addLog("ok", "OK");
      }
    } else if (op === "GET") {
      const key = parts[1];
      if (!key) { addLog("error", "ERR syntax: GET key"); return; }
      const val = store[key];
      addLog(val !== undefined ? "ok" : "nil", val !== undefined ? `"${val}"` : "(nil)");
    } else if (op === "DEL") {
      const key = parts[1];
      if (!key) { addLog("error", "ERR syntax: DEL key"); return; }
      const existed = key in store;
      setStore(s => { const n={...s}; delete n[key]; return n; });
      setTtlMap(t => { const n={...t}; delete n[key]; return n; });
      addLog("ok", existed ? "(integer) 1" : "(integer) 0");
    } else if (op === "KEYS") {
      const keys = Object.keys(store);
      addLog("ok", keys.length ? keys.map((k,i) => `${i+1}) "${k}"`).join("  ") : "(empty)");
    } else if (op === "FLUSH") {
      setStore({}); setTtlMap({});
      addLog("ok", "OK — store flushed");
    } else if (op === "HELP") {
      addLog("info", "Commands: SET key value [ttl] | GET key | DEL key | KEYS | FLUSH");
    } else {
      addLog("error", `ERR unknown command '${parts[0]}'`);
    }
  }, [cmd, store]);

  const LOG_COLORS = {
    cmd: "var(--cyan)", ok: "var(--green)", error: "var(--pink)",
    nil: "var(--muted2)", info: "var(--muted2)", expire: "var(--amber)",
  };
  const LOG_PREFIX = { cmd:"", ok:"← ", error:"!! ", nil:"← ", info:"// ", expire:"⏱ " };

  const now = Date.now();

  return (
    <section id="playground" style={{ padding:"100px 32px", position:"relative", zIndex:1 }}>
      <SectionHeader tag="Interactive" title="Live Playground" sub="Simulated KVMemo engine running in your browser" />

      <div style={{
        maxWidth:1100, margin:"0 auto",
        display:"grid", gridTemplateColumns:"1fr 320px", gap:20,
      }}>
        {/* Terminal */}
        <div style={{
          border:"1.5px solid var(--border2)",
          borderRadius:14,
          background:"var(--bg1)",
          overflow:"hidden",
          boxShadow:"0 0 60px rgba(0,229,255,0.05)",
        }}>
          {/* Terminal bar */}
          <div style={{
            display:"flex", alignItems:"center", gap:8, padding:"10px 16px",
            borderBottom:"1px solid var(--border)",
            background:"rgba(0,0,0,0.3)",
          }}>
            {["var(--pink)","var(--amber)","var(--green)"].map(c => (
              <div key={c} style={{ width:10, height:10, borderRadius:"50%", background:c, opacity:0.7 }} />
            ))}
            <span style={{ fontSize:10, color:"var(--muted)", letterSpacing:"0.12em", textTransform:"uppercase", marginLeft:8 }}>
              kvmemo-shell — simulated
            </span>
          </div>

          {/* Log area */}
          <div ref={logRef} style={{
            height:340, overflowY:"auto", padding:"16px 20px",
            fontFamily:"var(--font-mono)", fontSize:13, lineHeight:2,
          }}>
            {logs.map((l, i) => (
              <div key={i} style={{ color: LOG_COLORS[l.type] || "var(--text)", animation:"slideIn 0.15s ease both" }}>
                <span style={{ opacity:0.4, marginRight:8, fontSize:11 }}>{LOG_PREFIX[l.type]}</span>
                {l.text}
              </div>
            ))}
          </div>

          {/* Input */}
          <div style={{
            borderTop:"1px solid var(--border)",
            display:"flex", alignItems:"center", gap:10,
            padding:"12px 20px",
            background:"rgba(0,229,255,0.02)",
          }}>
            <span style={{ color:"var(--cyan)", fontFamily:"var(--font-mono)", fontSize:14, fontWeight:600 }}>❯</span>
            <input
              ref={inputRef}
              value={cmd}
              onChange={e => setCmd(e.target.value)}
              onKeyDown={e => e.key === "Enter" && run()}
              placeholder='SET session:1 "hello" 60'
              style={{
                flex:1, background:"transparent", border:"none", outline:"none",
                color:"var(--text)", fontFamily:"var(--font-mono)", fontSize:13,
                caretColor:"var(--cyan)",
              }}
            />
            <button onClick={run} style={{
              padding:"6px 18px", borderRadius:6,
              background:"rgba(0,229,255,0.1)", border:"1px solid rgba(0,229,255,0.25)",
              color:"var(--cyan)", fontFamily:"var(--font-mono)", fontSize:11,
              letterSpacing:"0.1em", textTransform:"uppercase",
              cursor:"pointer", transition:"all 0.15s",
            }}
              onMouseEnter={e=>{e.currentTarget.style.background="rgba(0,229,255,0.18)";}}
              onMouseLeave={e=>{e.currentTarget.style.background="rgba(0,229,255,0.1)";}}
            >Run</button>
          </div>

          {/* Quick commands */}
          <div style={{
            borderTop:"1px solid var(--border)", padding:"10px 20px",
            display:"flex", flexWrap:"wrap", gap:8,
          }}>
            {[
              'SET name "KVMemo"',
              'GET name',
              'SET temp "data" 5',
              'KEYS',
              'DEL name',
              'FLUSH',
            ].map(q => (
              <button key={q} onClick={() => { setCmd(q); inputRef.current?.focus(); }}
                style={{
                  padding:"4px 10px", borderRadius:5,
                  border:"1px solid var(--border2)",
                  background:"transparent", color:"var(--muted2)",
                  fontFamily:"var(--font-mono)", fontSize:10,
                  cursor:"pointer", transition:"all 0.15s",
                }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--cyan)";e.currentTarget.style.color="var(--cyan)";}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border2)";e.currentTarget.style.color="var(--muted2)";}}
              >{q}</button>
            ))}
          </div>
        </div>

        {/* Store Inspector */}
        <div style={{
          border:"1.5px solid var(--border2)", borderRadius:14,
          background:"var(--bg1)", overflow:"hidden",
        }}>
          <div style={{
            padding:"12px 16px", borderBottom:"1px solid var(--border)",
            fontSize:10, letterSpacing:"0.15em", textTransform:"uppercase",
            color:"var(--muted2)", display:"flex", justifyContent:"space-between",
          }}>
            <span>Store Inspector</span>
            <span style={{ color:"var(--cyan)" }}>{Object.keys(store).length} keys</span>
          </div>
          <div style={{ padding:12, height:440, overflowY:"auto" }}>
            {Object.keys(store).length === 0 ? (
              <div style={{ color:"var(--muted)", fontSize:11, textAlign:"center", paddingTop:40 }}>
                Store is empty.<br/>Try SET key value
              </div>
            ) : (
              Object.entries(store).map(([k, v]) => {
                const exp = ttlMap[k];
                const remaining = exp ? Math.max(0, Math.round((exp - now) / 1000)) : null;
                return (
                  <div key={k} style={{
                    padding:"10px 12px", marginBottom:8, borderRadius:8,
                    border:"1px solid var(--border)",
                    background:"rgba(0,229,255,0.03)",
                    transition:"all 0.2s",
                  }}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--border2)";}}
                    onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";}}
                  >
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                      <span style={{ color:"var(--cyan)", fontSize:11, fontWeight:600, wordBreak:"break-all" }}>{k}</span>
                      {remaining !== null && (
                        <span style={{
                          fontSize:9, padding:"2px 6px", borderRadius:4,
                          background:"rgba(245,158,11,0.12)", color:"var(--amber)",
                          border:"1px solid rgba(245,158,11,0.2)", flexShrink:0, marginLeft:6,
                        }}>TTL {remaining}s</span>
                      )}
                    </div>
                    <div style={{ color:"var(--text)", fontSize:11, marginTop:4, opacity:0.75, wordBreak:"break-all" }}>"{v}"</div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

/* ─────────────────────────────────────────────
   ARCHITECTURE VISUALIZER
───────────────────────────────────────────── */
const ArchNode = ({ label, sub, color, active, onClick, style = {} }) => (
  <div onClick={onClick} style={{
    padding:"12px 16px", borderRadius:10,
    border:`1.5px solid ${active ? color : "rgba(255,255,255,0.08)"}`,
    background: active ? `rgba(${hexToRgb(color)},0.1)` : "rgba(255,255,255,0.02)",
    cursor:"pointer", textAlign:"center",
    boxShadow: active ? `0 0 24px rgba(${hexToRgb(color)},0.2)` : "none",
    transition:"all 0.2s",
    position:"relative",
    ...style,
  }}
    onMouseEnter={e=>{e.currentTarget.style.borderColor=color;}}
    onMouseLeave={e=>{e.currentTarget.style.borderColor=active?color:"rgba(255,255,255,0.08)";}}
  >
    {active && <div style={{ position:"absolute", inset:-8, borderRadius:14, border:`1px solid ${color}`, opacity:0.2, animation:"pulse-ring 2s ease infinite", pointerEvents:"none" }} />}
    <div style={{ fontFamily:"var(--font-display)", fontSize:10, fontWeight:700, color, letterSpacing:"0.07em", textTransform:"uppercase" }}>{label}</div>
    {sub && <div style={{ fontSize:9, color:"var(--muted2)", marginTop:3, letterSpacing:"0.06em" }}>{sub}</div>}
  </div>
);

function hexToRgb(hex) {
  if (hex.startsWith("var(")) return "0,229,255";
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return r ? `${parseInt(r[1],16)},${parseInt(r[2],16)},${parseInt(r[3],16)}` : "255,255,255";
}

const ARCH_DETAILS = {
  "Client":            { color:"#00e5ff", desc:"External consumer. Sends commands over TCP/socket layer. Stateless from the engine's perspective." },
  "ServerApp":         { color:"#818cf8", desc:"Owns all network I/O — connection handling, request parsing, thread dispatching. Zero storage knowledge." },
  "KVEngine":          { color:"#f59e0b", desc:"Central orchestrator. All public API calls (Set/Get/Delete) route through here. Coordinates storage, TTL, and eviction — implements none of them directly." },
  "ShardManager":      { color:"#10b981", desc:"Distributes keys across N shards via consistent hashing. Each shard is independently locked — no global storage mutex." },
  "Shard1":            { color:"#10b981", desc:"Owns a local key-value hashmap + per-shard mutex. Handles isolated reads/writes for its key range." },
  "Shard2":            { color:"#10b981", desc:"Second shard partition. Parallel to Shard1 — concurrent operations never share a lock across shards." },
  "ShardN":            { color:"#10b981", desc:"N-th shard. Shard count is configurable — more shards = lower lock contention = higher throughput." },
  "TTLIndex":          { color:"#f43f5e", desc:"Maintains expire_timestamp → [keys] ordered map. Efficient O(log n) expiry scan. Called by KVEngine::ProcessExpired()." },
  "EvictionManager":   { color:"#a855f7", desc:"Responds to memory pressure signals from MemoryTracker. Selects victim keys via EvictionPolicy. Never deletes — returns candidates to KVEngine." },
  "MemoryTracker":     { color:"#a855f7", desc:"Tracks heap usage per write/delete. Fires breach signal when usage exceeds configured limit." },
  "EvictionPolicy":    { color:"#a855f7", desc:"Strategy interface — LRU by default. Swappable with LFU, FIFO, or Random without engine changes (OCP)." },
  "LRUCache":          { color:"#6366f1", desc:"Doubly-linked list + hashmap implementation. O(1) get, put. Tracks access recency for eviction ordering." },
  "TTLManager":        { color:"#f43f5e", desc:"Background thread — wakes on a configurable tick interval. Calls KVEngine::ProcessExpired(now). Not in the hot request path." },
};

const Architecture = () => {
  const [active, setActive] = useState("KVEngine");
  const detail = ARCH_DETAILS[active];

  const toggle = (k) => setActive(p => p === k ? null : k);
  const n = (k) => (
    <ArchNode key={k} label={k.replace(/\d+$/,"").replace(/([A-Z])/g," $1").trim()}
      sub={k.match(/\d+/) ? k : undefined}
      color={ARCH_DETAILS[k]?.color || "#fff"}
      active={active === k} onClick={() => toggle(k)} />
  );

  return (
    <section id="architecture" style={{ padding:"100px 32px", position:"relative", zIndex:1 }}>
      <SectionHeader tag="Section 2" title="Architecture Visualizer" sub="Click any component to inspect its responsibility" />

      <div style={{ maxWidth:1100, margin:"0 auto", display:"grid", gridTemplateColumns:"1fr 300px", gap:24 }}>

        {/* Graph */}
        <div style={{ display:"flex", flexDirection:"column", gap:16, alignItems:"center" }}>

          {/* Client */}
          <div>{n("Client")}</div>

          <Arrow color="#818cf8" />

          {/* Server */}
          <LayerBox label="Server Layer" color="#818cf8">
            {n("ServerApp")}
          </LayerBox>

          <Arrow color="#f59e0b" />

          {/* Engine */}
          <LayerBox label="Engine Layer" color="#f59e0b">
            {n("KVEngine")}
          </LayerBox>

          {/* Fan-out */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16, width:"100%" }}>

            <LayerBox label="Storage Layer" color="#10b981">
              {n("ShardManager")}
              <div style={{ display:"flex", gap:8, marginTop:8 }}>
                {n("Shard1")}{n("Shard2")}{n("ShardN")}
              </div>
            </LayerBox>

            <LayerBox label="Expiration Layer" color="#f43f5e">
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {n("TTLIndex")}
                {n("TTLManager")}
              </div>
            </LayerBox>

            <LayerBox label="Eviction Layer" color="#a855f7">
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {n("EvictionManager")}
                {n("MemoryTracker")}
                {n("EvictionPolicy")}
                {n("LRUCache")}
              </div>
            </LayerBox>

          </div>
        </div>

        {/* Detail Panel */}
        <div style={{
          border:"1.5px solid var(--border2)", borderRadius:14,
          background:"var(--bg1)", padding:24,
          position:"sticky", top:80, height:"fit-content",
        }}>
          {detail ? (
            <>
              <div style={{
                fontFamily:"var(--font-display)", fontSize:12, fontWeight:800,
                color: detail.color, letterSpacing:"0.08em", textTransform:"uppercase",
                marginBottom:6,
              }}>{active}</div>
              <div style={{ width:32, height:2, background:detail.color, marginBottom:16, opacity:0.6, borderRadius:2 }} />
              <p style={{ fontSize:12, lineHeight:1.8, color:"var(--text)", opacity:0.8 }}>{detail.desc}</p>

              <div style={{ marginTop:20, padding:"10px 14px", borderRadius:8, background:"rgba(255,255,255,0.02)", border:"1px solid var(--border)" }}>
                <div style={{ fontSize:9, textTransform:"uppercase", letterSpacing:"0.15em", color:"var(--muted)", marginBottom:6 }}>Ownership</div>
                <div style={{ fontSize:11, color:"var(--text)", opacity:0.7 }}>
                  {["ShardManager","Shard1","Shard2","ShardN"].includes(active) && "Owns data. Independent mutex per shard."}
                  {["TTLIndex","TTLManager"].includes(active) && "Owns expiration state. Does not mutate KV store."}
                  {["EvictionManager","MemoryTracker","EvictionPolicy","LRUCache"].includes(active) && "Suggests victims. KVEngine executes deletion."}
                  {active === "KVEngine" && "Orchestrator. Owns no storage — coordinates all subsystems."}
                  {active === "ServerApp" && "Owns network I/O. No access to storage internals."}
                  {active === "Client" && "External. Communicates via wire protocol only."}
                </div>
              </div>
            </>
          ) : (
            <div style={{ color:"var(--muted)", fontSize:12, textAlign:"center", paddingTop:40 }}>
              Click a component to inspect
            </div>
          )}
        </div>

      </div>
    </section>
  );
};

const LayerBox = ({ label, color, children }) => (
  <div style={{
    border:`1px solid rgba(${hexToRgb(color)},0.18)`,
    borderRadius:12, padding:14, width:"100%",
    background:`rgba(${hexToRgb(color)},0.03)`,
    position:"relative",
  }}>
    <div style={{
      position:"absolute", top:-10, left:12,
      fontSize:9, letterSpacing:"0.18em", textTransform:"uppercase",
      padding:"2px 9px", borderRadius:4,
      background:`rgba(${hexToRgb(color)},0.14)`, color,
      fontWeight:700,
    }}>{label}</div>
    <div style={{ marginTop:6 }}>{children}</div>
  </div>
);

const Arrow = ({ color = "#fff", label }) => (
  <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:0 }}>
    {label && <div style={{ fontSize:9, color:"var(--muted2)", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:2 }}>{label}</div>}
    <svg width="2" height="28" style={{ overflow:"visible" }}>
      <line x1="1" y1="0" x2="1" y2="20" stroke={color} strokeWidth="1.5" strokeOpacity="0.5" strokeDasharray="4 3" style={{ animation:"flow-r 1s linear infinite" }} />
      <path d="M -4 16 L 1 24 L 6 16" fill="none" stroke={color} strokeWidth="1.5" strokeOpacity="0.6" />
    </svg>
  </div>
);

/* ─────────────────────────────────────────────
   HOW IT WORKS — Animated flows
───────────────────────────────────────────── */
const HOW_FLOWS = [
  {
    id:"set", label:"SET Operation", color:"#00e5ff",
    steps:[
      { node:"Client",          msg:"SET user:1 \"Gagan\" 60",       color:"#00e5ff" },
      { node:"Server",          msg:"Parse request, dispatch thread", color:"#818cf8" },
      { node:"KVEngine",        msg:"Route to shard via hash",        color:"#f59e0b" },
      { node:"ShardManager",    msg:"Acquire shard mutex, write",     color:"#10b981" },
      { node:"TTLIndex",        msg:"Register expiry @ now+60s",      color:"#f43f5e" },
      { node:"MemoryTracker",   msg:"Track +sizeof(value)",           color:"#a855f7" },
      { node:"Client",          msg:"← OK",                           color:"#00e5ff" },
    ]
  },
  {
    id:"get", label:"GET Operation", color:"#10b981",
    steps:[
      { node:"Client",       msg:"GET user:1",                    color:"#00e5ff" },
      { node:"KVEngine",     msg:"Check TTLIndex — is expired?",  color:"#f59e0b" },
      { node:"TTLIndex",     msg:"Key is live",                   color:"#f43f5e" },
      { node:"ShardManager", msg:"Route to shard, acquire mutex", color:"#10b981" },
      { node:"Shard",        msg:"Read value from hashmap",       color:"#10b981" },
      { node:"Client",       msg:'← "Gagan"',                    color:"#00e5ff" },
    ]
  },
  {
    id:"ttl", label:"TTL Expiry", color:"#f43f5e",
    steps:[
      { node:"TTLManager",  msg:"Tick fires (background thread)",        color:"#f43f5e" },
      { node:"KVEngine",    msg:"ProcessExpired(now)",                   color:"#f59e0b" },
      { node:"TTLIndex",    msg:"Scan: collect keys where ts <= now",    color:"#f43f5e" },
      { node:"Shard",       msg:"Delete each expired key",               color:"#10b981" },
      { node:"EvictionMgr", msg:"Notify eviction layer",                 color:"#a855f7" },
      { node:"MemTracker",  msg:"Decrement usage per expired key",       color:"#a855f7" },
    ]
  },
  {
    id:"evict", label:"Eviction Flow", color:"#a855f7",
    steps:[
      { node:"MemoryTracker",  msg:"Usage exceeds limit → breach signal",    color:"#a855f7" },
      { node:"KVEngine",       msg:"RequestEviction(bytes_to_free)",          color:"#f59e0b" },
      { node:"EvictionManager",msg:"EvictionPolicy.SelectVictims()",          color:"#a855f7" },
      { node:"LRUCache",       msg:"Return LRU victims list",                 color:"#6366f1" },
      { node:"KVEngine",       msg:"Delete victims from Shard",               color:"#f59e0b" },
      { node:"MemoryTracker",  msg:"Decrement usage per victim",              color:"#a855f7" },
    ]
  },
];

const HowItWorks = () => {
  const [flow, setFlow] = useState("set");
  const [step, setStep] = useState(-1);
  const [running, setRunning] = useState(false);
  const timerRef = useRef(null);

  const current = HOW_FLOWS.find(f => f.id === flow);

  const play = useCallback(() => {
    setStep(-1); setRunning(true);
    let i = 0;
    timerRef.current = setInterval(() => {
      setStep(i);
      i++;
      if (i >= current.steps.length) { clearInterval(timerRef.current); setRunning(false); }
    }, 700);
  }, [current]);

  useEffect(() => { return () => clearInterval(timerRef.current); }, []);
  useEffect(() => { setStep(-1); setRunning(false); clearInterval(timerRef.current); }, [flow]);

  return (
    <section id="how-it-works" style={{ padding:"100px 32px", position:"relative", zIndex:1 }}>
      <SectionHeader tag="Section 3" title="How It Works" sub="Animated step-by-step flows for each operation" />

      <div style={{ maxWidth:900, margin:"0 auto" }}>

        {/* Flow tabs */}
        <div style={{ display:"flex", gap:10, marginBottom:32, flexWrap:"wrap" }}>
          {HOW_FLOWS.map(f => (
            <button key={f.id} onClick={() => setFlow(f.id)} style={{
              padding:"8px 20px", borderRadius:8,
              border:`1.5px solid ${flow===f.id ? f.color : "var(--border2)"}`,
              background: flow===f.id ? `rgba(${hexToRgb(f.color)},0.1)` : "transparent",
              color: flow===f.id ? f.color : "var(--muted2)",
              fontFamily:"var(--font-mono)", fontSize:11, fontWeight:600,
              letterSpacing:"0.1em", textTransform:"uppercase", cursor:"pointer",
              transition:"all 0.2s",
            }}>{f.label}</button>
          ))}
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 280px", gap:24 }}>

          {/* Steps timeline */}
          <div style={{
            border:"1.5px solid var(--border2)", borderRadius:14,
            background:"var(--bg1)", padding:28,
          }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
              <span style={{ fontFamily:"var(--font-display)", fontSize:13, fontWeight:700, color:current.color }}>
                {current.label}
              </span>
              <button onClick={play} disabled={running} style={{
                padding:"7px 20px", borderRadius:7,
                background: running ? "rgba(255,255,255,0.04)" : `rgba(${hexToRgb(current.color)},0.15)`,
                border:`1px solid ${running ? "var(--border)" : current.color}`,
                color: running ? "var(--muted)" : current.color,
                fontFamily:"var(--font-mono)", fontSize:10, letterSpacing:"0.1em",
                textTransform:"uppercase", cursor: running ? "default" : "pointer",
                transition:"all 0.2s",
              }}>
                {running ? "Running…" : "▶ Play"}
              </button>
            </div>

            {current.steps.map((s, i) => (
              <div key={i} style={{
                display:"flex", gap:16, alignItems:"flex-start",
                marginBottom:16, opacity: step >= i ? 1 : 0.25,
                transition:"opacity 0.35s",
                animation: step === i ? "slideIn 0.25s ease" : "none",
              }}>
                <div style={{
                  width:28, height:28, borderRadius:"50%", flexShrink:0,
                  border:`1.5px solid ${step >= i ? s.color : "var(--border)"}`,
                  background: step >= i ? `rgba(${hexToRgb(s.color)},0.12)` : "transparent",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:10, fontWeight:700, color: step >= i ? s.color : "var(--muted)",
                  transition:"all 0.3s",
                }}>{i+1}</div>
                <div style={{ paddingTop:4 }}>
                  <div style={{ fontSize:10, color: s.color, letterSpacing:"0.1em", textTransform:"uppercase", fontWeight:600, marginBottom:2 }}>{s.node}</div>
                  <div style={{ fontSize:12, color:"var(--text)", opacity:0.75 }}>{s.msg}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Active step highlight */}
          <div style={{
            border:"1.5px solid var(--border2)", borderRadius:14,
            background:"var(--bg1)", padding:24,
            display:"flex", flexDirection:"column", gap:16,
          }}>
            <div style={{ fontSize:9, textTransform:"uppercase", letterSpacing:"0.18em", color:"var(--muted)" }}>Current Step</div>
            {step >= 0 && step < current.steps.length ? (
              <div style={{ animation:"fadeUp 0.2s ease" }}>
                <div style={{
                  width:48, height:48, borderRadius:12,
                  background:`rgba(${hexToRgb(current.steps[step].color)},0.12)`,
                  border:`1.5px solid ${current.steps[step].color}`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontFamily:"var(--font-display)", fontSize:18, fontWeight:900,
                  color:current.steps[step].color, marginBottom:14,
                }}>{step+1}</div>
                <div style={{ fontFamily:"var(--font-display)", fontSize:11, fontWeight:700, color:current.steps[step].color, letterSpacing:"0.07em", marginBottom:8 }}>
                  {current.steps[step].node}
                </div>
                <p style={{ fontSize:12, color:"var(--text)", opacity:0.8, lineHeight:1.7 }}>
                  {current.steps[step].msg}
                </p>

                {/* Progress */}
                <div style={{ marginTop:20 }}>
                  <div style={{ fontSize:9, color:"var(--muted)", letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:6 }}>
                    Step {step+1} / {current.steps.length}
                  </div>
                  <div style={{ height:3, borderRadius:2, background:"var(--border)", overflow:"hidden" }}>
                    <div style={{
                      height:"100%", borderRadius:2,
                      background:current.steps[step].color,
                      width:`${((step+1)/current.steps.length)*100}%`,
                      transition:"width 0.4s ease",
                    }} />
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ color:"var(--muted)", fontSize:11, textAlign:"center", paddingTop:24 }}>
                Press Play to animate
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

/* ─────────────────────────────────────────────
   BENCHMARKS
───────────────────────────────────────────── */
const BENCHMARKS = [
  { op:"SET (single shard)", ops:"~2.1M ops/s", bar:92, color:"#00e5ff" },
  { op:"GET (single shard)", ops:"~3.4M ops/s", bar:100, color:"#10b981" },
  { op:"DEL (single shard)", ops:"~2.8M ops/s", bar:82, color:"#a855f7" },
  { op:"SET (8 shards)",     ops:"~12M ops/s",  bar:78, color:"#f59e0b" },
  { op:"GET (8 shards)",     ops:"~19M ops/s",  bar:95, color:"#10b981" },
  { op:"TTL eviction tick",  ops:"<1ms latency", bar:60, color:"#f43f5e" },
];

const Benchmarks = () => {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold:0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section id="benchmarks" ref={ref} style={{ padding:"100px 32px", position:"relative", zIndex:1 }}>
      <SectionHeader tag="Section 4" title="Benchmarks" sub="Indicative performance targets — local machine, C++20 -O2" />

      <div style={{ maxWidth:760, margin:"0 auto", display:"flex", flexDirection:"column", gap:20 }}>
        {BENCHMARKS.map((b, i) => (
          <div key={i} style={{
            border:"1px solid var(--border2)", borderRadius:12, padding:"18px 24px",
            background:"var(--bg1)",
            animation: visible ? `fadeUp 0.4s ${i*0.08}s ease both` : "none",
          }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
              <span style={{ fontSize:12, color:"var(--text)", fontFamily:"var(--font-mono)" }}>{b.op}</span>
              <span style={{ fontFamily:"var(--font-display)", fontSize:13, fontWeight:700, color:b.color }}>{b.ops}</span>
            </div>
            <div style={{ height:4, borderRadius:2, background:"var(--border)", overflow:"hidden" }}>
              <div style={{
                height:"100%", borderRadius:2, background:b.color,
                width: visible ? `${b.bar}%` : "0%",
                transition: `width 1s ${i*0.1}s cubic-bezier(0.22,1,0.36,1)`,
                boxShadow: `0 0 12px rgba(${hexToRgb(b.color)},0.5)`,
              }} />
            </div>
          </div>
        ))}

        <div style={{
          fontSize:10, color:"var(--muted)", letterSpacing:"0.08em",
          textAlign:"center", marginTop:8, lineHeight:1.7,
        }}>
          Benchmarks are indicative targets. Actual performance depends on hardware, shard count, and value sizes.
          Redis comparison baseline: ~1M ops/s single-threaded.
        </div>
      </div>
    </section>
  );
};

/* ─────────────────────────────────────────────
   ROADMAP
───────────────────────────────────────────── */
const ROADMAP = [
  { phase:"Phase 1", title:"Core Engine", status:"done",    color:"#00e5ff", items:["Shard-based storage","TTL Index + TTLManager","LRU Eviction","MemoryTracker","KVEngine orchestration"] },
  { phase:"Phase 2", title:"Observability", status:"active", color:"#f59e0b", items:["MetricsRegistry","Latency histograms (p50/p95/p99)","Memory usage metrics","Shard load distribution","Eviction rate tracking"] },
  { phase:"Phase 3", title:"Persistence",  status:"planned",color:"#10b981", items:["Write-Ahead Log (WAL)","Snapshot / RDB format","Crash recovery","Point-in-time backup"] },
  { phase:"Phase 4", title:"Replication",  status:"planned",color:"#a855f7", items:["Primary/replica model","Async replication","Replica promotion","Split-brain handling"] },
  { phase:"Phase 5", title:"Distribution", status:"planned",color:"#f43f5e", items:["Consistent hashing ring","Cluster mode","Partition rebalancing","Cross-node TTL sync"] },
];

const STATUS_STYLE = {
  done:    { label:"Complete",  bg:"rgba(0,229,255,0.1)",   color:"#00e5ff",  border:"rgba(0,229,255,0.25)" },
  active:  { label:"In Progress", bg:"rgba(245,158,11,0.1)", color:"#f59e0b", border:"rgba(245,158,11,0.3)" },
  planned: { label:"Planned",   bg:"rgba(255,255,255,0.04)", color:"#4a5a7a", border:"rgba(255,255,255,0.1)" },
};

const Roadmap = () => (
  <section id="roadmap" style={{ padding:"100px 32px 140px", position:"relative", zIndex:1 }}>
    <SectionHeader tag="Section 5" title="Roadmap" sub="Planned evolution — from engine to distributed cluster" />

    <div style={{ maxWidth:1000, margin:"0 auto", position:"relative" }}>
      {/* Timeline line */}
      <div style={{
        position:"absolute", left:24, top:0, bottom:0, width:2,
        background:"linear-gradient(to bottom, var(--cyan), transparent)",
        opacity:0.2,
      }} />

      {ROADMAP.map((phase, i) => {
        const st = STATUS_STYLE[phase.status];
        return (
          <div key={i} style={{
            display:"grid", gridTemplateColumns:"52px 1fr", gap:24,
            marginBottom:36,
            animation:`fadeUp 0.4s ${i*0.1}s ease both`,
          }}>
            {/* Phase dot */}
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
              <div style={{
                width:20, height:20, borderRadius:"50%",
                border:`2px solid ${phase.color}`,
                background:`rgba(${hexToRgb(phase.color)},0.15)`,
                flexShrink:0, marginTop:18,
                boxShadow: phase.status !== "planned" ? `0 0 16px rgba(${hexToRgb(phase.color)},0.4)` : "none",
              }} />
            </div>

            {/* Phase card */}
            <div style={{
              border:`1.5px solid ${phase.status !== "planned" ? `rgba(${hexToRgb(phase.color)},0.3)` : "var(--border)"}`,
              borderRadius:12, padding:"20px 24px",
              background:`rgba(${hexToRgb(phase.color)},${phase.status==="planned"?0.02:0.04})`,
              transition:"all 0.2s",
            }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=`rgba(${hexToRgb(phase.color)},0.5)`;}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=phase.status!=="planned"?`rgba(${hexToRgb(phase.color)},0.3)`:"var(--border)";}}
            >
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
                <div>
                  <div style={{ fontSize:9, color:"var(--muted2)", letterSpacing:"0.18em", textTransform:"uppercase", marginBottom:4 }}>{phase.phase}</div>
                  <div style={{ fontFamily:"var(--font-display)", fontSize:15, fontWeight:700, color:phase.color, letterSpacing:"0.04em" }}>{phase.title}</div>
                </div>
                <div style={{
                  padding:"3px 12px", borderRadius:999, fontSize:9, fontWeight:600,
                  letterSpacing:"0.1em", textTransform:"uppercase",
                  background:st.bg, color:st.color, border:`1px solid ${st.border}`,
                  flexShrink:0,
                }}>{st.label}</div>
              </div>

              <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                {phase.items.map(item => (
                  <div key={item} style={{
                    padding:"4px 10px", borderRadius:6,
                    background:"rgba(255,255,255,0.03)",
                    border:"1px solid var(--border)",
                    fontSize:10, color:"var(--muted2)", letterSpacing:"0.04em",
                  }}>
                    {phase.status === "done" && <span style={{ color:phase.color, marginRight:4 }}>✓</span>}
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  </section>
);

/* ─────────────────────────────────────────────
   FOOTER
───────────────────────────────────────────── */
const Footer = () => (
  <footer style={{
    borderTop:"1px solid var(--border)", padding:"32px",
    display:"flex", justifyContent:"space-between", alignItems:"center",
    flexWrap:"wrap", gap:16, position:"relative", zIndex:1,
    fontFamily:"var(--font-mono)", fontSize:11, color:"var(--muted2)",
  }}>
    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
      <div style={{
        width:24, height:24, borderRadius:6,
        background:"linear-gradient(135deg, var(--cyan), var(--purple))",
        display:"flex", alignItems:"center", justifyContent:"center",
        fontSize:10, fontWeight:700, color:"#000", fontFamily:"var(--font-display)",
      }}>KV</div>
      <span style={{ fontFamily:"var(--font-display)", fontSize:12, fontWeight:700, color:"var(--cyan)", letterSpacing:"0.1em" }}>KVMemo</span>
      <span>— A high-performance in-memory KV store in C++20</span>
    </div>
    <div style={{ display:"flex", gap:20 }}>
      <a href="https://github.com/Gagan2004bansal/KVMemo" target="_blank" rel="noreferrer"
        style={{ color:"var(--muted2)", textDecoration:"none" }}
        onMouseEnter={e=>e.target.style.color="var(--cyan)"}
        onMouseLeave={e=>e.target.style.color="var(--muted2)"}
      >GitHub</a>
      <span>MIT License</span>
      <span>Copyright © Gagan Bansal</span>
      <span>All Right Reserved.</span>
    </div>
  </footer>
);

/* ─────────────────────────────────────────────
   SHARED: SECTION HEADER
───────────────────────────────────────────── */
const SectionHeader = ({ tag, title, sub }) => (
  <div style={{ textAlign:"center", marginBottom:56 }}>
    <div style={{ fontSize:10, letterSpacing:"0.22em", textTransform:"uppercase", color:"var(--cyan)", opacity:0.6, marginBottom:10 }}>{tag}</div>
    <h2 style={{ fontFamily:"var(--font-display)", fontSize:"clamp(24px,4vw,40px)", fontWeight:800, letterSpacing:"-0.01em", color:"var(--text)" }}>{title}</h2>
    {sub && <p style={{ marginTop:10, fontSize:12, color:"var(--muted2)", letterSpacing:"0.06em" }}>{sub}</p>}
  </div>
);

/* ─────────────────────────────────────────────
   ROOT APP
───────────────────────────────────────────── */
export default function App() {
  return (
    <>
      <GlobalStyle />
      <ScanlineBg />
      <Nav />
      <Hero />
      <Playground />
      <Architecture />
      <HowItWorks />
      <Benchmarks />
      <Roadmap />
      <Footer />
    </>
  );
}
