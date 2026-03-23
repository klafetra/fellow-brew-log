import { useState, useEffect } from "react";

const AMBER = "#E6A740";
const AMBER_DIM = "rgba(230,167,64,0.15)";
const COPPER = "#C87533";
const COPPER_LIGHT = "#D4945A";
const COPPER_DIM = "rgba(200,117,51,0.15)";
const BG = "#000000";
const SURFACE = "#1C1C1E";
const SURFACE2 = "#2C2C2E";
const BORDER = "rgba(255,255,255,0.08)";
const TEXT = "#F5F5F5";
const TEXT_MED = "#ABABAB";
const TEXT_DIM = "#6E6E6E";

const cToF = (c) => Math.round(c * 9 / 5 + 32);
const fToC = (f) => Math.round((f - 32) * 5 / 9);

const initialBeans = [
  { id: 1, name: "Worka Sakaro", roaster: "Onyx Coffee Lab", origin: "Ethiopia", process: "Natural", roast: "Light" },
  { id: 2, name: "La Palma y El Tucán", roaster: "Fellow Drops", origin: "Colombia", process: "Washed", roast: "Medium" },
  { id: 3, name: "Heartbreaker", roaster: "Proud Mary", origin: "Blend", process: "Mixed", roast: "Medium" },
];

const initialRecipes = {
  1: {
    name: "Worka Sakaro — dialing in",
    temperature: "Mixed",
    ratio: "1:16",
    coldBrew: false,
    bloomEnabled: true,
    bloomRatio: "1:2",
    bloomTime: 40,
    bloomTemp: 93, // stored in C
    ssPulses: 3,
    ssInterval: 23,
    ssPulseTemps: [93, 92, 92],
    batchPulses: 1,
    batchInterval: 30,
    batchPulseTemps: [96],
    dose: 15,
    water: 240,
    grind: 5.5,
    personalNotes: "Still dialing in. Needs more body — going finer next time.",
    flavorTags: ["Under-extracted", "Bright", "Fruity"],
  },
  2: {
    name: "La Palma — dialed",
    temperature: "Mixed",
    ratio: "1:16",
    coldBrew: false,
    bloomEnabled: true,
    bloomRatio: "1:2",
    bloomTime: 45,
    bloomTemp: 96,
    ssPulses: 4,
    ssInterval: 20,
    ssPulseTemps: [96, 95, 95, 94],
    batchPulses: 1,
    batchInterval: 25,
    batchPulseTemps: [96],
    dose: 15,
    water: 240,
    grind: 5.0,
    personalNotes: "Pretty dialed. Clean and sweet at this setting.",
    flavorTags: ["Sweet", "Clean", "Balanced"],
  },
  3: {
    name: "Heartbreaker — starting",
    temperature: "High",
    ratio: "1:17",
    coldBrew: false,
    bloomEnabled: true,
    bloomRatio: "1:2",
    bloomTime: 35,
    bloomTemp: 95,
    ssPulses: 3,
    ssInterval: 22,
    ssPulseTemps: [95, 94, 94],
    batchPulses: 1,
    batchInterval: 28,
    batchPulseTemps: [96],
    dose: 15,
    water: 255,
    grind: 5.75,
    personalNotes: "",
    flavorTags: [],
  },
};

const sampleLogs = [
  {
    id: 1, beanId: 1, date: "Mar 22", dose: 15, water: 240, ratio: "1:16", grind: 6.0,
    bloomTemp: 96, bloomTime: 30, ssPulses: 3, ssInterval: 23,
    notes: "Bright and juicy but slightly under-extracted. Blueberry notes but thin body.", rating: 3.5,
    flavorTags: ["Under-extracted", "Too weak", "Bright", "Fruity"],
  },
  {
    id: 2, beanId: 1, date: "Mar 20", dose: 15, water: 240, ratio: "1:16", grind: 5.5,
    bloomTemp: 94, bloomTime: 30, ssPulses: 3, ssInterval: 25,
    notes: "More balanced after grind adjustment. Berry sweetness coming through. Still want more body.", rating: 4,
    flavorTags: ["Sweet", "Fruity", "Too weak"],
  },
  {
    id: 3, beanId: 2, date: "Mar 19", dose: 15, water: 240, ratio: "1:16", grind: 5.0,
    bloomTemp: 96, bloomTime: 45, ssPulses: 4, ssInterval: 20,
    notes: "Clean and sweet. Caramel and citrus. Dialed in nicely for this washed Colombian.", rating: 4.5,
    flavorTags: ["Sweet", "Clean", "Balanced", "Smooth"],
  },
];

const aiResponse = {
  summary: "Your Worka Sakaro brews show improving extraction but the thin body suggests you can push further. Natural Ethiopians benefit from higher contact time.",
  tweaks: [
    { param: "Grind (Opus)", field: "grind", current: "6.0", suggested: 5.5, unit: "", reason: "Finer grind increases extraction, building body without losing brightness" },
    { param: "Bloom temp", field: "bloomTemp", current: "200°F", suggested: 97, unit: "°", reason: "Slightly hotter bloom helps degas naturals and improves evenness" },
    { param: "Bloom time", field: "bloomTime", current: "40s", suggested: 45, unit: "s", reason: "Extended bloom for natural process allows more CO₂ release" },
    { param: "SS pulse interval", field: "ssInterval", current: "23s", suggested: 28, unit: "s", reason: "Longer intervals between pulses = more drawdown time = fuller body" },
  ],
  confidence: "High — based on 2 brews with consistent pattern"
};

// ── UI Components ──

