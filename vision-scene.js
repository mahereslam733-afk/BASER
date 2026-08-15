// ======================================================
// بصير - التعرف على الأشياء ووصف المشهد بالعربية
// ======================================================

let basirCameraStream = null;
let basirVisionModel = null;


// ======================================================
// عناصر الصفحة
// ======================================================

const startCameraBtn =
    document.getElementById("startCameraBtn");

const captureSceneBtn =
    document.getElementById("captureSceneBtn");

const stopCameraBtn =
    document.getElementById("stopCameraBtn");

const cameraContainer =
    document.getElementById("cameraContainer");

const basirCamera =
    document.getElementById("basirCamera");

const basirCanvas =
    document.getElementById("basirCanvas");

const sceneDescription =
    document.getElementById("sceneDescription");


// ======================================================
// أسماء الأشياء باللغة العربية
// ======================================================

const basirArabicObjects = {

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
    bench: "مقعد",

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
    teddy_bear: "دبدوب",
    hair_drier: "مجفف شعر",
    toothbrush: "فرشاة أسنان"
};


// ======================================================
// تشغيل الكاميرا
// ======================================================

startCameraBtn.addEventListener(
    "click",
    startBasirCamera
);


async function startBasirCamera() {

    try {

        if (!navigator.mediaDevices ||
            !navigator.mediaDevices.getUserMedia) {

            showSceneMessage(
                "الكاميرا غير مدعومة في هذا المتصفح."
            );

            speakBasirArabic(
                "الكاميرا غير مدعومة في هذا المتصفح."
            );

            return;
        }


        // طلب الوصول إلى الكاميرا

        basirCameraStream =
            await navigator.mediaDevices.getUserMedia({

                video: {
                    facingMode: {
                        ideal: "environment"
                    },

                    width: {
                        ideal: 1280
                    },

                    height: {
                        ideal: 720
                    }
                },

                audio: false
            });


        basirCamera.srcObject =
            basirCameraStream;


        cameraContainer.style.display =
            "block";

        captureSceneBtn.style.display =
            "inline-block";

        stopCameraBtn.style.display =
            "inline-block";

        startCameraBtn.style.display =
            "none";


        showSceneMessage(
            "الكاميرا تعمل. وجه الهاتف نحو المشهد ثم اضغط التعرف على المشهد."
        );

        speakBasirArabic(
            "الكاميرا تعمل. وجه الهاتف نحو المشهد ثم اضغط التعرف على المشهد."
        );


        // تحميل نموذج الذكاء الاصطناعي

        await loadBasirVisionModel();

    }

    catch (error) {

        console.error(
            "Camera Error:",
            error
        );

        showSceneMessage(
            "تعذر تشغيل الكاميرا. تأكد من السماح للتطبيق باستخدام الكاميرا."
        );

        speakBasirArabic(
            "تعذر تشغيل الكاميرا. تأكد من السماح للتطبيق باستخدام الكاميرا."
        );
    }
}


// ======================================================
// تحميل نموذج الذكاء الاصطناعي
// ======================================================

async function loadBasirVisionModel() {

    if (basirVisionModel) {
        return basirVisionModel;
    }


    showSceneMessage(
        "جاري تحميل نظام التعرف على الأشياء..."
    );


    try {

        basirVisionModel =
            await cocoSsd.load();


        showSceneMessage(
            "تم تشغيل نظام التعرف على الأشياء."
        );


        return basirVisionModel;

    }

    catch (error) {

        console.error(
            "Model Error:",
            error
        );

        throw error;
    }
}


// ======================================================
// التعرف على المشهد
// ======================================================

captureSceneBtn.addEventListener(
    "click",
    analyzeBasirScene
);


async function analyzeBasirScene() {

    if (!basirVisionModel) {

        try {

            await loadBasirVisionModel();

        }

        catch {

            showSceneMessage(
                "تعذر تشغيل الذكاء الاصطناعي."
            );

            return;
        }
    }


    try {

        captureSceneBtn.disabled =
            true;


        showSceneMessage(
            "جاري تحليل المشهد..."
        );


        // التأكد من أن الفيديو جاهز

        if (basirCamera.readyState <
            HTMLMediaElement.HAVE_CURRENT_DATA) {

            showSceneMessage(
                "انتظر لحظة حتى تصبح صورة الكاميرا جاهزة."
            );

            return;
        }


        // أخذ لقطة من الكاميرا

        const context =
            basirCanvas.getContext("2d");


        basirCanvas.width =
            basirCamera.videoWidth;

        basirCanvas.height =
            basirCamera.videoHeight;


        context.drawImage(
            basirCamera,
            0,
            0,
            basirCanvas.width,
            basirCanvas.height
        );


        // تحليل الصورة

        const predictions =
            await basirVisionModel.detect(
                basirCanvas
            );


        // اختيار النتائج الجيدة فقط

        const goodPredictions =
            predictions.filter(
                item =>
                    item.score >= 0.50
            );


        createArabicSceneDescription(
            goodPredictions
        );

    }

    catch (error) {

        console.error(
            "Scene Error:",
            error
        );

        showSceneMessage(
            "حدث خطأ أثناء تحليل المشهد."
        );

        speakBasirArabic(
            "حدث خطأ أثناء تحليل المشهد."
        );

    }

    finally {

        captureSceneBtn.disabled =
            false;
    }
}


