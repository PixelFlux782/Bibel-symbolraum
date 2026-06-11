import SymbolNetwork from "@/components/SymbolNetwork";

export const metadata = {
  title: "Symbolnetz",
  description: "Ein lebendiges Bedeutungsnetz biblischer Symbole.",
};

type SymbolnetzPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getSearchParamValue(params: Record<string, string | string[] | undefined>, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

export default async function SymbolnetzPage({ searchParams }: SymbolnetzPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};

  return (
    <SymbolNetwork
      initialUrlState={{
        symbol: getSearchParamValue(resolvedSearchParams, "symbol"),
        lens: getSearchParamValue(resolvedSearchParams, "lens"),
        path: getSearchParamValue(resolvedSearchParams, "path"),
      }}
    />
  );
}
