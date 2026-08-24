const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "20mb" }));
app.use(express.static(path.join(__dirname)));


// ======================================================
// BASER - Gemini Vision
// وصف المشاهد + قراءة النصوص
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

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({
                success: false,
                error: "مفتاح Gemini غير موجود"
            });
        }


        let instruction;


        // =========================
        // وصف المشهد
        // =========================

        if (task === "scene") {
// =========================
// وصف المشهد الحقيقي
// =========================

if (task === "scene") {

    instruction = `
أنت نظام رؤية حاسوبي لتطبيق "بصير" لمساعدة الأشخاص المكفوفين.

مهمتك تحليل الصورة المرفقة نفسها فقط ووصف ما يظهر فيها بالفعل.

قواعد صارمة جدًا:

1. لا تخترع أي شيء غير موجود في الصورة.
2. لا تفترض وجود غرفة أو شارع أو مكتب أو طاولة أو باب إلا إذا كان ظاهرًا بوضوح.
3. لا تعتمد على الاحتمالات أو المعرفة العامة.
4. لا تذكر أي شخص أو شيء أو حيوان إلا إذا كان ظاهرًا في الصورة.
5. إذا لم تستطع التأكد من عنصر، لا تذكره.
6. إذا كانت الصورة غير واضحة، قل بوضوح: "الصورة غير واضحة بما يكفي لوصف المشهد."
7. إذا لم يظهر مشهد واضح، لا تحاول تخمينه.
8. صف الصورة الحالية التي أرسلت إليك، وليس صورة متخيلة.
9. اجعل الوصف مختصرًا ومفيدًا للشخص الكفيف.
10. لا تستخدم عبارات مثل "ربما" أو "يبدو أنه" عندما لا يكون العنصر واضحًا.

ابدأ بذكر المشهد أو البيئة فقط إذا كانت واضحة فعلًا.

بعد ذلك اذكر أهم الأشياء الظاهرة فعلًا، والأشخاص إن وجدوا، ومواقعهم النسبية إذا كانت واضحة.

مثال:
"أمامك شارع. يوجد شخص على الجانب الأيمن وسيارة أمامه."

لكن لا تستخدم هذا المثال إلا إذا كانت الصورة فعلًا تحتوي على شارع وشخص وسيارة.

إذا كانت الصورة تحتوي على طاولة وكوب، قل:
"أمامك طاولة عليها كوب."

ولا تقل ذلك إذا لم تكن الطاولة والكوب موجودين.

تذكر:
الصورة هي المصدر الوحيد للمعلومات.
ممنوع اختلاق أي تفاصيل.
`;
}
            instruction = `
أنت مساعد بصري لتطبيق بصير المخصص للأشخاص المكفوفين.

حلل الصورة بالكامل ووصف المشهد باللغة العربية.

اذكر:
- المكان والبيئة.
- الأشخاص الموجودين.
- ماذا يفعل الأشخاص.
- الأشياء الموجودة.
- أماكن الأشياء بالنسبة لبعضها.
- الألوان المهمة.
- النصوص الظاهرة.
- أي تفاصيل مهمة تساعد الشخص الكفيف على فهم ما أمامه.

اجعل الوصف واضحًا وطبيعيًا ومفيدًا.
لا تخمن معلومات غير واضحة.
إذا كان شيء غير واضح قل: غير واضح.
`;


        // =========================
        // قراءة النص
        // =========================

        } else if (task === "text") {

            instruction = `
اقرأ جميع النصوص الموجودة في الصورة.

اكتب النص كما يظهر في الصورة.
إذا كان النص باللغة العربية فاقرأه بالعربية.
حافظ على ترتيب الأسطر قدر الإمكان.

لا تضف شرحًا أو تعليقًا.
إذا كانت كلمة غير واضحة اكتب:
[غير واضح]
`;

        } else {

            return res.status(400).json({
                success: false,
                error: "نوع الطلب غير معروف"
            });
        }


        // إزالة بداية Base64
        const base64Image =
            image.replace(/^data:image\/\w+;base64,/, "");


        // =========================
        // الاتصال بـ Gemini
        // =========================

        const response = await fetch(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" +
            process.env.GEMINI_API_KEY,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    contents: [
                        {
                            parts: [

                                {
                                    text: instruction
                                },

                                {
                                    inline_data: {
                                        mime_type: "image/jpeg",
                                        data: base64Image
                                    }
                                }

                            ]
                        }
                    ]
                })
            }
        );


        const data = await response.json();


        if (!response.ok) {

            console.error("Gemini Error:", data);

            return res.status(500).json({
                success: false,
                error: "حدث خطأ أثناء الاتصال بـ Gemini"
            });
        }


        // =========================
        // استخراج النتيجة
        // =========================

        const result =
            data?.candidates?.[0]?.content?.parts
                ?.map(part => part.text || "")
                .join("")
                .trim();


        if (!result) {

            return res.status(500).json({
                success: false,
                error: "لم يتم الحصول على نتيجة"
            });
        }


        res.json({
            success: true,
            result: result
        });


    } catch (error) {

        console.error("BASER AI ERROR:", error);

        res.status(500).json({
            success: false,
            error: "حدث خطأ أثناء تحليل الصورة"
        });
    }

});


// ======================================================
// تشغيل التطبيق
// ======================================================

app.get("/", (req, res) => {

    res.sendFile(
        path.join(__dirname, "index.html")
    );

});


app.listen(PORT, () => {

    console.log(
        `BASER server running on port ${PORT}`
    );

});
