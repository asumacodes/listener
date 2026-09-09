"use client";

import { IconLifeBuoy } from "@/components/icons/ListenerIcons";
import Button from "@/components/ui/Button";
import FieldLabel from "@/components/ui/FieldLabel";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { useProfile } from "@/hooks/useProfile";
import { copy } from "@/lib/design/copy";
import type { SupportCategory } from "@/lib/support/client";
import { useEffect, useRef, useState } from "react";

export type SupportStatus = "idle" | "submitting" | "done" | "error";

type SupportComposerBodyProps = {
  onSubmit?: (payload: {
    subject: string;
    category: SupportCategory;
    message: string;
    email: string;
  }) => void;
  status?: SupportStatus;
  onCancel: () => void;
  titleId: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SupportComposerBody = ({
  onSubmit,
  status = "idle",
  onCancel,
  titleId,
}: SupportComposerBodyProps) => {
  const profile = useProfile();
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState<SupportCategory>("question");
  const [message, setMessage] = useState("");
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
    subject.trim().length > 0 &&
    subject.length <= 150 &&
    message.trim().length > 0 &&
    message.length <= 4000 &&
    EMAIL_RE.test(email.trim()) &&
    !busy;

  if (status === "done") {
    return (
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-surface border border-border">
          <IconLifeBuoy size={22} className="text-text-secondary" />
        </div>
        <h2
          id={titleId}
          className="mt-4 font-serif text-2xl leading-tight text-text"
        >
          {copy.support.sentTitle}
        </h2>
        <p className="mt-1.5 text-sm text-text-secondary">
          {copy.support.sentBody}
        </p>
        <div className="mt-6 flex justify-center">
          <Button variant="primary" onClick={onCancel}>
            {copy.support.sentDismiss}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="text-left">
      <h2 id={titleId} className="font-serif text-2xl leading-tight text-text">
        {copy.support.title}
      </h2>
      <p className="mt-1.5 text-sm text-text-secondary">{copy.support.body}</p>

      <FieldLabel htmlFor="support-subject" className="mt-5">
        {copy.support.subjectLabel}
      </FieldLabel>
      <Input
        id="support-subject"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        disabled={submitting}
        maxLength={150}
        placeholder={copy.support.subjectPlaceholder}
        className="mt-1"
      />

      <FieldLabel htmlFor="support-category" className="mt-3">
        {copy.support.categoryLabel}
      </FieldLabel>
      <Select
        id="support-category"
        value={category}
        onChange={(e) => setCategory(e.target.value as SupportCategory)}
        disabled={submitting}
        className="mt-1"
      >
        {(Object.keys(copy.support.categories) as SupportCategory[]).map(
          (key) => (
            <option key={key} value={key}>
              {copy.support.categories[key]}
            </option>
          )
        )}
      </Select>

      <FieldLabel htmlFor="support-message" className="mt-3">
        {copy.support.messageLabel}
      </FieldLabel>
      <textarea
        id="support-message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        disabled={submitting}
        rows={4}
        maxLength={4000}
        placeholder={copy.support.messagePlaceholder}
        className="mt-1 w-full resize-none rounded-xl border border-border bg-surface px-3.5 py-3 font-sans text-[15px] text-text placeholder:text-muted transition focus:border-gold focus:outline-none focus:shadow-[0_0_0_2px_var(--gold-30)]"
      />

      <FieldLabel htmlFor="support-email" className="mt-3">
        {copy.support.emailLabel}
      </FieldLabel>
      <Input
        id="support-email"
        type="email"
        value={email}
        onChange={(e) => {
          touched.current = true;
          setEmail(e.target.value);
        }}
        disabled={submitting}
        placeholder={copy.support.emailPlaceholder}
        className="mt-1"
      />

      {status === "error" ? (
        <p role="alert" className="mt-4 text-sm text-red">
          {copy.support.error}
        </p>
      ) : null}

      <div className="mt-6 flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel} disabled={submitting}>
          {copy.support.cancel}
        </Button>
        <Button
          variant="primary"
          disabled={!canSubmit}
          onClick={() =>
            onSubmit?.({
              subject: subject.trim(),
              category,
              message: message.trim(),
              email: email.trim(),
            })
          }
        >
          {copy.support.send}
        </Button>
      </div>
    </div>
  );
};

export default SupportComposerBody;
