import React, { useCallback, useEffect, useState } from "react";
import { Editor, useEditorState } from "@tiptap/react";
import { Button } from "@/components/ui/button";
import { AddLinkPopup } from "./AddLinkPopup";
import { Link2 } from "lucide-react";
import EditLinkPopup from "./EditLinkPopup";

interface LinkButtonProps {
  editor: Editor | null;
}

export default function LinkButton({ editor }: LinkButtonProps) {
  const [isAddPopupOpen, setIsAddPopupOpen] = useState(false);
  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
  const [editLinkData, setEditLinkData] = useState({
    text: "",
    url: "",
    position: null as { top: number; left: number } | null,
  });

  const handleLinkClick = useCallback((event: MouseEvent) => {
    if (!editor) return;
    
    const target = event.target as HTMLElement;
    
    if (target.tagName === "A" || target.closest("a")) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      
      const linkElement = (target.tagName === "A" ? target : target.closest("a")) as HTMLAnchorElement;
      if (linkElement) {
        const href = linkElement.getAttribute("href") || "";
        const text = linkElement.textContent || "";
        
        const rect = linkElement.getBoundingClientRect();
        
        try {
          const pos = editor.view.posAtDOM(linkElement, 0);
          const endPos = pos + text.length;
          editor.chain().focus().setTextSelection({ from: pos, to: endPos }).run();
        } catch (e) {
          console.error("Error setting selection:", e);
        }
        
        setEditLinkData({
          text,
          url: href,
          position: {
            top: rect.bottom + window.scrollY + 5,
            left: rect.left + window.scrollX,
          },
        });
        setIsEditPopupOpen(true);
      }
      
      return false;
    }
  }, [editor]);

  useEffect(() => {
    if (!editor) return;

    const editorElement = editor.view.dom;
    
    editorElement.addEventListener("mousedown", handleLinkClick, true);
    editorElement.addEventListener("click", handleLinkClick, true);

    return () => {
      editorElement.removeEventListener("mousedown", handleLinkClick, true);
      editorElement.removeEventListener("click", handleLinkClick, true);
    };
  }, [editor, handleLinkClick]);

  const editorState = useEditorState({
    editor,
    selector: (ctx) => {
      if (!ctx.editor) return { isLink: false };
      return {
        isLink: ctx.editor.isActive("link"),
      };
    },
  });

  if (!editor) return null;

  return (
    <>
      <AddLinkPopup
        editor={editor}
        isOpen={isAddPopupOpen}
        onClose={() => setIsAddPopupOpen(false)}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            setIsAddPopupOpen(true);
          }}
          className={editorState?.isLink ? "is-active text-blue-500" : "text-gray-500"}
        >
          <Link2 className="h-5 w-5 text-[color:var(--foreground)]" />
        </Button>
      </AddLinkPopup>

      <EditLinkPopup
        editor={editor}
        isOpen={isEditPopupOpen}
        onClose={() => {
          setIsEditPopupOpen(false);
          setEditLinkData({ text: "", url: "", position: null });
        }}
        initialText={editLinkData.text}
        initialUrl={editLinkData.url}
        position={editLinkData.position}
      />
    </>
  );
}