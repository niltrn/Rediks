
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
btnSubmit.addEventListener("click", () => {
  const metin = postInput.value.trim();

  // Kutu boşsa uyarı ver
  if (metin === "") {
    alert("Reddedecek bir şeyler yazmalısın!");
    return;
  }

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

// 4. ADIM: Akıştaki buton tıklamalarını dinleme (Bahsettiğin 2 numaralı kısım burası)
feed.addEventListener("click", (e) => {
  // A) "Ben de Reddediyorum" butonuna tıklandıysa:
  if (e.target.closest(".btn-reject")) {
    const kart = e.target.closest(".post-card");
    const sayac = kart.querySelector(".count");
    const damga = kart.querySelector(".stamp");

    // 1 numarada tanımladığımız ahşap damga sesini patlatıyoruz
    damgaSesiCal();

    // Sayacı 1 artırıyoruz
    sayac.textContent = parseInt(sayac.textContent) + 1;

    // Kırmızı damgayı ekrana vurup kartı titretiyoruz
    damga.classList.add("active");
    kart.classList.add("shake");
    setTimeout(() => kart.classList.remove("shake"), 300);
  }

  // B) Yasaklı "Kabullen" butonuna tıklandıysa:
  if (e.target.closest(".btn-accept")) {
    alert("DİKKAT: GERÇEKLİK İHLALİ!\n\nBu sitede gerçekleri kabullenmek 2754 sayılı NilveMub Kanununca yasaktır!");
  }
});