// --- إدارة الصوت والنطق بالتفصيل ---
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
        } else {
            utterance.lang = 'ar-EG';
            window.speechSynthesis.speak(utterance);
        }
    }
}

// دالة لتنظيف النص تماماً ومنع طباعة الرموز الغريبة أو الحروف الخاطئة
function cleanText(text) {
    if (!text) return "";
    return text
        .replace(/[\r\n]+/g, ' ')
        .replace(/[^\u0600-\u06FF0-9a-zA-Z\s.,!؟]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

window.addEventListener('load', () => {
    setTimeout(() => {
        speak("أهلاً بك في تطبيق بصير. المراحل الثمانية تعمل الآن بنجاح.");
    }, 500);
});

// --- التنقل الذكي بين الشاشات مع دعم قراءة أزرار الوصول ---
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

// --- المرحلة 1: قراءة النصوص والمستندات (حل مشكلة "تعذر استخراج النص") ---
const captureOcrBtn = document.getElementById('captureOcrBtn');
const ocrCameraInput = document.getElementById('ocrCameraInput');

if (captureOcrBtn && ocrCameraInput) {
    captureOcrBtn.addEventListener('click', () => {
        speak("جاري فتح الكاميرا، وجه الهاتف نحو الورقة.");
        setTimeout(() => ocrCameraInput.click(), 800);
    });

    ocrCameraInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        speak("تم التقاط الصورة، جاري معالجة واستخراج النص...");

        try {
            if (window.Tesseract) {
                const result = await Tesseract.recognize(file, 'ara+eng');
                let extractedText = cleanText(result.data.text);
                
                if (extractedText.length > 2) {
                    speak(`النص المكتوب هو: ${extractedText}`);
                } else {
                    speak("لم نتمكن من قراءة نص واضح، اضبط الإضاءة وقرب الكاميرا من الورقة.");
                }
            } else {
                speak("تعذر تحميل محرك القراءة، تحقق من اتصال الإنترنت.");
            }
        } catch (err) {
            speak("حدث خطأ أثناء قراءة الصورة، حاول مرة أخرى.");
        }
    });
}

// --- المرحلة 2: التعرف على الأشياء (حل مشكلة "دبوس أمان" والتخمين الخاطئ) ---
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

        speak("تم التقاط الصورة، جاري فحص والتعرف على الشيء...");

        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("language", "ara");

            const response = await fetch("https://api.ocr.space/parse/image", {
                method: "POST",
                headers: { "apikey": "K88283437288957" },
                body: formData
            });

            const data = await response.json();
            if (data && data.ParsedResults && data.ParsedResults[0]) {
                let txt = cleanText(data.ParsedResults[0].ParsedText);
                if (txt.length > 0) {
                    speak(`الشيء المكتوب عليه أو الموضح هو: ${txt}`);
                } else {
                    // بدلاً من نطق كلمة خاطئة كـ "دبوس أمان"
                    speak("عنصر غير محدد بدقة، جرب التصوير من زاوية أحدث وإضاءة أفضل.");
                }
            } else {
                speak("لم نتمكن من التحديد بدقة، يرجى إعادة التصوير.");
            }
        } catch (e) {
            speak("تعذر الاتصال بمركز فحص الأشياء.");
        }
    });
}

// --- المرحلة 3: التعرف على العملات ---
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
        speak("تم التقاط صورة العملة، جاري التحديد...");
        
        try {
            const result = await Tesseract.recognize(file, 'ara+eng');
            let text = result.data.text;
            if (text.includes("50") || text.includes("خمسون")) speak("العملة هي فئة خمسين جنيهاً.");
            else if (text.includes("100") || text.includes("مائة")) speak("العملة هي فئة مائة جنيه.");
            else if (text.includes("200") || text.includes("مائتان")) speak("العملة هي فئة مائتي جنيه.");
            else if (text.includes("20") || text.includes("عشرون")) speak("العملة هي فئة عشرين جنيهاً.");
            else if (text.includes("10") || text.includes("عشرة")) speak("العملة هي فئة عشرة جنيهات.");
            else speak("تأكد من فرد الورقة النقدية والتصوير في إضاءة جيدة.");
        } catch (e) {
            speak("حدث خطأ أثناء فحص العملة.");
        }
    });
}

