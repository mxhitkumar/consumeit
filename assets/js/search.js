/* Consumeit site search. No network; typed text is never logged or sent. */
((w, d) => {
'use strict';
const GR = { S: 'Services', I: 'Industries', L: 'Learn', C: 'Company', H: 'Help', G: 'Legal' },
 TAG = { p: 'price', l: 'learn', c: 'contact', g: 'legal' };
/* page | title | blurb | group | keywords | tag (s/ = services, l/ = locations) */
const DATA = [
'service|All our services|Videos, posts, ads, websites and more.|S|menu,everything',
'service#not-sure|Not sure what you need?|Tell us your goal. We suggest a step.|S|confused,where to start,advice',
's/branding-design|Video editing, design and brand|Reels, edits, thumbnails, logos and brand message.|S|video editing,thumbnail,logo,poster',
's/digital-marketing|Social media and ads|Posting, a growth plan and ads on Facebook, Instagram and Google.|S|social media,instagram,instagram page,page management,manage my page,social media management,facebook,marketing,followers,grow',
's/web-development|Websites and enquiry pages|A clear website that works on a phone.|S|web design,landing page,wordpress,redesign',
's/web-development|Online shops: ask us first|Online shops are not listed. Ask us first.|S|ecommerce,e commerce,online shop,online store,shopify,cart,sell online',
's/seo|Be found on Google|Make your pages easier to find in search.|S|seo,first page,keywords,local,near me',
's/ai-automation|Smart AI help|AI as a quick helper for content and marketing.|S|ai,chatgpt,chatbot,bot',
'contact|App building: tell us first|We do not list apps. Tell us your idea.|H|app,mobile app,android,ios,iphone,software|c',
'#industries|Doctors, clinics and hospitals|Careful content for health brands.|I|doctor,clinic,hospital,dentist,dental,medical,health,physio',
'#industries|Schools, coaching and colleges|Videos, posts and ads for classes and schools.|I|school,coaching,college,teacher,tutor,institute,university,student',
'#industries|Trading and finance brands|Educational content. No promised returns.|I|trading,forex,stocks,share market,finance,investing,crypto,broker',
'#industries|Startups, shops and founders|Startups, local shops and founders.|I|startup,founder,local business,shop,restaurant,salon,gym,real estate,small business,industries,who do you help',
'|Consumeit home|What we do and who we help.|C|home,homepage',
'#services|What we can do for you|A quick tour of how we help.|S|tour',
'#how-it-works|How it works|Four steps: talk, plan, make, check.|C|process,steps,what happens next,how long',
'#program|The program, in short|A short look at the live program.|L|program,creator|l',
'#faq|Quick answers|Short answers to what people ask first.|H|questions,faq',
'content-creation|Content Creation Program|A live Google Meet program to start creating content.|L|learn,teach,content creation,creator,youtuber,influencer,camera,microphone,149|l',
'content-creation#learn|What you learn|Twelve topics: gear, making content, smart choices.|L|syllabus,curriculum,gear,lighting,scripts|l',
'content-creation#join|How to join|Three easy steps: message us, get details, decide.|L|join,enroll,sign up,register,apply,who is it for|l',
'pricing|Pricing and costs|A clear written quote before you pay.|H|cost,how much,per month,monthly plan,retainer|p',
'pricing#separate|Ad budget and tools|Ad spend goes to the ad platform. Our fee is separate.|H|ad budget,ad spend,tools,hidden costs,extra charges|p',
'pricing#before-you-pay|Before you pay|What you get in writing first. Ask us how to pay.|H|pay,dollars,usd,rupees,inr,invoice,bank,paypal,upi|p',
'about|About Consumeit|Who we are and how we work.|C|about us,who are you,team,company,founder,rohit',
'contact|Let\'s Talk|Send a message or email us.|C|contact,email,hire,get in touch,get started,support,address,form|c',
'faq|Questions and answers|Straight answers about working with us.|H|faq,questions,help,doubts',
'faq#money|Ads and money|How cost is decided and what we promise.|H|guarantee,results,roi,promise|p',
'l/global|Working from anywhere|We work online with clients in any country.|C|usa,america,united states,uk,britain,england,london,australia,canada,uae,dubai,europe,remote,nri,time zone,office',
'l/india|Consumeit in India|What we do for businesses in India.|C|indian,delhi,mumbai,bangalore,rupees,gst',
'privacy|Privacy Policy|What we collect, why, and your choices.|G|privacy,gdpr,delete my data,erase,rights,unsubscribe|g',
'privacy#cookies|Cookies and analytics|No cookies of our own. Analytics only if you say yes.|G|analytics,consent,opt out|g',
'terms|Terms of Service|The rules for this site and working with us.|G|terms,terms of service,terms and conditions,conditions,agreement,contract,tos|g',
'terms#cancellation|Cancellation and refunds|What happens if you stop, and how refunds work.|G|stop,end contract,money back,notice period|g',
'terms#ownership|Who owns the work|Deliverables are yours on full payment.|G|copyright,license,source files|g'
];
const STOP = new Set('a an the and or but if so to of in on at by for with from as is are was were be do does can could would should will have i me my we us our you your it this that what which who when where why how about some any someone want wants need needs like looking help get make please just much tell show give find know'.split(' '));
/* synonym groups; "tag:" also sets the intent */
const SYN = [
'video reel short clip film footage youtube tiktok vlog',
'ad advert advertise advertising promote promotion ppc',
'website site webpage web landing',
'price:cost price fee charge rate quote pricing budget cheap expensive afford pay payment dollar rupee currency invoice money',
'learn:learn course class lesson train training teach tutorial study workshop mentor program programme beginner',
'contact:contact reach email mail message talk call hire phone whatsapp book meeting speak enquiry inquiry',
'google search seo rank ranking',
'refund cancel cancellation',
'legal:privacy data cookie gdpr tracking terms legal policy conditions',
'abroad overseas international global foreign worldwide country',
'ai chatbot gpt chatgpt automation bot'
];
const POP = [0,2,4,21,18,24], /* entries shown when nothing matches */
 CHIPS = ['video editing', 'website cost', 'Facebook ads', 'learn content creation', 'privacy'];

const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/['\u2019\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim().replace(/\bhow much\b/, 'cost');
const stem = t => {
 if (t.length > 2) t = t.replace(/ies$/, 'i').replace(/([^su])s$/, '$1');
 if (t.length > 5) t = t.replace(/ing$/, '');
 if (t.length > 4) t = t.replace(/(ed|er)$/, '');
 if (t.length > 3) t = t.replace(/([b-df-hj-np-tv-z])\1$/, '$1').replace(/e$/, '').replace(/y$/, 'i');
 return t;
};
const toks = s => {
 const a = norm(s).split(' ').filter(Boolean), f = a.filter(x => !STOP.has(x));
 return (f.length ? f : a).map(r => [r, stem(r)]);
};
const lev = (a, b) => {
 let r = [...Array(b.length + 1).keys()];
 for (let i = 1; i <= a.length; i++) {
  const n = [i];
  for (let j = 1; j <= b.length; j++) n[j] = Math.min(r[j] + 1, n[j - 1] + 1, r[j - 1] + (a[i - 1] !== b[j - 1]));
  r = n;
 }
 return r[b.length];
};

const DF = {}, SM = {}, IT = {}, E = [];
SYN.forEach(g => {
 const tag = /^(\w+):/.exec(g), st = g.replace(/^\w+:/, '').split(' ').map(stem);
 st.forEach(s => { SM[s] = (SM[s] || []).concat(st.filter(x => x !== s)); if (tag) IT[s] = tag[1]; });
});
DATA.forEach((line, i) => {
 const p = line.split('|'), u = p[0].replace(/^s\//, 'services/').replace(/^l\//, 'locations/'),
  e = { url: '/' + u.replace(/^([^#]*[a-z])(#|$)/, '$1.html$2'), title: p[1], blurb: p[2], group: GR[p[3]], tag: TAG[p[5]], i };
 e.t = toks(p[1]).map(x => x[1]);
 e.b = toks(p[2]).map(x => x[1]);
 e.ph = p[4].split(',').map(k => toks(k).map(x => x[1]));
 e.k = [].concat(...e.ph);
 new Set([...e.t, ...e.k, ...e.b]).forEach(s => { DF[s] = (DF[s] || 0) + 1; });
 E.push(e);
});
const idf = s => 1 + Math.log(E.length / (DF[s] || 1)) / 2;

/* strength: exact 1, prefix .6, typo .5 */
const best = (list, q, mult) => {
 let b = 0;
 for (const t of list) {
  let f = 0;
  if (t === q.s) f = 1;
  else if (!q.x) {
   if (q.last && q.r.length > 1 && (t.startsWith(q.s) || t.startsWith(q.r))) f = 0.6;
   else if (q.r.length > 4 && t.length > 3 && t[0] === q.s[0]) {
    const dd = q.r.length > 7 ? 2 : 1;
    if (lev(t, q.s) <= dd) f = 0.5;
   }
  }
  b = Math.max(b, f * mult * idf(t));
 }
 return b;
};

const search = query => {
 const raw = toks(query).filter((x, i, a) => a.findIndex(y => y[1] === x[1]) === i), qs = [], seen = new Set(), intents = {}, out = [];
 raw.forEach(([r, s], i) => {
  seen.add(s);
  qs.push({ s, r, w: 1, last: i === raw.length - 1, o: i });
  if (IT[s]) intents[IT[s]] = 1;
 });
 const qn = qs.length, qstr = ' ' + raw.map(x => x[1]).join(' ') + ' ';
 raw.forEach(([, s], i) => (SM[s] || []).forEach(x => {
  if (!seen.has(x)) { seen.add(x); qs.push({ s: x, r: x, w: 0.5, x: 1, o: i }); }
 }));
 E.forEach(e => {
  let sc = 0;
  const cov = new Set();
  qs.forEach(q => {
   const tot = best(e.t, q, 6) + best(e.k, q, 4) + best(e.b, q, 1.5);
   if (tot) { sc += tot * q.w; cov.add(q.o); }
  });
  if (!sc) return;
  e.ph.forEach(p => { if (p.length > 1 && qstr.includes(' ' + p.join(' ') + ' ')) sc += 5 + 2 * p.length; });
  sc *= 0.6 + 0.4 * cov.size / qn;
  const nt = norm(e.title);
  if (raw.length && raw.every(([, s]) => nt.includes(s))) sc += 6; /* the page is literally named by the query */
  if (intents[e.tag]) sc += 3;
  if (e.url.includes('#')) sc *= 0.85;
  if (sc >= 2.4) out.push({ e, score: sc });
 });
 out.sort((a, b) => b.score - a.score || a.e.i - b.e.i);
 const urls = new Set();
 return out.filter(({ e, score }) => score > out[0].score / 6 && !urls.has(e.url) && urls.add(e.url)).slice(0, 6)
  .map(({ e, score }) => ({ url: e.url, title: e.title, blurb: e.blurb, group: e.group, score: Math.round(score * 100) / 100 }));
};

/* UI: markup is built from our own strings only, never typed text.
 bind() wires a box with input, ul, .s-status, .s-extra (overlay and 404). */
const bind = (box, onGo) => {
 const $ = s => box.querySelector(s), input = $('input'), ul = $('ul'), st = $('.s-status'), ex = $('.s-extra');
 let timer;
 const paint = () => {
  const q = input.value;
  let r = search(q);
  const none = !r.length;
  if (!norm(q)) {
   ul.innerHTML = ''; st.textContent = '';
   ex.innerHTML = '<p class="s-try">Try:</p><div class="s-chips">' + CHIPS.map(c => `<button type="button" class="s-chip">${c}</button>`).join('') + '</div>';
   return;
  }
  if (none) r = E.filter(e => POP.includes(e.i)).slice(0, 5);
  st.textContent = none ? 'No close match. Press Enter and we will take you to the contact page, or pick a popular page.' : r.length + (r.length === 1 ? ' result' : ' results');
  ul.innerHTML = r.map((x, i) => `<li><a class="sr${i || none ? '' : ' is-top'}" href="${x.url}"><i>${x.group}</i><b>${x.title}</b><small>${x.blurb}</small></a></li>`).join('');
  ex.innerHTML = none ? '<a class="s-ask" href="/contact.html">Not finding it? Tell us what you need</a>' : '';
 };
 box.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(paint, 80); });
 box.addEventListener('click', e => {
  const c = e.target;
  if (c.className === 's-chip') { input.value = c.textContent; paint(); input.focus(); }
  else if (onGo && c.closest('a')) onGo();
 });
 box.addEventListener('keydown', e => {
  const k = e.key, f = [input, ...ul.querySelectorAll('a')], i = f.indexOf(d.activeElement);
  if (k === 'Enter' && i === 0) {
   e.preventDefault(); clearTimeout(timer); paint();
   /* Simple rule: a match goes to its page; no match goes to the contact page. */
   if (!norm(input.value)) return;
   const hit = search(input.value);
   if (onGo) onGo();
   w.location.href = hit.length ? hit[0].url : '/contact.html';
  } else if ((k === 'ArrowDown' || k === 'ArrowUp') && i > -1) {
   e.preventDefault();
   (f[i + (k === 'ArrowDown' ? 1 : -1)] || f[i]).focus();
  }
 });
 paint();
 return { input, paint };
};

let root, ui, opener, isOpen = false;
const close = restore => {
 if (!isOpen) return;
 isOpen = false;
 root.classList.remove('is-open'); root.hidden = true;
 d.documentElement.classList.remove('search-open');
 if (restore !== false && opener) opener.focus();
};
const open = from => {
 if (isOpen || !root) return;
 let a = d.activeElement;
 if (a.closest('.drawer')) { d.querySelector('.drawer [data-drawer="close"]').click(); a = d.querySelector('.nav__actions [data-drawer="open"]'); }
 opener = a === d.body ? from : a;
 root.hidden = false;
 void root.offsetWidth;
 root.classList.add('is-open');
 d.documentElement.classList.add('search-open');
 isOpen = true;
 ui.input.value = ''; ui.paint(); ui.input.focus();
};
const init = () => {
 root = d.getElementById('site-search');
 if (root) {
  const panel = root.querySelector('.s-panel');
  ui = bind(panel, () => close(false));
  root.addEventListener('click', e => { if (/^s-(scrim|close)$/.test(e.target.className)) close(true); });
  root.querySelector('form').addEventListener('submit', e => {
   e.preventDefault();
   if (!norm(ui.input.value)) return;
   const hit = search(ui.input.value);
   close(false);
   w.location.href = hit.length ? hit[0].url : '/contact.html';
  });
  root.addEventListener('keydown', e => {
   if (e.key === 'Escape') { e.preventDefault(); close(true); }
   if (e.key !== 'Tab') return;
   const f = [...panel.querySelectorAll('a, button, input')], i = f.indexOf(d.activeElement);
   if (e.shiftKey ? i < 1 : i === f.length - 1) { e.preventDefault(); f[e.shiftKey ? f.length - 1 : 0].focus(); }
  });
 }
 d.addEventListener('click', e => {
  const t = root && e.target.closest && e.target.closest('.search-btn, [data-search-open]');
  if (!t || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey) return;
  e.preventDefault(); open(t);
 });
 d.addEventListener('keydown', e => {
  const mod = e.metaKey || e.ctrlKey, typing = e.target.closest && e.target.closest('input,textarea,select,[contenteditable]');
  if (root && !isOpen && !e.altKey && ((mod && e.key.toLowerCase() === 'k') || (e.key === '/' && !mod && !typing))) {
   e.preventDefault(); open();
  }
 });
 const f = d.querySelector('[data-search-inline]');
 if (f) { f.hidden = false; bind(f, null); }
};
w.ConsumeITSearch = { search, open, close: () => close(true) };
if (d && d.addEventListener) {
 if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', init); else init();
}
})(typeof window !== 'undefined' ? window : this, typeof document !== 'undefined' ? document : null);
