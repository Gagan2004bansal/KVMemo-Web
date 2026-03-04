import { useEffect } from 'react'

export function useGlobalStyles() {
  useEffect(() => {
    if (document.getElementById('kv-g')) return
    const el = document.createElement('style')
    el.id = 'kv-g'
    el.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&family=JetBrains+Mono:wght@400;500;600&display=swap');

      *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
      html{scroll-behavior:smooth}
      body{
        background:#020817;color:#c9d8f0;
        font-family:'DM Sans',sans-serif;
        overflow-x:hidden;
        -webkit-font-smoothing:antialiased;
      }
      ::-webkit-scrollbar{width:4px}
      ::-webkit-scrollbar-track{background:#020817}
      ::-webkit-scrollbar-thumb{background:#1e3352;border-radius:2px}
      ::-webkit-scrollbar-thumb:hover{background:#254070}
      ::selection{background:rgba(59,130,246,.25);color:#f0f6fc}
      a{color:inherit;text-decoration:none}
      button{font-family:inherit;cursor:pointer}
      code,pre{font-family:'JetBrains Mono',monospace}

      /* ── Keyframes ────────────────────────── */
      @keyframes fadeUp  {from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}
      @keyframes fadeIn  {from{opacity:0}to{opacity:1}}
      @keyframes slideL  {from{opacity:0;transform:translateX(-12px)}to{opacity:1;transform:none}}
      @keyframes blink   {0%,100%{opacity:1}50%{opacity:0}}
      @keyframes pulse   {0%,100%{opacity:1}50%{opacity:.3}}
      @keyframes spin    {to{transform:rotate(360deg)}}
      @keyframes shimmer {0%{background-position:200% center}100%{background-position:-200% center}}
      @keyframes dash    {to{stroke-dashoffset:-20}}
      @keyframes orb1    {0%,100%{transform:translate(0,0) scale(1)}40%{transform:translate(60px,-40px) scale(1.1)}70%{transform:translate(-30px,50px) scale(.96)}}
      @keyframes orb2    {0%,100%{transform:translate(0,0) scale(1)}35%{transform:translate(-50px,55px) scale(1.06)}70%{transform:translate(45px,-30px) scale(.97)}}
      @keyframes orb3    {0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(30px,45px) scale(1.08)}}

      /* ── Utility ──────────────────────────── */
      .fu   {animation:fadeUp .5s ease both}
      .fi   {animation:fadeIn .4s ease both}
      .sl   {animation:slideL .3s ease both}

      .shimmer{
        background:linear-gradient(90deg,#c9d8f0 0%,#f0f6fc 35%,#60a5fa 50%,#f0f6fc 65%,#c9d8f0 100%);
        background-size:200% auto;
        -webkit-background-clip:text;-webkit-text-fill-color:transparent;
        background-clip:text;
        animation:shimmer 4.5s linear infinite;
      }

      .hcard{transition:border-color .2s,box-shadow .2s,transform .2s}
      .hcard:hover{transform:translateY(-2px);box-shadow:0 16px 48px rgba(0,0,0,.4)!important}
    `
    document.head.appendChild(el)
    return () => document.getElementById('kv-g')?.remove()
  }, [])
}
