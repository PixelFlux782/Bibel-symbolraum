"use client";

import Image from "next/image";
import { useState, type CSSProperties, type FormEvent } from "react";
import {
  parseStoredReflections,
  REFLECTION_STORAGE_KEY,
  type StoredReflection,
} from "@/lib/reflections";
import {
  getConnectedNodes,
  getEdgesForNode,
  getMostImportantRelation,
  getNodeById,
  getStrongestConnections,
  waterSymbolGraph,
  type MeaningEdge,
  type SymbolNode,
} from "@/lib/symbolism";
import { SYMBOL_ENTRIES, type SymbolEntry } from "@/lib/symbolraum/symbols";

type WaterSymbolEntry = SymbolEntry & {
  letters?: NonNullable<SymbolEntry["letterBreakdown"]>;
};

const WATER_SYMBOL = SYMBOL_ENTRIES.find((symbol) => symbol.id === "wasser");

const FALLBACK_SYMBOL: SymbolEntry = {
  id: "wasser",
  name: "Wasser",
  hebrew: "מים",
  transliteration: "Majim",
  shortMeaning: "Tiefe, Leben, Reinigung, Grenze, Übergang und neue Geburt.",
  poeticIntro:
    "Wasser ist Anfang und Schwelle. Es trägt, trennt, reinigt und ruft in einen Raum, den man nicht trocken durchquert.",
  biblicalLayer:
    "Wasser steht am Anfang, bevor etwas fest wird. Es trägt Leben, aber es markiert auch die Grenze: Wer hindurchgeht, kommt nicht unverändert zurück.",
  hebrewLayer:
    "Majim klingt wie ein Wort aus Bewegung. Man kann vorsichtig sagen: Es hält offene Tiefe, einen kleinen Anfang und eine verborgene Tiefe zusammen.",
  lifeLayer:
    "Wasser fragt nicht nach deiner Erklärung. Es berührt, was schwer geworden ist, und erinnert dich daran, dass Wandlung oft leise beginnt.",
  reflectionQuestion: "Wo zeigt sich in deinem Leben gerade eine Grenze, die vielleicht auch ein Übergang werden kann?",
  letterBreakdown: [
    {
      letter: "מ",
      name: "Mem",
      meaning: "Mem wird traditionell mit Wasser verbunden. Es öffnet den Blick auf Tiefe, Herkunft und das noch Ungeformte.",
    },
    {
      letter: "י",
      name: "Jod",
      meaning: "Jod ist klein und doch nicht leer. Es kann an den ersten Punkt erinnern, an den leisen Beginn einer Bewegung.",
    },
    {
      letter: "ם",
      name: "Finales Mem",
      meaning: "Das finale Mem schließt die Form. Die Tiefe verschwindet nicht; sie wird zu einem inneren Raum.",
    },
  ],
  verses: [],
  imageAssets: [
    {
      src: "/Visuals/wasser_cinema_hero.png",
      alt: "Dunkler cineastischer Wasserraum",
      role: "hero",
    },
    {
      src: "/Visuals/wasser_interface_backround.png",
      alt: "Atmosphärischer Wasserraum",
      role: "background",
    },
  ],
};

const WATER_ROOM_SYMBOL = {
  ...FALLBACK_SYMBOL,
  ...WATER_SYMBOL,
  letterBreakdown: WATER_SYMBOL?.letterBreakdown ?? FALLBACK_SYMBOL.letterBreakdown,
  verses: WATER_SYMBOL?.verses ?? FALLBACK_SYMBOL.verses,
  imageAssets: WATER_SYMBOL?.imageAssets ?? FALLBACK_SYMBOL.imageAssets,
};

const FALLBACK_JOURNEY_IMAGES = [
  {
    src: "/Visuals/wasser_tiefenbild.png",
    alt: "Tiefe unter der Wasseroberfläche",
    title: "Die Tiefe",
    text: "Unter der Oberfläche beginnt der Bereich, in dem Worte langsamer werden. Wasser zeigt nicht alles, aber es bewahrt, was noch nicht ausgesprochen ist.",
  },
  {
    src: "/Visuals/wasser_szenenbild.png",
    alt: "Biblische Wasserszene als Übergang",
    title: "Die Ordnung",
    text: "Im Symbolraum ist Wasser nicht Dekoration, sondern Schwelle. Hinter dir liegt Enge, vor dir ein Weg, der erst im Gehen sichtbar wird.",
  },
  {
    src: "/Visuals/wasser_makro.png",
    alt: "Makroaufnahme von Wasser",
    title: "Die Spur",
    text: "Der Geist über den Wassern ist kein lauter Eingriff. Eher ein Schweben, ein Atem über dem Noch-Nicht.",
  },
];

