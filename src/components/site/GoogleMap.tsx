/* Live Google Maps embed of the dealership (lazy-loaded, so it never
   slows the page down). */
export default function GoogleMap({ className = "" }: { className?: string }) {
  return (
    <div className={`overflow-hidden rounded-[18px] border border-line shadow-card ${className}`}>
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d53197.15491113414!2d73.1141458883789!3d33.55799608092564!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38dfecd462dbc3e1%3A0x7d797b2d51b73589!2sSuzuki%20Central%20Motors!5e0!3m2!1sen!2s!4v1783038316499!5m2!1sen!2s"
        className="block h-full w-full border-0"
        allowFullScreen
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
        title="Central Motors on Google Maps"
      />
    </div>
  );
}
