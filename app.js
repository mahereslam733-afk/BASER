let model;
const video = document.getElementById('webcam');
const canvas = document.getElementById('outputCanvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');
const statusBox = document.getElementById('statusBox');

let isDetecting = false;
let lastSpokenText = "";

// قاموس ترجمة العناصر المكتشفة للعربية
const labelsTranslation = {
  "person": "شخص",
  "cell phone": "هاتف",
  "laptop": "حاسوب محمول",
  "chair": "كرسي",
  "bottle": "زجاجة",
  "cup": "كوب",
  "book": "كتاب",
  "mouse": "فأرة",
  "keyboard": "لوحة مفاتيح",
  "backpack": "حقيبة",
  "car": "سيارة",
  "dog": "كلب",
  "cat": "قطة",
  "tv": "تلفاز",
  "clock": "ساعة"
};

// 1. تحميل نموذج الذكاء الاصطناعي (COCO-SSD)
async function initModel() {
  try {
    model = await cocoSsd.load();
    statusBox.innerText = "جاهز للعمل! اضغط ابدأ للتعرف على الأشياء.";
    startBtn.disabled = false;
  } catch (error) {
    statusBox.innerText = "خطأ في تحميل النموذج، تحقق من الاتصال.";
    console.error("Model load error:", error);
  }
}

// 2. إعداد الكاميرا مع خيار مرن لعدم إحداث خطأ OverconstrainedError
async function setupCamera() {
  const constraints = {
    video: {
      facingMode: { ideal: "environment" }, // استخدام ideal بدلاً من exact
      width: { ideal: 640 },
      height: { ideal: 480 }
    },
    audio: false
  };

  const stream = await navigator.mediaDevices.getUserMedia(constraints);
  video.srcObject = stream;

  return new Promise((resolve) => {
    video.onloadedmetadata = () => resolve(video);
  });
}

// 3. النطق الصوتي باللغة العربية
function speak(text) {
  if ('speechSynthesis' in window && text !== lastSpokenText) {
    window.speechSynthesis.cancel(); // إيقاف الصوت السائل لتفادي التداخل
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ar-SA';
    utterance.rate = 0.9; // سرعة نطق مناسبة
    window.speechSynthesis.speak(utterance);
    lastSpokenText = text;
  }
}

// 4. خوارزمية التعرف المباشر والرسم
async function detectObjects() {
  if (!isDetecting) return;

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const predictions = await model.detect(video);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  let currentFrameObjects = [];

  predictions.forEach(prediction => {
    if (prediction.score > 0.60) { // دقة إيجابية أكثر من 60%
      const [x, y, width, height] = prediction.bbox;
      const englishLabel = prediction.class;
      const arabicLabel = labelsTranslation[englishLabel] || englishLabel;

      if (!currentFrameObjects.includes(arabicLabel)) {
        currentFrameObjects.push(arabicLabel);
      }

      // رسم الإطار حول الشيء المكتشف
      ctx.strokeStyle = '#00e676';
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, width, height);

      // رسم خلفية النص
      ctx.fillStyle = '#00e676';
      const textWidth = ctx.measureText(arabicLabel).width;
      ctx.fillRect(x, y > 20 ? y - 25 : 0, textWidth + 12, 25);

      // كتابة اسم الشيء بالعربية
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 16px Arial';
      ctx.fillText(arabicLabel, x + 5, y > 20 ? y - 7 : 18);
    }
  });

  // نطق الأشياء المكتشفة
  if (currentFrameObjects.length > 0) {
    const textToSpeak = "أمامي: " + currentFrameObjects.join(" و ");
    speak(textToSpeak);
    statusBox.innerText = textToSpeak;
  } else {
    statusBox.innerText = "جاري المسح...";
  }

  // إعادة الفحص بانتظام
  setTimeout(() => {
    requestAnimationFrame(detectObjects);
  }, 1800);
}

// 5. زر التفعيل
startBtn.addEventListener('click', async () => {
  try {
    startBtn.disabled = true;
    statusBox.innerText = "جاري فتح الكاميرا...";
    await setupCamera();
    video.play();
    isDetecting = true;
    statusBox.innerText = "الكاميرا تعمل، جاري التعرف على الأشياء...";
    detectObjects();
  } catch (err) {
    statusBox.innerText = "تعذر الوصول للكاميرا، تأكد من الأذونات.";
    console.error("Camera access error:", err);
    startBtn.disabled = false;
  }
});

// تشغيل التهيئة عند فتح الصفحة
initModel();
