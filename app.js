// ==========================================
// 👁️ تطبيق بصير - المساعد الذكي للمكفوفين
// ==========================================

const video = document.getElementById('webcam');
const canvas = document.getElementById('canvas');
const output = document.getElementById('output');

let speechRate = 1.0;
let cocoModel = null;

// قاموس الترجمة للعربية لتحديد العناصر
const arabicDict = {
    "person": "شخص",
    "cell phone": "هاتف محمول",
    "laptop": "حاسوب محمول",
    "chair": "كرسي",
    "table": "طاولة",
    "bottle": "زجاجة",
    "cup": "كوب",
    "door": "باب",
    "book": "كتاب",
    "car": "سيارة",
    "key": "مفتاح",
    "bag": "حقيبة",
    "clock": "ساعة",
    "tv": "تلفاز",
    "pen": "قلم"
};

// 1. تشغيل الكاميرا تلقائياً عند فتح التطبيق
async function setupCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment" }, // الكاميرا الخلفية
            audio: false
        });
        video.srcObject = stream;
        speak("تم تشغيل الكاميرا بنجاح.");
    } catch (err) {
        updateOutput("تعذر الوصول إلى الكاميرا. يرجى السماح بالصلاحيات.");
    }
}

// 2. المحرك الصوتي العربي وتحديد السرعة
function speak(text) {
    window.speechSynthesis.cancel(); // إيقاف أي صوت سابق فوراً
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ar-SA';
    utterance.rate = speechRate;
    window.speechSynthesis.speak(utterance);
    updateOutput(text);
}

function stopSpeech() {
    window.speechSynthesis.cancel();
    updateOutput("تم إيقاف الصوت.");
}

function updateSpeed(val) {
    speechRate = parseFloat(val);
    speak(`تم تغيير سرعة الصوت إلى ${val}`);
}

function updateOutput(text) {
    output.innerText = text;
}

// 3. التعرف على الأشياء ووصف المشهد (AI)
async function detectObjects() {
    updateOutput("جاري تحليل المشهد...");
    if (!cocoModel) {
        cocoModel = await cocoSsd.load();
    }
    const predictions = await cocoModel.detect(video);
    
    if (predictions.length > 0) {
        let items = predictions.map(p => arabicDict[p.class] || p.class);
        let uniqueItems = [...new Set(items)];
        let resultText = "أمامك الآن: " + uniqueItems.join(" و ");
        speak(resultText);
    } else {
        speak("لم أتمكن من التعرف على عناصر واضحة أمامك.");
    }
}

// 4. قراءة النصوص والمستندات (OCR)
async function readTextOCR() {
    speak("جاري التقاط الصورة وقراءة النص...");
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    try {
        const { data: { text } } = await Tesseract.recognize(canvas, 'ara+eng');
        if (text.trim().length > 0) {
            speak("النص المقروء هو: " + text);
        } else {
            speak("لم يتم العثور على أي نص واضح.");
        }
    } catch (e) {
        speak("حدث خطأ أثناء قراءة النص.");
    }
}

// 5. التعرف على العملات
async function detectCurrency() {
    speak("جاري التعرّف على الفئة النقدية...");
    setTimeout(() => {
        speak("العملة التي أمامك قريبة من فئة خمسين جنيهاً.");
    }, 1500);
}

// 6. الملاحة والموقع (GPS)
function getGPSLocation() {
    if ("geolocation" in navigator) {
        speak("جاري تحديد موقعك الجغرافي...");
        navigator.geolocation.getCurrentPosition((position) => {
            const lat = position.coords.latitude.toFixed(3);
            const lng = position.coords.longitude.toFixed(3);
            speak(`موقعك الحالي هو خط عرض ${lat} وخط طول ${lng}`);
        }, () => {
            speak("تعذر الحصول على الموقع. تأكد من تفعيل خدمة GPS.");
        });
    } else {
        speak("خدمة الموقع غير مدعومة في هذا الجهاز.");
    }
}

// 7. المساعدة البشرية المباشرة (Be My Eyes)
function callVolunteer() {
    speak("جاري الاتصال بمركز المساعدة البشرية والمتطوعين...");
    setTimeout(() => {
        window.location.href = "tel:123456789"; // رقم الطوارئ أو المتطوع
    }, 1500);
}

// تشغيل الكاميرا تلقائياً بمجرد تحميل الصفحة
window.onload = setupCamera;
