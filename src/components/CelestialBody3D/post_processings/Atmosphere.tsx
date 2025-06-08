import { useMemo, forwardRef } from "react";
import { BlendFunction, Effect } from "postprocessing";
import { Uniform, Vector3, WebGLRenderer, WebGLRenderTarget } from "three";

const fsh = `
/* Adapted from https://www.youtube.com/watch?v=DxfEbulyFcY by Sebastian Lague*/

uniform float uTime;
uniform float uFovy;
uniform float uRadiusBody;
uniform float uRadiusAtmos;
uniform vec3 uCameraPos;
uniform vec3 uCameraDir;
uniform vec3 uDirToSun;
uniform vec3 uAtmosColor;
uniform vec3 uScatteringCoefficients;

#define FLT_MAX 3.402823466e+38

const int NUM_IN_SCATTER_POINTS = 6;
const int NUM_OPTICAL_DEPTH_POINTS = 4;
const float DENSITY_FALLOFF = 4.;

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

vec3 getLight(vec3 rayOrigin, vec3 rayDir, float rayLength, vec3 originalColor) {
  vec3 inScatterPoint = rayOrigin;
  float stepSize = rayLength / float(NUM_IN_SCATTER_POINTS - 1);
  vec3 inScatteredLight = vec3(0.0);
  float viewRayOpticalDepth = 0.;

  for (int i = 0; i < NUM_IN_SCATTER_POINTS; ++i) {
    float sunRayLength = raySphere(inScatterPoint, uDirToSun, bodyCenter, uRadiusAtmos).y;
    float sunRayOpticalDepth = opticalDepth(inScatterPoint, uDirToSun, sunRayLength);
    viewRayOpticalDepth = opticalDepth(inScatterPoint, -rayDir, stepSize * float(i));
    /* The proportion of light reaches inScatterPoint */
    vec3 transmittance = exp(-(sunRayOpticalDepth + viewRayOpticalDepth) * uScatteringCoefficients);  
    float localDensity = densityAtPoint(inScatterPoint);

    inScatteredLight += localDensity * transmittance * uScatteringCoefficients * stepSize;
    inScatterPoint += rayDir * stepSize;
  }
  float originalColorTransmittance = exp(-viewRayOpticalDepth);
  return originalColor * originalColorTransmittance + inScatteredLight;
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  bodyCenter = vec3(0, 0, 0);
  vec3 rayOrigin = uCameraPos;
  // Calculate rayDir for each pixel
  vec2 ndc = uv * 2.0 - 1.0; // [-1, 1] range
  float aspect = float(textureSize(inputBuffer, 0).x) / float(textureSize(inputBuffer, 0).y);
  float fovY = uFovy;
  float fovX = fovY * aspect;
  vec3 forward = normalize(uCameraDir);
  vec3 right = normalize(cross(forward, vec3(0.0, 1.0, 0.0)));
  vec3 up = normalize(cross(right, forward));
  float tanFovY = tan(radians(fovY) * 0.5);
  float tanFovX = tanFovY * aspect;
  vec3 rayDir = normalize(
    forward +
    ndc.x * tanFovX * right +
    ndc.y * tanFovY * up
  );

  vec2 hitBodyInfo = raySphere(rayOrigin, rayDir, bodyCenter, uRadiusBody);
  float dstEnterBody = hitBodyInfo.x;

  vec2 hitInfo = raySphere(rayOrigin, rayDir, bodyCenter, uRadiusAtmos);
  float dstEnterAtmos = hitInfo.x;
  float dstThroughAtmos = min(hitInfo.y, dstEnterBody - dstEnterAtmos);
  // dstThroughAtmos = hitInfo.y;

  if (dstThroughAtmos > 0.) {
    vec3 pointInAtmos = rayOrigin + rayDir * dstEnterAtmos;
    vec3 light = getLight(pointInAtmos, rayDir, dstThroughAtmos, inputColor.rgb);
    outputColor = vec4(light, 0.);
    // outputColor = mix(inputColor, vec4(uAtmosColor, 1.), light);
    // outputColor = mix(vec4(vec3(0.),1.), vec4(1.), light);
  } else {
    outputColor = inputColor;
  }
  // outputColor = vec4(vec3((dstThroughAtmos) / uRadiusAtmos*.5), 1.0);
  // outputColor = inputColor;
}
`;

