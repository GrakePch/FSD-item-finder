import bodies from "../data/bodies.json";
import locations from "../data/locations.json";
import { toUrlKey } from "../utils";

export function buildDataBodiesAndLocations(): [
  CelestialBodyDictionary,
  CelestialBodyDictionary,
  LocationDictionary
] {
  const systems: CelestialBodyDictionary = {};
  const flattened: CelestialBodyDictionary = {};
  const dictLocations: LocationDictionary = {};

  for (const body of bodies) {
    let cbody: CelestialBody = {
      name: body.name,
      type: body.type,
      ordinal: body.ordinal,
      parentBody: null,
      parentStar: null,
      coordinateX: body.coordinateX,
      coordinateY: body.coordinateY,
      coordinateZ: body.coordinateZ,
      quaternionW: body.quaternionW,
      quaternionX: body.quaternionX,
      quaternionY: body.quaternionY,
      quaternionZ: body.quaternionZ,
      bodyRadius: body.bodyRadius,
      rotationRate: body.rotationRate,
      rotationCorrection: body.rotationCorrection,
      orbitAngle: body.orbitAngle,
      orbitRadius: body.orbitRadius,
      themeColorR: body.themeColorR,
      themeColorG: body.themeColorG,
      themeColorB: body.themeColorB,
      locations: [],
      children: [],
    };
    const urlKey = toUrlKey(body.name);
    flattened[urlKey] = cbody;

    /* Build Forest */
    if (!body.parentBody) {
      systems[urlKey] = cbody;
    } else {
      const parentKey = toUrlKey(body.parentBody);
      flattened[parentKey].children.push(cbody);
    }

    /* Link parent body & star */
    cbody.parentBody = flattened[toUrlKey(body.parentBody)] || null;
    cbody.parentStar = flattened[toUrlKey(body.parentStar)] || null;
  }

  for (const location of locations) {
    let cloc: SCLocation = {
      name: location.name,
      type: location.type,
      parentBody: null,
      parentStar: null,
      coordinateX: location.coordinateX,
      coordinateY: location.coordinateY,
      coordinateZ: location.coordinateZ,
      wikiLink: location.wikiLink,
      private: location.private,
      quantum: location.quantum,
      terminals: [],
    };
    const urlKey = toUrlKey(location.name);
    dictLocations[urlKey] = cloc;

    /* Push to parent body */
    flattened[toUrlKey(location.parentBody)].locations.push(cloc);

    /* Link parent body & star */
    cloc.parentBody = flattened[toUrlKey(location.parentBody)] || null;
    cloc.parentStar = flattened[toUrlKey(location.parentStar)] || null;
  }
  return [systems, flattened, dictLocations];
}
