import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ReactNode, useEffect, useState } from "react";

interface AddLinkPopupProps {
  editor: any;
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export function AddLinkPopup({ editor, isOpen, onClose, children }: AddLinkPopupProps) {
  const [displayText, setDisplayText] = useState("");
  const [url, setUrl] = useState("");

  useEffect(() => {
    if (isOpen && editor) {
      const { from, to, empty } = editor.state.selection;
      if (!empty && from !== to) {
        const selectedText = editor.state.doc.textBetween(from, to, " ") || "";
        setDisplayText(selectedText);
      } else {
        setDisplayText("");
        const currentUrl = editor.getAttributes("link").href || "";
        setUrl(currentUrl);
      }
    }
  }, [isOpen, editor]);

  const handleApply = () => {
    if (displayText.trim() && url.trim()) {
      const finalUrl = url.trim().startsWith("http://") || url.trim().startsWith("https://")
        ? url.trim()
        : `https://${url.trim()}`;
      
      if (editor) {
        const { from, to } = editor.state.selection;
        editor.chain().focus();
        if (from !== to) {
          editor
            .chain()
            .deleteRange({ from, to })
            .insertContent({
              type: "text",
              text: displayText.trim(),
              marks: [{ type: "link", attrs: { href: finalUrl } }],
            })
            .run();
        } else {
          editor
            .chain()
            .insertContent({
              type: "text",
              text: displayText.trim(),
              marks: [{ type: "link", attrs: { href: finalUrl } }],
            })
            .run();
        }
      }

      setDisplayText("");
      setUrl("");
      onClose();
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        className="w-[300px] p-4"
        align="start"
        side="bottom"
        sideOffset={5}
      >
        <div className="space-y-4">
          <h4 className="font-medium leading-none">Add Link</h4>
          <div className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="display-text">Display Text *</Label>
              <Input
                id="display-text"
                value={displayText}
                onChange={(e) => setDisplayText(e.target.value)}
                placeholder="Enter display text or select text to use"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="url">URL *</Label>
              <Input
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleApply} disabled={!displayText.trim() || !url.trim()}>
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
