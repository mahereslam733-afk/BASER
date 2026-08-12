const $=id=>document.getElementById(id);
const statusText=$("statusText"), heard=$("heard"), panel=$("cameraPanel"), video=$("camera"), canvas=$("canvas");
let stream=null, deferredPrompt=null;

function speak(text){
  if(!("speechSynthesis" in window)){ heard.textContent=text; return; }
  speechSynthesis.cancel();
  const u=new SpeechSynthesisUtterance(text);
  u.lang="ar-EG"; u.rate=.9; u.pitch=1;
  speechSynthesis.speak(u);
  heard.textContent=text;
}
function status(t){statusText.textContent=t; speak(t)}
$("speakTitle").onclick=()=>speak("أبصار AI، مساعدك اليومي للمكفوفين");

async function openCamera(){
  panel.hidden=false;
  try{
    stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:"environment"},audio:false});
    video.srcObject=stream;
    statusText.textContent="الكاميرا جاهزة، وجهها إلى المستند أو الشيء";
    speak("الكاميرا جاهزة. وجهها إلى المستند أو الشيء ثم اضغط التقاط.");
  }catch(e){
    status("تعذر فتح الكاميرا. يمكنك اختيار صورة من الهاتف.");
    $("fileInput").click();
  }
}
function closeCamera(){
  if(stream) stream.getTracks().forEach(t=>t.stop());
  stream=null; video.srcObject=null; panel.hidden=true;
}
async function readImage(file){
  if(!file)return;
  statusText.textContent="جاري قراءة الصورة...";
  speak("جاري قراءة الصورة، انتظر قليلًا.");
  try{
    const result=await Tesseract.recognize(file,"ara+eng",{logger:m=>{
      if(m.status==="recognizing text") statusText.textContent=`جاري القراءة ${Math.round((m.progress||0)*100)}٪`;
    }});
    const text=(result.data.text||"").trim();
    if(text) speak("النص المقروء: "+text);
    else speak("لم أجد نصًا واضحًا في الصورة.");
  }catch(e){status("تعذر قراءة الصورة حاليًا.");}
}
$("capture").onclick=()=>{
  if(!video.videoWidth){speak("الكاميرا غير جاهزة.");return}
  canvas.width=video.videoWidth; canvas.height=video.videoHeight;
  canvas.getContext("2d").drawImage(video,0,0);
  canvas.toBlob(blob=>readImage(blob),"image/jpeg",.9);
};
$("closeCamera").onclick=closeCamera;
$("fileInput").onchange=e=>readImage(e.target.files[0]);

function action(name){
  if(name==="read"){openCamera();return}
  if(name==="objects"){
    openCamera();
    setTimeout(()=>speak("وضع التعرف على الأشياء. التقط صورة، ثم يمكن ربطها بمحرك ذكاء اصطناعي للتعرف على العناصر."),300);
    return
  }
  if(name==="currency"){
    openCamera();
    setTimeout(()=>speak("وضع التعرف على العملات. التقط صورة واضحة للعملة."),300);
    return
  }
  if(name==="volunteer"){
    const ok=confirm("سيتم فتح واتساب لطلب مساعدة بشرية. هل تريد المتابعة؟");
    if(ok) window.open("https://wa.me/?text="+encodeURIComponent("مرحبًا، أحتاج إلى مساعدة بصرية من متطوع عبر تطبيق أبصار AI."),"_blank");
    return
  }
  if(name==="navigate"){
    if(navigator.geolocation){
      statusText.textContent="جاري تحديد موقعك...";
      navigator.geolocation.getCurrentPosition(p=>{
        const url=`https://www.google.com/maps/dir/?api=1&destination=${p.coords.latitude},${p.coords.longitude}`;
        window.open(url,"_blank");
        speak("تم فتح الخرائط. اختر وجهتك للحصول على التوجيه.");
      },()=>speak("لم أستطع الوصول إلى الموقع. فعّل إذن الموقع من إعدادات الهاتف."));
    }else speak("الملاحة غير مدعومة على هذا الجهاز.");
    return
  }
  if(name==="audio"){speak("يمكن هنا إضافة الكتب والمقالات والمحتوى الصوتي العربي وتشغيله بالصوت.");return}
  if(name==="daily"){speak("الخدمات اليومية تشمل الاتصال، الرسائل، الطقس، المواعيد، والتنبيهات. اختر الخدمة من الهاتف أو أضفها إلى هذه الصفحة.");return}
  if(name==="offline"){speak("دعم بدون إنترنت: الواجهة، القراءة الصوتية، وبعض الوظائف المحلية تعمل بدون إنترنت. التعرف المتقدم بالذكاء الاصطناعي يحتاج نموذجًا محليًا أو اتصالًا.");return}
}
document.querySelectorAll(".feature").forEach(b=>b.onclick=()=>action(b.dataset.action));

$("helpBtn").onclick=()=>speak("أبصار AI يوفر قراءة النصوص، التعرف البصري، العملات، المساعدة البشرية، الملاحة، المحتوى الصوتي، والخدمات اليومية. يمكنك أيضًا استخدام الأوامر الصوتية.");

$("voiceBtn").onclick=()=>{
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR){speak("التحدث الصوتي غير مدعوم في متصفحك. استخدم أزرار الخدمات.");return}
  const r=new SR(); r.lang="ar-EG"; r.interimResults=false; r.maxAlternatives=1;
  speak("تفضل، أنا أسمعك.");
  r.start();
  r.onresult=e=>{
    const q=e.results[0][0].transcript.trim();
    heard.textContent="سمعت: "+q;
    if(/اقرأ|نص|مستند/.test(q)) action("read");
    else if(/شيء|أشياء|تعرف/.test(q)) action("objects");
    else if(/عملة|فلوس|نقود/.test(q)) action("currency");
    else if(/متطوع|مساعدة بشرية/.test(q)) action("volunteer");
    else if(/ملاحة|طريق|اتجاه|مكان/.test(q)) action("navigate");
    else speak("لم أفهم الأمر. قل اقرأ النص، تعرف على الشيء، اطلب متطوع، أو الملاحة.");
  };
};

window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredPrompt=e;$("installBtn").hidden=false});
$("installBtn").onclick=async()=>{if(deferredPrompt){deferredPrompt.prompt();deferredPrompt=null;$("installBtn").hidden=true}};

if("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(()=>{});