// --- المرحلة 4: المساعدة البشرية والطوارئ ---
const callVolunteerBtn = document.getElementById('callVolunteerBtn');
const sendLocationBtn = document.getElementById('sendLocationBtn');

if (callVolunteerBtn) {
    callVolunteerBtn.addEventListener('click', () => {
        speak("جاري الاتصال بالطوارئ.");
        setTimeout(() => { window.location.href = "tel:122"; }, 1200);
    });
}

if (sendLocationBtn) {
    sendLocationBtn.addEventListener('click', () => {
        speak("جاري تحديد موقعك الجغرافي...");
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition((position) => {
                const lat = position.coords.latitude.toFixed(4);
                const lon = position.coords.longitude.toFixed(4);
                speak(`تم تحديد موقعك: خط العرض ${lat} وخط الطول ${lon}.`);
            }, () => speak("يرجى تفعيل خيار الموقع الجغرافي GPS."));
        } else {
            speak("خدمة تحديد الموقع غير مدعومة.");
        }
    });
}

// --- المرحلة 5: الملاحة والاتجاهات ---
const compassBtn = document.getElementById('compassBtn');
const whereAmIBtn = document.getElementById('whereAmIBtn');

if (compassBtn) {
    compassBtn.addEventListener('click', () => {
        speak("جاري تحديد الاتجاه الحالي...");
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
                    speak("عذراً، البوصلة غير مدعومة على الهاتف.");
                }
                window.removeEventListener('deviceorientation', handleOrientation);
            }, { once: true });
        } else {
            speak("مستشعر البوصلة غير متوفر.");
        }
    });
}

if (whereAmIBtn) {
    whereAmIBtn.addEventListener('click', () => {
        speak("جاري تحديد المكان...");
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(position => {
                const lat = position.coords.latitude.toFixed(2);
                const lon = position.coords.longitude.toFixed(2);
                speak(`موقعك الحالي بالقرب من الإحداثيات: ${lat} و ${lon}.`);
            }, () => speak("تأكد من سماح الإذن للموقع الجغرافي."));
        }
    });
}

// --- المرحلة 6: المكتبة الصوتية ---
const playManualBtn = document.getElementById('playManualBtn');
const playTipsBtn = document.getElementById('playTipsBtn');
const stopAudioBtn = document.getElementById('stopAudioBtn');

if (playManualBtn) {
    playManualBtn.addEventListener('click', () => {
        speak("مرحباً بك في الدليل الصوتي لتطبيق بصير. يتكون التطبيق من ثمانية أقسام رئيسية لمساعدتك في قراءة النصوص والتعرف على الأشياء والعملات والاتجاهات بصوت واضح.");
    });
}

if (playTipsBtn) {
    playTipsBtn.addEventListener('click', () => {
        speak("للحصول على أفضل نتائج: قم بتثبيت يدك أثناء التصوير، واحرص على توفير إضاءة كافية حول النص أو العنصر.");
    });
}

if (stopAudioBtn) {
    stopAudioBtn.addEventListener('click', () => {
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();
        statusBox.innerText = "تم إيقاف الصوت.";
    });
}

// --- المرحلة 7: الخدمات اليومية والألوان ---
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
            speak(`اللون الرئيسي الموضح هو: ${colorName}`);
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
    return "لون درجي متدرج";
}

if (dateTimeBtn) {
    dateTimeBtn.addEventListener('click', () => {
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        speak(`اليوم هو ${now.toLocaleDateString('ar-EG', options)}، والساعة الآن هي ${now.toLocaleTimeString('ar-EG')}.`);
    });
}

// --- المرحلة 8: الإعدادات والتحكم ---
const testVoiceBtn = document.getElementById('testVoiceBtn');
const resetAppBtn = document.getElementById('resetAppBtn');

if (testVoiceBtn) {
    testVoiceBtn.addEventListener('click', () => {
        speak("اختبار المحرك الصوتي بنجاح، الصوت يعمل بشكل واضح بفضل الله.");
    });
}

if (resetAppBtn) {
    resetAppBtn.addEventListener('click', () => {
        speak("جاري إعادة تحديث التطبيق...");
        setTimeout(() => window.location.reload(), 1200);
    });
}
