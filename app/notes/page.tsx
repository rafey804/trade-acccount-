'use client';

// =============================================================================
// Notes Page — Trading Notes & Reminders
// Beautiful masonry/column layout with full CRUD + popup editing
// =============================================================================

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Pin,
  PinOff,
  Trash2,
  Edit3,
  X,
  Save,
  StickyNote,
  Tag,
  Clock,
  Sparkles,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Note {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  content: string;
  color: string;
  pinned: boolean;
  tags: string[];
}

// ── Color palette for notes ───────────────────────────────────────────────────

const NOTE_COLORS: { id: string; label: string; bg: string; border: string; dot: string }[] = [
  { id: 'default', label: 'Default',  bg: 'var(--surface)',   border: 'var(--border)',       dot: 'var(--fg-3)' },
  { id: 'gold',    label: 'Gold',     bg: 'rgba(232,184,75,0.08)', border: 'rgba(232,184,75,0.25)', dot: 'var(--gold)' },
  { id: 'green',   label: 'Profit',   bg: 'rgba(34,197,94,0.07)',  border: 'rgba(34,197,94,0.25)',  dot: 'var(--profit)' },
  { id: 'red',     label: 'Loss',     bg: 'rgba(239,68,68,0.07)',  border: 'rgba(239,68,68,0.25)',  dot: 'var(--loss)' },
  { id: 'blue',    label: 'Info',     bg: 'rgba(96,165,250,0.07)', border: 'rgba(96,165,250,0.25)', dot: 'var(--info)' },
  { id: 'purple',  label: 'Strategy', bg: 'rgba(167,139,250,0.07)', border: 'rgba(167,139,250,0.25)', dot: '#A78BFA' },
];

