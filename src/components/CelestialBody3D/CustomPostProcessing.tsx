import { useMemo, forwardRef } from "react";
import { BlendFunction, Effect } from "postprocessing";
import { Uniform } from "three";

// Custom shader effect (simple color shift example)
class CustomShader extends Effect {
  constructor() {
    super(
      "CustomShader",
      `
      uniform float uTime;
      void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
        outputColor = inputColor;
      }
      `,
      {
        blendFunction: BlendFunction.NORMAL,
        uniforms: new Map([["uTime", new Uniform(0)]]),
      }
    );
  }
  update(
    renderer: import("three").WebGLRenderer,
    inputBuffer: import("three").WebGLRenderTarget,
    deltaTime: number
  ): void {
    this.uniforms.get("uTime").value += deltaTime;
  }
}

const CustomPostProcessing = forwardRef(({}, ref) => {
  const customShader = useMemo(() => new CustomShader(), []);
  return <primitive ref={ref} object={customShader} dispose={null} />;
});

export default CustomPostProcessing;
