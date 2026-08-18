// ======================================================
// بصير - خادم الذكاء الاصطناعي
// التعرف على الأشياء ووصف الصور باللغة العربية
// ======================================================

const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();

// السماح لتطبيق بصير بالاتصال بالخادم
app.use(cors());

// استقبال الصور بحجم مناسب
app.use(
    express.json({
        limit: "15mb"
    })
);

// ======================================================
// الاتصال بـ OpenAI
// ======================================================

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// ======================================================
// استقبال الصورة وتحليلها
// ======================================================

app.post(
    "/api/analyze-image",
    async (req, res) => {

        try {

            const image =
                req.body.image;

            // التأكد من وجود الصورة
            if (!image) {

                return res.status(400).json({
                    error: "لم يتم إرسال صورة"
                });

            }

            console.log(
                "تم استقبال صورة لتحليلها..."
            );

            // ==================================================
            // إرسال الصورة إلى الذكاء الاصطناعي
            // ==================================================

            const response =
                await client.responses.create({

                    model: "gpt-5",

                    input: [
                        {
                            role: "user",

                            content: [

                                {
                                    type: "input_text",

                                    text: `
أنت المساعد الذكي لتطبيق "بصير" المخصص للمكفوفين.

حلل الصورة التي أرسلها المستخدم بعناية.

اكتب وصفًا واضحًا باللغة العربية فقط.

ركز على:

- الأشياء الموجودة في الصورة.
- الأشخاص الموجودين في الصورة بشكل عام.
- السيارات ووسائل النقل.
- الأبواب والنوافذ.
- السلالم.
- الطاولات والكراسي.
- العوائق التي قد تكون أمام المستخدم.
- الألوان المهمة.
- اتجاه الأشياء إذا كان واضحًا.
- النصوص الظاهرة في الصورة إذا كان من الممكن قراءتها.
- أي شيء مهم يمكن أن يساعد شخصًا كفيفًا على فهم المكان.

إذا كان هناك شيء قريب من المستخدم أو قد يمثل عائقًا، اذكر ذلك بوضوح.

لا تحاول تحديد هوية الأشخاص.

لا تخترع معلومات غير واضحة.

اجعل الإجابة مختصرة ومباشرة ومناسبة لأن يتم قراءتها بصوت مرتفع.

مثال:

"أمامك طاولة خشبية، وفوقها هاتف أسود. يوجد كرسي على يمين الطاولة، وشخص يقف على يسارك."

أجب باللغة العربية فقط.
`
                                },

                                {
                                    type: "input_image",

                                    image_url: image
                                }

                            ]
                        }
                    ]

                });

            // ==================================================
            // استخراج نتيجة الذكاء الاصطناعي
            // ==================================================

            const description =
                response.output_text ||
                "لم أستطع التعرف على محتوى الصورة.";

            console.log(
                "تم تحليل الصورة بنجاح."
            );

            // إرسال الوصف إلى تطبيق بصير
            res.json({

                success: true,

                description:
                    description.trim()

            });


        } catch (error) {

            console.error(
                "حدث خطأ:",
                error
            );

            res.status(500).json({

                success: false,

                error:
                    "حدث خطأ أثناء تحليل الصورة."

            });

        }

    }
);

// ======================================================
// الصفحة الرئيسية للخادم
// ======================================================

app.get(
    "/",
    (req, res) => {

        res.send(
            "خادم الذكاء الاصطناعي لتطبيق بصير يعمل."
        );

    }
);

// ======================================================
// تشغيل الخادم
// ======================================================

const PORT =
    process.env.PORT || 3000;

app.listen(
    PORT,
    () => {

        console.log(
            `Absar AI Server running on port ${PORT}`
        );

    }
);
// ======================================================
// بصير - API الذكاء الاصطناعي لتحليل الصور
// ======================================================

app.post("/api/vision", async (req, res) => {
    try {
        const { image, task } = req.body;

        if (!image) {
            return res.status(400).json({
                success: false,
                error: "لم يتم إرسال صورة"
            });
        }

        if (!process.env.OPENAI_API_KEY) {
            return res.status(500).json({
                success: false,
                error: "مفتاح الذكاء الاصطناعي غير موجود"
            });
        }

        let instruction;

        if (task === "scene") {
            instruction = `
أنت مساعد بصري للمكفوفين.
صف الصورة بالكامل باللغة العربية بشكل واضح ومفيد.

اذكر:
- المكان والبيئة.
- الأشخاص وما يفعلونه.
- الأشياء الموجودة.
- أماكن الأشياء بالنسبة لبعضها.
- الألوان المهمة.
- النصوص الظاهرة.
- أي تفاصيل مهمة تساعد الشخص الكفيف على فهم المشهد.

لا تخمن المعلومات غير الواضحة.
اجعل الوصف طبيعيًا ومختصرًا نسبيًا.
`;
        } else {
            instruction = `
اقرأ جميع النصوص الظاهرة في الصورة باللغة العربية.
حافظ على ترتيب النص قدر الإمكان.
لا تضف شرحًا.
إذا كان جزء من النص غير واضح، اكتب [غير واضح].
`;
        }

        const response = await fetch(
            "https://api.openai.com/v1/responses",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization":
                        `Bearer ${process.env.OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    model: "gpt-4.1-mini",
                    input: [
                        {
                            role: "user",
                            content: [
                                {
                                    type: "input_text",
                                    text: instruction
                                },
                                {
                                    type: "input_image",
                                    image_url: image
                                }
                            ]
                        }
                    ]
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error(data);

            return res.status(500).json({
                success: false,
                error: "فشل تحليل الصورة"
            });
        }

        const result = data.output_text || "";

        res.json({
            success: true,
            result: result
        });

    } catch (error) {

        console.error("Vision Error:", error);

        res.status(500).json({
            success: false,
            error: "حدث خطأ في خادم بصير"
        });
    }
});
