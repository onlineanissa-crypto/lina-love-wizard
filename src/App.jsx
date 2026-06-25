import React, {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const loveConfig = {
  girlfriendName: "Nour",
  boyfriendName: "MY NAME",
  relationshipDate: "03/06/2026",
  mainQuestion: "Nour, do you love me? 🥺",
  subtitle: "Be honest... my heart is super sensitive 🥺💕",
  finalTitle: "Yay Nour! I knew you loved me! 😍",
  finalMessage:
    "Nour, you just made me the happiest person alive! 🥰 Thank you for being you. I’m so lucky to have you! 💕",
};

const STORAGE_KEY = "nour-love-wizard-v1";
const TOTAL_STAGES = 7;

function readSavedProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved || typeof saved !== "object") return { stage: 1, answers: {} };

    const answers = saved.answers && typeof saved.answers === "object" ? saved.answers : {};
    let firstIncomplete = 1;

    while (firstIncomplete <= 6 && answers[firstIncomplete] !== undefined) {
      firstIncomplete += 1;
    }

    return {
      answers,
      stage: Math.min(Math.max(Number(saved.stage) || firstIncomplete, 1), firstIncomplete),
    };
  } catch {
    return { stage: 1, answers: {} };
  }
}

function playSuccessSound() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;

  const context = new AudioContext();
  const gain = context.createGain();
  gain.connect(context.destination);
  gain.gain.setValueAtTime(0.0001, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.12, context.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.75);

  [523.25, 659.25, 783.99].forEach((frequency, index) => {
    const oscillator = context.createOscillator();
    const noteGain = context.createGain();
    const start = context.currentTime + index * 0.11;

    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    noteGain.gain.setValueAtTime(0.0001, start);
    noteGain.gain.exponentialRampToValueAtTime(0.7, start + 0.02);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.32);
    oscillator.connect(noteGain);
    noteGain.connect(gain);
    oscillator.start(start);
    oscillator.stop(start + 0.35);
  });

  window.setTimeout(() => context.close(), 1000);
}

export function ProgressStepper({ currentStage }) {
  return (
    <div className="progress-wrap" aria-label={`Step ${currentStage} of ${TOTAL_STAGES}`}>
      <div className="progress-copy">
        <span>{currentStage === 7 ? "Our happy ending" : `Little question ${currentStage} of 6`}</span>
        <span>{Math.round((currentStage / TOTAL_STAGES) * 100)}%</span>
      </div>
      <div className="stepper">
        <div
          className="stepper-fill"
          style={{ width: `${((currentStage - 1) / (TOTAL_STAGES - 1)) * 100}%` }}
        />
        {Array.from({ length: TOTAL_STAGES }, (_, index) => {
          const step = index + 1;
          const isActive = step === currentStage;
          const isComplete = step < currentStage;
          return (
            <span
              className={`step-dot ${isActive ? "active" : ""} ${isComplete ? "complete" : ""}`}
              key={step}
              aria-hidden="true"
            >
              {isComplete ? "✓" : step === 7 ? "♥" : step}
            </span>
          );
        })}
      </div>
    </div>
  );
}