const WATER_JOURNEY_NODE_IDS = [
  "spirit",
  "well",
  "spring",
  "exodus-14",
  "baptism",
];

const WATER_JOURNEY_INSIGHTS: Record<string, string> = {
  spirit: "Ein Atem über dem Wasser.",
  well: "Tiefe wird zugänglich.",
  spring: "Leben tritt hervor.",
  "exodus-14": "Die Grenze öffnet sich.",
  baptism: "Untertauchen wird Neubeginn.",
};

type WaterJourneyPanel = {
  src: string;
  alt: string;
  title: string;
  text: string;
  node?: SymbolNode;
  strongestConnection?: MeaningEdge;
  connectedNodes: SymbolNode[];
};

type ResonanceKind = "strong" | "secondary" | "mist";

type SemanticEcho = {
  query: string;
  matchedNodes: string[];
  primaryNode: string;
  interpretation: string;
  pathLabel: string;
};

type SemanticEchoRule = {
  keywords: string[];
  nodes: string[];
  interpretation: string;
};

const SEMANTIC_ECHO_RULES: SemanticEchoRule[] = [
  {
    keywords: ["angst", "chaos", "tiefe", "verloren"],
    nodes: ["water", "sea", "mem"],
    interpretation: "Nicht jede Tiefe ist Ende. Manche Tiefe ist Ursprung.",
  },
  {
    keywords: ["reinigung", "neu", "taufe", "schuld"],
    nodes: ["baptism", "water", "mayim"],
    interpretation: "Was untergeht, muss nicht verloren sein. Manches steigt gereinigt wieder auf.",
  },
  {
    keywords: ["suche", "trocken", "mangel"],
    nodes: ["desert", "well", "spring"],
    interpretation: "Der Durst kennt den Weg, bevor die Quelle sichtbar wird.",
  },
  {
    keywords: ["geist", "bewegung", "atem"],
    nodes: ["spirit", "genesis-1-2"],
    interpretation: "Der Anfang ist manchmal nur ein Schweben über dunklem Wasser.",
  },
  {
    keywords: ["befreiung", "weg", "durchbruch"],
    nodes: ["exodus-14", "sea", "light"],
    interpretation: "Der Weg erscheint nicht vor dem Wasser. Er öffnet sich im Gehen.",
  },
  {
    keywords: ["quelle", "leben", "durst"],
    nodes: ["well", "spring", "water"],
    interpretation: "Leben beginnt oft verborgen, tief unter der trockenen Stelle.",
  },
];

const FALLBACK_SEMANTIC_ECHO: SemanticEchoRule = {
  keywords: [],
  nodes: ["water", "mayim", "mem"],
  interpretation: "Das Wasser antwortet leise. Erst Tiefe, dann Zeichen, dann Ursprung.",
};

const MEANING_QUALITY_LABELS: Record<MeaningEdge["meaningQuality"], string> = {
  origin: "Ursprung",
  depth: "Tiefe",
  chaos: "Chaos",
  birth: "Geburt",
  transition: "Übergang",
  purification: "Reinigung",
  "hidden-source": "verborgene Quelle",
  lack: "Mangel",
  revelation: "Offenbarung",
  life: "Leben",
  impulse: "Impuls",
  movement: "Bewegung",
  resistance: "Widerstand",
};

const LOCAL_WATER_ROOM_IMAGES = new Set([
  "/Visuals/symbolnetz_backround.png",
  "/Visuals/wasser_cinema_hero.png",
  "/Visuals/wasser_hero.png",
  "/Visuals/wasser_interface_backround.png",
  "/Visuals/wasser_tiefenbild.png",
  "/Visuals/wasser_szenenbild.png",
  "/Visuals/wasser_hebr_symbl.png",
  "/Visuals/wasser_karte.png",
  "/Visuals/wasser_makro.png",
]);

function resolveLocalImage(src: string | undefined, fallbackSrc: string) {
  return src && LOCAL_WATER_ROOM_IMAGES.has(src) ? src : fallbackSrc;
}

function getImageAsset(role: NonNullable<SymbolEntry["imageAssets"]>[number]["role"], fallbackSrc: string, fallbackAlt: string) {
  const asset = WATER_ROOM_SYMBOL.imageAssets?.find((imageAsset) => imageAsset.role === role);

  return {
    src: resolveLocalImage(asset?.src, fallbackSrc),
    alt: asset?.alt ?? fallbackAlt,
  };
}

function getLetters(symbol: SymbolEntry) {
  return symbol.letterBreakdown ?? (symbol as WaterSymbolEntry).letters ?? FALLBACK_SYMBOL.letterBreakdown ?? [];
}

