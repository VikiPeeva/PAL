import { useState, useCallback, useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  Handle,
  Panel,
  Position,
  MarkerType,
  BaseEdge,
  getStraightPath,
  EdgeLabelRenderer,
  type Node,
  type Edge,
  type NodeProps,
  type EdgeProps,
} from "@xyflow/react";
import { graphlib, layout } from "@dagrejs/dagre";
import type { PnmlNet } from "../../../types/pnml.ts";
import type {
  AnnotatedPetriNet,
  PetriNetAnnotations,
  PlaceAnnotation,
  TransitionAnnotation,
  AnnotationKey,
} from "../../../types/pnmlAnnotations.ts";
import {
  ANNOTATION_GROUPS,
  SLOT_COLORS,
  buildDefaultEnabledColors,
} from "../../../types/pnmlAnnotations.ts";
import { AnnotationSelector } from "./AnnotationSelector.tsx";
import "@xyflow/react/dist/style.css";
import "./PetriNetViewer.css";

const PLACE_SIZE             = 60;
const TRANSITION_W           = 80;
const TRANSITION_H           = 40;
const TRANSITION_H_ANNOTATED = 80;

type PlaceData = {
  label:            string;
  tokens:           number;
  annotation?:      PlaceAnnotation;
  annotationColors: Partial<Record<AnnotationKey, string>>;
};

type TransitionData = {
  label:            string;
  annotation?:      TransitionAnnotation;
  annotationColors: Partial<Record<AnnotationKey, string>>;
};

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

function formatDuration(seconds: number): string {
  if (seconds >= 3600) return `${(seconds / 3600).toFixed(1)}h`;
  if (seconds >= 60)   return `${(seconds / 60).toFixed(1)}m`;
  return `${seconds.toFixed(1)}s`;
}

