const i=/(饱腹|口渴|水分|饥饿|脱水)/u,T=/<!--\s*PROMPT_FEATURE:([a-z0-9_-]+):START\s*-->([\s\S]*?)<!--\s*PROMPT_FEATURE:\1:END\s*-->/giu,c=new Set(["境界","境界层级","当前经验","升级经验","突破条件","当前内力","最大内力","功法列表","境界映射值","推荐境界"]),p=(t,r)=>(t||"").split(`
`).filter(e=>!r.test(e)).join(`
`).replace(/\n{3,}/g,`

`).trim(),E=t=>p(t,i),u=t=>(t||"").replace(/\r\n/g,`
`).trim(),R=(t,r)=>{switch((t||"").trim().toLowerCase()){case"cultivation":return(r==null?void 0:r.启用修炼体系)!==!1;case"survival":return(r==null?void 0:r.启用饱腹口渴系统)!==!1;default:return!0}},m=(t,r)=>{const e=t.trim().toLowerCase(),s=u(r);return!e||!s?"":[`<!-- PROMPT_FEATURE:${e}:START -->`,s,`<!-- PROMPT_FEATURE:${e}:END -->`].join(`
`)},P=t=>m("cultivation",t),A=(t,r)=>{let e=typeof t=="string"?t:"",s="";for(;e!==s;)s=e,e=e.replace(T,(a,o,l)=>R(o,r)?u(l):"");return e},_=(t,r)=>{let e=A(typeof t=="string"?t:"",r);return(r==null?void 0:r.启用饱腹口渴系统)===!1&&(e=E(e)),e.replace(/\n{3,}/g,`

`).trim()},n=t=>{if(Array.isArray(t))return t.map(s=>n(s));if(!t||typeof t!="object")return t;const r=t,e={};return Object.entries(r).forEach(([s,a])=>{c.has(s)||(e[s]=n(a))}),e},h=(t,r)=>(r==null?void 0:r.启用修炼体系)!==!1?t:n(t);export{_ as 按,P as 构,h as 裁};
