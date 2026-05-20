// 
// JSWidget 
// https://qwertyyb.github.io/JSWidget/
// 
// Usage for backgroundGradient attribute
// 

let radialGradient = {
  type: "radial",
  colors: ["orange", "red", "white"],
  center: "center",
  startRadius: 100,
  endRadius: 470,
};

$render(
  <col backgroundGradient={radialGradient} size="max">
    <text font="title">RadialGradient</text>
  </col>
);