function MiniBarChart({ values, color }: { values: number[]; color: string }) {
  const max  = Math.max(...values, 1);
  const w    = 68;
  const h    = 30;
  const barW = Math.max(2, Math.floor(w / values.length) - 1);
  return (
    <svg width={w} height={h} className="pn-dist-chart" style={{ color }} aria-hidden="true">
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

function MiniPlaceChart({ values, color }: { values: number[]; color: string }) {
  const max  = Math.max(...values, 1);
  const w    = 44;
  const h    = 22;
  const barW = Math.max(2, Math.floor(w / values.length) - 1);
  return (
    <svg width={w} height={h} className="pn-place-chart" style={{ color }} aria-hidden="true">
      {values.map((v, i) => {
        const barH = Math.max(1, Math.round((v / max) * h));
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
  const freqColor = data.annotationColors["place.caseFrequency"];
  const distColor = data.annotationColors["place.distribution"];
  const stacked   = !!freqColor && !!distColor;
  return (
    <div className={`pn-place${stacked ? " pn-place--stacked" : ""}`}>
      <Handle type="target" position={Position.Left} />
      {data.tokens > 0 && (
        <span className="pn-token">{data.tokens > 1 ? data.tokens : ""}</span>
      )}
      {freqColor && data.annotation?.caseFrequency !== undefined && (
        <span className="pn-freq" style={{ color: freqColor }}>
          {formatCount(data.annotation.caseFrequency)}
        </span>
      )}
      {distColor && data.annotation?.distribution != null && (
        <MiniPlaceChart values={data.annotation.distribution} color={distColor} />
      )}
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

function TransitionNode({ data }: NodeProps<Node<TransitionData>>) {
  const countColor = data.annotationColors["transition.firingCount"];
  const durColor   = data.annotationColors["transition.avgDuration"];
  const distColor  = data.annotationColors["transition.distribution"];
  const hasAny     = !!(countColor || durColor || distColor);
  return (
    <div className={`pn-transition${hasAny ? " pn-transition--chart" : ""}`}>
      <Handle type="target" position={Position.Left} />
      <span className="pn-label">{data.label}</span>
      {countColor && data.annotation?.firingCount !== undefined && (
        <span className="pn-count" style={{ color: countColor }}>
          {formatCount(data.annotation.firingCount)}
        </span>
      )}
      {durColor && data.annotation?.avgDuration !== undefined && (
        <span className="pn-duration" style={{ color: durColor }}>
          {formatDuration(data.annotation.avgDuration)}
        </span>
      )}
      {distColor && data.annotation?.distribution != null && (
        <MiniBarChart values={data.annotation.distribution} color={distColor} />
      )}
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

function LabeledStraightEdge({ id, sourceX, sourceY, targetX, targetY, label, markerEnd, style }: EdgeProps) {
  const [edgePath] = getStraightPath({ sourceX, sourceY, targetX, targetY });
  const lx = sourceX + (targetX - sourceX) / 3;
  const ly = sourceY + (targetY - sourceY) / 3;
  return (
    <>
      <BaseEdge id={id} path={edgePath} markerEnd={markerEnd} style={style} />
      {label && (
        <EdgeLabelRenderer>
          <span
            className="pn-edge-label nodrag nopan"
            style={{ transform: `translate(-50%,-50%) translate(${lx}px,${ly}px)` }}
          >
            {label}
          </span>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

const nodeTypes = { place: PlaceNode, transition: TransitionNode };
const edgeTypes = { "labeled-straight": LabeledStraightEdge };

const placeNodeId      = (id: string) => `p__${id}`;
const transitionNodeId = (id: string) => `t__${id}`;

function transitionHeight(
  id: string,
  annotations?: PetriNetAnnotations,
  enabledColors?: ReadonlyMap<AnnotationKey, string>,
): number {
  const ann = annotations?.transitions[id];
  if (!ann || !enabledColors) return TRANSITION_H;
  const hasAny =
    (enabledColors.has("transition.distribution") && ann.distribution != null) ||
    (enabledColors.has("transition.firingCount")  && ann.firingCount  !== undefined) ||
    (enabledColors.has("transition.avgDuration")  && ann.avgDuration  !== undefined);
  return hasAny ? TRANSITION_H_ANNOTATED : TRANSITION_H;
}

function buildLayout(
  net: PnmlNet,
  annotations?: PetriNetAnnotations,
  enabledColors: ReadonlyMap<AnnotationKey, string> = new Map(),
): { nodes: Node[]; edges: Edge[] } {
  const placeIds = new Set(net.places.map((p) => p.id));
  const arcEndId = (id: string) =>
    placeIds.has(id) ? placeNodeId(id) : transitionNodeId(id);

  const g = new graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: "LR", nodesep: 40, ranksep: 60, marginx: 20, marginy: 20 });

  for (const place of net.places) {
    g.setNode(placeNodeId(place.id), { width: PLACE_SIZE, height: PLACE_SIZE });
  }
  for (const transition of net.transitions) {
    const h = transitionHeight(transition.id, annotations, enabledColors);
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
        data:     {
          label:      place.name,
          tokens:     place.initialMarking,
          annotation: annotations?.places[place.id],
          annotationColors: {
            "place.caseFrequency": enabledColors.get("place.caseFrequency"),
            "place.distribution":  enabledColors.get("place.distribution"),
          },
        },
      };
    }),
    ...net.transitions.map((transition) => {
      const id  = transitionNodeId(transition.id);
      const pos = g.node(id);
      const h   = transitionHeight(transition.id, annotations, enabledColors);
      return {
        id,
        type:     "transition" as const,
        position: { x: (pos?.x ?? 0) - TRANSITION_W / 2, y: (pos?.y ?? 0) - h / 2 },
        data:     {
          label:      transition.name,
          annotation: annotations?.transitions[transition.id],
          annotationColors: {
            "transition.firingCount":  enabledColors.get("transition.firingCount"),
            "transition.avgDuration":  enabledColors.get("transition.avgDuration"),
            "transition.distribution": enabledColors.get("transition.distribution"),
          },
        },
      };
    }),
  ];

  const edges: Edge[] = net.arcs.map((arc) => {
    const flowColor = enabledColors.get("arc.flowCount");
    const flowCount = flowColor !== undefined ? annotations?.arcs[arc.id]?.flowCount : undefined;
    const arcLabel  = arc.inscription > 1 ? String(arc.inscription) : undefined;
    return {
      id:        arc.id,
      source:    arcEndId(arc.source),
      target:    arcEndId(arc.target),
      label:     flowCount !== undefined ? formatCount(flowCount) : arcLabel,
      type:      "labeled-straight",
      markerEnd: { type: MarkerType.ArrowClosed },
      style:     flowColor ? { stroke: flowColor } : undefined,
    };
  });

  return { nodes, edges };
}

interface Props {
  annotatedNet: AnnotatedPetriNet;
}

export function PetriNetViewer({ annotatedNet: { net, annotations } }: Props) {
  const [enabledColors, setEnabledColors] = useState<ReadonlyMap<AnnotationKey, string>>(
    buildDefaultEnabledColors,
  );

  const toggleKey = useCallback((key: AnnotationKey) => {
    setEnabledColors(prev => {
      if (prev.has(key)) {
        const next = new Map(prev);
        next.delete(key);
        return next;
      }
      const group = ANNOTATION_GROUPS.find(g => g.items.some(i => i.key === key))!;
      const activeInGroup = group.items.map(i => i.key).filter(k => prev.has(k));
      if (activeInGroup.length >= 2) return prev;
      const usedSlots = new Set(activeInGroup.map(k => SLOT_COLORS.indexOf(prev.get(k)!)));
      const slotIdx = usedSlots.has(0) ? 1 : 0;
      const next = new Map(prev);
      next.set(key, SLOT_COLORS[slotIdx]);
      return next;
    });
  }, []);

  const { nodes, edges } = useMemo(
    () => buildLayout(net, annotations, enabledColors),
    [net, annotations, enabledColors],
  );

  return (
    <div className="petri-net-wrapper">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
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
        {annotations && (
          <Panel position="top-right">
            <AnnotationSelector enabledColors={enabledColors} onToggle={toggleKey} />
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
}