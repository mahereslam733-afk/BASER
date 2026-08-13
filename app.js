// --- محرك الصوت العربي ---
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

window.addEventListener('load', () => {
    setTimeout(() => {
        speak("أهلاً بك في تطبيق بصير. أنت الآن في الشاشة الرئيسية.");
    }, 500);
});

// --- إدارة التنقل بين الشاشات ---
const homeScreen = document.getElementById('homeScreen');
const allScreens = document.querySelectorAll('.screen');
const navButtons = document.querySelectorAll('.btn-large');

navButtons.forEach(button => {
    button.addEventListener('focus', () => {
        speak(button.getAttribute('aria-label'));
    });

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

// --- وظائف المرحلة الثانية: قراءة النصوص (OCR) والتفاعل مع الكاميرا ---
const captureOcrBtn = document.getElementById('captureOcrBtn');
const ocrCameraInput = document.getElementById('ocrCameraInput');

if (captureOcrBtn && ocrCameraInput) {
    captureOcrBtn.addEventListener('click', () => {
        speak("جاري فتح الكاميرا. يرجى توجيه الهاتف مستقيماً نحو الورقة ثم التقاط الصورة.");
        setTimeout(() => {
            ocrCameraInput.click();
        }, 1200);
    });

    ocrCameraInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) {
            speak("لم يتم التقاط أي صورة. حاول مرة أخرى.");
            return;
        }

        speak("تم التقاط الصورة بنجاح. جاري استخراج وقراءة النص، يرجى الانتظار ثوانٍ قليلة...");

        // معالجة الصورة واستخراج النص العربي عبر الخدمة السحابية
        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("language", "ara");
            formData.append("isOverlayRequired", "false");

            const response = await fetch("https://api.ocr.space/parse/image", {
                method: "POST",
                headers: {
                    "apikey": "helloworld" // مفتاح اختبار مجاني ومباشر
                },
                body: formData
            });

            const result = await response.json();

            if (result && result.ParsedResults && result.ParsedResults.length > 0) {
                const extractedText = result.ParsedResults[0].ParsedText.trim();
                if (extractedText.length > 0) {
                    speak(`تم استخراج النص بنجاح. النص المكتوب هو: ${extractedText}`);
                } else {
                    speak("لم نتمكن من العثور على نص واضح في هذه الصورة. تأكد من الإضاءة وقرب الكاميرا من الورقة ثم حاول مجدداً.");
                }
            } else {
                speak("عذراً، لم نتمكن من قراءة النص. يرجى إعادة محاولة التصوير بوضوح.");
            }
        } catch (err) {
            speak("حدث خطأ أثناء معالجة النص. يرجى التأكد من الاتصال بالإنترنت ومعاودة المحاولة.");
        }
    });
}
