// 
// JSWidget 
// https://qwertyyb.github.io/JSWidget/
// 
// Animation Clock with more parameters
// 


let animationDefinition = {
  type: "clock",
  timezone: "current", // "America/New_York" , "America/Los_Angeles" ,  "Asia/Shanghai"
  anchor: "center",
  interval: 30,
}


$render(
  <col size="max" animation={animationDefinition}>
    <circle size={{width: 30, height: 30}} color="green"></circle>
    <circle size={{width: 30, height: 30}} color="pink"></circle>
    <circle size={{width: 30, height: 30}} color="gray"></circle>
    <circle size={{width: 90, height: 90}} color="orange"></circle>
  </col>
);
