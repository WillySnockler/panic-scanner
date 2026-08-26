const fs = require('fs');
const path = require('path');

function patch(html) {
  // Strong mobile anti-selection behavior. Inputs remain editable.
  html = html.replace(
    '</style>',
    `
    @media(max-width:620px){
      *,*::before,*::after{-webkit-user-select:none!important;user-select:none!important;-webkit-touch-callout:none!important;-webkit-tap-highlight-color:transparent}
      input,textarea,input *{-webkit-user-select:text!important;user-select:text!important;-webkit-touch-callout:default!important}
      .interactiveChart,.interactiveChart *,.eliteChart,.eliteChart *{-webkit-user-select:none!important;user-select:none!important;-webkit-touch-callout:none!important}
      .mobileSettings{padding-bottom:90px}
      .settingsGrid{grid-template-columns:1fr!important}
      .settingRow{align-items:flex-start!important}
      .settingControl{width:100%!important;justify-content:flex-end}
    }
    .settingsPanel{position:fixed;inset:0;background:#07090ff7;z-index:160;display:none;overflow:auto;padding:30px}
    .settingsPanel.open{display:block}
    .settingsShell{width:min(900px,100%);margin:0 auto;background:linear-gradient(180deg,#101722,#0b1018);border:1px solid var(--line);border-radius:24px;box-shadow:0 30px 100px #000b;overflow:hidden}
    .settingsHeader{display:flex;justify-content:space-between;align-items:center;padding:22px 24px;border-bottom:1px solid var(--line);position:sticky;top:0;background:#0b1018f5;backdrop-filter:blur(18px);z-index:2}
    .settingsHeader p{margin:4px 0 0;color:var(--muted);font-size:11px}
    .settingsBody{padding:24px}
    .settingsSection{margin-bottom:24px}
    .settingsSection h3{font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#77849a;margin:0 0 10px}
    .settingsCard{border:1px solid var(--line);border-radius:16px;background:#0e151f;overflow:hidden}
    .settingRow{display:flex;justify-content:space-between;gap:18px;align-items:center;padding:16px 17px;border-top:1px solid var(--line)}
    .settingRow:first-child{border-top:0}
    .settingCopy b{font-size:13px}.settingCopy p{margin:4px 0 0;color:var(--muted);font-size:10px;line-height:1.45}
    .settingControl{display:flex;align-items:center;gap:9px;flex:0 0 auto}
    .toggle{width:46px;height:26px;border-radius:99px;border:1px solid #334055;background:#171f2c;position:relative;padding:0}
    .toggle i{position:absolute;width:20px;height:20px;left:2px;top:2px;border-radius:50%;background:#8a95a8;transition:.18s}
    .toggle.on{background:#2a2154;border-color:#786cff88}.toggle.on i{left:22px;background:var(--purple)}
    .settingsSelect{background:#0a1018;color:#fff;border:1px solid var(--line);border-radius:10px;padding:9px 11px;min-width:120px}
    .settingsRange{width:130px;accent-color:var(--purple)}
    .settingsHint{color:#69758a;font-size:10px;line-height:1.5;margin-top:12px}
    .settingsDanger{border-color:#ff526633}.settingsDanger button{background:#17101a;border:1px solid #ff526655;color:#ff8794;border-radius:10px;padding:9px 12px;font-weight:900}
    .conceptStrip{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:24px 0 4px;max-width:900px}
    .conceptCard{padding:15px;border:1px solid var(--line);border-radius:14px;background:#0c121b}.conceptCard b{font-size:11px}.conceptCard p{margin:5px 0 0;color:var(--muted);font-size:10px;line-height:1.5}
    .searchLabel{margin-top:30px;font-size:11px;font-weight:1000;letter-spacing:1.3px;text-transform:uppercase;color:#9aa6ba}
    @media(max-width:900px){.conceptStrip{grid-template-columns:1fr 1fr}}
    @media(max-width:620px){.settingsPanel{padding:12px}.settingsBody{padding:16px}.settingsHeader{padding:17px}.conceptStrip{grid-template-columns:1fr}.conceptCard{padding:13px}}
    ` + '</style>'
  );

  // Keep chart information in a fixed top-right readout, away from the finger.
  html = html.replace(
    '.chartTip,.eliteTip{position:absolute;left:12px;top:12px;',
    '.chartTip,.eliteTip{position:absolute;left:auto;right:10px;top:10px;'
  );
  html = html.replace(
    "tip.style.left=Math.max(8,Math.min(r.width-205,x+14))+'px';tip.style.top=Math.max(8,Math.min(r.height-100,best.y/330*r.height-55))+'px'",
    "tip.style.left='auto';tip.style.right='10px';tip.style.top='10px'"
  );

  // Separate Settings from Account & Plans.
  html = html.replace('onclick="openDrawer()"><i>◆</i><span>Plans</span>', 'onclick="openAccountPlans()"><i>◆</i><span>Account &amp; Plans</span>');
  html = html.replace('onclick="openDrawer()"><i>⚙</i><span>Settings</span>', 'onclick="openSettings()"><i>⚙</i><span>Settings</span>');
  html = html.replace('class="nav" onclick="openDrawer()"><i>●</i><span>Account</span>', 'class="nav" onclick="openAccountPlans()"><i>●</i><span>Account &amp; Plans</span>');
  html = html.replace('onclick="openDrawer()">W</button>', 'onclick="openAccountPlans()">W</button>');

  // Landing page: explain the concept first, then search and analyse on this same page.
  html = html.replace(
    '<p class="lead">Scan a company, see the real price action, follow the news that moved it, then investigate whether the market reaction looks excessive.</p><div class="search">',
    `<p class="lead">Panic Scanner is built around one idea: when a stock drops hard, do not react to the fear first. Look at the price action, technical damage, fundamentals and news together to understand what actually changed.</p>
    <div class="conceptStrip"><div class="conceptCard"><b>01 · Detect the reaction</b><p>Find unusually sharp moves and see the exact sessions behind them.</p></div><div class="conceptCard"><b>02 · Challenge the panic</b><p>Compare momentum, trend, drawdown and company evidence instead of guessing.</p></div><div class="conceptCard"><b>03 · Investigate the reason</b><p>Connect the market move with catalysts, news and risk before forming a view.</p></div></div><div class="searchLabel">Search &amp; analyse</div><div class="search">`
  );
  html = html.replace('placeholder="Search a stock — BlackRock or BLK"', 'placeholder="Search a stock or company"');
  html = html.replace('Standard scan · Pro investigation · Elite stress mapping', 'Search any stock or company · Analyse the market reaction · Investigate the evidence');

  // Add a real Settings page/modal immediately before the existing drawer backdrop.
  const settingsPanel = `
  <section class="settingsPanel mobileSettings" id="settingsPanel" aria-label="Settings">
    <div class="settingsShell">
      <div class="settingsHeader"><div><b>Settings</b><p>Control your Panic Scanner experience.</p></div><button class="close" onclick="closeSettings()">×</button></div>
      <div class="settingsBody">
        <div class="settingsSection"><h3>App experience</h3><div class="settingsCard">
          <div class="settingRow"><div class="settingCopy"><b>Sound effects</b><p>Play small sounds for actions and confirmations.</p></div><div class="settingControl"><button id="soundToggle" class="toggle on" onclick="toggleSetting('sound')"><i></i></button></div></div>
          <div class="settingRow"><div class="settingCopy"><b>Sound volume</b><p>Set the volume used by interface sounds.</p></div><div class="settingControl"><input id="soundVolume" class="settingsRange" type="range" min="0" max="100" value="70" oninput="saveSetting('soundVolume',this.value)"></div></div>
          <div class="settingRow"><div class="settingCopy"><b>Haptic feedback</b><p>Use light vibration for supported mobile actions.</p></div><div class="settingControl"><button id="hapticToggle" class="toggle on" onclick="toggleSetting('haptic')"><i></i></button></div></div>
          <div class="settingRow"><div class="settingCopy"><b>Reduce motion</b><p>Reduce sliding and transition animations.</p></div><div class="settingControl"><button id="motionToggle" class="toggle" onclick="toggleSetting('reduceMotion')"><i></i></button></div></div>
          <div class="settingRow"><div class="settingCopy"><b>Compact interface</b><p>Use tighter spacing when viewing lots of research.</p></div><div class="settingControl"><button id="compactToggle" class="toggle" onclick="toggleSetting('compact')"><i></i></button></div></div>
        </div></div>
        <div class="settingsSection"><h3>Market & charts</h3><div class="settingsCard">
          <div class="settingRow"><div class="settingCopy"><b>Default chart range</b><p>Choose how much price history appears first.</p></div><div class="settingControl"><select id="defaultRange" class="settingsSelect" onchange="saveSetting('defaultRange',this.value)"><option value="20">20 days</option><option value="40">40 days</option><option value="60" selected>60 days</option><option value="all">All available</option></select></div></div>
          <div class="settingRow"><div class="settingCopy"><b>Auto-load analysis</b><p>Keep the analysis view open after selecting a result.</p></div><div class="settingControl"><button id="autoAnalysisToggle" class="toggle on" onclick="toggleSetting('autoAnalysis')"><i></i></button></div></div>
          <div class="settingRow"><div class="settingCopy"><b>Price display</b><p>Choose how many decimals are shown where possible.</p></div><div class="settingControl"><select id="decimals" class="settingsSelect" onchange="saveSetting('decimals',this.value)"><option value="auto" selected>Automatic</option><option value="0">0 decimals</option><option value="2">2 decimals</option></select></div></div>
        </div></div>
        <div class="settingsSection"><h3>Notifications</h3><div class="settingsCard">
          <div class="settingRow"><div class="settingCopy"><b>Market alerts</b><p>Allow future Panic Scanner alerts and watchlist notifications.</p></div><div class="settingControl"><button id="alertsToggle" class="toggle on" onclick="toggleSetting('alerts')"><i></i></button></div></div>
          <div class="settingRow"><div class="settingCopy"><b>News alerts</b><p>Allow important news notifications for saved research.</p></div><div class="settingControl"><button id="newsToggle" class="toggle on" onclick="toggleSetting('newsAlerts')"><i></i></button></div></div>
        </div></div>
        <div class="settingsSection"><h3>Privacy & data</h3><div class="settingsCard">
          <div class="settingRow"><div class="settingCopy"><b>Save recent searches</b><p>Remember recent searches locally on this device.</p></div><div class="settingControl"><button id="historyToggle" class="toggle on" onclick="toggleSetting('history')"><i></i></button></div></div>
          <div class="settingRow settingsDanger"><div class="settingCopy"><b>Reset app preferences</b><p>Return all Panic Scanner settings to their defaults.</p></div><div class="settingControl"><button onclick="resetSettings()">Reset</button></div></div>
        </div></div>
        <p class="settingsHint">Settings are stored on this device. Your account, subscription and promo/access controls are managed separately under Account &amp; Plans.</p>
      </div>
    </div>
  </section>`;
  html = html.replace('<div class="drawerBack" id="backdrop"', settingsPanel + '<div class="drawerBack" id="backdrop"');

  // Make the existing account drawer explicitly account + subscriptions.
  html = html.replace('<b>Account & Settings</b>', '<b>Account & Plans</b>');
  html = html.replace('<h3>Membership</h3>', '<h3>Account &amp; subscription</h3>');

  // Add robust mobile long-press/copy prevention after the existing app script.
  html = html.replace(
    '</script></body></html>',
    `
    const DEFAULT_SETTINGS={sound:true,soundVolume:70,haptic:true,reduceMotion:false,compact:false,defaultRange:'60',autoAnalysis:true,decimals:'auto',alerts:true,newsAlerts:true,history:true};
    function readSettings(){try{return {...DEFAULT_SETTINGS,...JSON.parse(localStorage.getItem('psSettings')||'{}')}}catch(e){return {...DEFAULT_SETTINGS}}}
    function writeSettings(s){localStorage.setItem('psSettings',JSON.stringify(s))}
    function syncSettings(){const s=readSettings();[['sound','soundToggle'],['haptic','hapticToggle'],['reduceMotion','motionToggle'],['compact','compactToggle'],['autoAnalysis','autoAnalysisToggle'],['alerts','alertsToggle'],['newsAlerts','newsToggle'],['history','historyToggle']].forEach(([k,id])=>{const el=document.getElementById(id);if(el)el.classList.toggle('on',!!s[k])});const v=document.getElementById('soundVolume');if(v)v.value=s.soundVolume;const r=document.getElementById('defaultRange');if(r)r.value=s.defaultRange;const d=document.getElementById('decimals');if(d)d.value=s.decimals;document.documentElement.classList.toggle('reduce-motion',!!s.reduceMotion);document.documentElement.classList.toggle('compact-mode',!!s.compact)}
    function saveSetting(k,v){const s=readSettings();s[k]=['soundVolume'].includes(k)?Number(v):v;writeSettings(s);syncSettings()}
    function toggleSetting(k){const s=readSettings();s[k]=!s[k];writeSettings(s);syncSettings();if(s.haptic&&navigator.vibrate)navigator.vibrate(8)}
    function resetSettings(){writeSettings({...DEFAULT_SETTINGS});syncSettings();toast('Settings reset to defaults.')}
    function openSettings(){closeDrawer();$('settingsPanel').classList.add('open');syncSettings();document.body.style.overflow='hidden'}
    function closeSettings(){$('settingsPanel').classList.remove('open');document.body.style.overflow=''}
    function openAccountPlans(){closeSettings();openDrawer()}
    const psMobile=window.matchMedia('(max-width:620px)');
    function blockMobileCopy(e){if(psMobile.matches&&!e.target.matches('input,textarea,[contenteditable="true"]'))e.preventDefault()}
    ['copy','cut','contextmenu','dragstart','selectstart'].forEach(type=>document.addEventListener(type,blockMobileCopy,{capture:true}));
    document.addEventListener('touchstart',e=>{if(psMobile.matches&&e.target.closest('.interactiveChart,.eliteChart')){e.stopPropagation()}},{passive:true,capture:true});
    syncSettings();
    </script></body></html>`
  );
  return html;
}

module.exports = (req, res) => {
  const source = fs.readFileSync(path.join(process.cwd(), 'index.html'), 'utf8');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.status(200).send(patch(source));
};
