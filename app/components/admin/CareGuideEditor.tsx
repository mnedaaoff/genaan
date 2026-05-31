"use client";

interface CareForm {
  watering_days: string;
  light_level: string;
  humidity_level: string;
  care_notes_en: string;
  care_notes_ar: string;
}

interface CareGuideEditorProps {
  form: CareForm;
  set: (key: string, value: string) => void;
  lang: "en" | "ar";
  cls: string;
  lbl: string;
}

export function CareGuideEditor({ form, set, lang, cls, lbl }: CareGuideEditorProps) {
  const isRTL = lang === "ar";

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#f0f2ee] p-5 space-y-4">
      <div>
        <p className={lbl}>{isRTL ? "دليل العناية" : "Care Guide"}</p>
        <p className="text-xs text-[#5f786c] mt-1">
          {isRTL
            ? "يظهر في تبويب «دليل العناية» في صفحة المنتج."
            : "Shown in the Care Guide tab on the product page."}
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <label className={lbl}>{isRTL ? "الري (كل كم يوم)" : "Water every (days)"}</label>
          <input
            type="number"
            min="1"
            value={form.watering_days}
            onChange={e => set("watering_days", e.target.value)}
            placeholder="7"
            className={cls}
          />
        </div>
        <div>
          <label className={lbl}>{isRTL ? "الإضاءة" : "Light"}</label>
          <select value={form.light_level} onChange={e => set("light_level", e.target.value)} className={cls}>
            <option value="">{isRTL ? "— اختر —" : "— Select —"}</option>
            <option value="low">{isRTL ? "منخفضة" : "Low"}</option>
            <option value="medium">{isRTL ? "متوسطة" : "Medium"}</option>
            <option value="bright">{isRTL ? "ساطعة" : "Bright"}</option>
            <option value="direct">{isRTL ? "شمس مباشرة" : "Direct sun"}</option>
          </select>
        </div>
        <div>
          <label className={lbl}>{isRTL ? "الرطوبة" : "Humidity"}</label>
          <select value={form.humidity_level} onChange={e => set("humidity_level", e.target.value)} className={cls}>
            <option value="">{isRTL ? "— اختر —" : "— Select —"}</option>
            <option value="low">{isRTL ? "منخفضة" : "Low"}</option>
            <option value="medium">{isRTL ? "متوسطة" : "Medium"}</option>
            <option value="high">{isRTL ? "عالية" : "High"}</option>
          </select>
        </div>
      </div>

      <div>
        <label className={lbl}>{isRTL ? "ملاحظات إضافية (إنجليزي)" : "Extra notes (English)"}</label>
        <textarea
          rows={3}
          dir="ltr"
          value={form.care_notes_en}
          onChange={e => set("care_notes_en", e.target.value)}
          placeholder="Tips for keeping this plant healthy..."
          className={`${cls} resize-none`}
        />
      </div>
      <div>
        <label className={lbl}>{isRTL ? "ملاحظات إضافية (عربي)" : "Extra notes (Arabic)"}</label>
        <textarea
          rows={3}
          dir="rtl"
          value={form.care_notes_ar}
          onChange={e => set("care_notes_ar", e.target.value)}
          placeholder="نصائح للعناية بالنبتة..."
          className={`${cls} resize-none`}
        />
      </div>
    </div>
  );
}

export function hasCareGuideData(form: CareForm): boolean {
  return !!(
    form.watering_days ||
    form.light_level ||
    form.humidity_level ||
    form.care_notes_en.trim() ||
    form.care_notes_ar.trim()
  );
}

export function careGuidePayload(form: CareForm) {
  return {
    watering_days: form.watering_days ? Number(form.watering_days) : null,
    light_level: form.light_level || null,
    humidity_level: form.humidity_level || null,
    care_notes_en: form.care_notes_en.trim() || null,
    care_notes_ar: form.care_notes_ar.trim() || null,
  };
}
