// ======================================================
// تطبيق بصير - app.js
// النسخة الكاملة
// ======================================================


// ======================================================
// 1 - محرك الصوت العربي
// ======================================================

let speechSpeed = 0.9;

const statusBox = document.getElementById("status-box");
const speedRange = document.getElementById("speedRange");
const backBtn = document.getElementById("backBtn");

let arabicVoice = null;


// ------------------------------------------------------
// تحميل الأصوات العربية
// ------------------------------------------------------

function loadArabicVoice() {

    if (!("speechSynthesis" in window)) {
        return;
    }

    const voices = window.speechSynthesis.getVoices();

    if (!voices || voices.length === 0) {
        return;
    }

    arabicVoice = voices.find(function (voice) {

        return voice.lang &&
            voice.lang.toLowerCase().startsWith("ar");

    });

}


// تحميل الأصوات عند توفرها
if ("speechSynthesis" in window) {

    loadArabicVoice();

    window.speechSynthesis.onvoiceschanged = function () {

        loadArabicVoice();

    };

}


// ------------------------------------------------------
// النطق
// ------------------------------------------------------

function speak(text) {

    if (!text) {
        return;
    }

    text = String(text);

    if (statusBox) {

        statusBox.innerText = text;

    }


    // إذا كان Speech Synthesis موجودًا
    if ("speechSynthesis" in window) {

        try {

            window.speechSynthesis.cancel();

            loadArabicVoice();

            const utterance =
                new SpeechSynthesisUtterance(text);

            utterance.rate = speechSpeed;
            utterance.pitch = 1;
            utterance.volume = 1;

            // إجبار اللغة العربية
            utterance.lang = "ar-EG";

            if (arabicVoice) {

                utterance.voice = arabicVoice;
                utterance.lang = arabicVoice.lang;

            }


            utterance.onerror = function (event) {

                console.log(
                    "Speech error:",
                    event.error
                );

            };


            window.speechSynthesis.speak(
                utterance
            );

            return;

        } catch (error) {

            console.log(
                "Speech synthesis error:",
                error
            );

        }

    }


    // حل بديل
    speakCloudFallback(text);

}


// ------------------------------------------------------
// صوت احتياطي
// ------------------------------------------------------

function speakCloudFallback(text) {

    try {

        const encodedText =
            encodeURIComponent(text);

        const audioUrl =
            "https://translate.google.com/translate_tts" +
            "?ie=UTF-8" +
            "&q=" +
            encodedText +
            "&tl=ar" +
            "&client=tw-ob";

        const audio =
            new Audio(audioUrl);

        audio.volume = 1;
        audio.playbackRate = speechSpeed;

        audio.play().catch(function (error) {

            console.log(
                "Cloud audio error:",
                error
            );

        });

    } catch (error) {

        console.log(
            "Cloud speech error:",
            error
        );

    }

}


// ------------------------------------------------------
// سرعة الصوت
// ------------------------------------------------------

if (speedRange) {

    speedRange.addEventListener(
        "input",
        function (event) {

            speechSpeed =
                parseFloat(event.target.value);

            speak(
                "تم تغيير سرعة الصوت إلى " +
                Math.round(
                    speechSpeed * 100
                ) +
                " بالمائة"
            );

        }
    );

}


// ======================================================
// 2 - تشغيل الصوت بعد أول تفاعل
// ======================================================

document.addEventListener(
    "click",
    function firstUserInteraction() {

        loadArabicVoice();

        document.removeEventListener(
            "click",
            firstUserInteraction
        );

    },
    { once: true }
);


// ======================================================
// 3 - قاموس التعرف على الأشياء
// ======================================================

