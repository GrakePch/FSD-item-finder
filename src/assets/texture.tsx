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

const texture: { body: Record<string, string>; ring: Record<string, string>; roughness: Record<string, string> } = {
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
};

export default texture;
