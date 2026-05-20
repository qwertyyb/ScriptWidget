// JSWidget
// https://qwertyyb.github.io/JSWidget/
//
// import other js/jsx files
//

$import("util.jsx");
$import("define.js");

$render(
  <col>
    <text font="title">test</text>
    {textItems}
    <text font="title">{sum(1, 2)}</text>
  </col>
);
