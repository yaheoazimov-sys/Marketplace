'use client';

import React, { useEffect, useState, useCallback } from 'react';
import styles from './CategoryTree.module.css';

export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  icon?: string | null;
  order?: number;
}

interface TreeNode extends Category {
  children: TreeNode[];
}

interface Props {
  selected?: string;
  onSelect: (id: string) => void;
  compact?: boolean; // sidebar mode vs full page
}

function buildTree(cats: Category[]): TreeNode[] {
  const map = new Map<string, TreeNode>();
  cats.forEach(c => map.set(c.id, { ...c, children: [] }));
  const roots: TreeNode[] = [];
  map.forEach(node => {
    if (node.parentId && map.has(node.parentId)) {
      map.get(node.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  });
  // sort by order
  const sort = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
    nodes.forEach(n => sort(n.children));
  };
  sort(roots);
  return roots;
}

function TreeNodeItem({ node, selected, onSelect, depth = 0, defaultOpen }: {
  node: TreeNode; selected?: string; onSelect: (id: string) => void; depth?: number; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen || depth === 0);
  const hasChildren = node.children.length > 0;
  const isSelected = selected === node.id;

  return (
    <div className={styles.nodeWrap}>
      <div
        className={`${styles.node} ${isSelected ? styles.nodeSelected : ''}`}
        style={{ paddingLeft: `${0.75 + depth * 1.1}rem` }}
        onClick={() => { onSelect(node.id); if (hasChildren) setOpen(o => !o); }}
      >
        {hasChildren ? (
          <span className={`${styles.arrow} ${open ? styles.arrowOpen : ''}`}>›</span>
        ) : (
          <span className={styles.arrowPlaceholder} />
        )}
        {node.icon && <span className={styles.icon}>{node.icon}</span>}
        <span className={styles.label}>{node.name}</span>
        {hasChildren && <span className={styles.count}>{node.children.length}</span>}
      </div>
      {hasChildren && open && (
        <div className={styles.children}>
          {node.children.map(child => (
            <TreeNodeItem key={child.id} node={child} selected={selected} onSelect={onSelect} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CategoryTree({ selected, onSelect, compact = false }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/categories');
      const d = await res.json();
      setCategories(d.categories || []);
    } catch { setCategories([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const tree = buildTree(categories);

  if (loading) return <div className={styles.loading}>Loading...</div>;

  return (
    <div className={`${styles.tree} ${compact ? styles.compact : ''}`}>
      <div
        className={`${styles.node} ${!selected || selected === 'all' ? styles.nodeSelected : ''}`}
        style={{ paddingLeft: '0.75rem' }}
        onClick={() => onSelect('all')}
      >
        <span className={styles.arrowPlaceholder} />
        <span className={styles.icon}>✨</span>
        <span className={styles.label}>All Products</span>
      </div>
      {tree.map(root => (
        <TreeNodeItem key={root.id} node={root} selected={selected} onSelect={onSelect} depth={0} defaultOpen />
      ))}
    </div>
  );
}

// Utility: get all descendant IDs of a category (for filtering)
export function getDescendantIds(categories: Category[], rootId: string): string[] {
  const result: string[] = [rootId];
  const queue = [rootId];
  while (queue.length) {
    const current = queue.shift()!;
    const children = categories.filter(c => c.parentId === current);
    children.forEach(c => { result.push(c.id); queue.push(c.id); });
  }
  return result;
}