function getJourneyPanels(symbol: SymbolEntry): WaterJourneyPanel[] {
  const backgroundAsset = symbol.imageAssets?.find((asset) => asset.role === "background");

  return WATER_JOURNEY_NODE_IDS.map((nodeId, index) => {
    const node = getNodeById(waterSymbolGraph, nodeId);
    const strongestConnection =
      getMostImportantRelation(waterSymbolGraph, nodeId) ??
      getStrongestConnections(waterSymbolGraph, nodeId, 0)[0];
    const fallbackPanel = getFallbackJourneyPanel(symbol, index);
    const connectedNodes = node ? getConnectedNodes(waterSymbolGraph, node.id) : [];

    return {
      src: resolveLocalImage(backgroundAsset?.src, fallbackPanel.src),
      alt: backgroundAsset?.alt ?? fallbackPanel.alt,
      title: node?.label ?? fallbackPanel.title,
      text: WATER_JOURNEY_INSIGHTS[nodeId] ?? fallbackPanel.text,
      node,
      strongestConnection,
      connectedNodes,
    };
  });
}

function getFallbackJourneyPanel(symbol: SymbolEntry, index: number) {
  if (!symbol.verses?.length) {
    return FALLBACK_JOURNEY_IMAGES[index % FALLBACK_JOURNEY_IMAGES.length];
  }

  const verse = symbol.verses[index % symbol.verses.length];
  const fallbackImage = FALLBACK_JOURNEY_IMAGES[index % FALLBACK_JOURNEY_IMAGES.length];
  const backgroundAsset = symbol.imageAssets?.find((asset) => asset.role === "background");

  return {
    src: resolveLocalImage(backgroundAsset?.src, fallbackImage.src),
    alt: backgroundAsset?.alt ?? fallbackImage.alt,
    title: verse.reference,
    text: verse.symbolicRole ?? verse.note ?? verse.shortNote,
  };
}

export default function WaterRoom() {
  return (
    <div
      className="symbol-page water-room bg-[#02050b]"
    >
      <WaterOpening symbol={WATER_ROOM_SYMBOL} />
      <SymbolJourney symbol={WATER_ROOM_SYMBOL} />
      <WaterGlyphChamber symbol={WATER_ROOM_SYMBOL} />
      <HebrewReveal symbol={WATER_ROOM_SYMBOL} />
      <ReflectionRoom symbol={WATER_ROOM_SYMBOL} />
    </div>
  );
}

function getOtherNodeId(edge: MeaningEdge, nodeId: string) {
  return edge.source === nodeId ? edge.target : edge.source;
}

function getResonanceKind(weight: number): ResonanceKind {
  if (weight > 0.8) {
    return "strong";
  }

  if (weight > 0.5) {
    return "secondary";
  }

  return "mist";
}

function getPrimaryQualities(edges: MeaningEdge[]) {
  const preferredQualities = ["purification", "transition", "depth"] satisfies MeaningEdge["meaningQuality"][];
  const availableQualities = new Set(edges.map((edge) => edge.meaningQuality));
  const preferredLabels = preferredQualities
    .filter((quality) => availableQualities.has(quality))
    .map((quality) => MEANING_QUALITY_LABELS[quality]);
  const edgeLabels = edges
    .map((edge) => MEANING_QUALITY_LABELS[edge.meaningQuality])
    .filter((label, index, labels) => labels.indexOf(label) === index);

  return [...preferredLabels, ...edgeLabels]
    .filter((label, index, labels) => labels.indexOf(label) === index)
    .slice(0, 3);
}

function getPoeticExplanation(explanation: string) {
  return explanation.split(/(?<=[.!?])\s+/)[0];
}

