import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Privacy Policy — eshu.earth",
  description:
    "A full and transparent account of how eshu.earth collects, processes, stores, and protects your personal data.",
}

const LAST_UPDATED = "31 May 2026"
const CONTACT_EMAIL = "contact@eshu.earth"

// ─── Types ────────────────────────────────────────────────────────────────────

type ProseSection = {
  type: "prose"
  title: string
  body: React.ReactNode
}

type ListSection = {
  type: "list"
  title: string
  items: { label: string; detail: React.ReactNode }[]
}

type TableSection = {
  type: "table"
  title: string
  cols: string[]
  rows: string[][]
}

type CalloutSection = {
  type: "callout"
  title: string
  body: React.ReactNode
}

type Section = ProseSection | ListSection | TableSection | CalloutSection

// ─── Content ──────────────────────────────────────────────────────────────────

const sections: Section[] = [
  // 1
  {
    type: "callout",
    title: "Plain-English Summary",
    body: (
      <>
        <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
          This is a personal portfolio site. When you use the AI chat, your{" "}
          <strong>IP address, question, and the AI's response</strong> are logged
          to Supabase and deleted after 30 days. Your IP is also used for
          rate-limiting via Upstash Redis, where it expires after 60 seconds.
          The AI's response is also converted to synthesised speech via OpenAI's
          TTS API and played through your browser —{" "}
          <strong>no audio is recorded from your device</strong>.
          Nothing is sold. No cookies. No ads. No trackers.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
          The full legal detail is below. If something isn't clear, email{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-indigo-500 underline underline-offset-2 hover:text-indigo-600"
          >
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </>
    ),
  },

  // 2
  {
    type: "prose",
    title: "Who Is Responsible for Your Data",
    body: (
      <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">
        The data controller for eshu.earth is Eshu Priye Belgotra, an individual
        based in Victoria, BC, Canada (originally from Mumbai, India). This site
        is operated as a personal project and is not affiliated with any company
        or institution. For all privacy-related enquiries, contact{" "}
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="text-indigo-500 underline underline-offset-2 hover:text-indigo-600"
        >
          {CONTACT_EMAIL}
        </a>
        .
      </p>
    ),
  },

  // 3
  {
    type: "table",
    title: "What Personal Data Is Collected",
    cols: ["Data", "Collected when", "Purpose", "Legal basis", "Stored in"],
    rows: [
      [
        "IP address",
        "Every AI chat message sent",
        "Rate limiting (max 10 req / 60 s) and abuse prevention",
        "Legitimate interests (Art. 6(1)(f) GDPR)",
        "Supabase logs table + Upstash Redis (60 s TTL)",
      ],
      [
        "Chat question",
        "Every AI chat message sent",
        "Generate an AI response via OpenAI; logged for debugging and quality monitoring",
        "Legitimate interests (Art. 6(1)(f) GDPR)",
        "Supabase logs table (30-day retention)",
      ],
      [
        "AI response",
        "Every AI chat message sent",
        "Logged alongside the question for debugging and monitoring response quality",
        "Legitimate interests (Art. 6(1)(f) GDPR)",
        "Supabase logs table (30-day retention)",
      ],
      [
        "AI response text (for TTS)",
        "Every AI chat message sent",
        "Converted to synthesised speech via OpenAI TTS API and played in-browser. Not stored separately.",
        "Legitimate interests (Art. 6(1)(f) GDPR)",
        "Transmitted to OpenAI transiently — not written to Supabase or any database on this site",
      ],
      [
        "Name, email address, free-text message",
        "Contact form submission only",
        "To respond to your enquiry",
        "Consent / Legitimate interests",
        "Email only (Resend → Gmail). Not written to any database.",
      ],
      [
        "Server request metadata (IP, user-agent, URL path, timestamp)",
        "Every page load and API request",
        "Infrastructure logging, error monitoring, and DDoS protection",
        "Legitimate interests",
        "Vercel edge logs (Vercel's own infrastructure — see Vercel Privacy Policy)",
      ],
    ],
  },

  // 4
  {
    type: "list",
    title: "What Is Not Collected",
    items: [
      {
        label: "Cookies",
        detail:
          "This site sets no cookies of any kind — not session cookies, not preference cookies, not analytics cookies.",
      },
      {
        label: "Tracking pixels or fingerprinting",
        detail:
          "No tracking pixels, web beacons, canvas fingerprinting, or device fingerprinting are used.",
      },
      {
        label: "Analytics",
        detail:
          "No Google Analytics, Mixpanel, Amplitude, Posthog, or equivalent analytics service is installed.",
      },
      {
        label: "Advertising data",
        detail:
          "No advertising networks or retargeting pixels are present. Your data is never used for advertising.",
      },
      {
        label: "Audio input",
        detail:
          "This site never accesses your microphone. Audio is output only — the AI's responses are played through your speakers or headphones. No audio is recorded or captured from your device.",
      },
      {
        label: "Sensitive personal data",
        detail:
          "This site never asks for or processes special-category data (health, biometric, racial origin, political opinion, religion, sexual orientation, etc.).",
      },
    ],
  },

  // 5
  {
    type: "list",
    title: "How Long Data Is Retained",
    items: [
      {
        label: "Supabase chat logs (IP + question + response)",
        detail:
          "Automatically deleted 30 days after the log entry is created. A scheduled pg_cron job runs daily at 02:00 UTC and hard-deletes any row where created_at < now() - interval '30 days'. There is no soft-delete or archive.",
      },
      {
        label: "Upstash Redis rate-limit keys",
        detail:
          "Each key is a hashed representation of your IP address. Keys have a TTL equal to the sliding window (60 seconds) and are automatically evicted by Redis after that window closes. No IP data persists in Redis beyond 60 seconds.",
      },
      {
        label: "OpenAI API inputs and outputs (chat and TTS)",
        detail:
          "Your messages are transmitted to OpenAI's API for chat completions, embeddings, and text-to-speech conversion. Per OpenAI's API data usage policy, API inputs and outputs may be retained by OpenAI for up to 30 days for abuse monitoring, after which they are deleted. OpenAI does not use API data to train its models by default. See openai.com/policies/api-data-usage-policies.",
      },
      {
        label: "Vercel infrastructure logs",
        detail:
          "Vercel retains server-side access logs according to their own data retention policy. This site has no control over that retention. See vercel.com/legal/privacy-policy.",
      },
      {
        label: "Contact form submissions",
        detail:
          "Retained only as long as the email correspondence is active. Not stored in any database operated by this site. Resend processes the email transiently and does not store message content beyond delivery.",
      },
    ],
  },

  // 6
  {
    type: "list",
    title: "Third-Party Sub-Processors",
    items: [
      {
        label: "Vercel (hosting and edge network)",
        detail:
          "All web traffic passes through Vercel's infrastructure. Vercel may log IP addresses, user-agent strings, and request paths for infrastructure and security purposes. Privacy policy: vercel.com/legal/privacy-policy",
      },
      {
        label: "Supabase (database)",
        detail:
          "Chat logs (IP address, question text, AI response text, timestamp) are stored in a PostgreSQL database hosted on Supabase. Data is stored in the AWS region selected during project setup. Supabase is SOC 2 Type 2 certified. Privacy policy: supabase.com/privacy",
      },
      {
        label: "Upstash (Redis — rate limiting)",
        detail:
          "IP addresses are written as rate-limit keys to an Upstash Redis instance with a 60-second TTL. Upstash is GDPR-compliant and does not use your data for any purpose other than serving the Redis API. Privacy policy: upstash.com/privacy",
      },
      {
        label: "OpenAI (AI responses, embeddings, and text-to-speech)",
        detail:
          "Your chat questions are sent to OpenAI's API to (a) generate a vector embedding for semantic search, (b) generate a natural language response via GPT-4o mini, and (c) convert that response to synthesised speech via OpenAI's TTS API (tts-1, voice: onyx). No audio is recorded from your device. OpenAI is a US-based processor. Data transfers from the EEA to the US are covered by OpenAI's Standard Contractual Clauses. Privacy policy: openai.com/policies/privacy-policy",
      },
      {
        label: "Resend (transactional email)",
        detail:
          "Contact form submissions are delivered via Resend. Resend processes your name, email address, and message content transiently to route the email. Privacy policy: resend.com/legal/privacy-policy",
      },
    ],
  },

  // 7
  {
    type: "prose",
    title: "Legal Basis for Processing (GDPR)",
    body: (
      <>
        <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">
          For users in the European Economic Area (EEA) or United Kingdom, all
          processing is conducted under{" "}
          <strong className="text-gray-700 dark:text-gray-300">
            Article 6(1)(f) GDPR — Legitimate Interests
          </strong>
          . The specific legitimate interests are:
        </p>
        <ol className="mt-4 space-y-2 list-decimal list-outside pl-5 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
          <li>
            <strong className="text-gray-700 dark:text-gray-300">
              Abuse prevention and rate limiting:
            </strong>{" "}
            Logging IP addresses is necessary to enforce per-IP request limits
            and prevent automated abuse of the AI assistant, which incurs direct
            API cost.
          </li>
          <li>
            <strong className="text-gray-700 dark:text-gray-300">
              Debugging and quality assurance:
            </strong>{" "}
            Storing chat questions and responses allows diagnosis of broken
            responses, retrieval failures, and unexpected model behaviour.
          </li>
          <li>
            <strong className="text-gray-700 dark:text-gray-300">
              Security monitoring:
            </strong>{" "}
            Retaining logs for 30 days allows investigation of any security
            incidents or misuse patterns after the fact.
          </li>
        </ol>
        <p className="mt-4 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
          A balancing test has been considered: the data collected is minimal
          (no names, no account data, no persistent identifiers beyond IP), the
          retention period is short (30 days), and the purposes are limited to
          the operational integrity of the site. The processing is proportionate
          and unlikely to override the interests or fundamental rights of users.
          You have the right to object to this processing at any time (see
          section 9).
        </p>
        <p className="mt-4 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
          For contact form submissions, processing is based on{" "}
          <strong className="text-gray-700 dark:text-gray-300">
            Article 6(1)(a) — Consent
          </strong>{" "}
          (you voluntarily submit the form) and Article 6(1)(f) — Legitimate
          Interests (responding to a direct enquiry).
        </p>
      </>
    ),
  },

  // 8
  {
    type: "prose",
    title: "International Data Transfers",
    body: (
      <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">
        This site is operated from Canada, which the European Commission has
        recognised as providing adequate protection under GDPR (adequacy
        decision for PIPEDA). Data stored in Supabase and processed by OpenAI
        may reside on servers in the United States. Transfers to the US rely on
        Standard Contractual Clauses (SCCs) or the relevant processor's data
        processing agreements where applicable. Upstash offers EU-region Redis
        instances; the region in use for this project is determined by the
        Upstash configuration. If you have concerns about the specific region
        your data is processed in, contact{" "}
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="text-indigo-500 underline underline-offset-2 hover:text-indigo-600"
        >
          {CONTACT_EMAIL}
        </a>
        .
      </p>
    ),
  },

  // 9
  {
    type: "list",
    title: "Your Rights",
    items: [
      {
        label: "Right of access (Art. 15 GDPR / CCPA / DPDP)",
        detail:
          "You may request a copy of all personal data held about you. Because chat logs are indexed by IP address and timestamp, please include your IP address and the approximate date(s) of your chat session(s) in your request to allow records to be located.",
      },
      {
        label: "Right to rectification (Art. 16 GDPR / DPDP)",
        detail:
          "If personal data held about you is inaccurate, you may request correction. Note that chat logs are factual records of what was sent and received and are not subject to correction on grounds of disagreement with the content.",
      },
      {
        label: "Right to erasure / right to be forgotten (Art. 17 GDPR / CCPA / DPDP)",
        detail:
          "You may request deletion of your personal data at any time, ahead of the automatic 30-day deletion schedule. Requests will be executed within 7 days. Note that data already automatically expired from Redis cannot be 'deleted' as it no longer exists.",
      },
      {
        label: "Right to restriction of processing (Art. 18 GDPR)",
        detail:
          "You may request that processing of your data be restricted (i.e., data is retained but not actively used) while a dispute or request is being handled.",
      },
      {
        label: "Right to data portability (Art. 20 GDPR)",
        detail:
          "You may request your data in a structured, machine-readable format (JSON). Given the limited nature of the data (IP, question text, response text, timestamp), this can be provided by email.",
      },
      {
        label: "Right to object (Art. 21 GDPR)",
        detail:
          "You may object to the processing of your personal data where processing is based on legitimate interests. Upon receiving a valid objection, processing will cease unless there are compelling legitimate grounds that override your interests, or processing is necessary for the establishment or defence of legal claims.",
      },
      {
        label: "Right to withdraw consent",
        detail:
          "Where processing is based on consent (contact form), you may withdraw consent at any time by contacting contact@eshu.earth. Withdrawal does not affect the lawfulness of processing carried out before withdrawal.",
      },
      {
        label: "CCPA — California residents",
        detail:
          "California residents have the right to: (1) know what personal information is collected and how it is used; (2) delete personal information; (3) opt out of the sale of personal information. This site does not sell personal information. To submit a CCPA request, email contact@eshu.earth with the subject 'CCPA Request'.",
      },
      {
        label: "India DPDP Act 2023",
        detail:
          "Under India's Digital Personal Data Protection Act 2023, you have the right to access information about your personal data, correct inaccurate data, erase data no longer needed for the purpose it was collected, and nominate another person to exercise rights on your behalf. To submit a DPDP request, email contact@eshu.earth with the subject 'DPDP Request'.",
      },
      {
        label: "Canada PIPEDA",
        detail:
          "Under Canada's Personal Information Protection and Electronic Documents Act, you have the right to access personal information held about you and to challenge its accuracy. Contact contact@eshu.earth to make a PIPEDA access request.",
      },
      {
        label: "Right to lodge a complaint",
        detail:
          "If you believe your data protection rights have been violated, you have the right to lodge a complaint with your local supervisory authority. In the EU, this is your national Data Protection Authority. In the UK, it is the ICO (ico.org.uk). In Canada, it is the Office of the Privacy Commissioner (priv.gc.ca). In India, it is the Data Protection Board of India.",
      },
    ],
  },

  // 10
  {
    type: "prose",
    title: "How to Exercise Your Rights",
    body: (
      <>
        <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">
          Email{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-indigo-500 underline underline-offset-2 hover:text-indigo-600"
          >
            {CONTACT_EMAIL}
          </a>{" "}
          with the subject line{" "}
          <strong className="text-gray-700 dark:text-gray-300">
            "Privacy Request — [type of request]"
          </strong>{" "}
          (e.g. "Privacy Request — Erasure", "Privacy Request — Access").
        </p>
        <p className="mt-3 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
          Please include:
        </p>
        <ul className="mt-2 space-y-1 list-disc list-outside pl-5 text-sm text-gray-500 dark:text-gray-400">
          <li>The type of request (access, erasure, objection, etc.)</li>
          <li>
            Your IP address — this is the only identifier available to locate
            your chat log records. You can find your IP at{" "}
            <a
              href="https://whatismyip.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-500 underline underline-offset-2 hover:text-indigo-600"
            >
              whatismyip.com
            </a>
            .
          </li>
          <li>
            Approximate date(s) of the chat session(s) in question (if known)
          </li>
        </ul>
        <p className="mt-3 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
          All requests will be acknowledged within{" "}
          <strong className="text-gray-700 dark:text-gray-300">72 hours</strong>{" "}
          and fulfilled within{" "}
          <strong className="text-gray-700 dark:text-gray-300">30 days</strong>{" "}
          (or sooner where possible). There is no charge for reasonable requests.
        </p>
      </>
    ),
  },

  // 11
  {
    type: "prose",
    title: "Data Security",
    body: (
      <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">
        All data in transit is encrypted via HTTPS/TLS. Supabase data at rest is
        encrypted by AWS (AES-256). Access to the Supabase database is
        restricted to server-side API routes using a service role key that is
        never exposed to the client. The Upstash Redis instance is accessed via
        HTTPS with token authentication. Environment variables (API keys,
        database credentials) are stored in Vercel's encrypted environment
        variable store and are never committed to source control. Despite these
        measures, no system is 100% secure. In the event of a data breach that
        affects your personal data, affected users will be notified by email
        (where contact details are available) within 72 hours of discovery, in
        accordance with GDPR Art. 33–34 obligations.
      </p>
    ),
  },

  // 12
  {
    type: "prose",
    title: "Children's Privacy",
    body: (
      <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">
        This site is not directed at children under the age of 13 (or under 16
        in jurisdictions where that threshold applies, including the EU under
        GDPR). If you are under the applicable age, please do not use the AI
        chat or submit personal data through the contact form. If you are a
        parent or guardian and believe a child has submitted personal data
        through this site, contact{" "}
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="text-indigo-500 underline underline-offset-2 hover:text-indigo-600"
        >
          {CONTACT_EMAIL}
        </a>{" "}
        and the data will be deleted within 48 hours.
      </p>
    ),
  },

  // 13
  {
    type: "prose",
    title: "Cookies and Tracking Technologies",
    body: (
      <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">
        This site does not use cookies of any kind. No first-party cookies, no
        third-party cookies, no local storage tokens, no session storage, no
        tracking pixels, no web beacons, no canvas or browser fingerprinting,
        and no cross-site tracking of any kind. The only browser-side state used
        is in-memory React state (chat message history), which is cleared when
        you close or refresh the page and is never persisted.
      </p>
    ),
  },

  // 14
  {
    type: "prose",
    title: "Automated Decision-Making and Profiling",
    body: (
      <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">
        This site does not engage in automated decision-making or profiling as
        defined under Art. 22 GDPR. The AI chat assistant generates responses
        based solely on the content of your question and a set of pre-loaded
        documents about Eshu. No user profiles are built, no behavioural
        patterns are analysed, and no decisions with legal or similarly
        significant effects are made based on your data.
      </p>
    ),
  },

  // 15
  {
    type: "prose",
    title: "Changes to This Policy",
    body: (
      <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">
        This policy may be updated to reflect changes in the site's
        functionality, data practices, or applicable law. The "Last updated"
        date at the top of this page will always reflect the most recent
        revision. For material changes that expand the scope of data collection
        or alter your rights, a notice will be added to the site for a
        reasonable period. Continued use of the site after a policy update
        constitutes acknowledgement of the updated terms. Previous versions of
        this policy are available on request.
      </p>
    ),
  },
]

// ─── Component helpers ────────────────────────────────────────────────────────

function SectionNumber({ n }: { n: number }) {
  return (
    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-xs font-bold shrink-0">
      {n}
    </span>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-950 px-6 py-20 sm:px-10">
      <div className="mx-auto max-w-2xl">

        {/* ── Header ── */}
        <div className="mb-14">
          <Link
            href="/"
            className="text-xs font-semibold uppercase tracking-widest text-indigo-500 dark:text-indigo-400 hover:text-indigo-600 transition-colors"
          >
            ← eshu.earth
          </Link>
          <h1 className="mt-4 text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm text-gray-400 dark:text-gray-500">
            Last updated: {LAST_UPDATED}
          </p>
          <p className="mt-5 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
            This policy describes how personal data is collected and handled
            when you visit <strong className="text-gray-700 dark:text-gray-300">eshu.earth</strong>.
            It is written to comply with the{" "}
            <strong className="text-gray-700 dark:text-gray-300">
              EU General Data Protection Regulation (GDPR)
            </strong>
            , the{" "}
            <strong className="text-gray-700 dark:text-gray-300">
              UK GDPR
            </strong>
            , the{" "}
            <strong className="text-gray-700 dark:text-gray-300">
              California Consumer Privacy Act (CCPA)
            </strong>
            , India's{" "}
            <strong className="text-gray-700 dark:text-gray-300">
              Digital Personal Data Protection Act 2023 (DPDP)
            </strong>
            , and Canada's{" "}
            <strong className="text-gray-700 dark:text-gray-300">PIPEDA</strong>.
          </p>
        </div>

        {/* ── Table of contents ── */}
        <nav className="mb-14 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-4">
            Contents
          </p>
          <ol className="space-y-2">
            {sections.map((s, i) => (
              <li key={i}>
                <a
                  href={`#section-${i + 1}`}
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors flex gap-3"
                >
                  <span className="text-gray-300 dark:text-gray-600 tabular-nums w-4 shrink-0">
                    {i + 1}.
                  </span>
                  {s.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* ── Sections ── */}
        <div className="space-y-16">
          {sections.map((section, i) => (
            <section key={i} id={`section-${i + 1}`}>

              {/* Heading */}
              {section.type !== "callout" && (
                <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-5 flex items-center gap-3">
                  <SectionNumber n={i + 1} />
                  {section.title}
                </h2>
              )}

              {/* ── Callout ── */}
              {section.type === "callout" && (
                <div className="rounded-xl border border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/60 dark:bg-indigo-950/30 p-6">
                  <p className="text-xs font-semibold uppercase tracking-widest text-indigo-500 dark:text-indigo-400 mb-3">
                    {section.title}
                  </p>
                  {section.body}
                </div>
              )}

              {/* ── Prose ── */}
              {section.type === "prose" && (
                <div className="pl-9">{section.body}</div>
              )}

              {/* ── List ── */}
              {section.type === "list" && (
                <div className="pl-9 space-y-5">
                  {section.items.map((item, j) => (
                    <div
                      key={j}
                      className="border-l-2 border-gray-100 dark:border-gray-800 pl-4"
                    >
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">
                        {item.label}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                        {item.detail}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* ── Table ── */}
              {section.type === "table" && (
                <div className="overflow-x-auto -mx-2 px-2">
                  <table className="w-full text-sm border-collapse min-w-160">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        {section.cols.map((col) => (
                          <th
                            key={col}
                            className="pb-3 pr-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500"
                          >
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-900">
                      {section.rows.map((row, j) => (
                        <tr key={j} className="align-top">
                          {row.map((cell, k) => (
                            <td
                              key={k}
                              className={`py-3 pr-4 text-sm leading-relaxed align-top ${
                                k === 0
                                  ? "font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap"
                                  : "text-gray-500 dark:text-gray-400"
                              }`}
                            >
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

            </section>
          ))}
        </div>

        {/* ── Footer ── */}
        <div className="mt-20 pt-8 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            © {new Date().getFullYear()} eshu.earth · This policy applies to this site only.
          </p>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-xs text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2 transition-colors"
          >
            {CONTACT_EMAIL}
          </a>
        </div>

      </div>
    </main>
  )
}