export function KawaiiCat({ mood = "love" }) {
  const mouths = {
    love: "M76 82 Q90 94 104 82",
    curious: "M78 84 Q90 78 102 84",
    happy: "M76 80 Q90 98 104 80",
    cheeky: "M78 82 Q90 91 102 82",
  };

  return (
    <div className="cat-wrap" aria-hidden="true">
      <svg className="kawaii-cat" viewBox="0 0 180 150" role="img">
        <defs>
          <linearGradient id={`catBody-${mood}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fffdfd" />
            <stop offset="100%" stopColor="#ffe4ed" />
          </linearGradient>
        </defs>
        <path className="cat-tail" d="M133 112 Q169 102 153 74 Q143 57 132 72" />
        <path
          className="cat-body"
          fill={`url(#catBody-${mood})`}
          d="M48 64 L42 27 L70 44 Q90 35 110 44 L138 27 L132 65 Q143 78 139 99 Q135 126 115 136 L65 136 Q45 126 41 99 Q37 78 48 64Z"
        />
        <path className="cat-ear" d="M49 55 L47 37 L64 47Z" />
        <path className="cat-ear" d="M131 55 L133 37 L116 47Z" />
        <ellipse className="cat-eye" cx="68" cy="73" rx="5" ry="7" />
        <ellipse className="cat-eye" cx="112" cy="73" rx="5" ry="7" />
        <circle className="eye-shine" cx="70" cy="70" r="1.7" />
        <circle className="eye-shine" cx="114" cy="70" r="1.7" />
        <path className="cat-nose" d="M86 80 Q90 76 94 80 Q90 85 86 80Z" />
        <path className="cat-mouth" d={mouths[mood] || mouths.love} />
        <ellipse className="cat-blush" cx="57" cy="86" rx="9" ry="5" />
        <ellipse className="cat-blush" cx="123" cy="86" rx="9" ry="5" />
        <path className="cat-paw" d="M59 116 Q53 99 68 101 Q78 104 76 121" />
        <path className="cat-paw" d="M121 116 Q127 99 112 101 Q102 104 104 121" />
        {mood === "love" && (
          <g className="cat-heart">
            <path d="M90 116 C80 105 65 117 90 134 C115 117 100 105 90 116Z" />
          </g>
        )}
        {mood === "cheeky" && <path className="cat-wink" d="M104 73 Q112 67 120 73" />}
      </svg>
    </div>
  );
}

export function FloatingHearts({ burst = false }) {
  const hearts = useMemo(
    () =>
      Array.from({ length: burst ? 24 : 10 }, (_, index) => ({
        id: index,
        left: burst ? 50 : 3 + Math.random() * 94,
        delay: Math.random() * (burst ? 0.3 : 5),
        duration: burst ? 0.9 + Math.random() * 0.8 : 6 + Math.random() * 5,
        size: 13 + Math.random() * 20,
        x: burst ? -220 + Math.random() * 440 : -25 + Math.random() * 50,
        y: burst ? -100 - Math.random() * 280 : 0,
      })),
    [burst],
  );

  return (
    <div className={burst ? "heart-burst" : "floating-hearts"} aria-hidden="true">
      {hearts.map((heart) => (
        <span
          key={heart.id}
          style={{
            "--left": `${heart.left}%`,
            "--delay": `${heart.delay}s`,
            "--duration": `${heart.duration}s`,
            "--size": `${heart.size}px`,
            "--x": `${heart.x}px`,
            "--y": `${heart.y}px`,
          }}
        >
          {heart.id % 3 === 0 ? "💖" : heart.id % 3 === 1 ? "💕" : "💗"}
        </span>
      ))}
    </div>
  );
}

export function ConfettiEffect({ mini = false }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: mini ? 28 : 90 }, (_, index) => ({
        id: index,
        left: Math.random() * 100,
        delay: Math.random() * 0.65,
        duration: 1.8 + Math.random() * 2,
        rotation: Math.random() * 720 - 360,
        drift: Math.random() * 220 - 110,
        color: ["#ff4f87", "#ffb3c9", "#ffd166", "#9b5de5", "#ff85a8"][index % 5],
      })),
    [mini],
  );

  return (
    <div className={`confetti ${mini ? "mini" : ""}`} aria-hidden="true">
      {pieces.map((piece) => (
        <i
          key={piece.id}
          style={{
            "--left": `${piece.left}%`,
            "--delay": `${piece.delay}s`,
            "--duration": `${piece.duration}s`,
            "--rotation": `${piece.rotation}deg`,
            "--drift": `${piece.drift}px`,
            "--color": piece.color,
          }}
        />
      ))}
    </div>
  );
}

export function ToastMessage({ message, type = "success" }) {
  if (!message) return <div className="toast-placeholder" aria-hidden="true" />;
  return (
    <div className={`toast-message ${type}`} role="status" aria-live="polite">
      {type === "success" ? "💗" : "🙈"} {message}
    </div>
  );
}

