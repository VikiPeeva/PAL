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
import "@xyflow/react/dist/style.css";
import "./PetriNetViewer.css";

const PLACE_SIZE      = 60;
const TRANSITION_W    = 80;
const TRANSITION_H    = 40;

type PlaceData      = { label: string; tokens: number };
type TransitionData = { label: string };

function PlaceNode({ data }: NodeProps<Node<PlaceData>>) {
  return (
    <>
      <Handle type="target" position={Position.Left} />
      <div className="pn-place">
        {data.tokens > 0 && (
          <span className="pn-token">{data.tokens > 1 ? data.tokens : ""}</span>
        )}
      </div>
      <Handle type="source" position={Position.Right} />
    </>
  );
}

function TransitionNode({ data }: NodeProps<Node<TransitionData>>) {
  return (
    <>
      <Handle type="target" position={Position.Left} />
      <div className="pn-transition">
        <span className="pn-label">{data.label}</span>
      </div>
      <Handle type="source" position={Position.Right} />
    </>
  );
}

const nodeTypes = { place: PlaceNode, transition: TransitionNode };

const placeNodeId      = (id: string) => `p__${id}`;
const transitionNodeId = (id: string) => `t__${id}`;

function buildLayout(net: PnmlNet): { nodes: Node[]; edges: Edge[] } {
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
    g.setNode(transitionNodeId(transition.id), { width: TRANSITION_W, height: TRANSITION_H });
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
        data:     { label: place.name, tokens: place.initialMarking },
      };
    }),
    ...net.transitions.map((transition) => {
      const id  = transitionNodeId(transition.id);
      const pos = g.node(id);
      return {
        id,
        type:     "transition" as const,
        position: { x: (pos?.x ?? 0) - TRANSITION_W / 2, y: (pos?.y ?? 0) - TRANSITION_H / 2 },
        data:     { label: transition.name },
      };
    }),
  ];

  const edges: Edge[] = net.arcs.map((arc) => ({
    id:        arc.id,
    source:    arcEndId(arc.source),
    target:    arcEndId(arc.target),
    label:     arc.inscription > 1 ? String(arc.inscription) : undefined,
    type:      "smoothstep",
    markerEnd: { type: MarkerType.ArrowClosed },
  }));

  return { nodes, edges };
}

interface Props {
  petriNet: PnmlNet;
}

export function PetriNetViewer({ petriNet }: Props) {
  const { nodes, edges } = useMemo(() => buildLayout(petriNet), [petriNet]);

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