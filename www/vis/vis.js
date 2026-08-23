/* global io */
(function () {
  'use strict';

  const VIS_VERSION = '1.0.18';
  const DEFAULT_INSTANCE = 'vesync.0';

  const STATUS_LABELS = {
    enabled: 'Ein',
    powerSwitch_1: 'Power',
    mode: 'Modus',
    level: 'Stufe',
    filter_life: 'restl. Filterlebenszeit',
    filterLife: 'restl. Filterlebenszeit',
    air_quality_value: 'Luftqualität',
    air_quality: 'Luftqualität',
    pm25: 'PM2.5',
    humidity: 'Feuchte %',
    humidity_level: 'Feuchte',
    target_humidity: 'Ziel-Feuchte',
    auto_target_humidity: 'Ziel-Feuchte',
    temperature: 'Temp.',
    temp: 'Temp.',
    display: 'Display',
    child_lock: 'Kindersicherung',
    cookStatus: 'Kochstatus',
    cookSetTemp: 'Soll-Temp.',
    cookSetTime: 'Soll-Zeit',
    remainTime: 'Restzeit',
    realTimePower: 'Leistung W',
    realTimeVoltage: 'Spannung V',
    electricalEnergy: 'Energie',
    brightness: 'Helligkeit',
    workMode: 'Modus',
    fanMode: 'Lüfter',
    targetTemp: 'Ziel-Temp.',
  };

  const SELECT_OPTIONS = {
    setPurifierMode: [
      ['manual', 'Manuell'],
      ['auto', 'Auto'],
      ['sleep', 'Sleep'],
      ['pet', 'Pet'],
      ['turbo', 'Turbo'],
      ['pollen', 'Pollen'],
    ],
    setHumidityMode: [
      ['auto', 'Auto'],
      ['manual', 'Manuell'],
      ['sleep', 'Sleep'],
    ],
    setFanMode: [
      ['normal', 'Normal'],
      ['turbo', 'Turbo'],
      ['sleep', 'Sleep'],
      ['auto', 'Auto'],
    ],
    setNightLight: [
      ['off', 'Aus'],
      ['on', 'An'],
      ['dim', 'Dim'],
      ['auto', 'Auto'],
    ],
    setThermostatMode: [
      ['off', 'Aus'],
      ['heat', 'Heizen'],
      ['cool', 'Kühlen'],
      ['auto', 'Auto'],
    ],
    setThermostatFanMode: [
      ['auto', 'Auto'],
      ['on', 'An'],
      ['circulate', 'Umluft'],
    ],
    setTempUnit: [
      ['c', '°C'],
      ['f', '°F'],
    ],
    setColorMode: [
      ['white', 'Weiß'],
      ['color', 'Farbe'],
    ],
  };

  const REMOTE_LABELS = {
    setSwitch: 'ein/aus',
    setDisplay: 'Display',
    setChildLock: 'Kindersicherung',
    setPurifierMode: 'Modus',
    'setLevel-wind': 'Stärke',
    setHumidityMode: 'Modus',
    setTargetHumidity: 'Ziel-Feuchte',
    'setLevel-mist': 'Nebelstärke',
    'setLevel-warm': 'Warmstufe',
    setNightLight: 'Nachtlicht',
    setFanMode: 'Modus',
    setFanSpeed: 'Geschwindigkeit',
    setOscillation: 'Oszillation',
    setBrightness: 'Helligkeit',
    setColorTemp: 'Farbtemperatur',
    setColorHue: 'Farbton',
    setColorSaturation: 'Sättigung',
    setColorMode: 'Farbmodus',
    setDimmerBrightness: 'Helligkeit',
    setThermostatMode: 'Modus',
    setThermostatFanMode: 'Lüfter',
    setTargetTemp: 'Ziel-Temperatur',
    setTempUnit: 'Temperatureinheit',
    setLightSwitch: 'Licht',
    endCook: 'Kochen beenden',
    skipStep: 'Schritt überspringen',
  };

  const PURIFIER_MODE_OPTIONS = [
    ['niedrig', 'Niedrig', 'manual', 1],
    ['mittel', 'Mittel', 'manual', 2],
    ['hoch', 'Hoch', 'manual', 3],
    ['auto', 'Auto', 'auto', null],
    ['sleep', 'Sleep', 'sleep', null],
  ];

  const REMOTE_ORDER = [
    'setSwitch',
    'setDisplay',
    'setPurifierMode',
    'setHumidityMode',
    'setFanMode',
    'setChildLock',
    'setLevel-wind',
    'setLevel-mist',
    'setLevel-warm',
    'setTargetHumidity',
    'setFanSpeed',
    'setNightLight',
    'setOscillation',
    'setBrightness',
    'setDimmerBrightness',
    'setColorMode',
    'setColorTemp',
    'setColorHue',
    'setColorSaturation',
    'setThermostatMode',
    'setThermostatFanMode',
    'setTargetTemp',
    'setTempUnit',
    'setLightSwitch',
    'endCook',
    'skipStep',
  ];

  const SKIP_REMOTES = new Set([
    'Refresh',
    'startCook',
    'cookMode',
    'startMultiCook',
    'preheatCook',
    'setTimeOrTemp',
    'startStepCook',
    'setProperty',
  ]);

  const SKIP_DEVICE_IDS = new Set(['info', 'healthData', 'terminalId']);

  /** @type {import('socket.io-client').Socket | null} */
  let socket = null;
  let instance = detectInstance();
  /** @type {Record<string, any>} */
  let objects = {};
  /** @type {Record<string, { val: any; ack?: boolean }>} */
  let states = {};
  let selectedCid = null;
  let connected = false;

  const el = {
    version: document.getElementById('version'),
    connection: document.getElementById('connection'),
    error: document.getElementById('error'),
    deviceList: document.getElementById('device-list'),
    deviceDetail: document.getElementById('device-detail'),
    btnRefresh: document.getElementById('btn-refresh'),
    btnTheme: document.getElementById('btn-theme'),
  };

  el.version.textContent = `v${VIS_VERSION}`;

  function detectInstance() {
    const m = window.location.pathname.match(/\/adapter\/([^/]+)\//i);
    return m ? m[1] : DEFAULT_INSTANCE;
  }

  function showError(msg) {
    if (!msg) {
      el.error.classList.add('hidden');
      el.error.textContent = '';
      return;
    }
    el.error.textContent = msg;
    el.error.classList.remove('hidden');
  }

  function setConnectionBadge(online) {
    connected = online;
    el.connection.textContent = online ? 'Online' : 'Offline';
    el.connection.className = `vis-badge ${online ? 'vis-badge-online' : 'vis-badge-offline'}`;
  }

  function formatValue(val, key) {
    if (typeof val === 'boolean') return val ? 'An' : 'Aus';
    if (typeof val === 'number') {
      const formatted = Number.isInteger(val) ? String(val) : val.toFixed(1);
      if (key === 'filter_life' || key === 'filterLife') return `${formatted} %`;
      return formatted;
    }
    if (val == null || val === '') return '—';
    if ((key === 'filter_life' || key === 'filterLife') && val !== '—') return `${val} %`;
    return String(val);
  }

  function statusLabel(key) {
    return STATUS_LABELS[key] || key;
  }

  function parseDevices() {
    /** @type {Record<string, any>} */
    const devices = {};

    for (const [id, obj] of Object.entries(objects)) {
      const parts = id.split('.');
      if (parts.length !== 3 || parts[0] !== instance.split('.')[0] || parts[1] !== instance.split('.')[1]) {
        continue;
      }
      const cid = parts[2];
      if (SKIP_DEVICE_IDS.has(cid)) continue;
      if (obj?.type === 'device' || obj?.type === 'channel') {
        if (!devices[cid]) devices[cid] = { cid, name: obj.common?.name || cid, status: {}, remotes: {}, meta: {} };
        else if (obj.common?.name) devices[cid].name = obj.common.name;
      }
    }

    for (const [id, st] of Object.entries(states)) {
      const parts = id.split('.');
      if (parts.length < 4) continue;
      if (`${parts[0]}.${parts[1]}` !== instance) continue;
      const cid = parts[2];
      if (SKIP_DEVICE_IDS.has(cid)) continue;
      if (!devices[cid]) devices[cid] = { cid, name: cid, status: {}, remotes: {}, meta: {} };

      if (parts[3] === 'general' && parts[4]) {
        devices[cid].meta[parts[4]] = st.val;
        if (parts[4] === 'deviceName' && st.val) devices[cid].name = String(st.val);
        if (parts[4] === 'deviceType') devices[cid].deviceType = String(st.val);
      } else if (parts[3] === 'status' && parts[4]) {
        devices[cid].status[parts.slice(4).join('.')] = st.val;
      } else if (parts[3] === 'remote' && parts[4]) {
        devices[cid].remotes[parts[4]] = {
          val: st.val,
          stateId: id,
          cid,
          object: objects[id]?.common || {},
        };
      }
    }

    return Object.values(devices).sort((a, b) => a.name.localeCompare(b.name, 'de'));
  }

  function pickStatus(status) {
    const keys = Object.keys(STATUS_LABELS);
    /** @type {Record<string, any>} */
    const out = {};
    for (const k of keys) {
      if (status[k] !== undefined && status[k] !== null && status[k] !== '') out[k] = status[k];
    }
    if (Object.keys(out).length === 0) {
      for (const [k, v] of Object.entries(status)) {
        if (typeof v === 'object') continue;
        out[k] = v;
        if (Object.keys(out).length >= 8) break;
      }
    }
    return out;
  }

  function isEnabled(device) {
    const s = device.status;
    const candidates = [s.enabled, s.powerSwitch_1, device.remotes.setSwitch?.val];
    for (const c of candidates) {
      if (typeof c === 'boolean') return c;
      if (c === 1 || c === '1' || c === 'true') return true;
      if (c === 0 || c === '0' || c === 'false') return false;
    }
    return null;
  }

  function getPurifierProfile(deviceType, meta) {
    const type = String(deviceType || meta?.deviceType || '').toUpperCase();
    const config = String(meta?.configModule || '').toUpperCase();
    const name = String(meta?.deviceName || '').toUpperCase();
    const id = `${type} ${config} ${name}`;

    if (/CORE\s*200|CORE200|LAP-C20[0-9]|C201/.test(id)) {
      return { modes: ['manual', 'auto', 'sleep'], windMax: 3, nightLight: false };
    }
    if (/CORE\s*300|CORE300|LAP-C30[0-9]|C301|C302/.test(id)) {
      return { modes: ['manual', 'auto', 'sleep'], windMax: 3, nightLight: false };
    }
    if (/CORE\s*400|CORE400|LAP-C40[0-9]|C401/.test(id)) {
      return { modes: ['manual', 'auto', 'sleep'], windMax: 4, nightLight: true };
    }
    if (/CORE\s*600|CORE600|LAP-C60[0-9]|C601/.test(id)) {
      return { modes: ['manual', 'auto', 'sleep'], windMax: 4, nightLight: true };
    }
    if (/VITAL|100S|200S/.test(id)) {
      return { modes: ['manual', 'auto', 'sleep', 'pet'], windMax: 4, nightLight: false };
    }
    if (/EVEREST/.test(id)) {
      return { modes: ['manual', 'auto', 'sleep', 'turbo'], windMax: 4, nightLight: false };
    }
    if (/LV-PUR131|PUR131/.test(id)) {
      return { modes: ['manual', 'auto', 'sleep'], windMax: 3, nightLight: false };
    }
    return { modes: ['manual', 'auto', 'sleep', 'pet', 'turbo', 'pollen'], windMax: 12, nightLight: true };
  }

  function categoryLabel(deviceType) {
    if (!deviceType) return 'Gerät';
    if (deviceType.startsWith('LAP-') || deviceType.includes('Core')) return 'Luftreiniger';
    if (deviceType.includes('LUH-') || deviceType.includes('Classic') || deviceType.includes('LV600')) {
      return 'Luftbefeuchter';
    }
    if (deviceType.startsWith('CA') || deviceType.startsWith('CS')) return 'Heißluftfritteuse';
    if (deviceType.startsWith('ESW') || deviceType.startsWith('ESO')) return 'Steckdose';
    if (deviceType.startsWith('ESL')) return 'Lampe';
    if (deviceType.startsWith('LTM-')) return 'Thermostat';
    return 'Gerät';
  }

  function render() {
    const devices = parseDevices();
    if (!devices.length) {
      el.deviceList.innerHTML = '';
      el.deviceDetail.innerHTML = '<p class="vis-empty">Keine VeSync-Geräte gefunden.</p>';
      return;
    }

    if (!selectedCid || !devices.some((d) => d.cid === selectedCid)) {
      selectedCid = devices[0].cid;
    }

    el.deviceList.innerHTML = devices
      .map((d) => {
        const enabled = isEnabled(d);
        return `<button type="button" class="vis-device-item ${d.cid === selectedCid ? 'active' : ''}" data-cid="${escapeHtml(d.cid)}">
          <div class="vis-device-name">${escapeHtml(d.name)}</div>
          <div class="vis-device-meta">
            <span>${escapeHtml(categoryLabel(d.deviceType || d.meta.deviceType))}</span>
            <span>${enabled == null ? '' : enabled ? 'An' : 'Aus'}</span>
          </div>
        </button>`;
      })
      .join('');

    el.deviceList.querySelectorAll('.vis-device-item').forEach((btn) => {
      btn.addEventListener('click', () => {
        selectedCid = btn.getAttribute('data-cid');
        renderDetail(parseDevices().find((d) => d.cid === selectedCid));
        render();
      });
    });

    renderDetail(devices.find((d) => d.cid === selectedCid));
  }

  function renderDetail(device) {
    if (!device) {
      el.deviceDetail.innerHTML = '<p class="vis-empty">Kein Gerät ausgewählt.</p>';
      return;
    }

    const status = pickStatus(device.status);
    const statusHtml = Object.entries(status)
      .slice(0, 8)
      .map(
        ([k, v]) => `<div class="vis-status-tile">
          <div class="vis-status-label">${escapeHtml(statusLabel(k))}</div>
          <div class="vis-status-value">${escapeHtml(formatValue(v, k))}</div>
        </div>`,
      )
      .join('');

    const controlsHtml = sortRemoteEntries(Object.entries(device.remotes))
      .filter(([cmd]) => !SKIP_REMOTES.has(cmd))
      .map(([cmd, remote]) => {
        if (usesFanStageControl(device)) {
          if (cmd === 'setLevel-wind') return '';
          if (cmd === 'setPurifierMode') return renderFanStageControl(device);
        }
        return renderControl(device, cmd, remote);
      })
      .join('');

    el.deviceDetail.innerHTML = `
      <h2 class="vis-detail-title">${escapeHtml(device.name)}</h2>
      <p class="vis-detail-sub">${escapeHtml(categoryLabel(device.deviceType || device.meta.deviceType))}${device.deviceType || device.meta.deviceType ? ` · ${escapeHtml(String(device.deviceType || device.meta.deviceType))}` : ''}</p>
      ${statusHtml ? `<div class="vis-status-grid">${statusHtml}</div>` : ''}
      <div class="vis-controls">${controlsHtml || '<p class="vis-empty">Keine steuerbaren Remotes vorhanden.</p>'}</div>
    `;

    bindControls(device.cid);
  }

  function sortRemoteEntries(entries) {
    return entries.sort(([a], [b]) => {
      const indexA = REMOTE_ORDER.indexOf(a);
      const indexB = REMOTE_ORDER.indexOf(b);
      if (indexA === -1 && indexB === -1) return a.localeCompare(b, 'de');
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
  }

  function isPurifier(device) {
    const deviceType = String(device.deviceType || device.meta?.deviceType || '');
    return categoryLabel(deviceType) === 'Luftreiniger';
  }

  function usesFanStageControl(device) {
    if (!isPurifier(device)) return false;
    if (!device.remotes.setPurifierMode || !device.remotes['setLevel-wind']) return false;
    const profile = getPurifierProfile(device.deviceType, device.meta);
    return profile.modes.includes('manual') && profile.windMax === 3;
  }

  function getFanStage(device) {
    const mode = String(device.remotes.setPurifierMode?.val ?? '');
    const level = Number(device.remotes['setLevel-wind']?.val);
    for (const [stage, , stageMode, stageLevel] of PURIFIER_MODE_OPTIONS) {
      if (stageLevel == null) {
        if (mode === stageMode) return stage;
        continue;
      }
      if (mode === stageMode && level === stageLevel) return stage;
    }
    return '';
  }

  function renderFanStageControl(device) {
    const cid = device.cid;
    const current = getFanStage(device);
    const buttons = PURIFIER_MODE_OPTIONS.map(
      ([value, text]) =>
        `<button type="button" class="vis-btn vis-stage-btn ${current === value ? 'active' : ''}" data-action="fan-stage" data-stage="${escapeHtml(value)}" data-cid="${escapeHtml(cid)}">${escapeHtml(text)}</button>`,
    ).join('');
    return `<div class="vis-control vis-control-column vis-control-span-2">
      <span class="vis-control-label">Modus</span>
      <div class="vis-stage-group">${buttons}</div>
    </div>`;
  }

  function getSelectOptions(cmd, device, remote) {
    const common = remote?.object || {};
    if (common.states && typeof common.states === 'object' && !Array.isArray(common.states)) {
      return Object.entries(common.states).map(([value, text]) => [value, String(text)]);
    }

    if (cmd === 'setPurifierMode') {
      const profile = getPurifierProfile(device.deviceType, device.meta);
      const modeLabels = {
        manual: 'manual',
        auto: 'auto',
        sleep: 'sleep',
        pet: 'pet',
        turbo: 'turbo',
        pollen: 'pollen',
      };
      return profile.modes.map((value) => [value, modeLabels[value] || value]);
    }
    return SELECT_OPTIONS[cmd] || null;
  }

  function getControlLabel(cmd) {
    return REMOTE_LABELS[cmd] || cmd;
  }

  function renderControl(device, cmd, remote) {
    const cid = device.cid;
    const common = remote.object || {};
    const label = getControlLabel(cmd);
    const val = remote.val;
    const type = common.type || 'boolean';
    const role = common.role || '';

    if (type === 'boolean' || role === 'switch') {
      const on = val === true || val === 1 || val === 'true';
      return `<div class="vis-control"><span class="vis-control-label">${escapeHtml(label)}</span>
        <label class="vis-switch"><input type="checkbox" data-action="switch" data-cid="${escapeHtml(cid)}" data-cmd="${escapeHtml(cmd)}" ${on ? 'checked' : ''}><span class="vis-switch-slider"></span></label></div>`;
    }

    const selectOptions = getSelectOptions(cmd, device, remote);
    if (selectOptions) {
      const opts = selectOptions
        .map(
          ([value, text]) =>
            `<option value="${escapeHtml(value)}" ${String(val) === value ? 'selected' : ''}>${escapeHtml(text)}</option>`,
        )
        .join('');
      return `<div class="vis-control vis-control-column"><span class="vis-control-label">${escapeHtml(label)}</span>
        <select class="vis-select" data-action="select" data-cid="${escapeHtml(cid)}" data-cmd="${escapeHtml(cmd)}">${opts}</select></div>`;
    }

    if (type === 'number' || role.startsWith('level')) {
      let min = common.min != null ? common.min : 1;
      let max = common.max != null ? common.max : '';
      if (max === '' && cmd === 'setLevel-wind' && isPurifier(device)) {
        max = getPurifierProfile(device.deviceType, device.meta).windMax;
      }
      return `<div class="vis-control vis-control-column"><span class="vis-control-label">${escapeHtml(label)}</span>
        <div class="vis-input-row">
          <input class="vis-input" type="number" value="${escapeHtml(String(val ?? ''))}" min="${min}"${max ? ` max="${max}"` : ''} data-action="number" data-cid="${escapeHtml(cid)}" data-cmd="${escapeHtml(cmd)}">
          <button type="button" class="vis-btn vis-btn-outline vis-touch-sm" data-action="number-commit" data-cid="${escapeHtml(cid)}" data-cmd="${escapeHtml(cmd)}">OK</button>
        </div></div>`;
    }

    if (role === 'json') {
      return '';
    }

    return `<div class="vis-control vis-control-column"><span class="vis-control-label">${escapeHtml(label)}</span>
      <div class="vis-input-row">
        <input class="vis-input" type="text" value="${escapeHtml(String(val ?? ''))}" data-action="text" data-cid="${escapeHtml(cid)}" data-cmd="${escapeHtml(cmd)}">
        <button type="button" class="vis-btn vis-btn-outline vis-touch-sm" data-action="text-commit" data-cid="${escapeHtml(cid)}" data-cmd="${escapeHtml(cmd)}">OK</button>
      </div></div>`;
  }

  function bindControls(cid) {
    el.deviceDetail.querySelectorAll('[data-action="switch"]').forEach((input) => {
      input.addEventListener('change', () => {
        setRemote(input.getAttribute('data-cid'), input.getAttribute('data-cmd'), input.checked);
      });
    });

    el.deviceDetail.querySelectorAll('[data-action="select"]').forEach((select) => {
      select.addEventListener('change', () => {
        setRemote(select.getAttribute('data-cid'), select.getAttribute('data-cmd'), select.value);
      });
    });

    el.deviceDetail.querySelectorAll('[data-action="pulse"]').forEach((btn) => {
      btn.addEventListener('click', () => {
        setRemote(btn.getAttribute('data-cid'), btn.getAttribute('data-cmd'), true);
      });
    });

    el.deviceDetail.querySelectorAll('[data-action="number-commit"]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const input = el.deviceDetail.querySelector(
          `input[data-action="number"][data-cmd="${btn.getAttribute('data-cmd')}"]`,
        );
        if (!input) return;
        let value = Number(input.value);
        const max = input.max ? Number(input.max) : null;
        const min = input.min ? Number(input.min) : null;
        if (max != null && !Number.isNaN(max)) value = Math.min(value, max);
        if (min != null && !Number.isNaN(min)) value = Math.max(value, min);
        setRemote(btn.getAttribute('data-cid'), btn.getAttribute('data-cmd'), value);
      });
    });

    el.deviceDetail.querySelectorAll('[data-action="fan-stage"]').forEach((btn) => {
      btn.addEventListener('click', () => {
        setFanStage(btn.getAttribute('data-cid'), btn.getAttribute('data-stage'));
      });
    });

    el.deviceDetail.querySelectorAll('[data-action="text-commit"]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const input = el.deviceDetail.querySelector(
          `input[data-action="text"][data-cmd="${btn.getAttribute('data-cmd')}"]`,
        );
        if (!input) return;
        setRemote(btn.getAttribute('data-cid'), btn.getAttribute('data-cmd'), input.value);
      });
    });
  }

  function setRemote(cid, cmd, value, callback) {
    if (!socket || !connected) {
      showError('Keine Verbindung zu ioBroker.');
      if (callback) callback('offline');
      return;
    }
    const stateId = `${instance}.${cid}.remote.${cmd}`;
    socket.emit('setState', stateId, value, (err) => {
      if (err) {
        showError(`Steuerung fehlgeschlagen: ${err}`);
        if (callback) callback(err);
        return;
      }
      showError('');
      if (cmd === 'Refresh') {
        setTimeout(loadAll, 1500);
      }
      if (callback) callback(null);
    });
  }

  function setFanStage(cid, stage) {
    const entry = PURIFIER_MODE_OPTIONS.find(([value]) => value === stage);
    if (!entry) return;
    const [, , mode, level] = entry;
    setRemote(cid, 'setPurifierMode', mode, (err) => {
      if (err) return;
      if (level == null) return;
      setRemote(cid, 'setLevel-wind', level);
    });
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function loadAll() {
    if (!socket) return;
    const pattern = `${instance}.*`;
    socket.emit('getObjects', pattern, (errObj, resObj) => {
      if (errObj) {
        showError(`Objekte: ${errObj}`);
        return;
      }
      objects = resObj || {};
      socket.emit('getStates', pattern, (errSt, resSt) => {
        if (errSt) {
          showError(`States: ${errSt}`);
          return;
        }
        states = resSt || {};
        showError('');
        render();
      });
    });
  }

  function connect() {
    if (typeof io === 'undefined') {
      showError('socket.io nicht geladen. Web-Adapter aktiv? Seite über ioBroker (Port 8082) öffnen.');
      setConnectionBadge(false);
      return;
    }

    socket = io.connect(window.location.origin, { path: '/socket.io', transports: ['websocket', 'polling'] });

    socket.on('connect', () => {
      setConnectionBadge(true);
      showError('');
      socket.emit('subscribeStates', `${instance}.*`);
      socket.emit('getState', `${instance}.info.connection`, (err, res) => {
        if (!err && res) setConnectionBadge(!!res.val);
      });
      loadAll();
    });

    socket.on('disconnect', () => {
      setConnectionBadge(false);
    });

    socket.on('stateChange', (id, state) => {
      if (!id.startsWith(`${instance}.`)) return;
      states[id] = state;
      if (id === `${instance}.info.connection`) setConnectionBadge(!!state.val);
      render();
    });
  }

  el.btnRefresh.addEventListener('click', () => {
    const devices = parseDevices();
    const device = devices.find((d) => d.cid === selectedCid) || devices[0];
    if (device) setRemote(device.cid, 'Refresh', true);
    else loadAll();
  });

  el.btnTheme.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    el.btnTheme.textContent = document.body.classList.contains('dark') ? '☀' : '☾';
  });

  connect();
})();
