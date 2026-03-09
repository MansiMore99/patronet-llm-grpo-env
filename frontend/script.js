// ─────────────────────────────────────────────────────────────
//  CONVERSATION DATA  (source: data/conversation scenarios.txt)
// ─────────────────────────────────────────────────────────────

// Default BAD — shown when entering the room with no config active
const DEFAULT_BAD = {
  lines: [
    { speaker: 'Victim', text: "I'm trapped here — I can't find the exit!" },
    { speaker: 'Agent',  text: "Please hold while we assess the situation..." },
    { speaker: 'Victim', text: "I can barely breathe, the smoke is getting worse!" },
    { speaker: 'Agent',  text: "Someone will be with you shortly. Stay on the line." },
  ],
  suggestedConfig: 'triage_assess',
};

const SCENARIOS = {
  triage_assess: {
    crisisType: 'Medical Severity',
    good: [
      { speaker: 'Victim', text: "I feel dizzy and I can't breathe well." },
      { speaker: 'System', text: "triage_assess — high-risk respiratory distress detected." },
      { speaker: 'Agent',  text: "You may have smoke inhalation. Stay low, cover your mouth, and move toward the window." },
    ],
  },
  route_responder: {
    crisisType: 'Emergency Response Routing',
    good: [
      { speaker: 'System', text: "route_responder — closest unit identified instantly." },
      { speaker: 'Agent',  text: "Fire responders are 2 minutes away. Stay near the window." },
    ],
  },
  translate_message: {
    crisisType: 'Language Barrier',
    good: [
      { speaker: 'Victim', text: "Tengo dificultad para respirar." },
      { speaker: 'System', text: "translate_message executed in 0.001s — Spanish detected." },
      { speaker: 'Agent',  text: "I understand you are having trouble breathing. Move near a window and stay calm. Help is on the way." },
    ],
  },
  silent_mode: {
    crisisType: 'Loud Emergency Environment',
    good: [
      { speaker: 'Victim', text: "I can't hear you — the fire alarm is too loud!" },
      { speaker: 'System', text: "silent_mode activated — switching to visual instructions." },
      { speaker: 'Agent',  text: "[ Visual signal ] ▶ Move to window. ▶ Stay low. ▶ Cover mouth." },
    ],
  },
  translate: {
    crisisType: 'Multilingual Response',
    good: [
      { speaker: 'Victim', text: "¿Alguien puede ayudarme?" },
      { speaker: 'System', text: "translate enabled — instructions delivered in victim's language." },
      { speaker: 'Agent',  text: "Quédese tranquilo. Vaya hacia la ventana y quédese cerca del suelo." },
    ],
  },
  guide_victim: {
    crisisType: 'Evacuation Guidance',
    good: [
      { speaker: 'Victim', text: "What should I do? I can't see through the smoke!" },
      { speaker: 'System', text: "guide_victim activated — step-by-step evacuation generated." },
      { speaker: 'Agent',  text: "Stay low under the smoke. Move toward the window on your left. Signal responders when you reach it." },
    ],
  },
  send_alert: {
    crisisType: 'Alerting Emergency Teams',
    good: [
      { speaker: 'Victim', text: "Is anyone coming? I'm running out of time!" },
      { speaker: 'System', text: "send_alert executed — fire department notified immediately." },
      { speaker: 'Agent',  text: "Emergency services have been alerted. Stay near the window. Help is 90 seconds away." },
    ],
  },
  coordinate_responders: {
    crisisType: 'Multi-Responder Coordination',
    good: [
      { speaker: 'System', text: "coordinate_responders executed — all units synchronized." },
      { speaker: 'Agent',  text: "Fire team is entering the building now. Medical team is staged at the exit. Stay where you are." },
    ],
  },
  fetch_location: {
    crisisType: 'Location Detection',
    good: [
      { speaker: 'Victim', text: "I am in my apartment — please help me!" },
      { speaker: 'System', text: "fetch_location executed — building and floor identified automatically." },
      { speaker: 'Agent',  text: "We have your exact location. Responders are on their way right now." },
    ],
  },
};

// ─────────────────────────────────────────────────────────────
//  DOM REFS
// ─────────────────────────────────────────────────────────────
const overlay    = document.getElementById('fade-overlay');
const drawer     = document.getElementById('cfg-drawer');
const toggleEl   = document.getElementById('cfg-toggle');
const statusBar  = document.getElementById('status-bar');
const dlgScroll  = document.getElementById('dlg-scroll');
const indVictim  = document.getElementById('ind-victim');
const indAgent   = document.getElementById('ind-agent');
const trajBanner = document.getElementById('traj-banner');
const cfgHint    = document.getElementById('cfg-hint');
const cfgHintName = document.getElementById('cfg-hint-name');

// ─────────────────────────────────────────────────────────────
//  STATE
// ─────────────────────────────────────────────────────────────
let stage        = 'city';
let convTimer    = null;
let activeConfig = null;

// ─────────────────────────────────────────────────────────────
//  DRAWER
// ─────────────────────────────────────────────────────────────
function openDrawer() {
  drawer.classList.add('open');
  toggleEl.classList.add('open');
  toggleEl.innerHTML = '&#x276E;';
}
function closeDrawer() {
  drawer.classList.remove('open');
  toggleEl.classList.remove('open');
  toggleEl.innerHTML = '&#x276F;';
}
function toggleDrawer() {
  drawer.classList.contains('open') ? closeDrawer() : openDrawer();
}

