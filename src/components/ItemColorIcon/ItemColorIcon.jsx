const ItemColorIcon = ({ name }) => {
  let colors = name.split(" ").reverse()[0].split("/");
  let angle = 360 / colors.length;
  let css = "conic-gradient(";
  colors.forEach((color, idx) => {
    if (idx < colors.length - 1)
      css += `${color} ${idx * angle}deg ${(idx + 1) * angle}deg, `;
    else css += `${color} ${idx * angle}deg 360deg)`;
  });

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
