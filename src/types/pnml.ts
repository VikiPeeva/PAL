export interface PnmlPlace {
  id: string;
  name: string;
  initialMarking: number;
}

export interface PnmlTransition {
  id: string;
  name: string;
}

export interface PnmlArc {
  id: string;
  source: string;
  target: string;
  inscription: number;
}

export interface PnmlNet {
  id: string;
  name: string;
  places: PnmlPlace[];
  transitions: PnmlTransition[];
  arcs: PnmlArc[];
}

export interface ZipPnmlFile {
  name: string;
  content: string;
}