// ─────────────────────────────────────────────────────────────
//  CONFIG BUTTON  — toggle: on → good trajectory, off → bad
// ─────────────────────────────────────────────────────────────
function selectCfg(btn, name) {
  console.log('Config Selected:', name);
  if (stage !== 'room') return;

  if (activeConfig === name) {
    // deactivate → replay default bad
    activeConfig = null;
    btn.classList.remove('active');
    cfgHint.style.display = 'none';
    closeDrawer();
    resetAndPlay(DEFAULT_BAD.lines, 'bad', 'No configuration active', DEFAULT_BAD.suggestedConfig);
  } else {
    // activate → play good trajectory
    document.querySelectorAll('.cfg-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeConfig = name;
    cfgHint.style.display = 'none';
    closeDrawer();
    const s = SCENARIOS[name];
    resetAndPlay(s.good, 'good', `${name}  ·  ${s.crisisType}`, null);
  }
}

// ─────────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────────
function fade(cb) {
  overlay.classList.add('on');
  setTimeout(() => { cb(); overlay.classList.remove('on'); }, 420);
}

function showScene(id) {
  document.querySelectorAll('.scene').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function setBanner(type, label) {
  trajBanner.style.display = 'flex';
  trajBanner.className = type === 'bad' ? 'traj-bad' : 'traj-good';
  trajBanner.textContent = type === 'bad'
    ? `⚠  BAD TRAJECTORY  —  ${label}`
    : `✓  GOOD TRAJECTORY  —  ${label}`;
}

function setIndicator(speaker) {
  indVictim.classList.toggle('visible', speaker === 'Victim');
  indAgent.classList.toggle('visible',  speaker === 'Agent');
}

function clearIndicators() {
  indVictim.classList.remove('visible');
  indAgent.classList.remove('visible');
}

// Show last 2 messages only (keeps box readable with large font)
function pushMessage(speaker, text) {
  const cls  = speaker.toLowerCase();
  const icon = cls === 'victim' ? '😰' : cls === 'agent' ? '🤖' : '⚙';
  const p = document.createElement('div');
  p.className = `dlg-line dlg-${cls}`;
  p.innerHTML = `<span class="spk">${icon} ${speaker}</span>${text}`;
  dlgScroll.appendChild(p);
  // keep last 2 messages visible
  while (dlgScroll.children.length > 2) {
    dlgScroll.removeChild(dlgScroll.firstChild);
  }
}

// ─────────────────────────────────────────────────────────────
//  CONVERSATION ENGINE  — plays once, no loop
// ─────────────────────────────────────────────────────────────
function stopConversation() {
  clearTimeout(convTimer);
  convTimer = null;
  clearIndicators();
}

function playConversation(lines, onComplete) {
  stopConversation();
  let idx = 0;

  function step() {
    if (idx >= lines.length) {
      clearIndicators();
      if (onComplete) onComplete();
      return; // done — no loop
    }
    const { speaker, text } = lines[idx];
    pushMessage(speaker, text);
    setIndicator(speaker);
    idx++;
    convTimer = setTimeout(step, 2000); // 2 second pause between messages
  }

  step(); // first message appears immediately
}

function resetAndPlay(lines, type, label, suggestedConfig) {
  fade(() => {
    dlgScroll.innerHTML = '';
    clearIndicators();
    setBanner(type, label);

    const onDone = suggestedConfig ? () => {
      // After bad trajectory: show hint and open drawer
      cfgHintName.textContent = suggestedConfig;
      cfgHint.style.display = 'block';
      setTimeout(openDrawer, 600);
    } : null;

    playConversation(lines, onDone);
  });
}

// ─────────────────────────────────────────────────────────────
//  FIRE CLICK  →  zoom  →  fire house  →  room + bad trajectory
// ─────────────────────────────────────────────────────────────
function onFireClick() {
  if (stage !== 'city') return;
  stage = 'busy';

  const cityScene = document.getElementById('s-city');
  const spot      = document.getElementById('fire-spot');
  const wrap      = document.getElementById('scene-wrap');
  const cr = wrap.getBoundingClientRect();
  const sr = spot.getBoundingClientRect();
  const ox = ((sr.left + sr.width  / 2 - cr.left) / cr.width  * 100).toFixed(1) + '%';
  const oy = ((sr.top  + sr.height / 2 - cr.top)  / cr.height * 100).toFixed(1) + '%';

  cityScene.style.transformOrigin = `${ox} ${oy}`;
  cityScene.style.transition = 'transform 0.75s ease, opacity 0.5s ease';
  cityScene.style.transform  = 'scale(4)';

  setTimeout(() => {
    fade(() => {
      showScene('s-firehouse');
      statusBar.textContent = 'SCENE: FIRE HOUSE (AERIAL)  |  STATUS: APPROACHING  |  STEP: 1 / 20';
      stage = 'firehouse';
    });
  }, 800);

  setTimeout(() => {
    fade(() => {
      showScene('s-room');
      statusBar.textContent = 'SCENE: INTERIOR  |  STATUS: ACTIVE RESCUE  |  STEP: 2 / 20';
      setBanner('bad', 'No configuration active');
      stage = 'room';

      setTimeout(() => {
        playConversation(DEFAULT_BAD.lines, () => {
          // After default bad: show hint + open drawer
          cfgHintName.textContent = DEFAULT_BAD.suggestedConfig;
          cfgHint.style.display = 'block';
          setTimeout(openDrawer, 600);
        });
      }, 500);
    });
  }, 3000);
}
