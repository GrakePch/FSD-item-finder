import { useMemo, forwardRef } from "react";
import { BlendFunction, Effect } from "postprocessing";
import { Uniform, Vector3, WebGLRenderer, WebGLRenderTarget } from "three";

const fsh = `
uniform float uTime;
uniform float uFovy;
uniform float uRadiusBody;
uniform float uRadiusAtmos;
uniform vec3 uCameraPos;
uniform vec3 uCameraDir;
uniform vec3 uDirToSun;
uniform vec3 uAtmosColor;

#define FLT_MAX 3.402823466e+38

const int NUM_IN_SCATTER_POINTS = 10;
const int NUM_OPTICAL_DEPTH_POINTS = 5;
const float DENSITY_FALLOFF = 0.1;

vec3 bodyCenter = vec3(0, 0, 0);

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

  float atmosDensity = (dstThroughAtmos) / uRadiusAtmos*.5;
  vec3 sphereNormal = (rayOrigin + rayDir * dstEnterAtmos - bodyCenter) / uRadiusAtmos;
  float lightIntensity = atmosDensity * max(dot(uDirToSun, sphereNormal)+.5, 0.);
  // lightIntensity = (exp(lightIntensity * DENSITY_FALLOFF) - 1.) / (exp(DENSITY_FALLOFF) - 1.);
  lightIntensity = pow(lightIntensity, 2.2);
  outputColor = mix(inputColor, vec4(uAtmosColor, 1.), lightIntensity);
}
`;

let _uFovy: number;
let _uRadiusBody: number;
let _uRadiusAtmos: number;
let _uCameraPos: Vector3;
let _uCameraDir: Vector3;
let _uDirToSun: Vector3;

class ShaderProgramAtmosphereLite extends Effect {
  cameraRef: React.RefObject<any>;
  constructor(
    fovy: number,
    radiusBody: number,
    radiusAtmos: number,
    dirToSun: Vector3,
    cameraRef: React.RefObject<any>,
    atmosColor: Vector3
  ) {
    super("ShaderProgramAtmosphereLite", fsh, {
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
    this.uniforms.get("uRadiusBody").value = _uRadiusBody;
    this.uniforms.get("uRadiusAtmos").value = _uRadiusAtmos;
    this.uniforms.get("uDirToSun").value = _uDirToSun;
    this.uniforms.get("uCameraPos").value = _uCameraPos;
    this.uniforms.get("uAtmosColor").value = this.uniforms.get("uAtmosColor").value;
    this.cameraRef.current?.getWorldDirection(this.uniforms.get("uCameraDir").value);
  }
}

type AtmosphereLiteProps = {
  fovy: number;
  radiusBody: number;
  radiusAtmos: number;
  dirToSun: Vector3;
  cameraRef: React.RefObject<any>;
  atmosColor: Vector3;
};

const AtmosphereLite = forwardRef<any, AtmosphereLiteProps>(
  ({ fovy, radiusBody, radiusAtmos, dirToSun, cameraRef, atmosColor }, ref) => {
    const customShader = useMemo(
      () =>
        new ShaderProgramAtmosphereLite(
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

export default AtmosphereLite;