const objectArabicNames = {

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

    fire_hydrant: "حنفية إطفاء",

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

    frisbee: "قرص طائر",

    skis: "زلاجات",

    snowboard: "لوح تزلج",

    sports_ball: "كرة",

    kite: "طائرة ورقية",

    baseball_bat: "مضرب بيسبول",

    baseball_glove: "قفاز رياضي",

    skateboard: "لوح تزلج",

    surfboard: "لوح ركوب الأمواج",

    tennis_racket: "مضرب تنس",

    bottle: "زجاجة",

    wine_glass: "كأس",

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

    hot_dog: "ساندويتش",

    pizza: "بيتزا",

    donut: "دونات",

    cake: "كعكة",

    chair: "كرسي",

    couch: "أريكة",

    potted_plant: "نبات في أصيص",

    bed: "سرير",

    dining_table: "طاولة طعام",

    toilet: "مرحاض",

    tv: "شاشة تلفزيون",

    laptop: "كمبيوتر محمول",

    mouse: "فأرة كمبيوتر",

    remote: "جهاز تحكم عن بعد",

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


function translateObjectName(name) {

    if (
        objectArabicNames[
            name
        ]
    ) {

        return objectArabicNames[
            name
        ];

    }

    return String(name)
        .replace(/_/g, " ");

}


// ======================================================
// 4 - الترحيب
// ======================================================

window.addEventListener(
    "load",
    function () {

        setTimeout(
            function () {

                // لا نحاول تشغيل الكلام تلقائيًا
                // حتى لا يمنعه Chrome

                if (statusBox) {

                    statusBox.innerText =
                        "أهلاً بك في تطبيق بصير. اختر القسم الذي تريد استخدامه.";

                }

            },
            500
        );

    }
);


// ======================================================
// 5 - التنقل بين الشاشات
// ======================================================

const homeScreen =
    document.getElementById("homeScreen");

const allScreens =
    document.querySelectorAll(".screen");

const navButtons =
    document.querySelectorAll(".btn-large");


navButtons.forEach(
    function (button) {

        button.addEventListener(
            "focus",
            function () {

                const label =
                    button.getAttribute(
                        "aria-label"
                    );

                if (label) {

                    speak(label);

                }

            }
        );


        button.addEventListener(
            "click",
            function () {

                const targetScreenId =
                    button.getAttribute(
                        "data-screen"
                    );

                openScreen(
                    targetScreenId,
                    button.innerText
                );

            }
        );

    }
);


// ------------------------------------------------------
// فتح الشاشة
// ------------------------------------------------------

function openScreen(
    screenId,
    screenName
) {

    allScreens.forEach(
        function (screen) {

            screen.classList.remove(
                "active"
            );

        }
    );


    const targetScreen =
        document.getElementById(
            screenId
        );


    if (targetScreen) {

        targetScreen.classList.add(
            "active"
        );


        if (backBtn) {

            backBtn.style.visibility =
                "visible";

        }


        speak(
            "تم فتح " +
            screenName
        );

    }

}


// ------------------------------------------------------
// زر الرجوع
// ------------------------------------------------------

if (backBtn) {

    backBtn.addEventListener(
        "click",
        function () {

            allScreens.forEach(
                function (screen) {

                    screen.classList.remove(
                        "active"
                    );

                }
            );


            if (homeScreen) {

                homeScreen.classList.add(
                    "active"
                );

            }


            backBtn.style.visibility =
                "hidden";


            speak(
                "عدت إلى الشاشة الرئيسية"
            );

        }
    );

}


// ======================================================
// 6 - قراءة النصوص OCR
// ======================================================

const captureOcrBtn =
    document.getElementById(
        "captureOcrBtn"
    );

const ocrCameraInput =
    document.getElementById(
        "ocrCameraInput"
    );


if (
    captureOcrBtn &&
    ocrCameraInput
) {

    captureOcrBtn.addEventListener(
        "click",
        function () {

            speak(
                "جاري فتح الكاميرا. وجه الهاتف نحو الورقة واجعل النص واضحاً."
            );


            setTimeout(
                function () {

                    ocrCameraInput.click();

                },
                500
            );

        }
    );


    ocrCameraInput.addEventListener(
        "change",
        async function (event) {

            const file =
                event.target.files[0];


            if (!file) {

                speak(
                    "لم يتم اختيار صورة."
                );

                return;

            }


            speak(
                "تم التقاط الصورة. جاري قراءة النص العربي. انتظر قليلاً."
            );


            try {

                if (
                    typeof Tesseract ===
                    "undefined"
                ) {

                    speak(
                        "محرك قراءة النصوص غير محمل. تأكد من إضافة مكتبة Tesseract في ملف التطبيق."
                    );

                    return;

                }


                const result =
                    await Tesseract.recognize(
                        file,
                        "ara",
                        {

                            logger:
                                function (info) {

                                    if (
                                        info.status ===
                                        "recognizing text"
                                    ) {

                                        const progress =
                                            Math.round(
                                                (info.progress || 0) *
                                                100
                                            );


                                        if (
                                            progress >= 20 &&
                                            progress < 40
                                        ) {

                                            speak(
                                                "جاري تحليل النص."
                                            );

                                        }


                                        if (
                                            progress >= 60 &&
                                            progress < 80
                                        ) {

                                            speak(
                                                "جاري استخراج الكلمات."
                                            );

                                        }

                                    }

                                }

                        }
                    );


                let extractedText =
                    result &&
                    result.data &&
                    result.data.text
                        ? result.data.text
                        : "";


                extractedText =
                    extractedText
                        .replace(/\s+/g, " ")
                        .trim();


                if (
                    extractedText.length >
                    2
                ) {

                    speak(
                        "النص المكتوب هو: " +
                        extractedText
                    );

                } else {

                    speak(
                        "لم أتمكن من قراءة النص بوضوح. حاول تحسين الإضاءة وتصوير الورقة كاملة."
                    );

                }

            } catch (error) {

                console.error(
                    "OCR ERROR:",
                    error
                );


                speak(
                    "حدث خطأ أثناء قراءة النص. حاول تصوير الورقة مرة أخرى بإضاءة جيدة."
                );

            }


            ocrCameraInput.value =
                "";

        }
    );

}


// ======================================================
// 7 - التعرف على الأشياء COCO SSD
// ======================================================

const captureObjectBtn =
    document.getElementById(
        "captureObjectBtn"
    );

const objectCameraInput =
    document.getElementById(
        "objectCameraInput"
    );


let objectModel = null;

let objectModelLoading =
    false;


// ------------------------------------------------------
// تحميل نموذج التعرف
// ------------------------------------------------------

async function loadObjectModel() {

    if (objectModel) {

        return objectModel;

    }


    if (
        typeof cocoSsd ===
        "undefined"
    ) {

        throw new Error(
            "COCO SSD library not loaded"
        );

    }


    if (objectModelLoading) {

        while (
            objectModelLoading
        ) {

            await new Promise(
                function (resolve) {

                    setTimeout(
                        resolve,
                        300
                    );

                }
            );

        }


        return objectModel;

    }


    objectModelLoading =
        true;


    try {

        speak(
            "جاري تشغيل محرك التعرف على الأشياء لأول مرة. انتظر قليلاً."
        );


        objectModel =
            await cocoSsd.load();


        objectModelLoading =
            false;


        speak(
            "تم تشغيل محرك التعرف على الأشياء."
        );


        return objectModel;

    } catch (error) {

        objectModelLoading =
            false;

        console.error(
            "MODEL ERROR:",
            error
        );

        throw error;

    }

}


// ------------------------------------------------------
// زر التعرف
// ------------------------------------------------------

if (
    captureObjectBtn &&
    objectCameraInput
) {

    captureObjectBtn.addEventListener(
        "click",
        function () {

            speak(
                "جاري فتح الكاميرا. وجه الهاتف نحو الشيء الذي تريد التعرف عليه."
            );


            setTimeout(
                function () {

                    objectCameraInput.click();

                },
                500
            );

        }
    );


    objectCameraInput.addEventListener(
        "change",
        async function (event) {

            const file =
                event.target.files[0];


            if (!file) {

                speak(
                    "لم يتم اختيار صورة."
                );

                return;

            }


            speak(
                "تم التقاط الصورة. جاري تحليل الشيء بالذكاء الاصطناعي."
            );


            try {

                const model =
                    await loadObjectModel();


                const image =
                    new Image();


                image.onload =
                    async function () {

                        try {

                            const predictions =
                                await model.detect(
                                    image
                                );


                            console.log(
                                "Object predictions:",
                                predictions
                            );


                            if (
                                !predictions ||
                                predictions.length ===
                                0
                            ) {

                                speak(
                                    "لم أتمكن من التعرف على شيء واضح. حاول الاقتراب من الشيء وتحسين الإضاءة."
                                );

                                return;

                            }


                            predictions.sort(
                                function (a, b) {

                                    return (
                                        b.score -
                                        a.score
                                    );

                                }
                            );


                            const best =
                                predictions[0];


                            const confidence =
                                Math.round(
                                    best.score *
                                    100
                                );


                            const arabicName =
                                translateObjectName(
                                    best.class
                                );


                            if (
                                confidence >=
                                35
                            ) {

                                speak(
                                    "أمامك " +
                                    arabicName +
                                    ". نسبة الثقة حوالي " +
                                    confidence +
                                    " بالمائة."
                                );

                            } else {

                                speak(
                                    "يبدو أن الشيء الموجود أمامك هو " +
                                    arabicName +
                                    "، لكن درجة التعرف منخفضة."
                                );

                            }

                        } catch (error) {

                            console.error(
                                "DETECTION ERROR:",
                                error
                            );


                            speak(
                                "حدث خطأ أثناء تحليل الصورة. حاول التقاط صورة أخرى."
                            );

                        }

                    };


                image.onerror =
                    function () {

                        speak(
                            "تعذر فتح الصورة. حاول التقاط صورة جديدة."
                        );

                    };


                image.src =
                    URL.createObjectURL(
                        file
                    );


            } catch (error) {

                console.error(
                    "OBJECT ERROR:",
                    error
                );


                speak(
                    "تعذر تشغيل محرك التعرف على الأشياء. تأكد من اتصال الإنترنت."
                );

            }


            objectCameraInput.value =
                "";

        }
    );

}


// ======================================================
// 8 - التعرف على العملات
// ======================================================

const captureMoneyBtn =
    document.getElementById(
        "captureMoneyBtn"
    );

const moneyCameraInput =
    document.getElementById(
        "moneyCameraInput"
    );


if (
    captureMoneyBtn &&
    moneyCameraInput
) {

    captureMoneyBtn.addEventListener(
        "click",
        function () {

            speak(
                "جاري فتح الكاميرا. وجه الهاتف نحو الورقة النقدية."
            );


            setTimeout(
                function () {

                    moneyCameraInput.click();

                },
                500
            );

        }
    );


    moneyCameraInput.addEventListener(
        "change",
        function (event) {

            const file =
                event.target.files[0];


            if (!file) {

                return;

            }


            speak(
                "تم التقاط صورة العملة. جاري فحص الورقة."
            );


            const image =
                new Image();


            image.onload =
                function () {

                    speak(
                        "تم التقاط الورقة النقدية. تحديد فئة العملة المصرية بدقة يحتاج إلى نموذج متخصص. يرجى التأكد من قيمة الورقة قبل استخدامها."
                    );

                };


            image.onerror =
                function () {

                    speak(
                        "تعذر قراءة صورة العملة."
                    );

                };


            image.src =
                URL.createObjectURL(
                    file
                );


            moneyCameraInput.value =
                "";

        }
    );

}


// ======================================================
// 9 - المساعدة والطوارئ
// ======================================================

const callVolunteerBtn =
    document.getElementById(
        "callVolunteerBtn"
    );

const sendLocationBtn =
    document.getElementById(
        "sendLocationBtn"
    );


if (callVolunteerBtn) {

    callVolunteerBtn.addEventListener(
        "click",
        function () {

            speak(
                "جاري الاتصال بالمساعد المباشر الآن."
            );


            setTimeout(
                function () {

                    window.location.href =
                        "tel:122";

                },
                1200
            );

        }
    );

}


if (sendLocationBtn) {

    sendLocationBtn.addEventListener(
        "click",
        function () {

            speak(
                "جاري تحديد موقعك الجغرافي."
            );


            if (
                "geolocation" in
                navigator
            ) {

                navigator.geolocation.getCurrentPosition(

                    function (position) {

                        const lat =
                            position.coords.latitude
                                .toFixed(4);

                        const lon =
                            position.coords.longitude
                                .toFixed(4);


                        speak(
                            "تم تحديد موقعك بنجاح. خط العرض " +
                            lat +
                            " وخط الطول " +
                            lon
                        );

                    },

                    function () {

                        speak(
                            "لم نتمكن من الحصول على الموقع. يرجى السماح بالوصول إلى الموقع."
                        );

                    }

                );

            } else {

                speak(
                    "خدمة تحديد الموقع غير مدعومة على جهازك."
                );

            }

        }
    );

}


// ======================================================
// 10 - الملاحة والبوصلة
// ======================================================

const compassBtn =
    document.getElementById(
        "compassBtn"
    );

const whereAmIBtn =
    document.getElementById(
        "whereAmIBtn"
    );


if (compassBtn) {

    compassBtn.addEventListener(
        "click",
        function () {

            speak(
                "جاري تحديد اتجاهك الحالي. يرجى تثبيت الهاتف."
            );


            if (
                window.DeviceOrientationEvent
            ) {

                const handleOrientation =
                    function (event) {

                        let heading =
                            event.alpha;


                        if (
                            event.webkitCompassHeading !==
                            undefined
                        ) {

                            heading =
                                event.webkitCompassHeading;

                        }


                        if (
                            heading !==
                                null &&
                            heading !==
                                undefined
                        ) {

                            let direction =
                                "الشمال";


                            if (
                                heading > 45 &&
                                heading <= 135
                            ) {

                                direction =
                                    "الشرق";

                            } else if (
                                heading > 135 &&
                                heading <= 225
                            ) {

                                direction =
                                    "الجنوب";

                            } else if (
                                heading > 225 &&
                                heading <= 315
                            ) {

                                direction =
                                    "الغرب";

                            }


                            speak(
                                "أنت تتجه الآن نحو " +
                                direction
                            );

                        } else {

                            speak(
                                "تعذر تحديد اتجاه البوصلة على هذا الجهاز."
                            );

                        }


                        window.removeEventListener(
                            "deviceorientation",
                            handleOrientation
                        );

                    };


                window.addEventListener(
                    "deviceorientation",
                    handleOrientation,
                    {
                        once: true
                    }
                );

            } else {

                speak(
                    "مستشعر البوصلة غير مدعوم في هذا المتصفح."
                );

            }

        }
    );

}


if (whereAmIBtn) {

    whereAmIBtn.addEventListener(
        "click",
        function () {

            speak(
                "جاري استكشاف الموقع الحالي."
            );


            if (
                "geolocation" in
                navigator
            ) {

                navigator.geolocation.getCurrentPosition(

                    function (position) {

                        const lat =
                            position.coords.latitude
                                .toFixed(2);

                        const lon =
                            position.coords.longitude
                                .toFixed(2);


                        speak(
                            "أنت حالياً بالقرب من الإحداثيات. خط العرض " +
                            lat +
                            " وخط الطول " +
                            lon
                        );

                    },

                    function () {

                        speak(
                            "يرجى السماح بالحصول على إذن الموقع وتفعيل نظام تحديد المواقع."
                        );

                    }

                );

            } else {

                speak(
                    "خدمة الموقع الجغرافي غير مدعومة."
                );

            }

        }
    );

}


// ======================================================
// 11 - المكتبة الصوتية
// ======================================================

const playManualBtn =
    document.getElementById(
        "playManualBtn"
    );

const playTipsBtn =
    document.getElementById(
        "playTipsBtn"
    );

const stopAudioBtn =
    document.getElementById(
        "stopAudioBtn"
    );


if (playManualBtn) {

    playManualBtn.addEventListener(
        "click",
        function () {

            speak(
                "مرحباً بك في الدليل الصوتي التفاعلي لتطبيق بصير. يساعدك التطبيق على قراءة النصوص والتعرف على الأشياء والعملات واستخدام الاتجاهات والخدمات اليومية."
            );

        }
    );

}


if (playTipsBtn) {

    playTipsBtn.addEventListener(
        "click",
        function () {

            speak(
                "للحصول على أفضل دقة عند تصوير النصوص أو الأشياء، احرص على وجود إضاءة كافية وثبت الهاتف واجعل الشيء داخل الصورة بالكامل."
            );

        }
    );

}


if (stopAudioBtn) {

    stopAudioBtn.addEventListener(
        "click",
        function () {

            if (
                "speechSynthesis" in
                window
            ) {

                window.speechSynthesis.cancel();

            }


            if (statusBox) {

                statusBox.innerText =
                    "تم إيقاف الصوت بنجاح.";

            }

        }
    );

}


// ======================================================
// 12 - التعرف على الألوان
// ======================================================

const colorBtn =
    document.getElementById(
        "colorBtn"
    );

const colorCameraInput =
    document.getElementById(
        "colorCameraInput"
    );

const dateTimeBtn =
    document.getElementById(
        "dateTimeBtn"
    );


if (
    colorBtn &&
    colorCameraInput
) {

    colorBtn.addEventListener(
        "click",
        function () {

            speak(
                "وجه الكاميرا نحو العنصر للتعرف على لونه."
            );


            setTimeout(
                function () {

                    colorCameraInput.click();

                },
                500
            );

        }
    );


    colorCameraInput.addEventListener(
        "change",
        function (event) {

            const file =
                event.target.files[0];


            if (!file) {

                return;

            }


            speak(
                "تم التقاط الصورة. جاري تحليل اللون."
            );


            const img =
                new Image();


            img.onload =
                function () {

                    const canvas =
                        document.getElementById(
                            "colorCanvas"
                        );


                    if (!canvas) {

                        return;

                    }


                    const ctx =
                        canvas.getContext(
                            "2d"
                        );


                    canvas.width =
                        img.width;

                    canvas.height =
                        img.height;


                    ctx.drawImage(
                        img,
                        0,
                        0,
                        img.width,
                        img.height
                    );


                    const x =
                        Math.floor(
                            img.width / 2
                        );

                    const y =
                        Math.floor(
                            img.height / 2
                        );


                    const pixelData =
                        ctx.getImageData(
                            x,
                            y,
                            1,
                            1
                        ).data;


                    const r =
                        pixelData[0];

                    const g =
                        pixelData[1];

                    const b =
                        pixelData[2];


                    const colorName =
                        getColorName(
                            r,
                            g,
                            b
                        );


                    speak(
                        "اللون في منتصف الصورة هو: " +
                        colorName
                    );

                };


            img.onerror =
                function () {

                    speak(
                        "تعذر قراءة الصورة."
                    );

                };


            img.src =
                URL.createObjectURL(
                    file
                );


            colorCameraInput.value =
                "";

        }
    );

}


// ------------------------------------------------------
// تحديد اللون
// ------------------------------------------------------

function getColorName(
    r,
    g,
    b
) {

    if (
        r < 50 &&
        g < 50 &&
        b < 50
    ) {

        return "الأسود";

    }


    if (
        r > 200 &&
        g > 200 &&
        b > 200
    ) {

        return "الأبيض";

    }


    if (
        r > 150 &&
        g < 100 &&
        b < 100
    ) {

        return "الأحمر";

    }


    if (
        g > 150 &&
        r < 100 &&
        b < 100
    ) {

        return "الأخضر";

    }


    if (
        b > 150 &&
        r < 100 &&
        g < 100
    ) {

        return "الأزرق";

    }


    if (
        r > 180 &&
        g > 180 &&
        b < 100
    ) {

        return "الأصفر";

    }


    if (
        r > 180 &&
        g < 100 &&
        b > 180
    ) {

        return "الوردي أو البنفسجي";

    }


    if (
        r > 150 &&
        g > 100 &&
        b < 80
    ) {

        return "البرتقالي";

    }


    return "لون متدرج. يرجى تحسين الإضاءة.";

}


// ======================================================
// 13 - التاريخ والوقت
// ======================================================

if (dateTimeBtn) {

    dateTimeBtn.addEventListener(
        "click",
        function () {

            const now =
                new Date();


            const options = {

                weekday: "long",

                year: "numeric",

                month: "long",

                day: "numeric"

            };


            const dateStr =
                now.toLocaleDateString(
                    "ar-EG",
                    options
                );


            const timeStr =
                now.toLocaleTimeString(
                    "ar-EG"
                );


            speak(
                "اليوم هو " +
                dateStr +
                "، وال
