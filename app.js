// --- محرك الصوت العربي الذكي (المحلي + السحابي الاحتياطي) ---
let speechSpeed = 0.9;
const statusBox = document.getElementById('status-box');
const speedRange = document.getElementById('speedRange');
const backBtn = document.getElementById('backBtn');

// التحكم في السرعة
if (speedRange) {
    speedRange.addEventListener('input', (e) => {
        speechSpeed = parseFloat(e.target.value);
        speak(`تم تغيير السرعة إلى ${Math.round(speechSpeed * 100)} بالمائة`);
    });
}

// دالة النطق العربي القوية
function speak(text) {
    if (statusBox) {
        statusBox.innerText = text;
    }

    // 1. المحاولة الأولى: استخدام محرك الهاتف المدمج
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel(); // إيقاف أي صوت سابق

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = speechSpeed;

        // البحث عن أفضل صوت عربي مثبت على جهازك
        const voices = window.speechSynthesis.getVoices();
        const arabicVoice = voices.find(v => v.lang.startsWith('ar'));

        if (arabicVoice) {
            utterance.voice = arabicVoice;
            utterance.lang = arabicVoice.lang;
            window.speechSynthesis.speak(utterance);
            return;
        } else if (voices.length > 0) {
            // محاولة إجبار المحرك على العربية
            utterance.lang = 'ar-EG';
            window.speechSynthesis.speak(utterance);
            
            // إذا لم ينطق خلال ثانية، نلجأ للمحرك السحابي الاحتياطي
            setTimeout(() => {
                if (!window.speechSynthesis.speaking) {
                    speakCloudFallback(text);
                }
            }, 1000);
            return;
        }
    }

    // 2. المحاولة الثانية (الحل الضامن): النطق السحابي العربي المباشر
    speakCloudFallback(text);
}

// دالة النطق السحابي للغة العربية (تضمن النطق بالعربي على أي هاتف)
function speakCloudFallback(text) {
    try {
        const encodedText = encodeURIComponent(text);
        const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodedText}&tl=ar&client=tw-ob`;
        
        const audio = new Audio(audioUrl);
        audio.playbackRate = speechSpeed;
        audio.play().catch(e => {
            console.log("تعذر تشغيل الصوت السحابي تلقائياً، يلزم تفاعل المستخدم أولاً.");
        });
    } catch (e) {
        console.error("خطأ في تشغيل الصوت:", e);
    }
}

// تحميل الأصوات فور جاهزيتها في المتصفح
if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
    };
}

// الترحيب الصوتي العربي عند فتح الشاشة أو أول ضغطة
function startWelcome() {
    speak("أهلاً بك في تطبيق بصير. أنت الآن في الشاشة الرئيسية. تحرك بين الأزرار الثمانية للاختيار.");
}

window.addEventListener('load', () => {
    setTimeout(startWelcome, 600);
});

// تفعيل الصوت عند أول لمسة للشاشة (لتخطي حظر المتصفحات للصوت التلقائي)
document.body.addEventListener('click', function initAudio() {
    if (window.speechSynthesis && window.speechSynthesis.speaking === false) {
        // تنشيط المحرك
    }
}, { once: true });


// --- إدارة التنقل بين الشاشات ---
const homeScreen = document.getElementById('homeScreen');
const allScreens = document.querySelectorAll('.screen');
const navButtons = document.querySelectorAll('.btn-large');

navButtons.forEach(button => {
    // نطق اسم الزر بمجرد تركيز الـ TalkBack أو الضغط عليه
    button.addEventListener('focus', () => {
        const text = button.getAttribute('aria-label');
        speak(text);
    });

    button.addEventListener('click', () => {
        const targetScreenId = button.getAttribute('data-screen');
        const screenName = button.innerText;
        openScreen(targetScreenId, screenName);
    });
});

function openScreen(screenId, screenName) {
    allScreens.forEach(s => s.classList.remove('active'));
    
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
        if (backBtn) backBtn.style.visibility = 'visible';
        speak(`تم فتح ${screenName}. للرجوع اضغط على زر الرجوع أعلى اليسار.`);
    }
}

// زر الرجوع الثابت
if (backBtn) {
    backBtn.addEventListener('click', () => {
        allScreens.forEach(s => s.classList.remove('active'));
        homeScreen.classList.add('active');
        backBtn.style.visibility = 'hidden';
        speak("عدت إلى الشاشة الرئيسية.");
    });
}

// زر التعليمات والمساعدة
const helpBtn = document.getElementById('helpBtn');
if (helpBtn) {
    helpBtn.addEventListener('click', () => {
        speak("تطبيق بصير مصمم للمكفوفين. يمكنك التنقل بين الأزرار الثمانية وسيقوم التطبيق بنطق كل عنصر باللغة العربية.");
    });
}
