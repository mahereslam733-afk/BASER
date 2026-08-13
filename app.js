document.addEventListener('DOMContentLoaded', function() {
    const btn = document.getElementById('speak');
    
    if(btn) {
        btn.addEventListener('click', function() {
            // نغير النص هنا براحتك
            let text = "أهلاً بك في تطبيق أبصار، أنا هنا لمساعدتك";
            
            let utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'ar-SA'; 
            window.speechSynthesis.speak(utterance);
        });
    }
});
