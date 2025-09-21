"use client";

import { Shape } from "@/types/whiteboard-types";
import { useCallback, useEffect, useRef, useState } from "react";

interface TextEditorProps {
  shape: Shape;
  onTextUpdate: (text: string) => void;
  onFinishEditing: () => void;
}

export default function TextEditor({ shape, onTextUpdate, onFinishEditing }: TextEditorProps) {
  const [text, setText] = useState(shape.text || '');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fontSize = shape.fontSize || 24;

  // Auto-resize textarea height based on content
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.max(textarea.scrollHeight, fontSize + 4) + 'px';
    }
  }, [fontSize]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.focus();
      textarea.select();
      adjustTextareaHeight();
    }
  }, [adjustTextareaHeight]);

  useEffect(() => {
    adjustTextareaHeight();
  }, [text, adjustTextareaHeight]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Allow Shift+Enter for new lines, but Enter alone finishes editing
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      finishEditing();
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      finishEditing();
    }
    // Stop event propagation to prevent canvas interactions
    e.stopPropagation();
  };

  const handleBlur = () => {
    finishEditing();
  };

  const finishEditing = () => {
    onTextUpdate(text);
    onFinishEditing();
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    e.stopPropagation();
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    e.stopPropagation();
  };

  return (
    <textarea
      ref={textareaRef}
      value={text}
      onChange={handleTextChange}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className={`absolute border-none outline-none resize-none bg-transparent p-0 m-0 leading-[1.2] z-[1000] whitespace-nowrap overflow-visible font-normaltext-[${fontSize}px] font-caveat`}
      style={{
        left: shape.x,
        top: shape.y,
        width: Math.max(shape.width, 200),
        minHeight: fontSize + 4,
        color: shape.strokeColor || '#3B82F6',
        textShadow: 'none',
        wordWrap: 'normal',
      }}
      autoFocus
    />
  );
}