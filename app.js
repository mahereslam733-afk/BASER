const $ = id => document.getElementById(id);

const statusText = $("statusText");
const heard = $("heard");
const panel = $("cameraPanel");
const video = $("camera");
const canvas = $("canvas");

let stream = null;
let deferredPrompt = null;
let currentMode = null;

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

  // البحث عن صوت عربي حقيقي في الجهاز
  const arabicVoice =
    voices.find(v => v.lang === "ar-EG") ||
    voices.find(v => v.lang.startsWith("ar"));

  const u = new SpeechSynthesisUtterance(text);

  u.lang = arabicVoice ? arabicVoice.lang : "ar-EG";
  u.voice = arabicVoice || null;
  u.rate = 0.85;
  u.pitch = 1;
  u.volume = 1;

  speechSynthesis.speak(u);

  if (heard) heard.textContent = text;
}

speechSynthesis?.addEventListener?.("voiceschanged", () => {
  // تحميل الأصوات العربية عند توفرها
});

/* =========================
   الحالة
========================= */

function status(text) {
  if (statusText) statusText.textContent = text;
  speak(text);
}

/* =========================
   عنوان التطبيق
========================= */

if ($("speakTitle")) {
  $("speakTitle").onclick = () =>
    speak("بصير، مساعدك الذكي اليومي للمكفوفين");
}

/* =========================
   الكاميرا
========================= */

async function openCamera(mode = "read") {
  currentMode = mode;

  if (panel) panel.hidden = false;

  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: {
          ideal: "environment"
        }
      },
      audio: false
    });

    if (video) {
      video.srcObject = stream;
    }

    let message = "الكاميرا جاهزة.";

    if (mode === "read") {
      message += " وجه الكاميرا إلى النص أو المستند.";
    }

    if (mode === "objects") {
      message += " وجه الكاميرا إلى الشيء الذي تريد التعرف عليه.";
    }

    if (mode === "currency") {
      message += " وجه الكاميرا إلى العملة بوضوح.";
    }

    status(message);

  } catch (error) {

    status(
      "تعذر فتح الكاميرا. يمكنك اختيار صورة من الهاتف."
    );

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

  if (video) {
    video.srcObject = null;
  }

  if (panel) {
    panel.hidden = true;
  }

  currentMode = null;
}

/* =========================
   قراءة النصوص
========================= */

async function readImage(file) {

  if (!file) return;

  status("جاري تحليل الصورة، انتظر قليلًا.");

  try {

    if (typeof Tesseract === "undefined") {
      speak(
        "محرك قراءة النصوص غير متاح حاليًا. تأكد من اتصال التطبيق بالمكتبة."
      );
      return;
    }

    const result = await Tesseract.recognize(
      file,
      "ara+eng",
      {
        logger: message => {

          if (
            message.status === "recognizing text" &&
            statusText
          ) {
            const percent =
              Math.round((message.progress || 0) * 100);

            statusText.textContent =
              `جاري قراءة النص ${percent} بالمئة`;
          }
        }
      }
    );

    let text =
      (result?.data?.text || "")
        .replace(/\s+/g, " ")
        .trim();

    if (!text) {
      speak("لم أجد نصًا واضحًا في الصورة.");
      return;
    }

    // تنظيف بعض الرموز الغريبة
    text = cleanArabicText(text);

    speak("النص المقروء هو: " + text);

  } catch (error) {

    console.error(error);

    speak(
      "حدث خطأ أثناء قراءة الصورة. حاول التقاط صورة أوضح."
    );
  }
}

/* =========================
   تنظيف النص
========================= */

