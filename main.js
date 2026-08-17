lucide.createIcons();

// --- Audio Controller with Safe Autoplay Handling ---
const audio = document.getElementById('weddingTrack');
const toggleBtn = document.getElementById('toggleAudio');
const audioIcon = document.getElementById('audioIcon');
let isPlaying = false;

// Ensure audio volume
if (audio) audio.volume = 0.85;

function startPlayback() {
  if (!audio) return;
  audio.play().then(() => {
    isPlaying = true;
    audioIcon.classList.add('animate-spin');
    toggleBtn.classList.add('border-[#e6c670]', 'bg-[#e6c670]/20');
  }).catch((err) => {
    console.warn('Playback gesture required:', err);
  });
}

function pausePlayback() {
  if (!audio) return;
  audio.pause();
  isPlaying = false;
  audioIcon.classList.remove('animate-spin');
  toggleBtn.classList.remove('border-[#e6c670]', 'bg-[#e6c670]/20');
}

toggleBtn.addEventListener('click', () => {
  if (isPlaying) {
    pausePlayback();
  } else {
    startPlayback();
  }
});

// --- Rip Ticket Action ---
const ripBtn = document.getElementById('ripTicketBtn');
const flightHub = document.getElementById('flightHub');

ripBtn.addEventListener('click', () => {
  confetti({
    particleCount: 90,
    spread: 80,
    origin: { y: 0.6 },
    colors: ['#d4af37', '#f3dd87', '#ffffff']
  });

  ripBtn.innerHTML = '<i data-lucide="check" class="w-4 h-4"></i> <span>تم تأكيد التذكرة بنجاح</span>';
  ripBtn.classList.replace('from-[#d4af37]', 'from-emerald-400');
  ripBtn.classList.replace('to-[#c59b27]', 'to-emerald-600');
  lucide.createIcons();

  flightHub.classList.remove('hidden');
  
  // Smooth scroll into hub
  setTimeout(() => {
    flightHub.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);

  // Trigger audio on button click
  startPlayback();
});

// --- Live Countdown (October 23, 2026 at 7:00 PM) ---
const weddingDate = new Date("October 23, 2026 19:00:00").getTime();
setInterval(() => {
  const diff = weddingDate - new Date().getTime();
  if (diff > 0) {
    document.getElementById('days').innerText = String(Math.floor(diff / (1000 * 60 * 60 * 24))).padStart(2, '0');
    document.getElementById('hours').innerText = String(Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, '0');
    document.getElementById('minutes').innerText = String(Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
    document.getElementById('seconds').innerText = String(Math.floor((diff % (1000 * 60)) / 1000)).padStart(2, '0');
  }
}, 1000);

// --- Firebase Realtime Database Integration ---
const firebaseDbUrl = "https://wedding-apps-cc913-default-rtdb.firebaseio.com/wishes.json";
const wishesForm = document.getElementById('wishesForm');
const wishesStream = document.getElementById('wishesStream');
const wishesCounter = document.getElementById('wishesCounter');
const senderName = document.getElementById('senderName');
const senderMsg = document.getElementById('senderMsg');
const sendBtn = document.getElementById('sendBtn');

async function loadWishes() {
  try {
    const res = await fetch(firebaseDbUrl);
    const data = await res.json();

    if (!data || Object.keys(data).length === 0) {
      wishesStream.innerHTML = `
        <div id="emptyMsg" class="text-center py-6 text-xs text-slate-500 font-mono">
          NO WISHES YET. BE THE FIRST! 🤍
        </div>
      `;
      wishesCounter.innerText = "0 WISHES";
      return;
    }

    const items = Object.entries(data).reverse();
    wishesCounter.innerText = `${items.length} WISHES`;

    wishesStream.innerHTML = items.map(([_, wish]) => `
      <div class="p-3 rounded-xl bg-[#0a0b10] border border-slate-800/80 space-y-1 text-right">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-[#f5db8b] font-mono">${sanitize(wish.name)}</span>
          <span class="text-[9px] text-slate-500 font-mono">${wish.date || ''}</span>
        </div>
        <p class="text-xs text-slate-300 font-light leading-relaxed">${sanitize(wish.message)}</p>
      </div>
    `).join('');
  } catch (err) {
    console.error('Firebase read error:', err);
  }
}

wishesForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = senderName.value.trim();
  const message = senderMsg.value.trim();
  if (!name || !message) return;

  sendBtn.disabled = true;
  sendBtn.innerText = 'جاري الإرسال...';

  const newWish = {
    name,
    message,
    timestamp: Date.now(),
    date: new Intl.DateTimeFormat('ar-EG', { month: 'short', day: 'numeric' }).format(new Date())
  };

  try {
    const res = await fetch(firebaseDbUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newWish)
    });

    if (res.ok) {
      senderName.value = '';
      senderMsg.value = '';
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.85 } });
      await loadWishes();
    }
  } catch (err) {
    alert('حدث خطأ أثناء الإرسال');
  } finally {
    sendBtn.disabled = false;
    sendBtn.innerHTML = '<i data-lucide="send" class="w-3.5 h-3.5"></i> <span>إرسال التهنئة</span>';
    lucide.createIcons();
  }
});

function sanitize(str) {
  return String(str).replace(/[&<>"']/g, (m) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[m]);
}

loadWishes();