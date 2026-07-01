/* ────────────────────────────────────────────────────────────────
   Feature icons, one consistent line-drawn icon per car feature,
   resolved from the feature's label by keyword. Used by the
   variant explorer and the key-features section so every model
   gets professional icons automatically.
   ──────────────────────────────────────────────────────────────── */

type P = { className?: string };

const Svg = ({ className, children }: P & { children: React.ReactNode }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" className={className}>
    {children}
  </svg>
);

const Steering = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8" />
    <circle cx="12" cy="12" r="2.4" />
    <path d="M4.2 10.7c2.9-1.3 12.7-1.3 15.6 0M12 14.4V20M9.9 13.7l-4.3 4.2M14.1 13.7l4.3 4.2" />
  </Svg>
);

const Snowflake = (p: P) => (
  <Svg {...p}>
    <path d="M12 3v18M4.2 7.5l15.6 9M19.8 7.5l-15.6 9" />
    <path d="M10 4.6L12 3l2 1.6M10 19.4L12 21l2-1.6" />
  </Svg>
);

const Power = (p: P) => (
  <Svg {...p}>
    <path d="M12 3v8M8 5.6a7.6 7.6 0 1 0 8 0" />
  </Svg>
);

const Gauge = (p: P) => (
  <Svg {...p}>
    <path d="M3.8 16.5a8.5 8.5 0 1 1 16.4 0" />
    <path d="M12 16.5l4-4.8" />
    <circle cx="12" cy="16.5" r="1" />
    <path d="M12 7.5V9M6.6 9.7l1 1M17.4 9.7l-1 1" />
  </Svg>
);

const Camera = (p: P) => (
  <Svg {...p}>
    <path d="M4 8.5h3.2L9 6.2h6L16.8 8.5H20a1 1 0 0 1 1 1V17a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5a1 1 0 0 1 1-1z" />
    <circle cx="12" cy="13" r="3.2" />
  </Svg>
);

const Bolt = (p: P) => (
  <Svg {...p}>
    <path d="M13 2.5L5.5 13H11l-1 8.5L17.5 11H12l1-8.5z" />
  </Svg>
);

const Phone = (p: P) => (
  <Svg {...p}>
    <rect x="7.5" y="2.5" width="9" height="19" rx="2.2" />
    <path d="M10.8 18.5h2.4" />
    <path d="M10 6.5l1.6 2 2.4-3" />
  </Svg>
);

const Wheel = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8" />
    <circle cx="12" cy="12" r="2.6" />
    <path d="M12 4v5.4M20 12h-5.4M12 20v-5.4M4 12h5.4" />
  </Svg>
);

const Airbag = (p: P) => (
  <Svg {...p}>
    <circle cx="7.5" cy="5.8" r="1.9" />
    <path d="M5 20v-5a3 3 0 0 1 3-3h1.5" />
    <circle cx="15" cy="14.5" r="4.8" />
  </Svg>
);

const Brake = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="5.4" />
    <circle cx="12" cy="12" r="1" />
    <path d="M3.4 8.2a9.8 9.8 0 0 0 0 7.6M20.6 8.2a9.8 9.8 0 0 1 0 7.6" />
  </Svg>
);

const Hill = (p: P) => (
  <Svg {...p}>
    <path d="M3 18l6.5-10 3.8 5.6 2.2-3L21 18H3z" />
  </Svg>
);

const Key = (p: P) => (
  <Svg {...p}>
    <circle cx="7.5" cy="15.8" r="3.3" />
    <path d="M10 13.3l8.6-8.6M16.2 6.3l2.6 2.6M13.6 8.9l1.9 1.9" />
  </Svg>
);

const Radar = (p: P) => (
  <Svg {...p}>
    <circle cx="5.5" cy="12" r="1.6" />
    <path d="M10 6.6a8.2 8.2 0 0 1 0 10.8M13.6 3.6a12.8 12.8 0 0 1 0 16.8" />
  </Svg>
);

const Cog = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="5.2" />
    <circle cx="12" cy="12" r="1.7" />
    <path d="M12 4.4v2.4M17.4 6.6l-1.7 1.7M19.6 12h-2.4M17.4 17.4l-1.7-1.7M12 19.6v-2.4M6.6 17.4l1.7-1.7M4.4 12h2.4M6.6 6.6l1.7 1.7" />
  </Svg>
);

const Engine = (p: P) => (
  <Svg {...p}>
    <rect x="4" y="9" width="12.5" height="8.5" rx="1.5" />
    <path d="M8.5 9V6.5h4.5M16.5 12.5H20v3h-3.5M4 13H2.5" />
  </Svg>
);

const Window = (p: P) => (
  <Svg {...p}>
    <rect x="4" y="4.5" width="16" height="15" rx="2" />
    <path d="M4 10.5h16M12 13.5v3.5M10.4 15.5L12 17l1.6-1.5" />
  </Svg>
);

const Lock = (p: P) => (
  <Svg {...p}>
    <rect x="6" y="10.5" width="12" height="9" rx="2" />
    <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5M12 14v2.2" />
  </Svg>
);

const Light = (p: P) => (
  <Svg {...p}>
    <path d="M8.5 7C5.6 7 3 9.2 3 12s2.6 5 5.5 5c1.5 0 2.6-.5 3.5-1.3V8.3C11.1 7.5 10 7 8.5 7z" />
    <path d="M15 9h5M15 12h6M15 15h5" />
  </Svg>
);

