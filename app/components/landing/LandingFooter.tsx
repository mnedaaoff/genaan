import type { FooterGroup } from "./types";

type LandingFooterProps = {
  groups: FooterGroup[];
};

export function LandingFooter({ groups }: LandingFooterProps) {
  return (
    <footer className="border-t border-[#d5ddd7] py-10">
      <div className="grid gap-8 md:grid-cols-4">
        <div>
          <h4 className="text-xl font-black">Genaan</h4>
          <p className="mt-3 text-sm text-[#5f786c]">
            A modern botanical storefront that can connect directly to your auth, products,
            inventory, orders, and community API modules.
          </p>
        </div>
        {groups.map((group) => (
          <div key={group.title}>
            <p className="text-sm font-semibold">{group.title}</p>
            <ul className="mt-3 space-y-2 text-sm text-[#5f786c]">
              {group.links.map((link) => (
                <li key={link}>{link}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </footer>
  );
}
