نسخة Cloudflare Pages + D1 — اختبار الوحدة الأولى للصف الرابع

هذه النسخة مبنية على ملف HTML الأصلي الذي أرسلته، وتحتفظ بالتصميم والأسئلة والشرح والشهادة ولوحة المعلم. تم تغيير التخزين من localStorage إلى Cloudflare D1 وإضافة Functions لحفظ النتائج وقراءة السجل.
عدد الأسئلة: 40

ملفات الحزمة:
- index.html: الاختبار الأصلي بعد ربطه بالتخزين السحابي وإضافة بيانات مشاركة للرابط.
- functions/: وظائف Cloudflare Pages.
- schema.sql: جداول قاعدة بيانات D1.
- _routes.json: يحدد مسارات API التي تستخدم Functions.

خطوات النشر:
1. أنشئ Repository جديدًا وخاصًا على GitHub، مثل: quiz-grade4-unit1. لا تستخدم Repository اختبار الصف الخامس حتى لا تختلط المشاريع.
2. ارفع محتويات هذه الحزمة إلى جذر Repository: index.html وschema.sql و_routes.json ومجلد functions كاملًا. لا ترفع المجلد الخارجي كطبقة إضافية.
3. في Cloudflare افتح Workers & Pages > Create application > Pages > Connect to Git، ثم اختر Repository الجديد.
4. إعدادات Pages:
   - Production branch: main
   - Build command: exit 0 (إذا كانت الخانة إلزامية؛ وإلا اتركها فارغة)
   - Build output directory: .
   - استخدم Pages Git integration ولا تستخدم Deploy command الخاص بالـWorkers.
5. أنشئ قاعدة D1 جديدة خاصة بهذا الاختبار، مثل: arabic-grade4-unit1-db.
6. افتح D1 > القاعدة > Console، والصق محتوى schema.sql كاملًا، ثم Execute. للتحقق شغّل:
   SELECT name, type FROM sqlite_master WHERE type IN ('table','index') ORDER BY type, name;
   يجب أن تظهر results وsettings.
7. في مشروع Pages افتح Settings > Bindings > Add > D1 database:
   - Variable name: DB
   - Database: arabic-grade4-unit1-db
   ثم Save.
8. في Settings > Variables and Secrets أضف Secret باسم TEACHER_PASSWORD واجعل قيمته كلمة مرور لوحة المعلم التي تختارها.
9. أعد نشر المشروع (Redeploy) بعد إضافة الـBinding والـSecret.
10. افتح رابط pages.dev، جرّب اختبارًا تجريبيًا، وتأكد من ظهور رسالة «تم حفظ النتيجة في سجل المعلم بنجاح»، ثم افتح لوحة المعلم من جهاز آخر وتحقق من النتيجة.

ملاحظات:
- لا تضع كلمة مرور المعلم داخل HTML أو GitHub؛ أضفها فقط كـSecret في إعدادات Pages.
- هذا الاختبار يستخدم قاعدة D1 مستقلة عن اختبار الصف الخامس، حتى تبقى سجلات كل صف منفصلة.
- لوحة المعلم تتحدث تلقائيًا كل 15 ثانية ما دامت مفتوحة ومسجلًا الدخول.
- WhatsApp قد يحتفظ بمعاينة الرابط القديمة مؤقتًا؛ بعد النشر جرّب إرسال الرابط في محادثة جديدة أو أضف ?v=2 مؤقتًا للاختبار.
