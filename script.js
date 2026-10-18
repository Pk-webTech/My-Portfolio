'use strict';
document.getElementById('year').textContent = new Date().getFullYear();
const navToggle = document.getElementById('navToggle');
const navLinks = document.querySelector('.nav-links');
function closeNav() { navLinks.classList.remove('open'); navToggle.setAttribute('aria-expanded', 'false'); }
navToggle.addEventListener('click', () => { const open = navLinks.classList.toggle('open'); navToggle.setAttribute('aria-expanded', String(open)); });
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', closeNav));
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeNav(); });
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) navLinks.querySelectorAll('a').forEach(a => a.classList.toggle('active', a.hash === '#' + entry.target.id));
  }), { rootMargin: '-15% 0px -55% 0px' });
  document.querySelectorAll('section[id]').forEach(s => observer.observe(s));
}
document.getElementById('contactForm').addEventListener('submit', e => {
  e.preventDefault();
  const value = id => document.getElementById(id).value.trim();
  const body = `Name: ${value('cf-name')}\nEmail: ${value('cf-email')}\n\n${value('cf-message')}`;
  location.href = `mailto:piyushkumar.dev01@gmail.com?subject=${encodeURIComponent(value('cf-subject') || 'Portfolio contact')}&body=${encodeURIComponent(body)}`;
});

// Whole-word matching avoids 'hi' matching 'this' and 'win' matching 'window'.
function portfolioAnswer(raw) {
  const text = raw.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  let best, score = 0;
  for (const entry of window.PORTFOLIO_KB) {
    const points = entry.keywords.reduce((sum, keyword) => {
      const word = keyword.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
      const matched = (' ' + text + ' ').includes(' ' + word + ' ') || word.split(' ').length === 1 && text.split(' ').includes(word + 's');
      return sum + (matched ? word.split(' ').length : 0);
    }, 0);
    if (points > score) { best = entry; score = points; }
  }
  return best ? best.answer : "I can help with Piyush's background, skills, projects, education, and contact details. I don't have that detail in the portfolio. Try a topic below or contact Piyush directly.";
}
(function initChatbot() {
  const fab = document.getElementById('chatbotFab'), win = document.getElementById('chatbotWindow');
  const messages = document.getElementById('chatbotMessages'), form = document.getElementById('chatbotForm');
  const input = document.getElementById('chatbotInput'), quick = document.getElementById('chatbotQuick');
  const status = document.querySelector('.chatbot-status');
  const endpoint = window.PORTFOLIO_CHAT_ENDPOINT || '';
  let history = [], busy = false, returnFocus = fab;
  status.textContent = endpoint ? 'AI assistant · ready' : 'Portfolio guide · local answers';
  function addMessage(text, who) {
    const el = document.createElement('div'); el.className = 'chatbot-msg ' + who; el.textContent = text;
    messages.appendChild(el); messages.scrollTop = messages.scrollHeight;
    while (messages.children.length > 60) messages.firstElementChild.remove();
  }
  function closeChat(restore = true) {
    win.classList.remove('open'); win.setAttribute('aria-hidden', 'true'); win.inert = true; fab.setAttribute('aria-expanded', 'false');
    if (restore) returnFocus.focus({ preventScroll: true });
  }
  function openChat() {
    returnFocus = document.activeElement; win.inert = false; win.classList.add('open'); win.setAttribute('aria-hidden', 'false'); fab.setAttribute('aria-expanded', 'true');
    if (!messages.childElementCount) addMessage("Hi! I'm Piyush's portfolio assistant. Explore his work in AI, autonomous drones, and software. What would you like to know?", 'bot');
    input.focus({ preventScroll: true });
  }
  fab.addEventListener('click', () => win.classList.contains('open') ? closeChat() : openChat());
  document.getElementById('chatbotClose').addEventListener('click', () => closeChat());
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && win.classList.contains('open')) closeChat(); });
  document.addEventListener('click', e => { if (win.classList.contains('open') && !win.contains(e.target) && !fab.contains(e.target)) closeChat(false); });
  async function respondTo(raw) {
    const text = raw.trim().slice(0, 500); if (!text || busy) return;
    busy = true; addMessage(text, 'user'); input.value = '';
    form.querySelector('button').disabled = true; quick.querySelectorAll('button').forEach(b => b.disabled = true);
    input.setAttribute('aria-busy', 'true');
    const typing = document.createElement('div'); typing.className = 'chatbot-typing'; typing.textContent = 'Thinking…'; messages.appendChild(typing);
    let reply; const controller = new AbortController(); const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      if (!endpoint) { reply = portfolioAnswer(text); }
      else {
        const url = new URL(endpoint, location.href);
        if (location.protocol === 'https:' && url.protocol !== 'https:') throw new Error('Insecure endpoint');
        const res = await fetch(url, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:text,history}),signal:controller.signal});
        if (!res.ok) throw new Error('Unavailable');
        const data = await res.json(); if (typeof data.reply !== 'string' || !data.reply.trim()) throw new Error('Invalid reply');
        reply = data.reply.trim(); status.textContent = 'AI assistant · connected';
        history.push({role:'user',content:text},{role:'assistant',content:reply.slice(0,2000)}); history = history.slice(-12);
      }
    } catch { reply = portfolioAnswer(text); status.textContent = 'AI unavailable · using local answers'; }
    finally {
      clearTimeout(timeout); typing.remove(); busy = false; input.removeAttribute('aria-busy');
      form.querySelector('button').disabled = false; quick.querySelectorAll('button').forEach(b => b.disabled = false);
    }
    addMessage(reply, 'bot');
  }
  form.addEventListener('submit', e => { e.preventDefault(); respondTo(input.value); });
  quick.addEventListener('click', e => { const button = e.target.closest('button[data-q]'); if (button) respondTo(button.dataset.q); });
})();