function Chevron() {
  return (
    <svg width="8" height="14" viewBox="0 0 8 14" fill="none" style={{ marginLeft: 8, flexShrink: 0 }}>
      <path d="M1 1l5.5 6L1 13" stroke={TEXT_DIM} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Toggle({ on, onToggle, color }) {
  return (
    <div onClick={onToggle} style={{
      width: 44, height: 26, borderRadius: 13, padding: 2,
      background: on ? (color || AMBER) : "#39393D",
      cursor: "pointer", transition: "background 0.2s", flexShrink: 0,
    }}>
      <div style={{
        width: 22, height: 22, borderRadius: 11, background: "#fff",
        transform: on ? "translateX(18px)" : "translateX(0)",
        transition: "transform 0.2s",
      }} />
    </div>
  );
}

function SectionHeader({ title, description }) {
  return (
    <div style={{ padding: "24px 0 8px" }}>
      <div style={{ fontSize: 16, fontWeight: 500, color: TEXT, marginBottom: description ? 6 : 0 }}>{title}</div>
      {description && <div style={{ fontSize: 13, color: TEXT_DIM, lineHeight: 1.5 }}>{description}</div>}
    </div>
  );
}

function SettingRow({ label, value, onClick, isLast, suffix }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "14px 0",
        borderBottom: isLast ? "none" : `0.5px solid ${BORDER}`,
        cursor: onClick ? "pointer" : "default",
      }}
    >
      <span style={{ fontSize: 15, color: TEXT }}>{label}</span>
      <div style={{ display: "flex", alignItems: "center" }}>
        <span style={{ fontSize: 15, color: TEXT_DIM }}>{value}{suffix || ""}</span>
        {onClick && <Chevron />}
      </div>
    </div>
  );
}

function ToggleRow({ label, on, onToggle, isLast }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "14px 0",
      borderBottom: isLast ? "none" : `0.5px solid ${BORDER}`,
    }}>
      <span style={{ fontSize: 15, color: TEXT }}>{label}</span>
      <Toggle on={on} onToggle={onToggle} />
    </div>
  );
}

function Stars({ rating }) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <div style={{ display: "flex", gap: 2, alignItems: "center" }}>
      {[...Array(5)].map((_, i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 20 20">
          <path d="M10 1l2.47 5.01L18 6.94l-4 3.9.94 5.5L10 13.77l-4.94 2.6.94-5.5-4-3.9 5.53-.93z"
            fill={i < full ? COPPER : i === full && half ? `url(#half${i})` : "#3A3A3A"} stroke="none" />
          {i === full && half && (<defs><linearGradient id={`half${i}`}><stop offset="50%" stopColor={COPPER} /><stop offset="50%" stopColor="#3A3A3A" /></linearGradient></defs>)}
        </svg>
      ))}
      <span style={{ fontSize: 12, color: TEXT_DIM, marginLeft: 4 }}>{rating}</span>
    </div>
  );
}

function Badge({ children, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      background: active ? COPPER_DIM : SURFACE, color: active ? COPPER_LIGHT : TEXT_MED,
      border: `1px solid ${active ? COPPER : "rgba(255,255,255,0.1)"}`, borderRadius: 20,
      padding: "6px 14px", fontSize: 13, cursor: "pointer", transition: "all 0.2s", fontFamily: "inherit",
    }}>{children}</button>
  );
}

function TempToggle({ useFahrenheit, onToggle }) {
  return (
    <button onClick={onToggle} style={{
      background: SURFACE, border: `1px solid rgba(255,255,255,0.1)`, borderRadius: 8,
      padding: "4px 2px", display: "flex", gap: 0, cursor: "pointer", fontFamily: "inherit",
    }}>
      {["°F", "°C"].map(unit => (
        <span key={unit} style={{
          fontSize: 12, padding: "3px 10px", borderRadius: 6,
          background: (unit === "°F" ? useFahrenheit : !useFahrenheit) ? AMBER_DIM : "transparent",
          color: (unit === "°F" ? useFahrenheit : !useFahrenheit) ? AMBER : TEXT_DIM,
          transition: "all 0.2s",
        }}>{unit}</span>
      ))}
    </button>
  );
}

function tempDisplay(c, useFahrenheit) {
  return useFahrenheit ? `${cToF(c)} °F` : `${c} °C`;
}

// ── Value Picker Modal ──

