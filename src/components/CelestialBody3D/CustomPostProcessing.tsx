import { useMemo, forwardRef } from "react";
import { BlendFunction, Effect } from "postprocessing";
import { Uniform, Vector3, WebGLRenderer, WebGLRenderTarget } from "three";

const fsh = `
uniform float uTime;
uniform float uFovy;
uniform float uCurrentDistance;
uniform float uRadiusBody;
uniform float uRadiusAtmos;
uniform vec3 uDirToSun;

#define FLT_MAX 3.402823466e+38

const int NUM_IN_SCATTER_POINTS = 10;
const int NUM_OPTICAL_DEPTH_POINTS = 5;
const float DENSITY_FALLOFF = 5.;

vec3 bodyCenter = vec3(0.);

vec2 raySphere(vec3 rayOrigin, vec3 rayDir, vec3 sphereCenter, float sphereRadius) {
  vec3 oc = rayOrigin - sphereCenter;
  float a = dot(rayDir, rayDir);
  float b = 2.0 * dot(oc, rayDir);
  float c = dot(oc, oc) - sphereRadius * sphereRadius;
  float discriminant = b * b - 4.0 * a * c;

  if (discriminant > 0.) {
    float s = sqrt(discriminant);
    float dstToSphereNear = max(0., (-b - s) / (2.0 * a));
    float dstToSphereFar = (-b + s) / (2.0 * a);

    if (dstToSphereFar >= 0.)
      return vec2(dstToSphereNear, dstToSphereFar - dstToSphereNear);
  }

  return vec2(FLT_MAX, 0.);
}

float densityAtPoint(vec3 point) {
  float altitude = length(point - bodyCenter) - uRadiusBody;
  float altitude01 = altitude / (uRadiusAtmos - uRadiusBody);
  float localDensity = exp(-altitude01 * DENSITY_FALLOFF) * (1. - altitude01);
  // localDensity = 1. - altitude01;
  return localDensity;
}

/* Optical Depth: Average density of atmosphere along the ray */
float opticalDepth(vec3 rayOrigin, vec3 rayDir, float rayLength) {
  vec3 samplePoint = rayOrigin;
  float stepSize = rayLength / float(NUM_OPTICAL_DEPTH_POINTS - 1);
  float opticalDepth = 0.;

  for (int i = 0; i < NUM_OPTICAL_DEPTH_POINTS; ++i) {
    float localDensity = densityAtPoint(samplePoint);
    opticalDepth += localDensity * stepSize;
    samplePoint += rayDir * stepSize;
  }
  return opticalDepth;
}

float getLight(vec3 rayOrigin, vec3 rayDir, float rayLength) {
  vec3 inScatterPoint = rayOrigin;
  float stepSize = rayLength / float(NUM_IN_SCATTER_POINTS - 1);
  float inScatteredLight = 0.0;

  for (int i = 0; i < NUM_IN_SCATTER_POINTS; ++i) {
    float sunRayLength = raySphere(inScatterPoint, uDirToSun, bodyCenter, uRadiusAtmos).y;
    float sunRayOpticalDepth = opticalDepth(inScatterPoint, uDirToSun, sunRayLength);
    // sunRayOpticalDepth = 0.;
    float viewRayOpticalDepth = opticalDepth(inScatterPoint, -rayDir, stepSize * float(i));
    // viewRayOpticalDepth = 0.;
    /* The proportion of light reaches inScatterPoint */
    float transmittance = exp(-(sunRayOpticalDepth + viewRayOpticalDepth));  
    float localDensity = densityAtPoint(inScatterPoint);

    inScatteredLight += localDensity * transmittance * stepSize;
    inScatterPoint += rayDir * stepSize;
  }

  return inScatteredLight;
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  bodyCenter = vec3(0, 0, uCurrentDistance);
  float aspect = float(textureSize(inputBuffer, 0).x) / float(textureSize(inputBuffer, 0).y);
  float fovyRad = radians(uFovy);
  float tanFovy2 = tan(fovyRad * 0.5);
  vec2 ndc = uv * 2.0 - 1.0;
  ndc.x *= aspect;
  vec3 rayOrigin = vec3(0.);
  vec3 rayDir = normalize(vec3(ndc.x * tanFovy2, ndc.y * tanFovy2, 1.0));

  vec2 hitBodyInfo = raySphere(rayOrigin, rayDir, bodyCenter, uRadiusBody);
  float dstEnterBody = hitBodyInfo.x;

  vec2 hitInfo = raySphere(rayOrigin, rayDir, bodyCenter, uRadiusAtmos);
  float dstEnterAtmos = hitInfo.x;
  float dstThroughAtmos = min(hitInfo.y, dstEnterBody - dstEnterAtmos);
  // dstThroughAtmos = hitInfo.y;

  if (dstThroughAtmos > 0.) {
    vec3 pointInAtmos = rayOrigin + rayDir * dstEnterAtmos;
    float light = getLight(pointInAtmos, rayDir, dstThroughAtmos);
    outputColor = mix(inputColor, vec4(1.), light);
    // outputColor = mix(vec4(vec3(0.),1.), vec4(1.), light);
    // outputColor = vec4(pow(vec3(dot(rayDir, -uDirToSun) * 0.5 + 0.5), vec3(1./2.2)), 1.0);
  } else {
    outputColor = inputColor;
  }
    // outputColor = vec4(vec3((dstThroughAtmos) / uRadiusAtmos*.5), 1.0);
  // outputColor = inputColor;
}
`;

