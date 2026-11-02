import type {
  DefaultNodeTypes,
  SerializedLinkNode,
} from "@payloadcms/richtext-lexical";
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";
import {
  type JSXConvertersFunction,
  LinkJSXConverter,
  RichText as LexicalRichText,
} from "@payloadcms/richtext-lexical/react";

/**
 * Where an internal link (a link to another document, chosen in the editor's
 * link drawer) points on the site. Needs the linked doc populated — query
 * with depth >= 1 — otherwise there's no slug and it falls back to "#".
 */
const internalDocToHref = ({ linkNode }: { linkNode: SerializedLinkNode }) => {
  const doc = linkNode.fields.doc;
  if (!doc || typeof doc.value !== "object" || !doc.value) return "#";
  const slug = (doc.value as { slug?: string | null }).slug;
  if (!slug) return "#";
  return doc.relationTo === "products" ? `/products/${slug}` : `/${slug}`;
};

const converters: JSXConvertersFunction<DefaultNodeTypes> = ({
  defaultConverters,
}) => ({
  ...defaultConverters,
  ...LinkJSXConverter({ internalDocToHref }),
});

type Props = {
  data: SerializedEditorState;
  className?: string;
};

/**
 * Renders Lexical rich text with the site's `prose` styles (see globals.css),
 * which inherit font size, weight and colour from the surrounding element.
 * `className` goes on a wrapper so utilities like `text-2xl` set what `.prose`
 * inherits (on the same element, the unlayered `.prose` rules would win).
 */
export function RichText({ data, className }: Props) {
  return (
    <div className={className}>
      <LexicalRichText data={data} converters={converters} className="prose" />
    </div>
  );
}
