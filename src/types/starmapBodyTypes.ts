export type VerseGuideSystemCode = "NYX" | "PYRO" | "STANTON";

export type VerseGuideBodyCode = VerseGuideSystemCode | `${VerseGuideSystemCode}/${string}`;

export type VerseGuideCartesianInKm = {
  x: number;
  y: number;
  z: number;
};

export type VerseGuideQuaternion = {
  w: number;
  x: number;
  y: number;
  z: number;
};

export type VerseGuideBodyType =
  | "JUMPPOINT"
  | "LP"
  | "PLANET"
  | "PLANETOID"
  | "SATELLITE"
  | "SINGLE_STAR";

export type VerseGuideBodySubType =
  | "Gas Giant"
  | "Ice Giant"
  | "L1"
  | "L2"
  | "L3"
  | "L4"
  | "L5"
  | "Planetary Moon"
  | "Protoplanet"
  | "SINGLE_STAR"
  | "Smog Planet"
  | "Super-Earth"
  | "Terrestrial Rocky";

export type VerseGuideAffiliationCode = "UNC" | "uee";

export type VerseGuideAffiliationName = "UEE" | "Unclaimed";

export type VerseGuideAffiliationColor = "#48bbd4" | "#f6851f";

export type VerseGuideAffiliation = {
  code: VerseGuideAffiliationCode;
  name: VerseGuideAffiliationName;
  color: VerseGuideAffiliationColor;
};

export type VerseGuideAtmosphereCompoundCode =
  | "Ar"
  | "CH4"
  | "CO"
  | "CO2"
  | "H"
  | "H2O"
  | "N"
  | "NH3"
  | "NaCl"
  | "O2"
  | "SO"
  | "SO2";

export type VerseGuideAtmosphereCompounds = Partial<
  Record<VerseGuideAtmosphereCompoundCode, string>
>;

export type VerseGuideBodyJson = {
  code: VerseGuideBodyCode;
  name: string;
  type: VerseGuideBodyType | null;
  subType: VerseGuideBodySubType | null;
  parentCode: VerseGuideBodyCode | null;
  parentStarCode: VerseGuideSystemCode | null;
  cartesianInKm: VerseGuideCartesianInKm;
  bodyRadiusInKm: number;
  quaternion: VerseGuideQuaternion;
  habitable?: boolean | null;
  affiliation?: VerseGuideAffiliation;
  orbitPeriod?: number;
  atmosphere_compounds?: VerseGuideAtmosphereCompounds;
  atmosphereHeightInKm?: number;
  omRadiusInKm?: number;
  rotationPeriodInHours?: number;
  rotationCorrection?: number;
};
