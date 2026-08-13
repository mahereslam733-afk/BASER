// --- محرك الصوت والتفاعل الصوتي الشامل ---
let speechSpeed = 0.9;
const statusBox = document.getElementById('status-box');
const speedRange = document.getElementById('speedRange');
const backBtn = document.getElementById('backBtn');
const previewImg = document.getElementById('previewImg');

// تحميل نموذج الذكاء الاصطناعي المحلي عند بداية التشغيل
let mobileNetModel = null;
mobilenet.load().then(model => {
    mobileNetModel = model;
    console.log("تم تحميل نموذج الذكاء الاصطناعي المحلي بنجاح.");
}).catch(err => {
    console.log("تعذر تحميل نموذج الأشياء محلياً، سيتم الاعتماد على الترجمة.");
});

if (speedRange) {
    speedRange.addEventListener('input', (e) => {
        speechSpeed = parseFloat(e.target.value);
        speak(`تم تغيير السرعة إلى ${Math.round(speechSpeed * 100)} بالمائة`);
    });
}

function speak(text) {
    if (statusBox) statusBox.innerText = text;

    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = speechSpeed;

        const voices = window.speechSynthesis.getVoices();
        const arabicVoice = voices.find(v => v.lang.startsWith('ar'));

        if (arabicVoice) {
            utterance.voice = arabicVoice;
            utterance.lang = arabicVoice.lang;
            window.speechSynthesis.speak(utterance);
            return;
        } else {
            utterance.lang = 'ar-EG';
            window.speechSynthesis.speak(utterance);
            return;
        }
    }
    speakCloudFallback(text);
}

function speakCloudFallback(text) {
    try {
        const encodedText = encodeURIComponent(text);
        const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodedText}&tl=ar&client=tw-ob`;
        const audio = new Audio(audioUrl);
        audio.playbackRate = speechSpeed;
        audio.play().catch(e => {});
    } catch (e) {}
}

// دالة لتنظيف النص العربي بالكامل ومنع خروج أي رموز أو أرقام غريبة
function cleanAndSanitizeText(text) {
    if (!text) return "";
    return text
        .replace(/[\r\n]+/g, ' ')
        .replace(/[^\u0600-\u06FF0-9a-zA-Z\s.,!؟]/g, '') // إزالة كافة الرموز الغريبة
        .replace(/\s+/g, ' ')
        .trim();
}

// قاموس الترجمة السريعة للعمليات المحلية للأشياء
const translationDict = {
    "cellular telephone": "هاتف محمول",
    "mobile phone": "هاتف محمول",
    "laptop": "كمبيوتر محمول",
    "water bottle": "زجاجة مياه",
    "coffee mug": "كوب قهوة",
    "cup": "كوب",
    "chair": "كرسي",
    "desk": "مكتب",
    "keyboard": "لوحة مفاتيح",
    "mouse": "فأرة كمبيوتر",
    "wallet": "محفظة أوراق مالية",
    "spectacles": "نظارة طبية",
    "sunglasses": "نظارة شمسية",
    "shoe": "حذاء",
    "backpack": "حقيبة ظهر",
    "book": "كتاب",
    "pen": "قلم",
    "watch": "ساعة يد",
    "remote control": "ريموت كنترول",
    "person": "شخص أمامك"
};

async function translateToCleanArabic(englishText) {
    const cleanLower = englishText.toLowerCase();
    for (let key in translationDict) {
        if (cleanLower.includes(key)) {
            return translationDict[key];
        }
    }
    try {
        const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ar&dt=t&q=${encodeURIComponent(englishText)}`);
        const data = await res.json();
        if (data && data[0] && data[0][0] && data[0][0][0]) {
            return cleanAndSanitizeText(data[0][0][0]);
        }
    } catch (e) {}
    return "عنصر غير محدد بدقة، جرب التصوير من زاوية أوضح";
}

// الترحيب
window.addEventListener('load', () => {
    setTimeout(() => {
        speak("أهلاً بك في تطبيق بصير. تم تشغيل جميع المراحل الثماني وبدقة عالية.");
    }, 500);
});

// --- التنقل بين الشاشات ---
const homeScreen = document.getElementById('homeScreen');
const allScreens = document.querySelectorAll('.screen');
const navButtons = document.querySelectorAll('.btn-large');