function ValuePicker({ title, value, onChange, onClose, min, max, step, suffix, useFahrenheit, isTemp }) {
  const displayVal = isTemp && useFahrenheit ? cToF(value) : value;
  const displayMin = isTemp && useFahrenheit ? cToF(min) : min;
  const displayMax = isTemp && useFahrenheit ? cToF(max) : max;
  const [editing, setEditing] = useState(false);
  const [inputVal, setInputVal] = useState(String(displayVal));

  useEffect(() => { setInputVal(String(displayVal)); }, [displayVal]);

  const handleChange = (newVal) => {
    const clamped = Math.min(displayMax, Math.max(displayMin, newVal));
    if (isTemp && useFahrenheit) {
      onChange(fToC(clamped));
    } else {
      onChange(clamped);
    }
  };

  const commitInput = () => {
    const parsed = parseFloat(inputVal);
    if (!isNaN(parsed)) handleChange(parsed);
    setEditing(false);
  };

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "flex-end",
      justifyContent: "center", zIndex: 200,
    }} onClick={onClose}>
      <div style={{
        background: "#1C1C1E", borderRadius: "16px 16px 0 0", width: "100%", maxWidth: 420,
        padding: "20px 24px 40px",
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <span style={{ fontSize: 17, fontWeight: 500, color: TEXT }}>{title}</span>
          <button onClick={onClose} style={{
            background: AMBER, border: "none", color: "#000", borderRadius: 8,
            padding: "6px 16px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
          }}>Done</button>
        </div>

        {/* Tappable number display / inline input */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          {editing ? (
            <input
              autoFocus
              type="number"
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              onBlur={commitInput}
              onKeyDown={e => { if (e.key === "Enter") commitInput(); }}
              step={step || 1}
              style={{
                width: 140, fontSize: 48, fontWeight: 300, color: AMBER,
                background: "transparent", border: "none",
                borderBottom: `2px solid ${AMBER}`,
                textAlign: "center", fontFamily: "inherit", outline: "none",
              }}
            />
          ) : (
            <span onClick={() => { setInputVal(String(displayVal)); setEditing(true); }}
              style={{ fontSize: 48, fontWeight: 300, color: TEXT, cursor: "text" }}>
              {displayVal}
            </span>
          )}
          <span style={{ fontSize: 20, color: TEXT_DIM, marginLeft: 4 }}>{suffix || ""}</span>
          {!editing && (
            <div style={{ fontSize: 11, color: TEXT_DIM, marginTop: 4 }}>tap number to type</div>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => handleChange(displayVal - (step || 1))} style={{
            width: 44, height: 44, borderRadius: 22, background: SURFACE2, border: "none",
            color: TEXT, fontSize: 24, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          }}>−</button>
          <input
            type="range"
            min={displayMin} max={displayMax} step={step || 1} value={displayVal}
            onChange={e => handleChange(Number(e.target.value))}
            style={{ flex: 1, accentColor: AMBER }}
          />
          <button onClick={() => handleChange(displayVal + (step || 1))} style={{
            width: 44, height: 44, borderRadius: 22, background: SURFACE2, border: "none",
            color: TEXT, fontSize: 24, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          }}>+</button>
        </div>
      </div>
    </div>
  );
}

function OptionPicker({ title, options, value, onChange, onClose }) {
  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "flex-end",
      justifyContent: "center", zIndex: 200,
    }} onClick={onClose}>
      <div style={{
        background: "#1C1C1E", borderRadius: "16px 16px 0 0", width: "100%", maxWidth: 420,
        padding: "20px 24px 40px", maxHeight: "60vh", overflowY: "auto",
      }} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 17, fontWeight: 500, color: TEXT, marginBottom: 16 }}>{title}</div>
        {options.map(opt => (
          <div key={opt} onClick={() => { onChange(opt); onClose(); }} style={{
            padding: "14px 0", borderBottom: `0.5px solid ${BORDER}`,
            display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer",
          }}>
            <span style={{ fontSize: 15, color: TEXT }}>{opt}</span>
            {value === opt && <span style={{ color: AMBER, fontSize: 18 }}>✓</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Flavor Tags ──

const PROBLEM_TAGS = ["Too bitter", "Too sour", "Too weak", "Too strong", "Under-extracted", "Over-extracted", "Astringent", "Flat"];
const POSITIVE_TAGS = ["Sweet", "Balanced", "Bright", "Fruity", "Clean", "Full body", "Complex", "Smooth", "Floral", "Nutty", "Chocolatey"];

function FlavorTag({ label, active, isPositive, onClick }) {
  const posColor = "#4CAF50";
  const negColor = "#E57373";
  const color = isPositive ? posColor : negColor;
  return (
    <button onClick={onClick} style={{
      background: active ? (isPositive ? "rgba(76,175,80,0.15)" : "rgba(229,115,115,0.15)") : "transparent",
      border: `1px solid ${active ? color : "rgba(255,255,255,0.1)"}`,
      color: active ? color : TEXT_DIM,
      borderRadius: 16, padding: "5px 12px", fontSize: 12, cursor: "pointer",
      fontFamily: "inherit", transition: "all 0.15s",
    }}>{label}</button>
  );
}

function FlavorTags({ selected, onChange }) {
  const toggle = (tag) => {
    if (selected.includes(tag)) {
      onChange(selected.filter(t => t !== tag));
    } else {
      onChange([...selected, tag]);
    }
  };

  return (
    <div style={{ paddingBottom: 12 }}>
      <div style={{ fontSize: 12, color: "#E57373", marginBottom: 6, fontWeight: 500 }}>Issues</div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
        {PROBLEM_TAGS.map(tag => (
          <FlavorTag key={tag} label={tag} active={selected.includes(tag)} isPositive={false} onClick={() => toggle(tag)} />
        ))}
      </div>
      <div style={{ fontSize: 12, color: "#4CAF50", marginBottom: 6, fontWeight: 500 }}>Positives</div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {POSITIVE_TAGS.map(tag => (
          <FlavorTag key={tag} label={tag} active={selected.includes(tag)} isPositive={true} onClick={() => toggle(tag)} />
        ))}
      </div>
    </div>
  );
}

// ── Recipe Card (Fellow-style) ──

function RecipeCard({ recipe, bean, useFahrenheit, onUpdate }) {
  const [picker, setPicker] = useState(null);
  const [draft, setDraft] = useState({ ...recipe });
  const [saved, setSaved] = useState(false);

  // Check if draft differs from saved recipe
  const hasChanges = JSON.stringify(draft) !== JSON.stringify(recipe);

  const update = (field, val) => {
    setDraft(d => ({ ...d, [field]: val }));
    setSaved(false);
  };

  const updatePulseTemp = (type, idx, val) => {
    const key = type === "ss" ? "ssPulseTemps" : "batchPulseTemps";
    setDraft(d => {
      const temps = [...d[key]];
      temps[idx] = val;
      return { ...d, [key]: temps };
    });
    setSaved(false);
  };

  const handleSave = () => {
    onUpdate(bean.id, draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // Use draft for display
  const r = draft;

  return (
    <div style={{
      background: SURFACE, borderRadius: 14, padding: "0 18px", marginBottom: 16,
      border: `1px solid rgba(255,255,255,0.06)`,
    }}>
      {/* Header */}
      <div style={{ padding: "16px 0 0" }}>
        <div style={{ fontSize: 11, color: AMBER, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 4 }}>My recipe</div>
        <div style={{ fontSize: 13, color: TEXT_DIM, marginBottom: 2 }}>{bean.roaster} · {bean.origin} · {bean.process}</div>
      </div>

      {/* Profile name */}
      <div style={{
        background: SURFACE2, borderRadius: 10, padding: "12px 14px", margin: "12px 0",
        border: `0.5px solid ${BORDER}`,
      }}>
        <span style={{ fontSize: 15, color: TEXT }}>{r.name}</span>
      </div>

      {/* Brew params (our addition) */}
      <SectionHeader title="Brew parameters" description="Your dose and grind for this bean." />
      <SettingRow label="Dose" value={`${r.dose}g`} onClick={() => setPicker({ field: "dose", title: "Dose", min: 10, max: 60, step: 0.5, suffix: "g" })} />
      <SettingRow label="Water" value={`${r.water}g`} onClick={() => setPicker({ field: "water", title: "Water", min: 100, max: 1000, step: 5, suffix: "g" })} />
      <SettingRow label="Grind (Opus)" value={r.grind} onClick={() => setPicker({ field: "grind", title: "Grind — Opus", min: 1, max: 11, step: 0.25, suffix: "" })} />

      {/* Opus range viz */}
      <div style={{
        background: SURFACE2, borderRadius: 6, padding: "6px 10px", margin: "8px 0 4px",
        display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: TEXT_DIM,
      }}>
        <span>1</span>
        <div style={{ flex: 1, height: 3, background: "rgba(255,255,255,0.08)", borderRadius: 2, position: "relative" }}>
          <div style={{
            position: "absolute", left: `${((r.grind - 1) / 10) * 100}%`,
            top: -3.5, width: 10, height: 10, borderRadius: "50%", background: AMBER,
            transform: "translateX(-50%)",
          }} />
        </div>
        <span>11</span>
        <span style={{ marginLeft: 4, color: TEXT_MED, fontSize: 10 }}>pour-over ~4-7</span>
      </div>

      {/* Aiden profile settings */}
      <SectionHeader title="" />
      <SettingRow label="Coffee-to-Water Ratio" value={r.ratio} isLast onClick={() => setPicker({ type: "option", field: "ratio", title: "Coffee-to-Water Ratio", options: ["1:14", "1:15", "1:16", "1:17"] })} />

      {/* Bloom */}
      <SectionHeader title="Bloom" description="The Bloom is an initial pulse of water onto the coffee grounds to release trapped gases, resulting in better saturation and enhanced flavor extraction." />
      <ToggleRow label="Bloom" on={r.bloomEnabled} onToggle={() => update("bloomEnabled", !r.bloomEnabled)} />
      {r.bloomEnabled && (
        <>
          <SettingRow label="Bloom Ratio" value={r.bloomRatio} onClick={() => setPicker({ type: "option", field: "bloomRatio", title: "Bloom Ratio", options: ["1:1", "1:1.5", "1:2", "1:2.5", "1:3"] })} />
          <SettingRow label="Bloom Time" value={`${r.bloomTime}s`} onClick={() => setPicker({ field: "bloomTime", title: "Bloom Time", min: 15, max: 90, step: 5, suffix: "s" })} />
          <SettingRow label="Bloom Temperature" value={tempDisplay(r.bloomTemp, useFahrenheit)} isLast
            onClick={() => setPicker({ field: "bloomTemp", title: "Bloom Temperature", min: 80, max: 100, step: 1, suffix: useFahrenheit ? "°F" : "°C", isTemp: true })} />
        </>
      )}

      {/* Single Serve Pulses */}
      <SectionHeader title="Single Serve Pulses" description="Control the number and timing of water pulses, ensuring agitation, even extraction, and a rich full flavor." />
      <SettingRow label="Number of Pulses" value={r.ssPulses}
        onClick={() => setPicker({ field: "ssPulses", title: "Number of Pulses", min: 1, max: 6, step: 1, suffix: "",
          onChangeExtra: (val) => {
            setDraft(d => {
              const temps = [...d.ssPulseTemps];
              while (temps.length < val) temps.push(temps[temps.length - 1] || 93);
              return { ...d, ssPulses: val, ssPulseTemps: temps.slice(0, val) };
            });
            setSaved(false);
          }
        })} />
      <SettingRow label="Time between pulses" value={`${r.ssInterval}s`}
        onClick={() => setPicker({ field: "ssInterval", title: "Time between pulses", min: 10, max: 60, step: 1, suffix: "s" })} />
      {r.ssPulseTemps.map((temp, i) => (
        <SettingRow key={`ss-${i}`} label={`Pulse ${i + 1} temperature`} value={tempDisplay(temp, useFahrenheit)}
          isLast={i === r.ssPulseTemps.length - 1}
          onClick={() => setPicker({ type: "pulseTemp", pulseType: "ss", index: i, title: `Pulse ${i + 1} temperature`, min: 80, max: 100, step: 1, suffix: useFahrenheit ? "°F" : "°C", isTemp: true, value: temp })} />
      ))}

      {/* Personal notes with flavor tags */}
      <SectionHeader title="My notes" />
      <FlavorTags
        selected={r.flavorTags || []}
        onChange={(tags) => update("flavorTags", tags)}
      />
      <div style={{ paddingBottom: 16 }}>
        <textarea
          value={r.personalNotes}
          onChange={(e) => update("personalNotes", e.target.value)}
          placeholder="Additional notes — what's working? What to try next?"
          rows={2}
          style={{
            width: "100%", background: SURFACE2, border: `0.5px solid ${BORDER}`, borderRadius: 10,
            padding: "10px 14px", color: TEXT, fontSize: 14, fontFamily: "inherit",
            resize: "vertical", boxSizing: "border-box",
          }}
        />
      </div>

      {/* Save button */}
      <div style={{ padding: "8px 0 16px" }}>
        <button onClick={handleSave} disabled={!hasChanges && !saved} style={{
          width: "100%", padding: "14px",
          background: saved ? "#2E7D32" : hasChanges ? AMBER : SURFACE2,
          border: saved ? "1px solid #4CAF50" : hasChanges ? "none" : `1px solid ${BORDER}`,
          color: saved ? "#fff" : hasChanges ? "#000" : TEXT_DIM,
          borderRadius: 12, fontSize: 15, fontWeight: 600,
          cursor: hasChanges ? "pointer" : "default",
          fontFamily: "inherit", transition: "all 0.3s",
          opacity: !hasChanges && !saved ? 0.5 : 1,
        }}>
          {saved ? "✓ Recipe saved" : hasChanges ? "Save recipe" : "No changes to save"}
        </button>
      </div>

      {/* Picker modals */}
      {picker && picker.type === "option" && (
        <OptionPicker
          title={picker.title}
          options={picker.options}
          value={r[picker.field]}
          onChange={(val) => update(picker.field, val)}
          onClose={() => setPicker(null)}
        />
      )}
      {picker && picker.type === "pulseTemp" && (
        <ValuePicker
          title={picker.title}
          value={picker.value}
          min={picker.min} max={picker.max} step={picker.step} suffix={picker.suffix}
          isTemp={picker.isTemp} useFahrenheit={useFahrenheit}
          onChange={(val) => updatePulseTemp(picker.pulseType, picker.index, val)}
          onClose={() => setPicker(null)}
        />
      )}
      {picker && !picker.type && (
        <ValuePicker
          title={picker.title}
          value={picker.onChangeExtra ? r[picker.field] : r[picker.field]}
          min={picker.min} max={picker.max} step={picker.step} suffix={picker.suffix}
          isTemp={picker.isTemp} useFahrenheit={useFahrenheit}
          onChange={(val) => {
            if (picker.onChangeExtra) {
              picker.onChangeExtra(val);
            } else {
              update(picker.field, val);
            }
          }}
          onClose={() => setPicker(null)}
        />
      )}
    </div>
  );
}

// ── Log Card ──

function LogCard({ log, bean, useFahrenheit, onRequestAI, showAI }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div style={{
      background: SURFACE, borderRadius: 14, border: `1px solid rgba(255,255,255,0.06)`,
      padding: "16px 18px", marginBottom: 12,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 500, color: TEXT, marginBottom: 2 }}>{bean?.name}</div>
          <div style={{ fontSize: 12, color: TEXT_DIM }}>{bean?.roaster} · {log.date}</div>
        </div>
        <Stars rating={log.rating} />
      </div>

      <div style={{ display: "flex", gap: 16, marginBottom: 10, flexWrap: "wrap" }}>
        {[
          { l: "Dose", v: `${log.dose}g` },
          { l: "Water", v: `${log.water}g` },
          { l: "Ratio", v: log.ratio },
          { l: "Opus", v: log.grind },
        ].map(p => (
          <div key={p.l} style={{ minWidth: 50 }}>
            <div style={{ fontSize: 11, color: TEXT_DIM, marginBottom: 2 }}>{p.l}</div>
            <div style={{ fontSize: 14, color: TEXT, fontFamily: "monospace" }}>{p.v}</div>
          </div>
        ))}
      </div>

      {expanded && (
        <div style={{ borderTop: `0.5px solid ${BORDER}`, paddingTop: 10, marginBottom: 10 }}>
          {[
            { l: "Bloom temp", v: tempDisplay(log.bloomTemp, useFahrenheit) },
            { l: "Bloom time", v: `${log.bloomTime}s` },
            { l: "SS pulses", v: log.ssPulses },
            { l: "SS interval", v: `${log.ssInterval}s` },
          ].map(r => (
            <div key={r.l} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0" }}>
              <span style={{ fontSize: 13, color: TEXT_DIM }}>{r.l}</span>
              <span style={{ fontSize: 13, color: TEXT }}>{r.v}</span>
            </div>
          ))}
        </div>
      )}

      {/* Flavor tags */}
      {log.flavorTags && log.flavorTags.length > 0 && (
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 8 }}>
          {log.flavorTags.map(tag => {
            const isPos = POSITIVE_TAGS.includes(tag);
            const color = isPos ? "#4CAF50" : "#E57373";
            return (
              <span key={tag} style={{
                fontSize: 11, padding: "3px 8px", borderRadius: 10,
                background: isPos ? "rgba(76,175,80,0.12)" : "rgba(229,115,115,0.12)",
                color, border: `1px solid ${isPos ? "rgba(76,175,80,0.25)" : "rgba(229,115,115,0.25)"}`,
              }}>{tag}</span>
            );
          })}
        </div>
      )}

      <div style={{ fontSize: 13, color: TEXT_MED, lineHeight: 1.5, marginBottom: 10 }}>{log.notes}</div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={() => setExpanded(!expanded)} style={{
          background: "transparent", border: `1px solid rgba(255,255,255,0.1)`, color: TEXT_DIM,
          borderRadius: 8, padding: "6px 12px", fontSize: 12, cursor: "pointer", fontFamily: "inherit",
        }}>{expanded ? "Hide details" : "Show profile"}</button>
        <button onClick={onRequestAI} style={{
          background: showAI ? AMBER : "transparent", border: `1px solid ${AMBER}`,
          color: showAI ? "#000" : AMBER, borderRadius: 8, padding: "6px 12px",
          fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: showAI ? 600 : 400,
        }}>{showAI ? "✦ AI tweaks active" : "✦ Get AI tweaks"}</button>
      </div>
    </div>
  );
}

// ── AI Panel ──

function AIPanel({ beanId, onApplyTweak, useFahrenheit }) {
  const [applied, setApplied] = useState({});
  const handleApply = (tweak, i) => { onApplyTweak(beanId, tweak.field, tweak.suggested); setApplied(a => ({ ...a, [i]: true })); };
  const handleApplyAll = () => { aiResponse.tweaks.forEach((t, i) => { onApplyTweak(beanId, t.field, t.suggested); setApplied(a => ({ ...a, [i]: true })); }); };

  return (
    <div style={{
      background: `linear-gradient(135deg, rgba(230,167,64,0.08) 0%, rgba(230,167,64,0.02) 100%)`,
      borderRadius: 14, border: `1px solid rgba(230,167,64,0.25)`, padding: "18px 20px", marginBottom: 16,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 16 }}>✦</span>
        <span style={{ fontSize: 14, fontWeight: 600, color: AMBER }}>AI recipe analysis</span>
        <span style={{ fontSize: 11, color: TEXT_DIM, marginLeft: "auto", background: SURFACE2, padding: "3px 8px", borderRadius: 6 }}>
          {aiResponse.confidence}
        </span>
      </div>
      <p style={{ fontSize: 13, color: TEXT_MED, lineHeight: 1.6, margin: "0 0 16px" }}>{aiResponse.summary}</p>
      <div style={{ fontSize: 12, color: TEXT_DIM, marginBottom: 8, fontWeight: 500 }}>Suggested tweaks</div>
      {aiResponse.tweaks.map((tweak, i) => {
        const isTemp = tweak.field === "bloomTemp";
        const currentDisplay = isTemp && useFahrenheit ? `${cToF(parseInt(tweak.current))}°F` : tweak.current;
        const suggestedDisplay = isTemp && useFahrenheit ? `${cToF(tweak.suggested)}°F` : `${tweak.suggested}${tweak.unit}`;
        return (
          <div key={i} style={{
            background: SURFACE, borderRadius: 10, padding: "12px 14px", marginBottom: 8,
            border: `1px solid ${applied[i] ? AMBER : "rgba(255,255,255,0.06)"}`, transition: "all 0.3s",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: TEXT }}>{tweak.param}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 13, color: TEXT_DIM, fontFamily: "monospace", textDecoration: "line-through" }}>{currentDisplay}</span>
                <span style={{ color: TEXT_DIM }}>→</span>
                <span style={{ fontSize: 13, color: AMBER, fontFamily: "monospace", fontWeight: 600 }}>{suggestedDisplay}</span>
              </div>
            </div>
            <div style={{ fontSize: 12, color: TEXT_DIM, lineHeight: 1.5 }}>{tweak.reason}</div>
            <button onClick={() => handleApply(tweak, i)} style={{
              marginTop: 8, background: applied[i] ? AMBER_DIM : "transparent",
              border: `1px solid ${applied[i] ? AMBER : "rgba(255,255,255,0.1)"}`,
              color: applied[i] ? AMBER : TEXT_DIM,
              borderRadius: 6, padding: "4px 10px", fontSize: 11, cursor: "pointer", fontFamily: "inherit",
            }}>{applied[i] ? "Applied to recipe ✓" : "Apply to my recipe"}</button>
          </div>
        );
      })}
      <button onClick={handleApplyAll} style={{
        marginTop: 8, width: "100%", background: AMBER, border: "none", color: "#000",
        borderRadius: 10, padding: "12px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
      }}>Apply all tweaks to my recipe</button>
    </div>
  );
}

// ── Add Bean Sheet ──

function AddBeanSheet({ onAdd, onClose }) {
  const [name, setName] = useState("");
  const [roaster, setRoaster] = useState("");
  const [origin, setOrigin] = useState("");
  const [process, setProcess] = useState("Washed");
  const [roast, setRoast] = useState("Medium");
  const [showProcessPicker, setShowProcessPicker] = useState(false);
  const [showRoastPicker, setShowRoastPicker] = useState(false);

  const canSave = name.trim() && roaster.trim();

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "flex-end",
      justifyContent: "center", zIndex: 200,
    }} onClick={onClose}>
      <div style={{
        background: "#1C1C1E", borderRadius: "16px 16px 0 0", width: "100%", maxWidth: 420,
        padding: "0 20px 40px", maxHeight: "85vh", overflowY: "auto",
      }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "16px 0", borderBottom: `0.5px solid ${BORDER}`, marginBottom: 8,
          position: "sticky", top: 0, background: "#1C1C1E", zIndex: 1,
        }}>
          <button onClick={onClose} style={{
            background: "none", border: "none", color: TEXT_MED, fontSize: 15,
            cursor: "pointer", fontFamily: "inherit", padding: 0,
          }}>Cancel</button>
          <span style={{ fontSize: 17, fontWeight: 500, color: TEXT }}>Add bean</span>
          <button onClick={() => canSave && onAdd({ name: name.trim(), roaster: roaster.trim(), origin: origin.trim() || "Unknown", process, roast })}
            style={{
              background: "none", border: "none", color: canSave ? AMBER : TEXT_DIM,
              fontSize: 15, fontWeight: 600, cursor: canSave ? "pointer" : "default",
              fontFamily: "inherit", padding: 0, opacity: canSave ? 1 : 0.5,
            }}>Save</button>
        </div>

        {/* Bean name */}
        <div style={{
          background: SURFACE2, borderRadius: 10, padding: "12px 14px", margin: "12px 0",
          border: `0.5px solid ${BORDER}`,
        }}>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Bean name"
            style={{
              width: "100%", background: "transparent", border: "none", color: TEXT,
              fontSize: 15, fontFamily: "inherit", outline: "none", boxSizing: "border-box",
            }}
          />
        </div>

        {/* Roaster */}
        <div style={{
          background: SURFACE2, borderRadius: 10, padding: "12px 14px", margin: "0 0 12px",
          border: `0.5px solid ${BORDER}`,
        }}>
          <input
            value={roaster}
            onChange={e => setRoaster(e.target.value)}
            placeholder="Roaster"
            style={{
              width: "100%", background: "transparent", border: "none", color: TEXT,
              fontSize: 15, fontFamily: "inherit", outline: "none", boxSizing: "border-box",
            }}
          />
        </div>

        {/* Origin */}
        <div style={{
          background: SURFACE2, borderRadius: 10, padding: "12px 14px", margin: "0 0 4px",
          border: `0.5px solid ${BORDER}`,
        }}>
          <input
            value={origin}
            onChange={e => setOrigin(e.target.value)}
            placeholder="Origin (e.g. Ethiopia, Colombia)"
            style={{
              width: "100%", background: "transparent", border: "none", color: TEXT,
              fontSize: 15, fontFamily: "inherit", outline: "none", boxSizing: "border-box",
            }}
          />
        </div>

        {/* Process */}
        <SettingRow label="Process" value={process}
          onClick={() => setShowProcessPicker(true)} />
        {/* Roast */}
        <SettingRow label="Roast" value={roast} isLast
          onClick={() => setShowRoastPicker(true)} />

        {/* Info text */}
        <div style={{ padding: "16px 0 8px" }}>
          <div style={{ fontSize: 13, color: TEXT_DIM, lineHeight: 1.5 }}>
            A default recipe will be created for this bean with standard single-serve settings. You can customize it after adding.
          </div>
        </div>

        {showProcessPicker && (
          <OptionPicker
            title="Process"
            options={["Washed", "Natural", "Honey", "Anaerobic", "Carbonic maceration", "Lactic", "Co-fermentation", "Double anaerobic", "Anaerobic natural", "Anaerobic washed", "Anaerobic honey", "Wet hulled", "Experimental", "Mixed"]}
            value={process}
            onChange={setProcess}
            onClose={() => setShowProcessPicker(false)}
          />
        )}
        {showRoastPicker && (
          <OptionPicker
            title="Roast"
            options={["Ultra light", "Light", "Medium-Light", "Medium", "Medium-Dark", "Dark"]}
            value={roast}
            onChange={setRoast}
            onClose={() => setShowRoastPicker(false)}
          />
        )}
      </div>
    </div>
  );
}

