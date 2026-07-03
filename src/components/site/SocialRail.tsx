import type { Settings } from "@/data";

/* ────────────────────────────────────────────────────────────────
   Floating social bar, pinned to the middle of the left edge on
   every public page. Pure links (server component), brand colour
   on hover/tap, compact on phones so it never crowds the content.
   ──────────────────────────────────────────────────────────────── */

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-[17px] w-[17px] sm:h-[18px] sm:w-[18px]">
    <path d="M13.5 21v-7h2.4l.4-3h-2.8V9.1c0-.9.3-1.5 1.6-1.5h1.3V4.9c-.3 0-1.1-.1-2-.1-2.1 0-3.5 1.3-3.5 3.6V11H8.5v3h2.4v7h2.6z" />
  </svg>
);
const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-[17px] w-[17px] sm:h-[18px] sm:w-[18px]">
    <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" /><circle cx="12" cy="12" r="4" /><circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
  </svg>
);
const YouTubeIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-[19px] w-[19px] sm:h-5 sm:w-5">
    <path d="M21.6 7.2a2.5 2.5 0 0 0-1.76-1.77C18.28 5 12 5 12 5s-6.28 0-7.84.43A2.5 2.5 0 0 0 2.4 7.2 26.2 26.2 0 0 0 2 12a26.2 26.2 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.76 1.77C5.72 19 12 19 12 19s6.28 0 7.84-.43a2.5 2.5 0 0 0 1.76-1.77A26.2 26.2 0 0 0 22 12a26.2 26.2 0 0 0-.4-4.8zM10 15.2V8.8L15.6 12 10 15.2z" />
  </svg>
);

export default function SocialRail({ settings }: { settings: Settings }) {
  const links = [
    { name: "Facebook", href: `https://${settings.facebook}`, hover: "hover:bg-[#1877F2] focus-visible:bg-[#1877F2]", Icon: FacebookIcon },
    { name: "Instagram", href: `https://${settings.instagram}`, hover: "hover:bg-[#E4405F] focus-visible:bg-[#E4405F]", Icon: InstagramIcon },
    { name: "YouTube", href: `https://${settings.youtube}`, hover: "hover:bg-[#FF0000] focus-visible:bg-[#FF0000]", Icon: YouTubeIcon },
  ];
  return (
    <nav
      aria-label="Follow us on social media"
      className="fixed left-0 top-1/2 z-[90] -translate-y-1/2"
    >
      <ul className="flex flex-col divide-y divide-line overflow-hidden rounded-r-xl border border-l-0 border-line bg-white/95 shadow-[4px_10px_28px_rgba(6,36,92,.16)] backdrop-blur">
        {links.map(({ name, href, hover, Icon }) => (
          <li key={name}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${name} (opens in a new tab)`}
              title={name}
              className={`grid h-10 w-10 place-items-center text-ink-soft outline-none transition-all duration-200 hover:w-12 hover:text-white focus-visible:text-white sm:h-11 sm:w-11 sm:hover:w-[52px] ${hover}`}
            >
              <Icon />
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
