const $ = id => document.getElementById(id);

const statusText = $("statusText");
const heard = $("heard");
const panel = $("cameraPanel");
const video = $("camera");
const canvas = $("canvas");

let stream = null;
let currentMode = "read";
let deferredPrompt = null;

/* =========================
   النطق العربي
========================= */

function speak(text) {
  if (!text) return;

  if (!("speechSynthesis" in window)) {
    if (heard) heard.textContent = text;
    return;
  }

  speechSynthesis.cancel();

  const voices = speechSynthesis.getVoices();

  const arabicVoice =
    voices.find(v => v.lang === "ar-EG") ||
    voices.find(v => v.lang.startsWith("ar"));

  const voice = new SpeechSynthesisUtterance(text);

  voice.lang = arabicVoice ? arabicVoice.lang : "ar-EG";
  if (arabicVoice) voice.voice = arabicVoice;

  voice.rate = 0.8;
  voice.pitch = 1;
  voice.volume = 1;

  speechSynthesis.speak(voice);

  if (heard) heard.textContent = text;
}

/* =========================
   الحالة
========================= */

function status(text) {
  if (statusText) statusText.textContent = text;
  speak(text);
}

/* =========================
   الكاميرا
========================= */

async function openCamera(mode) {
  currentMode = mode || "read";

  if (panel) panel.hidden = false;

  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: "environment" }
      },
      audio: false
    });

    video.srcObject = stream;

    if (currentMode === "read") {
      speak("الكاميرا جاهزة. وجهها إلى النص ثم اضغط التقاط.");
    } else if (currentMode === "objects") {
      speak("وجه الكاميرا إلى الشيء ثم اضغط التقاط.");
    } else if (currentMode === "currency") {
      speak("وجه الكاميرا إلى العملة ثم اضغط التقاط.");
    }

  } catch (error) {
    speak("تعذر فتح الكاميرا. يمكنك اختيار صورة من الهاتف.");

    if ($("fileInput")) {
      $("fileInput").click();
    }
  }
}

function closeCamera() {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
  }

  stream = null;

  if (video) video.srcObject = null;
  if (panel) panel.hidden = true;
}

/* =========================
   تنظيف النص
========================= */

