// --- إدارة الصوت التفاعلي للغة العربية ---
let speechSpeed = 0.9;
const statusBox = document.getElementById('status-box');
const speedRange = document.getElementById('speedRange');
const backBtn = document.getElementById('backBtn');

// تحديث سرعة الصوت
if (speedRange) {
    speedRange.addEventListener('input', (e) => {
        speechSpeed = parseFloat(e.target.value);
        speak(`تم تغيير سرعة الصوت إلى ${Math.round(speechSpeed * 100)} بالمائة`);
    });
}

// دالة النطق الصوتي العربي الأساسية
function speak(text) {
    if (!('speechSynthesis' in window)) {
        statusBox.innerText = "النطق الصوتي غير مدعوم على هذا الجهاز.";
        return;
    }

    window.speechSynthesis.cancel(); // إيقاف الصوت السابق

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ar-SA'; // لغة عربية
    utterance.rate = speechSpeed;

    if (statusBox) {
        statusBox.innerText = text;
    }

    window.speechSynthesis.speak(utterance);
}

// الترحيب الصوتي التلقائي
window.addEventListener('load', () => {
    setTimeout(() => {
        speak("أهلاً بك في تطبيق بصير. أنت الآن في الشاشة الرئيسية. تحرك بين الأزرار الثمانية للاختيار.");
    }, 500);
});

// --- إدارة التنقل بين الشاشات ---
const homeScreen = document.getElementById('homeScreen');
const allScreens = document.querySelectorAll('.screen');
const navButtons = document.querySelectorAll('.btn-large');

navButtons.forEach(button => {
    // نطق اسم الزر بمجرد تركيز الـ TalkBack أو اللمس عليه
    button.addEventListener('focus', () => {
        const text = button.getAttribute('aria-label');
        speak(text);
    });

    // الضغط على الزر والدخول للشاشة الفرعية
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
        backBtn.style.visibility = 'visible'; // إظهار زر الرجوع
        speak(`تم فتح ${screenName}. للرجوع اضغط على زر الرجوع أعلى اليسار.`);
    }
}

// زر الرجوع الثابت
backBtn.addEventListener('click', () => {
    allScreens.forEach(s => s.classList.remove('active'));
    homeScreen.classList.add('active');
    backBtn.style.visibility = 'hidden'; // إخفاء زر الرجوع في الرئيسية
    speak("عدت إلى الشاشة الرئيسية.");
});

// زر التعليمات والمساعدة
document.getElementById('helpBtn').addEventListener('click', () => {
    speak("تطبيق بصير مصمم للمكفوفين. يمكنك التنقل بين الأزرار الثمانية وسيقوم التطبيق بنطق كل عنصر باللغة العربية.");
});
