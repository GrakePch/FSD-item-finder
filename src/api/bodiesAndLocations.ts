import bodies from "../data/bodies.json";
import locations from "../data/locations.json";

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
      parentBody: null,
      parentStar: null,
      x: body.x,
      y: body.y,
      z: body.z,
      locations: [],
      children: [],
    };
    flattened[body.name] = cbody;

    /* Build Forest */
    if (!body.parentBody) {
      systems[body.name] = cbody;
    } else {
      flattened[body.parentBody].children.push(cbody);
    }

    /* Link parent body & star */
    cbody.parentBody = flattened[body.parentBody] || null;
    cbody.parentStar = flattened[body.parentStar] || null;
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
    dictLocations[location.name] = cloc;

    /* Push to parent body */
    flattened[location.parentBody].locations.push(cloc);

    /* Link parent body & star */
    cloc.parentBody = flattened[location.parentBody] || null;
    cloc.parentStar = flattened[location.parentStar] || null;
  }
  return [systems, flattened, dictLocations];
}