function cleanText(text) {
  return text
    .replace(/[^\u0600-\u06FFa-zA-Z0-9٠-٩.,!?؟،؛:()\-\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/* =========================
   قراءة النص العربي
========================= */

async function readImage(file) {
  if (!file) return;

  statusText.textContent = "جاري قراءة النص...";

  try {

    if (typeof Tesseract === "undefined") {
      speak("محرك قراءة النصوص غير متاح.");
      return;
    }

    /*
      نستخدم العربية فقط حتى لا يحاول المحرك
      تفسير النص العربي كحروف إنجليزية.
    */

    const result = await Tesseract.recognize(
      file,
      "ara",
      {
        logger: data => {

          if (
            data.status === "recognizing text" &&
            statusText
          ) {
            const percent =
              Math.round((data.progress || 0) * 100);

            statusText.textContent =
              "جاري قراءة النص " + percent + " بالمئة";
          }
        }
      }
    );

    let text =
      result &&
      result.data &&
      result.data.text
        ? result.data.text
        : "";

    text = cleanText(text);

    if (!text) {
      speak("لم أجد نصًا عربيًا واضحًا في الصورة.");
      return;
    }

    speak("النص المقروء: " + text);

  } catch (error) {

    console.error(error);

    speak(
      "حدث خطأ أثناء قراءة النص. حاول تصوير الورقة بصورة أوضح."
    );
  }
}

/* =========================
   التقاط الصورة
========================= */

if ($("capture")) {

  $("capture").onclick = () => {

    if (!video || !video.videoWidth) {
      speak("الكاميرا غير جاهزة.");
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");

    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );

    canvas.toBlob(
      blob => {

        if (currentMode === "read") {
          readImage(blob);
        }

        else if (currentMode === "objects") {
          recognizeObjects(blob);
        }

        else if (currentMode === "currency") {
          recognizeCurrency(blob);
        }

      },
      "image/jpeg",
      0.95
    );
  };
}

if ($("closeCamera")) {
  $("closeCamera").onclick = closeCamera;
}

if ($("fileInput")) {

  $("fileInput").onchange = event => {

    const file = event.target.files &&
                 event.target.files[0];

    if (!file) return;

    if (currentMode === "objects") {
      recognizeObjects(file);
    }

    else if (currentMode === "currency") {
      recognizeCurrency(file);
    }

    else {
      readImage(file);
    }
  };
}

/* =========================
   التعرف على الأشياء
========================= */

async function recognizeObjects(file) {

  speak(
    "جاري تحليل الصورة."
  );

  /*
    سيتم ربط هذه الوظيفة لاحقًا
    بمحرك ذكاء اصطناعي حقيقي.
  */

  speak(
    "التعرف على الأشياء يحتاج إلى ربط نموذج ذكاء اصطناعي بالتطبيق."
  );
}

/* =========================
   التعرف على العملات
========================= */

async function recognizeCurrency(file) {

  speak(
    "جاري تحليل صورة العملة."
  );

  /*
    سيتم ربط هذه الوظيفة لاحقًا
    بنموذج التعرف على العملات المصرية.
  */

  speak(
    "التعرف على العملات يحتاج إلى ربط نموذج ذكاء اصطناعي بالتطبيق."
  );
}

/* =========================
   وظائف التطبيق
========================= */

function action(name) {

  if (name === "read") {
    openCamera("read");
    return;
  }

  if (name === "objects") {
    openCamera("objects");
    return;
  }

  if (name === "currency") {
    openCamera("currency");
    return;
  }

  if (name === "volunteer") {

    const ok = confirm(
      "هل تريد طلب مساعدة بشرية؟"
    );

    if (ok) {

      const message =
        "مرحبًا، أحتاج إلى مساعدة بصرية من خلال تطبيق بصير.";

      window.open(
        "https://wa.me/?text=" +
        encodeURIComponent(message),
        "_blank"
      );
    }

    return;
  }

  if (name === "navigate") {

    if (!navigator.geolocation) {
      speak("الملاحة غير مدعومة على هذا الجهاز.");
      return;
    }

    status("جاري تحديد موقعك.");

    navigator.geolocation.getCurrentPosition(

      position => {

        const lat =
          position.coords.latitude;

        const lng =
          position.coords.longitude;

        const url =
          "https://www.google.com/maps/dir/?api=1&destination=" +
          lat +
          "," +
          lng;

        window.open(url, "_blank");

        speak(
          "تم فتح الخرائط. اختر وجهتك للحصول على التوجيه."
        );
      },

      () => {
        speak(
          "لم أستطع الوصول إلى موقعك. فعّل إذن الموقع."
        );
      }
    );

    return;
  }

  if (name === "audio") {
    speak(
      "قسم المحتوى الصوتي للمكفوفين."
    );
    return;
  }

  if (name === "daily") {
    speak(
      "الخدمات اليومية تشمل الاتصال والرسائل والطقس والمواعيد."
    );
    return;
  }

  if (name === "offline") {
    speak(
      "بعض وظائف بصير يمكن أن تعمل بدون إنترنت."
    );
    return;
  }
}

/* =========================
   أزرار الخدمات
========================= */

document
  .querySelectorAll(".feature")
  .forEach(button => {

    button.onclick = () => {
      action(button.dataset.action);
    };

  });

/* =========================
   المساعدة
========================= */

if ($("helpBtn")) {

  $("helpBtn").onclick = () => {

    speak(
      "بصير يساعدك في قراءة النصوص والتعرف البصري والملاحة وطلب المساعدة البشرية."
    );

  };
}

/* =========================
   الأوامر الصوتية بالعربي
========================= */

if ($("voiceBtn")) {

  $("voiceBtn").onclick = () => {

    const Recognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!Recognition) {

      speak(
        "التعرف على الصوت غير مدعوم في المتصفح."
      );

      return;
    }

    const recognition =
      new Recognition();

    recognition.lang = "ar-EG";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    speak("تفضل، أنا أستمع إليك.");

    try {
      recognition.start();
    } catch (error) {
      console.log(error);
    }

    recognition.onresult = event => {

      const command =
        event.results[0][0]
          .transcript
          .trim();

      if (heard) {
        heard.textContent =
          "سمعت: " + command;
      }

      if (
        /اقرأ|قراءة|نص|مستند|ورقة/.test(command)
      ) {
        action("read");
      }

      else if (
        /شيء|أشياء|جسم|صورة|تعرف/.test(command)
      ) {
        action("objects");
      }

      else if (
        /عملة|عملات|فلوس|نقود|جنيه/.test(command)
      ) {
        action("currency");
      }

      else if (
        /متطوع|مساعدة|ساعدني/.test(command)
      ) {
        action("volunteer");
      }

      else if (
        /ملاحة|طريق|اتجاه|خريطة|مكان/.test(command)
      ) {
        action("navigate");
      }

      else {
        speak(
          "لم أفهم الأمر. قل اقرأ النص أو تعرف على الشيء أو تعرف على العملة أو افتح الملاحة."
        );
      }
    };

    recognition.onerror = () => {

      speak(
        "حدثت مشكلة في التعرف على صوتك. حاول مرة أخرى."
      );
    };
  };
}

/* =========================
   تثبيت التطبيق
========================= */

window.addEventListener(
  "beforeinstallprompt",
  event => {

    event.preventDefault();

    deferredPrompt = event;

    if ($("installBtn")) {
      $("installBtn").hidden = false;
    }
  }
);

if ($("installBtn")) {

  $("installBtn").onclick = async () => {

    if (!deferredPrompt) {
      speak(
        "التثبيت غير متاح حاليًا."
      );
      return;
    }

    deferredPrompt.prompt();

    deferredPrompt = null;

    $("installBtn").hidden = true;
  };
}

/* =========================
   تشغيل التطبيق
========================= */

if ("serviceWorker" in navigator) {

  navigator.serviceWorker
    .register("sw.js")
    .catch(error => {
      console.log(error);
    });
}

window.addEventListener(
  "load",
  () => {

    setTimeout(() => {

      speak(
        "مرحبًا بك في بصير، مساعدك الذكي للمكفوفين."
      );

    }, 1000);

  }
);
