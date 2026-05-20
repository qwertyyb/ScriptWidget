// 
// JSWidget 
// https://qwertyyb.github.io/JSWidget/
// 
// Usage for component attribute frame
// 

/*

 size="max"
 size="max" justify="start" align="start"
 size={{width: 10, height: 20}}
 size={{width: 10, height: 20}} justify="start" align="start"
 
 size={{maxWidth: "fill", height: 20}}
 size={{width: 10, maxHeight: "fill"}}
 size={{maxWidth: "fill", height: 20}} justify="start" align="start"
 size={{width: 10, maxHeight: "fill"}} justify="start" align="start"


 justify: horizontal alignment, could be one of the values below:
   "center"
   "start"
   "end"

 align: vertical alignment, could be one of the values below:
   "center"
   "start"
   "end"
*/
$render(
  <col size="max">
    <rect size={{width: 50, height: 30}} color="green"></rect>
    <rect size={{width: 50, height: 30}} color="blue" corner="5"></rect>
  </col>
);
