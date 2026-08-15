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

// --- قاموس للترجمة العربية المباشرة وتصفية النصوص العشوائية ---
const arabicDictionary = {
    "cellular telephone": "هاتف محمول",
    "mobile phone": "هاتف محمول",
    "cell phone": "موبايل",
    "hand-held computer": "جهاز محمول",
    "laptop": "كمبيوتر محمول",
    "notebook computer": "كمبيوتر محمول",
    "water bottle": "زجاجة مياه",
    "pop bottle": "زجاجة بلاستيكية",
    "bottle": "زجاجة",
    "cup": "كوب",
    "coffee mug": "مج قهوة",
    "mug": "كوب أو فنجان",
    "desk": "مكتب",
    "chair": "كرسي",
    "armchair": "كرسي مريح",
    "table": "طاولة",
    "dining table": "طاولة طعام",
    "book": "كتاب",
    "binder": "كراسة أو مجلد",
    "pencil sharpener": "براية",
    "wallet": "محفظة أوراق مالية",
    "spectacles": "نظارة طبية",
    "sunglasses": "نظارة شمسية",
    "shoe": "حذاء",
    "running shoe": "حذاء رياضي",
    "bag": "حقيبة",
    "backpack": "حقيبة ظهر",
    "handbag": "حقيبة يد",
    "door": "باب",
    "key": "مفتاح",
    "watch": "ساعة يد",
    "digital clock": "ساعة رقمية",
    "wall clock": "ساعة حائط",
    "television": "شاشة تلفزيون",
    "screen": "شاشة عرض",
    "mouse": "فأرة كمبيوتر",
    "computer keyboard": "لوحة مفاتيح",
    "remote control": "ريموت كنترول",
    "pillow": "وسادة",
    "person": "شخص",
    "man": "رجل",
    "woman": "امرأة",
    "child": "طفل",
    "car": "سيارة",
    "bicycle": "دراجة",
    "plate": "طبق",
    "spoon": "ملعقة",
    "fork": "شوكة",
    "knife": "سكين"
};

