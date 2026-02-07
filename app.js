// ========= CONFIG =========
const CORRECT_PIN = "0207";

// Fecha inicio relación: 7 feb 2024 22:30 en Madrid (CET, +01:00)
const START_DATE_ISO = "2024-02-07T22:30:00+01:00";

// Nacimientos
const NARA_BIRTH_ISO  = "2005-08-21T00:00:00+02:00";  // Agosto suele ser +02
const PEDRO_BIRTH_ISO = "2005-10-13T00:00:00+02:00";

// Equivalencia bus Coruña -> Hondarribi (minutos). AJÚSTALO a tu gusto:
const BUS_TRIP_MINUTES = 810;

// Fotos: tú las subes a /assets y cambias estos nombres
const CONCERT_PHOTOS = [
  "./assets/concert/concert-01.jpg",
  null, null, null, null, null
];

const NARA_CUSTOM_PHOTOS = [
  "./assets/nara/nara-01.jpg",
  null, null, null, null, null, null, null, null, null
];

// ========= Helpers =========
function $(id){ return document.getElementById(id); }

function clamp(n, a, b){ return Math.max(a, Math.min(b, n)); }

function formatPct(x){
  // x es 0..1
  const pct = x * 100;
  if (!isFinite(pct) || pct < 0) return "—";
  return `${pct.toFixed(2)}%`;
}

function diffYearsDaysHoursMinutes(start, now){
  // años = número de aniversarios completos
  let years = now.getFullYear() - start.getFullYear();
  const annivThisYear = new Date(start);
  annivThisYear.setFullYear(start.getFullYear() + years);
  if (annivThisYear > now) years--;

  const afterYears = new Date(start);
  afterYears.setFullYear(start.getFullYear() + years);

  let ms = now - afterYears;
  if (ms < 0) ms = 0;

  const totalMinutes = Math.floor(ms / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes - days * 60 * 24) / 60);
  const mins = totalMinutes - days * 60 * 24 - hours * 60;

  return { years, days, hours, mins, totalMinutesFromStart: Math.floor((now - start) / 60000) };
}

function renderPhotoGrid(containerId, photos, prefixLabel){
  const el = $(containerId);
  el.innerHTML = "";
  photos.forEach((src, i) => {
    const slot = document.createElement("div");
    slot.className = "photo-slot";
    if (src){
      const img = document.createElement("img");
      img.src = src;
      img.alt = `${prefixLabel} ${i+1}`;
      slot.appendChild(img);
    } else {
      const ph = document.createElement("div");
      ph.className = "ph";
      ph.textContent = `${prefixLabel} ${i+1}`;
      slot.appendChild(ph);
    }
    el.appendChild(slot);
  });
}

function setupMoodSlider(sliderId, labelId, storageKey){
  const MOODS = ["😡 Enfado", "😢 Triste", "😐 Normal", "😊 Contento", "😍 Enamorado"];
  const slider = $(sliderId);
  const label = $(labelId);

  const saved = localStorage.getItem(storageKey);
  const initial = saved !== null ? clamp(parseInt(saved, 10), 0, 4) : 2;

  slider.value = String(initial);
  label.textContent = MOODS[initial];

  slider.addEventListener("input", () => {
    const v = clamp(parseInt(slider.value, 10), 0, 4);
    label.textContent = MOODS[v];
    localStorage.setItem(storageKey, String(v));
  });
}

// ========= PIN =========
function unlock(){
  $("lockscreen").style.display = "none";
  $("site").classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "instant" });
}

function checkPin(){
  const pin = $("pin").value.trim();
  if (pin === CORRECT_PIN){
    $("pinError").textContent = "";
    unlock();
  } else {
    $("pinError").textContent = "PIN incorrecto 😈 (pista: 0207)";
  }
}

// ========= Timer =========
function updateTimer(){
  const start = new Date(START_DATE_ISO);
  const now = new Date();

  const d = diffYearsDaysHoursMinutes(start, now);

  $("tYears").textContent = String(d.years);
  $("tDays").textContent  = String(d.days);
  $("tHours").textContent = String(d.hours);
  $("tMins").textContent  = String(d.mins);

  // Bus trips
  if (BUS_TRIP_MINUTES > 0){
    const trips = d.totalMinutesFromStart / BUS_TRIP_MINUTES;
    $("busTrips").textContent = trips.toFixed(2);
  } else {
    $("busTrips").textContent = "—";
  }

  // % vida juntos
  const naraBirth = new Date(NARA_BIRTH_ISO);
  const pedroBirth = new Date(PEDRO_BIRTH_ISO);

  const togetherMs = now - start;
  const naraLifeMs = now - naraBirth;
  const pedroLifeMs = now - pedroBirth;

  $("pctNara").textContent  = formatPct(togetherMs / naraLifeMs);
  $("pctPedro").textContent = formatPct(togetherMs / pedroLifeMs);
}

// ========= Init =========
document.addEventListener("DOMContentLoaded", () => {
  // PIN
  $("pinBtn").addEventListener("click", checkPin);
  $("pin").addEventListener("keydown", (e) => {
    if (e.key === "Enter") checkPin();
  });

  // Fotos (placeholders o rutas reales)
  renderPhotoGrid("photos6", CONCERT_PHOTOS.map((x, i) => x ? x : null), "Foto");
  renderPhotoGrid("photos10", NARA_CUSTOM_PHOTOS.map((x, i) => x ? x : null), "Nara");

  // Sliders (se guardan por dispositivo)
  setupMoodSlider("moodPedro", "moodPedroLbl", "mood_pedro");
  setupMoodSlider("moodNara", "moodNaraLbl", "mood_nara");

  // Timer live
  updateTimer();
  setInterval(updateTimer, 1000);
});

