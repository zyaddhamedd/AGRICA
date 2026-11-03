export function JsonLd({ data }: { readonly data: unknown }): React.JSX.Element {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
