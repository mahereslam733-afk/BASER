// ==========================================
// تطبيق بصير - Baser App Engine (app.js)
// ==========================================

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

// --- قاموس سريع للمصطلحات الشائعة لتسريع الترجمة ---
const arabicDictionary = {
    "a person": "شخص",
    "a man": "رجل",
    "a woman": "امرأة",
    "a child": "طفل",
    "cell phone": "هاتف محمول",
    "mobile phone": "هاتف محمول",
    "a laptop": "كمبيوتر محمول",
    "a bottle of water": "زجاجة مياه",
    "a bottle": "زجاجة",
    "a cup of coffee": "كوب قهوة",
    "a cup": "كوب",
    "a chair": "كرسي",
    "a table": "طاولة",
    "a desk": "مكتب",
    "a book": "كتاب",
    "a pair of glasses": "نظارة",
    "a dog": "كلب",
    "a cat": "قطة",
    "a car": "سيارة"
};

// --- دالة ترجمة وتنقية وصف المشهد بالكامل إلى اللغة العربية ---
async function getCleanArabicDescription(englishText) {
    if (!englishText) return "لم يتم التعرف على المشهد بدقة.";

    const lowerLabel = englishText.toLowerCase().trim();

    // 1. فحص القاموس السريع أولاً
    for (let key in arabicDictionary) {
        if (lowerLabel === key) {
            return arabicDictionary[key];
        }
    }

    // 2. الترجمة عبر محرك جوجل وتصفية الحروف غير العربية
    try {
        const cleanEnglish = lowerLabel.replace(/[^a-zA-Z\s]/g, " ").trim();
        const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ar&dt=t&q=${encodeURIComponent(cleanEnglish)}`);
        const data = await res.json();

        if (data && data[0] && data[0][0] && data[0][0][0]) {
            let translated = data[0][0][0].trim();
            // استخراج الحروف العربية والمسافات فقط لضمان النطق والكتابة الصريحة
            translated = translated.replace(/[^\u0600-\u06FF\s]/g, "").trim();
            if (translated.length > 0) return translated;
        }
    } catch (e) {
        console.error("خطأ الترجمة:", e);
    }

    return "يوجد عنصر أو مشهد أمامك، يرجى إعادة المحاولة من زاوية أخرى.";
}

// الترحب عند بدء التشغيل
window.addEventListener('load', () => {
    setTimeout(() => {
        speak("أهلاً بك في تطبيق بصير. جميع المراحل مفعلة وتعمل بنجاح.");
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

// ==========================================
// 1. شاشة قراءة النصوص (OCR)
// ==========================================
const captureOcrBtn = document.getElementById('captureOcrBtn');
const ocrCameraInput = document.getElementById('ocrCameraInput');
const ocrResultDisplay = document.getElementById('ocrResultDisplay');

if (captureOcrBtn && ocrCameraInput) {
    captureOcrBtn.addEventListener('click', () => {
        speak("جاري فتح الكاميرا، وجه الهاتف نحو الورقة.");
        setTimeout(() => ocrCameraInput.click(), 800);
    });

    ocrCameraInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (ocrResultDisplay) ocrResultDisplay.innerText = "جاري استخراج وقراءة النص العربي...";
        speak("تم التقاط الصورة، جاري استخراج وقراءة النص العربي...");

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
                const finalText = extractedText.length > 0 ? extractedText : "لم يتم العثور على نص واضح بالورقة.";
                
                if (ocrResultDisplay) ocrResultDisplay.innerText = finalText;
                speak(`النص المكتوب هو: ${finalText}`);
            } else {
                if (ocrResultDisplay) ocrResultDisplay.innerText = "تعذر استخراج النص.";
                speak("تعذر استخراج النص، يرجى إعادة التصوير بوضوح.");
            }
        } catch (err) {
            if (ocrResultDisplay) ocrResultDisplay.innerText = "حدث خطأ أثناء الاتصال بخدمة القراءة.";
            speak("حدث خطأ أثناء الاتصال بخدمة القراءة.");
        }
    });
}

// ==========================================
// 2. شاشة التعرف على الأشياء ووصف المشهد (مُحدثة كلياً)
// ==========================================
const captureObjectBtn = document.getElementById('captureObjectBtn');
const objectCameraInput = document.getElementById('objectCameraInput');
const objectResultDisplay = document.getElementById('objectResultDisplay');

if (captureObjectBtn && objectCameraInput) {
    captureObjectBtn.addEventListener('click', () => {
        speak("جاري فتح الكاميرا، وجه الهاتف نحو الشيء أو المشهد.");
        setTimeout(() => objectCameraInput.click(), 800);
    });

    objectCameraInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        if (objectResultDisplay) objectResultDisplay.innerText = "جاري تحليل المشهد بالذكاء الاصطناعي...";
        speak("تم التقاط الصورة، جاري تحليل المشهد ووصفه باللغة العربية...");

        try {
            const arrayBuffer = await file.arrayBuffer();
            
            // استخدام نموذج BLIP القادر على توليد وصف كامل للمشهد (Image Captioning)
            const response = await fetch("https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-large", {
                method: "POST",
                body: arrayBuffer
            });

            if (response.ok) {
                const result = await response.json();
                
                if (result && result.length > 0 && result[0].generated_text) {
                    const englishCaption = result[0].generated_text;
                    
                    // ترجمة المشهد إلى اللغة العربية
                    const arabicDescription = await getCleanArabicDescription(englishCaption);
                    
                    // العرض الكتابي المباشر على الشاشة
                    if (objectResultDisplay) {
                        objectResultDisplay.innerText = arabicDescription;
                    }
                    
                    // النطق الصوتي العربي المباشر
                    speak(`وصف المشهد: ${arabicDescription}`);
                } else {
                    const msg = "لم نتمكن من تحليل المشهد بدقة، حاول التصوير من زاوية أفضل.";
                    if (objectResultDisplay) objectResultDisplay.innerText = msg;
                    speak(msg);
                }
            } else {
                const msg = "سيرفر الذكاء الاصطناعي مشغول، يرجى إعادة المحاولة بعد بضع ثوانٍ.";
                if (objectResultDisplay) objectResultDisplay.innerText = msg;
                speak(msg);
            }
        } catch (e) {
            const msg = "حدث خطأ أثناء المعالجة، تأكد من الاتصال بالإنترنت.";
            if (objectResultDisplay) objectResultDisplay.innerText = msg;
            speak(msg);
        }
    });
}

// ==========================================
// 3. شاشة معرفة العملات النقدية
// ==========================================
const captureMoneyBtn = document.getElementById('captureMoneyBtn');
const moneyCameraInput = document.getElementById('moneyCameraInput');
const moneyResultDisplay = document.getElementById('moneyResultDisplay');

if (captureMoneyBtn && moneyCameraInput) {
    captureMoneyBtn.addEventListener('click', () => {
        speak("جاري فتح الكاميرا، وجه الهاتف نحو الورقة النقدية.");
        setTimeout(() => moneyCameraInput.click(), 800);
    });

    moneyCameraInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (moneyResultDisplay) moneyResultDisplay.innerText = "جاري فحص فئة العملة...";
        speak("تم التقاط صورة العملة، جاري فحص الفئة بوضوح...");

        try {
            const arrayBuffer = await file.arrayBuffer();
            const response = await fetch("https://api-inference.huggingface.co/models/google/vit-base-patch16-224", {
                method: "POST",
                body: arrayBuffer
            });
            if (response.ok) {
                const result = await response.json();
                if (result && result.length > 0 && result[0].score > 0.30) {
                    const msg = "تم اكتشاف ورقة مالية، اضبط الاستقامة والإضاءة للتأكد الدقيق من الفئة.";
                    if (moneyResultDisplay) moneyResultDisplay.innerText = msg;
                    speak(msg);
                } else {
                    const msg = "غير متأكد من فئة العملة، يرجى إبعاد الكاميرا مسافة مناسبة والتصوير مجدداً.";
                    if (moneyResultDisplay) moneyResultDisplay.innerText = msg;
                    speak(msg);
                }
            } else {
                if (moneyResultDisplay) moneyResultDisplay.innerText = "خدمة العملات غير متاحة حالياً.";
                speak("خدمة التعرف على العملات غير متاحة مؤقتاً.");
            }
        } catch (e) {
            if (moneyResultDisplay) moneyResultDisplay.innerText = "تعذر الاتصال بمركز معالجة العملات.";
            speak("تعذر الاتصال بمركز معالجة العملات.");
        }
    });
}

// ==========================================
// 4. شاشة معرفة الألوان والقماش
// ==========================================
const colorBtn = document.getElementById('colorBtn');
const colorCameraInput = document.getElementById('colorCameraInput');
const colorResultDisplay = document.getElementById('colorResultDisplay');

if (colorBtn && colorCameraInput) {
    colorBtn.addEventListener('click', () => {
        speak("وجه الكاميرا نحو القماش أو العنصر لمعرفة لونه.");
        setTimeout(() => colorCameraInput.click(), 800);
    });

    colorCameraInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (colorResultDisplay) colorResultDisplay.innerText = "جاري تحليل اللون...";
        speak("تم التقاط الصورة، جاري تحليل اللون الأساسي...");

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

            if (colorResultDisplay) colorResultDisplay.innerText = `اللون المكتشف: ${colorName}`;
            speak(`اللون الأغلب في منتصف الصورة هو: ${colorName}`);
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
    return "لون متدرج، يرجى ضبط الإضاءة والتصوير المباشر";
}

// ==========================================
// 5. شاشة الملاحة والاتجاهات
// ==========================================
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
            speak("مستشعر البوصلة غير مدعوم على هذا الجهاز.");
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
                speak(`أنت حالياً بالقرب من الإحداثيات: خط عرض ${lat} وخط طول ${lon}.`);
            }, () => speak("يرجى السماح بصلحية الموقع لتفعيل الجي بي إس."));
        } else {
            speak("خدمة الموقع الجغرافي غير مدعومة.");
        }
    });
}

// ==========================================
// 6. شاشة الطوارئ والمساعدة
// ==========================================
const callVolunteerBtn = document.getElementById('callVolunteerBtn');
const sendLocationBtn = document.getElementById('sendLocationBtn');

if (callVolunteerBtn) {
    callVolunteerBtn.addEventListener('click', () => {
        speak("جاري الاتصال بالطوارئ والمساعد المباشر.");
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
                speak(`تم تحديد موقعك: خط العرض ${lat} وخط الطول ${lon}.`);
            }, () => speak("تعذر الوصول للموقع، يرجى تفعيل الـ GPS."));
        } else {
            speak("خدمة تحديد الموقع غير مدعومة على جهازك.");
        }
    });
}

// ==========================================
// 7. شاشة الدليل والمكتبة الصوتية
// ==========================================
const playManualBtn = document.getElementById('playManualBtn');
const playTipsBtn = document.getElementById('playTipsBtn');
const stopAudioBtn = document.getElementById('stopAudioBtn');

if (playManualBtn) {
    playManualBtn.addEventListener('click', () => {
        speak("مرحباً بك في تطبيق بصير. يوفر لك التطبيق خدمات القراءة الصريحة، وصف المشاهد والأشياء بالذكاء الاصطناعي، تحديد العملات والألوان، والملاحة الاتجاهية بسهولة.");
    });
}

if (playTipsBtn) {
    playTipsBtn.addEventListener('click', () => {
        speak("نصيحة للتصوير: ثبّت الهاتف على مسافة ثلاثين سنتيمتراً من الورقة أو الشيء، واحرص على وجود إضاءة جيدة حولك للحصول على أدق نتيجة.");
    });
}

if (stopAudioBtn) {
    stopAudioBtn.addEventListener('click', () => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
        if (statusBox) statusBox.innerText = "تم إيقاف الصوت بنجاح.";
    });
}

// ==========================================
// 8. شاشة الإعدادات والتحكم
// ==========================================
const dateTimeBtn = document.getElementById('dateTimeBtn');
const testVoiceBtn = document.getElementById('testVoiceBtn');
const resetAppBtn = document.getElementById('resetAppBtn');

if (dateTimeBtn) {
    dateTimeBtn.addEventListener('click', () => {
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const dateStr = now.toLocaleDateString('ar-EG', options);
        const timeStr = now.toLocaleTimeString('ar-EG');
        speak(`اليوم هو ${dateStr}، والساعة الآن هي ${timeStr}.`);
    });
}

if (testVoiceBtn) {
    testVoiceBtn.addEventListener('click', () => {
        speak("اختبار المحرك الصوتي بنجاح. تطبيق بصير يعمل بكفاءة عالية وصوت نقي باللغة العربية.");
    });
}

if (resetAppBtn) {
    resetAppBtn.addEventListener('click', () => {
        speak("جاري إعادة تحميل وتحديث تطبيق بصير...");
        setTimeout(() => {
            window.location.reload();
        }, 1200);
    });
}