let _uFovy: number;
let _uCurrentDistance: number;
let _uRadiusBody: number;
let _uRadiusAtmos: number;
let _uDirToSun: Vector3;

class CustomShader extends Effect {
  constructor(
    fovy: number,
    currentDistance: number,
    radiusBody: number,
    radiusAtmos: number,
    dirToSun: Vector3
  ) {
    super("CustomShader", fsh, {
      blendFunction: BlendFunction.NORMAL,
      uniforms: new Map<string, Uniform>([
        ["uTime", new Uniform(0)],
        ["uFovy", new Uniform(fovy)],
        ["uCurrentDistance", new Uniform(currentDistance)],
        ["uRadiusBody", new Uniform(radiusBody)],
        ["uRadiusAtmos", new Uniform(radiusAtmos)],
        ["uDirToSun", new Uniform(dirToSun)],
      ]),
    });

    _uFovy = fovy;
    _uCurrentDistance = currentDistance;
    _uRadiusBody = radiusBody;
    _uRadiusAtmos = radiusAtmos;
    _uDirToSun = dirToSun;
  }
  update(
    renderer: WebGLRenderer,
    inputBuffer: WebGLRenderTarget,
    deltaTime: number
  ): void {
    this.uniforms.get("uTime").value += deltaTime;
    this.uniforms.get("uFovy").value = _uFovy;
    this.uniforms.get("uCurrentDistance").value = _uCurrentDistance;
    this.uniforms.get("uRadiusBody").value = _uRadiusBody;
    this.uniforms.get("uRadiusAtmos").value = _uRadiusAtmos;
    this.uniforms.get("uDirToSun").value = _uDirToSun;
  }
}

type CustomPostProcessingProps = {
  fovy: number;
  currentDistance: number;
  radiusBody: number;
  radiusAtmos: number;
  dirToSun: Vector3;
};

const CustomPostProcessing = forwardRef<any, CustomPostProcessingProps>(
  ({ fovy, currentDistance, radiusBody, radiusAtmos, dirToSun }, ref) => {
    const customShader = useMemo(
      () => new CustomShader(fovy, currentDistance, radiusBody, radiusAtmos, dirToSun),
      [fovy, currentDistance, radiusBody, radiusAtmos, dirToSun]
    );
    return <primitive ref={ref} object={customShader} dispose={null} />;
  }
);

export default CustomPostProcessing;