let _uFovy: number;
let _uRadiusBody: number;
let _uRadiusAtmos: number;
let _uCameraPos: Vector3;
let _uCameraDir: Vector3;
let _uDirToSun: Vector3;

class ShaderProgramAtmosphere extends Effect {
  cameraRef: React.RefObject<any>;
  waveLengths = new Vector3(700, 530, 440);
  scatteringStrength = 16;

  constructor(
    fovy: number,
    radiusBody: number,
    radiusAtmos: number,
    dirToSun: Vector3,
    cameraRef: React.RefObject<any>,
    atmosColor: Vector3
  ) {
    super("ShaderProgramAtmosphere", fsh, {
      blendFunction: BlendFunction.NORMAL,
      uniforms: new Map<string, Uniform>([
        ["uTime", new Uniform(0)],
        ["uFovy", new Uniform(fovy)],
        ["uRadiusBody", new Uniform(radiusBody)],
        ["uRadiusAtmos", new Uniform(radiusAtmos)],
        ["uDirToSun", new Uniform(dirToSun)],
        ["uCameraPos", new Uniform(new Vector3())],
        ["uCameraDir", new Uniform(new Vector3())],
        ["uAtmosColor", new Uniform(atmosColor)],
        ["uScatteringCoefficients", new Uniform(new Vector3())],
      ]),
    });

    _uFovy = fovy;
    _uRadiusBody = radiusBody;
    _uRadiusAtmos = radiusAtmos;
    _uDirToSun = dirToSun;
    _uCameraPos = cameraRef.current ? cameraRef.current.position : new Vector3();
    _uCameraDir = new Vector3();
    this.cameraRef = cameraRef;
    this.cameraRef.current?.getWorldDirection(_uCameraDir);
  }
  update(
    renderer: WebGLRenderer,
    inputBuffer: WebGLRenderTarget,
    deltaTime: number
  ): void {
    this.uniforms.get("uTime").value += deltaTime;
    this.uniforms.get("uFovy").value = _uFovy;
    this.uniforms.get("uRadiusBody").value = _uRadiusBody / _uRadiusBody;
    this.uniforms.get("uRadiusAtmos").value = _uRadiusAtmos / _uRadiusBody;
    this.uniforms.get("uDirToSun").value = _uDirToSun;
    this.uniforms.get("uCameraPos").value = _uCameraPos
      .clone()
      .divideScalar(_uRadiusBody);
    this.cameraRef.current?.getWorldDirection(this.uniforms.get("uCameraDir").value);
    let scatterR = Math.pow(400 / this.waveLengths.x, 4) * this.scatteringStrength;
    let scatterG = Math.pow(400 / this.waveLengths.y, 4) * this.scatteringStrength;
    let scatterB = Math.pow(400 / this.waveLengths.z, 4) * this.scatteringStrength;
    this.uniforms.get("uScatteringCoefficients").value = new Vector3(
      scatterR,
      scatterG,
      scatterB
    );
  }
}

type AtmosphereProps = {
  fovy: number;
  radiusBody: number;
  radiusAtmos: number;
  dirToSun: Vector3;
  cameraRef: React.RefObject<any>;
  atmosColor: Vector3;
};

const Atmosphere = forwardRef<any, AtmosphereProps>(
  ({ fovy, radiusBody, radiusAtmos, dirToSun, cameraRef, atmosColor }, ref) => {
    const customShader = useMemo(
      () =>
        new ShaderProgramAtmosphere(
          fovy,
          radiusBody,
          radiusAtmos,
          dirToSun,
          cameraRef,
          atmosColor
        ),
      [fovy, radiusBody, radiusAtmos, dirToSun, cameraRef, atmosColor]
    );
    return <primitive ref={ref} object={customShader} dispose={null} />;
  }
);

export default Atmosphere;
