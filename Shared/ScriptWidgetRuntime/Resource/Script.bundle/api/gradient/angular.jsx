// 
// JSWidget 
// https://qwertyyb.github.io/JSWidget/
// 
// Usage for backgroundGradient attribute
// 

let angularGradient = {
  type: "angular",
  colors: ["green", "blue", "black", "green", "blue", "black", "green"],
  center: "center",
};

$render(
  <col backgroundGradient={angularGradient} size="max">
    <text font="title">AngularGradient</text>
  </col>
);
