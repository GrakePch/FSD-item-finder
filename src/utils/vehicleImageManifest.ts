import { useEffect, useState } from "react";

export type VehicleImageAngle = "top" | "iso";
export type VehicleImageSize = "xs" | "s" | "l" | "xl" | "xxl";

type VehicleImageManifest = {
  baseUrl?: string;
  byClassName?: Record<string, string>;
  vehicles?: Record<
    string,
    {
      views?: Partial<
        Record<
          VehicleImageAngle,
          {
            images?: Partial<Record<VehicleImageSize, string>>;
          }
        >
      >;
    }
  >;
};

type VehicleImageManifestState = {
  loaded: boolean;
  manifest: VehicleImageManifest | null;
};

const MANIFEST_BASE_URL = "https://ships.42kit.com/vehicles";
const SIZE_FALLBACKS: Record<VehicleImageSize, VehicleImageSize[]> = {
  xs: ["xs", "s", "l", "xl", "xxl"],
  s: ["s", "xs", "l", "xl", "xxl"],
  l: ["l", "s", "xl", "xs", "xxl"],
  xl: ["xl", "l", "xxl", "s", "xs"],
  xxl: ["xxl", "xl", "l", "s", "xs"],
};

let manifestCache: VehicleImageManifestState | null = null;
let manifestPromise: Promise<VehicleImageManifest | null> | null = null;

export function useVehicleImageSrc(
  className: string | undefined,
  angle: VehicleImageAngle = "top",
  size: VehicleImageSize = "s",
) {
  const [manifestState, setManifestState] = useState<VehicleImageManifestState>(
    manifestCache ?? { loaded: false, manifest: null },
  );

  useEffect(() => {
    let active = true;
    loadVehicleImageManifest().then((loadedManifest) => {
      if (active) {
        setManifestState({
          loaded: true,
          manifest: loadedManifest,
        });
      }
    });

    return () => {
      active = false;
    };
  }, []);

  if (!className || !manifestState.loaded) {
    return null;
  }

  return getVehicleImageSrcFromManifest(manifestState.manifest, className, angle, size);
}

function loadVehicleImageManifest() {
  if (!manifestPromise) {
    manifestPromise = fetch(`${MANIFEST_BASE_URL}/manifest.json`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Vehicle image manifest request failed: ${response.status}`);
        }

        return response.json() as Promise<VehicleImageManifest>;
      })
      .then((manifest) => {
        manifestCache = {
          loaded: true,
          manifest,
        };
        return manifest;
      })
      .catch((error) => {
        console.warn(error);
        manifestCache = {
          loaded: true,
          manifest: null,
        };
        return null;
      });
  }

  return manifestPromise;
}

function getVehicleImageSrcFromManifest(
  manifest: VehicleImageManifest | null,
  className: string,
  angle: VehicleImageAngle,
  preferredSize: VehicleImageSize,
) {
  const slug = manifest?.byClassName?.[className];
  const images = slug ? manifest?.vehicles?.[slug]?.views?.[angle]?.images : null;
  const imagePath = SIZE_FALLBACKS[preferredSize].map((size) => images?.[size]).find(Boolean);

  if (!imagePath) {
    return null;
  }

  const baseUrl = trimTrailingSlash(manifest?.baseUrl || MANIFEST_BASE_URL);
  return `${baseUrl}/${trimLeadingSlash(imagePath)}`;
}

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

function trimLeadingSlash(value: string) {
  return value.replace(/^\/+/, "");
}
