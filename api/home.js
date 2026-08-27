const fs = require('fs');
const path = require('path');

function handler(req, res) {
  const file = path.join(process.cwd(), 'index.html');
  let html = fs.readFileSync(file, 'utf8');

  const css = `
<style id="ps-production-fix">
.psHomeExtra{margin:34px 0 0}.psSectionTitle{display:flex;justify-content:space-between;align-items:end;gap:18px;margin-bottom:14px}.psSectionTitle h2{margin:0;font-size:22px}.psSectionTitle p{margin:5px 0 0;color:var(--muted);font-size:11px;line-height:1.5}.psFeatureGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.psFeature{padding:18px;border:1px solid var(--line);border-radius:17px;background:linear-gradient(180deg,#101722,#0b1018)}.psFeature .num{font-size:9px;color:var(--purple);font-weight:1000;letter-spacing:1.5px}.psFeature h3{font-size:15px;margin:9px 0 6px}.psFeature p{font-size:10px;color:var(--muted);line-height:1.55;margin:0}.psWorkflow{display:grid;grid-template-columns:1.15fr .85fr;gap:14px;margin-top:12px}.psWorkflowCard{padding:21px;border:1px solid var(--line);border-radius:18px;background:#0d141e}.psStep{display:flex;gap:12px;padding:12px 0;border-top:1px solid var(--line)}.psStep:first-child{border-top:0}.psStepNo{width:28px;height:28px;border-radius:9px;background:#17132a;border:1px solid #786cff55;display:grid;place-items:center;color:#b9afff;font-size:10px;font-weight:1000;flex:none}.psStep b{font-size:11px}.psStep p{margin:4px 0 0;color:var(--muted);font-size:9px;line-height:1.45}.psTrust{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:14px}.psTrust div{padding:13px;border:1px solid var(--line);border-radius:13px;background:#0b1119}.psTrust b{font-size:10px}.psTrust span{display:block;color:var(--muted);font-size:9px;margin-top:4px;line-height:1.45}.psFaq{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px}.psFaq details{border:1px solid var(--line);border-radius:13px;background:#0d141e;padding:13px}.psFaq summary{cursor:pointer;font-size:10px;font-weight:900}.psFaq p{color:var(--muted);font-size:9px;line-height:1.5}.psDisclaimer{margin-top:14px;color:#657187;font-size:8px;line-height:1.55;text-align:center}.psAccountBtn{position:fixed;right:18px;bottom:18px;z-index:120;border:1px solid #786cff66;background:#141329;color:#fff;border-radius:12px;padding:10px 13px;font-size:10px;font-weight:900;box-shadow:0 12px 35px #0008}.psModal{position:fixed;inset:0;z-index:300;display:none;background:#000b;backdrop-filter:blur(14px);padding:18px;overflow:auto}.psModal.open{display:block}.psModalShell{width:min(980px,100%);margin:5vh auto;background:#0b1119;border:1px solid var(--line);border-radius:24px;box-shadow:0 30px 110px #000d;overflow:hidden}.psModalHead{display:flex;justify-content:space-between;align-items:center;padding:20px 22px;border-bottom:1px solid var(--line);position:sticky;top:0;background:#0b1119f5;z-index:2}.psModalHead b{font-size:16px}.psModalHead span{display:block;color:var(--muted);font-size:9px;margin-top:4px}.psClose{border:1px solid var(--line);background:#111925;color:#fff;width:34px;height:34px;border-radius:10px}.psModalBody{padding:22px}.psPlans{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.psPlan{padding:19px;border:1px solid var(--line);border-radius:18px;background:#0e151f}.psPlan.featured{border-color:#786cff88}.psPlan.elite{border-color:#f5c85c77}.psPlan h3{margin:0;font-size:18px}.psPrice{font-size:25px;font-weight:1000;margin:9px 0}.psPlan p{color:var(--muted);font-size:9px;line-height:1.5}.psPlan ul{padding-left:17px;color:#cbd2df;font-size:9px;line-height:1.8;min-height:115px}.psPlan button{width:100%;border:0;border-radius:10px;padding:11px;font-weight:1000;background:#fff}.psPlan.featured button{background:var(--purple);color:#fff}.psPlan.elite button{background:var(--yellow);color:#111}.psSettingsGrid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.psSettingGroup{border:1px solid var(--line);border-radius:16px;background:#0e151f;overflow:hidden}.psSettingGroup h3{font-size:10px;letter-spacing:1.3px;text-transform:uppercase;color:#7d899d;padding:14px 15px;margin:0;border-bottom:1px solid var(--line)}.psSetting{display:flex;justify-content:space-between;align-items:center;gap:15px;padding:14px 15px;border-top:1px solid var(--line)}.psSetting:first-of-type{border-top:0}.psSetting b{font-size:10px}.psSetting p{margin:3px 0 0;color:var(--muted);font-size:8px;line-height:1.4}.psToggle{width:43px;height:25px;border-radius:99px;border:1px solid #344054;background:#171f2d;position:relative;flex:none}.psToggle i{position:absolute;left:2px;top:2px;width:19px;height:19px;border-radius:50%;background:#7d899d;transition:.15s}.psToggle.on{background:#2b2256;border-color:#786cff77}.psToggle.on i{left:20px;background:var(--purple)}.psSelect{background:#080d15;color:#fff;border:1px solid var(--line);border-radius:9px;padding:8px;font-size:9px}.psRange{width:100px;accent-color:var(--purple)}
@media(max-width:900px){.psFeatureGrid{grid-template-columns:1fr 1fr}.psWorkflow{grid-template-columns:1fr}.psPlans{grid-template-columns:1fr}.psSettingsGrid{grid-template-columns:1fr}.psFaq{grid-template-columns:1fr}}
@media(max-width:620px){*,*::before,*::after{-webkit-user-select:none!important;user-select:none!important;-webkit-touch-callout:none!important;-webkit-tap-highlight-color:transparent}.auth input,input,textarea,[contenteditable=true]{-webkit-user-select:text!important;user-select:text!important;-webkit-touch-callout:default!important}.interactiveChart,.interactiveChart *,.eliteChart,.eliteChart *{user-select:none!important;-webkit-user-select:none!important;-webkit-touch-callout:none!important;touch-action:none!important}.psHomeExtra{margin-top:24px}.psFeatureGrid,.psTrust{grid-template-columns:1fr}.psWorkflow{grid-template-columns:1fr}.psFeature{padding:15px}.psSectionTitle{display:block}.psPlans{grid-template-columns:1fr}.psModal{padding:10px}.psModalShell{margin:0 auto;border-radius:19px}.psModalBody{padding:15px}.psSetting{align-items:flex-start}.psAccountBtn{right:12px;bottom:78px}}
</style>`;

  const home = `
<section class="psHomeExtra" id="ps-home-extra">
  <div class="psSectionTitle"><div><h2>Built for the moment a stock moves</h2><p>Turn a sharp market reaction into a structured research workflow.</p></div></div>
  <div class="psFeatureGrid">
    <article class="psFeature"><div class="num">01 · REACTION</div><h3>See what actually happened</h3><p>Inspect the price path, exact sessions, drawdown and volume behind a move.</p></article>
    <article class="psFeature"><div class="num">02 · CONTEXT</div><h3>Find the reason</h3><p>Put price action beside technical, company and news evidence instead of guessing.</p></article>
    <article class="psFeature"><div class="num">03 · RECOVERY</div><h3>Separate damage from recovery</h3><p>Identify where a sell-off is still deteriorating and where stabilization begins.</p></article>
  </div>
  <div class="psWorkflow">
    <div class="psWorkflowCard"><div class="psSectionTitle"><div><h2>One workflow. No noise.</h2><p>From the first search to the final research conclusion.</p></div></div>
      <div class="psStep"><div class="psStepNo">01</div><div><b>Search a stock or company</b><p>Start with the security you actually care about.</p></div></div>
      <div class="psStep"><div class="psStepNo">02</div><div><b>Scan the reaction</b><p>Review price movement, momentum, drawdown and volume.</p></div></div>
      <div class="psStep"><div class="psStepNo">03</div><div><b>Investigate the evidence</b><p>Work through technicals, fundamentals, catalysts and risk.</p></div></div>
      <div class="psStep"><div class="psStepNo">04</div><div><b>Keep watching</b><p>Return when the situation changes instead of starting over.</p></div></div>
    </div>
    <div class="psWorkflowCard"><div class="psSectionTitle"><div><h2>Why it is useful</h2><p>Built for repeat research, not one-off predictions.</p></div></div>
      <div class="psTrust"><div><b>Evidence first</b><span>Context behind the reaction.</span></div><div><b>Interactive</b><span>Exact date and price inspection.</span></div><div><b>Decision support</b><span>Research without pretending to predict the future.</span></div></div>
      <div style="margin-top:14px;padding:15px;border:1px solid #786cff44;border-radius:14px;background:#141329"><b style="font-size:11px">The Panic Scanner principle</b><p style="margin:6px 0 0;color:#aeb8ca;font-size:9px;line-height:1.55">A falling price is an event, not an explanation. The product helps you investigate the difference.</p></div>
    </div>
  </div>
  <div style="margin-top:24px"><div class="psSectionTitle"><div><h2>Questions before you start?</h2><p>Clear answers without the sales fluff.</p></div></div><div class="psFaq">
    <details><summary>Does Panic Scanner tell me what to buy?</summary><p>No. It is a research and market-context tool. The final investment decision stays with the user.</p></details>
    <details><summary>What makes Elite different?</summary><p>Elite adds deeper stress and recovery context around major market reactions.</p></details>
    <details><summary>Can I use it on mobile?</summary><p>Yes. The charts are touch-interactive and the layout adapts to small screens.</p></details>
    <details><summary>Why do plans exist?</summary><p>Plans control access to deeper research and premium workflow features.</p></details>
  </div></div>
  <div class="psDisclaimer">Panic Scanner is a research and educational tool. Market data may be delayed or incomplete. Nothing on the platform is personalized investment advice or a guarantee of future performance.</div>
</section>`;

  const modal = `
<button class="psAccountBtn" onclick="psOpen('psAccountModal')">Account & Plans</button>
<div class="psModal" id="psAccountModal"><div class="psModalShell"><div class="psModalHead"><div><b>Account &amp; Plans</b><span>Manage access and subscription in one place.</span></div><button class="psClose" onclick="psClose('psAccountModal')">×</button></div><div class="psModalBody"><div class="psPlans">
  <div class="psPlan"><h3>Standard</h3><div class="psPrice">Free</div><p>Get started with the core scanner.</p><ul><li>Stock/company search</li><li>Reaction analysis</li><li>Interactive charts</li></ul><button onclick="toast('Standard is active.')">Current plan</button></div>
  <div class="psPlan featured"><h3>Pro</h3><div class="psPrice">Premium</div><p>Deeper research for repeat workflows.</p><ul><li>Deeper investigation</li><li>Expanded evidence</li><li>More research history</li></ul><button onclick="toast('Pro checkout is not connected yet.')">Choose Pro</button></div>
  <div class="psPlan elite"><h3>Elite</h3><div class="psPrice">Premium+</div><p>The complete research experience.</p><ul><li>Elite Market Reaction Map</li><li>Stress &amp; recovery context</li><li>Maximum research access</li></ul><button onclick="toast('Elite checkout is not connected yet.')">Choose Elite</button></div>
</div></div></div></div>
<div class="psModal" id="psSettingsModal"><div class="psModalShell"><div class="psModalHead"><div><b>Settings</b><span>Preferences are separate from account plans.</span></div><button class="psClose" onclick="psClose('psSettingsModal')">×</button></div><div class="psModalBody"><div class="psSettingsGrid">
  <div class="psSettingGroup"><h3>Experience</h3><div class="psSetting"><div><b>Compact mode</b><p>Reduce spacing for more information on screen.</p></div><button class="psToggle" onclick="this.classList.toggle('on')"><i></i></button></div><div class="psSetting"><div><b>Reduce motion</b><p>Use simpler transitions and movement.</p></div><button class="psToggle" onclick="this.classList.toggle('on')"><i></i></button></div></div>
  <div class="psSettingGroup"><h3>Charts</h3><div class="psSetting"><div><b>Default range</b><p>Choose the first chart range.</p></div><select class="psSelect"><option>60D</option><option>40D</option><option>20D</option><option>ALL</option></select></div><div class="psSetting"><div><b>Chart detail</b><p>Control visual density.</p></div><input class="psRange" type="range" min="1" max="3" value="2"></div></div>
</div></div></div></div>`;

  const script = `<script id="ps-production-fix-js">function psOpen(id){document.getElementById(id)?.classList.add('open')}function psClose(id){document.getElementById(id)?.classList.remove('open')}document.addEventListener('keydown',e=>{if(e.key==='Escape'){psClose('psAccountModal');psClose('psSettingsModal')}});document.querySelectorAll('.psModal').forEach(m=>m.addEventListener('click',e=>{if(e.target===m)m.classList.remove('open')}));</script>`;

  html = html.replace('</style>', css + '</style>');
  html = html.replace('</main>', home + '</main>');
  html = html.replace('</body>', modal + script + '</body>');

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).send(html);
}

module.exports = handler;
