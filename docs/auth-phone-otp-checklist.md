# Phone OTP setup checklist (Supabase + Twilio)

Manual dashboard work for Listener phone login. Apply **dev (`murmur`) first**; **prod (`murmur-prod`) only when authorized**.

App code expects Phone Auth + Twilio. CAPTCHA is optional in code until `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is set; enable CAPTCHA in the dashboard **before** production SMS traffic.

## 1. Enable Phone provider

1. Supabase Dashboard → **Authentication** → **Providers** → **Phone**.
2. Enable Phone provider.
3. Do **not** enable Advanced MFA Phone unless you want phone-as-2FA (separate ~$75/mo add-on).

## 2. Twilio (SMS)

1. Create a Twilio account, Messaging Service (or Verify service if using Twilio Verify).
2. In Supabase Phone provider settings, set:
   - Twilio Account SID
   - Auth Token
   - Messaging Service SID (or Verify Service SID for Twilio Verify)
3. Send a test OTP to a real handset from the dashboard/test flow if available.

## 3. Rate limits / OTP expiry

Defaults are typically 60s between sends and ~1h OTP expiry. For production:

- Keep or tighten max frequency between SMS to the same number.
- Confirm OTP length (6) matches the UI.

## 4. CAPTCHA (keep both switches matched)

CAPTCHA is **all-or-nothing**. Mismatch breaks phone OTP:

| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Supabase CAPTCHA     | Result                                                                             |
| -------------------------------- | -------------------- | ---------------------------------------------------------------------------------- |
| unset                            | off                  | Works, no widget                                                                   |
| set                              | on (matching secret) | Works, widget + token                                                              |
| unset                            | **on**               | **Fails:** `no captcha_token found` (widget hidden, Supabase still requires token) |
| set                              | off                  | Widget shows but token ignored                                                     |

**To unblock testing after enabling Turnstile in Supabase:**

1. Create a Cloudflare Turnstile widget; copy site key + secret.
2. Supabase → **Authentication** → **Bot and Abuse Protection** → enable CAPTCHA → provider **Turnstile** → paste **secret**.
3. In Listener env (Vercel + local):

   ```
   NEXT_PUBLIC_TURNSTILE_SITE_KEY=<turnstile_site_key>
   ```

4. Redeploy / restart so the login screen renders Turnstile and passes `captchaToken` on send OTP.

**Or** turn Supabase CAPTCHA **off** until you are ready to set the site key.

## 5. Region notes

- **India (TRAI DLT):** register SMS templates before sending to IN numbers.
- Confirm destination countries are allowed on the Twilio account.

## 6. Verify

- [ ] Dev: Phone provider on, Twilio credentials set
- [ ] Dev: OTP arrives; verify logs in; `user_entitlements` row exists (via `handle_new_user`)
- [ ] Dev: Google / GitHub OAuth still work
- [ ] Dev: CAPTCHA + rate limit block anonymous spam (after Turnstile wired)
- [ ] Prod: same steps only after explicit authorization
