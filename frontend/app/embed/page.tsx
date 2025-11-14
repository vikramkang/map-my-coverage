import EmbeddedQuestionnaire from "../questionnaire/EmbeddedQuestionnaire";

interface EmbedPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function EmbedPage({ searchParams }: EmbedPageProps) {
  const raw = searchParams?.partner;
  const partner =
    typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : "public";

  return (
    <div style={{ margin: 0, padding: 0 }}>
      <EmbeddedQuestionnaire partner={partner} protectWithLogin={false} />
    </div>
  );
}