function normalizeEchoQuery(query: string) {
  return query
    .toLocaleLowerCase("de-DE")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function uniqueNodeIds(nodeIds: string[]) {
  return nodeIds.filter((nodeId, index, ids) => ids.indexOf(nodeId) === index);
}

function getSemanticEchoRule(query: string) {
  const normalizedQuery = normalizeEchoQuery(query);

  return (
    SEMANTIC_ECHO_RULES.find((rule) =>
      rule.keywords.some((keyword) => normalizedQuery.includes(normalizeEchoQuery(keyword)))
    ) ?? FALLBACK_SEMANTIC_ECHO
  );
}

function createSemanticEcho(query: string): SemanticEcho {
  const rule = getSemanticEchoRule(query);
  const matchedNodes = uniqueNodeIds(rule.nodes).filter((nodeId) => getNodeById(waterSymbolGraph, nodeId));
  const primaryNode =
    matchedNodes
      .map((nodeId) => getNodeById(waterSymbolGraph, nodeId))
      .filter((node): node is SymbolNode => Boolean(node))
      .sort((leftNode, rightNode) => rightNode.importance - leftNode.importance)[0]?.id ??
    waterSymbolGraph.centerId;
  const pathLabel = matchedNodes
    .map((nodeId) => getNodeById(waterSymbolGraph, nodeId)?.label ?? nodeId)
    .join(" · ");

  return {
    query: query.trim(),
    matchedNodes,
    primaryNode,
    interpretation: rule.interpretation,
    pathLabel,
  };
}

function WaterOpening({ symbol }: { symbol: SymbolEntry }) {
  const heroImage = getImageAsset("hero", "/Visuals/wasser_cinema_hero.png", "Dunkler cineastischer Wasserraum");
  const backgroundImage = getImageAsset("background", "/Visuals/wasser_interface_backround.png", "");

  return (
    <section className="symbol-section water-chamber relative flex min-h-screen items-end overflow-hidden pb-24 pt-40 md:pt-36">
      <Image
        src={heroImage.src}
        alt={heroImage.alt}
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-[0.78]"
      />
      <Image
        src={backgroundImage.src}
        alt={backgroundImage.alt}
        fill
        priority
        sizes="100vw"
        className="sacred-drift object-cover opacity-[0.18] mix-blend-screen"
      />

      <div className="light-pulse absolute inset-0 bg-[radial-gradient(circle_at_46%_24%,rgba(216,184,116,0.12),transparent_26%),radial-gradient(circle_at_70%_66%,rgba(73,154,180,0.11),transparent_32%)] mix-blend-screen" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,5,12,0.5),rgba(2,5,12,0.24)_36%,rgba(2,5,12,0.94))]" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(1,3,8,0.9),rgba(1,3,8,0.2)_52%,rgba(1,3,8,0.8))]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_32%,rgba(0,0,0,0.58)_78%,rgba(0,0,0,0.9)_100%)]" />
      <div className="absolute inset-x-[8%] top-[48%] h-px bg-gradient-to-r from-transparent via-gold/35 to-transparent" />

      <div className="symbol-fade-in relative z-10 mx-auto flex w-full max-w-6xl min-w-0 flex-col gap-16 lg:grid lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-end">
        <div className="min-w-0">
          <p className="symbol-kicker">
            Raum / {symbol.name ?? FALLBACK_SYMBOL.name}
          </p>
          <h1 className="symbol-breathe mt-7 max-w-full overflow-hidden font-serif text-[clamp(5rem,24vw,19rem)] leading-[0.78] text-gold/90 drop-shadow-[0_0_30px_rgba(189,160,109,0.14)]">
            {symbol.hebrew ?? FALLBACK_SYMBOL.hebrew}
          </h1>
        </div>

        <div className="max-w-[20rem] min-w-0 pb-4 sm:max-w-2xl">
          <p className="symbol-kicker text-cyan-soft">
            {symbol.transliteration ?? FALLBACK_SYMBOL.transliteration} · {symbol.name ?? FALLBACK_SYMBOL.name}
          </p>
          <p className="symbol-copy mt-7 text-lg sm:text-3xl">
            Wasser trägt. Wasser trennt. Wasser öffnet.
          </p>
          <a
            href="#symbolreise"
            className="symbol-cta mt-14 gap-4"
          >
            In die Tiefe gehen
            <span className="h-px w-10 bg-gold/[0.42]" />
          </a>
        </div>
      </div>
    </section>
  );
}

function WaterGlyphChamber({ symbol }: { symbol: SymbolEntry }) {
  return (
    <section className="symbol-section water-chamber water-glyph-chamber relative grid min-h-screen place-items-center overflow-hidden py-32">
      <div className="water-chamber-breath absolute left-1/2 top-1/2 h-[38rem] w-[38rem] -translate-x-1/2 -translate-y-1/2 rounded-full" />
      <div className="absolute inset-x-[18%] top-1/2 h-px bg-gradient-to-r from-transparent via-gold/[0.16] to-transparent" />
      <div className="relative text-center">
        <p className="symbol-breathe font-serif text-[clamp(8rem,32vw,24rem)] leading-none text-gold/85">
          {symbol.hebrew ?? FALLBACK_SYMBOL.hebrew}
        </p>
        <p className="symbol-kicker mt-10 text-cyan-soft">
          {symbol.transliteration ?? FALLBACK_SYMBOL.transliteration}
        </p>
      </div>
    </section>
  );
}

