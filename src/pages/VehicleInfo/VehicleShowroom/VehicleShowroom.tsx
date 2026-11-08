import {
  Component,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Canvas, useThree } from "@react-three/fiber";
import Icon from "@mdi/react";
import { mdiRestore } from "@mdi/js";
import { useTranslation } from "react-i18next";
import VehicleImage from "../../../components/VehicleImage";
import ModelScene from "./ModelScene";
import ShowroomControls from "./ShowroomControls";
import useVehicleGltf from "./useVehicleGltf";
import { getModelCapabilities, type VehiclePose } from "./modelControls";
import { MODEL_FOV } from "./cameraReset";
import type { VehicleModel } from "./modelSource";
import "./VehicleShowroom.css";

type RenderBoundaryProps = {
  children: ReactNode;
  onError: (error: unknown) => void;
};

class RenderBoundary extends Component<RenderBoundaryProps, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    this.props.onError(error);
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function ContextEvents({ onError }: { onError: (error: unknown) => void }) {
  const { gl } = useThree();
  useEffect(() => {
    const canvas = gl.domElement;
    const onLost = () => onError(new Error("WebGL context lost"));
    canvas.addEventListener("webglcontextlost", onLost);
    return () => canvas.removeEventListener("webglcontextlost", onLost);
  }, [gl, onError]);
  return null;
}

type VehicleShowroomProps = {
  vehicleClassName: string;
  source: VehicleModel;
};

const VehicleShowroom = ({ vehicleClassName, source }: VehicleShowroomProps) => {
  const { t } = useTranslation();
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [pose, setPose] = useState<VehiclePose>({
    gear: false,
    doors: false,
    lights: false,
    engines: false,
    vtol: false,
  });
  const [viewMode, setViewMode] = useState<"2d" | "3d">("3d");
  const [narrow, setNarrow] = useState(
    () => window.matchMedia("(max-width: 1099px)").matches
  );
  const [visible, setVisible] = useState(true);
  const [viewAdjusted, setViewAdjusted] = useState(false);
  const frame = useRef<HTMLDivElement>(null);
  const resetView = useRef<(() => void) | null>(null);
  const onResetReady = useCallback((reset: (() => void) | null) => {
    resetView.current = reset;
  }, []);
  const onReady = useCallback(() => setReady(true), []);
  const onError = useCallback((error: unknown) => {
    console.error("Vehicle model could not render", error);
    setFailed(true);
    setReady(false);
  }, []);
  const { model, progress } = useVehicleGltf(source, attempt, onError);
  const capabilities = useMemo(() => getModelCapabilities(model), [model]);
  const is3d = viewMode === "3d";
  const controlsDisabled = !ready || failed;

  useEffect(() => {
    const query = window.matchMedia("(max-width: 1099px)");
    const update = () => setNarrow(query.matches);
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) =>
      setVisible(entry.isIntersecting)
    );
    if (frame.current) observer.observe(frame.current);
    return () => observer.disconnect();
  }, []);

  const retry = () => {
    setFailed(false);
    setReady(false);
    setViewAdjusted(false);
    setAttempt((value) => value + 1);
  };

  const toggle = (key: keyof VehiclePose) => {
    setPose((current) => ({ ...current, [key]: !current[key] }));
  };

  const image = (
    <div className="showroom-image">
      <VehicleImage
        vehicleClassName={vehicleClassName}
        angle="iso"
        size="xl"
        className="showroom-fallback"
        alt=""
      />
    </div>
  );

  return (
    <div className="vehicle-showroom" ref={frame}>
      <div
        className="showroom-canvas"
        role="img"
        aria-label={t("Showroom.modelLabel")}
        aria-hidden={!is3d}
      >
        {!failed && model ? (
          <RenderBoundary key={attempt} onError={onError}>
            <Canvas
              frameloop={visible && is3d ? "demand" : "never"}
              dpr={[1, 1.5]}
              camera={{ fov: MODEL_FOV, position: [-65, 45, -70] }}
              gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
              fallback={null}
            >
              <ContextEvents onError={onError} />
              <ModelScene
                model={model}
                pose={pose}
                narrow={narrow}
                active={visible && is3d}
                onResetReady={onResetReady}
                onReady={onReady}
                onViewAdjusted={setViewAdjusted}
              />
            </Canvas>
          </RenderBoundary>
        ) : (
          image
        )}
      </div>
      {!is3d && image}
      {is3d && (!ready || failed) && (
        <div className="showroom-status" role="status" aria-live="polite">
          <span>
            {failed
              ? t("Showroom.failed")
              : progress === 100
                ? t("Showroom.preparing")
                : t("Showroom.loading", { progress })}
          </span>
          {failed && (
            <button type="button" onClick={retry}>
              {t("Showroom.retry")}
            </button>
          )}
        </div>
      )}
      <div className="showroom-bottom">
        <div
          className="showroom-view-tools"
          role="group"
          aria-label={t("Showroom.viewTools")}
        >
          <button
            type="button"
            onClick={() => setViewMode(is3d ? "2d" : "3d")}
            aria-label={t("Showroom.switchView", { mode: is3d ? "2D" : "3D" })}
          >
            {is3d ? "2D" : "3D"}
          </button>
          {is3d && viewAdjusted && !controlsDisabled && (
            <button type="button" onClick={() => resetView.current?.()}>
              <Icon path={mdiRestore} size="1.1rem" />
              {t("Showroom.reset")}
            </button>
          )}
        </div>
        {is3d && (
          <ShowroomControls
            capabilities={capabilities}
            pose={pose}
            disabled={controlsDisabled}
            onToggle={toggle}
          />
        )}
      </div>
    </div>
  );
};

export default VehicleShowroom;
