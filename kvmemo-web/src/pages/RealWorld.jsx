import { useState, useEffect, useRef, useCallback } from 'react'

/* ═══════════════════════════════════════════
   DESIGN TOKENS
═══════════════════════════════════════════ */
const C = {
  bg: '#020817', bg1: '#070f1e', bg2: '#0b1525', bg3: '#0f1f36',
  b0: '#1e3352', b1: '#254070', b2: '#2e5090',
  tw: '#f0f6fc', t1: '#c9d8f0', t2: '#7a9abf', t3: '#3d5a80', t4: '#1e3352',
  blue: '#3b82f6', blue2: '#60a5fa', blue3: '#93c5fd',
  cyan: '#06b6d4', cyan2: '#22d3ee',
  violet: '#8b5cf6', violet2: '#a78bfa',
  green: '#10b981', green2: '#34d399',
  amber: '#f59e0b', amber2: '#fcd34d',
  rose: '#f43f5e', rose2: '#fb7185',
  orange: '#f97316', orange2: '#fdba74',
}

/* ═══════════════════════════════════════════
   GLOBAL STYLES
═══════════════════════════════════════════ */
function Styles() {
  useEffect(() => {
    if (document.getElementById('rw-css')) return
    const s = document.createElement('style')
    s.id = 'rw-css'
    s.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800;9..40,900&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

      @keyframes rw-fadeUp   { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
      @keyframes rw-fadeIn   { from{opacity:0} to{opacity:1} }
      @keyframes rw-pulse    { 0%,100%{opacity:1} 50%{opacity:.35} }
      @keyframes rw-shimmer  { 0%{background-position:200% center} 100%{background-position:-200% center} }
      @keyframes rw-float    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
      @keyframes rw-ping     { 0%{transform:scale(1);opacity:.8} 80%,100%{transform:scale(2.2);opacity:0} }
      @keyframes rw-dash     { to{stroke-dashoffset:0} }
      @keyframes rw-nodePop  { 0%{transform:scale(1)} 30%{transform:scale(1.12)} 100%{transform:scale(1)} }
      @keyframes rw-dataFlow {
        0%   { opacity:0; transform:translateX(0) scale(.7); }
        15%  { opacity:1; transform:translateX(0) scale(1); }
        80%  { opacity:1; }
        100% { opacity:0; transform:translateX(var(--travel)) scale(.7); }
      }
      @keyframes rw-cacheHit {
        0%   { opacity:0; transform:scale(.5) rotate(-8deg); }
        40%  { opacity:1; transform:scale(1.1) rotate(2deg); }
        70%  { transform:scale(.97) rotate(0deg); }
        100% { opacity:1; transform:scale(1) rotate(0deg); }
      }
      @keyframes rw-scanLine {
        0%   { top:-2px; opacity:.9; }
        100% { top:100%; opacity:0; }
      }
      @keyframes rw-typewriter {
        from { width:0 }
        to   { width:100% }
      }
      @keyframes rw-blink { 0%,100%{opacity:1} 50%{opacity:0} }
      @keyframes rw-glow  {
        0%,100% { box-shadow: 0 0 0px rgba(59,130,246,0); }
        50%     { box-shadow: 0 0 20px rgba(59,130,246,.35), 0 0 40px rgba(59,130,246,.12); }
      }
      @keyframes rw-slideRight {
        from { transform:translateX(-8px); opacity:0; }
        to   { transform:none; opacity:1; }
      }
      @keyframes rw-tickerScroll {
        from { transform:translateX(0) }
        to   { transform:translateX(-50%) }
      }

      .rw-node {
        transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease;
      }
      .rw-node.active {
        animation: rw-nodePop .4s ease, rw-glow 1.5s ease infinite;
      }
      .rw-node:hover { transform: translateY(-2px) scale(1.02); cursor:default; }

      .rw-tab { transition: all .18s ease; }
      .rw-tab:hover { transform: translateY(-1px); }

      .rw-card-enter { animation: rw-fadeUp .45s ease both; }

      .rw-shimmer {
        background: linear-gradient(90deg,#c9d8f0 0%,#f0f6fc 28%,#60a5fa 45%,#a78bfa 55%,#f0f6fc 72%,#c9d8f0 100%);
        background-size:200% auto;
        -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
        animation: rw-shimmer 5s linear infinite;
      }

      ::-webkit-scrollbar{width:4px;height:4px}
      ::-webkit-scrollbar-track{background:transparent}
      ::-webkit-scrollbar-thumb{background:#1e3352;border-radius:2px}
    `
    document.head.appendChild(s)
    return () => document.getElementById('rw-css')?.remove()
  }, [])
  return null
}

/* ═══════════════════════════════════════════
   DATA — USE CASES
═══════════════════════════════════════════ */
const USE_CASES = [
  {
    id: 'session',
    label: 'Session Store',
    company: 'Used by: Twitter, GitHub, Shopify',
    color: C.blue,
    tagline: 'Keep users logged in across millions of requests',
    problem: 'After a user logs in, the server needs to remember who they are for every subsequent request. Storing session data in a relational database (Postgres, MySQL) means a SQL query on every single request — even for a simple "is this user authenticated?" check.',
    insight: 'Session data is read thousands of times but rarely written. It has a natural TTL (logout or expiry). It\'s a perfect key-value fit: sessionID → {userId, role, cart, preferences}.',
    withoutCache: [
      '100,000 active users × 10 requests/min = 1,000,000 DB queries/min just for auth checks',
      'Database CPU spikes on every page load, not just on actual business logic',
      'Single DB becomes a bottleneck — scaling requires expensive vertical upgrades',
    ],
    withCache: [
      'Session lookup: ~0.2ms from KVMemo vs ~8ms from Postgres (40× faster)',
      'DB query count drops by 80-90% — database only handles writes and complex queries',
      'Horizontal scaling: add more app servers freely, they all share the same cache',
    ],
    kvmemoFit: 'SET session:abc123 \'{"userId":42,"role":"admin"}\' EX 3600 — one line. TTL handles expiry automatically. Shard consistent-hashing distributes 1M sessions across 16 shards.',
    flow: ['user', 'browser', 'cache', 'app', 'db'],
    cacheHit: true,
    metrics: { latency: '0.2ms', reduction: '~85%', pattern: 'Cache Aside' },
  },
  {
    id: 'ratelimit',
    label: 'Rate Limiting',
    company: 'Used by: Stripe, GitHub API, Cloudflare',
    color: C.rose,
    tagline: 'Block abusive traffic before it reaches your servers',
    problem: 'APIs need to enforce request limits per user (e.g. 1000 req/hour). Checking and incrementing a counter in a relational database on every API request is too slow and creates write contention — thousands of rows being updated simultaneously.',
    insight: 'Rate limiting is purely a counter problem. Each API key maps to a count with a TTL window. Atomic increment operations on a fast store are exactly what\'s needed — no complex queries, no joins.',
    withoutCache: [
      'Database row-lock contention when thousands of clients hit the API simultaneously',
      'Race conditions: two requests read count=999, both increment to 1000, limit not enforced',
      'Latency added to every API call just to run UPDATE counters SET count = count + 1',
    ],
    withCache: [
      'Atomic INCR + TTL: SET ratelimit:apikey123 0 EX 3600, then atomic increment each request',
      'No race conditions — in-memory atomic operations are inherently thread-safe',
      'Sub-millisecond enforcement: rate limit check adds <0.3ms to request latency',
    ],
    kvmemoFit: 'KVMemo\'s atomic operations + TTL are purpose-built for this. Each API key gets a counter key that auto-resets after the window. MemoryTracker ensures the store never exhausts RAM.',
    flow: ['user', 'browser', 'cache', 'app', 'db'],
    cacheHit: true,
    metrics: { latency: '<0.3ms', reduction: '~90%', pattern: 'Write-Through' },
  },
  {
    id: 'leaderboard',
    label: 'Live Leaderboard',
    company: 'Used by: Steam, Chess.com, Duolingo',
    color: C.amber,
    tagline: 'Real-time rankings for millions of players without melting your database',
    problem: 'A game leaderboard needs to show the top 100 players with their scores, updated in real time. Running SELECT * FROM scores ORDER BY score DESC LIMIT 100 on a 50-million-row table on every page view would take seconds and consume enormous DB resources.',
    insight: 'Leaderboard data is read extremely frequently but written less often (when a player scores). The top-N result can be cached with a short TTL. Score updates invalidate or update the cache.',
    withoutCache: [
      'Full table scan or index scan of 50M rows on every leaderboard request',
      'With 10,000 concurrent players viewing the leaderboard: 10,000 expensive DB queries/sec',
      'Database I/O saturated — all other game logic (item purchases, matchmaking) slows down',
    ],
    withCache: [
      'First request: query DB, cache result as leaderboard:top100 with TTL of 5 seconds',
      'Next 9,999 requests in that 5-second window: served from cache in 0.2ms',
      'Score update: cache key invalidated → next request refreshes from DB (Cache Aside pattern)',
    ],
    kvmemoFit: 'GET leaderboard:top100 — if found, return. If not (cache miss), query DB, SET leaderboard:top100 \'{...}\' EX 5. With KVMemo\'s sharding, thousands of concurrent leaderboard reads are served in parallel.',
    flow: ['user', 'browser', 'app', 'cache', 'db'],
    cacheHit: false,
    metrics: { latency: '0.2ms', reduction: '~99%', pattern: 'Cache Aside' },
  },
  {
    id: 'feed',
    label: 'Social Feed Cache',
    company: 'Used by: Instagram, LinkedIn, Reddit',
    color: C.violet,
    tagline: 'Serve personalized feeds to 500M users without querying joins every time',
    problem: 'A social feed requires complex multi-table queries: posts + likes + comments + follow relationships + ranking algorithm. This runs on a user\'s every feed refresh. At Instagram\'s scale, this query alone would require thousands of DB servers.',
    insight: 'Feed generation is expensive. Feed reading is cheap if the result is cached. Write-back caching: when you post, push to your followers\' feed caches. When they open the app, their pre-computed feed is served instantly.',
    withoutCache: [
      'Each feed refresh triggers 5-10 JOIN queries across posts, users, relationships tables',
      'Ranking algorithm (recency × engagement × relationship strength) recalculated on every open',
      'At 500M daily active users × 20 feed opens/day = 10 billion complex queries/day',
    ],
    withCache: [
      'Pre-computed feed stored as feed:user:42 with TTL of 60 seconds',
      'New post from someone you follow: async worker updates your cached feed (Write-Back)',
      'App open: GET feed:user:42 returns in <1ms — no joins, no ranking recalculation',
    ],
    kvmemoFit: 'Large string values (serialized JSON feed) + TTL expiry + fast GET is exactly KVMemo\'s strength. In production, this would use a larger cache (Redis) but the same key-value primitives.',
    flow: ['user', 'browser', 'cache', 'app', 'db'],
    cacheHit: true,
    metrics: { latency: '<1ms', reduction: '~95%', pattern: 'Write-Back' },
  },
  {
    id: 'pubsub',
    label: 'Real-time Pub/Sub',
    company: 'Used by: Slack, Notion, Figma',
    color: C.green,
    tagline: 'Broadcast live updates to thousands of connected clients instantly',
    problem: 'Collaborative apps (like Figma or Notion) need to broadcast changes to every connected user in real time. Polling the database every second for changes is wasteful. Long-polling creates server load. The challenge: how does the server push updates efficiently?',
    insight: 'An in-memory store acts as the message broker. Writers publish to a channel. Readers subscribe. The store holds recent messages in memory and delivers them with microsecond latency — no disk I/O, no network round trips to a separate broker.',
    withoutCache: [
      'Polling approach: 1000 users × 1 DB query/sec = 1000 unnecessary queries/sec when nothing changed',
      'Stateful server required: each WebSocket connection tied to a specific server (no horizontal scaling)',
      'Adding a second app server means WebSocket clients on server-1 miss messages published to server-2',
    ],
    withCache: [
      'In-memory pub/sub: publisher writes to doc:42:changes, all subscribers notified in <1ms',
      'Stateless servers: any app server can publish/subscribe — horizontal scaling works naturally',
      'Recent messages cached for late joiners: GET doc:42:recent returns last N changes',
    ],
    kvmemoFit: 'KVMemo\'s current architecture stores values — pub/sub would be the next feature. The in-memory model (no disk flush per message) is what makes this viable at scale. This is listed in the Roadmap.',
    flow: ['user', 'browser', 'app', 'cache', 'app'],
    cacheHit: true,
    metrics: { latency: '<1ms', reduction: 'n/a', pattern: 'Pub/Sub' },
  },
]

/* ═══════════════════════════════════════════
   CACHE PATTERNS
═══════════════════════════════════════════ */
const PATTERNS = [
  {
    id: 'aside',
    name: 'Cache Aside',
    subtitle: 'App manages the cache manually',
    color: C.blue,
    steps: [
      { actor: 'App', action: 'Check cache for key', result: null },
      { actor: 'Cache', action: 'Cache miss — key not found', result: 'MISS' },
      { actor: 'App', action: 'Query database', result: null },
      { actor: 'DB', action: 'Returns data', result: null },
      { actor: 'App', action: 'SET key value EX 300 (write to cache)', result: null },
      { actor: 'App', action: 'Return data to user', result: 'HIT (next time)' },
    ],
    pros: ['Cache only what\'s actually requested', 'App works even if cache is down', 'No stale data from unread writes'],
    cons: ['Cache miss always hits DB (cold start)', 'Cache and DB can drift if TTL is long', 'App code must handle miss logic'],
    usedIn: 'Session stores, leaderboards, product pages',
  },
  {
    id: 'writethrough',
    name: 'Write Through',
    subtitle: 'Every write goes to cache AND database together',
    color: C.cyan,
    steps: [
      { actor: 'App', action: 'User updates profile photo', result: null },
      { actor: 'Cache', action: 'SET user:42 {photo: new_url} (write to cache)', result: null },
      { actor: 'DB', action: 'UPDATE users SET photo=... (write to DB)', result: null },
      { actor: 'Cache', action: 'Acknowledge write complete', result: null },
      { actor: 'App', action: 'Return success to user', result: null },
      { actor: 'App', action: 'GET user:42 — always fresh in cache', result: 'HIT' },
    ],
    pros: ['Cache always consistent with DB', 'No stale reads after writes', 'Read performance still fast'],
    cons: ['Write latency doubles (must wait for both)', 'Unused data wastes cache space', 'Cache failure blocks writes'],
    usedIn: 'User profiles, product inventory, settings',
  },
  {
    id: 'writeback',
    name: 'Write Back',
    subtitle: 'Write to cache first, DB updated asynchronously',
    color: C.amber,
    steps: [
      { actor: 'App', action: 'User\'s score increases', result: null },
      { actor: 'Cache', action: 'SET score:user:42 9850 (instant, <1ms)', result: 'ACK' },
      { actor: 'App', action: 'Return response immediately', result: null },
      { actor: 'Worker', action: 'Background: flush dirty keys to DB', result: null },
      { actor: 'DB', action: 'UPDATE scores SET score=9850 (async)', result: null },
      { actor: 'Cache', action: 'Mark key as clean', result: null },
    ],
    pros: ['Fastest write performance — DB not in critical path', 'Batch writes to DB (efficient)', 'Handles write spikes gracefully'],
    cons: ['Data loss if cache crashes before flush', 'DB temporarily inconsistent with cache', 'Complex dirty-key tracking needed'],
    usedIn: 'Game scores, view counters, analytics events',
  },
  {
    id: 'writearound',
    name: 'Write Around',
    subtitle: 'Writes bypass cache, go straight to database',
    color: C.rose,
    steps: [
      { actor: 'App', action: 'Large file upload / bulk import', result: null },
      { actor: 'DB', action: 'INSERT data directly to database', result: null },
      { actor: 'Cache', action: 'Cache is NOT updated on write', result: 'BYPASS' },
      { actor: 'App', action: 'User requests the uploaded data', result: null },
      { actor: 'Cache', action: 'Cache miss — data was never cached', result: 'MISS' },
      { actor: 'DB', action: 'Fetch and cache for future reads (TTL based)', result: null },
    ],
    pros: ['Cache not polluted by write-once data', 'Write latency = DB write only', 'Good for data that won\'t be read soon'],
    cons: ['First read always misses cache', 'Higher read latency on first access', 'Not suitable for frequently read data'],
    usedIn: 'File uploads, batch imports, audit logs',
  },
]

/* ═══════════════════════════════════════════
   ANIMATED ARCHITECTURE DIAGRAM
═══════════════════════════════════════════ */
const ARCH_NODES = [
  { id: 'user', label: 'User', sublabel: 'Browser', x: 40, color: C.blue2, shape: 'person' },
  { id: 'browser', label: 'Browser', sublabel: 'Local Cache', x: 160, color: C.cyan2, shape: 'box' },
  { id: 'lb', label: 'Load Balancer', sublabel: 'Routes traffic', x: 310, color: C.amber2, shape: 'circle' },
  { id: 'app', label: 'App Tier', sublabel: '3 instances', x: 460, color: C.orange2, shape: 'chip' },
  { id: 'cache', label: 'KVMemo', sublabel: 'In-memory', x: 460, color: C.violet2, shape: 'lightning', yOff: 110 },
  { id: 'db', label: 'Database', sublabel: 'Postgres', x: 620, color: C.blue3, shape: 'db' },
]

const REQUEST_PATHS = {
  cachehit: ['user', 'browser', 'lb', 'app', 'cache'],
  cachemiss: ['user', 'browser', 'lb', 'app', 'cache', 'db', 'app', 'browser', 'user'],
  write: ['user', 'browser', 'lb', 'app', 'db', 'cache'],
}

function NodeShape({ shape, color, size = 48, active }) {
  const s = { width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }
  if (shape === 'person') return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="16" r="8" stroke={color} strokeWidth="2.5" fill={active ? `${color}22` : 'none'} />
      <path d="M8 40c0-8.837 7.163-16 16-16s16 7.163 16 16" stroke={color} strokeWidth="2.5" strokeLinecap="round" fill="none" />
    </svg>
  )
  if (shape === 'box') return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <rect x="6" y="10" width="36" height="26" rx="4" stroke={color} strokeWidth="2.5" fill={active ? `${color}22` : 'none'} />
      <circle cx="13" cy="17" r="2" fill={color} opacity=".7" />
      <circle cx="20" cy="17" r="2" fill={color} opacity=".7" />
      <circle cx="27" cy="17" r="2" fill={color} opacity=".7" />
      <path d="M6 22h36" stroke={color} strokeWidth="1.5" opacity=".4" />
    </svg>
  )
  if (shape === 'circle') return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="16" stroke={color} strokeWidth="2.5" fill={active ? `${color}22` : 'none'} />
      <path d="M24 12v4M24 32v4M12 24h4M32 24h4" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M16 24l4-4 8 4-8 4-4-4z" fill={color} opacity=".6" />
    </svg>
  )
  if (shape === 'chip') return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <rect x="12" y="12" width="24" height="24" rx="3" stroke={color} strokeWidth="2.5" fill={active ? `${color}22` : 'none'} />
      <rect x="18" y="18" width="12" height="12" rx="1.5" stroke={color} strokeWidth="1.5" fill="none" />
      <path d="M18 8v4M24 8v4M30 8v4M18 36v4M24 36v4M30 36v4M8 18h4M8 24h4M8 30h4M36 18h4M36 24h4M36 30h4" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
  if (shape === 'lightning') return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <rect x="6" y="6" width="36" height="36" rx="10" stroke={color} strokeWidth="2.5" fill={active ? `${color}22` : 'none'} />
      <path d="M26 10l-8 14h10l-6 14" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
  if (shape === 'db') return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <ellipse cx="24" cy="16" rx="14" ry="6" stroke={color} strokeWidth="2.5" fill={active ? `${color}22` : 'none'} />
      <path d="M10 16v16c0 3.314 6.268 6 14 6s14-2.686 14-6V16" stroke={color} strokeWidth="2.5" />
      <path d="M10 24c0 3.314 6.268 6 14 6s14-2.686 14-6" stroke={color} strokeWidth="1.8" opacity=".5" />
    </svg>
  )
  return <div style={s}>{shape}</div>
}

function ArchDiagram({ activeNodes, packets }) {
  const canvasH = 260
  const nodeY = 100
  const cacheY = 190

  const getPos = (id) => {
    const n = ARCH_NODES.find(n => n.id === id)
    if (!n) return { x: 0, y: nodeY }
    return { x: n.x + 24, y: n.yOff ? cacheY : nodeY }
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: canvasH, userSelect: 'none' }}>
      {/* SVG for arrows */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: canvasH, overflow: 'visible' }} viewBox={`0 0 700 ${canvasH}`} preserveAspectRatio="xMidYMid meet">
        {/* Main horizontal connections */}
        {[
          ['user', 'browser'], ['browser', 'lb'], ['lb', 'app'],
        ].map(([a, b]) => {
          const from = getPos(a), to = getPos(b)
          return (
            <g key={`${a}-${b}`}>
              <line x1={from.x + 24} y1={from.y} x2={to.x - 24} y2={to.y}
                stroke={C.b1} strokeWidth="1.5" strokeDasharray="4 3" opacity=".5" />
              <polygon points={`${to.x - 24},${to.y} ${to.x - 31},${to.y - 4} ${to.x - 31},${to.y + 4}`}
                fill={C.b1} opacity=".5" />
            </g>
          )
        })}
        {/* App → Cache (vertical) */}
        {(() => {
          const app = getPos('app'), cache = getPos('cache')
          return (
            <g>
              <line x1={app.x} y1={app.y + 26} x2={cache.x} y2={cache.y - 26}
                stroke={C.violet} strokeWidth="1.5" strokeDasharray="4 3" opacity=".4" />
              <polygon points={`${cache.x},${cache.y - 26} ${cache.x - 4},${cache.y - 33} ${cache.x + 4},${cache.y - 33}`}
                fill={C.violet} opacity=".4" />
            </g>
          )
        })()}
        {/* App → DB */}
        {(() => {
          const app = getPos('app'), db = getPos('db')
          return (
            <g>
              <line x1={app.x + 24} y1={app.y} x2={db.x - 24} y2={db.y}
                stroke={C.b1} strokeWidth="1.5" strokeDasharray="4 3" opacity=".5" />
              <polygon points={`${db.x - 24},${db.y} ${db.x - 31},${db.y - 4} ${db.x - 31},${db.y + 4}`}
                fill={C.b1} opacity=".5" />
            </g>
          )
        })()}

        {/* Animated data packets */}
        {packets.map((pkt, i) => {
          const from = getPos(pkt.from), to = getPos(pkt.to)
          const dx = to.x - from.x, dy = to.y - from.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          const ux = dx / dist, uy = dy / dist
          const sx = from.x + 24 * ux, sy = from.y + 24 * uy
          return (
            <g
              key={i}
              style={{
                '--travel': `${dx}px`,
                animation: `rw-dataFlow ${pkt.duration}ms ${pkt.delay}ms ease both`,
              }}
            >
              <circle cx={sx} cy={sy} r="5" fill={pkt.color || C.blue} opacity=".9" />
              <circle cx={sx} cy={sy} r="8" fill={pkt.color || C.blue} opacity=".3" />
            </g>
          )
        })}
      </svg>

      {/* Nodes */}
      {ARCH_NODES.map(node => {
        const isActive = activeNodes.includes(node.id)
        const y = node.yOff ? cacheY - 24 : nodeY - 24
        return (
          <div key={node.id} className={`rw-node${isActive ? ' active' : ''}`}
            style={{
              position: 'absolute',
              left: node.x,
              top: y,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              zIndex: 2,
            }}>
            <div style={{
              width: 52, height: 52, borderRadius: node.shape === 'circle' ? '50%' : 14,
              border: `2px solid ${isActive ? node.color : node.color + '40'}`,
              background: isActive ? `${node.color}18` : C.bg2,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: isActive ? `0 0 16px ${node.color}40, 0 0 0 4px ${node.color}12` : 'none',
              transition: 'all .3s ease',
            }}>
              <NodeShape shape={node.shape} color={node.color} size={32} active={isActive} />
              {isActive && (
                <div style={{
                  position: 'absolute', width: 52, height: 52,
                  borderRadius: node.shape === 'circle' ? '50%' : 14,
                  border: `1.5px solid ${node.color}`,
                  animation: 'rw-ping 1.5s ease infinite',
                  opacity: .4,
                }} />
              )}
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: isActive ? node.color : C.t2, fontFamily: "'DM Sans',sans-serif", whiteSpace: 'nowrap' }}>{node.label}</div>
              <div style={{ fontSize: 9, color: C.t4, fontFamily: "'JetBrains Mono',monospace" }}>{node.sublabel}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ═══════════════════════════════════════════
   REQUEST SIMULATOR
═══════════════════════════════════════════ */
function RequestSimulator({ useCase }) {
  const [step, setStep] = useState(-1)
  const [running, setRunning] = useState(false)
  const [mode, setMode] = useState('cachehit')

  const cacheHitSteps = [
    { nodes: ['user'], msg: 'User opens the app — request initiates', lat: '0ms', detail: 'User clicks or opens the page. Browser checks its local cache first (HTTP cache headers, service worker).' },
    { nodes: ['user', 'browser'], msg: 'Browser: no local cache — forward to server', lat: '~2ms', detail: 'This request hasn\'t been made recently (or TTL expired). Browser establishes TCP connection to load balancer.' },
    { nodes: ['browser', 'lb'], msg: 'Load balancer receives request', lat: '~5ms', detail: 'Load balancer checks health of app servers, picks one using round-robin or least-connections algorithm.' },
    { nodes: ['lb', 'app'], msg: 'App server receives request', lat: '~6ms', detail: 'App server parses the request. Before touching the database, it checks the in-memory cache first.' },
    { nodes: ['app', 'cache'], msg: 'Cache HIT — data found in KVMemo', lat: '~6.2ms', detail: 'GET session:user:abc123 → returns in 0.2ms. No database query needed. App builds response.', highlight: 'HIT', highlightColor: C.green },
    { nodes: ['cache', 'app', 'browser', 'user'], msg: 'Response served from cache', lat: '~12ms', detail: 'App returns cached data directly. Total round-trip: ~12ms. Database was never touched.', highlight: 'DONE', highlightColor: C.green },
  ]

  const cacheMissSteps = [
    { nodes: ['user'], msg: 'User requests data for the first time', lat: '0ms', detail: 'Cold start — this key has never been requested before, or TTL expired.' },
    { nodes: ['user', 'browser'], msg: 'Browser forwards request', lat: '~2ms', detail: 'No local cache hit. Request goes to the server infrastructure.' },
    { nodes: ['browser', 'lb'], msg: 'Load balancer routes request', lat: '~5ms', detail: 'Routes to least-loaded app server.' },
    { nodes: ['lb', 'app'], msg: 'App server receives request', lat: '~6ms', detail: 'Checks cache first — standard Cache Aside pattern.' },
    { nodes: ['app', 'cache'], msg: 'Cache MISS — key not found', lat: '~6.2ms', detail: 'GET product:42 → nil. Nothing in cache. App must now query the database.', highlight: 'MISS', highlightColor: C.rose },
    { nodes: ['cache', 'app', 'db'], msg: 'App queries the database', lat: '~14ms', detail: 'SELECT * FROM products WHERE id=42. Database I/O: index lookup + row fetch. ~8ms latency.' },
    { nodes: ['db', 'app'], msg: 'DB returns result — app populates cache', lat: '~22ms', detail: 'Result returned. App runs: SET product:42 \'{...}\' EX 300. Next request will be a cache hit.' },
    { nodes: ['app', 'browser', 'user'], msg: 'Response served — cache warm for next time', lat: '~28ms', detail: 'First request: 28ms. Every subsequent request for the next 5 minutes: ~12ms (cache hit).', highlight: 'CACHED', highlightColor: C.amber },
  ]

  const steps = mode === 'cachehit' ? cacheHitSteps : cacheMissSteps
  const current = steps[step] || null

  const run = useCallback(async () => {
    setRunning(true)
    setStep(-1)
    for (let i = 0; i < steps.length; i++) {
      await new Promise(r => setTimeout(r, 900))
      setStep(i)
    }
    await new Promise(r => setTimeout(r, 1500))
    setRunning(false)
  }, [mode, steps.length])

  const activeNodes = current?.nodes || []

  return (
    <div style={{ background: C.bg1, borderRadius: 18, border: `1px solid ${C.b0}`, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '18px 24px', borderBottom: `1px solid ${C.b0}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.tw, fontFamily: "'DM Sans',sans-serif" }}>
            Request Flow Simulator
          </h3>
          <p style={{ margin: '3px 0 0', fontSize: 12, color: C.t3 }}>Watch a request travel through the stack in real time</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {[['cachehit', 'Cache Hit'], ['cachemiss', 'Cache Miss']].map(([m, label]) => (
            <button key={m} onClick={() => { setMode(m); setStep(-1) }} disabled={running}
              style={{ padding: '6px 14px', borderRadius: 8, border: `1px solid ${mode === m ? (m === 'cachehit' ? C.green + '55' : C.rose + '55') : C.b0}`, background: mode === m ? `${m === 'cachehit' ? C.green : C.rose}12` : C.bg2, color: mode === m ? (m === 'cachehit' ? C.green2 : C.rose2) : C.t3, fontSize: 12, fontWeight: mode === m ? 700 : 400, cursor: running ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans',sans-serif", transition: 'all .15s' }}>
              {label}
            </button>
          ))}
          <button onClick={run} disabled={running}
            style={{ padding: '7px 20px', borderRadius: 8, background: running ? C.b0 : `linear-gradient(135deg, ${C.blue}, ${C.violet})`, border: 'none', color: running ? C.t3 : C.tw, fontSize: 12, fontWeight: 700, cursor: running ? 'wait' : 'pointer', fontFamily: "'DM Sans',sans-serif", transition: 'all .2s' }}>
            {running ? 'Running...' : step >= 0 ? 'Replay' : 'Run Simulation'}
          </button>
        </div>
      </div>

      {/* Diagram */}
      <div style={{ padding: '24px 20px 8px', overflowX: 'auto' }}>
        <div style={{ minWidth: 700 }}>
          <ArchDiagram activeNodes={activeNodes} packets={[]} />
        </div>
      </div>

      {/* Step log */}
      <div style={{ padding: '8px 24px 24px' }}>
        <div style={{ minHeight: 120, borderRadius: 12, background: C.bg2, border: `1px solid ${C.b0}`, padding: 16 }}>
          {step < 0 ? (
            <p style={{ color: C.t4, fontSize: 13, margin: 0, fontFamily: "'JetBrains Mono',monospace" }}>
              {running ? 'Initialising...' : '— Press "Run Simulation" to trace a live request through the stack —'}
            </p>
          ) : (
            <div style={{ animation: 'rw-slideRight .25s ease' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: C.t4, background: C.bg3, padding: '2px 8px', borderRadius: 5 }}>
                  step {step + 1}/{steps.length}
                </span>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: C.amber2 }}>{current?.lat}</span>
                {current?.highlight && (
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 10px', borderRadius: 99, background: `${current.highlightColor}18`, color: current.highlightColor, border: `1px solid ${current.highlightColor}44`, animation: 'rw-cacheHit .4s ease' }}>
                    {current.highlight}
                  </span>
                )}
              </div>
              <p style={{ margin: '0 0 6px', fontSize: 14, fontWeight: 600, color: C.t1, fontFamily: "'DM Sans',sans-serif" }}>{current?.msg}</p>
              <p style={{ margin: 0, fontSize: 12.5, color: C.t2, lineHeight: 1.7 }}>{current?.detail}</p>
            </div>
          )}
        </div>

        {/* Step indicators */}
        <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
          {steps.map((s, i) => (
            <div key={i} style={{ width: 28, height: 4, borderRadius: 2, background: i <= step ? C.blue : C.b0, transition: 'background .3s' }} />
          ))}
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   PATTERN STEP TRACE
═══════════════════════════════════════════ */
function PatternTrace({ pattern }) {
  const [activeStep, setActiveStep] = useState(0)
  const s = pattern.steps[activeStep]
  const ACTOR_COLOR = { App: C.blue2, Cache: C.violet2, DB: C.blue3, Worker: C.green2 }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
      {/* Steps list */}
      <div>
        <p style={{ margin: '0 0 12px', fontSize: 11, color: C.t3, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: "'JetBrains Mono',monospace" }}>Execution trace</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {pattern.steps.map((step, i) => (
            <button key={i} onClick={() => setActiveStep(i)}
              style={{ textAlign: 'left', padding: '10px 14px', borderRadius: 8, border: `1px solid ${i === activeStep ? pattern.color + '44' : 'transparent'}`, background: i === activeStep ? `${pattern.color}0e` : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, transition: 'all .15s' }}>
              <span style={{ width: 20, height: 20, borderRadius: '50%', background: i === activeStep ? pattern.color : C.b0, color: i === activeStep ? C.bg : C.t4, fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: "'JetBrains Mono',monospace", transition: 'all .15s' }}>{i + 1}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: ACTOR_COLOR[step.actor] || C.t2, fontFamily: "'JetBrains Mono',monospace" }}>{step.actor}</span>
                <span style={{ fontSize: 11, color: i === activeStep ? C.t1 : C.t2, marginLeft: 6 }}>{step.action}</span>
              </div>
              {step.result && (
                <span style={{ fontSize: 9, padding: '2px 7px', borderRadius: 4, background: `${step.result === 'MISS' ? C.rose : step.result === 'HIT' ? C.green : pattern.color}18`, color: step.result === 'MISS' ? C.rose2 : step.result === 'HIT' ? C.green2 : pattern.color, fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, flexShrink: 0 }}>{step.result}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Pros/cons + detail */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ padding: '14px 16px', borderRadius: 10, background: C.bg2, border: `1px solid ${C.b0}` }}>
          <p style={{ margin: '0 0 8px', fontSize: 11, color: C.t3, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: "'JetBrains Mono',monospace" }}>Advantages</p>
          {pattern.pros.map((p, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 5, alignItems: 'flex-start' }}>
              <span style={{ color: C.green2, fontSize: 11, marginTop: 2, flexShrink: 0 }}>+</span>
              <span style={{ fontSize: 12, color: C.t2, lineHeight: 1.55 }}>{p}</span>
            </div>
          ))}
        </div>
        <div style={{ padding: '14px 16px', borderRadius: 10, background: C.bg2, border: `1px solid ${C.b0}` }}>
          <p style={{ margin: '0 0 8px', fontSize: 11, color: C.t3, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: "'JetBrains Mono',monospace" }}>Trade-offs</p>
          {pattern.cons.map((c, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 5, alignItems: 'flex-start' }}>
              <span style={{ color: C.rose2, fontSize: 11, marginTop: 2, flexShrink: 0 }}>−</span>
              <span style={{ fontSize: 12, color: C.t2, lineHeight: 1.55 }}>{c}</span>
            </div>
          ))}
        </div>
        <div style={{ padding: '12px 16px', borderRadius: 10, background: `${pattern.color}0a`, border: `1px solid ${pattern.color}22` }}>
          <p style={{ margin: '0 0 4px', fontSize: 10, color: C.t3, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: "'JetBrains Mono',monospace" }}>Best used for</p>
          <p style={{ margin: 0, fontSize: 12.5, color: pattern.color }}>{pattern.usedIn}</p>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   USE CASE CARD — expanded view
═══════════════════════════════════════════ */
function UseCaseDetail({ uc }) {
  const [tab, setTab] = useState('problem')
  const TABS = [
    { id: 'problem', label: 'The Problem' },
    { id: 'without', label: 'Without Cache' },
    { id: 'with', label: 'With Cache' },
    { id: 'fit', label: 'KVMemo Fit' },
  ]
  return (
    <div style={{ animation: 'rw-fadeIn .3s ease' }}>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 3, borderBottom: `1px solid ${C.b0}`, marginBottom: 18 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className="rw-tab"
            style={{ padding: '8px 16px', border: `1px solid ${tab === t.id ? uc.color + '44' : 'transparent'}`, borderBottom: `2px solid ${tab === t.id ? uc.color : 'transparent'}`, borderRadius: '7px 7px 0 0', background: tab === t.id ? `${uc.color}0e` : 'transparent', color: tab === t.id ? uc.color : C.t3, fontSize: 12, fontWeight: tab === t.id ? 700 : 400, cursor: 'pointer', marginBottom: -1, fontFamily: "'DM Sans',sans-serif", transition: 'all .15s' }}>
            {t.label}
          </button>
        ))}
      </div>

      <div key={tab} style={{ animation: 'rw-fadeIn .2s ease', minHeight: 140 }}>
        {tab === 'problem' && (
          <div>
            <p style={{ fontSize: 14, color: C.t1, lineHeight: 1.8, marginBottom: 16 }}>{uc.problem}</p>
            <div style={{ padding: '14px 18px', borderRadius: 10, background: `${uc.color}0a`, border: `1px solid ${uc.color}20` }}>
              <p style={{ margin: '0 0 4px', fontSize: 10, color: C.t3, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: "'JetBrains Mono',monospace" }}>The insight</p>
              <p style={{ margin: 0, fontSize: 13, color: uc.color, lineHeight: 1.7 }}>{uc.insight}</p>
            </div>
          </div>
        )}
        {tab === 'without' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {uc.withoutCache.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 16px', borderRadius: 10, background: `${C.rose}08`, border: `1px solid ${C.rose}20` }}>
                <span style={{ color: C.rose2, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace", fontSize: 13, flexShrink: 0, marginTop: 1 }}>{i + 1}.</span>
                <p style={{ margin: 0, fontSize: 13, color: C.t1, lineHeight: 1.7 }}>{item}</p>
              </div>
            ))}
          </div>
        )}
        {tab === 'with' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {uc.withCache.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 16px', borderRadius: 10, background: `${C.green}08`, border: `1px solid ${C.green}20` }}>
                <span style={{ color: C.green2, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace", fontSize: 13, flexShrink: 0, marginTop: 1 }}>{i + 1}.</span>
                <p style={{ margin: 0, fontSize: 13, color: C.t1, lineHeight: 1.7 }}>{item}</p>
              </div>
            ))}
          </div>
        )}
        {tab === 'fit' && (
          <div>
            <p style={{ fontSize: 14, color: C.t1, lineHeight: 1.8, marginBottom: 16 }}>{uc.kvmemoFit}</p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {[['Latency', uc.metrics.latency, uc.color], ['DB reduction', uc.metrics.reduction, C.green], ['Pattern', uc.metrics.pattern, C.violet]].map(([label, val, col]) => (
                <div key={label} style={{ flex: 1, minWidth: 120, padding: '12px 16px', borderRadius: 10, background: C.bg2, border: `1px solid ${C.b0}` }}>
                  <p style={{ margin: '0 0 4px', fontSize: 9.5, color: C.t3, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: "'JetBrains Mono',monospace" }}>{label}</p>
                  <p style={{ margin: 0, fontSize: 18, fontWeight: 800, color: col, fontFamily: "'JetBrains Mono',monospace" }}>{val}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   LATENCY COMPARISON — visual bar chart
═══════════════════════════════════════════ */
function LatencyChart() {
  const data = [
    { label: 'CPU Register', val: 0.0003, unit: '0.3ns', color: C.green },
    { label: 'L1 Cache', val: 0.001, unit: '1ns', color: C.green },
    { label: 'L2 Cache', val: 0.004, unit: '4ns', color: C.green2 },
    { label: 'RAM access', val: 0.1, unit: '100ns', color: C.cyan },
    { label: 'KVMemo GET', val: 0.2, unit: '0.2ms', color: C.violet, highlight: true },
    { label: 'SSD read', val: 0.5, unit: '0.5ms', color: C.amber },
    { label: 'Postgres (idx)', val: 8, unit: '8ms', color: C.orange },
    { label: 'Network RPC', val: 20, unit: '20ms', color: C.rose },
    { label: 'Postgres (full)', val: 80, unit: '80ms', color: C.rose2 },
  ]
  const max = 80
  return (
    <div style={{ padding: '20px 0' }}>
      {data.map((d, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, animation: `rw-fadeUp .4s ${i * .04}s ease both` }}>
          <span style={{ fontSize: 11, color: d.highlight ? C.violet2 : C.t2, minWidth: 148, textAlign: 'right', fontFamily: d.highlight ? "'JetBrains Mono',monospace" : "'DM Sans',sans-serif", fontWeight: d.highlight ? 700 : 400 }}>{d.label}</span>
          <div style={{ flex: 1, height: d.highlight ? 14 : 10, borderRadius: 3, background: C.b0, overflow: 'hidden', border: d.highlight ? `1px solid ${C.violet}44` : 'none' }}>
            <div style={{ height: '100%', width: `${(d.val / max) * 100}%`, minWidth: 3, background: d.highlight ? `linear-gradient(90deg, ${C.violet}, ${C.violet2})` : d.color, borderRadius: 3, transition: 'width 1s ease' }} />
          </div>
          <span style={{ fontSize: 11, color: d.highlight ? C.violet2 : C.t3, minWidth: 56, fontFamily: "'JetBrains Mono',monospace", fontWeight: d.highlight ? 700 : 400 }}>{d.unit}</span>
        </div>
      ))}
      <p style={{ margin: '16px 0 0', fontSize: 11.5, color: C.t3, lineHeight: 1.6 }}>
        KVMemo sits between RAM access and SSD — 40× faster than an indexed Postgres query.
        This gap is why in-memory stores exist: the architecture trades RAM cost for latency.
      </p>
    </div>
  )
}

/* ═══════════════════════════════════════════
   HERO
═══════════════════════════════════════════ */
function Hero() {
  return (
    <div style={{ padding: '52px 32px 44px', position: 'relative', overflow: 'hidden', borderBottom: `1px solid ${C.b0}` }}>
      <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle,rgba(139,92,246,.07) 0%,transparent 65%)', top: -350, right: '-5%' }} />
        <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle,rgba(6,182,212,.05) 0%,transparent 65%)', top: -200, left: '10%' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `radial-gradient(circle,rgba(30,51,82,.5) 1px,transparent 1px)`, backgroundSize: '36px 36px', maskImage: 'radial-gradient(ellipse 90% 80% at 50% 0%,black 30%,transparent 100%)', WebkitMaskImage: 'radial-gradient(ellipse 90% 80% at 50% 0%,black 30%,transparent 100%)' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 860, margin: '0 auto' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '4px 14px', borderRadius: 99, border: `1px solid ${C.b1}`, background: `${C.violet}0d`, marginBottom: 20 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.green, boxShadow: `0 0 6px ${C.green}`, animation: 'rw-pulse 2s ease infinite' }} />
          <span style={{ fontSize: 11, color: C.t2, letterSpacing: '.04em' }}>Real-world usage · System Design · HLD</span>
        </div>

        <h1 style={{ fontSize: 'clamp(28px,4.5vw,52px)', fontWeight: 900, letterSpacing: '-.04em', lineHeight: 1.06, marginBottom: 16, fontFamily: "'DM Sans',sans-serif", color: C.tw }}>
          Where In-Memory Stores<br />
          <span style={{ background: `linear-gradient(135deg, ${C.violet2}, ${C.cyan2})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            fit in real systems
          </span>
        </h1>
        <p style={{ fontSize: 15, color: C.t2, lineHeight: 1.8, maxWidth: 600, marginBottom: 0 }}>
          Every major application at scale — from Twitter sessions to Stripe rate limiting — uses an in-memory key-value store somewhere in its stack. This page shows you exactly where, why, and how.
        </p>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   SECTION WRAPPER
═══════════════════════════════════════════ */
function Section({ title, sub, children, id }) {
  return (
    <section id={id} style={{ padding: '52px 32px', borderBottom: `1px solid ${C.b0}` }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ margin: 0, fontSize: 'clamp(20px,3vw,30px)', fontWeight: 800, color: C.tw, letterSpacing: '-.03em', fontFamily: "'DM Sans',sans-serif" }}>{title}</h2>
          {sub && <p style={{ margin: '6px 0 0', fontSize: 14, color: C.t2 }}>{sub}</p>}
        </div>
        {children}
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════
   ROOT
═══════════════════════════════════════════ */
export default function RealWorld() {
  const [activeUC, setActiveUC] = useState('session')
  const [activePattern, setActivePattern] = useState('aside')

  const uc = USE_CASES.find(u => u.id === activeUC)
  const pat = PATTERNS.find(p => p.id === activePattern)

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif", color: C.t1, minHeight: '100%' }}>
      <Styles />
      <Hero />

      {/* ── 1. ARCHITECTURE OVERVIEW ────────────── */}
      <Section id="arch" title="The standard web stack" sub="Where exactly does a KV store fit — and why at that layer?">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 28 }}>
          {[
            { label: 'Browser (L1)', color: C.cyan, desc: 'HTTP cache headers (Cache-Control, ETag), service workers. Avoids a network round trip entirely. TTL controlled by the server via max-age.', kvfit: false },
            { label: 'App → Cache (L2)', color: C.violet, desc: 'In-memory KV store between the application layer and the database. This is where KVMemo lives. Serves hot data without any disk I/O.', kvfit: true },
            { label: 'Load Balancer', color: C.amber, desc: 'Routes incoming requests across multiple app servers. Doesn\'t cache data itself, but consistent hashing ensures the same client hits the same server (sticky sessions).', kvfit: false },
            { label: 'Database (L3)', color: C.blue, desc: 'The source of truth. Has its own query cache, but slow due to disk I/O, index traversal, and query parsing. Should only be hit for cache misses or writes.', kvfit: false },
          ].map((item, i) => (
            <div key={i} style={{ padding: '18px 20px', borderRadius: 13, border: `1px solid ${item.color}${item.kvfit ? '44' : '22'}`, background: item.kvfit ? `${item.color}08` : C.bg1, animation: `rw-fadeUp .4s ${i * .08}s ease both` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.color, boxShadow: item.kvfit ? `0 0 8px ${item.color}` : 'none' }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: item.color, fontFamily: "'JetBrains Mono',monospace" }}>{item.label}</span>
                {item.kvfit && <span style={{ fontSize: 9, padding: '1px 8px', borderRadius: 4, background: `${item.color}18`, color: item.color, border: `1px solid ${item.color}33`, fontFamily: "'JetBrains Mono',monospace", fontWeight: 700 }}>KVMemo</span>}
              </div>
              <p style={{ margin: 0, fontSize: 12.5, color: C.t2, lineHeight: 1.7 }}>{item.desc}</p>
            </div>
          ))}
        </div>
        <RequestSimulator />
      </Section>

      {/* ── 2. USE CASES ────────────── */}
      <Section id="usecases" title="Five systems that depend on this" sub="Each one relies on a key-value store for a different reason. Click any to explore.">
        {/* Use case tabs */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 24 }}>
          {USE_CASES.map(u => (
            <button key={u.id} onClick={() => setActiveUC(u.id)} className="rw-tab"
              style={{ padding: '8px 18px', borderRadius: 10, border: `1px solid ${activeUC === u.id ? u.color + '55' : C.b0}`, background: activeUC === u.id ? `${u.color}12` : C.bg1, color: activeUC === u.id ? u.color : C.t2, fontSize: 13, fontWeight: activeUC === u.id ? 700 : 400, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", transition: 'all .15s' }}>
              {u.label}
            </button>
          ))}
        </div>

        {/* Active use case detail */}
        <div style={{ borderRadius: 18, border: `1px solid ${uc.color}33`, background: C.bg1, overflow: 'hidden' }}>
          <div style={{ height: 3, background: `linear-gradient(90deg, ${uc.color}00, ${uc.color}, ${uc.color}88, ${uc.color}00)` }} />
          <div style={{ padding: '22px 28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: uc.color, fontFamily: "'DM Sans',sans-serif", letterSpacing: '-.02em' }}>{uc.label}</h3>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: C.t2 }}>{uc.tagline}</p>
              </div>
              <span style={{ fontSize: 11, color: C.t3, fontFamily: "'JetBrains Mono',monospace", padding: '5px 12px', borderRadius: 7, background: C.bg2, border: `1px solid ${C.b0}` }}>{uc.company}</span>
            </div>
            <UseCaseDetail uc={uc} />
          </div>
        </div>
      </Section>

      {/* ── 3. CACHE PATTERNS ────────────── */}
      <Section id="patterns" title="The four caching strategies" sub="Each pattern makes a different trade-off between consistency, performance, and complexity.">
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 24 }}>
          {PATTERNS.map(p => (
            <button key={p.id} onClick={() => setActivePattern(p.id)} className="rw-tab"
              style={{ display: 'flex', flexDirection: 'column', padding: '10px 18px', borderRadius: 10, border: `1px solid ${activePattern === p.id ? p.color + '55' : C.b0}`, background: activePattern === p.id ? `${p.color}10` : C.bg1, cursor: 'pointer', textAlign: 'left', transition: 'all .15s', minWidth: 160 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: activePattern === p.id ? p.color : C.t1, fontFamily: "'DM Sans',sans-serif" }}>{p.name}</span>
              <span style={{ fontSize: 10.5, color: C.t3, marginTop: 2 }}>{p.subtitle}</span>
            </button>
          ))}
        </div>

        <div style={{ borderRadius: 18, border: `1px solid ${pat.color}33`, background: C.bg1, overflow: 'hidden' }}>
          <div style={{ height: 3, background: `linear-gradient(90deg, ${pat.color}00, ${pat.color}, ${pat.color}88, ${pat.color}00)` }} />
          <div style={{ padding: '24px 28px' }}>
            <PatternTrace pattern={pat} />
          </div>
        </div>
      </Section>

      {/* ── 4. LATENCY NUMBERS ────────────── */}
      <Section id="latency" title="Latency — the numbers that explain everything" sub="Understanding these numbers is why senior engineers obsess over cache placement.">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
          <LatencyChart />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { title: 'The 80/20 of database traffic', color: C.blue, body: 'In most web applications, 80% of read queries are for the same 20% of data. A user profile, a popular product page, a trending post — these are requested thousands of times per minute. Caching them eliminates redundant work.' },
              { title: 'Why RAM specifically?', color: C.violet, body: 'SSDs are ~2,500× faster than HDDs but still ~50× slower than RAM. A database on SSD still has query parsing, index traversal, and I/O scheduling overhead. RAM-resident data has none of this — the CPU addresses it directly.' },
              { title: 'The cost trade-off', color: C.amber, body: 'RAM costs ~$5/GB. SSD costs ~$0.10/GB. Caching makes sense when: (latency saved × request rate) × business value > cost of RAM. For a checkout page with 1M requests/day, saving 20ms per request saves 5+ hours of user wait time per day.' },
              { title: 'When NOT to cache', color: C.rose, body: 'Highly personalised data that changes frequently (e.g. real-time auction prices, live stock quotes). Financial transactions where stale data causes errors. Data that\'s different for every user and never repeated — caching it just wastes RAM.' },
            ].map((item, i) => (
              <div key={i} style={{ padding: '16px 20px', borderRadius: 12, border: `1px solid ${item.color}22`, background: C.bg1, animation: `rw-fadeUp .4s ${i * .08}s ease both` }}>
                <p style={{ margin: '0 0 6px', fontSize: 13, fontWeight: 700, color: item.color }}>{item.title}</p>
                <p style={{ margin: 0, fontSize: 12.5, color: C.t2, lineHeight: 1.7 }}>{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── 5. EVICTION STRATEGIES ────────────── */}
      <Section id="eviction" title="Eviction — what leaves the cache when RAM fills up" sub="KVMemo implements LRU. Here's why that decision was made.">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
          {[
            { name: 'LRU', full: 'Least Recently Used', color: C.violet, kvmemo: true, how: 'Doubly-linked list + hash map. Touch moves item to front. Evict from the back.', when: 'General-purpose caches, session stores, page caches. The most common choice.', complexity: 'O(1) get + put', why: 'If you haven\'t used a key recently, you probably won\'t use it soon. Temporal locality.' },
            { name: 'LFU', full: 'Least Frequently Used', color: C.cyan, kvmemo: false, how: 'Frequency counter per key. Min-heap or frequency-bucketed list for finding minimum.', when: 'Content delivery networks, DNS caches. When popularity (not recency) predicts future access.', complexity: 'O(1) with freq buckets', why: 'A key accessed 1000 times is more valuable than one accessed once, even if the once was recent.' },
            { name: 'FIFO', full: 'First In, First Out', color: C.amber, kvmemo: false, how: 'Simple queue. Enqueue on insert, dequeue oldest on eviction. No tracking needed.', when: 'Preprocessing pipelines, simple queues. When age predicts irrelevance (e.g. time-series data).', complexity: 'O(1)', why: 'Simplest possible policy. Works when data has natural time-based expiry anyway.' },
          ].map((e, i) => (
            <div key={i} style={{ borderRadius: 14, border: `1px solid ${e.color}${e.kvmemo ? '44' : '22'}`, background: e.kvmemo ? `${e.color}08` : C.bg1, padding: '20px', animation: `rw-fadeUp .4s ${i * .1}s ease both` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 22, fontWeight: 900, color: e.color, fontFamily: "'JetBrains Mono',monospace" }}>{e.name}</span>
                {e.kvmemo && <span style={{ fontSize: 9, padding: '2px 8px', borderRadius: 4, background: `${e.color}18`, color: e.color, border: `1px solid ${e.color}33`, fontFamily: "'JetBrains Mono',monospace", fontWeight: 700 }}>KVMemo</span>}
              </div>
              <p style={{ margin: '0 0 4px', fontSize: 10.5, color: C.t3 }}>{e.full}</p>
              <p style={{ margin: '0 0 12px', fontSize: 11, color: C.t3, fontFamily: "'JetBrains Mono',monospace" }}>{e.complexity}</p>

              {[['How it works', e.how], ['Best for', e.when], ['Core intuition', e.why]].map(([label, text]) => (
                <div key={label} style={{ marginBottom: 10 }}>
                  <p style={{ margin: '0 0 3px', fontSize: 9.5, color: C.t4, textTransform: 'uppercase', letterSpacing: '.06em', fontFamily: "'JetBrains Mono',monospace" }}>{label}</p>
                  <p style={{ margin: 0, fontSize: 12, color: C.t2, lineHeight: 1.6 }}>{text}</p>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* LRU visual */}
        <LRUVisual />
      </Section>

      {/* ── 6. TTL DEEP DIVE ────────────── */}
      <Section id="ttl" title="TTL — the self-cleaning mechanism" sub="Time-To-Live prevents stale data and manages memory automatically.">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div>
            <p style={{ fontSize: 14, color: C.t1, lineHeight: 1.8, marginBottom: 16 }}>
              Without TTL, a cache is a memory leak. Data inserted and never removed means RAM fills indefinitely. TTL gives every key an automatic expiry — the cache self-cleans, even if the application never explicitly deletes anything.
            </p>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, background: '#030810', borderRadius: 10, padding: '14px 18px', lineHeight: 1.9, border: `1px solid ${C.b0}` }}>
              <div style={{ color: C.t4, marginBottom: 4 }}>{'//'} Session with 1-hour TTL</div>
              {/* <div><span style={{ color: C.blue2 }}>SET</span> <span style={{ color: C.green2 }}>session:abc123</span> <span style={{ color: C.amber2 }}>'{"userId":42}'</span> <span style={{ color: C.violet2 }}>EX</span> <span style={{ color: C.amber2 }}>3600</span></div> */}
              <div>
                <span style={{ color: C.blue2 }}>SET</span>{" "}
                <span style={{ color: C.green2 }}>session:abc123</span>{" "}
                <span style={{ color: C.amber2 }}>{'{"userId":42}'}</span>{" "}
                <span style={{ color: C.violet2 }}>EX</span>{" "}
                <span style={{ color: C.amber2 }}>3600</span>
              </div>
              <div style={{ color: C.t4, marginTop: 8, marginBottom: 4 }}>{'//'} Rate limit window resets every minute</div>
              <div><span style={{ color: C.blue2 }}>SET</span> <span style={{ color: C.green2 }}>rate:user:42</span> <span style={{ color: C.amber2 }}>0</span> <span style={{ color: C.violet2 }}>EX</span> <span style={{ color: C.amber2 }}>60</span></div>
              <div style={{ color: C.t4, marginTop: 8, marginBottom: 4 }}>{'//'} Check TTL remaining</div>
              <div><span style={{ color: C.blue2 }}>TTL</span> <span style={{ color: C.green2 }}>session:abc123</span></div>
              <div style={{ color: C.t3 }}>{'//'} → 3542 (seconds remaining)</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { title: 'Lazy expiry (on access)', color: C.blue, desc: 'Don\'t check TTL in the background — only when the key is accessed. GET session:expired → check expiry → delete and return nil. Simple. Zero background CPU. But expired keys stay in RAM until touched.' },
              { title: 'Active expiry (background sweep)', color: C.violet, desc: 'KVMemo\'s TTLManager runs every 100ms, scans the TTL index (sorted by expiry time), and purges all expired keys. Bounded CPU: only runs for at most N ms per tick. Keeps RAM clean proactively.' },
              { title: 'The dual-index trick', color: C.cyan, desc: 'KVMemo\'s TTLIndex maintains two maps: byKey_ (key → expiry time) and byTime_ (expiry time → set of keys). Looking up "all keys expiring before now" is O(log N) — just scan byTime_ up to the current timestamp.' },
              { title: 'TTL vs explicit delete', color: C.amber, desc: 'TTL is the right tool when: you know data has a natural expiry (sessions, rate limits, OTP codes, temporary tokens). Use explicit DEL when: the delete event is triggered by a business action (user deletes account, product sold out).' },
            ].map((item, i) => (
              <div key={i} style={{ padding: '14px 18px', borderRadius: 11, border: `1px solid ${item.color}22`, background: C.bg1 }}>
                <p style={{ margin: '0 0 6px', fontSize: 13, fontWeight: 700, color: item.color }}>{item.title}</p>
                <p style={{ margin: 0, fontSize: 12.5, color: C.t2, lineHeight: 1.65 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>
    </div>
  )
}

/* ═══════════════════════════════════════════
   LRU VISUAL DEMO
═══════════════════════════════════════════ */
function LRUVisual() {
  const INIT = ['user:99', 'prod:7', 'session:A', 'cart:3', 'rate:12']
  const [queue, setQueue] = useState(INIT)
  const [log, setLog] = useState([])
  const [input, setInput] = useState('')
  const capacity = 5

  const access = (key) => {
    setQueue(prev => {
      const without = prev.filter(k => k !== key)
      return [key, ...without].slice(0, capacity)
    })
    setLog(prev => [{ key, action: 'accessed', evicted: null }, ...prev].slice(0, 4))
  }

  const insert = (key) => {
    if (!key.trim()) return
    setQueue(prev => {
      const exists = prev.includes(key)
      if (exists) {
        const without = prev.filter(k => k !== key)
        return [key, ...without]
      }
      const evicted = prev.length >= capacity ? prev[prev.length - 1] : null
      const next = [key, ...prev].slice(0, capacity)
      setLog(p => [{ key, action: 'inserted', evicted }, ...p].slice(0, 4))
      return next
    })
    setInput('')
  }

  const nodeColors = [C.violet, C.blue2, C.cyan2, C.green2, C.amber2]

  return (
    <div style={{ background: C.bg1, borderRadius: 16, border: `1px solid ${C.b0}`, padding: '24px 28px' }}>
      <p style={{ margin: '0 0 6px', fontSize: 14, fontWeight: 700, color: C.tw }}>LRU Cache — interactive demo</p>
      <p style={{ margin: '0 0 20px', fontSize: 12.5, color: C.t2 }}>Click a key to access it (moves to front). Insert a new key when full to see eviction.</p>

      {/* Cache slots */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {queue.map((key, i) => (
          <button key={key} onClick={() => access(key)}
            style={{ padding: '10px 16px', borderRadius: 9, border: `1.5px solid ${nodeColors[i]}55`, background: i === 0 ? `${nodeColors[0]}18` : C.bg2, color: nodeColors[i], fontSize: 12, fontWeight: i === 0 ? 700 : 400, cursor: 'pointer', fontFamily: "'JetBrains Mono',monospace", transition: 'all .2s', position: 'relative' }}>
            {i === 0 && <div style={{ position: 'absolute', top: -8, left: '50%', transform: 'translateX(-50%)', fontSize: 8, color: C.green2, fontFamily: "'DM Sans',sans-serif", whiteSpace: 'nowrap', fontWeight: 700 }}>MRU</div>}
            {i === queue.length - 1 && <div style={{ position: 'absolute', bottom: -8, left: '50%', transform: 'translateX(-50%)', fontSize: 8, color: C.rose2, fontFamily: "'DM Sans',sans-serif", whiteSpace: 'nowrap', fontWeight: 700 }}>LRU</div>}
            {key}
          </button>
        ))}
        {Array.from({ length: capacity - queue.length }).map((_, i) => (
          <div key={i} style={{ padding: '10px 16px', borderRadius: 9, border: `1.5px dashed ${C.b0}`, color: C.t4, fontSize: 12, fontFamily: "'JetBrains Mono',monospace" }}>empty</div>
        ))}
      </div>

      {/* Insert form */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && insert(input)}
          placeholder="new-key:value"
          style={{ padding: '8px 14px', borderRadius: 8, border: `1px solid ${C.b1}`, background: C.bg2, color: C.t1, fontSize: 12, fontFamily: "'JetBrains Mono',monospace", flex: 1, outline: 'none' }} />
        <button onClick={() => insert(input)}
          style={{ padding: '8px 18px', borderRadius: 8, background: `linear-gradient(135deg,${C.violet},${C.blue})`, border: 'none', color: C.tw, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>
          Insert
        </button>
      </div>

      {/* Log */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {log.map((entry, i) => (
          <div key={i} style={{ fontSize: 11, color: C.t3, fontFamily: "'JetBrains Mono',monospace", opacity: 1 - i * 0.2 }}>
            <span style={{ color: entry.action === 'inserted' ? C.green2 : C.blue2 }}>{entry.action === 'inserted' ? 'SET' : 'GET'}</span>
            {' '}<span style={{ color: C.t1 }}>{entry.key}</span>
            {entry.evicted && <span style={{ color: C.rose2 }}> → evicted: {entry.evicted}</span>}
          </div>
        ))}
      </div>
    </div>
  )
}
