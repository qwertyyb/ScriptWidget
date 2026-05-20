// 
// JSWidget 
// https://qwertyyb.github.io/JSWidget/
// 
// Usage for component $getenv
// 

/*
 widget-size
 - large
 - medium
 - small
*/
const widget_size = $getenv("widget-size");

/*
 parameter config in system widget config panel
*/
const widget_param = $getenv("widget-param");

$render(
  <col size="max">
    <text font="title">Widget Size : {widget_size}</text>
    <text font="caption">Widget Parameter : {widget_param}</text>
  </col>
);
