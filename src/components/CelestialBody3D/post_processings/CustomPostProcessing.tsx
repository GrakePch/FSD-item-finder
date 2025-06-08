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

const int NUM_IN_SCATTER_POINTS = 64;
const int NUM_OPTICAL_DEPTH_POINTS = 64;
const float DENSITY_FALLOFF = 3.0;

// Improved scattering coefficients
const vec3 rayleighCoefficients = vec3(5.8e-6, 13.5e-6, 33.1e-6);
const vec3 mieCoefficients = vec3(21e-6);
// Increased Mie scattering factor for stronger forward scattering effect
const float mieG = 0.85;

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

// Height-based density models
vec2 getDensity(vec3 point) {
  float altitude = length(point - bodyCenter) - uRadiusBody;
  float height = (uRadiusAtmos - uRadiusBody);
  float altitude01 = clamp(altitude / height, 0.0, 1.0);
  
  // Rayleigh density at height - exponential falloff
  float rayleighDensity = exp(-altitude01 * DENSITY_FALLOFF);
  
  // Mie density - more concentrated in lower atmosphere for better fog effect
  float mieDensity = exp(-altitude01 * (DENSITY_FALLOFF * 1.5));
  
  return vec2(rayleighDensity, mieDensity);
}

// Improved optical depth calculation
vec2 opticalDepth(vec3 rayOrigin, vec3 rayDir, float rayLength) {
  vec3 samplePoint = rayOrigin;
  float stepSize = rayLength / float(NUM_OPTICAL_DEPTH_POINTS - 1);
  vec2 opticalDepth = vec2(0.0);

  for (int i = 0; i < NUM_OPTICAL_DEPTH_POINTS; ++i) {
    vec2 localDensity = getDensity(samplePoint);
    opticalDepth += localDensity * stepSize;
    samplePoint += rayDir * stepSize;
  }
  return opticalDepth;
}

// Rayleigh phase function
float rayleighPhase(float cosTheta) {
  return (3.0 / (16.0 * 3.1415926)) * (1.0 + cosTheta * cosTheta);
}

// Enhanced Mie phase function for stronger forward scattering
float miePhase(float cosTheta) {
  float g = mieG;
  float g2 = g * g;
  // Enhanced forward scattering with stronger directionality
  return (1.0 - g2) / (4.0 * 3.1415926 * pow(1.0 + g2 - 2.0 * g * cosTheta, 1.5));
}

