import bodies from "../data/starmap/body.json";
import bodiesRenderData from "../data/bodies_render_data.json";
import locations from "../data/starmap/locations.json";

const bodyRenderDataByCode = new Map(
  bodiesRenderData.map((renderData) => [renderData.code, renderData])
);

function isUsableBody(
  body: (typeof bodies)[number]
): body is (typeof bodies)[number] & { type: CelestialBodyType } {
  if (!body.type) return false;
  if (body.type === "LP" && !body.subType) return false;
  return true;
}

export function buildDataBodiesAndLocations(): [
  CelestialBodyDictionary,
  CelestialBodyDictionary,
  LocationDictionary
] {
  const systems: CelestialBodyDictionary = {};
  const flattened: CelestialBodyDictionary = {};
  const dictLocations: LocationDictionary = {};

  const usableBodies = bodies.filter(isUsableBody);

  for (const body of usableBodies) {
    const cbody: CelestialBody = {
      code: body.code,
      name: body.name,
      type: body.type,
      subType: body.subType,
      parentCode: body.parentCode,
      parentStarCode: body.parentStarCode,
      parentBody: null,
      parentStar: null,
      cartesianInKm: body.cartesianInKm,
      quaternion: body.quaternion,
      bodyRadiusInKm: body.bodyRadiusInKm,
      omRadiusInKm: body.omRadiusInKm,
      rotationPeriodInHours: body.rotationPeriodInHours,
      rotationCorrection: body.rotationCorrection,
      orbitPeriod: body.orbitPeriod,
      atmosphereHeightInKm: body.atmosphereHeightInKm,
      renderData: bodyRenderDataByCode.get(body.code),
      locations: [],
      children: [],
    };

    flattened[cbody.code] = cbody;
  }

  for (const body of Object.values(flattened)) {
    if (body.parentCode) {
      body.parentBody = flattened[body.parentCode] || null;
      body.parentBody?.children.push(body);
    } else {
      systems[body.code] = body;
    }
    body.parentStar = body.parentStarCode ? flattened[body.parentStarCode] || null : null;
  }

  for (const location of locations) {
    if (!location.type) continue;
    const cloc: SCLocation = {
      code: location.code,
      name: location.name,
      type: location.type as SCLocationType,
      designation: location.designation,
      restrictions: location.restrictions as SCLocationRestriction[],
      factions: location.factions,
      features: location.features,
      weather: location.weather,
      beaconMarker: location.beaconMarker,
      beaconType: location.beaconType,
      parentCode: location.parentCode,
      parentStarCode: location.parentStarCode,
      parentBody: null,
      parentStar: null,
      cartesianInKm: location.cartesianInKm,
      terminals: [],
    };

    dictLocations[cloc.code] = cloc;

    cloc.parentBody = flattened[location.parentCode] || null;
    cloc.parentStar = flattened[location.parentStarCode] || null;
    cloc.parentBody?.locations.push(cloc);
  }
  return [systems, flattened, dictLocations];
}
