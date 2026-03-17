import { useState } from 'react'
import { C, F } from '../../constants/theme'
import { DocHeader, H2, P, CodeBlock, Callout } from '../../components/ui'

/* ══════════════════════════════════════════
   CONTRIBUTING
══════════════════════════════════════════ */
export function Contributing() {
  return (
    <div style={{ fontFamily: F.body, padding: '48px 0' }}>
      <DocHeader breadcrumb="// docs / contributing" title="Contributing" sub="Issues, PRs, and feature ideas are all welcome." />
      <H2>Dev Setup</H2>
      <CodeBlock label="clone + debug build" code={"git clone https://github.com/Gagan2004bansal/KVMemo.git\ncd KVMemo && mkdir build && cd build\ncmake .. \ncmake --build ."} />
      <H2>Run Tests</H2>
      <CodeBlock label="bash" code={"cd build\nctest --output-on-failure"} />
      <Callout type="tip">Tests must pass before opening a PR. New commands need at least one unit test and one integration test.</Callout>
      <H2>Add a New Command</H2>
      <P>Extend CommandHandler — no changes to Dispatcher or Engine needed.</P>
      <CodeBlock label="src/protocol/commands/IncrCommand.h" code={"#pragma once\n#include \"CommandHandler.h\"\n\nclass IncrCommand : public CommandHandler {\npublic:\n  Result execute(const Request& req, KVEngine& engine) override {\n    auto val = engine.get(req.key);\n    int n = val ? std::stoi(*val) + 1 : 1;\n    engine.set(req.key, std::to_string(n));\n    return Result::ok(std::to_string(n));\n  }\n};"} />
      <CodeBlock label="Register at startup" code={'registry.register_command("INCR", std::make_unique<IncrCommand>());'} />
      <H2>PR Checklist</H2>
      {['Tests pass (ctest)', 'New feature has unit + integration tests', 'No raw pointers — use smart pointers', 'Each class does one thing (SRP)', 'PR description explains the why'].map((item, i) => (
        <div key={i} style={{ display: 'flex', gap: 10, padding: '9px 14px', marginBottom: 7, borderRadius: 8, border: `1px solid ${C.b0}`, background: C.bg1, fontSize: 13, color: C.t1 }}>
          <span style={{ color: C.green }}>☐</span>{item}
        </div>
      ))}
    </div>
  )
}

/* ══════════════════════════════════════════
   FAQ
══════════════════════════════════════════ */
const FAQS = [
  { q: 'How is KVMemo different from Redis?', a: 'Redis is production-grade with 20+ years of hardening. KVMemo is a learning project built from scratch in C++20 — same concepts (sharding, TTL, LRU, WS protocol), transparent source so you can see exactly how each piece works.' },
  { q: 'Is it production-ready?', a: "Not yet. No persistence, replication, or authentication. Phase 3 adds a Write-Ahead Log + RDB snapshots. Phase 4 adds replication. Check the Roadmap." },
  { q: 'Which platforms are supported?', a: 'Linux, macOS, and Windows (via WSL2). CMake 3.20+ with GCC 12+ or Clang 15+.' },
  { q: 'Why 64 shards by default?', a: 'Balance between contention reduction and memory overhead. Change it: --shards 128 at startup. More shards = less mutex contention, slightly more memory.' },
  { q: 'How does TTL work internally?', a: 'On SET with EX N, the key is registered in TTLIndex (time-sorted std::map). TTLManager — a background std::thread — wakes every 100ms, calls collect_expired(), then KVEngine::del() per expired key. Zero impact on request latency.' },
  { q: 'Can I swap the eviction policy?', a: 'Yes. EvictionManager implements EvictionPolicy (pure interface). Extend it, override select_victim(), inject at startup. Default is LRU via doubly-linked list + hashmap.' },
  { q: 'What is the WebSocket protocol?', a: 'Plain JSON over WS. Request: { id, command, key, value, ttl }. Response: { id, result } or { id, error }. The id field correlates async responses to requests.' },
  { q: 'How do I add a new command?', a: 'Extend CommandHandler, implement execute(), then register_command("CMD", ...) at startup. No Dispatcher or Engine changes. See Contributing docs.' },
]

