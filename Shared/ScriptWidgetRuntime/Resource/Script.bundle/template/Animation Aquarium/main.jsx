//
// JSWidget
// https://qwertyyb.github.io/JSWidget/
//
// Animation Aquarium
//
// Description: Animation Aquarium
//

/*
🛟
🪼                   🐟🐠             🫧
           🫧                          🫧   🐡
🪼                 🐬       
     🪼                        🦐     🫧
🍀🪸🌿🪸⚓️🗿🐙🐙🌿🪸
*/

let fishHorizontal = {
  type: "swing",
  duration: 20,
  direction: "horizontal", // "horizontal", "vertical"
  distance: 100,
};

let fishVertical = {
  type: "swing",
  duration: 30,
  direction: "vertical", // "horizontal", "vertical"
  distance: 70,
};

let bubbleVertical = {
  type: "swing",
  duration: 15,
  direction: "vertical", // "horizontal", "vertical"
  distance: 50,
};

let linearGradient = {
  type: "linear",
  colors: ["#013A63", "#1E81B0", "#E0FBFC"],
  startPoint: "top",
  endPoint: "bottom",
};
$render(
  <col backgroundGradient={linearGradient} size="max" align="start">
    <row align="start">
      <text font="body">  🛟</text>
      <spacer />
    </row>
    <row align="start">
      <text font="body">  🪼        🐟    🐠         🫧</text>
      <text font="body" animation={fishVertical}>🐠</text>
      <text font="body">         🫧</text>
      <spacer />
    </row>
    <row align="start">
      <text font="body">  🫧</text>
      <text font="body">       </text>
      <text font="body" animation={bubbleVertical}>🫧</text>
      <text font="body" animation={fishHorizontal}>🐡🐡</text>
      <spacer />
    </row>
    <row align="start">
      <text font="body">  🪼    🫧    🐬       🐬</text>
    </row>
    <row align="start">
      <text font="body">  🪼   🫧    🦐          🫧🫧</text>
      <spacer />
    </row>
    <row align="start">
      <text font="body">  🍀 🪸🌿🪸⚓️🗿🐙🐙  🌿🌿 🌿🪸🪸</text>
      <spacer />
    </row>
  </col>
);
