import { MathUtils } from "three";

export function createEngineFade(from: number, target: number, startedAt: number) {
  return {
    from,
    target,
    startedAt,
    duration: Math.max(1, 450 * Math.abs(target - from)),
  };
}

export function sampleEngineFade(fade: ReturnType<typeof createEngineFade>, now: number) {
  const t = MathUtils.clamp((now - fade.startedAt) / fade.duration, 0, 1);
  return MathUtils.lerp(fade.from, fade.target, t * t * (3 - 2 * t));
}
