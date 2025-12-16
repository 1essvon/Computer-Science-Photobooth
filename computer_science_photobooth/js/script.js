// --- VARIABEL UTAMA ---
let photos = [];
const maxPhotos = 4;
let currentFilter = 'none';
let currentLayout = 'zigzag'; // Default

// UPDATE PATH AUDIO (Pastikan folder 'audio' ada)
const audioSnap = new Audio('audio/shutter.mp3');
const audioBeep = new Audio('audio/beep.mp3');

// --- DOM ELEMENTS ---
const video = document.getElementById('webcam');
const btnSnap = document.getElementById('btn-snap');
const btnDl = document.getElementById('btn-dl');
const stickerMenu = document.getElementById('sticker-menu');
const paperArea = document.getElementById('paper-area');
const footerPreview = document.getElementById('custom-text-preview');

// --- 1. INISIALISASI ---
const d = new Date();
const dateString = `${d.getDate()}.${d.getMonth()+1}.${d.getFullYear()}`;
document.getElementById('date-text').innerText = dateString;

const stickerContainer = document.getElementById('sticker-list');
for(let i=1; i<=20; i++){
    let img = document.createElement('img');
    
    // UPDATE PATH STIKER (Pastikan folder 'img' ada)
    img.src = `img/sticker${i}.png`; 
    img.className = 'thumb';
    img.onclick = () => spawnSticker(`img/sticker${i}.png`);
    
    stickerContainer.appendChild(img);
}

function navToApp() {
    document.getElementById('screen-landing').classList.remove('active');
    document.getElementById('screen-app').classList.add('active');
    startCamera();
}

function startCamera() {
    navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } })
    .then(stream => { video.srcObject = stream; })
    .catch(e => console.log("Webcam error/missing"));
}

function applyFilter(type, btn) {
    let css = '';
    if(type === 'vintage') css = 'sepia(60%) contrast(110%) brightness(95%)';
    else if(type === 'bw') css = 'grayscale(100%) contrast(120%)';
    else if(type === 'cool') css = 'saturate(110%) hue-rotate(10deg) brightness(95%)';
    else css = 'none';
    currentFilter = css;
    video.style.filter = css;
    document.querySelectorAll('.btn-filter').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

// --- FITUR GANTI LAYOUT ---
function changeLayout(mode, btn) {
    currentLayout = mode;
    document.querySelectorAll('.btn-layout').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    const container = document.getElementById('photo-container');
    if(mode === 'strip') {
        paperArea.classList.add('strip-active');
        container.classList.remove('zigzag-mode');
    } else {
        paperArea.classList.remove('strip-active');
        container.classList.add('zigzag-mode');
    }
}

function updateFooterPreview(text) {
    footerPreview.innerText = text || "Enjoy Your Moments";
}

// --- 2. LOGIKA FOTO ---
function startCountdown() {
    if(photos.length >= maxPhotos) return;
    btnSnap.disabled = true;
    let count = 3;
    const overlay = document.getElementById('countdown-overlay');
    overlay.style.display = 'block';
    overlay.innerText = count;
    audioBeep.play().catch(()=>{});

    let timer = setInterval(()=>{
        count--;
        if(count > 0){
            overlay.innerText = count;
            audioBeep.currentTime=0; audioBeep.play().catch(()=>{});
        } else {
            clearInterval(timer);
            overlay.style.display = 'none';
            snapPicture();
        }
    }, 1000);
}

function snapPicture() {
    const flash = document.getElementById('flash-effect');
    flash.style.opacity = 1;
    audioSnap.play().catch(()=>{});
    setTimeout(()=> flash.style.opacity=0, 100);

    const cvs = document.getElementById('cvs-temp');
    const ctx = cvs.getContext('2d');
    const w = video.videoWidth || 640;
    const h = video.videoHeight || 480;
    cvs.width = w; cvs.height = h;

    ctx.filter = currentFilter;
    ctx.translate(w, 0); ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, w, h);
    
    addPhotoToSlot(cvs.toDataURL('image/png'));
}