const Shield = (p: P) => (
  <Svg {...p}>
    <path d="M12 3l7.5 3v5.2c0 4.6-3.2 7.7-7.5 9.3-4.3-1.6-7.5-4.7-7.5-9.3V6L12 3z" />
    <path d="M8.8 12l2.2 2.2 4.2-4.4" />
  </Svg>
);

const Wiper = (p: P) => (
  <Svg {...p}>
    <path d="M3.5 16.5a10.5 10.5 0 0 1 17 0" />
    <path d="M12 16.5l4.6-8" />
    <circle cx="12" cy="16.5" r="1" />
  </Svg>
);

const CheckCircle = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.2" />
    <path d="M8.6 12.2l2.3 2.3 4.5-4.7" />
  </Svg>
);

const Car = (p: P) => (
  <Svg {...p}>
    <path d="M4.5 13.5L6.3 9a2 2 0 0 1 1.9-1.3h7.6A2 2 0 0 1 17.7 9l1.8 4.5" />
    <path d="M3 13.5h18v4.2h-2.4M3 17.7h2.4M10 17.7h4" />
    <circle cx="7.7" cy="17.5" r="1.8" />
    <circle cx="16.3" cy="17.5" r="1.8" />
  </Svg>
);

export type IconEntry = {
  key: string;
  title: string;
  /** Ready-made feature names shown in the admin icon library. */
  examples: string[];
  match: RegExp;
  Icon: (p: P) => JSX.Element;
};

/** Ordered registry, first regex hit wins. Also powers the admin icon library. */
export const ICON_LIBRARY: IconEntry[] = [
  { key: "infotainment", title: "Infotainment", examples: ["Android Auto / Apple CarPlay", "Touchscreen Display", "Bluetooth Audio"], match: /carplay|android|infotainment|touch ?screen|display|bluetooth|usb|mp3|speaker/i, Icon: Phone },
  { key: "camera", title: "Camera", examples: ["Reversing Camera", "360 Camera"], match: /camera/i, Icon: Camera },
  { key: "cruise", title: "Cruise Control", examples: ["Cruise Control"], match: /cruise/i, Icon: Gauge },
  { key: "push-start", title: "Push Start", examples: ["Push Start"], match: /push start|start.?stop|ignition/i, Icon: Power },
  { key: "charging", title: "Charging", examples: ["Wireless Charger"], match: /wireless|charger|charging/i, Icon: Bolt },
  { key: "transmission", title: "Transmission", examples: ["Automatic Transmission", "6-Speed Manual"], match: /transmission|gearbox|\bautomatic\b|\bmanual\b|\b[456]\s?-?\s?speed/i, Icon: Cog },
  { key: "engine", title: "Engine", examples: ["1.5L Petrol Engine", "Hybrid System"], match: /engine|hybrid|k-?series|petrol|diesel|\bcc\b/i, Icon: Engine },
  { key: "steering", title: "Steering", examples: ["Power Steering"], match: /steering/i, Icon: Steering },
  { key: "climate", title: "Climate", examples: ["Air Conditioning", "Rear AC Vents", "Climate Control", "Rear Defogger"], match: /air ?cond|climate|a\/?c\b|vents?\b|heater|defogg?er/i, Icon: Snowflake },
  { key: "airbags", title: "Airbags", examples: ["6 Airbags", "Dual Airbags"], match: /airbag|air bag/i, Icon: Airbag },
  { key: "brakes", title: "Brakes", examples: ["ABS + EBD", "Disc Brakes"], match: /abs|ebd|brake/i, Icon: Brake },
  { key: "hill-hold", title: "Hill Hold", examples: ["Hill Hold Control"], match: /hill/i, Icon: Hill },
  { key: "keyless", title: "Keyless", examples: ["Keyless Entry", "Smart Key"], match: /keyless|smart key|\bkey\b|remote/i, Icon: Key },
  { key: "sensors", title: "Sensors", examples: ["Parking Sensors"], match: /sensor|radar/i, Icon: Radar },
  { key: "wheels", title: "Wheels", examples: ["Alloy Wheels"], match: /alloy|wheel|rim|tyre|tire/i, Icon: Wheel },
  { key: "windows", title: "Windows", examples: ["Power Windows"], match: /window/i, Icon: Window },
  { key: "locking", title: "Locking", examples: ["Central Locking", "Engine Immobilizer"], match: /lock|immobili/i, Icon: Lock },
  { key: "lighting", title: "Lighting", examples: ["LED DRLs", "Fog Lamps", "LED Headlamps"], match: /lamp|light|drl|fog|headl/i, Icon: Light },
  { key: "security", title: "Security", examples: ["Security Alarm"], match: /alarm|security/i, Icon: Shield },
  { key: "wipers", title: "Wipers", examples: ["Rear Wiper"], match: /wiper/i, Icon: Wiper },
  { key: "body-style", title: "Body & Style", examples: ["Two-Tone Roof", "Roof Rails", "Chrome Garnish"], match: /two-?tone|roof|spoiler|garnish|chrome|body/i, Icon: Car },
  { key: "general", title: "General", examples: ["ISOFIX Anchors", "Rear Armrest"], match: /$^/, Icon: CheckCircle },
];

/** Resolve a feature label to its icon component. */
export default function FeatureIcon({ label, className }: { label: string; className?: string }) {
  const hit = ICON_LIBRARY.find((m) => m.match.test(label));
  const Icon = hit?.Icon ?? CheckCircle;
  return <Icon className={className} />;
}
