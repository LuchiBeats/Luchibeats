const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const ctx = await b.newContext(); await ctx.addInitScript(()=>{ try{localStorage.setItem('lb-intro','1')}catch(e){} });
 const p = await ctx.newPage(); await p.goto('https://www.luchibeats.com/',{waitUntil:'domcontentloaded'}); await p.waitForSelector('.credit-card');
 const rows = await p.$$eval('.credit-card', cs => cs.map(c => ({ artist: c.querySelector('.credit-artist').textContent, title: c.querySelector('.credit-title').textContent, roles: [...c.querySelectorAll('.credit-role')].map(r=>r.textContent).join(' · ') })));
 require('fs').writeFileSync(process.argv[2], JSON.stringify(rows, null, 1)); console.log(rows.length, 'credits'); await b.close(); })();