export const AnswerButton = forwardRef(function AnswerButton(
  {
    children,
    selected = false,
    wrong = false,
    className = "",
    ...props
  },
  ref,
) {
  return (
    <button
      className={`answer-button ${selected ? "selected" : ""} ${wrong ? "wrong" : ""} ${className}`}
      ref={ref}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
});

export function StageLayout({
  stage,
  title,
  subtitle,
  mood,
  children,
  toast,
  toastType,
  onBack,
  effects,
  className = "",
}) {
  return (
    <section className={`stage-page ${className}`} aria-labelledby={`stage-title-${stage}`}>
      <div className="question-card">
        {onBack && (
          <button className="back-button" type="button" onClick={onBack} aria-label="Go back">
            ← Back
          </button>
        )}
        <div className="stage-badge">{stage === 7 ? "Our happy ending" : `Question ${stage}`}</div>
        <KawaiiCat mood={mood} />
        <h1 id={`stage-title-${stage}`}>{title}</h1>
        {subtitle && <p className="stage-subtitle">{subtitle}</p>}
        <div className="stage-content">{children}</div>
        <ToastMessage message={toast} type={toastType} />
        {effects}
      </div>
    </section>
  );
}

export function StageTransition({ transition, children }) {
  return <main className={`stage-transition ${transition}`}>{children}</main>;
}

export function StageOne({ complete, onBack }) {
  const zoneRef = useRef(null);
  const noRef = useRef(null);
  const [noPosition, setNoPosition] = useState(null);
  const [locked, setLocked] = useState(false);
  const [toast, setToast] = useState("");
  const [burst, setBurst] = useState(false);

  const moveNoButton = useCallback(() => {
    const zone = zoneRef.current;
    const button = noRef.current;
    if (!zone || !button) return;

    const width = zone.clientWidth;
    const height = zone.clientHeight;
    const x = Math.max(0, Math.random() * (width - button.offsetWidth));
    const y = Math.max(0, Math.random() * (height - button.offsetHeight));
    setNoPosition({ x, y });
  }, []);

  const handleApproach = (event) => {
    if (!noRef.current || event.pointerType === "touch") return;
    const box = noRef.current.getBoundingClientRect();
    const distance = Math.hypot(
      event.clientX - (box.left + box.width / 2),
      event.clientY - (box.top + box.height / 2),
    );
    if (distance < 90) moveNoButton();
  };

  const sayYes = () => {
    if (locked) return;
    setLocked(true);
    setToast("I knew it, Nour! 😍");
    setBurst(true);
    playSuccessSound();
    complete("Yes 😍");
  };

  return (
    <StageLayout
      stage={1}
      title={loveConfig.mainQuestion}
      subtitle={loveConfig.subtitle}
      mood="love"
      toast={toast}
      onBack={onBack}
      effects={burst && <FloatingHearts burst />}
    >
      <div className="stage-one-zone" ref={zoneRef} onPointerMove={handleApproach}>
        <AnswerButton className="yes-button" disabled={locked} selected={locked} onClick={sayYes}>
          Yes 😍
        </AnswerButton>
        <AnswerButton
          className="no-button"
          disabled={locked}
          ref={noRef}
          onMouseEnter={moveNoButton}
          onPointerDown={(event) => {
            event.preventDefault();
            moveNoButton();
          }}
          style={
            noPosition
              ? { position: "absolute", left: `${noPosition.x}px`, top: `${noPosition.y}px` }
              : undefined
          }
        >
          No 🙈
        </AnswerButton>
      </div>
    </StageLayout>
  );
}

export function StageTwo({ complete, onBack }) {
  const answers = ["Sleep 😴", "Think about you 💭", "Eat a lot 🍕"];
  const [selected, setSelected] = useState("");
  const [wrong, setWrong] = useState("");
  const [toast, setToast] = useState("");
  const [locked, setLocked] = useState(false);

  const choose = (answer) => {
    if (locked) return;
    setSelected(answer);

    if (answer === "Think about you 💭") {
      setLocked(true);
      setWrong("");
      setToast("Correct, Nour! You know me so well 🥰");
      playSuccessSound();
      complete(answer);
      return;
    }

    setWrong(answer);
    setToast(answer.startsWith("Sleep") ? "Close… but who do you think I dream about? 😌" : "Pizza is good, but you are better 😋");
    window.setTimeout(() => setWrong(""), 480);
  };

  return (
    <StageLayout
      stage={2}
      title="What is my favorite thing to do?"
      subtitle="Choose carefully, Nour ✨"
      mood="curious"
      toast={toast}
      toastType={wrong ? "hint" : "success"}
      onBack={onBack}
    >
      <div className="answer-grid">
        {answers.map((answer) => (
          <AnswerButton
            key={answer}
            disabled={locked}
            selected={locked && selected === answer}
            wrong={wrong === answer}
            onClick={() => choose(answer)}
          >
            {answer}
          </AnswerButton>
        ))}
      </div>
    </StageLayout>
  );
}

export function StageThree({ complete, onBack }) {
  const [selected, setSelected] = useState("");
  const [toast, setToast] = useState("");
  const [locked, setLocked] = useState(false);

  const choose = (answer) => {
    if (locked) return;
    setSelected(answer);

    if (answer.startsWith("Always")) {
      setLocked(true);
      setToast("That’s the answer I wanted, Nour 💕");
      playSuccessSound();
      complete(answer);
    } else {
      setToast("Hmm Nour... try again 😂");
      window.setTimeout(() => setSelected(""), 450);
    }
  };

  return (
    <StageLayout
      stage={3}
      title="When I’m in a bad mood, will you still stay? 🥺"
      subtitle="Even when I’m being a tiny bit dramatic?"
      mood="curious"
      toast={toast}
      toastType={selected.startsWith("Maybe") ? "hint" : "success"}
      onBack={onBack}
    >
      <div className="answer-grid two-columns">
        {["Always 💖", "Maybe... 🤔"].map((answer) => (
          <AnswerButton
            key={answer}
            disabled={locked}
            selected={locked && selected === answer}
            wrong={!locked && selected === answer}
            onClick={() => choose(answer)}
          >
            {answer}
          </AnswerButton>
        ))}
      </div>
    </StageLayout>
  );
}

export function LoveSlider({ value, onChange, disabled }) {
  const labels = ["A little bit", "Somewhat", "Very much", "To the moon & back 🚀"];
  const percent = (value / (labels.length - 1)) * 100;

  return (
    <div className="love-slider">
      <div className="slider-value">{labels[value]}</div>
      <input
        aria-label="How much do you love me?"
        disabled={disabled}
        max="3"
        min="0"
        onChange={(event) => onChange(Number(event.target.value))}
        style={{ "--slider-progress": `${percent}%` }}
        type="range"
        value={value}
      />
      <div className="slider-labels" aria-hidden="true">
        <span>A little</span>
        <span>Somewhat</span>
        <span>Very much</span>
        <span>Moon & back</span>
      </div>
    </div>
  );
}

export function StageFour({ complete, onBack }) {
  const [value, setValue] = useState(0);
  const [locked, setLocked] = useState(false);
  const [toast, setToast] = useState("Slide it all the way, Nour 💗");
  const [burst, setBurst] = useState(false);

  const changeValue = (nextValue) => {
    if (locked) return;
    setValue(nextValue);
    if (nextValue < 3) {
      setToast(["A shy start… keep going 😌", "Only somewhat? I know there’s more 👀", "So close! One more little push 💕"][nextValue]);
      return;
    }

    setLocked(true);
    setToast("Perfect answer, Nour! 😍");
    setBurst(true);
    playSuccessSound();
    complete("To the moon & back 🚀");
  };

  return (
    <StageLayout
      stage={4}
      title="How much do you love me, Nour? 💕"
      subtitle="There is definitely a correct end of this slider."
      mood="love"
      toast={toast}
      onBack={onBack}
      effects={burst && <FloatingHearts burst />}
    >
      <LoveSlider value={value} onChange={changeValue} disabled={locked} />
    </StageLayout>
  );
}

export function StageFive({ complete, onBack }) {
  const messages = {
    "My smile 😊": "Then I’ll save my biggest smiles just for you 😊",
    "My eyes 👀": "They only light up like that when I see you ✨",
    "My personality 😌": "You love all my beautiful chaos 😌",
    "Everything! 😍": "Everything? That is the sweetest answer! 😍",
  };
  const [selected, setSelected] = useState("");
  const [toast, setToast] = useState("");
  const [locked, setLocked] = useState(false);
  const [confetti, setConfetti] = useState(false);

  const choose = (answer) => {
    if (locked) return;
    setLocked(true);
    setSelected(answer);
    setToast(messages[answer]);
    setConfetti(answer.startsWith("Everything"));
    playSuccessSound();
    complete(answer);
  };

  return (
    <StageLayout
      stage={5}
      title="What do you love most about me? 💞"
      subtitle="No pressure… but one answer is extra adorable."
      mood="happy"
      toast={toast}
      onBack={onBack}
      effects={confetti && <ConfettiEffect mini />}
    >
      <div className="answer-grid two-columns">
        {Object.keys(messages).map((answer) => (
          <AnswerButton
            key={answer}
            disabled={locked}
            selected={selected === answer}
            onClick={() => choose(answer)}
          >
            {answer}
          </AnswerButton>
        ))}
      </div>
    </StageLayout>
  );
}

export function StageSix({ complete, onBack }) {
  const arenaRef = useRef(null);
  const buttonRef = useRef(null);
  const [attempts, setAttempts] = useState(0);
  const [position, setPosition] = useState(null);
  const [surrendered, setSurrendered] = useState(false);
  const [locked, setLocked] = useState(false);
  const [toast, setToast] = useState("Go on… try to catch it 😏");

  const escape = () => {
    if (surrendered || locked) return;
    const arena = arenaRef.current;
    const button = buttonRef.current;
    if (!arena || !button) return;

    const nextAttempts = attempts + 1;
    if (nextAttempts >= 5) {
      setAttempts(5);
      setSurrendered(true);
      setPosition(null);
      setToast("Fine, you win! Click the new answer 💗");
      return;
    }

    const maxX = Math.max(0, arena.clientWidth - button.offsetWidth);
    const maxY = Math.max(0, arena.clientHeight - button.offsetHeight);
    setAttempts(nextAttempts);
    setPosition({
      x: Math.random() * maxX,
      y: Math.random() * maxY,
    });
    setToast(`Almost! ${5 - nextAttempts} more ${5 - nextAttempts === 1 ? "try" : "tries"} 🙈`);
  };

  const finish = () => {
    if (!surrendered || locked) return;
    setLocked(true);
    setToast("I knew you couldn’t resist 😌💕");
    playSuccessSound();
    complete("Okay, I love you! ❤️");
  };

  return (
    <StageLayout
      stage={6}
      title="Click NO if you don’t love me... 😏"
      subtitle={`Escape attempts: ${attempts} / 5`}
      mood="cheeky"
      toast={toast}
      onBack={onBack}
    >
      <div className={`escape-arena ${surrendered ? "surrendered" : ""}`} ref={arenaRef}>
        <AnswerButton
          className={surrendered ? "love-surrender-button" : "escaping-no-button"}
          disabled={locked}
          ref={buttonRef}
          onClick={surrendered ? finish : escape}
          onMouseEnter={surrendered ? undefined : escape}
          onPointerDown={
            surrendered
              ? undefined
              : (event) => {
                  event.preventDefault();
                  escape();
                }
          }
          selected={locked}
          style={
            position && !surrendered
              ? { position: "absolute", left: `${position.x}px`, top: `${position.y}px` }
              : undefined
          }
        >
          {surrendered ? "Okay, I love you! ❤️" : "NO 🙈"}
        </AnswerButton>
      </div>
    </StageLayout>
  );
}

export function FinalStage({ onPlayAgain }) {
  const [toast, setToast] = useState("");
  const [hearts, setHearts] = useState(false);

  const react = (kind) => {
    setHearts(false);
    window.requestAnimationFrame(() => setHearts(true));
    setToast(kind === "kiss" ? "Mwah! Kiss received and returned 😘" : "The biggest, warmest hug is on its way 🤗");
    playSuccessSound();
  };

  return (
    <StageLayout
      stage={7}
      title={loveConfig.finalTitle}
      subtitle={loveConfig.finalMessage}
      mood="love"
      toast={toast}
      className="final-stage"
      effects={
        <>
          <ConfettiEffect />
          {hearts && <FloatingHearts burst />}
        </>
      }
    >
      <div className="final-actions">
        <AnswerButton onClick={() => react("kiss")}>Send me a kiss 😘</AnswerButton>
        <AnswerButton onClick={() => react("hug")}>Hug me 🤗</AnswerButton>
        <button className="play-again-button" type="button" onClick={onPlayAgain}>
          Play Again 🔄
        </button>
      </div>
      <p className="relationship-date">Our story began: {loveConfig.relationshipDate}</p>
    </StageLayout>
  );
}

export default function App() {
  const initialProgress = useMemo(readSavedProgress, []);
  const [currentStage, setCurrentStage] = useState(initialProgress.stage);
  const [answers, setAnswers] = useState(initialProgress.answers);
  const [transition, setTransition] = useState("enter");
  const navigationTimer = useRef(null);

  useEffect(
    () => () => {
      window.clearTimeout(navigationTimer.current);
    },
    [],
  );

  const persist = useCallback((stage, nextAnswers) => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        stage,
        answers: nextAnswers,
      }),
    );
  }, []);

  const changeStage = useCallback(
    (nextStage, nextAnswers = answers) => {
      setTransition("exit");
      navigationTimer.current = window.setTimeout(() => {
        setCurrentStage(nextStage);
        persist(nextStage, nextAnswers);
        setTransition("enter");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 320);
    },
    [answers, persist],
  );

  const completeStage = useCallback(
    (answer) => {
      const completedStage = currentStage;
      const nextAnswers = { ...answers, [completedStage]: answer };
      setAnswers(nextAnswers);
      persist(completedStage, nextAnswers);

      navigationTimer.current = window.setTimeout(() => {
        changeStage(Math.min(completedStage + 1, TOTAL_STAGES), nextAnswers);
      }, 800);
    },
    [answers, changeStage, currentStage, persist],
  );

  const goBack = useCallback(() => {
    if (transition === "exit" || currentStage <= 1 || currentStage === 7) return;
    window.clearTimeout(navigationTimer.current);
    changeStage(currentStage - 1);
  }, [changeStage, currentStage, transition]);

  const playAgain = () => {
    window.clearTimeout(navigationTimer.current);
    localStorage.removeItem(STORAGE_KEY);
    setAnswers({});
    changeStage(1, {});
  };

  const stageProps = {
    complete: completeStage,
    onBack: currentStage > 1 && currentStage < 7 ? goBack : undefined,
  };

  return (
    <div className="app-shell">
      <FloatingHearts />
      <header className="app-header">
        <div className="brand">For Nour <span>♥</span></div>
        <ProgressStepper currentStage={currentStage} />
      </header>

      <StageTransition transition={transition}>
        {currentStage === 1 && <StageOne {...stageProps} />}
        {currentStage === 2 && <StageTwo {...stageProps} />}
        {currentStage === 3 && <StageThree {...stageProps} />}
        {currentStage === 4 && <StageFour {...stageProps} />}
        {currentStage === 5 && <StageFive {...stageProps} />}
        {currentStage === 6 && <StageSix {...stageProps} />}
        {currentStage === 7 && <FinalStage onPlayAgain={playAgain} />}
      </StageTransition>
    </div>
  );
}
