/**
 * Structured data for search engines (schema.org JSON-LD). The JSON is
 * escaped so no value can close the <script> tag: "<" becomes <.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} />;
}