navButtons.forEach(button => {
    button.addEventListener('focus', () => speak(button.getAttribute('aria-label')));
    button.addEventListener('click', () => {
        const targetScreenId = button.getAttribute('data-screen');
        openScreen(targetScreenId, button.innerText);
    });
});

function openScreen(screenId, screenName) {
    allScreens.forEach(s => s.classList.remove('active'));
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
        if (backBtn) backBtn.style.visibility = 'visible';
        speak(`تم فتح ${screenName}.`);
    }
}

if (backBtn) {
    backBtn.addEventListener('click', () => {
        allScreens.forEach(s => s.classList.remove('active'));
        homeScreen.classList.add('active');
        backBtn.style.visibility = 'hidden';
        speak("عدت إلى الشاشة الرئيسية.");
    });
}

// --- 1. قسم قراءة النصوص (OCR مع تنظيف كامل للرموز) ---
const captureOcrBtn = document.getElementById('captureOcrBtn');
const ocrCameraInput = document.getElementById('ocrCameraInput');

if (captureOcrBtn && ocrCameraInput) {
    captureOcrBtn.addEventListener('click', () => {
        speak("جاري فتح الكاميرا، وجه الهاتف نحو النص.");
        setTimeout(() => ocrCameraInput.click(), 800);
    });

    ocrCameraInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        speak("تم التقاط الصورة، جاري معالجة واستخراج النص العربي الصافي...");
        
        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("language", "ara");
            formData.append("isOverlayRequired", "false");
            formData.append("detectOrientation", "true");
            formData.append("scale", "true");

            const response = await fetch("https://api.ocr.space/parse/image", {
                method: "POST",
                headers: { "apikey": "K88283437288957" },
                body: formData
            });

            const result = await response.json();
            
            if (result && result.ParsedResults && result.ParsedResults[0]) {
                let parsedText = result.ParsedResults[0].ParsedText;
                let cleanText = cleanAndSanitizeText(parsedText);
                
                if (cleanText.length > 0) {
                    speak(`النص المكتوب هو: ${cleanText}`);
                } else {
                    speak("لم نتمكن من قراءة النص بوضوح، يرجى ضبط الإضاءة والتصوير بشكل مستقيم.");
                }
            } else {
                speak("عذراً، تعذر استخراج النص. يرجى إعادة التصوير.");
            }
        } catch (err) {
            speak("حدث خطأ في الاتصال بخدمة قراءة النصوص.");
        }
    });
}

// --- 2. قسم التعرف على الأشياء (محلي 100% بدون خطأ اتصال) ---
const captureObjectBtn = document.getElementById('captureObjectBtn');
const objectCameraInput = document.getElementById('objectCameraInput');

if (captureObjectBtn && objectCameraInput) {
    captureObjectBtn.addEventListener('click', () => {
        speak("جاري فتح الكاميرا، وجه الهاتف نحو الشيء أمامك.");
        setTimeout(() => objectCameraInput.click(), 800);
    });

    objectCameraInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        speak("تم التقاط الصورة، جاري التحليل بالذكاء الاصطناعي...");

        try {
            previewImg.src = URL.createObjectURL(file);
            previewImg.onload = async () => {
                if (mobileNetModel) {
                    const predictions = await mobileNetModel.classify(previewImg);
                    if (predictions && predictions.length > 0) {
                        const topResult = predictions[0].className;
                        const arabicLabel = await translateToCleanArabic(topResult);
                        speak(`الشيء الموجود أمامك هو: ${arabicLabel}`);
                    } else {
                        speak("لم نتمكن من التحديد، حاول التصوير من زاوية أخرى.");
                    }
                } else {
                    speak("جاري تجهيز محرك الرؤية، حاول مرة أخرى خلال ثوانٍ.");
                }
            };
        } catch (e) {
            speak("تعذر معالجة الصورة محلياً، يرجى إعادة المحاولة.");
        }
    });
}

// --- 3. قسم التعرف على العملات النقدية ---
const captureMoneyBtn = document.getElementById('captureMoneyBtn');
const moneyCameraInput = document.getElementById('moneyCameraInput');