function handleFile(input) {
    if(photos.length >= maxPhotos || !input.files[0]) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            const cvs = document.getElementById('cvs-temp');
            const ctx = cvs.getContext('2d');
            cvs.width = img.width; cvs.height = img.height;
            ctx.filter = currentFilter;
            ctx.drawImage(img, 0, 0);
            addPhotoToSlot(cvs.toDataURL('image/png'));
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(input.files[0]);
    input.value = '';
}

function addPhotoToSlot(dataUrl) {
    photos.push(dataUrl);
    const slotIdx = photos.length;
    document.getElementById(`slot-${slotIdx}`).innerHTML = `<img src="${dataUrl}">`;
    document.getElementById('counter').innerText = `${slotIdx} / 4`;

    if(photos.length === maxPhotos) {
        btnSnap.innerText = "DONE!";
        btnDl.disabled = false; btnDl.style.opacity = "1"; btnDl.style.pointerEvents = "all";
        stickerMenu.style.display = "block";
    } else {
        btnSnap.disabled = false;
    }
}

function fullReset() {
    photos = [];
    for(let i=1; i<=4; i++) document.getElementById(`slot-${i}`).innerHTML = '';
    btnSnap.disabled = false; btnSnap.innerText = "📷 SNAP (4x)";
    btnDl.disabled = true; btnDl.style.opacity = "0.5";
    stickerMenu.style.display = "none";
    document.getElementById('counter').innerText = "0 / 4";
    removeAllStickers();
    document.getElementById('user-caption').value = '';
    updateFooterPreview("");
}

// --- 3. LOGIKA STIKER ---
function spawnSticker(src) {
    const div = document.createElement('div');
    div.className = 'sticker-item selected';
    div.style.left = '50px'; div.style.top = '50px';
    div.dataset.rot = 0; 
    div.innerHTML = `
        <img src="${src}">
        <div class="sticker-ui">
            <div class="btn-ctrl btn-del">✕</div>
            <div class="btn-ctrl btn-rotate">↻</div>
            <div class="btn-ctrl btn-resize">↘</div>
        </div>
    `;
    div.querySelector('.btn-del').onmousedown = (e) => { e.stopPropagation(); div.remove(); };
    div.querySelector('.btn-del').ontouchstart = (e) => { e.stopPropagation(); div.remove(); };
    paperArea.appendChild(div);
    setupInteraction(div);
    highlightSticker(div);
}
function removeAllStickers() { document.querySelectorAll('.sticker-item').forEach(el => el.remove()); }
function highlightSticker(target) {
    document.querySelectorAll('.sticker-item').forEach(el => el.classList.remove('selected'));
    target.classList.add('selected');
}
document.addEventListener('mousedown', (e) => {
    if(!e.target.closest('.sticker-item') && !e.target.closest('.thumb')) {
        document.querySelectorAll('.sticker-item').forEach(el => el.classList.remove('selected'));
    }
});

