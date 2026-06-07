/** Shared product copy — Design System §06 tone of voice. */

export const copy = {
  idle: {
    hint: "Tap to record",
    tagline: "Speak. Transcribe. Build.",
  },
  auth: {
    tagline: "Speak. Transcribe. Build.",
    signIn: {
      headline: "Welcome back",
      cta: "Sign in",
      footerPrompt: "Don\u2019t have an account?",
      footerLink: "Sign up",
    },
    signUp: {
      headline: "Create your account",
      cta: "Create account",
      passwordHint: "At least 8 characters",
      footerPrompt: "Already have an account?",
      footerLink: "Sign in",
    },
    oauth: {
      google: "Redirecting to Google…",
      github: "Redirecting to GitHub…",
    },
    emailInvite: {
      headline: "Check your email.",
      bodyBefore: "We sent a confirmation link to",
      bodyAfter: "Tap it to finish setting up your account.",
      resend: "Resend",
      resending: "Sending…",
      resendPrompt: "Didn't get it?",
      back: "Back to sign in",
    },
    emailPlaceholder: "you@studio.co",
  },
  handoff: {
    title: "Sending your idea…",
  },
  success: {
    ideaReady: "Your idea is ready",
  },
  offline: {
    title: "You're offline",
    body: "Your recordings are safe. We'll pick back up the moment you're connected.",
    reconnectingTitle: "Reconnecting…",
    reconnectingBody: "Hang tight — we're picking the connection back up.",
  },
  mic: {
    title: "Microphone access needed",
    body: "Listener needs your microphone to record ideas. You can re-enable it in your browser or device settings.",
    tryAgain: "Try again",
    openSettings: "Open settings",
    dismiss: "Not now",
  },
  search: {
    placeholder: "Search ideas and recordings…",
    recent: "Recent",
    noMatches: "No matches",
    noRecordings: "No recordings yet.",
    searching: "Searching…",
  },
  transcript: {
    eyebrow: "Transcript",
    title: "Did we hear you right?",
    empty: "We didn't catch enough to work with",
    reRecord: "Re-record instead",
    copied: "Copied",
    ctaHelper: "This turns your idea into a PRD, research, brand, and a board.",
    runPipeline: "Run Pipeline →",
    reRecordCta: "Re-record",
  },
  limitation: {
    noCompetitors: "Not enough market signal to map competitors for this idea.",
  },
  stepper: {
    failed: "Something went wrong",
  },
  rehydration: {
    eyebrow: "Welcome back",
    title: "Finding where you were",
    subtitle: "Reconnecting your session — one moment.",
  },
} as const;