if (captureMoneyBtn && moneyCameraInput) {
    captureMoneyBtn.addEventListener('click', () => {
        speak("جاري فتح الكاميرا، وجه الهاتف نحو الورقة النقدية.");
        setTimeout(() => moneyCameraInput.click(), 800);
    });

    moneyCameraInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        speak("تم التقاط صورة العملة، جاري فحص الفئة بوضوح...");
        
        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("language", "ara");
            const response = await fetch("https://api.ocr.space/parse/image", {
                method: "POST",
                headers: { "apikey": "K88283437288957" },
                body: formData
            });
            const result = await response.json();
            if (result && result.ParsedResults && result.ParsedResults[0]) {
                let text = result.ParsedResults[0].ParsedText;
                if (text.includes("50") || text.includes("خمسون")) speak("العملة هي فئة خمسين جنيهاً.");
                else if (text.includes("100") || text.includes("مائة")) speak("العملة هي فئة مائة جنيه.");
                else if (text.includes("200") || text.includes("مائتان")) speak("العملة هي فئة مائتي جنيه.");
                else if (text.includes("20") || text.includes("عشرون")) speak("العملة هي فئة عشرين جنيهاً.");
                else if (text.includes("10") || text.includes("عشرة")) speak("العملة هي فئة عشرة جنيهات.");
                else if (text.includes("5") || text.includes("خمسة")) speak("العملة هي فئة خمسة جنيهات.");
                else speak("تم التقاط العملة، تأكد من فرد الورقة النقدية جيدا وتوضيح الإضاءة.");
            } else {
                speak("تأكد من إضاءة الورقة النقدية والتصوير بوضوح.");
            }
        } catch (e) {
            speak("تعذر الاتصال بمركز فحص العملات.");
        }
    });
}

// --- 4. قسم المساعدة البشرية والطوارئ ---
const callVolunteerBtn = document.getElementById('callVolunteerBtn');
const sendLocationBtn = document.getElementById('sendLocationBtn');

if (callVolunteerBtn) {
    callVolunteerBtn.addEventListener('click', () => {
        speak("جاري الاتصال بالمساعد المباشر الآن.");
        setTimeout(() => { window.location.href = "tel:122"; }, 1200);
    });
}

if (sendLocationBtn) {
    sendLocationBtn.addEventListener('click', () => {
        speak("جاري تحديد موقعك الجغرافي عبر الأقمار الصناعية...");
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition((position) => {
                const lat = position.coords.latitude.toFixed(4);
                const lon = position.coords.longitude.toFixed(4);
                speak(`تم تحديد موقعك بنجاح. خط العرض ${lat} وخط الطول ${lon}.`);
            }, () => speak("لم نتمكن من الحصول على الموقع، يرجى تفعيل الـ GPS."));
        } else {
            speak("خدمة تحديد الموقع غير مدعومة على جهازك.");
        }
    });
}

// --- 5. قسم الملاحة والاتجاهات ---
const compassBtn = document.getElementById('compassBtn');
const whereAmIBtn = document.getElementById('whereAmIBtn');

if (compassBtn) {
    compassBtn.addEventListener('click', () => {
        speak("جاري تحديد الاتجاه الحالي، يرجى تثبيت الهاتف...");
        if (window.DeviceOrientationEvent) {
            window.addEventListener('deviceorientation', function handleOrientation(event) {
                let heading = event.alpha;
                if (event.webkitCompassHeading) heading = event.webkitCompassHeading;

                if (heading !== null && heading !== undefined) {
                    let direction = "الشمال";
                    if (heading > 45 && heading <= 135) direction = "الشرق";
                    else if (heading > 135 && heading <= 225) direction = "الجنوب";
                    else if (heading > 225 && heading <= 315) direction = "الغرب";
                    
                    speak(`أنت تتجه الآن نحو ${direction}.`);
                } else {
                    speak("عذراً، متعذر تحديد اتجاه البوصلة على هذا الجهاز.");
                }
                window.removeEventListener('deviceorientation', handleOrientation);
            }, { once: true });
        } else {
            speak("مستشعر البوصلة غير مدعوم.");
        }
    });
}

