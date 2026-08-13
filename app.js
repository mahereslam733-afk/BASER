const $ = (id) => document.getElementById(id);

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
    voices.find(v => v.lang.toLowerCase() === "ar-eg") ||
    voices.find(v => v.lang.toLowerCase().startsWith("ar"));

  const utterance = new SpeechSynthesisUtterance(text);

  utterance.lang = arabicVoice ? arabicVoice.lang : "ar-EG";

  if (arabicVoice) {
    utterance.voice = arabicVoice;
  }

  utterance.rate = 0.8;
  utterance.pitch = 1;
  utterance.volume = 1;

  speechSynthesis.speak(utterance);

  if (heard) {
    heard.textContent = text;
  }
}

/* =========================
   رسالة الحالة
========================= */

function setStatus(text, voice = true) {
  if (statusText) {
    statusText.textContent = text;
  }

  if (voice) {
    speak(text);
  }
}

/* =========================
   نطق اسم التطبيق
========================= */

if ($("speakTitle")) {
  $("speakTitle").onclick = () => {
    speak("بصير، مساعدك الذكي للمكفوفين");
  };
}

/* =========================
   فتح الكاميرا
========================= */

async function openCamera(mode) {
  currentMode = mode || "read";

  if (panel) {
    panel.hidden = false;
  }

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

    if (currentMode === "read") {
      speak(
        "الكاميرا جاهزة. وجهها إلى النص ثم اضغط التقاط الصورة."
      );
    }

    if (currentMode === "objects") {
      speak(
        "الكاميرا جاهزة. وجهها إلى الشيء ثم اضغط التقاط الصورة."
      );
    }

    if (currentMode === "currency") {
      speak(
        "الكاميرا جاهزة. وجهها إلى العملة ثم اضغط التقاط الصورة."
      );
    }

  } catch (error) {

    console.error(error);

    speak(
      "تعذر فتح الكاميرا. يمكنك اختيار صورة من الهاتف."
    );

    if ($("fileInput")) {
      $("fileInput").click();
    }
  }
}

/* =========================
   إغلاق الكاميرا
========================= */

function closeCamera() {

  if (stream) {
    stream.getTracks().forEach(track => {
      track.stop();
    });
  }

  stream = null;

  if (video) {
    video.srcObject = null;
  }

  if (panel) {
    panel.hidden = true;
  }
}

if ($("closeCamera")) {
  $("closeCamera").onclick = closeCamera;
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
   قراءة النص العربي
========================= */

async function readImage(file) {

  if (!file) return;

  if (statusText) {
    statusText.textContent = "جاري قراءة النص...";
  }

  try {

    if (typeof Tesseract === "undefined") {

      speak(
        "محرك قراءة النصوص غير متاح. تأكد من اتصال التطبيق بالإنترنت."
      );

      return;
    }

    speak("جاري قراءة النص، انتظر قليلًا.");

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
              Math.round(
                (data.progress || 0) * 100
              );

            statusText.textContent =
              "جاري قراءة النص " +
              percent +
              " بالمئة";
          }
        }
      }
    );

    let text = "";

    if (
      result &&
      result.data &&
      result.data.text
    ) {
      text = result.data.text;
    }

    text = cleanArabicText(text);

    if (!text) {

      speak(
        "لم أجد نصًا عربيًا واضحًا. حاول تصوير الورقة بصورة أوضح."
      );

      return;
    }

    speak(
      "النص المقروء: " + text
    );

  } catch (error) {

    console.error(error);

    speak(
      "حدث خطأ أثناء قراءة النص. حاول مرة أخرى بصورة أوضح."
    );
  }
}

/* =========================
   التقاط الصورة
========================= */

if ($("capture")) {

  $("capture").onclick = () => {

    if (
      !video ||
      !video.videoWidth ||
      !video.videoHeight
    ) {

      speak(
        "الكاميرا غير جاهزة."
      );

      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context =
      canvas.getContext("2d");

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

/* =========================
   اختيار صورة من الهاتف
========================= */

if ($("fileInput")) {

  $("fileInput").onchange = event => {

    const file =
      event.target.files &&
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

  if (!file) return;

  speak(
    "تم التقاط الصورة. جاري تجهيزها للتعرف."
  );

  /*
    ملاحظة مهمة:
    التطبيق الحالي لا يحتوي على نموذج ذكاء اصطناعي
    حقيقي للتعرف على الأشياء.
  */

  setTimeout(() => {

    speak(
      "التعرف على الأشياء يحتاج إلى ربط نموذج ذكاء اصطناعي بالتطبيق. هذه الوظيفة لم يتم تفعيل محركها بعد."
    );

  }, 700);
}

/* =========================
   التعرف على العملات
========================= */

async function recognizeCurrency(file) {

  if (!file) return;

  speak(
    "تم التقاط صورة العملة."
  );

  setTimeout(() => {

    speak(
      "التعرف على العملات يحتاج إلى ربط نموذج ذكاء اصطناعي متخصص في العملات المصرية. هذه الوظيفة لم يتم تفعيل محركها بعد."
    );

  }, 700);
}

/* =========================
   الوظائف الرئيسية
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

      speak(
        "الملاحة غير مدعومة على هذا الجهاز."
      );

      return;
    }

    setStatus(
      "جاري تحديد موقعك."
    );

    navigator.geolocation.getCurrentPosition(

      position => {

        const latitude =
          position.coords.latitude;

        const longitude =
          position.coords.longitude;

        const url =
          "https://www.google.com/maps/dir/?api=1&destination=" +
          latitude +
          "," +
          longitude;

        window.open(
          url,
          "_blank"
        );

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
      "الخدمات اليومية تشمل الاتصال والرسائل والطقس والمواعيد والتنبيهات."
    );

    return;
  }

  if (name === "offline") {

    speak(
      "بعض وظائف بصير يمكن أن تعمل بدون إنترنت، بينما بعض وظائف الذكاء الاصطناعي تحتاج إلى الإنترنت."
    );

    return;
  }
}

/* =========================
   ربط الأزرار
========================= */

document
  .querySelectorAll(".feature")
  .forEach(button => {