function HebrewReveal({ symbol }: { symbol: SymbolEntry }) {
  const mem = getLetters(symbol).find((item) => item.name === "Mem") ?? getLetters(symbol)[0];

  return (
    <section className="symbol-section water-chamber relative py-24 md:py-32">
      <div className="absolute left-1/2 top-1/2 h-[44rem] w-[44rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(189,160,109,0.07),transparent_62%)]" />
      <div className="relative mx-auto max-w-4xl">
        <p className="symbol-kicker text-center">
          Mem
        </p>
        <div className="mt-16 grid gap-20 md:gap-28">
          {mem ? [mem].map((item) => (
            <article
              key={item.letter}
              className="scroll-reveal water-letter-station relative grid min-h-[76svh] place-items-center border-y border-gold/[0.055] py-20 text-center md:min-h-[82vh]"
            >
              <div className="water-chamber-breath absolute left-1/2 top-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-45" />
              <div className="relative">
                <p className="symbol-breathe font-serif text-[11rem] leading-none text-gold/88 sm:text-[16rem]">
                  {item.letter}
                </p>
                <h3 className="symbol-kicker mt-10 text-cyan-soft">
                  {item.name}
                </h3>
                <p className="symbol-copy mx-auto mt-10 max-w-xl text-xl italic sm:text-2xl">
                  Mem öffnet die Tiefe.
                </p>
              </div>
            </article>
          )) : null}
        </div>
      </div>
    </section>
  );
}

