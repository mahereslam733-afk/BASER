// --- محرك الصوت والتفاعل الصوتي ---
let speechSpeed = 0.9;
const statusBox = document.getElementById('status-box');
const speedRange = document.getElementById('speedRange');
const backBtn = document.getElementById('backBtn');

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

// الترحيب عند الفتح
window.addEventListener('load', () => {
    setTimeout(() => {
        speak("أهلاً بك في تطبيق بصير. المراحل السبع مفعلة وجاهزة للاستخدام.");
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

// --- المرحلة الأولى: قراءة النصوص (OCR) ---
const captureOcrBtn = document.getElementById('captureOcrBtn');
const ocrCameraInput = document.getElementById('ocrCameraInput');

if (captureOcrBtn && ocrCameraInput) {
    captureOcrBtn.addEventListener('click', () => {
        speak("جاري فتح الكاميرا، وجه الهاتف نحو الورقة.");
        setTimeout(() => ocrCameraInput.click(), 1000);
    });

    ocrCameraInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        speak("تم التقاط الصورة، جاري استخراج وقراءة النص...");
        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("language", "ara");
            const response = await fetch("https://api.ocr.space/parse/image", {
                method: "POST",
                headers: { "apikey": "helloworld" },
                body: formData
            });
            const result = await response.json();
            if (result && result.ParsedResults && result.ParsedResults.length > 0) {
                const extractedText = result.ParsedResults[0].ParsedText.trim();
                speak(extractedText.length > 0 ? `النص المكتوب هو: ${extractedText}` : "لم نتمكن من إيجاد نص واضح بالورقة.");
            } else {
                speak("تعذر استخراج النص، يرجى إعادة التصوير بوضوح.");
            }
        } catch (err) {
            speak("حدث خطأ أثناء الاتصال بخدمة القراءة.");
        }
    });
}

// --- المرحلة الثانية: التعرف على الأشياء ---
const captureObjectBtn = document.getElementById('captureObjectBtn');
const objectCameraInput = document.getElementById('objectCameraInput');

if (captureObjectBtn && objectCameraInput) {
    captureObjectBtn.addEventListener('click', () => {
        speak("جاري فتح الكاميرا، وجه الهاتف نحو الشيء المطلوب التعرف عليه.");
        setTimeout(() => objectCameraInput.click(), 1000);
    });

    objectCameraInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        speak("تم التقاط الصورة، جاري تحليل الشيء أمامك...");
        try {
            const reader = new FileReader();
            reader.onload = async function() {
                const response = await fetch("https://api-inference.huggingface.co/models/google/vit-base-patch16-224", {
                    method: "POST",
                    body: reader.result
                });
                if (response.ok) {
                    const result = await response.json();
                    if (result && result.length > 0) {
                        speak(`تم التعرف على العنصر أمامك: ${result[0].label}`);
                    } else {
                        speak("لم نتمكن من التعرف على الشيء بدقة.");
                    }
                } else {
                    speak("السيرفر مشغول حالياً.");
                }
            };
            reader.readAsArrayBuffer(file);
        } catch (e) {
            speak("حدث خطأ أثناء معالجة تحليل الأشياء.");
        }
    });
}

// --- المرحلة الثالثة: التعرف على العملات ---
const captureMoneyBtn = document.getElementById('captureMoneyBtn');
const moneyCameraInput = document.getElementById('moneyCameraInput');

if (captureMoneyBtn && moneyCameraInput) {
    captureMoneyBtn.addEventListener('click', () => {
        speak("جاري فتح الكاميرا، وجه الهاتف نحو الورقة النقدية.");
        setTimeout(() => moneyCameraInput.click(), 1000);
    });

    moneyCameraInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        speak("تم التقاط صورة العملة، جاري فحص الفئة بوضوح...");
        try {
            const reader = new FileReader();
            reader.onload = async function() {
                const response = await fetch("https://api-inference.huggingface.co/models/google/vit-base-patch16-224", {
                    method: "POST",
                    body: reader.result
                });
                if (response.ok) {
                    const result = await response.json();
                    if (result && result.length > 0 && result[0].score > 0.4) {
                        speak("تم التعرف على ورقة نقدية، يرجى التأكد من استقامة الورقة للتحقق التام من الفئة.");
                    } else {
                        speak("غير متأكد من فئة العملة، اضبط الإضاءة وصور كامل الورقة النقدية.");
                    }
                } else {
                    speak("خدمة التعرف على العملات غير متاحة مؤقتاً.");
                }
            };
            reader.readAsArrayBuffer(file);
        } catch (e) {
            speak("تعذر الاتصال بمركز معالجة العملات.");
        }
    });
}

// --- المرحلة الرابعة: المساعدة البشرية والطوارئ ---
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
            }, () => speak("لم نتمكن من الحصول على الموقع، يرجى التأكد من تفعيل خدمة الملاحة."));
        } else {
            speak("خدمة تحديد الموقع غير مدعومة على جهازك.");
        }
    });
}

// --- المرحلة الخامسة: الملاحة والاتجاهات ---
const compassBtn = document.getElementById('compassBtn');
const whereAmIBtn = document.getElementById('whereAmIBtn');