// Fog calculation based on distance
float calculateFogFactor(float distToPoint) {
  // Adjust fog density based on your needs
  float fogDensity = 0.02;
  // Exponential fog formula
  return 1.0 - exp(-distToPoint * fogDensity);
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

  // Get dot product with light direction early for later use
  float cosTheta = dot(rayDir, uDirToSun);

  vec2 hitBodyInfo = raySphere(rayOrigin, rayDir, bodyCenter, uRadiusBody);
  float dstEnterBody = hitBodyInfo.x;

  vec2 hitInfo = raySphere(rayOrigin, rayDir, bodyCenter, uRadiusAtmos);
  float dstEnterAtmos = hitInfo.x;
  float dstThroughAtmos = min(hitInfo.y, dstEnterBody - dstEnterAtmos);

  // Initialize with input color
  outputColor = inputColor;
  
  // Add a subtle fog effect even when not directly intersecting the atmosphere
  // This creates a more realistic distant effect
  float distToBody = length(bodyCenter - rayOrigin);
  if (distToBody < uRadiusAtmos * 2.0 && dstThroughAtmos <= 0.0) {
    // Apply subtle atmospheric fog in the vicinity even when not directly intersecting
    float fogFactor = calculateFogFactor(distToBody) * 0.2;
    vec3 fogColor = vec3(0.6, 0.7, 0.9); // Slightly bluish atmospheric fog
    outputColor.rgb = mix(outputColor.rgb, fogColor, fogFactor);
  }

  // Only proceed with full calculation if ray intersects atmosphere
  if (dstThroughAtmos > 0.) {
    vec3 pointInAtmos = rayOrigin + rayDir * dstEnterAtmos;

    // Pre-calculate phase functions - these determine directional scattering
    // Enhanced Rayleigh phase to make it more visible when facing the sun
    float rayleighPhaseFactor = rayleighPhase(cosTheta) * 1.0;
    // Enhanced Mie phase for stronger forward scattering (sun-facing effect)
    float miePhaseFactor = miePhase(cosTheta) * 1.0; 

    // Adaptive step size based on ray length
    float stepSize = dstThroughAtmos / float(NUM_IN_SCATTER_POINTS);
    vec2 accumulatedOpticalDepth = vec2(0.0);
    vec3 rayleighScattering = vec3(0.0);
    vec3 mieScattering = vec3(0.0);
    
    // Calculate sun visibility for lighting intensity
    float sunVisibilityFactor = 1.0;
    {
      vec2 sunRayInfo = raySphere(rayOrigin, uDirToSun, bodyCenter, uRadiusBody);
      if (sunRayInfo.x < FLT_MAX) {
        // Even in shadow, allow some light
        sunVisibilityFactor = 0.15;
      }
    }
    
    float sunBoostFactor = 1.0;


    for (int i = 0; i < NUM_IN_SCATTER_POINTS; ++i) {
      float t = float(i) / float(NUM_IN_SCATTER_POINTS - 1);
      vec3 samplePoint = pointInAtmos + rayDir * (t * dstThroughAtmos);

      float distToCenter = length(samplePoint - bodyCenter);
      if (distToCenter > uRadiusAtmos || distToCenter < uRadiusBody) continue;

      vec2 localDensity = getDensity(samplePoint);

      vec2 sunRayInfo = raySphere(samplePoint, uDirToSun, bodyCenter, uRadiusBody);
      float sunRayAtmos = raySphere(samplePoint, uDirToSun, bodyCenter, uRadiusAtmos).y;
      bool inShadow = (sunRayInfo.x > 0.0 && sunRayInfo.x < sunRayAtmos);

      vec2 sunOpticalDepth;
      if (inShadow) {
        sunOpticalDepth = vec2(2.0);
      } else {
        float sunRayLength = sunRayAtmos;
        sunOpticalDepth = opticalDepth(samplePoint, uDirToSun, sunRayLength);
      }

      vec3 transmittanceToSun = vec3(
        exp(-(rayleighCoefficients.x * (sunOpticalDepth.x + accumulatedOpticalDepth.x) +
              mieCoefficients.x * (sunOpticalDepth.y + accumulatedOpticalDepth.y))),
        exp(-(rayleighCoefficients.y * (sunOpticalDepth.x + accumulatedOpticalDepth.x) +
              mieCoefficients.x * (sunOpticalDepth.y + accumulatedOpticalDepth.y))),
        exp(-(rayleighCoefficients.z * (sunOpticalDepth.x + accumulatedOpticalDepth.x) +
              mieCoefficients.x * (sunOpticalDepth.y + accumulatedOpticalDepth.y)))
      );
      transmittanceToSun = max(transmittanceToSun, vec3(0.02, 0.03, 0.05));

      rayleighScattering += localDensity.x * transmittanceToSun * stepSize;
      mieScattering += localDensity.y * transmittanceToSun * stepSize;

      accumulatedOpticalDepth += localDensity * stepSize;
    }

    vec3 transmittanceToCamera = vec3(
      exp(-(rayleighCoefficients.x * accumulatedOpticalDepth.x + mieCoefficients.x * accumulatedOpticalDepth.y)),
      exp(-(rayleighCoefficients.y * accumulatedOpticalDepth.x + mieCoefficients.x * accumulatedOpticalDepth.y)),
      exp(-(rayleighCoefficients.z * accumulatedOpticalDepth.x + mieCoefficients.x * accumulatedOpticalDepth.y))
    );

    float brightness = 0.6 + 0.8 * max(0.0, cosTheta);

    vec3 rayleighColor = rayleighScattering * rayleighCoefficients * rayleighPhase(cosTheta);
    vec3 mieColor = mieScattering * mieCoefficients * miePhase(cosTheta);

    vec3 finalColor = (rayleighColor + mieColor) * brightness;
    finalColor = clamp(finalColor, 0.0, 1.0);

    float scatterStrength = clamp(1.0 - length(transmittanceToCamera) * 0.5, 0.0, 1.0) * 0.05;
    float fogFactor = calculateFogFactor(dstThroughAtmos);
    float alpha = max(scatterStrength, fogFactor * 0.15);

    if (dstEnterBody < FLT_MAX) {
      float edgeFactor = smoothstep(0.9, 1.0, dstEnterBody / (uRadiusBody * 1.1));
      finalColor = mix(finalColor, finalColor * 0.7, edgeFactor);
      alpha = max(alpha, edgeFactor * 0.3);
    }

    outputColor = vec4(mix(inputColor.rgb, finalColor, alpha), 1.0);
  }
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
