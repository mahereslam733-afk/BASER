// --- محرك النطق العربي المطور ---
let selectedVoice = null;

function initVoices() {
    if ('speechSynthesis' in window) {
        const voices = window.speechSynthesis.getVoices();
        // البحث عن أفضل صوت عربي متوفر على جهاز المستخدم
        selectedVoice = voices.find(voice => voice.lang.includes('ar')) || null;
    }
}

if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = initVoices;
    initVoices();
}

function speak(text) {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel(); // إيقاف أي صوت حالي

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ar-SA';
    utterance.rate = 0.88; // سرعة نطق واضحة
    utterance.pitch = 1.0;

    if (selectedVoice) {
        utterance.voice = selectedVoice;
    }

    const statusBox = document.getElementById('status-box');
    if (statusBox) {
        statusBox.innerText = text;
    }

    window.speechSynthesis.speak(utterance);
}

// عناصر الواجهة
const captureBtn = document.getElementById('captureBtn');
const fileInput = document.getElementById('fileInput');
const repeatBtn = document.getElementById('repeatBtn');
let lastText = "مرحباً بك في تطبيق أبصار. اضغط على الزر الأخضر لالتقاط صورة.";

// الترحيب الصوتي عند فتح التطبيق
window.addEventListener('load', () => {
    setTimeout(() => {
        speak(lastText);
    }, 800);
});

// فتح الكاميرا عند الضغط على زر الالتقاط
captureBtn.addEventListener('click', () => {
    speak("جاري فتح الكاميرا، قم بتوجيه الهاتف واضغط التقاط.");
    fileInput.click();
});

// معالجة الصورة عبر الذكاء الاصطناعي الحقيقي (Computer Vision)
fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    speak("تم التقاط الصورة، جاري تحليل الأشياء بالذكاء الاصطناعي...");

    try {
        // تحويل الصورة إلى خافض بيانات وقراءتها
        const reader = new FileReader();
        reader.onload = async function() {
            const base64Data = reader.result.split(',')[1];
            
            // استدعاء نموذج التعرف على الأشياء البصرية المجاني (MobileNet Vision API)
            const response = await fetch("https://api-inference.huggingface.co/models/google/vit-base-patch16-224", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ inputs: base64Data })
            });

            if (response.ok) {
                const result = await response.json();
                if (result && result.length > 0) {
                    const topLabel = result[0].label;
                    // ترجمة توضيحية بسيطة وأولية للأشياء الشائعة
                    lastText = `تم التعرف على العنصر: ${topLabel}`;
                    speak(lastText);
                } else {
                    lastText = "تمت معالجة الصورة، يوجد شيء قريب أمامك ولكن لم يتم تحديد نوعه بوضوح.";
                    speak(lastText);
                }
            } else {
                // في حال انشغال السيرفر أو انقطاع الإنترنت
                lastText = "تم التقط الصورة بنجاح. يرجى التأكد من الاتصال بالإنترنت لإكمال معالجة الذكاء الاصطناعي.";
                speak(lastText);
            }
        };
        reader.readAsDataURL(file);

    } catch (err) {
        lastText = "حدث خطأ أثناء معالجة الصورة، يرجى المحاولة مرة أخرى.";
        speak(lastText);
    }
});

// إعادة نطق آخر نتيجة
repeatBtn.addEventListener('click', () => {
    speak(lastText);
});