function cleanArabicText(text) {

  return text
    .replace(/[^\u0600-\u06FFa-zA-Z0-9٠-٩.,!?؟،؛:()\-\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/* =========================
   التقاط صورة
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

    const file = event.target.files?.[0];

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

  status(
    "تم التقاط الصورة. جاري التعرف على الشيء."
  );

  /*
   * ملاحظة:
   * هنا يجب ربط نموذج ذكاء اصطناعي حقيقي.
   * الكود القديم لم يكن ينفذ التعرف فعليًا.
   */

  speak(
    "وظيفة التعرف على الأشياء جاهزة للربط بمحرك الذكاء الاصطناعي. لم يتم التعرف على شيء لأن نموذج التعرف غير مربوط بالتطبيق حتى الآن."
  );
}

/* =========================
   التعرف على العملات
========================= */

async function recognizeCurrency(file) {

  status(
    "تم التقاط صورة العملة. جاري تحليلها."
  );

  /*
   * لا ندعي معرفة العملة بدون نموذج حقيقي.
   */

  speak(
    "وظيفة التعرف على العملات جاهزة للربط بمحرك ذكاء اصطناعي للتعرف على العملات المصرية."
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
      "سيتم فتح واتساب لطلب مساعدة بشرية. هل تريد المتابعة؟"
    );

    if (ok) {

      const message =
        "مرحبًا، أحتاج إلى مساعدة بصرية من متطوع عبر تطبيق بصير.";

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

      speak(
        "الملاحة غير مدعومة على هذا الجهاز."
      );

      return;
    }

    status("جاري تحديد موقعك.");

    navigator.geolocation.getCurrentPosition(

      position => {

        const latitude =
          position.coords.latitude;

        const longitude =
          position.coords.longitude;

        const url =
          `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;

        window.open(url, "_blank");

        speak(
          "تم فتح خرائط جوجل. اختر وجهتك للحصول على التوجيه."
        );
      },

      () => {

        speak(
          "لم أستطع الوصول إلى موقعك. فعّل إذن الموقع من إعدادات الهاتف."
        );
      }
    );

    return;
  }

  if (name === "audio") {

    speak(
      "قسم المحتوى الصوتي يتيح إضافة الكتب والمقالات والمحتوى العربي."
    );

    return;
  }

  if (name === "daily") {

    speak(
      "الخدمات اليومية تشمل الاتصال والرسائل والطقس والمواعيد والتنبيهات."
    );

    return;
  }

  if (name === "offline") {

    speak(
      "بعض وظائف التطبيق يمكن أن تعمل بدون إنترنت، أما التعرف المتقدم بالذكاء الاصطناعي فيحتاج إلى نموذج محلي أو اتصال بالإنترنت."
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

      const actionName =
        button.dataset.action;

      action(actionName);
    };
  });

/* =========================
   زر المساعدة
========================= */

if ($("helpBtn")) {

  $("helpBtn").onclick = () => {

    speak(
      "بصير مساعد ذكي للمكفوفين. يمكنك قراءة النصوص، التعرف على الأشياء والعملات، طلب مساعدة بشرية، استخدام الملاحة، والاستماع إلى المحتوى الصوتي."
    );
  };
}

/* =========================
   الأوامر الصوتية
========================= */

if ($("voiceBtn")) {

  $("voiceBtn").onclick = () => {

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {

      speak(
        "التعرف على الكلام غير مدعوم في هذا المتصفح."
      );

      return;
    }

    const recognition =
      new SpeechRecognition();

    recognition.lang = "ar-EG";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    speak(
      "تفضل، بصير يستمع إليك."
    );

    try {
      recognition.start();
    } catch (error) {
      console.log(error);
    }

    recognition.onresult = event => {

      const command =
        event.results[0][0].transcript
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
        /شيء|أشياء|جسم|تعرف على|صورة/.test(command)
      ) {
        action("objects");
      }

      else if (
        /عملة|عملات|فلوس|نقود|جنيه/.test(command)
      ) {
        action("currency");
      }

      else if (
        /متطوع|مساعدة بشرية|ساعدني/.test(command)
      ) {
        action("volunteer");
      }

      else if (
        /ملاحة|طريق|اتجاه|مكان|خريطة/.test(command)
      ) {
        action("navigate");
      }

      else {
        speak(
          "لم أفهم الأمر. يمكنك قول: اقرأ النص، تعرف على الشيء، تعرف على العملة، اطلب متطوع، أو افتح الملاحة."
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
        "التطبيق مثبت بالفعل أو التثبيت غير متاح حاليًا."
      );
      return;
    }

    deferredPrompt.prompt();

    deferredPrompt = null;

    $("installBtn").hidden = true;
  };
}

/* =========================
   Service Worker
========================= */

if ("serviceWorker" in navigator) {

  navigator.serviceWorker
    .register("sw.js")
    .catch(error => {
      console.log(
        "Service Worker:",
        error
      );
    });
}

/* =========================
   رسالة البداية
========================= */

window.addEventListener(
  "load",
  () => {

    setTimeout(() => {

      speak(
        "مرحبًا بك في بصير، مساعدك الذكي للمكفوفين."
      );

    }, 800);
  }
);
