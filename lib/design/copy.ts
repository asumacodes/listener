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
    ideaReady: "Your idea is ready!",
  },
  pipeline: {
    addToProjectTitle: "Add to a project",
    addToProjectLead: "Keep this idea somewhere",
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
  projects: {
    emptyTitle: "No projects yet",
    emptyLead: "Your ideas will gather here.",
    emptyHint: "Record one to begin.",
    recordCta: "Record an idea",
    newProject: "New project",
  },
  projectDetail: {
    noIdeasYet: "No ideas yet",
    emptyTitle: "No ideas in this project yet",
    emptyLead: "Record one and it'll land right here.",
    searchPlaceholder: "Search in this project…",
    noMatches: "No ideas match your search.",
  },
  ideaDetail: {
    expiredTitle: "These results expired",
    expiredBody:
      "Results are kept for one month, with a short grace period after that. Re-run this idea to build it again.",
    rerunCta: "Re-run this idea",
  },
  transcript: {
    eyebrow: "Transcript",
    title: "Did we hear you right?",
    empty: "We didn't catch enough to work with",
    reRecord: "Re-record instead",
    copied: "Copied",
    ctaHelper: "This turns your idea into a PRD, research, brand, and a board.",
    runPipeline: "Run Pipeline",
    reRecordCta: "Re-record",
  },
  submitting: {
    eyebrow: "Transcribing",
    title: "Transcribing your recording",
    subtitle: "Turning your voice into words.",
  },
  limitation: {
    noCompetitors: "Not enough market signal to map competitors for this idea.",
  },
  settings: {
    profile: "Profile",
    changePhoto: "Change photo",
    displayName: "Display name",
    email: "Email",
    emailHint: "Email can\u2019t be changed here.",
    save: "Save changes",
    saved: "Saved",
    dataRetention: "Data & retention",
    dataRetentionBody:
      "Pipeline results are kept for one month, then removed after a short grace period. Re-run an idea to build them again.",
    currentPlan: "Current plan",
    planFree: "Free",
    dangerZone: "Danger zone",
    deleteAccount: "Delete account",
    deleteAccountHint:
      "Permanently deletes your account, recordings, and results.",
    notifications: "Notifications",
    notificationsBody:
      "Listener can notify you when a pipeline run finishes or needs attention. Enable here anytime, or when you send a run.",
    notificationsEnable: "Enable notifications",
    notificationsRegister: "Register this device",
    notificationsOn: "On",
    notificationsUnsupported:
      "Push notifications aren\u2019t available in this browser.",
    notificationsIosNeedsInstall:
      "Add Listener to your Home Screen to enable notifications on iOS.",
    notificationsDenied:
      "Notifications are blocked for this site. Open your browser or system settings to allow them, then return here.",
    notificationsSubscribeFailed:
      "Permission granted, but we couldn\u2019t register this device.",
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
