/** Shared product copy — Design System §06 tone of voice. */

export const copy = {
  idle: {
    hint: "Tap to record",
    tagline: "Speak. Transcribe. Build.",
    explainer:
      "Say what it does, who it's for, and why now. Fifteen seconds is plenty.",
  },
  auth: {
    tagline: "Speak. Transcribe. Build.",
    headline: "Sign in",
    lead: "Use your phone, Google, or GitHub to open your studio.",
    divider: "or",
    phone: {
      label: "Mobile number",
      placeholder: "98765 43210",
      countryAria: "Country code",
      send: "Send code",
      sending: "Sending…",
      resend: "Resend code",
      resendIn: (seconds: number) => `Resend in ${seconds}s`,
      otpHeadline: "Enter the code",
      otpLabel: "Verification code",
      otpHint: (phone: string) => `We texted a code to ${phone}.`,
      verify: "Verify and continue",
      verifying: "Verifying…",
      back: "Use a different number",
    },
    oauth: {
      google: "Redirecting to Google…",
      github: "Redirecting to GitHub…",
    },
    legalAgreeBefore: "I am 18 or older, and I agree to the ",
    legalTerms: "Terms of Service",
    legalAgreeMid: " and ",
    legalPrivacy: "Privacy Policy",
    legalRequired:
      "Confirm you are 18 or older and agree to the Terms and Privacy Policy to continue.",
  },
  onboarding: {
    headline: "Set up your profile",
    lead: "Add a name so your studio feels like yours. Photo is optional.",
    nameLabel: "Your name",
    namePlaceholder: "What should we call you?",
    photo: "Add a photo",
    photoChange: "Change photo",
    continue: "Continue to studio",
    saving: "Saving…",
    skip: "Skip for now",
    skipPhoto: "You can add a photo later in Settings.",
  },
  atlassianGate: {
    title: "Your idea builds in your workspace.",
    connect: "Connect Atlassian",
    notNow: "Not now",
    saved: "Your transcript is saved. Close this and it'll be waiting.",
    savedMobile: "Your transcript is saved — close this and it'll be waiting.",
    cardWaiting: "Waiting — connect Atlassian to build",
  },
  welcome: {
    titleRecord: "Say the idea out loud",
    titleNoCard: "No card. Just the idea.",
    bodyTeach:
      "Fifteen seconds is plenty. Eight artifacts come back while you keep working.",
    bodyFree: (n: number) =>
      `You have ${n} free ${n === 1 ? "idea" : "ideas"}. Record one — transcript, research, PRD, brand, and a board come back.`,
    bodyPaid: (n: number) =>
      `You have ${n} ${n === 1 ? "idea" : "ideas"} on your plan. Record one — eight artifacts come back.`,
    dismiss: "Got it",
    idleDesktop:
      "Say what it does, who it's for, and why now — 15 seconds is plenty. Eight artifacts come back while you keep working.",
  },
  handoff: {
    title: "Sending your idea…",
  },
  waitNotify: {
    promise: "Your idea is building — we'll notify you when it's ready.",
    ask: "About 6 min — want a ping when it's ready?",
    notify: "Notify me",
    watch: "Watch it build",
  },
  profilePrompt: {
    title: "What should we call you?",
    body: "Add a name so your studio feels like yours. Photo is optional.",
    save: "Save",
    linkLead: "Or link a second sign-in.",
  },
  success: {
    ideaReady: "Your idea is ready.",
    celebrationBody: "Eight artifacts, from what you said.",
    celebrationDismiss: "Got it",
  },
  pipeline: {
    addToProjectTitle: "Add to a project",
    addToProjectLead: "Keep this idea somewhere",
    newRecording: "New recording",
    viewResults: "View results",
    goToProjects: "Go to projects",
    tryAgain: "Try again",
    etaOverall: "About 6 min",
  },
  secondRun: {
    title: "That's one.",
    body: (n: number) =>
      n === 1
        ? "You have 1 idea left. Record another when you're ready."
        : `You have ${n} ideas left. Record another when you're ready.`,
    dismiss: "Got it",
  },
  playback: {
    eyebrow: "Review your recording",
    reRecord: "Re-record",
    confirm: "Confirm",
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
  runInProgress: {
    title: "An idea is already building",
    body: "Finish the one in progress before starting another. It usually only takes a few minutes.",
    goToPipeline: "Go to current pipeline",
    stay: "Not now",
  },
  outOfQuota: {
    title: "You've used your free idea",
    body: "Free access includes one idea. Paid plans are coming soon — you'll be able to keep building then.",
    dismiss: "Got it",
  },
  costHalt: {
    title: "Murmur's at capacity right now",
    body: "We've paused new free ideas for a little while to keep things running smoothly. Please try again later today.",
    dismiss: "Got it",
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
    linkedAccounts: "Linked accounts",
    linkedAccountsLead:
      "Link Google or GitHub for a second sign-in method and an email for receipts.",
    linkGoogle: "Link Google",
    linkGitHub: "Link GitHub",
    unlink: "Unlink",
    linked: "Linked",
    linkSuccess: (provider: string) =>
      `${provider} is linked. You can sign in with it next time.`,
    phoneLinked: "Phone",
    save: "Save changes",
    saved: "Saved",
    dataRetention: "Data & retention",
    dataRetentionBody:
      "Pipeline results are kept for one month, then removed after a short grace period. Re-run an idea to build them again.",
    privacyPolicy: "Privacy Policy",
    termsOfService: "Terms of Service",
    currentPlan: "Current plan",
    planFree: "Free",
    dangerZone: "Danger zone",
    deleteAccount: "Delete account",
    deleteAccountHint:
      "Deleting your account removes every recording, run, and artifact. This can't be undone.",
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
  postDelivery: {
    beat1: "Did this land?",
    yes: "Yes",
    notReally: "Not really",
    notNow: "Not now",
    beat2: "What are you going to build with this?",
    placeholder: "One line is enough",
    save: "Save",
    skip: "Skip",
    error: "Couldn't save that. Try again.",
  },
  friction: {
    question: "What almost stopped you from using Murmur?",
    placeholder: "One line is enough",
    save: "Save",
    notNow: "Not now",
    error: "Couldn't save that. Try again.",
  },
  feedback: {
    title: "Send feedback",
    body: "What worked, what didn't. This goes straight to the person building Murmur.",
    placeholder: "What worked / what didn't",
    emailLabel: "Email (optional — how we reach you back)",
    emailPlaceholder: "you@example.com",
    cancel: "Cancel",
    send: "Send",
    ratingGroupLabel: "How did it go?",
    ratings: {
      up: "Worked well",
      neutral: "Mixed",
      down: "Didn't work",
    },
    sentTitle: "Sent",
    sentBody: "This goes straight to the person building Murmur.",
    sentDismiss: "Got it",
    error: "Couldn't send that. Try again.",
  },
} as const;
