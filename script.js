
const SUPABASE_URL = "https://rflqkmwjjccuvgccpizd.supabase.co";
const SUPABASE_KEY = "sb_publishable_TYjFEBx5wAG12h5FVTORQA_lhW-ifAS ";
const db= window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);



// 1. ADIM: Web Audio API ile harici dosya olmadan tok ahşap damga sesi üretme
function damgaSesiCal() {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = "triangle";
  osc.frequency.setValueAtTime(140, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(30, audioCtx.currentTime + 0.12);

  gain.gain.setValueAtTime(1, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.12);

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start();
  osc.stop(audioCtx.currentTime + 0.12);
}

// 2. ADIM: HTML'deki elemanları yakalama
const postInput = document.getElementById("post-input");
const btnSubmit = document.getElementById("btn-submit");
const feed = document.getElementById("feed");

// 3. ADIM: "Reddet!" butonuna basıldığında yeni gönderi kartı oluşturma
btnSubmit.addEventListener("click", async () => {
  const metin = postInput.value.trim();

  // Kutu boşsa uyarı ver
  if (metin === "") {
    alert("Mutlaka reddedecek bir şeylerin olmalı!!");
    return;
  }

  // Buluta kaydet
  await db.from("posts").insert([
    { author: `Anonim İnkarcı #${Math.floor(Math.random() * 900) + 100}`, content: metin, reject_count: 1 }
  ]);

  // Yeni kartı oluştur
  const yeniKart = document.createElement("article");
  yeniKart.className = "post-card";
  yeniKart.innerHTML = `
    <div class="post-header">
      <span class="author">Anonim İnkarcı #${Math.floor(Math.random() * 900) + 100}</span>
      <span class="time">Az önce</span>
    </div>
    <p class="post-text">${metin}</p>
    <div class="post-actions">
      <button class="btn-reject">Ben de Reddediyorum (<span class="count">1</span>)</button>
      <button class="btn-accept">Kabullen</button>
    </div>
    <div class="stamp" style="display: none;">REDDEDİLDİ</div>
  `;

  // Yeni kartı akışın en tepesine ekle ve kutuyu temizle
  feed.prepend(yeniKart);
  postInput.value = "";
});

// Akıştaki buton tıklamalarını dinleme
feed.addEventListener("click", async (e) => {
  // A) "Ben de Reddediyorum" butonuna tıklandıysa:
  if (e.target.closest(".btn-reject")) {
    const kart = e.target.closest(".post-card");
    const postId = kart.dataset.id; // Kartın veritabanındaki ID numarası
    const sayac = kart.querySelector(".count");
    const damga = kart.querySelector(".stamp");

    // Damga sesi ve animasyonlar
    damgaSesiCal();
    const yeniSayi = parseInt(sayac.textContent) + 1;
    sayac.textContent = yeniSayi;

    damga.classList.add("active");
    kart.classList.add("shake");
    setTimeout(() => kart.classList.remove("shake"), 300);

    // === VERİTABANINDA SAYACI GÜNCELLEME ===
    if (postId) {
      await db
        .from("posts")
        .update({ reject_count: yeniSayi })
        .eq("id", postId);
    }
  }

  // B) "Kabullen" butonuna tıklandıysa:
  if (e.target.closest(".btn-accept")) {
    alert("DİKKAT: GERÇEKLİK İHLALİ!\n\nBu sitede gerçekleri kabullenmek 2754 sayılı NilveMub Kanununca yasaktır!");
  }
});

// Sayfa açıldığında Supabase'teki postları ekrana bas
async function postlariYukle() {
  const { data } = await supabase.from("posts").select("*").order("created_at", { ascending: false });
  if (data && data.length > 0) {
    feed.innerHTML = "";
    data.forEach(p => {
      feed.innerHTML += `
        <article class="post-card">
          <div class="post-header"><span class="author">${p.author}</span></div>
          <p class="post-text">${p.content}</p>
          <div class="post-actions">
            <button class="btn-reject">Ben de Reddediyorum (<span class="count">${p.reject_count}</span>)</button>
            <button class="btn-accept">Kabullen</button>
          </div>
          <div class="stamp" style="display: none;">REDDEDİLDİ</div>
        </article>`;
    });
  }
}
postlariYukle();


// Sayfa açıldığında Supabase'teki postları ekrana bas
async function postlariYukle() {
  const { data } = await db.from("posts").select("*").order("created_at", { ascending: false });
  
  if (data && data.length > 0) {
    feed.innerHTML = "";
    data.forEach(p => {
      feed.innerHTML += `
        <article class="post-card" data-id="${p.id}">
          <div class="post-header">
            <span class="author">${p.author}</span>
            <span class="time">${new Date(p.created_at).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}</span>
          </div>
          <p class="post-text">${p.content}</p>
          <div class="post-actions">
            <button class="btn-reject">Ben de Reddediyorum (<span class="count">${p.reject_count}</span>)</button>
            <button class="btn-accept">Kabullen</button>
          </div>
          <div class="stamp" style="display: none;">REDDEDİLDİ</div>
        </article>`;
    });
  }
}
postlariYukle();