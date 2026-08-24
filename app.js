/* =========================================================
   بصير BASER - app.js
   متوافق مع الواجهة الحالية بدون تغيير التصميم
   ========================================================= */

"use strict";

/* =========================
   1. إعدادات الصوت
========================= */

let speechSpeed = 0.9;

function speak(text) {

    text = String(text || "").trim();

    const statusBox = document.getElementById("status-box");

    if (statusBox) {
        statusBox.textContent = text;
    }

    if (!("speechSynthesis" in window)) {
        return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    utterance.lang = "ar-EG";
    utterance.rate = speechSpeed;
    utterance.pitch = 1;

    const voices = window.speechSynthesis.getVoices();

    const arabicVoice = voices.find(function (voice) {
        return voice.lang &&
               voice.lang.toLowerCase().startsWith("ar");
    });

    if (arabicVoice) {
        utterance.voice = arabicVoice;
        utterance.lang = arabicVoice.lang;
    }

    window.speechSynthesis.speak(utterance);
}

window.speak = speak;


/* =========================
   2. أدوات مساعدة
========================= */

function status(message) {
    const box = document.getElementById("status-box");

    if (box) {
        box.textContent = message;
    }
}

function openScreen(screenId, message) {

    const screens = document.querySelectorAll(".screen");

    screens.forEach(function (screen) {
        screen.classList.remove("active");
    });

    const target = document.getElementById(screenId);

    if (target) {
        target.classList.add("active");
    }

    if (message) {
        speak(message);
    }

    window.scrollTo(0, 0);
}

function openCamera(inputId) {

    const input = document.getElementById(inputId);

    if (!input) {
        speak("الكاميرا غير متاحة لهذه الوظيفة.");
        return;
    }

    input.value = "";
    input.click();
}


/* =========================
   3. تشغيل التطبيق
========================= */

document.addEventListener("DOMContentLoaded", function () {

    /* ---------------------------------
       التنقل بين الشاشات
    --------------------------------- */

    document.querySelectorAll("[data-target]").forEach(function (button) {

        button.addEventListener("click", function () {

            const target =
                button.getAttribute("data-target");

            const title =
                button.querySelector("span")?.textContent ||
                "القسم المطلوب";

            openScreen(
                target,
                "تم فتح " + title
            );

        });

    });


    document.querySelectorAll("[data-back]").forEach(function (button) {

        button.addEventListener("click", function () {

            openScreen(
                "homeScreen",
                "تم الرجوع إلى القائمة الرئيسية"
            );

        });

    });


    /* =========================
       4. زر الميكروفون
    ========================= */

    const micBtn =
        document.getElementById("micBtn");

    if (micBtn) {

        micBtn.addEventListener("click", function () {

            startVoiceRecognition();

        });

    }


    /* =========================
       5. قراءة النصوص
    ========================= */

    const ocrInput =
        document.getElementById("ocrCameraInput");

    if (ocrInput) {

        ocrInput.addEventListener(
            "change",
            function (event) {

                const file =
                    event.target.files &&
                    event.target.files[0];

                if (!file) {
                    return;
                }

                readText(file);

            }
        );

    }


    /* =========================
       6. التعرف على الأشياء
    ========================= */

    const objectInput =
        document.getElementById("objCameraInput");

    if (objectInput) {

        objectInput.addEventListener(
            "change",
            function (event) {

                const file =
                    event.target.files &&
                    event.target.files[0];

                if (!file) {
                    return;
                }

                recognizeObjects(file);

            }
        );

    }


    /* =========================
       7. العملات
    ========================= */

    const moneyInput =
        document.getElementById("moneyCameraInput");

    if (moneyInput) {

        moneyInput.addEventListener(
            "change",
            function (event) {

                const file =
                    event.target.files &&
                    event.target.files[0];

                if (!file) {
                    return;
                }

                recognizeMoney(file);

            }
        );

    }


    /* =========================
       8. المساعدة البشرية
    ========================= */

    const volunteerButton =
        document.getElementById(
            "callVolunteerDirect"
        );

    if (volunteerButton) {

        volunteerButton.addEventListener(
            "click",
            function () {

                speak(
                    "جاري الاتصال بالمساعد."
                );

                setTimeout(function () {

                    window.location.href =
                        "tel:122";

                }, 700);

            }
        );

    }


    /* =========================
       9. تحديد الموقع
    ========================= */

    const locationButton =
        document.getElementById(
            "whereAmIBtn"
        );

    if (locationButton) {

        locationButton.addEventListener(
            "click",
            getCurrentLocation
        );

    }


    /* =========================
       10. الطوارئ
    ========================= */

    const emergencyButton =
        document.getElementById(
            "emergencyBtn"
        );

    if (emergencyButton) {

        emergencyButton.addEventListener(
            "click",
            function () {

                speak(
                    "تم تفعيل وضع الطوارئ."
                );

                setTimeout(function () {

                    window.location.href =
                        "tel:122";

                }, 1000);

            }
        );

    }


    /* =========================
       11. وضع عدم الاتصال
    ========================= */

    const offlineButton =
        document.getElementById(
            "offlineBtn"
        );

    if (offlineButton) {

        offlineButton.addEventListener(
            "click",
            function () {

                if (navigator.onLine) {

                    speak(
                        "أنت متصل بالإنترنت حاليًا."
                    );

                } else {

                    speak(
                        "أنت تعمل حاليًا بدون إنترنت."
                    );

                }

            }
        );

    }


    /* =========================
       12. زر الإشعارات
    ========================= */

    const notificationButton =
        document.getElementById(
            "notifBtn"
        );

    if (notificationButton) {

        notificationButton.addEventListener(
            "click",
            function () {

                speak(
                    "لا توجد إشعارات جديدة."
                );

            }
        );

    }


    /* =========================
       13. زر القائمة
    ========================= */

    const menuButton =
        document.getElementById(
            "menuBtn"
        );

    if (menuButton) {

        menuButton.addEventListener(
            "click",
            function () {

                speak(
                    "هذه هي القائمة الرئيسية لتطبيق بصير."
                );

            }
        );

    }

});


/* =========================================================
   قراءة النصوص OCR
========================================================= */

async function readText(file) {

    speak(
        "تم التقاط الصورة. جاري قراءة النص، يرجى الانتظار."
    );

    try {

        if (typeof Tesseract === "undefined") {

            speak(
                "محرك قراءة النصوص غير متاح. تأكد من الاتصال بالإنترنت."
            );

            return;
        }

        const imageURL =
            URL.createObjectURL(file);

        const result =
            await Tesseract.recognize(
                imageURL,
                "ara+eng",
                {
                    logger: function (info) {

                        if (
                            info.status ===
                            "recognizing text"
                        ) {

                            const percent =
                                Math.round(
                                    (info.progress || 0) *
                                    100
                                );

                            status(
                                "جاري قراءة النص... " +
                                percent +
                                "%"
                            );

                        }

                    }
                }
            );

        URL.revokeObjectURL(imageURL);

        let text =
            result?.data?.text || "";

        text =
            text
                .replace(/\s+/g, " ")
                .trim();

        if (text.length === 0) {

            speak(
                "لم أتمكن من العثور على نص واضح في الصورة."
            );

            return;
        }

        speak(
            "النص المقروء هو: " +
            text
        );

    } catch (error) {

        console.error(
            "OCR Error:",
            error
        );

        speak(
            "حدث خطأ أثناء قراءة النص. حاول تصوير الورقة مرة أخرى."
        );

    }

}


/* =========================================================
   التعرف على الأشياء
========================================================= */

let objectModel = null;

const objectNames = {

    person: "شخص",
    bicycle: "دراجة",
    car: "سيارة",
    motorcycle: "دراجة نارية",
    airplane: "طائرة",
    bus: "حافلة",
    train: "قطار",
    truck: "شاحنة",
    boat: "قارب",

    traffic_light: "إشارة مرور",
    stop_sign: "علامة توقف",

    bird: "طائر",
    cat: "قطة",
    dog: "كلب",
    horse: "حصان",
    sheep: "خروف",
    cow: "بقرة",
    elephant: "فيل",
    bear: "دب",
    zebra: "حمار وحشي",
    giraffe: "زرافة",

    backpack: "حقيبة ظهر",
    umbrella: "مظلة",
    handbag: "حقيبة يد",
    suitcase: "حقيبة سفر",

    bottle: "زجاجة",
    cup: "كوب",
    fork: "شوكة",
    knife: "سكين",
    spoon: "ملعقة",
    bowl: "وعاء",

    banana: "موزة",
    apple: "تفاحة",
    sandwich: "شطيرة",
    orange: "برتقالة",
    broccoli: "بروكلي",
    carrot: "جزرة",
    pizza: "بيتزا",
    donut: "دونات",
    cake: "كعكة",

    chair: "كرسي",
    couch: "أريكة",
    potted_plant: "نبات",
    bed: "سرير",
    dining_table: "طاولة",
    toilet: "مرحاض",

    tv: "تلفاز",
    laptop: "حاسوب محمول",
    mouse: "فأرة حاسوب",
    remote: "جهاز تحكم",
    keyboard: "لوحة مفاتيح",
    cell_phone: "هاتف محمول",

    microwave: "ميكروويف",
    oven: "فرن",
    toaster: "محمصة",
    sink: "حوض",
    refrigerator: "ثلاجة",

    book: "كتاب",
    clock: "ساعة",
    vase: "مزهرية",
    scissors: "مقص",
    toothbrush: "فرشاة أسنان"

};


async function loadObjectModel() {

    if (objectModel) {
        return objectModel;
    }

    try {

        if (
            typeof tf === "undefined"
        ) {

            await loadScript(
                "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.20.0/dist/tf.min.js"
            );

        }

        if (
            typeof cocoSsd === "undefined"
        ) {

            await loadScript(
                "https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd"
            );

        }

        objectModel =
            await cocoSsd.load();

        return objectModel;

    } catch (error) {

        console.error(
            "Model loading error:",
            error
        );

        throw error;

    }

}


function loadScript(url) {

    return new Promise(
        function (resolve, reject) {

            const script =
                document.createElement("script");

            script.src = url;

            script.onload =
                resolve;

            script.onerror =
                reject;

            document.head.appendChild(
                script
            );

        }
    );

}


function imageFromFile(file) {

    return new Promise(
        function (resolve, reject) {

            const image =
                new Image();

            const url =
                URL.createObjectURL(file);

            image.onload =
                function () {

                    URL.revokeObjectURL(
                        url
                    );

                    resolve(image);

                };

            image.onerror =
                reject;

            image.src = url;

        }
    );

}


async function recognizeObjects(file) {

    speak(
        "تم التقاط الصورة. جاري تحليل الأشياء بالذكاء الاصطناعي."
    );

    try {

        const model =
            await loadObjectModel();

        const image =
            await imageFromFile(file);

        const predictions =
            await model.detect(image);

        const valid =
            predictions
                .filter(function (item) {
                    return item.score >= 0.40;
                })
                .sort(function (a, b) {
                    return b.score - a.score;
                })
                .slice(0, 6);

        if (valid.length === 0) {

            speak(
                "لم أتمكن من التعرف على شيء واضح. حاول الاقتراب من الشيء."
            );

            return;
        }

        const names =
            valid.map(function (item) {

                return (
                    objectNames[item.class] ||
                    item.class
                );

            });

        const uniqueNames =
            [...new Set(names)];

        speak(
            "أمامك: " +
            uniqueNames.join("، ")
        );

    } catch (error) {

        console.error(
            "Object Recognition Error:",
            error
        );

        speak(
            "حدث خطأ أثناء تشغيل التعرف على الأشياء. حاول مرة أخرى مع الاتصال بالإنترنت."
        );

    }

}


/* =========================================================
   العملات
========================================================= */

async function recognizeMoney(file) {

    speak(
        "جاري تحليل صورة العملة."
    );

    /*
       لا نستخدم نتيجة وهمية.
       النموذج العام للتعرف على الأشياء لا يستطيع
       تحديد فئة الجنيه المصري بدقة.
    */

    speak(
        "لا أستطيع تحديد فئة الجنيه المصري بدقة بهذا النموذج. تحتاج هذه الوظيفة إلى نموذج متخصص بالعملات المصرية."
    );

}


/* =========================================================
   الموقع
========================================================= */

function getCurrentLocation() {

    if (!navigator.geolocation) {

        speak(
            "خدمة تحديد الموقع غير مدعومة على جهازك."
        );

        return;
    }

    speak(
        "جاري تحديد موقعك الحالي."
    );

    navigator.geolocation.getCurrentPosition(

        function (position) {

            const latitude =
                position.coords.latitude
                    .toFixed(5);

            const longitude =
                position.coords.longitude
                    .toFixed(5);

            speak(
                `تم تحديد موقعك. خط العرض ${latitude} وخط الطول ${longitude}.`
            );

        },

        function (error) {

            console.error(
                "Location Error:",
                error
            );

            speak(
                "تعذر تحديد موقعك. اسمح للمتصفح باستخدام الموقع وشغل نظام تحديد المواقع."
            );

        },

        {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0
        }

    );

}


/* =========================================================
   مشاركة الموقع
========================================================= */

async function shareLocation() {

    if (!navigator.geolocation) {

        speak(
            "خدمة الموقع غير متاحة."
        );

        return;
    }

    speak(
        "جاري تجهيز موقعك للمشاركة."
    );

    navigator.geolocation.getCurrentPosition(

        async function (position) {

            const lat =
                position.coords.latitude;

            const lon =
                position.coords.longitude;

            const url =
                `https://www.google.com/maps?q=${lat},${lon}`;

            if (navigator.share) {

                try {

                    await navigator.share({

                        title:
                            "موقعي الحالي",

                        text:
                            "هذا موقعي من تطبيق بصير",

                        url:
                            url

                    });

                } catch (error) {

                    console.log(
                        "Share cancelled"
                    );

                }

            } else {

                try {

                    await navigator.clipboard.writeText(
                        url
                    );

                    speak(
                        "تم نسخ رابط موقعك."
                    );

                } catch (error) {

                    speak(
                        "تعذر مشاركة الموقع."
                    );

                }

            }

        },

        function () {

            speak(
                "تعذر الحصول على موقعك."
            );

        },

        {
            enableHighAccuracy: true,
            timeout: 15000
        }

    );

}


/* =========================================================
   أوامر صوتية
========================================================= */

function startVoiceRecognition() {

    const Recognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    if (!Recognition) {

        speak(
            "التعرف الصوتي غير مدعوم في هذا المتصفح."
        );

        return;
    }

    const recognition =
        new Recognition();

    recognition.lang =
        "ar-EG";

    recognition.continuous =
        false;

    recognition.interimResults =
        false;

    speak(
        "أنا أستمع إليك."
    );

    recognition.onresult =
        function (event) {

            const text =
                event.results[0][0].transcript
                    .trim();

            if (!text) {

                speak(
                    "لم أسمع شيئًا."
                );

                return;
            }

            processVoiceCommand(
                text
            );

        };

    recognition.onerror =
        function () {

            speak(
                "تعذر تشغيل الميكروفون. تأكد من السماح باستخدامه."
            );

        };

    try {

        recognition.start();

    } catch (error) {

        console.error(
            "Speech recognition:",
            error
        );

    }

}


function processVoiceCommand(text) {

    const command =
        text.toLowerCase();

    if (
        command.includes("اقرأ") ||
        command.includes("قراءة") ||
        command.includes("نص") ||
        command.includes("مستند")
    ) {

        openScreen(
            "ocrScreen",
            "تم فتح قراءة النصوص."
        );

        setTimeout(
            function () {
                openCamera(
                    "ocrCameraInput"
                );
            },
            700
        );

        return;
    }


    if (
        command.includes("أشياء") ||
        command.includes("اشياء") ||
        command.includes("شيء") ||
        command.includes("ما أمامي")
    ) {

        openScreen(
            "objectScreen",
            "تم فتح التعرف على الأشياء."
        );

        setTimeout(
            function () {
                openCamera(
                    "objCameraInput"
                );
            },
            700
        );

        return;
    }


    if (
        command.includes("عملة") ||
        command.includes("فلوس") ||
        command.includes("نقود")
    ) {

        openScreen(
            "moneyScreen",
            "تم فتح التعرف على العملات."
        );

        setTimeout(
            function () {
                openCamera(
                    "moneyCameraInput"
                );
            },
            700
        );

        return;
    }


    if (
        command.includes("مساعد") ||
        command.includes("متطوع") ||
        command.includes("مساعدة")
    ) {

        openScreen(
            "helpScreen",
            "تم فتح المساعدة البشرية."
        );

        return;
    }


    if (
        command.includes("أين أنا") ||
        command.includes("اين انا") ||
        command.includes("موقعي") ||
        command.includes("الموقع")
    ) {

        openScreen(
            "navScreen",
            "تم فتح الملاحة."
        );

        setTimeout(
            function () {

                const button =
                    document.getElementById(
                        "whereAmIBtn"
                    );

                if (button) {
                    button.click();
                }

            },
            700
        );

        return;
    }


    if (
        command.includes("الوقت") ||
        command.includes("الساعة") ||
        command.includes("التاريخ")
    ) {

        const now =
            new Date();

        const date =
            now.toLocaleDateString(
                "ar-EG",
                {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                }
            );

        const time =
            now.toLocaleTimeString(
                "ar-EG"
            );

        speak(
            `اليوم ${date} والساعة الآن ${time}.`
        );

        return;
    }


    speak(
        "لم أفهم الأمر. يمكنك أن تقول اقرأ النص، تعرف على الأشياء، تعرف على العملة، أو أين أنا."
    );

}


/* =========================================================
   حالة الإنترنت
========================================================= */

window.addEventListener(
    "online",
    function () {

        speak(
            "تم الاتصال بالإنترنت."
        );

    }
);

window.addEventListener(
    "offline",
    function () {

        speak(
            "تم فقد الاتصال بالإنترنت."
        );

    }
);


/* =========================================================
   التشغيل
========================================================= */

window.addEventListener(
    "load",
    function () {

        setTimeout(
            function () {

                speak(
                    "مرحبًا بك في تطبيق بصير. التطبيق جاهز لمساعدتك."
                );

            },
            1000
        );

    }
);


/* =========================================================
   جعل الوظائف متاحة
========================================================= */

window.BASER = {

    speak: speak,

    readText: readText,

    recognizeObjects:
        recognizeObjects,

    recognizeMoney:
        recognizeMoney,

    getCurrentLocation:
        getCurrentLocation,

    shareLocation:
        shareLocation,

    startVoiceRecognition:
        startVoiceRecognition

};
