// 
// JSWidget 
// https://qwertyyb.github.io/JSWidget/
// 
// Usage for backgroundGradient attribute
// 

let linearGradient = {
  type: "linear",
  colors: ["blue", "white", "pink"],
  startPoint: "topLeading",
  endPoint: "bottomTrailing",
};

$render(
  <col backgroundGradient={linearGradient} size="max">
    <text font="title">LinearGradient</text>
  </col>
);
