import Link from '@tiptap/extension-link';
import { Plugin, PluginKey } from '@tiptap/pm/state';

export const CustomLink = Link.extend({
  inclusive() {
    return false;
  },

  addProseMirrorPlugins() {
    const parentPlugins = this.parent?.() || [];
    
    return [
      ...parentPlugins,
      new Plugin({
        key: new PluginKey('exitLinkOnSpace'),
        props: {
          handleKeyDown: (view, event) => {
            if (event.key === ' ' || event.code === 'Space') {
              const { state } = view;
              const { selection } = state;
              const { $from } = selection;
              
              const linkMark = state.schema.marks.link;
              const hasLink = linkMark.isInSet($from.marks());
              
              if (hasLink) {
                const tr = state.tr;
                tr.removeStoredMark(linkMark);
                view.dispatch(tr);
              }
            }
            return false;
          },
        },
      }),
    ];
  },
  
  addAttributes() {
    return {
      ...this.parent?.(),
      href: {
        default: null,
      },
      target: {
        default: null,
      },
    };
  },
}).configure({
  openOnClick: false,
  autolink: false,
  HTMLAttributes: {
    class: 'text-blue-600 underline cursor-pointer',
  },
});