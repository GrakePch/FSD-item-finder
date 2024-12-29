const colorWordAtEnd = {
  alpha: ["dimgray"],
  black: ["#242424"],
  "dark red": ["darkred"],
  "dark green": ["darkgreen"],
  twilight: ["steelblue"],
  imperial: ["blueviolet"],
  woodland: ["darkolivegreen"],
  "crusader edition": ["#1772d5", "#36404f"],
  "hurston edition": ["#4b4b4b", "#d8b455"],
  "microtech edition": ["#26a8e0", "#8fc84c"],
  executive: ["#b69e64", "#4b565c"],
  lovestruck: ["deeppink"],
  envy: ["deeppink", "mediumpurple"],
  starcrossed: ["deeppink", "crimson"],
  slate: ["lightslategray"],
  obsidian: ["#000000"],

  arctic: ["#ffffff"],
  desert: ["moccasin"],
  autumn: ["darkkhaki"],
  singularity: ["#242424", "firebrick"],
  nightfire: ["#242424", "tomato"],
  iceborn: ["#242424", "#ffffff"],
};

const ItemColorIcon = ({ name }) => {
  let colors = [];
  if (name) {
    let nameLower = name.toLowerCase();
    for (const [suffix, cssColors] of Object.entries(colorWordAtEnd)) {
      if (nameLower.endsWith(" " + suffix)) {
        colors = cssColors;
        break;
      }
    }
    if (colors.length == 0) colors = name.split(" ").reverse()[0].split("/");
  }
  let angle = 0;
  let css = "conic-gradient(";

  /* Build CSS gradient */
  if (colors?.length > 0) {
    let angle = 360 / colors.length;
    colors.forEach((color, idx) => {
      let cssColor = colorWordAtEnd[color.toLowerCase()]?.[0] || color;
      if (idx < colors.length - 1)
        css += `${cssColor} ${idx * angle}deg ${(idx + 1) * angle}deg, `;
      else css += `${cssColor} ${idx * angle}deg 360deg)`;
    });
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-slim)",
        lineHeight: 1,
        width: "1.25rem",
        height: "1.25rem",
        border: "1px solid var(--color-text)",
        borderRadius: "50%",
        background: css,
        transform: CSS.supports("background", css)
          ? colors.length <= 2
            ? "rotate(180deg)"
            : `rotate(-${angle / 2}deg)`
          : undefined,
      }}
    >
      {CSS.supports("background", css) ? null : "?"}
    </div>
  );
};

export default ItemColorIcon;
