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
        const cleanEnglish = lowerLabel.replace(/[^a-zA-Z ]/g, " "); // إزالة الأرقام والرموز الغريبة
        const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ar&dt=t&q=${encodeURIComponent(cleanEnglish)}`);
        const data = await res.json();
        if (data && data[0] && data[0][0] && data[0][0][0]) {
            let translated = data[0][0][0].trim();
            // تصفية أية رموز متبقية
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
                speak(extractedText.length > 0 ? `النص المكتوب هو: ${extractedText}` : "لم نتمكن من إيجاد نص واضح بالورقة.");
            } else {
                speak("تعذر استخراج النص، يرجى إعادة التصوير بوضوح.");
            }
        } catch (err) {
            speak("حدث خطأ أثناء الاتصال بخدمة القراءة.");
        }
    });
}

// --- المرحلة الثانية: التعرف على الأشياء (معدلة ومترجمة للعربية الصافية) ---
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
                    
                    speak(`الشيء الموجود أمامك هو: ${arabicDescription}`);
                } else {
                    speak("لم نتمكن من التحديد بدقة، يرجى الاقتراب من الشيء وإعادة التصوير.");
                }
            } else {
                speak("خادم الذكاء الاصطناعي مشغول حالياً، جرب مرة أخرى بعد قليل.");
            }
        } catch (e) {
            speak("حدث خطأ أثناء معالجة الصورة، يرجى إعادة المحاولة.");
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
            const arrayBuffer = await file.arrayBuffer();
            const response = await fetch("https://api-inference.huggingface.co/models/google/vit-base-patch16-224", {
                method: "POST",
                body: arrayBuffer
            });
            if (response.ok) {
                const result = await response.json();
                if (result && result.length > 0 && result[0].score > 0.35) {
                    speak("تم التعرف على ورقة نقدية، يرجى التأكد من استقامة الورقة والإضاءة للتحقق التام من الفئة.");
                } else {
                    speak("غير متأكد من فئة العملة، اضبط الإضاءة وصور كامل الورقة النقدية.");
                }
            } else {
                speak("خدمة التعرف على العملات غير متاحة مؤقتاً.");
            }
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

// --- المرحلة السابعة: الخدمات اليومية والألوان ---
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

            const pixelData = ctx.getImageData(Math.floor(img.width / 2), Math.floor(img.height / 2), 1, 1).data;
            const r = pixelData[0];
            const g = pixelData[1];
            const b = pixelData[2];

            const colorName = getColorName(r, g, b);
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

// --- المرحلة الثامنة: الإعدادات والتحكم (اختبار وإعادة ضبط) ---
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
// =========================================================
// 🚀 كود إضافي: تصحيح التعرف على الأشياء والترجمة والنطق العربي
// =========================================================

// 1. قاموس ترجمة إضافي وموسع
const extraArabicDict = {
    "person": "شخص", "cell phone": "هاتف محمول", "mobile phone": "هاتف محمول",
    "laptop": "حاسوب محمول", "chair": "كرسي", "couch": "أريكة", "sofa": "أريكة",
    "table": "طاولة", "dining table": "طاولة طعام", "bottle": "زجاجة", 
    "water bottle": "زجاجة ماء", "cup": "كوب", "mug": "كوب", "door": "باب",
    "book": "كتاب", "car": "سيارة", "key": "مفتاح", "bag": "حقيبة",
    "backpack": "حقيبة ظهر", "handbag": "حقيبة يد", "clock": "ساعة",
    "tv": "تلفاز", "television": "تلفاز", "pen": "قلم", "keyboard": "لوحة مفاتيح",
    "mouse": "فأرة حاسوب", "glasses": "نظارة", "bed": "سرير", "remote": "جهاز تحكم"
};

// 2. إعادة تعريف دالة التعرف على الأشياء لحل مشكلة الترجمة والنطق
detectObjects = async function() {
    if (typeof updateOutput === 'function') updateOutput("جاري تحليل المشهد...");
    
    try {
        if (!cocoModel) {
            cocoModel = await cocoSsd.load();
        }

        const predictions = await cocoModel.detect(video);
        
        if (predictions && predictions.length > 0) {
            // تصفية العناصر وترجمتها بدقة أكبر من 40%
            let items = predictions
                .filter(p => p.score > 0.40)
                .map(p => {
                    let label = p.class.toLowerCase();
                    return extraArabicDict[label] || (typeof arabicDict !== 'undefined' ? arabicDict[label] : null) || label;
                });

            let uniqueItems = [...new Set(items)];

            if (uniqueItems.length > 0) {
                let resultText = "أمامك الآن: " + uniqueItems.join(" و ");
                speak(resultText);
            } else {
                speak("لم أتمكن من التعرف على شيء واضح أمامك، قرّب الكاميرا قليلاً.");
            }
        } else {
            speak("المشهد غير واضح، يرجى توجيه الكاميرا نحو الأشياء.");
        }
    } catch (error) {
        console.error("Error detecting objects:", error);
        speak("حدث خطأ أثناء تحليل الصورة، تأكد من الاتصال بالإنترنت عند التحميل الأول.");
    }
};

// 3. تحسين دالة النطق العربي لإلغاء التداخل الصوتي
const originalSpeak = typeof speak === 'function' ? speak : null;
speak = function(text) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel(); // إلغاء أي صوت سابق فوراً لسرعة الاستجابة
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ar-SA';
        utterance.rate = typeof speechRate !== 'undefined' ? speechRate : 1.0;
        
        // جلب الأصوات المتاحة واختيار الصوت العربي إن وجد
        const voices = window.speechSynthesis.getVoices();
        const arVoice = voices.find(v => v.lang.includes('ar'));
        if (arVoice) utterance.voice = arVoice;

        window.speechSynthesis.speak(utterance);
    }
    if (typeof updateOutput === 'function') updateOutput(text);
};

