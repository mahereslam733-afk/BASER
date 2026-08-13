document.getElementById('speak').addEventListener('click', function() {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance("أهلاً بك في تطبيق أبصار، أنا أعمل الآن بالعربية");
    utterance.lang = 'ar-SA';
    window.speechSynthesis.speak(utterance);
});
