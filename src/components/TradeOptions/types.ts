export type LocationTree = {
  name: string;
  subs: LocationForestMap;
  option?: TradeOption;
};

export type LocationForestMap = Record<string, LocationTree>;

export type LocationTreeShallow = {
  locs: string[];
  depth: number;
  subs: LocationTreeShallow[];
  option?: TradeOption;
};

export type LocationTreeRow = {
  id: string;
  parentId?: string;
  locs: string[];
  depth: number;
  option?: TradeOption;
};

export type TreeLine = {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

export type TradeType = "buy" | "sell" | "rent";