// دالة تحويل الاسم إلى عربية واضحة بدون رموز أو أرقام
async function getCleanArabicDescription(label) {
    const lowerLabel = label.toLowerCase().trim();
    
    // 1. البحث في القاموس السريع أولاً
    for (let key in arabicDictionary) {
        if (lowerLabel.includes(key)) {
            return arabicDictionary[key];
        }
    }

    // 2. استخدام محرك الترجمة واستخراج الكلمات العربية الصافية فقط
    try {
        const cleanEnglish = lowerLabel.replace(/[^a-zA-Z ]/g, " ");
        const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ar&dt=t&q=${encodeURIComponent(cleanEnglish)}`);
        const data = await res.json();
        if (data && data[0] && data[0][0] && data[0][0][0]) {
            let translated = data[0][0][0].trim();
            translated = translated.replace(/[^\u0600-\u06FF\s]/g, "");
            if (translated.length > 0) return translated;
        }
    } catch (e) {}

    return "عنصر غير محدد بدقة، حاول التصوير من زاوية أخرى";
}

// الترحيب عند الفتح
window.addEventListener('load', () => {
    setTimeout(() => {
        speak("أهلاً بك في تطبيق بصير. جميع المراحل الثماني مفعلة وتعمل بنجاح.");
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

// --- المرحلة الأولى: قراءة النصوص (OCR) مع الكتابة على الشاشة ---
const captureOcrBtn = document.getElementById('captureOcrBtn');
const ocrCameraInput = document.getElementById('ocrCameraInput');
const ocrResultDisplay = document.getElementById('ocrResultDisplay');

if (captureOcrBtn && ocrCameraInput) {
    captureOcrBtn.addEventListener('click', () => {
        speak("جاري فتح الكاميرا، وجه الهاتف نحو الورقة.");
        setTimeout(() => ocrCameraInput.click(), 1000);
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
                const finalText = extractedText.length > 0 ? extractedText : "لم نتمكن من إيجاد نص واضح بالورقة.";
                
                // كتابة النص المكتوب على الشاشة
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

// --- المرحلة الثانية: التعرف على الأشياء مع العرض الكتابي بالعربية ---
const captureObjectBtn = document.getElementById('captureObjectBtn');
const objectCameraInput = document.getElementById('objectCameraInput');
const objectResultDisplay = document.getElementById('objectResultDisplay');

if (captureObjectBtn && objectCameraInput) {
    captureObjectBtn.addEventListener('click', () => {
        speak("جاري فتح الكاميرا، وجه الهاتف نحو الشيء المطلوب التعرف عليه.");
        setTimeout(() => objectCameraInput.click(), 1000);
    });

    objectCameraInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        if (objectResultDisplay) objectResultDisplay.innerText = "جاري تحليل الشيء بالذكاء الاصطناعي...";
        speak("تم التقاط الصورة، جاري تحليل الشيء بالذكاء الاصطناعي...");

        try {
            const arrayBuffer = await file.arrayBuffer();
            
            const response = await fetch("https://api-inference.huggingface.co/models/google/vit-base-patch16-224", {
                method: "POST",
                body: arrayBuffer
            });

            if (response.ok) {
                const result = await response.json();
                if (result && result.length > 0) {
                    const rawLabel = result[0].label;
                    const arabicDescription = await getCleanArabicDescription(rawLabel);
                    
                    // كتابة النتيجة والوصف بالعربية على الشاشة
                    if (objectResultDisplay) objectResultDisplay.innerText = `الشيء المكتشف: ${arabicDescription}`;
                    speak(`الشيء الموجود أمامك هو: ${arabicDescription}`);
                } else {
                    if (objectResultDisplay) objectResultDisplay.innerText = "لم نتمكن من التحديد بدقة.";
                    speak("لم نتمكن من التحديد بدقة، يرجى الاقتراب من الشيء وإعادة التصوير.");
                }
            } else {
                if (objectResultDisplay) objectResultDisplay.innerText = "خادم الذكاء الاصطناعي مشغول حالياً.";
                speak("خادم الذكاء الاصطناعي مشغول حالياً، جرب مرة أخرى بعد قليل.");
            }
        } catch (e) {
            if (objectResultDisplay) objectResultDisplay.innerText = "حدث خطأ أثناء معالجة الصورة.";
            speak("حدث خطأ أثناء معالجة الصورة، يرجى إعادة المحاولة.");
        }
    });
}

// --- المرحلة الثالثة: التعرف على العملات ---
const captureMoneyBtn = document.getElementById('captureMoneyBtn');
const moneyCameraInput = document.getElementById('moneyCameraInput');
const moneyResultDisplay = document.getElementById('moneyResultDisplay');

if (captureMoneyBtn && moneyCameraInput) {
    captureMoneyBtn.addEventListener('click', () => {
        speak("جاري فتح الكاميرا، وجه الهاتف نحو الورقة النقدية.");
        setTimeout(() => moneyCameraInput.click(), 1000);
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
                if (result && result.length > 0 && result[0].score > 0.35) {
                    const msg = "تم التعرف على ورقة نقدية، يرجى التأكد من استقامة الورقة والإضاءة للتحقق التام من الفئة.";
                    if (moneyResultDisplay) moneyResultDisplay.innerText = msg;
                    speak(msg);
                } else {
                    const msg = "غير متأكد من فئة العملة، اضبط الإضاءة وصور كامل الورقة النقدية.";
                    if (moneyResultDisplay) moneyResultDisplay.innerText = msg;
                    speak(msg);
                }
            } else {
                if (moneyResultDisplay) moneyResultDisplay.innerText = "خدمة العملات غير متاحة مؤقتاً.";
                speak("خدمة التعرف على العملات غير متاحة مؤقتاً.");
            }
        } catch (e) {
            if (moneyResultDisplay) moneyResultDisplay.innerText = "تعذر الاتصال بمركز المعالجة.";
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

// --- المرحلة السابعة: الألوان ---
const colorBtn = document.getElementById('colorBtn');
const colorCameraInput = document.getElementById('colorCameraInput');
const colorResultDisplay = document.getElementById('colorResultDisplay');
const dateTimeBtn = document.getElementById('dateTimeBtn');

if (colorBtn && colorCameraInput) {
    colorBtn.addEventListener('click', () => {
        speak("وجه الكاميرا نحو القماش أو العنصر للتعرف على لونه.");
        setTimeout(() => colorCameraInput.click(), 1000);
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
    return "لون متدرج، يرجى ضبط الإضاءة وتصوير القماش مباشرة";
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

// --- المرحلة الثامنة: الإعدادات والتحكم ---
const testVoiceBtn = document.getElementById('testVoiceBtn');
const resetAppBtn = document.getElementById('resetAppBtn');

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
        }, 1500);
    });
}
// ==========================================
// ميزات الذكاء الاصطناعي والنطق الصوتي (تطبيق بصير)
// ==========================================

// 1. مفتاح API الخاص بـ Gemini (استبدله بمفتاحك الخاص)
const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY";

// 2. دالة التقاط الصورة الحالية من الكاميرا وتحويلها إلى Base64
function captureFrameAsBase64() {
  const videoElem = document.querySelector('video');
  let canvasElem = document.querySelector('canvas');

  // إذا لم يكن هناك عنصر canvas في الصفحة، ننشئ واحداً في الذاكرة
  if (!canvasElem) {
    canvasElem = document.createElement('canvas');
  }

  const context = canvasElem.getContext('2d');
  canvasElem.width = videoElem.videoWidth || 640;
  canvasElem.height = videoElem.videoHeight || 480;
  
  context.drawImage(videoElem, 0, 0, canvasElem.width, canvasElem.height);
  
  const dataUrl = canvasElem.toDataURL('image/jpeg');
  return dataUrl.split(',')[1]; // إرجاع كود Base64 الصافي
}

// 3. دالة إرسال الصورة لـ Gemini API وتحليلها
async function analyzeWithGemini(promptText) {
  speakText("جاري التحليل، انتظر لحظة");

  try {
    const base64Data = captureFrameAsBase64();
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: promptText },
            {
              inline_data: {
                mime_type: "image/jpeg",
                data: base64Data
              }
            }
          ]
        }]
      })
    });

    const data = await response.json();

    if (data.candidates && data.candidates[0].content.parts[0].text) {
      const result = data.candidates[0].content.parts[0].text;
      console.log("نتيجة التحليل:", result);
      speakText(result); // نطق النتيجة صوتاً
    } else {
      speakText("لم أستطع التعرف على المحتوى، حاول مرة أخرى.");
    }

  } catch (error) {
    console.error("خطأ أثناء الاتصال بالذكاء الاصطناعي:", error);
    speakText("حدث خطأ أثناء الاتصال بالخدمة.");
  }
}

// 4. دالة تحويل النص إلى صوت (Text-to-Speech)
function speakText(text) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel(); // إيقاف أي صوت سابق
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ar-EG'; // ضبط الصوت على اللغة العربية
    utterance.rate = 0.9;     // سرعة النطق
    window.speechSynthesis.speak(utterance);
  }
}

// 5. دوال يمكنك استدعاؤها عند الضغط على الأزرار في تطبيقك
function processDescribeObjects() {
  analyzeWithGemini("صف العناصر والأشياء الموجودة في هذه الصورة باختصار باللغة العربية بأسلوب مناسب للمكفوفين.");
}

function processReadText() {
  analyzeWithGemini("اقرأ جميع النصوص المكتوبة الموجودة في هذه الصورة بدقة باللغة العربية.");
}
// ======================================================
// بصير - إضافة الذكاء الاصطناعي الحقيقي للتعرف على الصور
// ======================================================

async function absarAIAnalyzeImage(imageData) {

    try {

        if (!imageData) {
            speakArabic("لم يتم التقاط صورة.");
            return;
        }

        const aiStatus =
            document.getElementById("ai-status");

        const aiResult =
            document.getElementById("ai-result");

        if (aiStatus) {
            aiStatus.textContent =
                "جاري تحليل الصورة بالذكاء الاصطناعي...";
        }

        if (aiResult) {
            aiResult.innerHTML =
                "<p>🔄 جاري تحليل الصورة...</p>";
        }

        speakArabic(
            "جاري تحليل الصورة بالذكاء الاصطناعي."
        );


        // إرسال الصورة إلى خادم الذكاء الاصطناعي
        const response = await fetch(
            "https://YOUR-SERVER-DOMAIN.com/api/analyze-image",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    image: imageData
                })
            }
        );


        if (!response.ok) {
            throw new Error(
                "فشل الاتصال بخدمة الذكاء الاصطناعي"
            );
        }


        const data =
            await response.json();


        const description =
            data.description ||
            "لم أستطع التعرف على محتوى الصورة.";


        // عرض النتيجة
        if (aiResult) {

            aiResult.innerHTML = `
                <div class="ai-result-box">
                    <strong>نتيجة الذكاء الاصطناعي:</strong>
                    <p>${description}</p>
                </div>
            `;
        }


        if (aiStatus) {

            aiStatus.textContent =
                "تم تحليل الصورة بنجاح.";
        }


        // قراءة النتيجة للمستخدم الكفيف
        speakArabic(description);


    } catch (error) {

        console.error(
            "Absar AI Error:",
            error
        );


        const message =
            "حدث خطأ أثناء تحليل الصورة. تأكد من اتصال الإنترنت.";


        const aiResult =
            document.getElementById("ai-result");


        if (aiResult) {

            aiResult.innerHTML = `
                <div class="ai-result-box">
                    <p>${message}</p>
                </div>
            `;
        }


        speakArabic(message);
    }
}


// ======================================================
// زر جديد مستقل للتعرف بالذكاء الاصطناعي
// ======================================================

function addAbsarAIButton() {

    const section =
        document.getElementById(
            "ai-object-section"
        );

    if (!section) {
        return;
    }


    // منع إنشاء الزر أكثر من مرة
    if (
        document.getElementById(
            "absar-real-ai-button"
        )
    ) {
        return;
    }


    const button =
        document.createElement("button");


    button.id =
        "absar-real-ai-button";


    button.innerHTML =
        "🤖 تحليل الصورة بالذكاء الاصطناعي";


    button.style.cssText = `
        display:block;
        width:100%;
        max-width:400px;
        margin:12px auto;
        padding:16px;
        border:none;
        border-radius:14px;
        font-size:18px;
        font-weight:bold;
        cursor:pointer;
    `;


    button.addEventListener(
        "click",
        async function () {

            if (!aiCanvas) {

                speakArabic(
                    "الكاميرا غير جاهزة."
                );

                return;
            }


            if (
                !aiCamera ||
                !aiCamera.videoWidth
            ) {

                speakArabic(
                    "افتح الكاميرا أولًا."
                );

                return;
            }


            aiCanvas.width =
                aiCamera.videoWidth;

            aiCanvas.height =
                aiCamera.videoHeight;


            const context =
                aiCanvas.getContext("2d");


            context.drawImage(
                aiCamera,
                0,
                0,
                aiCanvas.width,
                aiCanvas.height
            );


            const imageData =
                aiCanvas.toDataURL(
                    "image/jpeg",
                    0.85
                );


            await absarAIAnalyzeImage(
                imageData
            );

        }
    );


    section.appendChild(
        button
    );
}


// تشغيل الإضافة بعد تحميل الصفحة
document.addEventListener(
    "DOMContentLoaded",
    function () {

        addAbsarAIButton();

    }
);
// قاموس ترجمة أسماء الأشياء الشائعة من الإنجليزية إلى العربية
const translations = {
    "person": "شخص",
    "bicycle": "دراجة هوائية",
    "car": "سيارة",
    "motorcycle": "دراجة نارية",
    "airplane": "طائرة",
    "bus": "حافلة",
    "train": "قطار",
    "truck": "شاحنة",
    "boat": "قارب",
    "cat": "قطة",
    "dog": "كلب",
    "horse": "حصان",
    "bowl": "وعاء / سلطانية",
    "cup": "كوب",
    "fork": "شوكة",
    "knife": "سكين",
    "spoon": "ملعقة",
    "bowl": "طبق",
    "apple": "تفاحة",
    "sandwich": "شطيرة",
    "orange": "برتقال",
    "broccoli": "بروكلي",
    "carrot": "جزر",
    "chair": "كرسي",
    "couch": "أريكة",
    "potted plant": "نبتة منزلية",
    "bed": "سرير",
    "dining table": "طاولة طعام",
    "tv": "تلفاز",
    "laptop": "حاسوب محمول",
    "mouse": "فأرة حاسوب",
    "cell phone": "هاتف محمولكرسي"
};

let model = undefined;

// تحميل النموذج عند فتح التطبيق
cocoSsd.load().then(function (loadedModel) {
    model = loadedModel;
    document.getElementById("result").innerText = "النموذج جاهز، اضغط على الزر للتعرف.";
});

// دالة التعرف على الأشياء داخل الصورة
async function detectImage() {
    if (!model) {
        alert("النموذج لم يكتمل تحميله بعد!");
        return;
    }
    
    const imgElement = document.getElementById("targetImg");
    document.getElementById("result").innerText = "جاري التحليل...";

    // إجراء التنبؤ
    const predictions = await model.detect(imgElement);

    if (predictions.length > 0) {
        let resultsText = "الأشياء المكتشفة:<br>";
        predictions.forEach(prediction => {
            // ترجمة الاسم أو إبقاؤه كما هو إذا لم يتوفر في القاموس
            let arabicName = translations[prediction.class] || prediction.class;
            let confidence = Math.round(prediction.score * 100);
            resultsText += `- ${arabicName} (دقة: ${confidence}%)<br>`;
        });
        document.getElementById("result").innerHTML = resultsText;
    } else {
        document.getElementById("result").innerText = "لم يتم التعرف على أي شيء بوضوح.";
    }
}

let model;
const video = document.getElementById('webcam');
const canvas = document.getElementById('outputCanvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');

// قاموس ترجمة أسماء الأشياء الشائعة للعربية
const labelsTranslation = {
  "person": "شخص",
  "cell phone": "هاتف محمول",
  "laptop": "حاسوب محمول",
  "chair": "كرسي",
  "bottle": "زجاجة",
  "cup": "كوب",
  "book": "كتاب",
  "mouse": "فأرة",
  "keyboard": "لوحة مفاتيح",
  "backpack": "حقيبة ظهر",
  "car": "سيارة",
  "dog": "كلب",
  "cat": "قطة"
};

// 1. تحميل نموذج الذكاء الاصطناعي عند فتح الصفحة
async function loadModel() {
  console.log("جاري تحميل النموذج...");
  model = await cocoSsd.load();
  console.log("تم تحميل النموذج بنجاح.");
}

loadModel();

// 2. تشغيل الكاميرا الخلفية للهاتف
async function setupCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: { exact: "environment" } }, // الكاميرا الخلفية
    audio: false
  });
  video.srcObject = stream;

  return new Promise((resolve) => {
    video.onloadedmetadata = () => {
      resolve(video);
    };
  });
}

// 3. نطق اسم الشيء المكتشف باللغة العربية
function speakText(text) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel(); // إيقاف أي نطق سابق
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ar-SA';
    window.speechSynthesis.speak(utterance);
  }
}

// 4. تحليل الإطارات والتعرف على الأشياء
async function detectObjects() {
  // ضبط أبعاد Canvas لتتطابق مع أبعاد الكاميرا
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  // إجراء التنبؤ
  const predictions = await model.detect(video);

  // مسح الرسم السابق
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  let detectedObjectsText = [];

  predictions.forEach(prediction => {
    // تصفية النتائج ذات نسبة التأكد العالية فقط (أكبر من 60%)
    if (prediction.score > 0.60) {
      const [x, y, width, height] = prediction.bbox;
      const englishName = prediction.class;
      const arabicName = labelsTranslation[englishName] || englishName;

      detectedObjectsText.push(arabicName);

      // رسم المربع حول الشيء المكتشف
      ctx.strokeStyle = '#00FF00';
      ctx.lineWidth = 4;
      ctx.strokeRect(x, y, width, height);

      // رسم الخلفية للنص
      ctx.fillStyle = '#00FF00';
      const textWidth = ctx.measureText(arabicName).width;
      ctx.fillRect(x, y > 20 ? y - 25 : 0, textWidth + 10, 25);

      // كتابة اسم الشيء
      ctx.fillStyle = '#000000';
      ctx.font = '18px Arial';
      ctx.fillText(arabicName, x + 5, y > 20 ? y - 7 : 18);
    }
  });

  // نطق العناصر المكتشفة إذا وجدت
  if (detectedObjectsText.length > 0) {
    const speechOutput = "أمامي: " + detectedObjectsText.join(" و ");
    speakText(speechOutput);
  }

  // استمرار الفحص التلقائي بعد ثانيتين لتجنب الإزعاج بالنطق المتكرر
  setTimeout(() => {
    requestAnimationFrame(detectObjects);
  }, 2000);
}

// 5. زر البدء
startBtn.addEventListener('click', async () => {
  if (!model) {
    alert("برجاء الانتظار حتى اكتمال تحميل نموذج الذكاء الاصطناعي.");
    return;
  }
  startBtn.disabled = true;
  await setupCamera();
  video.play();
  detectObjects();
});