function SymbolJourney({ symbol }: { symbol: SymbolEntry }) {
  const [echoQuery, setEchoQuery] = useState("");
  const [semanticEcho, setSemanticEcho] = useState<SemanticEcho | null>(null);
  const journeyPanels = getJourneyPanels(symbol);
  const firstActiveNodeId = journeyPanels[0]?.node?.id ?? "spirit";
  const [activePanelId, setActivePanelId] = useState(firstActiveNodeId);
  const activePanel = journeyPanels.find((panel) => panel.node?.id === activePanelId) ?? journeyPanels[0];
  const activeDepthIndex = 1;
  const activeNodeId = activePanel?.node?.id ?? firstActiveNodeId;
  const activeEdges = activeNodeId
    ? getEdgesForNode(waterSymbolGraph, activeNodeId).sort((a, b) => b.weight - a.weight)
    : [];
  const resonancePath = activeEdges.slice(0, 4);
  const resonanceNodeIds = new Set([
    ...activeEdges.map((edge) => getOtherNodeId(edge, activeNodeId)),
    ...(semanticEcho?.matchedNodes ?? []),
  ]);
  const primaryQualities = getPrimaryQualities(activeEdges);
  const strongestConnection = activeEdges[0];
  const connectedQualityLabels = activeEdges
    .map((edge) => MEANING_QUALITY_LABELS[edge.meaningQuality])
    .filter((label, index, labels) => labels.indexOf(label) === index)
    .slice(0, 5);
  const semanticEchoNodeIds = new Set(semanticEcho?.matchedNodes ?? []);

  const handleSemanticEchoSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedQuery = echoQuery.trim();

    if (!trimmedQuery) {
      return;
    }

    const nextEcho = createSemanticEcho(trimmedQuery);

    setSemanticEcho(nextEcho);
    setActivePanelId(nextEcho.primaryNode);
  };

  return (
    <section id="symbolreise" className={`symbol-section water-chamber relative overflow-hidden py-24 md:py-32 ${semanticEcho ? "water-semantic-echo-active" : ""}`}>
      <div
        className="pointer-events-none absolute inset-0 transition duration-1000"
        style={{
          background:
            `radial-gradient(circle_at_${30 + activeDepthIndex * 5}%_${18 + activeDepthIndex * 6}%,rgba(100,206,232,${0.06 + activeDepthIndex * 0.012}),transparent_28%),` +
            `radial-gradient(circle_at_${72 - activeDepthIndex * 4}%_${64 + activeDepthIndex * 4}%,rgba(209,177,111,${0.055 + activeDepthIndex * 0.012}),transparent_34%),` +
            `linear-gradient(180deg,rgba(2,5,12,${0.12 + activeDepthIndex * 0.08}),rgba(0,2,8,${0.55 + activeDepthIndex * 0.06}))`,
        }}
      />
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="symbol-kicker text-center md:text-left">
              Symbolreise
            </p>
            <p className="symbol-copy mx-auto mt-5 max-w-2xl text-center text-base md:mx-0 md:text-left">
              Fünf Bewegungen im Wasser.
            </p>
            <form className="water-semantic-echo mt-8" onSubmit={handleSemanticEchoSubmit}>
              <input
                type="text"
                value={echoQuery}
                onChange={(event) => setEchoQuery(event.target.value)}
                placeholder="Frage an den Raum..."
                aria-label="Frage an den Raum"
                className="water-semantic-echo__input"
              />
              <button type="submit" className="water-semantic-echo__submit">
                lauschen
              </button>
            </form>
          </div>
          {activePanel?.node ? (
            <div className={`water-resonance-display md:max-w-md ${semanticEcho ? "water-resonance-display--echo" : ""}`}>
              <p className="water-oracle-kicker">
                {semanticEcho ? "Der Raum antwortet" : "Das Wasser lauscht"}
              </p>
              <p className="mt-3 font-serif text-2xl italic leading-tight text-foreground-strong">
                {semanticEcho ? semanticEcho.pathLabel : "Bedeutung steigt als Licht aus der Tiefe."}
              </p>
              {semanticEcho ? (
                <p className="symbol-copy mt-3 text-sm text-gold/80">
                  {semanticEcho.interpretation}
                </p>
              ) : null}
              <p className={`water-oracle-murmur mt-3 ${semanticEcho ? "hidden" : ""}`}>
                {(primaryQualities.length ? primaryQualities : ["Reinigung", "Übergang", "Tiefe"]).join(" · ")}
              </p>
            </div>
          ) : null}
        </div>
        {resonancePath.length ? (
          <div className="water-resonance-path mt-12" aria-label="Resonanzpfad">
            {resonancePath.map((edge, index) => {
              const targetNode = getNodeById(waterSymbolGraph, getOtherNodeId(edge, activeNodeId));
              const kind = getResonanceKind(edge.weight);

              return (
                <div
                  key={`${edge.source}-${edge.target}-${index}`}
                  className={`water-resonance-thread water-resonance-thread--${kind}`}
                  style={{ "--resonance-strength": edge.weight, "--resonance-delay": `${index * 180}ms` } as CSSProperties}
                >
                  <span className="water-resonance-thread__mist" aria-hidden="true" />
                  <span className="water-resonance-thread__vein" aria-hidden="true" />
                  <span className="water-resonance-thread__ripple" aria-hidden="true" />
                  <span className="min-w-0">
                    <span className="block truncate font-serif text-lg italic text-foreground-strong">
                      {targetNode?.label ?? getOtherNodeId(edge, activeNodeId)}
                    </span>
                    <span className="water-oracle-murmur mt-1 block">
                      {MEANING_QUALITY_LABELS[edge.meaningQuality]}
                    </span>
                  </span>
                </div>
              );
            })}
          </div>
        ) : null}
        <div className="mt-16 grid gap-32 md:gap-44">
          {journeyPanels.map((panel, index) => {
            const isRelevant = true;
            const isActive = activePanelId === panel.node?.id;
            const panelEdge = panel.node?.id
              ? activeEdges.find(
                  (edge) =>
                    getOtherNodeId(edge, activeNodeId) === panel.node?.id ||
                    edge.source === panel.node?.id ||
                    edge.target === panel.node?.id
                )
              : undefined;
            const panelResonanceKind = panelEdge ? getResonanceKind(panelEdge.weight) : "mist";
            const isResonating = Boolean(panel.node?.id && resonanceNodeIds.has(panel.node.id));
            const isSemanticMatch = Boolean(panel.node?.id && semanticEchoNodeIds.has(panel.node.id));
            const visualDepth = activeDepthIndex + (isRelevant ? 0 : 2);

            return (
              <article
                key={`${panel.node?.id ?? panel.title}-${index}`}
                className={`scroll-reveal water-journey-station water-resonance-panel water-resonance-panel--${panelResonanceKind} group relative grid min-h-[82svh] items-end overflow-hidden py-10 transition duration-700 md:min-h-[92vh] md:py-16 ${
                  isActive ? "water-engine-panel-active is-resonance-origin scale-[1.012]" : isResonating ? "is-resonating scale-[1.006]" : isRelevant ? "scale-100" : "scale-[0.985] opacity-60"
                } ${
                  isSemanticMatch ? "is-semantic-echo" : ""
                }`}
                onMouseEnter={() => setActivePanelId(panel.node?.id ?? activePanelId)}
                onFocus={() => setActivePanelId(panel.node?.id ?? activePanelId)}
                onClick={() => setActivePanelId(panel.node?.id ?? activePanelId)}
                tabIndex={0}
                style={{
                  "--resonance-strength": panelEdge?.weight ?? 0.18,
                  "--resonance-delay": `${index * 95}ms`,
                  transform: `translateY(${visualDepth * 0.35}rem) scale(${isActive ? 1.012 : isResonating ? 1.006 : isRelevant ? 1 : 0.985})`,
                } as CSSProperties}
              >
              <div className="water-resonance-veil" aria-hidden="true" />
              <div className="water-resonance-ripples" aria-hidden="true" />
              <div className="water-resonance-veins" aria-hidden="true" />
              <div className="absolute inset-0 shadow-[0_34px_120px_rgba(0,0,0,0.34)]">
                <Image
                  src={panel.src}
                  alt={panel.alt}
                  fill
                  sizes="100vw"
                  className={`sacred-drift object-cover transition duration-1000 ${isRelevant ? "opacity-[0.78]" : "opacity-[0.46]"}`}
                />
                <div
                  className="absolute inset-0 transition duration-1000"
                  style={{
                    background:
                      `radial-gradient(circle_at_62%_34%,rgba(107,195,217,${isRelevant ? 0.17 : 0.07}),transparent_30%),` +
                      `linear-gradient(180deg,rgba(2,5,12,${0.18 + activeDepthIndex * 0.07}),rgba(2,5,12,${0.7 + activeDepthIndex * 0.035})_70%,rgba(0,1,6,0.97))`,
                  }}
                />
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(1,3,8,0.82),rgba(1,3,8,0.22)_54%,rgba(1,3,8,0.72))]" />
                <div className={`absolute inset-0 transition duration-700 group-hover:opacity-100 group-focus:opacity-100 ${isRelevant ? "opacity-30" : "opacity-0"} bg-[radial-gradient(circle_at_50%_54%,rgba(87,210,235,0.16),transparent_28%),radial-gradient(circle_at_46%_46%,rgba(217,184,114,0.15),transparent_24%)]`} />
              </div>
              <div
                className={`relative max-w-4xl pb-8 transition duration-700 ${
                  index % 2 === 1 ? "md:ml-auto" : ""
                }`}
              >
                <div className="water-fragment-shell">
                  <div className="water-fragment-trace" aria-hidden="true" />
                  <div className="water-fragment-orbit" aria-label="Umliegende Zeichen">
                    {panel.connectedNodes.slice(0, isRelevant ? 6 : 3).map((connectedNode, connectedIndex) => (
                      <span
                        key={connectedNode.id}
                        className="water-fragment-sign"
                        style={{
                          "--sign-x": `${connectedIndex % 2 === 0 ? -0.35 : 0.35}rem`,
                          "--sign-delay": `${connectedIndex * 160}ms`,
                        } as CSSProperties}
                      >
                        <span lang={connectedNode.hebrew ? "he" : undefined} dir={connectedNode.hebrew ? "rtl" : undefined}>
                          {connectedNode.hebrew ?? connectedNode.label}
                        </span>
                        <span>{connectedNode.label}</span>
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                    {panel.strongestConnection ? (
                      <span className="water-meaning-quality">
                        {MEANING_QUALITY_LABELS[panel.strongestConnection.meaningQuality]}
                      </span>
                    ) : null}
                    {isSemanticMatch ? (
                      <span className="water-semantic-echo__mark">
                        eine Antwort
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-8 grid gap-8 md:grid-cols-[minmax(0,0.68fr)_minmax(12rem,0.32fr)] md:items-end">
                    <div>
                      <h2 className="water-light-inscription font-serif text-5xl italic leading-tight text-foreground-strong sm:text-7xl">
                        {panel.node?.label ?? panel.title}
                      </h2>
                      <p className="water-reflection-text mt-8 text-xl italic sm:text-3xl">
                        {panel.text}
                      </p>
                    </div>
                    <div className="water-glass-shard">
                      <p className="font-serif text-5xl leading-none text-gold/85 sm:text-6xl" lang="he" dir="rtl">
                        {panel.node?.hebrew ?? " "}
                      </p>
                      <p className="water-depth-inscription mt-4">
                        {panel.node?.transliteration ?? "Symbol"}
                      </p>
                    </div>
                  </div>
                  <div className={`mt-9 grid gap-5 transition duration-700 group-hover:translate-y-0 group-hover:opacity-100 group-focus:translate-y-0 group-focus:opacity-100 md:grid-cols-[minmax(0,0.44fr)_minmax(0,0.56fr)] ${
                    isRelevant ? "opacity-80" : "opacity-0"
                  }`}>
                    <div className="water-fragment-constellation">
                      {panel.connectedNodes.slice(0, isRelevant ? 5 : 2).map((connectedNode) => (
                        <span key={connectedNode.id}>
                          {connectedNode.hebrew ?? connectedNode.label}
                        </span>
                      ))}
                    </div>
                    {panel.strongestConnection ? (
                      <p className="water-whisper-line text-sm md:text-base">
                        {getPoeticExplanation(panel.strongestConnection.explanation)}
                      </p>
                    ) : null}
                  </div>
                  {isActive && strongestConnection ? (
                    <div className="water-resonance-detail mt-8">
                      <div>
                        {semanticEcho ? (
                          <div className="water-semantic-echo__answer">
                            <p className="symbol-kicker text-cyan-soft">Der Raum antwortet über</p>
                            <p className="mt-3 font-serif text-2xl italic text-foreground-strong">
                              {semanticEcho.pathLabel}
                            </p>
                            <p className="symbol-copy mt-3 text-sm">
                              {semanticEcho.interpretation}
                            </p>
                          </div>
                        ) : null}
                        <p className="water-oracle-kicker">Eine Inschrift steigt auf</p>
                        <p className="mt-3 font-serif text-2xl italic text-foreground-strong">
                          {getNodeById(waterSymbolGraph, getOtherNodeId(strongestConnection, activeNodeId))?.label ?? getOtherNodeId(strongestConnection, activeNodeId)}
                        </p>
                        <p className="water-oracle-text mt-3">
                          {getPoeticExplanation(strongestConnection.explanation)}
                        </p>
                      </div>
                      <div className="water-oracle-qualities">
                        <p className="water-quality-murmur">
                          {connectedQualityLabels.join(" · ")}
                        </p>
                      </div>
                    </div>
                  ) : panelEdge ? (
                    <p className="water-resonance-whisper mt-7">
                      {getPoeticExplanation(panelEdge.explanation)}
                    </p>
                  ) : null}
                </div>
              </div>
            </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ReflectionRoom({ symbol }: { symbol: SymbolEntry }) {
  const [answer, setAnswer] = useState("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "empty">("idle");
  const reflectionQuestion =
    symbol.reflectionQuestion ??
    FALLBACK_SYMBOL.reflectionQuestion ??
    "Wo zeigt sich in deinem Leben gerade eine Grenze, die vielleicht auch ein Übergang werden kann?";

  const handleSave = () => {
    const trimmedAnswer = answer.trim();

    if (!trimmedAnswer) {
      setSaveStatus("empty");
      return;
    }

    const savedReflections = parseStoredReflections(
      window.localStorage.getItem(REFLECTION_STORAGE_KEY)
    );
    const reflection: StoredReflection = {
      id:
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}`,
      symbol: symbol.name ?? FALLBACK_SYMBOL.name,
      hebrew: symbol.hebrew ?? FALLBACK_SYMBOL.hebrew ?? "",
      question: reflectionQuestion,
      answer: trimmedAnswer,
      createdAt: new Date().toISOString(),
    };

    window.localStorage.setItem(
      REFLECTION_STORAGE_KEY,
      JSON.stringify([reflection, ...savedReflections])
    );

    setAnswer("");
    setSaveStatus("saved");
  };

  return (
    <section className="symbol-section water-chamber relative min-h-screen pb-40 pt-32">
      <div className="absolute inset-x-[10%] top-1/2 h-px bg-gradient-to-r from-transparent via-[#7fb8c9]/[0.12] to-transparent" />
      <div className="relative mx-auto max-w-4xl border-y border-gold/[0.08] py-20 text-center">
        <p className="symbol-kicker">
          Reflexionsraum
        </p>
        <h2 className="mx-auto mt-8 max-w-3xl font-serif text-4xl italic leading-tight text-foreground-strong sm:text-6xl">
          {reflectionQuestion}
        </h2>
        <textarea
          aria-label="Reflexion zum Wasserraum"
          placeholder="Still notieren..."
          value={answer}
          onChange={(event) => {
            setAnswer(event.target.value);
            setSaveStatus("idle");
          }}
          className="symbol-reflection-field mt-14 min-h-52 w-full resize-y p-6 font-serif text-xl leading-relaxed"
        />
        <div className="mt-5 flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="symbol-copy text-left text-sm sm:text-base">
            Deine Reflexion bleibt nur auf diesem Gerät gespeichert.
          </p>
          <button
            type="button"
            onClick={handleSave}
            className="symbol-cta shrink-0"
          >
            Reflexion speichern
          </button>
        </div>
        <p className="symbol-copy mt-5 min-h-7 text-sm text-cyan-soft" aria-live="polite">
          {saveStatus === "saved"
            ? "Gespeichert. Du findest den Gedanken unter Mein Pfad."
            : saveStatus === "empty"
              ? "Schreibe zuerst eine kurze Reflexion."
              : ""}
        </p>
      </div>
    </section>
  );
}
