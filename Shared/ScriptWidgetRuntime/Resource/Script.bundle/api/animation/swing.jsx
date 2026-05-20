// 
// JSWidget 
// https://qwertyyb.github.io/JSWidget/
// 
// Swing Sample
// 


let animationHorizontalDefinition = {
  type: "swing",
  duration: 2,
  direction: "horizontal", // "horizontal", "vertical"
  distance: 100,
}

let animationVerticalDefinition = {
  type: "swing",
  duration: 2,
  direction: "vertical", // "horizontal", "vertical"
  distance: 100,
}


$render(
  <col size="max">
    <circle size={{width: 30, height: 30}} color="green" animation={animationHorizontalDefinition}></circle>
    <circle size={{width: 30, height: 30}} color="orange" animation={animationVerticalDefinition}></circle>
  </col>
);
