// 
// JSWidget 
// https://xnu.app/scriptwidget
// 
// Usage for component date
// try to fix the expanding issue , we can add a frame attribute : size={{width: 50, height: "fill"}} justify="start"
//

$render(
  <row align="center">
    <text font={10} color="#aaaaaa,0.5">
      Last update:
    </text>
    <date font={10} color="#aaaaaa,0.5" date={Date.now()} size={{width: 50, height: "fill"}} justify="start" />
  </row>
);
