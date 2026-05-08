import { useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  Handle,
  Position,
  MarkerType,
  type Node,
  type Edge,
  type NodeProps,
} from "@xyflow/react";
import { graphlib, layout } from "@dagrejs/dagre";
import type { PnmlNet } from "../../types/pnml";
import type { AnnotatedPetriNet, PetriNetAnnotations, PlaceAnnotation, TransitionAnnotation } from "../../types/pnmlAnnotations.ts";
import "@xyflow/react/dist/style.css";
import "./PetriNetViewer.css";

const PLACE_SIZE             = 60;
const TRANSITION_W           = 80;
const TRANSITION_H           = 40;
const TRANSITION_H_ANNOTATED = 80;

type PlaceData = {
  label: string;
  tokens: number;
  annotation?: PlaceAnnotation;
  incomingArcIds: string[];
  outgoingArcIds: string[];
};

type TransitionData = {
  label: string;
  annotation?: TransitionAnnotation;
  incomingArcIds: string[];
  outgoingArcIds: string[];
};

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

function handleTop(index: number, total: number, areaHeight: number): string {
  return `${(areaHeight * (index + 1)) / (total + 1)}px`;
}

function MiniBarChart({ values }: { values: number[] }) {
  const max  = Math.max(...values, 1);
  const w    = 68;
  const h    = 30;
  const barW = Math.max(2, Math.floor(w / values.length) - 1);
  return (
    <svg width={w} height={h} className="pn-dist-chart" aria-hidden="true">
      {values.map((v, i) => {
        const barH = Math.max(2, Math.round((v / max) * h));
        return (
          <rect
            key={i}
            x={i * (barW + 1)}
            y={h - barH}
            width={barW}
            height={barH}
            rx={1}
            className="pn-dist-bar"
          />
        );
      })}
    </svg>
  );
}

function PlaceNode({ data }: NodeProps<Node<PlaceData>>) {
  const inN = data.incomingArcIds.length;
  const outN = data.outgoingArcIds.length;
  return (
    <>
      {data.incomingArcIds.map((id, i) => (
        <Handle
          key={id}
          id={id}
          type="target"
          position={Position.Left}
          style={{ top: handleTop(i, inN, PLACE_SIZE) }}
        />
      ))}
      <div className="pn-place">
        {data.tokens > 0 && (
          <span className="pn-token">{data.tokens > 1 ? data.tokens : ""}</span>
        )}
        {data.annotation?.caseFrequency !== undefined && (
          <span className="pn-freq">{formatCount(data.annotation.caseFrequency)}</span>
        )}
      </div>
      {data.outgoingArcIds.map((id, i) => (
        <Handle
          key={id}
          id={id}
          type="source"
          position={Position.Right}
          style={{ top: handleTop(i, outN, PLACE_SIZE) }}
        />
      ))}
    </>
  );
}

function TransitionNode({ data }: NodeProps<Node<TransitionData>>) {
  const hasChart = data.annotation?.distribution != null;
  const inN  = data.incomingArcIds.length;
  const outN = data.outgoingArcIds.length;
  return (
    <>
      {data.incomingArcIds.map((id, i) => (
        <Handle
          key={id}
          id={id}
          type="target"
          position={Position.Left}
          style={{ top: handleTop(i, inN, TRANSITION_H) }}
        />
      ))}
      <div className={`pn-transition${hasChart ? " pn-transition--chart" : ""}`}>
        <div className="pn-transition-top">
          <span className="pn-label">{data.label}</span>
          {data.annotation?.firingCount !== undefined && (
            <span className="pn-count">{formatCount(data.annotation.firingCount)}</span>
          )}
        </div>
        {hasChart && <MiniBarChart values={data.annotation!.distribution!} />}
      </div>
      {data.outgoingArcIds.map((id, i) => (
        <Handle
          key={id}
          id={id}
          type="source"
          position={Position.Right}
          style={{ top: handleTop(i, outN, TRANSITION_H) }}
        />
      ))}
    </>
  );
}

const nodeTypes = { place: PlaceNode, transition: TransitionNode };