function setupInteraction(el) {
    let mode = null; let startX, startY, startW, startRot, initialLeft, initialTop;
    el.addEventListener('mousedown', startDrag); el.addEventListener('touchstart', startDrag, {passive: false});
    const btnResize = el.querySelector('.btn-resize'); btnResize.addEventListener('mousedown', startResize); btnResize.addEventListener('touchstart', startResize, {passive: false});
    const btnRotate = el.querySelector('.btn-rotate'); btnRotate.addEventListener('mousedown', startRotate); btnRotate.addEventListener('touchstart', startRotate, {passive: false});
    function getEventPos(e) { if(e.touches) return { x: e.touches[0].clientX, y: e.touches[0].clientY }; return { x: e.clientX, y: e.clientY }; }
    function startDrag(e) { if(e.target.classList.contains('btn-ctrl')) return; mode = 'drag'; highlightSticker(el); const pos = getEventPos(e); startX = pos.x; startY = pos.y; initialLeft = el.offsetLeft; initialTop = el.offsetTop; bindEvents(); }
    function startResize(e) { e.stopPropagation(); mode = 'resize'; const pos = getEventPos(e); startX = pos.x; startW = el.offsetWidth; bindEvents(); }
    function startRotate(e) { e.stopPropagation(); mode = 'rotate'; const rect = el.getBoundingClientRect(); const cx = rect.left + rect.width/2; const cy = rect.top + rect.height/2; const pos = getEventPos(e); startRot = Math.atan2(pos.y - cy, pos.x - cx); bindEvents(); }
    function onMove(e) { if(!mode) return; e.preventDefault(); const pos = getEventPos(e); if(mode === 'drag') { el.style.left = (initialLeft + pos.x - startX) + 'px'; el.style.top = (initialTop + pos.y - startY) + 'px'; } else if(mode === 'resize') { const newW = Math.max(40, startW + pos.x - startX); el.style.width = newW + 'px'; el.style.height = newW + 'px'; } else if(mode === 'rotate') { const rect = el.getBoundingClientRect(); const cx = rect.left + rect.width/2; const cy = rect.top + rect.height/2; const currRot = Math.atan2(pos.y - cy, pos.x - cx); const deg = (currRot - startRot) * (180 / Math.PI); const currentDeg = parseFloat(el.dataset.rot || 0); el.style.transform = `rotate(${currentDeg + deg}deg)`; } }
    function onEnd(e) { if(mode === 'rotate') { const match = el.style.transform.match(/rotate\(([-0-9.]+)deg\)/); if(match) el.dataset.rot = parseFloat(match[1]); } mode = null; unbindEvents(); }
    function bindEvents() { document.addEventListener('mousemove', onMove); document.addEventListener('touchmove', onMove, {passive: false}); document.addEventListener('mouseup', onEnd); document.addEventListener('touchend', onEnd); }
    function unbindEvents() { document.removeEventListener('mousemove', onMove); document.removeEventListener('touchmove', onMove); document.removeEventListener('mouseup', onEnd); document.removeEventListener('touchend', onEnd); }
}

// --- 4. DOWNLOAD & RENDER (UPDATED: BY @1essvon) ---
function processDownload() {
    document.querySelectorAll('.sticker-item').forEach(el => el.classList.remove('selected'));
    const cvs = document.getElementById('cvs-final');
    const ctx = cvs.getContext('2d');

    const pad = 20; 
    const gap = 10;
    let headerH = 60; 
    const footerH = 60;
    
    let finalW, finalH;

    // --- CANVAS SIZING & PREP ---
    if (currentLayout === 'strip') {
        const colW = 200; 
        const photoH = 150; 
        headerH = 80; 
        finalW = pad + colW + pad; // 240px
        finalH = pad + headerH + (photoH * 4) + (gap * 3) + footerH + pad;
    } else {
        finalW = 400;
        const contentH = 290;
        finalH = pad + headerH + contentH + footerH + pad;
    }

    cvs.width = finalW; cvs.height = finalH;

    // --- BG & GRID ---
    ctx.fillStyle = "#f8fafc"; ctx.fillRect(0,0,finalW,finalH);
    ctx.fillStyle = "#94a3b8";
    for(let gx=0; gx<finalW; gx+=15) {
        for(let gy=0; gy<finalH; gy+=15) {
            ctx.beginPath(); ctx.arc(gx, gy, 1, 0, Math.PI*2); ctx.fill();
        }
    }
    ctx.lineWidth = 12; ctx.strokeStyle = "#1e293b"; ctx.strokeRect(0,0,finalW,finalH);
    
    // --- HEADER (FIXED: @1essvon) ---
    ctx.fillStyle = "#1e293b";
    
    if (currentLayout === 'strip') {
        // MODE STRIP
        ctx.font = "900 24px 'Noto Sans KR', sans-serif";
        ctx.fillText("인생", pad, pad + 30);
        ctx.fillText("네컷", pad, pad + 60);
        
        // Subtitle vertikal bertumpuk
        ctx.font = "bold 8px 'Courier Prime', monospace";
        ctx.fillText("By :", finalW - pad - 50, pad + 30);
        ctx.fillText("@1essvon", finalW - pad - 60, pad + 42);
        
    } else {
        // MODE ZIGZAG
        ctx.font = "900 24px 'Noto Sans KR', sans-serif";
        ctx.fillText("인생네컷", pad, pad + 35);
        
        // Subtitle satu baris
        ctx.font = "bold 10px 'Courier Prime', monospace";
        ctx.fillText("By : @1essvon", finalW - pad - 100, pad + 35);
    }
    
    ctx.beginPath(); ctx.moveTo(pad, pad+headerH-10); ctx.lineTo(finalW-pad, pad+headerH-10);
    ctx.lineWidth = 2; ctx.strokeStyle = "#334155"; ctx.stroke();

    // --- RENDER FOTO ---
    let loaded = 0;
    if(photos.length === 0) return;

    photos.forEach((src, i) => {
        const img = new Image();
        img.onload = () => {
            let x, y, w, h;
            const startY = pad + headerH;

            if (currentLayout === 'strip') {
                const photoH = 150;
                x = pad;
                y = startY + (i * (photoH + gap));
                w = 200; h = photoH;
            } else {
                const rowH = 140; 
                const colW_Small = 125; const colW_Big = 225;
                if(i === 0) { x = pad; y = startY; w = colW_Small; h = rowH; }
                else if(i === 1) { x = pad + colW_Small + gap; y = startY; w = colW_Big; h = rowH; }
                else if(i === 2) { x = pad; y = startY + rowH + gap; w = colW_Big; h = rowH; }
                else { x = pad + colW_Big + gap; y = startY + rowH + gap; w = colW_Small; h = rowH; }
            }

            ctx.fillStyle = "#e2e8f0"; ctx.fillRect(x,y,w,h);
            ctx.lineWidth = 8; ctx.strokeStyle = "white"; ctx.strokeRect(x,y,w,h);

            const sRatio = img.width / img.height;
            const dRatio = w / h;
            let sw = img.width, sh = img.height, sx=0, sy=0;
            if(sRatio > dRatio) { sw = img.height * dRatio; sx = (img.width - sw)/2; }
            else { sh = img.width / dRatio; sy = (img.height - sh)/2; }

            ctx.drawImage(img, sx, sy, sw, sh, x+4, y+4, w-8, h-8);

            loaded++;
            if(loaded === photos.length) renderStickersAndQR(ctx, finalW, finalH);
        };
        img.src = src;
    });
}

