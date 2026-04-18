'use client';

import React, { useState, useRef, useCallback } from 'react';
import styles from './ImageUrlPicker.module.css';

interface Props {
  images: string[];
  onChange: (images: string[]) => void;
  max?: number;
}

type ImgStatus = 'loading' | 'ok' | 'error';

const UNSPLASH_SUGGESTIONS = [
  { label: 'Fashion', query: 'fashion clothing apparel' },
  { label: 'Electronics', query: 'electronics gadgets technology' },
  { label: 'Shoes', query: 'shoes sneakers footwear' },
  { label: 'Bags', query: 'bag handbag leather' },
  { label: 'Watch', query: 'watch luxury timepiece' },
  { label: 'Food', query: 'food gourmet delicious' },
  { label: 'Sports', query: 'sports fitness gym' },
  { label: 'Home', query: 'home interior decor' },
];

function validateUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return ['http:', 'https:'].includes(u.protocol);
  } catch { return false; }
}

export default function ImageUrlPicker({ images, onChange, max = 5 }: Props) {
  const [input, setInput] = useState('');
  const [inputError, setInputError] = useState('');
  const [statuses, setStatuses] = useState<Record<string, ImgStatus>>({});
  const [dragging, setDragging] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const setStatus = (url: string, s: ImgStatus) =>
    setStatuses(prev => ({ ...prev, [url]: s }));

  const addImage = useCallback((url: string) => {
    const trimmed = url.trim();
    if (!trimmed) return;
    if (!validateUrl(trimmed)) { setInputError('Please enter a valid URL (must start with http:// or https://)'); return; }
    if (images.includes(trimmed)) { setInputError('This image is already added'); return; }
    if (images.length >= max) { setInputError(`Maximum ${max} images allowed`); return; }
    setInputError('');
    setStatus(trimmed, 'loading');
    onChange([...images, trimmed]);
    setInput('');
    inputRef.current?.focus();
  }, [images, max, onChange]);

  const removeImage = (idx: number) => {
    const url = images[idx];
    const next = images.filter((_, i) => i !== idx);
    onChange(next);
    setStatuses(prev => { const n = { ...prev }; delete n[url]; return n; });
  };

  const moveToFirst = (idx: number) => {
    if (idx === 0) return;
    const next = [...images];
    const [item] = next.splice(idx, 1);
    next.unshift(item);
    onChange(next);
  };

  // Drag reorder
  const handleDragStart = (i: number) => setDragging(i);
  const handleDragOver = (e: React.DragEvent, i: number) => { e.preventDefault(); setDragOver(i); };
  const handleDrop = (e: React.DragEvent, i: number) => {
    e.preventDefault();
    if (dragging === null || dragging === i) { setDragging(null); setDragOver(null); return; }
    const next = [...images];
    const [item] = next.splice(dragging, 1);
    next.splice(i, 0, item);
    onChange(next);
    setDragging(null); setDragOver(null);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); addImage(input); }
  };

  const openUnsplash = (query: string) => {
    window.open(`https://unsplash.com/s/photos/${encodeURIComponent(query)}`, '_blank');
  };

  return (
    <div className={styles.wrap}>
      {/* Preview grid */}
      {images.length > 0 && (
        <div className={styles.grid}>
          {images.map((url, i) => (
            <div
              key={url}
              className={`${styles.slot} ${i === 0 ? styles.slotMain : ''} ${dragging === i ? styles.slotDragging : ''} ${dragOver === i ? styles.slotDragOver : ''}`}
              draggable
              onDragStart={() => handleDragStart(i)}
              onDragOver={e => handleDragOver(e, i)}
              onDrop={e => handleDrop(e, i)}
              onDragEnd={() => { setDragging(null); setDragOver(null); }}
            >
              {/* Image */}
              {statuses[url] !== 'error' ? (
                <img
                  src={url}
                  alt={`Image ${i + 1}`}
                  className={`${styles.img} ${statuses[url] === 'loading' ? styles.imgLoading : ''}`}
                  onLoad={() => setStatus(url, 'ok')}
                  onError={() => setStatus(url, 'error')}
                />
              ) : (
                <div className={styles.imgError}>
                  <span>⚠️</span>
                  <p>Failed to load</p>
                </div>
              )}

              {/* Loading spinner */}
              {statuses[url] === 'loading' && (
                <div className={styles.spinner}><div className={styles.spinnerInner} /></div>
              )}

              {/* Badges */}
              {i === 0 && <span className={styles.mainBadge}>Main</span>}
              <span className={styles.numBadge}>{i + 1}</span>

              {/* Actions */}
              <div className={styles.slotActions}>
                {i !== 0 && (
                  <button type="button" className={styles.slotBtn} onClick={() => moveToFirst(i)} title="Set as main">⭐</button>
                )}
                <button type="button" className={styles.slotBtnDanger} onClick={() => removeImage(i)} title="Remove">✕</button>
              </div>

              {/* Drag handle */}
              <div className={styles.dragHandle} title="Drag to reorder">⠿</div>
            </div>
          ))}

          {/* Empty slot */}
          {images.length < max && (
            <div className={styles.emptySlot} onClick={() => inputRef.current?.focus()}>
              <span>+</span>
              <p>Add photo</p>
            </div>
          )}
        </div>
      )}

      {images.length === 0 && (
        <div className={styles.emptyState} onClick={() => inputRef.current?.focus()}>
          <div className={styles.emptyIcon}>🖼️</div>
          <p className={styles.emptyTitle}>No images yet</p>
          <p className={styles.emptySub}>Add image URLs below. Up to {max} images.</p>
        </div>
      )}

      {/* URL input */}
      <div className={styles.inputSection}>
        <p className={styles.inputLabel}>Add image by URL</p>
        <div className={styles.inputRow}>
          <div className={styles.inputWrap}>
            <span className={styles.inputIcon}>🔗</span>
            <input
              ref={inputRef}
              className={styles.input}
              value={input}
              onChange={e => { setInput(e.target.value); setInputError(''); }}
              onKeyDown={handleKey}
              placeholder="https://images.unsplash.com/photo-..."
              disabled={images.length >= max}
            />
            {input && (
              <button type="button" className={styles.clearInput} onClick={() => { setInput(''); setInputError(''); }}>✕</button>
            )}
          </div>
          <button
            type="button"
            className={styles.addBtn}
            onClick={() => addImage(input)}
            disabled={!input.trim() || images.length >= max}
          >
            Add
          </button>
        </div>
        {inputError && <p className={styles.inputError}>⚠ {inputError}</p>}
        {images.length >= max && <p className={styles.limitNote}>Maximum {max} images reached</p>}
      </div>

      {/* Unsplash quick search */}
      <div className={styles.unsplashSection}>
        <p className={styles.unsplashLabel}>
          <span>💡</span>
          Find free images on{' '}
          <a href="https://unsplash.com" target="_blank" rel="noreferrer" className={styles.unsplashLink}>Unsplash.com</a>
          {' '}— copy the image URL and paste above
        </p>
        <div className={styles.suggestions}>
          {UNSPLASH_SUGGESTIONS.map(s => (
            <button
              key={s.label}
              type="button"
              className={styles.suggestion}
              onClick={() => openUnsplash(s.query)}
            >
              {s.label} →
            </button>
          ))}
        </div>
      </div>

      {/* Instructions */}
      {images.length > 1 && (
        <p className={styles.hint}>💡 Drag images to reorder · Click ⭐ to set as main photo</p>
      )}
    </div>
  );
}
