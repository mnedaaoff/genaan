"use client";

import { useServerInsertedHTML } from "next/navigation";

const LANG_INIT_SCRIPT = `
  try {
    var l = localStorage.getItem('genaan_lang');
    if (l === 'ar') {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ar';
    }
  } catch(e) {}
`;

export default function LangScript() {
  useServerInsertedHTML(() => (
    <script dangerouslySetInnerHTML={{ __html: LANG_INIT_SCRIPT }} />
  ));

  return null;
}