// ── Main App ──

export default function FellowBrewLog() {
  const [activeTab, setActiveTab] = useState("beans");
  const [selectedBean, setSelectedBean] = useState(null);
  const [showAI, setShowAI] = useState(false);
  const [useFahrenheit, setUseFahrenheit] = useState(true);
  const [recipes, setRecipes] = useState(initialRecipes);
  const [beans, setBeans] = useState(initialBeans);
  const [showAddBean, setShowAddBean] = useState(false);

  const updateRecipe = (beanId, newRecipe) => setRecipes(r => ({ ...r, [beanId]: newRecipe }));
  const applyTweak = (beanId, field, value) => setRecipes(r => ({ ...r, [beanId]: { ...r[beanId], [field]: value } }));

  const addBean = (beanData) => {
    const newId = Math.max(...beans.map(b => b.id)) + 1;
    const newBean = { id: newId, ...beanData };
    setBeans(prev => [...prev, newBean]);
    setRecipes(prev => ({
      ...prev,
      [newId]: {
        name: `${beanData.name} — new`,
        temperature: "Mixed",
        ratio: "1:16",
        bloomEnabled: true,
        bloomRatio: "1:2",
        bloomTime: 40,
        bloomTemp: 93,
        ssPulses: 3,
        ssInterval: 23,
        ssPulseTemps: [93, 92, 92],
        dose: 15,
        water: 240,
        grind: 5.5,
        personalNotes: "",
        flavorTags: [],
      },
    }));
    setSelectedBean(newId);
    setActiveTab("beans");
    setShowAddBean(false);
  };

  const activeBean = selectedBean ? beans.find(b => b.id === selectedBean) : null;
  const beanLogs = selectedBean ? sampleLogs.filter(l => l.beanId === selectedBean) : [];

  return (
    <div style={{
      background: BG, color: TEXT, minHeight: "100vh",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif",
      maxWidth: 420, margin: "0 auto", position: "relative",
    }}>
      <div style={{ padding: "16px 20px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <div style={{ fontSize: 11, color: TEXT_DIM, letterSpacing: 2, textTransform: "uppercase" }}>Fellow</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <TempToggle useFahrenheit={useFahrenheit} onToggle={() => setUseFahrenheit(!useFahrenheit)} />
          </div>
        </div>

        {/* Header changes based on whether we're in a bean detail */}
        {selectedBean && activeTab === "beans" ? (
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "0 0 16px" }}>
            <button onClick={() => { setSelectedBean(null); setShowAI(false); }} style={{
              background: SURFACE, border: "none", color: TEXT_MED, borderRadius: 8,
              width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", flexShrink: 0,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <div>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 600, letterSpacing: -0.3 }}>{activeBean?.name}</h1>
              <div style={{ fontSize: 12, color: TEXT_DIM }}>{activeBean?.roaster} · {activeBean?.origin}</div>
            </div>
          </div>
        ) : (
          <h1 style={{ margin: "0 0 16px", fontSize: 28, fontWeight: 600, letterSpacing: -0.5 }}>Brew log</h1>
        )}

        {/* Tabs — only show when not in bean detail */}
        {!selectedBean && (
          <div style={{ display: "flex", gap: 0, borderBottom: `0.5px solid ${BORDER}`, marginBottom: 16 }}>
            {["beans", "insights"].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{
                background: "none", border: "none",
                borderBottom: `2px solid ${activeTab === tab ? AMBER : "transparent"}`,
                color: activeTab === tab ? TEXT : TEXT_DIM,
                padding: "8px 16px 12px", fontSize: 14, cursor: "pointer",
                fontFamily: "inherit", textTransform: "capitalize", transition: "all 0.2s",
              }}>{tab}</button>
            ))}
          </div>
        )}
      </div>

      <div style={{ padding: "0 20px 100px" }}>

        {/* ── Beans tab: list view ── */}
        {activeTab === "beans" && !selectedBean && (
          <div>
            {beans.map(b => {
              const brewCount = sampleLogs.filter(l => l.beanId === b.id).length;
              const recipe = recipes[b.id];
              const tags = recipe?.flavorTags || [];
              const lastLog = sampleLogs.filter(l => l.beanId === b.id).sort((a, b) => b.id - a.id)[0];
              return (
                <div key={b.id} style={{
                  background: SURFACE, borderRadius: 14, border: `1px solid rgba(255,255,255,0.06)`,
                  padding: "16px 18px", marginBottom: 12, cursor: "pointer",
                }} onClick={() => setSelectedBean(b.id)}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 500, color: TEXT, marginBottom: 2 }}>{b.name}</div>
                      <div style={{ fontSize: 12, color: TEXT_DIM }}>{b.roaster}</div>
                    </div>
                    <Chevron />
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                    {[b.origin, b.process, b.roast].map(tag => (
                      <span key={tag} style={{ fontSize: 11, color: TEXT_MED, background: SURFACE2, padding: "3px 8px", borderRadius: 4 }}>{tag}</span>
                    ))}
                  </div>
                  {/* Quick stats row */}
                  <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                    <span style={{ fontSize: 12, color: TEXT_DIM }}>{brewCount} brew{brewCount !== 1 ? "s" : ""}</span>
                    {recipe && <span style={{ fontSize: 12, color: TEXT_DIM }}>Opus {recipe.grind}</span>}
                    {lastLog && <span style={{ fontSize: 12, color: TEXT_DIM }}>{lastLog.rating} ★</span>}
                    {recipe && (
                      <span style={{ fontSize: 10, color: AMBER, background: AMBER_DIM, padding: "2px 6px", borderRadius: 4, marginLeft: "auto" }}>Recipe</span>
                    )}
                  </div>
                  {/* Show latest flavor tags */}
                  {tags.length > 0 && (
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 8 }}>
                      {tags.slice(0, 4).map(tag => {
                        const isPos = POSITIVE_TAGS.includes(tag);
                        return (
                          <span key={tag} style={{
                            fontSize: 10, padding: "2px 6px", borderRadius: 8,
                            background: isPos ? "rgba(76,175,80,0.1)" : "rgba(229,115,115,0.1)",
                            color: isPos ? "#4CAF50" : "#E57373",
                          }}>{tag}</span>
                        );
                      })}
                      {tags.length > 4 && <span style={{ fontSize: 10, color: TEXT_DIM }}>+{tags.length - 4}</span>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── Beans tab: detail view (recipe + brew history) ── */}
        {activeTab === "beans" && selectedBean && activeBean && (
          <>
            {/* Recipe card */}
            {recipes[selectedBean] && (
              <RecipeCard
                key={selectedBean}
                recipe={recipes[selectedBean]}
                bean={activeBean}
                useFahrenheit={useFahrenheit}
                onUpdate={updateRecipe}
              />
            )}

            {/* AI Panel */}
            {showAI && (
              <AIPanel beanId={selectedBean} onApplyTweak={applyTweak} useFahrenheit={useFahrenheit} />
            )}

            {/* Brew history */}
            <div style={{ fontSize: 12, color: TEXT_DIM, marginBottom: 8, marginTop: 8, fontWeight: 500 }}>
              Brew history
            </div>

            {beanLogs.length === 0 && (
              <div style={{
                textAlign: "center", padding: "32px 20px", color: TEXT_DIM, fontSize: 13,
                background: SURFACE, borderRadius: 14, border: `1px solid rgba(255,255,255,0.06)`,
              }}>
                No brews logged yet. Start brewing and track your results here.
              </div>
            )}

            {beanLogs.map(log => (
              <LogCard key={log.id} log={log} bean={activeBean}
                useFahrenheit={useFahrenheit} showAI={showAI}
                onRequestAI={() => setShowAI(!showAI)} />
            ))}
          </>
        )}

        {/* ── Insights tab ── */}
        {activeTab === "insights" && (
          <div>
            <div style={{ background: SURFACE, borderRadius: 14, border: `1px solid rgba(255,255,255,0.06)`, padding: "20px", marginBottom: 16, textAlign: "center" }}>
              <div style={{ fontSize: 32, fontWeight: 500, color: AMBER, marginBottom: 4 }}>{sampleLogs.length}</div>
              <div style={{ fontSize: 12, color: TEXT_DIM }}>Total brews logged</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              <div style={{ background: SURFACE, borderRadius: 14, border: `1px solid rgba(255,255,255,0.06)`, padding: "16px", textAlign: "center" }}>
                <div style={{ fontSize: 22, fontWeight: 500, color: TEXT, marginBottom: 4 }}>
                  {(sampleLogs.reduce((a, l) => a + l.rating, 0) / sampleLogs.length).toFixed(1)}
                </div>
                <div style={{ fontSize: 11, color: TEXT_DIM }}>Avg rating</div>
              </div>
              <div style={{ background: SURFACE, borderRadius: 14, border: `1px solid rgba(255,255,255,0.06)`, padding: "16px", textAlign: "center" }}>
                <div style={{ fontSize: 22, fontWeight: 500, color: TEXT, marginBottom: 4 }}>{beans.length}</div>
                <div style={{ fontSize: 11, color: TEXT_DIM }}>Beans</div>
              </div>
            </div>

            {/* Recent brews across all beans */}
            <div style={{ fontSize: 12, color: TEXT_DIM, marginBottom: 8, fontWeight: 500 }}>Recent brews</div>
            {sampleLogs.map(log => (
              <div key={log.id} style={{
                background: SURFACE, borderRadius: 12, border: `1px solid rgba(255,255,255,0.06)`,
                padding: "12px 16px", marginBottom: 8, cursor: "pointer",
              }} onClick={() => { setSelectedBean(log.beanId); setActiveTab("beans"); }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={{ fontSize: 14, color: TEXT, fontWeight: 500 }}>{beans.find(b => b.id === log.beanId)?.name}</span>
                    <span style={{ fontSize: 12, color: TEXT_DIM, marginLeft: 8 }}>{log.date}</span>
                  </div>
                  <Stars rating={log.rating} />
                </div>
                {log.flavorTags && log.flavorTags.length > 0 && (
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 6 }}>
                    {log.flavorTags.slice(0, 3).map(tag => {
                      const isPos = POSITIVE_TAGS.includes(tag);
                      return (
                        <span key={tag} style={{
                          fontSize: 10, padding: "2px 6px", borderRadius: 8,
                          background: isPos ? "rgba(76,175,80,0.1)" : "rgba(229,115,115,0.1)",
                          color: isPos ? "#4CAF50" : "#E57373",
                        }}>{tag}</span>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}

            {/* AI insight */}
            <div style={{
              background: `linear-gradient(135deg, rgba(230,167,64,0.08) 0%, rgba(230,167,64,0.02) 100%)`,
              borderRadius: 14, border: `1px solid rgba(230,167,64,0.25)`, padding: "18px 20px", marginTop: 16,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span>✦</span>
                <span style={{ fontSize: 14, fontWeight: 500, color: AMBER }}>AI insight</span>
              </div>
              <p style={{ fontSize: 13, color: TEXT_MED, lineHeight: 1.6, margin: 0 }}>
                Your highest-rated brews use finer Opus settings (5.0-5.5) with extended bloom times.
                You prefer brighter, fruit-forward profiles. Try increasing your bloom ratio to 1:2.5
                on your next natural process brew for even more sweetness.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* FAB — only show on list views, not inside bean detail */}
      {!selectedBean && (
        <div onClick={() => setShowAddBean(true)} style={{
          position: "fixed", bottom: 24, right: "calc(50% - 190px)",
          width: 56, height: 56, borderRadius: "50%", background: AMBER, border: "none",
          color: "#000", fontSize: 28, fontWeight: 300, cursor: "pointer",
          boxShadow: "0 4px 20px rgba(230,167,64,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50,
        }}>+</div>
      )}

      {showAddBean && (
        <AddBeanSheet onAdd={addBean} onClose={() => setShowAddBean(false)} />
      )}
    </div>
  );
}
