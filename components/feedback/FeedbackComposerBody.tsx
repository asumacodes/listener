"use client";

import { IconCheck } from "@/components/icons/ListenerIcons";
import Button from "@/components/ui/Button";
import FieldLabel from "@/components/ui/FieldLabel";
import Input from "@/components/ui/Input";
import { useProfile } from "@/hooks/useProfile";
import { copy } from "@/lib/design/copy";
import { useEffect, useRef, useState } from "react";

export type FeedbackStatus = "idle" | "submitting" | "done" | "error";
export type FeedbackRating = "up" | "neutral" | "down";

type FeedbackComposerBodyProps = {
  onSubmit?: (payload: {
    rating: FeedbackRating;
    body: string;
    email: string | null;
  }) => void;
  status?: FeedbackStatus;
  onCancel: () => void;
  titleId: string;
};

const RATING_ORDER: { value: FeedbackRating; glyph: string }[] = [
  { value: "up", glyph: "👍" },
  { value: "neutral", glyph: "😐" },
  { value: "down", glyph: "👎" },
];

const FeedbackComposerBody = ({
  onSubmit,
  status = "idle",
  onCancel,
  titleId,
}: FeedbackComposerBodyProps) => {
  const profile = useProfile();
  const [rating, setRating] = useState<FeedbackRating | null>(null);
  const [body, setBody] = useState("");
  const [email, setEmail] = useState(profile?.email ?? "");
  const touched = useRef(false);

  useEffect(() => {
    if (!touched.current && profile?.email) {
      setEmail(profile.email);
    }
  }, [profile?.email]);

  const submitting = status === "submitting";
  const busy = submitting || status === "done";
  const canSubmit =
    rating !== null && body.trim().length > 0 && body.length <= 4000 && !busy;

  if (status === "done") {
    return (
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gold-10">
          <IconCheck size={22} className="text-gold-deep" />
        </div>
        <h2
          id={titleId}
          className="mt-4 font-serif text-2xl leading-tight text-text"
        >
          {copy.feedback.sentTitle}
        </h2>
        <p className="mt-1.5 text-sm text-text-secondary">
          {copy.feedback.sentBody}
        </p>
        <div className="mt-6 flex justify-center">
          <Button variant="primary" onClick={onCancel}>
            {copy.feedback.sentDismiss}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="text-left">
      <h2 id={titleId} className="font-serif text-2xl leading-tight text-text">
        {copy.feedback.title}
      </h2>
      <p className="mt-1.5 text-sm text-text-secondary">{copy.feedback.body}</p>
      <div
        role="radiogroup"
        aria-label={copy.feedback.ratingGroupLabel}
        className="mt-5 flex gap-2"
      >
        {RATING_ORDER.map((r) => {
          const selected = rating === r.value;
          return (
            <button
              key={r.value}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={copy.feedback.ratings[r.value]}
              disabled={submitting}
              onClick={() => setRating(r.value)}
              className={`flex flex-1 flex-col items-center gap-1 rounded-xl border px-2 py-3 text-2xl transition ${
                selected
                  ? "border-gold bg-gold-10"
                  : "border-border hover:border-text-secondary"
              }`}
            >
              <span aria-hidden>{r.glyph}</span>
              <span className="text-[11px] font-medium text-text-secondary">
                {copy.feedback.ratings[r.value]}
              </span>
            </button>
          );
        })}
      </div>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        disabled={submitting}
        rows={4}
        maxLength={4000}
        placeholder={copy.feedback.placeholder}
        className="mt-4 w-full resize-none rounded-xl border border-border bg-surface px-3.5 py-3 font-sans text-[15px] text-text placeholder:text-muted transition focus:border-gold focus:outline-none focus:shadow-[0_0_0_2px_var(--gold-30)]"
      />
      <FieldLabel htmlFor="feedback-email" className="mt-3">
        {copy.feedback.emailLabel}
      </FieldLabel>
      <Input
        id="feedback-email"
        type="email"
        value={email}
        onChange={(e) => {
          touched.current = true;
          setEmail(e.target.value);
        }}
        disabled={submitting}
        placeholder={copy.feedback.emailPlaceholder}
        className="mt-1"
      />
      {status === "error" ? (
        <p role="alert" className="mt-4 text-sm text-red">
          {copy.feedback.error}
        </p>
      ) : null}
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel} disabled={submitting}>
          {copy.feedback.cancel}
        </Button>
        <Button
          variant="primary"
          disabled={!canSubmit}
          onClick={() =>
            onSubmit?.({
              rating: rating!,
              body: body.trim(),
              email: email.trim() === "" ? null : email.trim(),
            })
          }
        >
          {copy.feedback.send}
        </Button>
      </div>
    </div>
  );
};

export default FeedbackComposerBody;