function Accordion({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderRadius: 10, border: `1px solid ${open ? C.b1 : C.b0}`, background: C.bg1, overflow: 'hidden', transition: 'border-color .2s' }}>
      <button onClick={() => setOpen(p => !p)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', gap: 16, outline: 'none' }}>
        <span style={{ fontSize: 13.5, fontWeight: 600, color: C.t1, lineHeight: 1.5 }}>{q}</span>
        <span style={{ fontSize: 18, color: open ? C.blue : C.t3, flexShrink: 0, transition: 'transform .2s,color .2s', transform: open ? 'rotate(45deg)' : 'none', lineHeight: 1 }}>+</span>
      </button>
      {open && <div style={{ padding: '0 18px 16px', paddingTop: 14, borderTop: `1px solid ${C.b0}`, fontSize: 13, color: C.t2, lineHeight: 1.8, animation: 'fadeIn .2s ease' }}>{a}</div>}
    </div>
  )
}

export function FAQ() {
  return (
    <div style={{ fontFamily: F.body, padding: '48px 0' }}>
      <DocHeader breadcrumb="// docs / faq" title="FAQ" sub="Frequently asked questions about KVMemo's design, capabilities, and roadmap." />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {FAQS.map(({ q, a }, i) => <Accordion key={i} q={q} a={a} />)}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════
   CHANGELOG
══════════════════════════════════════════ */
const LOG = [
  { v: '0.1.0-dev', date: 'Apr 2026', status: 'current', color: C.green, changes: ['Initial release — complete in-memory engine', '64-shard architecture with per-shard mutexes', 'TTLManager background thread (100ms tick)', 'LRU eviction + MemoryTracker hard limit', 'Commands: SET GET DEL KEYS FLUSH PING TTL EXISTS', 'TcpServer + JSON-over-WebSocket protocol', 'CMake build — Linux, macOS, Windows (WSL2)', 'Interactive web documentation'] },
  { v: '0.2.0', date: 'June 2026', status: 'next', color: C.blue, changes: ['MetricsRegistry with p50/p95/p99 histograms', 'Live /metrics WebSocket endpoint', 'Per-shard load heatmap', 'Hit/miss ratio per command'] },
  { v: '0.3.0', date: 'TBD', status: 'planned', color: C.amber, changes: ['Write-Ahead Log (WAL)', 'RDB snapshot format', 'Crash recovery — WAL replay on startup'] },
  { v: '0.4.0', date: 'TBD', status: 'planned', color: C.violet, changes: ['Primary / replica protocol', 'Async replication stream', 'Replica promotion on primary failure'] },
]

export function Changelog() {
  return (
    <div style={{ fontFamily: F.body, padding: '48px 0' }}>
      <DocHeader breadcrumb="// docs / changelog" title="Changelog" sub="Version history and planned releases." />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {LOG.map(({ v, date, status, color, changes }) => (
          <div key={v} style={{ border: `1px solid ${color}28`, borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '14px 22px', background: `${color}08`, borderBottom: `1px solid ${color}18`, display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 15, fontWeight: 800, color, fontFamily: F.mono }}>v{v}</span>
              <span style={{ fontSize: 11, color: C.t3 }}>{date}</span>
              <span style={{ fontSize: 9, padding: '2px 8px', borderRadius: 99, background: `${color}15`, color, border: `1px solid ${color}28`, marginLeft: 'auto' }}>{status}</span>
            </div>
            <div style={{ padding: '14px 22px' }}>
              {changes.map((c, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 7, fontSize: 13, color: C.t1 }}>
                  <span style={{ color, flexShrink: 0, fontSize: 11, marginTop: 1 }}>→</span>{c}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
