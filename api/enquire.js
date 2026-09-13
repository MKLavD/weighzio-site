export const config = { runtime: 'edge' };

const TO_ALIAS = 'enquiries@weighz.io';
const FROM_ADDRESS = 'weighzIO Enquiries <noreply@weighz.io>';

const MIN_SUBMIT_MS = 3000;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX = 5;

// In-memory only: resets on cold start, not shared across regions or
// instances. Adequate for a low-volume B2B form - if abuse patterns
// show this isn't holding, move to Vercel KV rather than tuning this
// further.
const rateLimitStore = new Map();

const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com', 'guerrillamail.com', '10minutemail.com', 'tempmail.com',
  'trashmail.com', 'yopmail.com', 'getnada.com', 'throwawaymail.com'
]);
const FREE_DOMAINS = new Set([
  'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com', 'aol.com', 'live.com'
]);

const SPAM_KEYWORDS = [/\bcasino\b/i, /\bcrypto\b/i, /\bviagra\b/i, /\bseo services\b/i, /\bbacklinks?\b/i, /\bloan\b/i];

// Any Cyrillic or CJK (Chinese/Japanese/Korean) character. Every
// genuine enquirer writes in English, so this is a high-confidence
// block rather than a flag - unlike the softer signals below.
const NON_LATIN_SCRIPT = /[\u0400-\u04FF\u4E00-\u9FFF\u3040-\u30FF\uAC00-\uD7AF]/;

function jsonResponse(body, status) {
  return new Response(JSON.stringify(body), {
    status: status || 200,
    headers: { 'Content-Type': 'application/json' }
  });
}

// A silent pass looks identical to a real success to whoever - or
// whatever - submitted the form. Bots and spammers get no signal that
// anything was filtered, which is the whole point of a honeypot-style
// response rather than a rejection.
function silentPass() {
  return jsonResponse({ ok: true });
}

function getClientIp(req) {
  var fwd = req.headers.get('x-forwarded-for');
  return fwd ? fwd.split(',')[0].trim() : 'unknown';
}

function isRateLimited(ip) {
  var now = Date.now();
  var entry = rateLimitStore.get(ip);
  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitStore.set(ip, { windowStart: now, count: 1 });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT_MAX;
}

function hasSpamContent(text) {
  if (!text) return false;
  var linkCount = (text.match(/https?:\/\//gi) || []).length;
  var keywordHit = SPAM_KEYWORDS.some(function (re) { return re.test(text); });
  return linkCount >= 3 || keywordHit;
}

export default async function handler(req) {
  if (req.method !== 'POST') {
    return jsonResponse({ ok: false, error: 'method_not_allowed' }, 405);
  }

  var form;
  try {
    form = await req.formData();
  } catch (e) {
    return jsonResponse({ ok: false, error: 'invalid_form_data' }, 400);
  }

  // Honeypot: only a bot that doesn't render CSS fills this in.
  if (form.get('website')) return silentPass();

  var ip = getClientIp(req);
  if (isRateLimited(ip)) return silentPass();

  // Time-to-submit: the front end stamps a hidden "loaded_at" field
  // with Date.now() when the /enquire form becomes visible.
  var loadedAt = Number(form.get('loaded_at'));
  if (loadedAt && Date.now() - loadedAt < MIN_SUBMIT_MS) return silentPass();

  var name = (form.get('name') || '').toString().trim();
  var company = (form.get('company') || '').toString().trim();
  var email = (form.get('email') || '').toString().trim();
  var phone = (form.get('phone') || '').toString().trim();
  var consent = form.get('consent');

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!name || !company || !email || !phone || !consent || !EMAIL_RE.test(email)) {
    return jsonResponse({ ok: false, error: 'invalid_fields' }, 400);
  }

  var modules = form.getAll('modules').map(function (m) { return m.toString(); });
  var permittedSite = (form.get('permitted_site') || '').toString();
  var vehicles = (form.get('vehicles') || '').toString();
  var anythingElse = (form.get('anything_else') || '').toString().trim();

  // Strong signal, blocked outright rather than flagged.
  if (NON_LATIN_SCRIPT.test(anythingElse) || NON_LATIN_SCRIPT.test(name) || NON_LATIN_SCRIPT.test(company)) {
    return silentPass();
  }

  if (hasSpamContent(anythingElse)) {
    return silentPass();
  }

  // From here on, nothing blocks - only flags added to the subject
  // line for a human to weigh, since these signals are weaker.
  var flags = [];

  var emailDomain = (email.split('@')[1] || '').toLowerCase();
  if (DISPOSABLE_DOMAINS.has(emailDomain)) flags.push('disposable email');
  else if (FREE_DOMAINS.has(emailDomain)) flags.push('free domain');

  var country = req.headers.get('x-vercel-ip-country') || '';
  if (country && country !== 'GB') flags.push('IP: ' + country);

  var subjectFlags = flags.length ? ' [' + flags.join(', ') + ']' : '';
  var subject = 'New enquiry - ' + company + ' - ' + modules.length + ' module' + (modules.length === 1 ? '' : 's') + subjectFlags;

  var bodyLines = [
    'Name: ' + name,
    'Company: ' + company,
    'Email: ' + email,
    'Phone: ' + phone,
    '',
    'Modules (' + modules.length + '): ' + (modules.length ? modules.join(', ') : 'none selected'),
    'Receives waste at own permitted site: ' + (permittedSite || 'not answered'),
    'Vehicles: ' + (vehicles || 'not answered'),
    '',
    'Anything else: ' + (anythingElse || '(nothing entered)'),
    '',
    'IP country: ' + (country || 'unknown')
  ].join('\n');

  try {
    var resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + process.env.RESEND_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to: [TO_ALIAS],
        reply_to: email,
        subject: subject,
        text: bodyLines
      })
    });

    if (!resendResponse.ok) {
      var errText = await resendResponse.text();
      console.error('Resend send failed', resendResponse.status, errText);
      return jsonResponse({ ok: false, error: 'send_failed' }, 502);
    }
  } catch (e) {
    console.error('Resend request threw', e);
    return jsonResponse({ ok: false, error: 'send_failed' }, 502);
  }

  return jsonResponse({ ok: true });
}