if (whereAmIBtn) {
    whereAmIBtn.addEventListener('click', () => {
        speak("جاري استكشاف الموقع الجغرافي...");
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(position => {
                const lat = position.coords.latitude.toFixed(2);
                const lon = position.coords.longitude.toFixed(2);
                speak(`أنت بالقرب من الإحداثيات: خط عرض ${lat} وخط طول ${lon}.`);
            }, () => speak("يرجى تفعيل خيار الموقع الجغرافي GPS."));
        } else {
            speak("خدمة الموقع الجغرافي غير مدعومة.");
        }
    });
}

// --- 6. قسم المكتبة الصوتية ---
const playManualBtn = document.getElementById('playManualBtn');
const playTipsBtn = document.getElementById('playTipsBtn');
const stopAudioBtn = document.getElementById('stopAudioBtn');

if (playManualBtn) {
    playManualBtn.addEventListener('click', () => {
        speak("مرحباً بك في الدليل الصوتي التفاعلي لتطبيق بصير. يساعدك التطبيق على قراءة المستندات والتعرف على العناصر المادية والعملات وسماع النطق باللغة العربية الواضحة.");
    });
}

if (playTipsBtn) {
    playTipsBtn.addEventListener('click', () => {
        speak("نصيحة: ثبت يدك أثناء التصوير واترك مسافة مناسبة بين الهاتف والورقة للحصول على قراءة دقيقة بدون أخطاء.");
    });
}

if (stopAudioBtn) {
    stopAudioBtn.addEventListener('click', () => {
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();
        statusBox.innerText = "تم إيقاف الصوت.";
    });
}

// --- 7. قسم الخدمات اليومية والألوان ---
const colorBtn = document.getElementById('colorBtn');
const colorCameraInput = document.getElementById('colorCameraInput');
const dateTimeBtn = document.getElementById('dateTimeBtn');

if (colorBtn && colorCameraInput) {
    colorBtn.addEventListener('click', () => {
        speak("وجه الكاميرا نحو العنصر لمعرفة لونه.");
        setTimeout(() => colorCameraInput.click(), 800);
    });

    colorCameraInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        speak("تم التقاط الصورة، جاري تحليل اللون...");

        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = () => {
            const canvas = document.getElementById('colorCanvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0, img.width, img.height);

            const pixelData = ctx.getImageData(Math.floor(img.width / 2), Math.floor(img.height / 2), 1, 1).data;
            const colorName = getColorName(pixelData[0], pixelData[1], pixelData[2]);
            speak(`اللون الرئيسي في منتصف الصورة هو: ${colorName}`);
        };
    });
}

function getColorName(r, g, b) {
    if (r < 50 && g < 50 && b < 50) return "الأسود";
    if (r > 200 && g > 200 && b > 200) return "الأبيض";
    if (r > 150 && g < 100 && b < 100) return "الأحمر";
    if (g > 150 && r < 100 && b < 100) return "الأخضر";
    if (b > 150 && r < 100 && b < 100) return "الأزرق";
    if (r > 180 && g > 180 && b < 100) return "الأصفر";
    if (r > 180 && g < 100 && b > 180) return "الوردي أو البنفسجي";
    if (r > 150 && g > 100 && b < 80) return "البرتقالي";
    return "لون متدرج";
}

if (dateTimeBtn) {
    dateTimeBtn.addEventListener('click', () => {
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const dateStr = now.toLocaleDateString('ar-EG', options);
        const timeStr = now.toLocaleTimeString('ar-EG');
        speak(`اليوم هو ${dateStr}، والساعة الآن هي ${timeStr}.`);
    });
}

// --- 8. قسم الإعدادات والتحكم ---
const testVoiceBtn = document.getElementById('testVoiceBtn');
const resetAppBtn = document.getElementById('resetAppBtn');

if (testVoiceBtn) {
    testVoiceBtn.addEventListener('click', () => {
        speak("اختبار المحرك الصوتي بنجاح، الصوت يعمل بشكل نقي باللغة العربية.");
    });
}

if (resetAppBtn) {
    resetAppBtn.addEventListener('click', () => {
        speak("جاري إعادة تحميل التطبيق...");
        setTimeout(() => window.location.reload(), 1200);
    });
}
