"use client";

import { Modal } from "./Modal";

export function TermsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Terms & Conditions" size="lg">
      <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-5 text-sm text-[#5f786c] leading-7">
        <p><strong className="text-[#0d3a24]">1. Acceptance of Terms</strong><br />
        By accessing or using the Genaan platform, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use our services.</p>

        <p><strong className="text-[#0d3a24]">2. Account Registration</strong><br />
        You must be at least 18 years old to create an account. You are responsible for maintaining the confidentiality of your login credentials and for all activities conducted under your account.</p>

        <p><strong className="text-[#0d3a24]">3. Products & Purchases</strong><br />
        All product descriptions, prices, and availability are subject to change without notice. We reserve the right to refuse or cancel any order for any reason, including but not limited to product availability, errors in pricing, or suspected fraudulent activity.</p>

        <p><strong className="text-[#0d3a24]">4. Shipping & Delivery</strong><br />
        Delivery times are estimates and not guaranteed. Genaan is not responsible for delays caused by third-party carriers, customs clearance, or force majeure events.</p>

        <p><strong className="text-[#0d3a24]">5. Returns & Refunds</strong><br />
        Living plants are perishable. We accept returns within 14 days for non-perishable accessories and pots. For plants, please contact us within 48 hours of delivery with photographic evidence of any damage.</p>

        <p><strong className="text-[#0d3a24]">6. Privacy</strong><br />
        Your personal information is handled in accordance with our Privacy Policy. We use industry-standard encryption to protect your data and do not sell your information to third parties.</p>

        <p><strong className="text-[#0d3a24]">7. Intellectual Property</strong><br />
        All content on the Genaan platform, including logos, photographs, and text, is the intellectual property of Genaan or its licensors. You may not reproduce or distribute any content without written permission.</p>

        <p><strong className="text-[#0d3a24]">8. Limitation of Liability</strong><br />
        To the maximum extent permitted by law, Genaan shall not be liable for any indirect, incidental, or consequential damages arising from your use of our platform or products.</p>

        <p><strong className="text-[#0d3a24]">9. Changes to Terms</strong><br />
        We reserve the right to update these terms at any time. Continued use of the platform after changes constitutes acceptance of the new terms.</p>

        <p><strong className="text-[#0d3a24]">10. Contact</strong><br />
        For questions about these terms, please contact us at <a href="mailto:hello@genaan.com" className="text-[#17583a] underline">hello@genaan.com</a>.</p>
      </div>
      <div className="mt-6 flex justify-end">
        <button
          onClick={onClose}
          className="px-6 py-2.5 bg-[#17583a] text-white text-sm font-semibold rounded-lg hover:bg-[#195b36] transition-colors"
        >
          I understand
        </button>
      </div>
    </Modal>
  );
}
