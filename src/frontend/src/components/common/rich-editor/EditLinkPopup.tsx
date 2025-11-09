import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";

interface EditLinkPopupProps {
  editor: any;
  isOpen: boolean;
  onClose: () => void;
  initialText: string;
  initialUrl: string;
  position: { top: number; left: number } | null;
}

function EditLinkPopup({ editor, isOpen, onClose, initialText, initialUrl, position }: EditLinkPopupProps) {
  const [displayText, setDisplayText] = useState(initialText);
  const [url, setUrl] = useState(initialUrl);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    setDisplayText(initialText);
    setUrl(initialUrl);
    setIsEditMode(false);
  }, [initialText, initialUrl, isOpen]);

  const handleSave = () => {
    if (displayText.trim() && url.trim()) {
      const finalUrl = url.trim().startsWith("http://") || url.trim().startsWith("https://")
        ? url.trim()
        : `https://${url.trim()}`;
      
      if (editor) {
        const { from, to } = editor.state.selection;
        editor
          .chain()
          .focus()
          .deleteRange({ from, to })
          .insertContent({
            type: "text",
            text: displayText.trim(),
            marks: [{ type: "link", attrs: { href: finalUrl } }],
          })
          .run();
      }

      setIsEditMode(false);
      onClose();
    }
  };

  const handleRemove = () => {
    if (editor) {
      editor.chain().focus().unsetLink().run();
    }
    onClose();
  };

  const handleUrlClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  if (!isOpen || !position) return null;

  return (
    <div
      className="fixed bg-white border border-gray-200 rounded-lg shadow-xl w-[320px] p-4"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        zIndex: 9999,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="space-y-4">
        <h4 className="font-medium leading-none">
          {isEditMode ? "Edit Link" : "Link Info"}
        </h4>
        
        {isEditMode ? (
          <>
            <div className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="edit-display-text">Display Text *</Label>
                <Input
                  id="edit-display-text"
                  value={displayText}
                  onChange={(e) => setDisplayText(e.target.value)}
                  placeholder="Enter display text"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="edit-url">URL *</Label>
                <Input
                  id="edit-url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setDisplayText(initialText);
                  setUrl(initialUrl);
                  setIsEditMode(false);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={!displayText.trim() || !url.trim()}>
                Save
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs text-gray-500">Display Text</Label>
                <div className="text-sm font-medium">{displayText}</div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-gray-500">URL</Label>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleUrlClick}
                  className="text-sm text-blue-600 hover:text-blue-800 underline break-all block"
                >
                  {url}
                </a>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleRemove}>
                Remove
              </Button>
              <Button onClick={() => setIsEditMode(true)}>
                Edit
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default EditLinkPopup;