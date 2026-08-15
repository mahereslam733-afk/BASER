// ======================================================
// بصير - الذكاء الاصطناعي للتعرف على الأشياء وقراءة النص
// ======================================================

let visionModel = null;
let selectedImage = null;

const imageInput = document.getElementById("visionImage");
const preview = document.getElementById("visionPreview");

const statusBox = document.getElementById("aiStatus");
const objectResults = document.getElementById("objectResults");
const textResults = document.getElementById("textResults");

const detectObjectsBtn =
    document.getElementById("detectObjectsBtn");

const readTextBtn =
    document.getElementById("readTextBtn");

const describeImageBtn =
    document.getElementById("describeImageBtn");


// ======================================================
// تحويل أسماء الأشياء إلى العربية
// ======================================================

const arabicObjects = {

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
    fire_hydrant: "صنبور إطفاء",
    stop_sign: "علامة توقف",
    parking_meter: "عداد انتظار السيارات",
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
    tie: "ربطة عنق",
    suitcase: "حقيبة سفر",

    bottle: "زجاجة",
    wine_glass: "كوب زجاجي",
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
// تحميل الصورة
// ======================================================

imageInput.addEventListener("change", function () {

    const file = this.files[0];

    if (!file) return;

    selectedImage = file;

    const imageURL = URL.createObjectURL(file);

    preview.src = imageURL;
    preview.style.display = "block";

    objectResults.innerHTML = "";
    textResults.innerHTML = "";

    statusBox.textContent =
        "تم اختيار الصورة. اختر التعرف على الأشياء أو قراءة النص.";

    speakArabic(
        "تم اختيار الصورة. اختر الوظيفة التي تريدها."
    );
});


// ======================================================
// تحميل نموذج الذكاء الاصطناعي
// ======================================================

async function loadVisionModel() {

    if (visionModel) {
        return visionModel;
    }

    statusBox.textContent =
        "جاري تحميل الذكاء الاصطناعي للتعرف على الأشياء...";

    try {

        visionModel = await cocoSsd.load();

        statusBox.textContent =
            "تم تشغيل الذكاء الاصطناعي بنجاح.";

        return visionModel;

    } catch (error) {

        console.error(error);

        statusBox.textContent =
            "حدث خطأ أثناء تشغيل الذكاء الاصطناعي.";

        throw error;
    }
}


// ======================================================
// التعرف على الأشياء
// ======================================================

detectObjectsBtn.addEventListener("click", async function () {

    if (!selectedImage) {

        speakArabic("من فضلك اختر صورة أولاً.");

        statusBox.textContent =
            "من فضلك اختر صورة أولاً.";

        return;
    }

    try {

        detectObjectsBtn.disabled = true;

        statusBox.textContent =
            "جاري تحليل الصورة...";

        const model = await loadVisionModel();

        const predictions =
            await model.detect(preview);

        showObjects(predictions);

    } catch (error) {

        console.error(error);

        statusBox.textContent =
            "تعذر تحليل الصورة.";

        speakArabic(
            "تعذر تحليل الصورة."
        );

    } finally {

        detectObjectsBtn.disabled = false;
    }
});


// ======================================================
// عرض الأشياء المكتشفة
// ======================================================

function showObjects(predictions) {

    objectResults.innerHTML = "";

    if (!predictions || predictions.length === 0) {

        objectResults.innerHTML =
            "<p>لم أتعرف على أشياء واضحة في الصورة.</p>";

        speakArabic(
            "لم أتعرف على أشياء واضحة في الصورة."
        );

        return;
    }

    // الاحتفاظ بالأشياء التي ثقة النموذج فيها 50% أو أكثر
    const detected = predictions.filter(
        item => item.score >= 0.50
    );

    if (detected.length === 0) {

        objectResults.innerHTML =
            "<p>لم أتعرف على شيء بدرجة ثقة كافية.</p>";

        speakArabic(
            "لم أتعرف على شيء بدرجة ثقة كافية."
        );

        return;
    }

    const names = [];

    detected.forEach(item => {

        const englishName = item.class;

        const arabicName =
            arabicObjects[englishName] ||
            englishName;

        const percentage =
            Math.round(item.score * 100);

        names.push(arabicName);

        const result = document.createElement("p");

        result.textContent =
            `${arabicName} - درجة الثقة ${percentage}%`;

        objectResults.appendChild(result);
    });

    // إزالة التكرار
    const uniqueNames = [...new Set(names)];

    let sentence = "";

    if (uniqueNames.length === 1) {

        sentence =
            `أرى في الصورة ${uniqueNames[0]}.`;

    } else {

        sentence =
            `أرى في الصورة ${uniqueNames.join("، ")}.`;
    }

    statusBox.textContent = sentence;

    speakArabic(sentence);
}


// ======================================================
// قراءة النص الموجود في الصورة OCR
// ======================================================

readTextBtn.addEventListener("click", async function () {

    if (!selectedImage) {

        speakArabic(
            "من فضلك اختر صورة تحتوي على نص."
        );

        return;
    }

    try {

        readTextBtn.disabled = true;

        statusBox.textContent =
            "جاري قراءة النص الموجود في الصورة...";

        textResults.innerHTML =
            "<p>جاري التعرف على النص...</p>";

        const result = await Tesseract.recognize(

            selectedImage,

            // اللغة العربية + الإنجليزية
            "ara+eng",

            {

                logger: function (message) {

                    if (
                        message.status ===
                        "recognizing text"
                    ) {

                        const progress =
                            Math.round(
                                message.progress * 100
                            );

                        statusBox.textContent =
                            `جاري قراءة النص... ${progress}%`;
                    }
                }
            }
        );

        const text =
            result.data.text.trim();

        if (!text) {

            textResults.innerHTML =
                "<p>لم يتم العثور على نص واضح.</p>";

            speakArabic(
                "لم يتم العثور على نص واضح في الصورة."
            );

            return;
        }

        textResults.innerHTML = `
            <h3>النص المقروء:</h3>
            <p>${escapeHTML(text)}</p>
        `;

        statusBox.textContent =
            "تم التعرف على النص بنجاح.";

        // قراءة النص بصوت عربي
        speakArabic(text);

    } catch (error) {

        console.error(error);

        statusBox.textContent =
            "حدث خطأ أثناء قراءة النص.";

        speakArabic(
            "حدث خطأ أثناء قراءة النص."
        );

    } finally {

        readTextBtn.disabled = false;
    }
});


// ======================================================
// وصف الصورة
// ======================================================

describeImageBtn.addEventListener("click", async function () {

    if (!selectedImage) {

        speakArabic(
            "من فضلك اختر صورة أولاً."
        );

        return;
    }

    try {

        describeImageBtn.disabled = true;

        statusBox.textContent =
            "جاري وصف الصورة...";

        const model = await loadVisionModel();

        const predictions =
            await model.detect(preview);

        const detected =
            predictions.filter(
                item => item.score >= 0.50
            );

        const names = [
            ...new Set(
                detected.map(item =>
                    arabicObjects[item.class] ||
                    item.class
                )
            )
        ];

        if (names.length === 0) {

            speakArabic(
                "لا أستطيع تحديد أشياء واضحة في الصورة."
            );

            return;
        }

        let description =
            "وصف الصورة: ";

        if (names.length === 1) {

            description +=
                `توجد في الصورة ${names[0]}.`;

        } else {

            description +=
                `أرى ${names.join("، ")} في الصورة.`;
        }

        statusBox.textContent =
            description;

        speakArabic(description);

    } catch (error) {

        console.error(error);

        speakArabic(
            "تعذر وصف الصورة."
        );

    } finally {

        describeImageBtn.disabled = false;
    }
});


// ======================================================
// النطق باللغة العربية
// ======================================================

function speakArabic(text) {

    if (!("speechSynthesis" in window)) {

        console.log(text);

        return;
    }

    window.speechSynthesis.cancel();

    const utterance =
        new SpeechSynthesisUtterance(text);

    utterance.lang = "ar-SA";

    utterance.rate = 0.9;

    utterance.pitch = 1;

    window.speechSynthesis.speak(
        utterance
    );
}


// ======================================================
// حماية النص عند عرضه داخل الصفحة
// ======================================================

function escapeHTML(text) {

    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