function getColorStyle(colorId: string) {
  return NOTE_COLORS.find((c) => c.id === colorId) ?? NOTE_COLORS[0];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// ── NoteCard ──────────────────────────────────────────────────────────────────

function NoteCard({
  note,
  onClick,
  onDelete,
  onTogglePin,
}: {
  note: Note;
  onClick: () => void;
  onDelete: () => void;
  onTogglePin: () => void;
}) {
  const cs = getColorStyle(note.color);
  const [hovering, setHovering] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{ duration: 0.22 }}
      className="relative rounded-2xl cursor-pointer group overflow-hidden flex flex-col"
      style={{
        background: 'var(--surface)',
        border: `1px solid ${hovering ? cs.dot : 'var(--border)'}`,
        boxShadow: hovering ? 'var(--shadow-hover)' : 'var(--shadow-card)',
        transition: 'border-color 0.2s, box-shadow 0.2s',
      }}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onClick={onClick}
      id={`note-card-${note.id}`}
    >
      {/* Left colored border accent */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-1.5 transition-colors duration-200"
        style={{ background: hovering ? cs.dot : cs.border }}
      />

      {/* Pin indicator */}
      {note.pinned && (
        <div
          className="absolute top-0 right-0 w-0 h-0"
          style={{
            borderTop: `28px solid ${cs.dot}`,
            borderLeft: '28px solid transparent',
            opacity: 0.6,
          }}
        />
      )}

      <div className="p-5 pl-6 flex-1 flex flex-col">
        {/* Color dot + title */}
        <div className="flex items-start gap-2.5 mb-2.5">
          <span
            className="mt-1.5 w-2 h-2 rounded-full shrink-0"
            style={{ background: cs.dot }}
          />
          <h3
            className="font-semibold text-[15px] leading-snug line-clamp-2 flex-1"
            style={{ color: 'var(--fg)' }}
          >
            {note.title}
          </h3>
        </div>

        {/* Content preview */}
        <p
          className="text-[14px] leading-relaxed line-clamp-4 mb-4 flex-1"
          style={{ color: 'var(--fg)', opacity: 0.85 }}
        >
          {note.content}
        </p>

        {/* Tags */}
        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {note.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                style={{
                  background: 'var(--surface-2)',
                  color: 'var(--fg-2)',
                  border: '1px solid var(--border)',
                }}
              >
                #{tag}
              </span>
            ))}
            {note.tags.length > 3 && (
              <span className="text-[11px] font-medium" style={{ color: 'var(--fg-3)' }}>
                +{note.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-3" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="flex items-center gap-1.5" style={{ color: 'var(--fg-3)' }}>
            <Clock size={12} />
            <span className="text-[11px] font-medium">{formatDate(note.updated_at)}</span>
          </div>

          {/* Action buttons — visible on hover */}
          <div
            className="flex items-center gap-1 transition-opacity duration-200"
            style={{ opacity: hovering ? 1 : 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onTogglePin}
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: note.pinned ? cs.dot : 'var(--fg-3)' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              title={note.pinned ? 'Unpin' : 'Pin'}
              id={`pin-note-${note.id}`}
            >
              {note.pinned ? <PinOff size={14} /> : <Pin size={14} />}
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: 'var(--fg-3)' }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'var(--loss-dim)';
                (e.currentTarget as HTMLElement).style.color = 'var(--loss)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'transparent';
                (e.currentTarget as HTMLElement).style.color = 'var(--fg-3)';
              }}
              title="Delete note"
              id={`delete-note-${note.id}`}
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── NoteModal (create / edit / view) ──────────────────────────────────────────

function NoteModal({
  note,
  onClose,
  onSave,
}: {
  note: Note | null;
  onClose: () => void;
  onSave: (data: Partial<Note>) => Promise<void>;
}) {
  const [isEditMode, setIsEditMode] = useState(note === null);
  const [title, setTitle]   = useState(note?.title   ?? '');
  const [content, setContent] = useState(note?.content ?? '');
  const [color, setColor]   = useState(note?.color   ?? 'default');
  const [pinned, setPinned] = useState(note?.pinned  ?? false);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags]     = useState<string[]>(note?.tags ?? []);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const cs = getColorStyle(color);

  const addTag = () => {
    const t = tagInput.trim().toLowerCase().replace(/\s+/g, '-');
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput('');
  };

  const removeTag = (tag: string) => setTags(tags.filter((t) => t !== tag));

  const handleSave = async () => {
    if (!title.trim()) { setError('Title is required'); return; }
    if (!content.trim()) { setError('Content is required'); return; }
    setSaving(true);
    setError('');
    try {
      await onSave({ title, content, color, pinned, tags });
      // If it was a new note, close it. Otherwise, go back to view mode.
      if (!note) {
        onClose();
      } else {
        setIsEditMode(false);
      }
    } catch {
      setError('Failed to save note. Try again.');
    } finally {
      setSaving(false);
    }
  };

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />

        {/* Modal */}
        <motion.div
          className="relative w-full max-w-2xl rounded-2xl flex flex-col"
          style={{
            background: 'var(--surface)',
            border: `1px solid var(--border)`,
            boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
            maxHeight: '90vh',
          }}
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          id="note-modal"
        >
          {/* Header - Colored Top Border Indicator */}
          <div className="h-1.5 w-full" style={{ background: cs.dot }} />
          
          <div
            className="flex items-center justify-between px-6 py-4 shrink-0"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: isEditMode ? 'var(--gold-dim)' : 'var(--surface-2)' }}
              >
                {isEditMode ? (
                  <Edit3 size={15} style={{ color: 'var(--gold)' }} />
                ) : (
                  <StickyNote size={15} style={{ color: cs.dot }} />
                )}
              </div>
              <span className="font-semibold text-[16px]" style={{ color: 'var(--fg)' }}>
                {isEditMode ? (note ? 'Edit Note' : 'New Note') : 'View Note'}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              {!isEditMode && (
                <button
                  onClick={() => setIsEditMode(true)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors"
                  style={{ background: 'var(--surface-2)', color: 'var(--fg)' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--border)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'; }}
                >
                  <Edit3 size={14} />
                  Edit
                </button>
              )}
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                style={{ color: 'var(--fg-3)' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                id="close-note-modal"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            {!isEditMode ? (
              /* ── VIEW MODE ────────────────────────────────────────────── */
              <div className="space-y-6">
                <div className="flex items-start justify-between gap-4">
                  <h1 className="text-2xl sm:text-3xl font-bold leading-tight" style={{ color: 'var(--fg)' }}>
                    {title}
                  </h1>
                  {pinned && (
                    <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full" style={{ background: 'var(--gold-dim)' }}>
                      <Pin size={16} style={{ color: 'var(--gold)' }} />
                    </div>
                  )}
                </div>

                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[12px] font-medium px-3 py-1 rounded-full"
                        style={{
                          background: 'var(--surface-2)',
                          color: 'var(--fg-2)',
                          border: '1px solid var(--border)',
                        }}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                <div 
                  className="text-[15px] sm:text-[16px] leading-relaxed whitespace-pre-wrap"
                  style={{ color: 'var(--fg-2)' }}
                >
                  {content}
                </div>
              </div>
            ) : (
              /* ── EDIT MODE ────────────────────────────────────────────── */
              <div className="space-y-5">
                {/* Title */}
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--fg-3)' }}>
                    Title
                  </label>
                  <input
                    autoFocus
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Note title..."
                    className="w-full rounded-xl px-4 py-3 text-[15px] sm:text-[16px] outline-none transition-all font-medium"
                    style={{
                      background: 'var(--surface-2)',
                      border: `1px solid ${title ? cs.dot : 'var(--border)'}`,
                      color: 'var(--fg)',
                    }}
                    id="note-title-input"
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--fg-3)' }}>
                    Content
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write your important notes here..."
                    rows={10}
                    className="w-full rounded-xl px-4 py-3 text-[14px] sm:text-[15px] outline-none transition-all resize-none"
                    style={{
                      background: 'var(--surface-2)',
                      border: `1px solid ${content ? cs.dot : 'var(--border)'}`,
                      color: 'var(--fg)',
                      lineHeight: 1.7,
                    }}
                    id="note-content-input"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Color Picker */}
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--fg-3)' }}>
                      Color
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {NOTE_COLORS.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => setColor(c.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all"
                          style={{
                            background: color === c.id ? c.bg : 'var(--surface-2)',
                            border: `1px solid ${color === c.id ? c.dot : 'var(--border)'}`,
                            color: color === c.id ? c.dot : 'var(--fg-2)',
                          }}
                          id={`color-picker-${c.id}`}
                        >
                          <span className="w-2.5 h-2.5 rounded-full" style={{ background: c.dot }} />
                          {c.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--fg-3)' }}>
                      <Tag size={11} /> Tags
                    </label>
                    <div className="flex gap-2">
                      <input
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); }}}
                        placeholder="Add tag..."
                        className="flex-1 rounded-xl px-3 py-2 text-[13px] outline-none"
                        style={{
                          background: 'var(--surface-2)',
                          border: '1px solid var(--border)',
                          color: 'var(--fg)',
                        }}
                        id="note-tag-input"
                      />
                      <button
                        onClick={addTag}
                        className="px-4 rounded-xl text-[13px] font-medium transition-colors"
                        style={{
                          background: 'var(--surface-2)',
                          border: '1px solid var(--border)',
                          color: 'var(--fg-2)',
                        }}
                        id="add-tag-btn"
                      >
                        Add
                      </button>
                    </div>
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {tags.map((tag) => (
                          <span
                            key={tag}
                            className="flex items-center gap-1 text-[12px] font-medium px-2.5 py-1 rounded-full"
                            style={{
                              background: 'var(--surface-2)',
                              border: '1px solid var(--border)',
                              color: 'var(--fg-2)',
                            }}
                          >
                            #{tag}
                            <button
                              onClick={() => removeTag(tag)}
                              className="opacity-60 hover:opacity-100 transition-opacity ml-1"
                              id={`remove-tag-${tag}`}
                            >
                              <X size={10} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Pin toggle */}
                <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'var(--surface-2)' }}>
                  <div className="flex flex-col">
                    <span className="text-[14px] font-medium" style={{ color: 'var(--fg)' }}>Pin Note</span>
                    <span className="text-[12px]" style={{ color: 'var(--fg-3)' }}>Keep this note at the top of the list</span>
                  </div>
                  <button
                    onClick={() => setPinned(!pinned)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all"
                    style={{
                      background: pinned ? 'var(--gold-dim)' : 'var(--surface)',
                      border: `1px solid ${pinned ? 'var(--gold-border)' : 'var(--border)'}`,
                      color: pinned ? 'var(--gold)' : 'var(--fg-3)',
                    }}
                    id="pin-toggle-btn"
                  >
                    {pinned ? <Pin size={14} /> : <PinOff size={14} />}
                    {pinned ? 'Pinned' : 'Pin'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions (Only for Edit Mode) */}
          {isEditMode && (
            <div className="px-6 py-4 shrink-0 flex items-center justify-between gap-4" style={{ borderTop: '1px solid var(--border)', background: 'var(--surface-2)' }}>
              {error ? (
                <div className="text-[13px] font-medium" style={{ color: 'var(--loss)' }}>{error}</div>
              ) : <div />}
              
              <div className="flex gap-3">
                <button
                  onClick={() => note ? setIsEditMode(false) : onClose()}
                  className="px-5 py-2.5 rounded-xl text-[14px] font-medium transition-colors"
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    color: 'var(--fg-2)',
                  }}
                  id="cancel-note-btn"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-[14px] font-semibold transition-all shadow-sm"
                  style={{
                    background: saving ? 'var(--surface)' : 'var(--gold)',
                    color: saving ? 'var(--fg-3)' : '#000',
                    border: '1px solid transparent',
                    opacity: saving ? 0.7 : 1,
                  }}
                  id="save-note-btn"
                >
                  {saving ? (
                    <>
                      <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Save Note
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Delete Confirm Modal ──────────────────────────────────────────────────────

function DeleteConfirmModal({ note, onCancel, onConfirm }: {
  note: Note;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="absolute inset-0"
        style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
        onClick={onCancel}
      />
      <motion.div
        className="relative rounded-2xl p-6 w-full max-w-sm"
        style={{
          background: 'var(--surface)',
          border: '1px solid rgba(239,68,68,0.25)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
        }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        id="delete-confirm-modal"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--loss-dim)' }}>
            <Trash2 size={16} style={{ color: 'var(--loss)' }} />
          </div>
          <div>
            <p className="font-semibold text-[14px]" style={{ color: 'var(--fg)' }}>Delete Note</p>
            <p className="text-[12px]" style={{ color: 'var(--fg-3)' }}>This action cannot be undone</p>
          </div>
        </div>
        <p className="text-[13px] mb-5 leading-relaxed" style={{ color: 'var(--fg-2)' }}>
          Delete <strong style={{ color: 'var(--fg)' }}>&ldquo;{note.title}&rdquo;</strong>?
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-medium"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--fg-2)' }}
            id="cancel-delete-btn"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold"
            style={{ background: 'var(--loss)', color: '#fff' }}
            id="confirm-delete-btn"
          >
            Delete
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function NotesPage() {
  const [notes, setNotes]     = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [editNote, setEditNote]   = useState<Note | null | 'new'>(null);
  const [deleteNote, setDeleteNote] = useState<Note | null>(null);

  // ── Fetch ────────────────────────────────────────────────────────────────────

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      const params = search ? `?search=${encodeURIComponent(search)}` : '';
      const res = await fetch(`/api/notes${params}`);
      const json = await res.json();
      if (json.notes) setNotes(json.notes);
    } catch {
      // fail silently
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  // ── Save (create or update) ───────────────────────────────────────────────

  const handleSave = async (data: Partial<Note>) => {
    if (editNote === 'new') {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Save failed');
    } else if (editNote) {
      const res = await fetch('/api/notes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, id: editNote.id }),
      });
      if (!res.ok) throw new Error('Update failed');
    }
    await fetchNotes();
  };

  // ── Delete ────────────────────────────────────────────────────────────────

  const handleDelete = async () => {
    if (!deleteNote) return;
    await fetch('/api/notes', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: deleteNote.id }),
    });
    setDeleteNote(null);
    await fetchNotes();
  };

  // ── Toggle Pin ────────────────────────────────────────────────────────────

  const handleTogglePin = async (note: Note) => {
    await fetch('/api/notes', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: note.id, pinned: !note.pinned }),
    });
    await fetchNotes();
  };

  // ── Derived ───────────────────────────────────────────────────────────────

  const pinnedNotes  = notes.filter((n) => n.pinned);
  const regularNotes = notes.filter((n) => !n.pinned);

  const totalNotes  = notes.length;
  const pinnedCount = pinnedNotes.length;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div
        className="sticky top-0 z-30 px-6 py-4"
        style={{
          background: 'var(--surface)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          {/* Title */}
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'var(--gold-dim)', border: '1px solid var(--gold-border)' }}
            >
              <StickyNote size={17} style={{ color: 'var(--gold)' }} />
            </div>
            <div>
              <h1 className="text-[16px] font-bold" style={{ color: 'var(--fg)' }}>
                Notes
              </h1>
              <p className="text-[11px]" style={{ color: 'var(--fg-3)' }}>
                {totalNotes} note{totalNotes !== 1 ? 's' : ''} · {pinnedCount} pinned
              </p>
            </div>
          </div>

          {/* Search + Add */}
          <div className="flex items-center gap-2 flex-wrap">
            <div
              className="relative flex items-center"
              style={{ minWidth: 200 }}
            >
              <Search
                size={14}
                className="absolute left-3 pointer-events-none"
                style={{ color: 'var(--fg-3)' }}
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search notes..."
                className="pl-9 pr-3 py-2 rounded-xl text-[13px] outline-none w-full"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  color: 'var(--fg)',
                }}
                id="notes-search-input"
              />
            </div>
            <button
              onClick={() => setEditNote('new')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold transition-all hover:scale-105"
              style={{
                background: 'var(--gold)',
                color: '#000',
              }}
              id="add-note-btn"
            >
              <Plus size={15} />
              Add Note
            </button>
          </div>
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-8">

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl animate-pulse"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  height: 180,
                }}
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && notes.length === 0 && (
          <motion.div
            className="flex flex-col items-center justify-center py-24 gap-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <Sparkles size={28} style={{ color: 'var(--gold)' }} />
            </div>
            <div className="text-center">
              <p className="font-semibold text-[15px] mb-1" style={{ color: 'var(--fg)' }}>
                {search ? 'No notes found' : 'No notes yet'}
              </p>
              <p className="text-[13px]" style={{ color: 'var(--fg-3)' }}>
                {search ? 'Try a different search term' : 'Click "Add Note" to write your first trading note'}
              </p>
            </div>
            {!search && (
              <button
                onClick={() => setEditNote('new')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold"
                style={{ background: 'var(--gold)', color: '#000' }}
                id="empty-add-note-btn"
              >
                <Plus size={15} /> Create First Note
              </button>
            )}
          </motion.div>
        )}

        {!loading && notes.length > 0 && (
          <>
            {/* ── Pinned Notes ───────────────────────────────────────────── */}
            {pinnedNotes.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Pin size={13} style={{ color: 'var(--gold)' }} />
                  <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'var(--gold)' }}>
                    Pinned
                  </span>
                  <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                </div>
                <motion.div
                  layout
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                >
                  <AnimatePresence>
                    {pinnedNotes.map((note) => (
                      <NoteCard
                        key={note.id}
                        note={note}
                        onClick={() => setEditNote(note)}
                        onDelete={() => setDeleteNote(note)}
                        onTogglePin={() => handleTogglePin(note)}
                      />
                    ))}
                  </AnimatePresence>
                </motion.div>
              </section>
            )}

            {/* ── All Notes ──────────────────────────────────────────────── */}
            {regularNotes.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <StickyNote size={13} style={{ color: 'var(--fg-3)' }} />
                  <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'var(--fg-3)' }}>
                    {pinnedNotes.length > 0 ? 'Other Notes' : 'All Notes'}
                  </span>
                  <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                </div>
                <motion.div
                  layout
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                >
                  <AnimatePresence>
                    {regularNotes.map((note) => (
                      <NoteCard
                        key={note.id}
                        note={note}
                        onClick={() => setEditNote(note)}
                        onDelete={() => setDeleteNote(note)}
                        onTogglePin={() => handleTogglePin(note)}
                      />
                    ))}
                  </AnimatePresence>
                </motion.div>
              </section>
            )}
          </>
        )}
      </div>

      {/* ── Modals ──────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {editNote !== null && (
          <NoteModal
            key="note-modal"
            note={editNote === 'new' ? null : editNote}
            onClose={() => setEditNote(null)}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteNote && (
          <DeleteConfirmModal
            key="delete-modal"
            note={deleteNote}
            onCancel={() => setDeleteNote(null)}
            onConfirm={handleDelete}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