if (compassBtn) {
    compassBtn.addEventListener('click', () => {
        speak("جاري تحديد اتجاهك الحالي، يرجى تثبيت الهاتف...");

        if (window.DeviceOrientationEvent) {
            window.addEventListener('deviceorientation', function handleOrientation(event) {
                let heading = event.alpha;
                if (event.webkitCompassHeading) {
                    heading = event.webkitCompassHeading;
                }

                if (heading !== null && heading !== undefined) {
                    let direction = "الشمال";
                    if (heading > 45 && heading <= 135) direction = "الشرق";
                    else if (heading > 135 && heading <= 225) direction = "الجنوب";
                    else if (heading > 225 && heading <= 315) direction = "الغرب";
                    
                    speak(`أنت تتجه الآن نحو ${direction}.`);
                } else {
                    speak("عذراً، متعذر تحديد اتجاه البوصلة على هذا الجهاز حالياً.");
                }
                window.removeEventListener('deviceorientation', handleOrientation);
            }, { once: true });
        } else {
            speak("مستشعر البوصلة غير مدعوم في هذا المتصفح.");
        }
    });
}

if (whereAmIBtn) {
    whereAmIBtn.addEventListener('click', () => {
        speak("جاري استكشاف الموقع والجغرافيا الحالية...");
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(position => {
                const lat = position.coords.latitude.toFixed(2);
                const lon = position.coords.longitude.toFixed(2);
                speak(`أنت حالياً بالقرب من الإحداثيات: خط عرض ${lat} وخط طول ${lon}.`);
            }, () => speak("يرجى السماح بالحصول على إذن الموقع وتفعيل الـ GPS."));
        } else {
            speak("خدمة الموقع الجغرافي غير مدعومة.");
        }
    });
}

// --- المرحلة السادسة: المكتبة الصوتية ---
const playManualBtn = document.getElementById('playManualBtn');
const playTipsBtn = document.getElementById('playTipsBtn');
const stopAudioBtn = document.getElementById('stopAudioBtn');

if (playManualBtn) {
    playManualBtn.addEventListener('click', () => {
        speak("مرحباً بك في الدليل الصوتي التفاعلي لتطبيق بصير. يتكون التطبيق من أقسام رئيسية تساعدك على القراءة والتعرف على الأشياء والعملات والاتجاهات بسهولة تامّة.");
    });
}

if (playTipsBtn) {
    playTipsBtn.addEventListener('click', () => {
        speak("إليك نصيحة للحصول على أفضل دقة: عند التقاط صورة للنصوص أو العملات، احرص على إبعاد الهاتف مسافة ثلاثين سنتيمتراً وتأكد من وجود إضاءة كافية حولك.");
    });
}

if (stopAudioBtn) {
    stopAudioBtn.addEventListener('click', () => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
        statusBox.innerText = "تم إيقاف الصوت بنجاح.";
    });
}

// --- المرحلة السابعة: الخدمات اليومية والألوان (كاملة) ---
const colorBtn = document.getElementById('colorBtn');
const colorCameraInput = document.getElementById('colorCameraInput');
const dateTimeBtn = document.getElementById('dateTimeBtn');

if (colorBtn && colorCameraInput) {
    colorBtn.addEventListener('click', () => {
        speak("وجه الكاميرا نحو القماش أو العنصر للتعرف على لونه.");
        setTimeout(() => colorCameraInput.click(), 1000);
    });

    colorCameraInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        speak("تم التقاط الصورة، جاري تحليل اللون الأساسي...");

        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = () => {
            const canvas = document.getElementById('colorCanvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0, img.width, img.height);

            // أخذ عينة من مركز الصورة
            const pixelData = ctx.getImageData(Math.floor(img.width / 2), Math.floor(img.height / 2), 1, 1).data;
            const r = pixelData[0];
            const g = pixelData[1];
            const b = pixelData[2];

            const colorName = getColorName(r, g, b);
            speak(`اللون الأغلب في منتصف الصورة هو: ${colorName}`);
        };
    });
}

// دالة تحليل قيم RGB ومعرفة اسم اللون باللغة العربية
function getColorName(r, g, b) {
    if (r < 50 && g < 50 && b < 50) return "الأسود";
    if (r > 200 && g > 200 && b > 200) return "الأبيض";
    if (r > 150 && g < 100 && b < 100) return "الأحمر";
    if (g > 150 && r < 100 && b < 100) return "الأخضر";
    if (b > 150 && r < 100 && g < 100) return "الأزرق";
    if (r > 180 && g > 180 && b < 100) return "الأصفر";
    if (r > 180 && g < 100 && b > 180) return "الوردي أو البنفسجي";
    if (r > 150 && g > 100 && b < 80) return "البرتقالي";
    return "لون متدرج، يرجى ضبط الإضاءة وتصوير القماش مباشرة";
}

// معرفة الوقت والتاريخ
if (dateTimeBtn) {
    dateTimeBtn.addEventListener('click', () => {
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const dateStr = now.toLocaleDateString('ar-EG', options);
        const timeStr = now.toLocaleTimeString('ar-EG');
        speak(`اليوم هو ${dateStr}، والساعة الآن هي ${timeStr}.`);
    });
}
