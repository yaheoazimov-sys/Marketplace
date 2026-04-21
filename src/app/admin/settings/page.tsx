'use client';

import React, { useState } from 'react';
import styles from '../admin.page.module.css';

export default function AdminSettingsPage() {
  const [commission, setCommission] = useState('5');
  const [platformName, setPlatformName] = useState('BigBoss');
  const [supportEmail, setSupportEmail] = useState('support@bigboss.shop');
  const [freeShipping, setFreeShipping] = useState(true);
  const [saved, setSaved] = useState(false);

  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div className={styles.page}>
      <div className={styles.header}><h1 className={styles.title}>Platform Settings</h1><p className={styles.sub}>Global configuration</p></div>

      {saved && <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', padding: '0.6rem 1rem', borderRadius: 8, fontSize: '0.875rem' }}>✓ Settings saved</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {[
          { title: 'General', fields: [
            { label: 'Platform Name', value: platformName, onChange: setPlatformName, type: 'text' },
            { label: 'Support Email', value: supportEmail, onChange: setSupportEmail, type: 'email' },
          ]},
          { title: 'Finance', fields: [
            { label: 'Platform Commission (%)', value: commission, onChange: setCommission, type: 'number', hint: 'Percentage taken from each sale' },
          ]},
        ].map(section => (
          <div key={section.title} style={{ background: '#fff', border: '1px solid #e8eaed', borderRadius: 10, padding: '1.25rem' }}>
            <h2 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#111', marginBottom: '1rem' }}>{section.title}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {section.fields.map(f => (
                <div key={f.label} style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#555' }}>{f.label}</label>
                  <input type={f.type} value={f.value} onChange={e => f.onChange(e.target.value)}
                    style={{ padding: '0.6rem 0.8rem', border: '1px solid #ddd', borderRadius: 7, fontSize: '0.875rem', fontFamily: 'inherit', outline: 'none' }} />
                  {f.hint && <p style={{ fontSize: '0.7rem', color: '#aaa' }}>{f.hint}</p>}
                </div>
              ))}
            </div>
          </div>
        ))}

        <div style={{ background: '#fff', border: '1px solid #e8eaed', borderRadius: 10, padding: '1.25rem' }}>
          <h2 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#111', marginBottom: '1rem' }}>Shipping</h2>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer' }}>
            <input type="checkbox" checked={freeShipping} onChange={e => setFreeShipping(e.target.checked)} style={{ accentColor: '#ff6a00' }} />
            Enable free shipping for all orders
          </label>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e8eaed', borderRadius: 10, padding: '1.25rem' }}>
          <h2 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#111', marginBottom: '1rem' }}>Legal Documents</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {['Terms & Conditions', 'Privacy Policy', 'Refund Policy'].map(doc => (
              <div key={doc} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: '#f8f9fc', borderRadius: 7 }}>
                <span style={{ fontSize: '0.875rem', color: '#333' }}>📄 {doc}</span>
                <button style={{ padding: '0.35rem 0.75rem', border: '1px solid #ddd', borderRadius: 5, background: '#fff', fontSize: '0.78rem', cursor: 'pointer' }}>Edit</button>
              </div>
            ))}
          </div>
        </div>

        <button onClick={save} style={{ padding: '0.75rem', background: '#ff6a00', color: '#fff', border: 'none', borderRadius: 8, fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
          Save Settings
        </button>
      </div>
    </div>
  );
}
