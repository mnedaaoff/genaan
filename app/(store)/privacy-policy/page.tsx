import { getCachedPublicSettings } from "../../lib/cache/public-data";

export const revalidate = 600;

export default async function PrivacyPolicyPage() {
  const settings = await getCachedPublicSettings(["privacy_policy"]);
  const content = settings.privacy_policy?.trim()
    || "Privacy Policy has not been set yet.";

  return (
    <div className="min-h-screen bg-[#f4f5f1] py-16 px-5">
      <div className="max-w-[800px] mx-auto bg-white p-8 md:p-12 rounded-3xl shadow-sm">
        <h1 className="text-3xl md:text-5xl font-heading font-black text-[#0d3a24] mb-8 text-center">
          Privacy Policy
        </h1>
        <div className="text-[#5f786c] leading-relaxed whitespace-pre-wrap">
          {content}
        </div>
      </div>
    </div>
  );
}
