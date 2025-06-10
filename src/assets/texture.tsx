import bodyAberdeen from "./bodies/aberdeen.webp";
import bodyAdir from "./bodies/adir.webp";
import bodyArcCorp from "./bodies/arccorp.webp";
import bodyArial from "./bodies/arial.webp";
import bodyBloom from "./bodies/bloom.webp";
import bodyCalliope from "./bodies/calliope.webp";
import bodyCellin from "./bodies/cellin.webp";
import bodyClio from "./bodies/clio.webp";
import bodyCrusader from "./bodies/crusader.webp";
import bodyDaymar from "./bodies/daymar.webp";
import bodyEuterpe from "./bodies/euterpe.webp";
import bodyFairo from "./bodies/fairo.webp";
import bodyFuego from "./bodies/fuego.webp";
import bodyHurston from "./bodies/hurston.webp";
import bodyIgnis from "./bodies/ignis.webp";
import bodyIta from "./bodies/ita.webp";
import bodyLyria from "./bodies/lyria.webp";
import bodyMagda from "./bodies/magda.webp";
import bodyMicroTech from "./bodies/microtech.webp";
import bodyMonox from "./bodies/monox.webp";
import bodyPyroI from "./bodies/pyro i.webp";
import bodyPyroIV from "./bodies/pyro iv.webp";
import bodyPyroV from "./bodies/pyro v.webp";
import bodyTerminus from "./bodies/terminus.webp";
import bodyVatra from "./bodies/vatra.webp";
import bodyVuur from "./bodies/vuur.webp";
import bodyWala from "./bodies/wala.webp";
import bodyYela from "./bodies/yela.webp";
import ringYela from "./rings/asteroid_ring_yela_diff.png";
import roughnessClio from "./bodies-roughness/clio.webp";
import roughnessEuterpe from "./bodies-roughness/euterpe.webp";
import roughnessHurston from "./bodies-roughness/hurston.webp";
import roughnessMicroTech from "./bodies-roughness/microtech.webp";
import emissionArcCorp from "./bodies-emissive/planet_arccorp_worn_glow_white_wide.png";
import bodyHDAberdeen from "./bodies-hd/aberdeen.webp";
import bodyHDAdir from "./bodies-hd/adir.webp";
import bodyHDArcCorp from "./bodies-hd/arccorp.webp";
import bodyHDArial from "./bodies-hd/arial.webp";
import bodyHDBloom from "./bodies-hd/bloom.webp";
import bodyHDCalliope from "./bodies-hd/calliope.webp";
import bodyHDCellin from "./bodies-hd/cellin.webp";
import bodyHDClio from "./bodies-hd/clio.webp";
import bodyHDCrusader from "./bodies-hd/crusader.webp";
import bodyHDDaymar from "./bodies-hd/daymar.webp";
import bodyHDEuterpe from "./bodies-hd/euterpe.webp";
import bodyHDFairo from "./bodies-hd/fairo.webp";
import bodyHDFuego from "./bodies-hd/fuego.webp";
import bodyHDHurston from "./bodies-hd/hurston.webp";
import bodyHDIgnis from "./bodies-hd/ignis.webp";
import bodyHDIta from "./bodies-hd/ita.webp";
import bodyHDLyria from "./bodies-hd/lyria.webp";
import bodyHDMagda from "./bodies-hd/magda.webp";
import bodyHDMicroTech from "./bodies-hd/microtech.webp";
import bodyHDMonox from "./bodies-hd/monox.webp";
import bodyHDPyroI from "./bodies-hd/pyro i.webp";
import bodyHDPyroIV from "./bodies-hd/pyro iv.webp";
import bodyHDTerminus from "./bodies-hd/terminus.webp";
import bodyHDVatra from "./bodies-hd/vatra.webp";
import bodyHDVuur from "./bodies-hd/vuur.webp";
import bodyHDWala from "./bodies-hd/wala.webp";
import bodyHDYela from "./bodies-hd/yela.webp";

const texture: {
  body: Record<string, string>;
  bodyHD: Record<string, string>;
  ring: Record<string, string>;
  roughness: Record<string, string>;
  emission: Record<string, string>;
} = {
  body: {
    Aberdeen: bodyAberdeen,
    Adir: bodyAdir,
    ArcCorp: bodyArcCorp,
    Arial: bodyArial,
    Bloom: bodyBloom,
    Calliope: bodyCalliope,
    Cellin: bodyCellin,
    Clio: bodyClio,
    Crusader: bodyCrusader,
    Daymar: bodyDaymar,
    Euterpe: bodyEuterpe,
    Fairo: bodyFairo,
    Fuego: bodyFuego,
    Hurston: bodyHurston,
    Ignis: bodyIgnis,
    Ita: bodyIta,
    Lyria: bodyLyria,
    Magda: bodyMagda,
    microTech: bodyMicroTech,
    Monox: bodyMonox,
    "Pyro I": bodyPyroI,
    "Pyro IV": bodyPyroIV,
    "Pyro V": bodyPyroV,
    Terminus: bodyTerminus,
    Vatra: bodyVatra,
    Vuur: bodyVuur,
    Wala: bodyWala,
    Yela: bodyYela,
  },
  ring: {
    Yela: ringYela,
  },
  roughness: {
    Clio: roughnessClio,
    Euterpe: roughnessEuterpe,
    Hurston: roughnessHurston,
    microTech: roughnessMicroTech,
  },
  emission: {
    ArcCorp: emissionArcCorp,
  },
  bodyHD: {
    Aberdeen: bodyHDAberdeen,
    Adir: bodyHDAdir,
    ArcCorp: bodyHDArcCorp,
    Arial: bodyHDArial,
    Bloom: bodyHDBloom,
    Calliope: bodyHDCalliope,
    Cellin: bodyHDCellin,
    Clio: bodyHDClio,
    Crusader: bodyHDCrusader,
    Daymar: bodyHDDaymar,
    Euterpe: bodyHDEuterpe,
    Fairo: bodyHDFairo,
    Fuego: bodyHDFuego,
    Hurston: bodyHDHurston,
    Ignis: bodyHDIgnis,
    Ita: bodyHDIta,
    Lyria: bodyHDLyria,
    Magda: bodyHDMagda,
    microTech: bodyHDMicroTech,
    Monox: bodyHDMonox,
    "Pyro I": bodyHDPyroI,
    "Pyro IV": bodyHDPyroIV,
    Terminus: bodyHDTerminus,
    Vatra: bodyHDVatra,
    Vuur: bodyHDVuur,
    Wala: bodyHDWala,
    Yela: bodyHDYela,
  },
};

export default texture;
