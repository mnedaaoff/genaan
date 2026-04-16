export default function LangScript() {
  // Inject inline script to set dir before first paint (prevents FOUC for RTL)
  const script = `
    try {
      var l = localStorage.getItem('genaan_lang');
      if (l === 'ar') {
        document.documentElement.dir = 'rtl';
        document.documentElement.lang = 'ar';
      }
    } catch(e) {}
  `;
  // eslint-disable-next-line react/no-danger
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
