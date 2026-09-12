import { useEffect, useState, useCallback, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import FontFamily from '@tiptap/extension-font-family';
import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { useTranslation } from 'react-i18next';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
  Type,
  Palette,
  Keyboard,
} from 'lucide-react';
import { CURATED_FONTS, loadFontDynamically } from '../../lib/fontLoader';
import {
  AVAILABLE_INPUT_METHODS,
  transliterateAvroWord,
  getActiveInputMethodId,
  setActiveInputMethodId,
} from '../../lib/inputMethods';
import type { ThemeDefinition } from '../../types';
import { sanitizeLetterHtml } from '../../services/letterService';

interface RichEditorProps {
  content: string;
  onChange: (html: string, plainText: string) => void;
  activeTheme?: ThemeDefinition;
  placeholder?: string;
  disabled?: boolean;
}

const STORAGE_KEY_INPUT_METHOD = 'dakpion:input_method';
const STORAGE_KEY_FONT = 'dakpion:editor_font';

// Custom Avro Phonetic ProseMirror Extension for live word-boundary transliteration
const AvroPhoneticExtension = Extension.create({
  name: 'avroPhonetic',
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('avroPhoneticPlugin'),
        props: {
          handleKeyDown(view, event) {
            if (getActiveInputMethodId() !== 'avro') return false;

            // When space, enter, or punctuation is pressed, check preceding word
            const triggerKeys = [' ', 'Enter', '.', ',', '!', '?', ';', ':', '।', '-'];
            if (triggerKeys.includes(event.key)) {
              const { state } = view;
              const { selection } = state;
              const { $from } = selection;

              // Find start of current word before cursor
              const textBefore = $from.parent.textBetween(
                0,
                $from.parentOffset,
                undefined,
                '\ufffc',
              );
              const match = textBefore.match(/([a-zA-Z0-9`^:]+)$/);

              if (match && match[1]) {
                const rawWord = match[1];
                const banglaWord = transliterateAvroWord(rawWord);

                if (banglaWord !== rawWord) {
                  const startPos = $from.pos - rawWord.length;
                  const endPos = $from.pos;
                  const tr = state.tr.replaceWith(
                    startPos,
                    endPos,
                    state.schema.text(banglaWord),
                  );
                  view.dispatch(tr);
                  // Let default key event proceed to insert the space/punctuation
                }
              }
            }
            return false;
          },
        },
      }),
    ];
  },
});

export function RichEditor({
  content,
  onChange,
  activeTheme,
  placeholder,
  disabled = false,
}: RichEditorProps) {
  const { t } = useTranslation();
  const [inputMethodId, setInputMethodId] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_INPUT_METHOD) || 'avro';
    setActiveInputMethodId(saved);
    return saved;
  });
  const [activeFontId, setActiveFontId] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY_FONT) || 'kalpana-unicode';
  });

  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [fontPickerOpen, setFontPickerOpen] = useState(false);
  const colorPickerRef = useRef<HTMLDivElement>(null);
  const fontPickerRef = useRef<HTMLDivElement>(null);

  const paperBg = activeTheme?.palette.paperBg ?? '#F2E7D0';
  const themeInk = activeTheme?.palette.ink ?? '#241C14';

  const curatedColors = [
    { label: t('editor.themeInk', 'Theme Default'), value: themeInk },
    { label: t('editor.charcoal', 'Charcoal'), value: '#241C14' },
    { label: t('editor.postalNavy', 'Postal Navy'), value: '#16233D' },
    { label: t('editor.waxSeal', 'Wax Seal'), value: '#A63D40' },
    { label: t('editor.sepia', 'Vintage Sepia'), value: '#5C4033' },
    { label: t('editor.gold', 'Postmark Gold'), value: '#C9A227' },
    { label: t('editor.forest', 'Forest Green'), value: '#2D4A3E' },
  ];

  const handleInputMethodChange = (newMethodId: string) => {
    setInputMethodId(newMethodId);
    setActiveInputMethodId(newMethodId);
    localStorage.setItem(STORAGE_KEY_INPUT_METHOD, newMethodId);
  };

  // Load selected font dynamically
  useEffect(() => {
    const selected = CURATED_FONTS.find((f) => f.id === activeFontId);
    if (selected) {
      loadFontDynamically(selected);
      localStorage.setItem(STORAGE_KEY_FONT, activeFontId);
    }
  }, [activeFontId]);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (colorPickerRef.current && !colorPickerRef.current.contains(e.target as Node)) {
        setColorPickerOpen(false);
      }
      if (fontPickerRef.current && !fontPickerRef.current.contains(e.target as Node)) {
        setFontPickerOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      Color,
      FontFamily.configure({
        types: ['textStyle'],
      }),
      AvroPhoneticExtension,
    ],
    content,
    editable: !disabled,
    onUpdate({ editor: ed }) {
      const rawHtml = ed.getHTML();
      const sanitized = sanitizeLetterHtml(rawHtml);
      const plainText = ed.getText();
      onChange(sanitized, plainText);
    },
  });

  // Sync font family to editor on change
  const applyFont = useCallback(
    (font: (typeof CURATED_FONTS)[0]) => {
      loadFontDynamically(font);
      setActiveFontId(font.id);
      setFontPickerOpen(false);
      if (editor) {
        editor.chain().focus().setFontFamily(font.fontFamily).run();
      }
    },
    [editor],
  );

  const applyColor = useCallback(
    (color: string) => {
      setColorPickerOpen(false);
      if (editor) {
        editor.chain().focus().setColor(color).run();
      }
    },
    [editor],
  );

  const activeFont = CURATED_FONTS.find((f) => f.id === activeFontId) || CURATED_FONTS[0];

  return (
    <div
      className="rounded-2xl border border-parchment/15 shadow-[0_20px_45px_-20px_rgba(0,0,0,0.5)] transition-all overflow-hidden"
      style={{ backgroundColor: paperBg }}
    >
      {/* Vintage Toolbar */}
      <div
        className="flex flex-wrap items-center justify-between gap-1.5 border-b border-black/10 px-4 py-2.5 bg-black/5"
        style={{ color: themeInk }}
      >
        {/* Left: Styling Controls */}
        <div className="flex flex-wrap items-center gap-1">
          {/* Font Family Picker */}
          <div className="relative" ref={fontPickerRef}>
            <button
              type="button"
              onClick={() => setFontPickerOpen((v) => !v)}
              className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium hover:bg-black/10 transition-colors"
              title={t('editor.fontFamily', 'Font family')}
            >
              <Type className="h-3.5 w-3.5" />
              <span className="max-w-[100px] truncate">{activeFont.name.split(' ')[0]}</span>
            </button>

            {fontPickerOpen && (
              <div
                className="absolute left-0 top-full mt-1 z-30 w-56 rounded-xl border border-parchment/20 bg-ink-2 p-1.5 shadow-2xl text-parchment"
              >
                <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-parchment/40">
                  {t('editor.selectFont', 'Choose Font')}
                </div>
                {CURATED_FONTS.map((font) => (
                  <button
                    key={font.id}
                    type="button"
                    onClick={() => applyFont(font)}
                    className={`flex w-full flex-col rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors hover:bg-ink-3 ${
                      activeFontId === font.id ? 'bg-ink-3 text-gold font-semibold' : ''
                    }`}
                  >
                    <span>{font.name}</span>
                    <span className="text-[10px] text-parchment/50" style={{ fontFamily: font.fontFamily }}>
                      {font.previewSample}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="h-4 w-[1px] bg-black/15 mx-0.5" />

          {/* Bold, Italic, Underline */}
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleBold().run()}
            className={`rounded p-1 text-xs hover:bg-black/10 transition-colors ${
              editor?.isActive('bold') ? 'bg-black/20 font-bold' : ''
            }`}
            title="Bold (Ctrl+B)"
          >
            <Bold className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            className={`rounded p-1 text-xs hover:bg-black/10 transition-colors ${
              editor?.isActive('italic') ? 'bg-black/20 font-bold' : ''
            }`}
            title="Italic (Ctrl+I)"
          >
            <Italic className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleUnderline().run()}
            className={`rounded p-1 text-xs hover:bg-black/10 transition-colors ${
              editor?.isActive('underline') ? 'bg-black/20 font-bold' : ''
            }`}
            title="Underline (Ctrl+U)"
          >
            <UnderlineIcon className="h-3.5 w-3.5" />
          </button>

          <div className="h-4 w-[1px] bg-black/15 mx-0.5" />

          {/* Color Picker */}
          <div className="relative" ref={colorPickerRef}>
            <button
              type="button"
              onClick={() => setColorPickerOpen((v) => !v)}
              className="flex items-center gap-1 rounded p-1 text-xs hover:bg-black/10 transition-colors"
              title={t('editor.textColor', 'Text Color')}
            >
              <Palette className="h-3.5 w-3.5" />
            </button>

            {colorPickerOpen && (
              <div
                className="absolute left-0 top-full mt-1 z-30 w-44 rounded-xl border border-parchment/20 bg-ink-2 p-2 shadow-2xl text-parchment"
              >
                <div className="mb-1 px-1 text-[10px] font-semibold uppercase tracking-wider text-parchment/40">
                  {t('editor.palette', 'Ink Palette')}
                </div>
                <div className="grid grid-cols-4 gap-1.5 p-1">
                  {curatedColors.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => applyColor(c.value)}
                      className="h-6 w-6 rounded-full border border-white/20 shadow-sm transition-transform hover:scale-110"
                      style={{ backgroundColor: c.value }}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="h-4 w-[1px] bg-black/15 mx-0.5" />

          {/* Alignment */}
          <button
            type="button"
            onClick={() => editor?.chain().focus().setTextAlign('left').run()}
            className={`rounded p-1 text-xs hover:bg-black/10 transition-colors ${
              editor?.isActive({ textAlign: 'left' }) ? 'bg-black/20' : ''
            }`}
            title="Align Left"
          >
            <AlignLeft className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().setTextAlign('center').run()}
            className={`rounded p-1 text-xs hover:bg-black/10 transition-colors ${
              editor?.isActive({ textAlign: 'center' }) ? 'bg-black/20' : ''
            }`}
            title="Align Center"
          >
            <AlignCenter className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().setTextAlign('right').run()}
            className={`rounded p-1 text-xs hover:bg-black/10 transition-colors ${
              editor?.isActive({ textAlign: 'right' }) ? 'bg-black/20' : ''
            }`}
            title="Align Right"
          >
            <AlignRight className="h-3.5 w-3.5" />
          </button>

          <div className="h-4 w-[1px] bg-black/15 mx-0.5" />

          {/* Undo / Redo */}
          <button
            type="button"
            onClick={() => editor?.chain().focus().undo().run()}
            disabled={!editor?.can().undo()}
            className="rounded p-1 text-xs hover:bg-black/10 transition-colors disabled:opacity-30"
            title="Undo"
          >
            <Undo className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().redo().run()}
            disabled={!editor?.can().redo()}
            className="rounded p-1 text-xs hover:bg-black/10 transition-colors disabled:opacity-30"
            title="Redo"
          >
            <Redo className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Right: Pluggable Input Method Switcher */}
        <div className="flex items-center gap-1.5">
          <Keyboard className="h-3.5 w-3.5 opacity-60" />
          <div className="flex items-center rounded-lg bg-black/10 p-0.5 text-xs">
            {AVAILABLE_INPUT_METHODS.map((im) => (
              <button
                key={im.id}
                type="button"
                onClick={() => handleInputMethodChange(im.id)}
                className={`rounded-md px-2 py-0.5 text-[11px] font-medium transition-all ${
                  inputMethodId === im.id
                    ? 'bg-ink text-parchment shadow-sm'
                    : 'text-current opacity-70 hover:opacity-100'
                }`}
              >
                {im.nativeName}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tiptap Editable Area */}
      <div
        className="bg-paper-grain p-6 sm:p-8 min-h-[280px] cursor-text"
        onClick={() => editor?.chain().focus().run()}
      >
        <EditorContent
          editor={editor}
          className="tiptap-dakpion prose prose-sm sm:prose-base focus:outline-none min-h-[220px]"
          style={{
            color: themeInk,
            fontFamily: activeFont.fontFamily,
          }}
          placeholder={placeholder}
        />
      </div>
    </div>
  );
}
