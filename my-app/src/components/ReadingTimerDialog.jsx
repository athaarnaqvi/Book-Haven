import { useEffect, useMemo, useState } from "react";
import "../ReadingTimerDialog.css";

const ReadingTimerDialog = ({ onClose, curr_book }) => {
  const [duration, setDuration] = useState(0);
  const [pagesRead, setPagesRead] = useState("");
  const [timeLeft, setTimeLeft] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasTimeEnded, setHasTimeEnded] = useState(false);
  const [accumulatedTime, setAccumulatedTime] = useState(0);

  // triggers a page flip animation every 60 seconds of actual reading
  const [flipTick, setFlipTick] = useState(0);

  const readerId = sessionStorage.getItem("reader_id");
  const bookId = curr_book?.bookid;

  useEffect(() => {
    let timer;

    if (isRunning && timeLeft !== null && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft((prev) => prev - 1);
        setAccumulatedTime((prev) => prev + 1);
      }, 1000);
    } else if (timeLeft === 0 && !hasTimeEnded) {
      setHasTimeEnded(true);
      const audio = new Audio("/sounds/levelup.mp3");
      audio.play().catch(() => {});
      setIsRunning(false);
      setTimeout(() => alert("Time is up! 🎉"), 300);
    }

    return () => clearTimeout(timer);
  }, [isRunning, timeLeft, hasTimeEnded]);

  // flip page every minute while running
  useEffect(() => {
    if (!isRunning) return;
    if (accumulatedTime > 0 && accumulatedTime % 60 === 0) {
      setFlipTick((t) => t + 1);
    }
  }, [accumulatedTime, isRunning]);

  // Prevent scrolling when dialog is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = "auto");
  }, []);

  const startTimer = () => {
    if (timeLeft === null && Number(duration) > 0) {
      setAccumulatedTime(0);
      setTimeLeft(Number(duration) * 60);
      setHasTimeEnded(false);
      setFlipTick(0);
    }
    setIsRunning(true);
  };

  const stopTimer = () => setIsRunning(false);

  const saveReadingProgress = async () => {
    if (!bookId) return alert("Error: Book ID is missing.");
    if (!pagesRead || Number(pagesRead) <= 0) return alert("Please enter a valid number of pages.");

    const plannedDuration = Number(duration) * 60;
    const actualTime = accumulatedTime;

    setIsSaving(true);

    try {
      await fetch(`https://book-haven-or3q.onrender.com/book/${bookId}/update-pages`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pagesRead: Number(pagesRead) }),
      });

      const timerResponse = await fetch("https://book-haven-or3q.onrender.com/timer/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reader_id: readerId,
          bookId,
          duration: plannedDuration,
          real_time: actualTime,
          pages_read: Number(pagesRead),
        }),
      });

      const timerData = await timerResponse.json();

      if (timerResponse.ok) alert("Reading session saved successfully!");
      else alert(`Timer save failed: ${timerData.message}`);
    } catch (error) {
      console.error("Error saving session:", error);
      alert("Failed to save reading session. Please try again.");
    }

    setIsSaving(false);
    onClose();
  };

  const timeText = useMemo(() => {
    const mm = timeLeft !== null ? Math.floor(timeLeft / 60) : 0;
    const ss = timeLeft !== null ? String(timeLeft % 60).padStart(2, "0") : "00";
    return timeLeft !== null ? `${mm}:${ss}` : "00:00";
  }, [timeLeft]);

  return (
    <>
      <div className="dialog-overlay" onClick={onClose} />

      <div className="dialog-box cute" role="dialog" aria-modal="true">
        <button className="close-btn" onClick={onClose}>✖</button>

        <div className="cute-header">
          {/* Mascot */}
          <div
            className={`rt-mascot ${isRunning ? "running" : "idle"}`}
            data-flip={flipTick}
            aria-hidden="true"
          >
            {/* Inline SVG so it looks like a real "emoji reading" */}
            <svg className="rt-svg" viewBox="0 0 220 160">
              <defs>
                <clipPath id="rtBookClip">
  <path d="M52 92 L112 84 Q140 84 164 98 L164 140 Q140 128 112 128 L52 136Z" />
</clipPath>

                <radialGradient id="rtHead" cx="35%" cy="30%" r="70%">
                  <stop offset="0%" stopColor="#FFF2A8" />
                  <stop offset="55%" stopColor="#FFD34B" />
                  <stop offset="100%" stopColor="#FFB300" />
                </radialGradient>

                <linearGradient id="rtBookCover" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#ff3d3d" />
                  <stop offset="100%" stopColor="#b8002a" />
                </linearGradient>

                <linearGradient id="rtPages" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="100%" stopColor="#f3f3f3" />
                </linearGradient>
              </defs>

              {/* tiny sparkles */}
              <g className="rt-sparks">
                <circle className="rt-spark" cx="34" cy="24" r="4" />
                <circle className="rt-spark" cx="62" cy="16" r="3" />
                <circle className="rt-spark" cx="76" cy="34" r="3" />
              </g>

              {/* head */}
              <circle cx="86" cy="54" r="40" fill="url(#rtHead)" />
              <circle cx="72" cy="40" r="10" fill="rgba(255,255,255,0.35)" />

              {/* glasses */}
              <g className="rt-glasses">
                <rect x="54" y="46" width="30" height="22" rx="8" fill="rgba(0,0,0,0.07)" stroke="#111" strokeWidth="4" />
                <rect x="88" y="46" width="30" height="22" rx="8" fill="rgba(0,0,0,0.07)" stroke="#111" strokeWidth="4" />
                <rect x="84" y="54" width="8" height="6" rx="3" fill="#111" />
              </g>

              {/* eyes (whites) */}
              <g className="rt-eyes">
                <circle cx="69" cy="57" r="7" fill="#fff" />
                <circle cx="103" cy="57" r="7" fill="#fff" />

                {/* pupils (animated) */}
                <circle className="rt-pupil" cx="69" cy="57" r="3.2" fill="#111" />
                <circle className="rt-pupil" cx="103" cy="57" r="3.2" fill="#111" />

                {/* eyelids (for blink) */}
                <rect className="rt-lid" x="61" y="50" width="16" height="14" rx="7" fill="url(#rtHead)" />
                <rect className="rt-lid" x="95" y="50" width="16" height="14" rx="7" fill="url(#rtHead)" />
              </g>

              {/* small mouth */}
              <path d="M78 78 Q86 86 94 78" fill="none" stroke="#111" strokeWidth="4" strokeLinecap="round" className="rt-mouth" />

   

              {/* Book (red cover + pages) */}
<g className="rt-book">
  {/* cover */}
  <path
    d="M52 92 L112 84 Q140 84 164 98 L164 140 Q140 128 112 128 L52 136Z"
    fill="url(#rtBookCover)"
    stroke="rgba(0,0,0,0.18)"
    strokeWidth="2"
  />

  {/* EVERYTHING inside is clipped so pages can't leak outside */}
  <g clipPath="url(#rtBookClip)">
    {/* pages left */}
    <path
      d="M56 96 L110 88 Q112 88 112 128 Q112 132 108 132 L56 138Z"
      fill="url(#rtPages)"
      opacity="0.95"
    />

    {/* pages right */}
    <path
      d="M112 88 Q140 88 160 100 L160 136 Q140 126 112 126Z"
      fill="url(#rtPages)"
      opacity="0.92"
    />

    {/* center crease */}
    <path
      d="M112 88 L112 128"
      stroke="rgba(0,0,0,0.12)"
      strokeWidth="3"
      strokeLinecap="round"
    />

    {/* page flip overlay (animated every 60s) */}
    <path
      className="rt-pageflip"
      d="M112 88 Q140 88 160 100 L160 136 Q140 126 112 126Z"
      fill="rgba(255,255,255,0.92)"
    />

    {/* subtle inner shadow to give book depth */}
    <path
      d="M52 92 L112 84 Q140 84 164 98 L164 140 Q140 128 112 128 L52 136Z"
      fill="none"
      stroke="rgba(0,0,0,0.10)"
      strokeWidth="6"
      opacity="0.15"
    />
  </g>

  {/* tiny title lines on cover (outside clip so they stay crisp) */}
  <rect x="78" y="106" width="42" height="6" rx="3" fill="rgba(255,255,255,0.45)" />
  <rect x="78" y="116" width="28" height="6" rx="3" fill="rgba(255,255,255,0.35)" />
</g>


                         {/* hands */}
{/* hands (gripping the book edges like your reference image) */}
{/* hands (side grip like the reference image) */}
<g className="rt-hands">
  {/* LEFT HAND (grips left outer edge of book) */}
  <g transform="translate(0,0)">
    {/* palm */}
    <circle
      cx="48"
      cy="122"
      r="12"
      fill="#fff2d0"
      stroke="rgba(0,0,0,0.12)"
      strokeWidth="1.5"
    />
    {/* thumb overlapping cover */}
    <path
      d="M56 114
         Q62 116 62 122
         Q62 128 56 130
         Q54 122 56 114Z"
      fill="#ffe7c2"
      stroke="rgba(0,0,0,0.10)"
      strokeWidth="1.2"
    />
    {/* fingers (tiny bumps) */}
    <path
      d="M40 116 Q42 112 46 114
         M38 122 Q41 118 45 120
         M40 128 Q43 124 47 126"
      fill="none"
      stroke="rgba(0,0,0,0.10)"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </g>

  {/* RIGHT HAND (grips right outer edge of book) */}
  <g transform="translate(0,0)">
    {/* palm */}
    <circle
      cx="168"
      cy="122"
      r="12"
      fill="#fff2d0"
      stroke="rgba(0,0,0,0.12)"
      strokeWidth="1.5"
    />
    {/* thumb overlapping cover */}
    <path
      d="M160 114
         Q154 116 154 122
         Q154 128 160 130
         Q162 122 160 114Z"
      fill="#ffe7c2"
      stroke="rgba(0,0,0,0.10)"
      strokeWidth="1.2"
    />
    {/* fingers */}
    <path
      d="M176 116 Q174 112 170 114
         M178 122 Q175 118 171 120
         M176 128 Q173 124 169 126"
      fill="none"
      stroke="rgba(0,0,0,0.10)"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </g>
</g>


            </svg>
          </div>

          <div className="title-wrap">
            <h2>Log Reading Session</h2>
            <p>Track your reading time and progress</p>
          </div>
        </div>

        <div className="timer-section">
          <div className="timer-row">
            <strong>Reading Timer</strong>
            <span className={`timer-pill ${isRunning ? "on" : ""}`}>{timeText}</span>
          </div>

          <div className="timer-buttons">
            <button className="start-timer" onClick={startTimer} disabled={isRunning}>
              Start Timer
            </button>
            <button className="stop-timer" onClick={stopTimer} disabled={!isRunning}>
              Stop Timer
            </button>
          </div>
        </div>

        <div className="input-section">
          <label htmlFor="duration">Duration (min):</label>
          <input
            type="number"
            id="duration"
            name="duration"
            value={duration}
            onChange={(e) => {
              const newDuration = Number(e.target.value);
              if (newDuration >= 0) setDuration(newDuration);
              else alert("Duration must be greater than or equal 0.");
            }}
            disabled={isRunning}
          />

          <label htmlFor="pages-read">Pages Read:</label>
          <input
            type="number"
            id="pages-read"
            name="pages-read"
            value={pagesRead}
            onChange={(e) => {
              const newPages = Number(e.target.value);
              if (newPages < 0) return alert("Pages read cannot be negative.");
              if (newPages + curr_book.currently_read <= curr_book.total_pages) setPagesRead(newPages);
              else alert("Total pages read cannot exceed total pages of the book.");
            }}
          />
        </div>

        <button className="save-session" onClick={saveReadingProgress} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Session"}
        </button>
      </div>
    </>
  );
};

export default ReadingTimerDialog;
