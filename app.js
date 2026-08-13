document.getElementById('speakBtn').addEventListener('click', function() {
    const text = "أهلاً بك في تطبيق إبصار، المساعد الذكي جاهز لمساعدتك الآن.";
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ar-SA'; // ضبط اللغة على العربية
    utterance.rate = 0.9;     // سرعة نطق متزنة
    
    window.speechSynthesis.cancel(); // إلغاء أي صوت سابق
    window.speechSynthesis.speak(utterance);
    
    document.getElementById('output').innerText = text;
});
