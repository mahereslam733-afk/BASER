const statusBox = document.getElementById('status-box');

function speak(text) {
    statusBox.innerText = text;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ar-EG';
    window.speechSynthesis.speak(utterance);
}

function openScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    speak("تم فتح الشاشة المطلوبة");
}

// 1. القراءة
document.getElementById('ocrInput').addEventListener('change', async (e) => {
    speak("جاري القراءة، انتظر قليلاً...");
    const res = await Tesseract.recognize(e.target.files[0], 'ara');
    speak(res.data.text || "لم أجد نصاً واضحاً");
});

// 2. فحص الأشياء
document.getElementById('objInput').addEventListener('change', async (e) => {
    speak("جاري التحليل...");
    const formData = new FormData();
    formData.append("file", e.target.files[0]);
    const res = await fetch("https://api.ocr.space/parse/image", {
        method: "POST", headers: { "apikey": "K88283437288957" }, body: formData
    });
    const data = await res.json();
    const txt = data.ParsedResults?.[0]?.ParsedText || "";
    speak(txt ? "هذا الشيء هو: " + txt : "عنصر غير محدد بدقة");
});

// 3. العملات
document.getElementById('moneyInput').addEventListener('change', async (e) => {
    const res = await Tesseract.recognize(e.target.files[0], 'eng');
    const txt = res.data.text;
    if (txt.includes("50")) speak("فئة خمسون جنيهاً");
    else if (txt.includes("100")) speak("فئة مائة جنيه");
    else speak("غير متأكد، حاول مرة أخرى");
});

// 5. الاتجاهات
function getDirection() {
    if (window.DeviceOrientationEvent) {
        window.addEventListener('deviceorientation', (e) => {
            const alpha = e.webkitCompassHeading || e.alpha;
            let dir = alpha < 90 ? "الشمال" : "الجنوب";
            speak("أنت تتجه نحو " + dir);
        }, { once: true });
    }
}

// 7. الألوان
document.getElementById('colorInput').addEventListener('change', (e) => {
    const reader = new FileReader();
    reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.getElementById('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width; canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            const data = ctx.getImageData(img.width/2, img.height/2, 1, 1).data;
            speak(data[0] > 150 ? "اللون أحمر" : "لون غير محدد");
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(e.target.files[0]);
});

window.onload = () => speak("تم تحميل التطبيق بنجاح");