// ======================================================
// إنشاء وصف المشهد باللغة العربية
// ======================================================

function createArabicSceneDescription(
    predictions
) {

    if (
        !predictions ||
        predictions.length === 0
    ) {

        const message =
            "لم أتمكن من التعرف على أشياء واضحة في المشهد.";

        showSceneMessage(message);

        speakBasirArabic(message);

        return;
    }


    // تجميع الأشياء

    const detectedObjects = {};


    predictions.forEach(
        prediction => {

            const objectName =
                basirArabicObjects[
                    prediction.class
                ] ||
                prediction.class;


            if (
                !detectedObjects[
                    prediction.class
                ]
            ) {

                detectedObjects[
                    prediction.class
                ] = {

                    name: objectName,

                    count: 0,

                    score:
                        prediction.score,

                    positions: []
                };
            }


            detectedObjects[
                prediction.class
            ].count++;


            detectedObjects[
                prediction.class
            ].positions.push(
                prediction.bbox
            );
        }
    );


    const objects =
        Object.values(
            detectedObjects
        );


    // ==================================================
    // بناء الوصف
    // ==================================================

    let description =
        "أستطيع أن أرى في المشهد: ";


    const sentences = [];


    objects.forEach(
        object => {

            let objectText =
                object.name;


            // عدد الأشياء

            if (object.count > 1) {

                objectText +=
                    ` وعددها ${object.count}`;
            }


            // تحديد مكان الشيء

            const position =
                getObjectPosition(
                    object.positions[0]
                );


            if (position) {

                objectText +=
                    ` في ${position}`;
            }


            sentences.push(
                objectText
            );
        }
    );


    description +=
        sentences.join("، ") +
        ".";


    // ==================================================
    // عرض الوصف كتابة
    // ==================================================

    showSceneMessage(
        description
    );


    // ==================================================
    // قراءة الوصف صوتيًا
    // ==================================================

    speakBasirArabic(
        description
    );
}


// ======================================================
// تحديد مكان الشيء داخل الصورة
// ======================================================

function getObjectPosition(
    bbox
) {

    if (!bbox ||
        bbox.length < 4) {

        return "";
    }


    const x =
        bbox[0];

    const width =
        bbox[2];


    // عرض الفيديو التقريبي

    const centerX =
        x + (width / 2);


    const videoWidth =
        basirCamera.videoWidth;


    if (!videoWidth) {

        return "";
    }


    const percentage =
        centerX / videoWidth;


    if (percentage < 0.33) {

        return "يسار المشهد";

    }

    if (percentage > 0.66) {

        return "يمين المشهد";

    }


    return "منتصف المشهد";
}


// ======================================================
// إيقاف الكاميرا
// ======================================================

stopCameraBtn.addEventListener(
    "click",
    stopBasirCamera
);


function stopBasirCamera() {

    if (basirCameraStream) {

        basirCameraStream
            .getTracks()
            .forEach(
                track => track.stop()
            );

        basirCameraStream = null;
    }


    basirCamera.srcObject =
        null;


    cameraContainer.style.display =
        "none";


    captureSceneBtn.style.display =
        "none";


    stopCameraBtn.style.display =
        "none";


    startCameraBtn.style.display =
        "inline-block";


    const message =
        "تم إيقاف الكاميرا.";

    showSceneMessage(message);

    speakBasirArabic(message);
}


// ======================================================
// عرض النص
// ======================================================

function showSceneMessage(
    message
) {

    sceneDescription.textContent =
        message;
}


// ======================================================
// نطق اللغة العربية
// ======================================================

function speakBasirArabic(
    text
) {

    if (
        !("speechSynthesis" in window)
    ) {

        return;
    }


    // إيقاف أي كلام سابق

    window.speechSynthesis.cancel();


    const speech =
        new SpeechSynthesisUtterance(
            text
        );


    // اللغة العربية

    speech.lang =
        "ar-SA";


    // سرعة الكلام

    speech.rate =
        0.9;


    // درجة الصوت

    speech.pitch =
        1;


    window.speechSynthesis.speak(
        speech
    );
}
