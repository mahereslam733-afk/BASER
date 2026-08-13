document.getElementById('speak').addEventListener('click', function() {
    // إيقاف أي صوت شغال حالياً
    window.speechSynthesis.cancel();
    
    // تعريف النص
    const utterance = new SpeechSynthesisUtterance("أهلاً بك في تطبيق أبصار، أنا أعمل الآن بالعربية");
    
    // ضبط اللغة
    utterance.lang = 'ar-SA';
    
    // النطق
    window.speechSynthesis.speak(utterance);
});
