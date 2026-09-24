/** Shared product copy — Design System §06 tone of voice. */

export const copy = {
  /** Button busy labels — a verb, never a bare "…". */
  busy: {
    saving: "Saving…",
    linking: "Linking…",
    unlinking: "Unlinking…",
    deleting: "Deleting…",
  },
  /** Screen-reader labels for skeleton regions (SkeletonRegion). */
  loading: {
    plan: "Loading your plan",
    ideas: "Loading ideas",
    idea: "Loading idea",
    project: "Loading project",
    settings: "Loading settings",
    linkedAccounts: "Loading linked accounts",
  },
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
  checkout: {
    eyebrow: "Checkout",
    headline: (pack: string) => `You're choosing ${pack}`,
    body: "Continue to Dodo to complete payment. Ideas land in your studio once it clears.",
    continue: "Continue to checkout",
    topUp: "Top up",
    upgrade: "Upgrade",
    pickTier: "Choose a plan",
    foundingBanner:
      "The first 50 subscribers get double their tier's idea allowance for 12 months.",
    ideas: (n: number) => (n === 1 ? "1 idea / month" : `${n} ideas / month`),
    statement: "Dodo Payments will appear on your statement.",
    alreadyOn: (pack: string) => `You're already on ${pack}.`,
    unavailable: "Checkout isn't available right now. Try again later.",
    upgradeUnavailable:
      "Upgrade isn't available yet. You can still subscribe or top up.",
    upgradePending:
      "That upgrade payment is still open. Finish it, or wait for it to expire.",
    error: "Couldn't start checkout. Try again.",
    /** Busy label while the Dodo session is created and we redirect. */
    opening: "Opening checkout…",
    successEyebrow: "Checkout",
    successTitle: "Processing",
    successBody:
      "Your ideas will appear shortly. This can take a moment after payment.",
    successBodyUpgrade:
      "Your plan is updating. Ideas will appear shortly — this can take a moment.",
    successStudio: "Continue to studio",
    packs: {
      starter: "Starter",
      builder: "Builder",
      studio: "Studio",
      payg: "Pay as you go",
      founding: "Founding",
    },
  },
  plan: {
    title: "Plan & usage",
    breadcrumb: "Account /",
    billedBy: "Billing handled by Dodo Payments",
    currentPlan: "Current plan",
    usage: "Usage",
    free: "Free",
    freeIdeasLine: "1 idea, included once",
    freePlansFrom: (price: string) => `Plans start at ${price} a month.`,
    ideasLine: (n: number) =>
      n === 1 ? "1 idea a month" : `${n} ideas a month`,
    perMonth: "/ month",
    founding: "Founding",
    foundingBody:
      "The first 50 subscribers get double their tier's idea allowance for 12 months.",
    foundingUntil: (month: string) => `Yours runs until ${month}.`,
    foundingCompact: "First 50 · 2× ideas · 12 months",
    foundingUntilShort: (month: string) => `· until ${month}`,
    unavailable:
      "Your plan details aren't available right now. Try again in a moment.",
    choosePlan: "Choose a plan",
    upgrade: "Upgrade",
    topUp: "Top up",
    payAsYouGo: "Pay as you go",
    cancel: "Cancel plan",
    resume: "Resume plan",
    cancelKeeps: (date: string) => `· keeps your ideas until ${date}`,
    cancelScheduled: (date: string) =>
      `Cancellation scheduled — your plan ends ${date}. Your ideas stay until then; extra ideas stay after.`,
    monthlyAllowance: "Monthly allowance",
    freeAllowance: "Free allowance",
    monthlyAllowanceLower: "monthly allowance",
    freeAllowanceLower: "free allowance",
    allowanceLeft: (remaining: number, allowance: number, noun: string) =>
      `of ${allowance} ${noun} left`,
    resetsOn: (date: string) => `Resets ${date}. Unused ideas don't roll over.`,
    noReset: "Doesn't reset — a plan adds a monthly allowance.",
    allowanceMetaFree: "One idea to try Murmur.",
    allowanceMetaTier: (base: number, name: string) =>
      `${base} a month on ${name}`,
    allowanceMetaFounding: (base: number, allowance: number) =>
      `${base} a month, doubled to ${allowance} while founding`,
    extraIdeas: "Extra ideas",
    extraPurchased: (noun: string) => `purchased, ${noun} on hand`,
    extraNeverExpire: "Never expire",
    extraUsedAfter: (allowanceLower: string) =>
      `Used only after your ${allowanceLower} runs out.`,
    extraKept: "Kept through plan changes and cancellation.",
    rowSubFree: (remaining: number, noun: string) =>
      `Free · ${remaining} ${noun} left`,
    rowSubPaid: (name: string, remaining: number, noun: string, date: string) =>
      `${name} · ${remaining} ${noun} left · resets ${date}`,
    portalNote: "Manage receipts and payment method with Dodo Payments.",
    portalLink: "Open billing portal",
    portalNone: "The billing portal appears after your first payment.",
    portalError: "Couldn't open the billing portal. Try again.",
    portalOpening: "Opening billing portal…",
    choose: {
      eyebrow: "Choose a plan",
      heading: "How many ideas do you want to run each month?",
      lead: "Every tier is a monthly bucket of ideas — each one becomes a full foundation: transcript, competitor map, PRD, brand kit, engineering brief, Jira and Confluence. Unused ideas don't roll over; extra ideas you buy always do.",
      current: "Current",
      nextStep: "Next step",
      ideasUnit: "ideas / month",
      /** The founding-DOUBLED allowance, stated as its own monthly figure. */
      foundingLine: (n: number) => `${n} a month while founding`,
      perMo: "/ mo",
      chooseCta: (name: string) => `Choose ${name}`,
      upgradeCta: (name: string) => `Upgrade to ${name}`,
      locked: (current: string) => `Not available while you're on ${current}.`,
      blurb: {
        starter:
          "One or two side ideas a month. Enough to see what a full foundation looks like.",
        builder:
          "Shipping regularly. Room to explore three or four directions before committing.",
        studio:
          "A team or a prolific founder — an idea a day, every foundation ready by morning.",
      },
      footer:
        "Upgrade or cancel any time — cancelling takes effect at period end, and extra ideas you've bought stay yours.",
      footerShort: "Upgrade or cancel any time · extra ideas stay yours",
      back: "Plan & usage",
    },
    /** Founding-offer callout (design 03). Spots REMAINING, never claimed. */
    foundingOffer: {
      badge: "Founding offer",
      sentence:
        "The first 50 subscribers get double their tier's idea allowance for 12 months.",
      appliesTo: (list: string) =>
        `Applies to whichever tier you pick — ${list} ideas a month.`,
      openNow: "Open now",
      openLine: "Founding spots are open.",
      countTag: (left: number, cap: number) => `${left} of ${cap} left`,
      countLine: (left: number, cap: number) => `${left} of ${cap} spots left.`,
      lastTag: (left: number) => `Last ${left}`,
      full: "Founding spots are full — standard allowances apply",
    },
    topUpSheet: {
      title: "Top up ideas",
      lead: "Extra ideas never expire and are used only after your monthly allowance runs out.",
      idea: (n: number) => (n === 1 ? "1 idea" : `${n} ideas`),
      cta: "Continue to checkout",
    },
    paygSheet: {
      title: "Pay as you go",
      lead: "One idea, no plan. It never expires, and it's used only after your free allowance runs out.",
    },
    cancelSheet: {
      title: (name: string) => `Cancel ${name}?`,
      body: (date: string, extra: number, noun: string) =>
        `Keeps your ideas until ${date}. After that you're on Free. Your ${extra} extra ${noun} stay yours.`,
      bodyNoExtra: (date: string) =>
        `Keeps your ideas until ${date}. After that you're on Free.`,
      bodyNoDate: (extra: number, noun: string) =>
        `Keeps your ideas until the end of the current period. After that you're on Free. Your ${extra} extra ${noun} stay yours.`,
      bodyNoDateNoExtra:
        "Keeps your ideas until the end of the current period. After that you're on Free.",
      note: "You can resume any time before then and nothing changes.",
      confirm: "Cancel at period end",
      keep: "Keep my plan",
    },
    review: {
      title: "Review",
      subscribe: "Subscribe",
      upgrade: "Upgrade",
      ideasLine: (n: number, founding: number | null) =>
        founding
          ? `${n} ideas a month — ${founding} while founding`
          : `${n} ideas a month`,
      cadence: "per month",
      note1: "Ideas reset each month and don't roll over.",
      noteExtraUntouched: "Your extra ideas stay untouched.",
      noteCarryOver: (remaining: number, name: string, noun: string) =>
        `Your ${remaining} remaining ${name} ${noun} move to your extra ideas and stay yours.`,
      cta: "Continue to checkout",
      statement:
        "Dodo Payments will appear on your statement. Cancel any time — period-end, no fuss.",
      back: "Back",
    },
    /**
     * /checkout/return. Only `confirmed` may celebrate, and its plan copy comes
     * from the balance payload (welcomeView) — never from the return URL.
     */
    returned: {
      processing: "Updating your balance…",
      studio: "Continue to studio",
      planLink: "Plan & usage",
      support: "Contact support",
      receipt: (email: string) =>
        `Receipt from Dodo Payments is on its way to ${email}`,
      receiptNoEmail: "Your receipt from Dodo Payments is on its way.",
      confirming: {
        eyebrow: "Confirming",
        title: "Confirming your payment…",
        bodyPlan: (name: string) =>
          `Setting up your ${name} plan. This usually takes a few seconds.`,
        bodyPlanNoTier:
          "Setting up your plan. This usually takes a few seconds.",
        bodyTopup: "Adding your extra ideas. This usually takes a few seconds.",
      },
      topup: {
        eyebrow: "Topped up",
        title: (n: number) =>
          n === 1
            ? "1 idea added to your balance."
            : `${n} ideas added to your balance.`,
        body: "Your extra ideas never expire.",
      },
      failed: {
        eyebrow: "Not completed",
        title: "Your payment didn’t go through",
        body: "Nothing on your plan has changed. You can try again from Plan & usage.",
      },
      timeout: {
        eyebrow: "Still working",
        title: "We’re still confirming your payment",
        body: "This is taking longer than usual. If your payment went through, your ideas will show in Plan & usage within a few minutes. If you didn’t finish checkout, nothing has changed.",
      },
    },
    welcome: {
      arrivingEyebrow: "Arriving",
      arrivingTitle: (name: string) => `Setting up your ${name} ideas…`,
      // Arriving/slow render off the pending marker alone, so they must never
      // claim the payment went through — only that we're waiting on it.
      arrivingBody:
        "We’re confirming your payment. Your ideas land here once it clears — keep working meanwhile.",
      slowTitle: (name: string) => `Still confirming your ${name} payment`,
      slowBody:
        "Taking longer than usual. If your payment went through, your ideas will land here shortly. If you didn’t finish checkout, you can dismiss this.",
      planLink: "Plan & usage",
      supportLink: "Contact support",
      dismissArriving: "Dismiss",
      founding: {
        eyebrow: "Founding member",
        title: (name: string) =>
          `Welcome to ${name} — you're a founding member.`,
        body: (count: number, noun: string, base: number, reset: string) =>
          `You've got ${count} ${noun} this month, double the usual ${base}. That doubling is yours for 12 months. Resets ${reset}.`,
        bodyNoReset: (count: number, noun: string, base: number) =>
          `You've got ${count} ${noun} this month, double the usual ${base}. That doubling is yours for 12 months.`,
      },
      regular: {
        eyebrow: "Subscribed",
        title: (name: string, count: number, noun: string) =>
          `Welcome to ${name} — you've got ${count} ${noun} this month.`,
        body: (reset: string) =>
          `They reset on ${reset}. Extra ideas you buy never expire and are used only after these run out.`,
        bodyNoReset:
          "Extra ideas you buy never expire and are used only after these run out.",
      },
      upgraded: {
        eyebrow: "Upgraded",
        title: (name: string, count: number, noun: string) =>
          `You're on ${name} now — ${count} ${noun} this month.`,
        body: (prev: string, reset: string) =>
          `Anything left from ${prev} carried into this cycle. Resets ${reset}.`,
        bodyNoReset: (prev: string) =>
          `Anything left from ${prev} carried into this cycle.`,
      },
      record: "Record an idea",
      dismiss: "Got it",
    },
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
    emailLabel: "Email (optional)",
    emailHint: "So we can follow up on what you build.",
    emailPlaceholder: "you@example.com",
    emailInvalid:
      "That doesn't look like a valid email. Leave it blank to skip.",
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
    /**
     * Run handed off but no stage started (status "queued", or "running"
     * before the first stage_started). One run per user (ADR-037(d)) — there
     * is no queue or position, so never say "in line" or "position N".
     */
    starting: {
      eyebrow: "Getting started",
      /** Grid-card scale (desktop IdeaCard status line). */
      short: "Setting up",
      title: "Setting up your run",
      body: "Nothing has started yet — the first stage begins as soon as your run is picked up. You can leave this page and come back.",
    },
    /**
     * A stage failed. Retry resumes from the failed stage when the run is
     * resumable and otherwise starts a fresh run (IdeaDetailView.handleRetry,
     * useMurmurActions.resumePipeline). Whether a resumed run keeps earlier
     * results is Bridge-side, so the copy only claims what's true now.
     */
    failed: {
      pill: "Didn't finish",
      headline: (stageTitle: string) => `${stageTitle} stopped partway.`,
      beforeStart: "The run stopped before its first step.",
      intact: (list: string, count: number) =>
        `${list} finished — ${count === 1 ? "it's" : "they're"} below.`,
      retry:
        "Trying again picks up from this step when it can, or starts the run over if it can't.",
      secondary: "Part of the step that stopped — trying again covers it too.",
      generic: "We couldn't finish this step.",
      statusLabel: (stage: number) => `Stopped at stage ${stage}`,
      statusDetail: (done: number, total: number) =>
        `${done} of ${total} stages finished.`,
      beforeStartLabel: "Stopped before stage 1",
      beforeStartDetail: "No stages finished.",
      notAttempted: "Not attempted",
    },
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
  /** Transcription heard nothing — no idea saved, no pipeline offered. */
  noSpeech: {
    eyebrow: "Nothing heard",
    title: "We couldn’t hear anything",
    body: "Record again, closer to your mic.",
    recordAgain: "Record again",
    dismiss: "Not now",
    type: "Or type it instead",
    /** Grid/header badge for legacy rows saved before the fix. */
    badge: "Nothing was heard",
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
    checking: "Checking your plan",
    subscribeTitle: "You've used your free idea",
    subscribeBody:
      "Subscribe to keep building. Choose a plan to add ideas to your studio.",
    choosePlan: "Choose a plan",
    topupTitle: "You're out of ideas",
    topupBody: "Top up this month, or move up a plan.",
    topupStudioBody: "Top up this month to keep building.",
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
    /** Screen-reader labels for skeletons that stand in for real values. */
    loadingProfile: "Loading your profile",
    loadingIntegration: "Checking your Atlassian connection",
    atlassianCheckFailed:
      "We couldn\u2019t check your Atlassian connection just now.",
    retry: "Try again",
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
    plan: "Plan",
    planFree: "Free",
    planSubscribe: "Subscribe",
    planCancel: "Cancel plan",
    planResume: "Resume plan",
    planKeepsUntil: (date: string) => `Keeps your ideas until ${date}.`,
    planCancelsOn: (date: string) => `Cancels on ${date}`,
    planIdeasLeft: (n: number) => (n === 1 ? "1 idea left" : `${n} ideas left`),
    planResets: (date: string) => `resets ${date}`,
    planPurchased: (n: number) =>
      n === 1 ? "1 purchased idea" : `${n} purchased ideas`,
    planUnavailable: "Plan changes aren't available yet. Try again later.",
    planError: "Couldn't update your plan. Try again.",
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
  shipOutcome: {
    question: "What did you build?",
    placeholder: "One line is enough",
    urlLabel: "Live link (optional)",
    urlPlaceholder: "https://",
    continue: "Continue",
    back: "Back",
    consentQuestion: "Can we feature this on our site?",
    consentLead: "We'll only publish what you wrote here, with your name.",
    consentYes: "Yes",
    consentNo: "No",
    error: "Couldn't save that. Try again.",
    incomplete: "We couldn't record this right now. Try again later.",
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
  support: {
    title: "Contact support",
    body: "Something broken, or need a hand? Tell us what's going on and we'll get back to you.",
    subjectLabel: "Subject",
    subjectPlaceholder: "Short summary",
    categoryLabel: "Category",
    categories: {
      bug: "Bug",
      question: "Question",
      feature: "Feature request",
      other: "Other",
    },
    messageLabel: "Message",
    messagePlaceholder: "What's going on?",
    emailLabel: "Email (where we'll reply)",
    emailPlaceholder: "you@example.com",
    cancel: "Cancel",
    send: "Send",
    sentTitle: "Request received",
    sentBody:
      "We've got it and we're looking into it. Expect a reply within one business day.",
    sentDismiss: "Got it",
    error: "Couldn't send that. Try again.",
  },
} as const;
