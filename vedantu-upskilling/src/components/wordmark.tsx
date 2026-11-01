/** Text-based placeholder wordmark. [TODO] swap for approved Vedantu brand assets. */
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 leading-none ${className}`}>
      <svg viewBox="0 0 28 28" className="size-6" aria-hidden>
        <rect width="28" height="28" rx="8" fill="#FF693D" />
        <path d="M7.5 9.5 14 20l6.5-10.5" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="text-[15px] font-semibold tracking-tight">
        Vedantu <span className="font-normal opacity-60">Upskilling</span>
      </span>
    </span>
  );
}