function renderStickersAndQR(ctx, finalW, finalH) {
    const stickers = document.querySelectorAll('.sticker-item');
    const paperRect = document.getElementById('paper-area').getBoundingClientRect();
    
    const scaleX = finalW / paperRect.width;
    const scaleY = finalH / paperRect.height;
    
    let stickersReady = 0; const total = stickers.length;

    const finish = () => {
        const userText = document.getElementById('user-caption').value || "Enjoy Your Moments";
        ctx.fillStyle = "#1e293b"; 
        ctx.font = "bold 16px 'Courier Prime', monospace"; 
        ctx.textAlign = "left";
        ctx.fillText(document.getElementById('date-text').innerText, 25, finalH - 45);
        
        ctx.fillStyle = "#64748b"; 
        ctx.font = "10px 'Courier Prime', monospace";
        ctx.fillText(userText, 25, finalH - 25);

        saveImage(ctx);
    };

    if(total === 0) { finish(); return; }

    stickers.forEach(el => {
        const img = new Image();
        img.src = el.querySelector('img').src;
        img.onload = () => {
            const relX = el.offsetLeft; const relY = el.offsetTop;
            const w = el.offsetWidth; const h = el.offsetHeight;
            const rot = parseFloat(el.dataset.rot || 0);

            ctx.save();
            const cx = (relX + w/2) * scaleX; const cy = (relY + h/2) * scaleY;
            ctx.translate(cx, cy); ctx.rotate(rot * Math.PI / 180);
            ctx.drawImage(img, (-w/2)*scaleX, (-h/2)*scaleY, w*scaleX, h*scaleY);
            ctx.restore();

            stickersReady++;
            if(stickersReady === total) finish();
        };
    });
}

function saveImage(ctx) {
    const link = document.createElement('a');
    link.download = `1essvon-photobooth-${Date.now()}.png`;
    link.href = ctx.canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}