const placeNodeId      = (id: string) => `p__${id}`;
const transitionNodeId = (id: string) => `t__${id}`;

function transitionHeight(id: string, annotations?: PetriNetAnnotations): number {
  return annotations?.transitions[id]?.distribution != null
    ? TRANSITION_H_ANNOTATED
    : TRANSITION_H;
}

function buildLayout(net: PnmlNet, annotations?: PetriNetAnnotations): { nodes: Node[]; edges: Edge[] } {
  const placeIds = new Set(net.places.map((p) => p.id));
  const arcEndId = (id: string) =>
    placeIds.has(id) ? placeNodeId(id) : transitionNodeId(id);

  // Bucket incoming/outgoing arc IDs per node for per-arc handles
  const targetArcs = new Map<string, string[]>();
  const sourceArcs = new Map<string, string[]>();
  for (const arc of net.arcs) {
    const src = arcEndId(arc.source);
    const tgt = arcEndId(arc.target);
    sourceArcs.set(src, [...(sourceArcs.get(src) ?? []), arc.id]);
    targetArcs.set(tgt, [...(targetArcs.get(tgt) ?? []), arc.id]);
  }

  const g = new graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: "LR", nodesep: 40, ranksep: 60, marginx: 20, marginy: 20 });

  for (const place of net.places) {
    g.setNode(placeNodeId(place.id), { width: PLACE_SIZE, height: PLACE_SIZE });
  }
  for (const transition of net.transitions) {
    const h = transitionHeight(transition.id, annotations);
    g.setNode(transitionNodeId(transition.id), { width: TRANSITION_W, height: h });
  }
  for (const arc of net.arcs) {
    g.setEdge(arcEndId(arc.source), arcEndId(arc.target));
  }

  layout(g);

  const nodes: Node[] = [
    ...net.places.map((place) => {
      const id  = placeNodeId(place.id);
      const pos = g.node(id);
      return {
        id,
        type:     "place" as const,
        position: { x: (pos?.x ?? 0) - PLACE_SIZE / 2, y: (pos?.y ?? 0) - PLACE_SIZE / 2 },
        data: {
          label:          place.name,
          tokens:         place.initialMarking,
          annotation:     annotations?.places[place.id],
          incomingArcIds: targetArcs.get(id) ?? [],
          outgoingArcIds: sourceArcs.get(id) ?? [],
        },
      };
    }),
    ...net.transitions.map((transition) => {
      const id  = transitionNodeId(transition.id);
      const pos = g.node(id);
      const h   = transitionHeight(transition.id, annotations);
      return {
        id,
        type:     "transition" as const,
        position: { x: (pos?.x ?? 0) - TRANSITION_W / 2, y: (pos?.y ?? 0) - h / 2 },
        data: {
          label:          transition.name,
          annotation:     annotations?.transitions[transition.id],
          incomingArcIds: targetArcs.get(id) ?? [],
          outgoingArcIds: sourceArcs.get(id) ?? [],
        },
      };
    }),
  ];

  const edges: Edge[] = net.arcs.map((arc) => {
    const flowCount = annotations?.arcs[arc.id]?.flowCount;
    const arcLabel  = arc.inscription > 1 ? String(arc.inscription) : undefined;
    const label     = flowCount !== undefined ? formatCount(flowCount) : arcLabel;
    return {
      id:           arc.id,
      source:       arcEndId(arc.source),
      target:       arcEndId(arc.target),
      sourceHandle: arc.id,
      targetHandle: arc.id,
      label,
      type:         "default",
      markerEnd:    { type: MarkerType.ArrowClosed },
    };
  });

  return { nodes, edges };
}

interface Props {
  annotatedNet: AnnotatedPetriNet;
}

export function PetriNetViewer({ annotatedNet: { net, annotations } }: Props) {
  const { nodes, edges } = useMemo(() => buildLayout(net, annotations), [net, annotations]);

  return (
    <div className="petri-net-wrapper">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={() => {}}
        onEdgesChange={() => {}}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        proOptions={{ hideAttribution: false }}
      >
        <Background />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
