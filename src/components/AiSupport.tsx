'use client';

import React, { useState, useRef, useEffect } from 'react';
import styles from './AiSupport.module.css';

interface Message {
  role: 'user' | 'assistant';
  text: string;
  time: string;
}

const QUICK = [
  'How do I track my order?',
  'What is the return policy?',
  'How to add a product?',
  'How to change my role?',
];

const FAQ: Array<{ q: string[]; a: string }> = [
  { q: ['track', 'order status', 'where is my order', 'shipping'], a: 'You can track your order in **My Orders** section. Go to the top-right menu → My Orders, then click on any order to see its status and timeline.' },
  { q: ['return', 'refund', 'exchange'], a: 'Our return policy allows returns within 30 days of delivery. Contact support with your order ID and reason. Refunds are processed within 5-7 business days.' },
  { q: ['add product', 'sell', 'create product', 'list product'], a: 'To add a product: switch your role to **Seller** in Settings, then go to **Seller Dashboard → Products → Add Product**. Fill in the details and click Publish.' },
  { q: ['role', 'seller', 'buyer', 'switch role', 'become seller'], a: 'You can switch between Buyer and Seller roles in **Settings** (click your avatar → Settings & Role). Admin role is assigned by platform administrators.' },
  { q: ['payment', 'pay', 'card', 'billing'], a: 'We accept Visa and Mastercard. During checkout you can use test cards: **4242 4242 4242 4242** (Visa) or **5555 5555 5555 4444** (Mastercard). All payments are processed securely.' },
  { q: ['delivery', 'shipping time', 'how long'], a: 'Standard delivery takes 3-7 business days. Express delivery (1-2 days) is available at checkout. Free shipping on all orders!' },
  { q: ['account', 'profile', 'password', 'login', 'sign in'], a: 'You can sign in with email/password or Google. To reset your password, click "Forgot password" on the login page. Profile settings are available in the top-right menu.' },
  { q: ['contact', 'support', 'help', 'human', 'agent'], a: 'For urgent issues, email us at **support@bigboss.shop** or use the contact form. Our team responds within 24 hours on business days.' },
  { q: ['cart', 'basket', 'add to cart'], a: 'Click the **+** button on any product card to add it to your cart. View your cart by clicking the 🛒 icon in the top navigation.' },
  { q: ['discount', 'promo', 'coupon', 'sale'], a: 'Check our **BIG SALE** section on the homepage for current discounts. Subscribe to our newsletter for exclusive promo codes.' },
  { q: ['size', 'sizing', 'fit'], a: 'Each product page shows available sizes. We recommend checking the size chart in the product description. If unsure, size up for a relaxed fit.' },
  { q: ['hello', 'hi', 'hey', 'hola', 'привет', 'salut'], a: "Hello! 👋 I'm BigBoss AI Support. I can help you with orders, products, payments, and more. What can I help you with today?" },
  { q: ['thank', 'thanks', 'спасибо', 'merci'], a: "You're welcome! 😊 Is there anything else I can help you with?" },
  { q: ['bye', 'goodbye', 'see you', 'пока'], a: 'Goodbye! Have a great shopping experience at BigBoss! 🛍️' },
];

function getAnswer(input: string): string {
  const lower = input.toLowerCase();
  for (const item of FAQ) {
    if (item.q.some(kw => lower.includes(kw))) return item.a;
  }
  return "I'm not sure about that. Could you rephrase your question? You can also contact our support team at **support@bigboss.shop** for detailed assistance.";
}

function renderText(text: string) {
  return text.split(/\*\*(.*?)\*\*/g).map((part, i) =>
    i % 2 === 1 ? <strong key={i}>{part}</strong> : part
  );
}

function now() {
  return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

export default function AiSupport() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', text: "Hi! 👋 I'm BigBoss AI Support. How can I help you today?", time: now() },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const send = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { role: 'user', text: text.trim(), time: now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    const delay = 600 + Math.random() * 800;
    setTimeout(() => {
      const answer = getAnswer(text);
      setMessages(prev => [...prev, { role: 'assistant', text: answer, time: now() }]);
      setTyping(false);
    }, delay);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); }
  };

  return (
    <>
      {/* Chat window */}
      {open && (
        <div className={styles.window}>
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <div className={styles.avatar}>🤖</div>
              <div>
                <p className={styles.name}>BigBoss AI</p>
                <p className={styles.status}><span className={styles.dot} />Online</p>
              </div>
            </div>
            <button className={styles.closeBtn} onClick={() => setOpen(false)}>✕</button>
          </div>

          <div className={styles.messages}>
            {messages.map((msg, i) => (
              <div key={i} className={`${styles.msgRow} ${msg.role === 'user' ? styles.msgRowUser : ''}`}>
                {msg.role === 'assistant' && <div className={styles.msgAvatar}>🤖</div>}
                <div className={`${styles.bubble} ${msg.role === 'user' ? styles.bubbleUser : styles.bubbleBot}`}>
                  <p className={styles.bubbleText}>{renderText(msg.text)}</p>
                  <span className={styles.bubbleTime}>{msg.time}</span>
                </div>
              </div>
            ))}
            {typing && (
              <div className={styles.msgRow}>
                <div className={styles.msgAvatar}>🤖</div>
                <div className={`${styles.bubble} ${styles.bubbleBot} ${styles.typingBubble}`}>
                  <span className={styles.typingDot} /><span className={styles.typingDot} /><span className={styles.typingDot} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick replies */}
          {messages.length <= 2 && (
            <div className={styles.quickReplies}>
              {QUICK.map(q => (
                <button key={q} className={styles.quickBtn} onClick={() => send(q)}>{q}</button>
              ))}
            </div>
          )}

          <div className={styles.inputRow}>
            <input
              ref={inputRef}
              className={styles.input}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Type a message..."
              maxLength={300}
            />
            <button className={styles.sendBtn} onClick={() => send(input)} disabled={!input.trim()}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* FAB button */}
      <button className={`${styles.fab} ${open ? styles.fabOpen : ''}`} onClick={() => setOpen(o => !o)} aria-label="AI Support">
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        ) : (
          <>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <span className={styles.fabLabel}>Support</span>
          </>
        )}
      </button>
    </>
  );
}

