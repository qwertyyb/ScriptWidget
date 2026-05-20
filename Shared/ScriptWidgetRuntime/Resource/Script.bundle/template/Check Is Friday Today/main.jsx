// 
// JSWidget 
// https://qwertyyb.github.io/JSWidget/
// 
// 

var d = new Date();
var n = d.getDay();
console.log(n);

let linearGradient = {
  type: "linear",
  colors: ["yellow", "white"],
  startPoint: "top",
  endPoint: "bottom",
};

$render(
  <col
    backgroundGradient={linearGradient}
    size="max" justify="start"
  >
    <row padding={10}>
      <col align="start">
        <text font="body" color="black">
          {d.getFullYear()}-{d.getMonth() + 1}-{d.getDate()}
        </text>
        <text font="body" color="black">
          Is Friday today ?
        </text>
      </col>
      <spacer />
    </row>
    <spacer />
    <text font="largeTitle" color="black" padding={10}>
      {n == 5 ? "Yes😊" : "No🤔"}
    </text>
  </col>
);
