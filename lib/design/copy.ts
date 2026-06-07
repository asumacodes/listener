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
    subtitle: "Transcribing and saving securely.",
  },
  success: {
    ideaReady: "Your idea is ready",
  },
  offline: {
    title: "You're offline",
    body: "Listener needs a connection to record, transcribe, and save. Everything resumes when you're back online.",
    retry: "Try again",
  },
  mic: {
    title: "Microphone access needed",
    body: "Listener needs your mic to capture ideas. Allow access in Settings, then try again.",
  },
  limitation: {
    noCompetitors: "Not enough market signal to map competitors for this idea.",
  },
  stepper: {
    failed: "Something went wrong",
  },
  rehydration: {
    eyebrow: "Welcome back",
    title: "Picking up where you left off…",
    subtitle: "Finding your idea.",
  },
} as const;
