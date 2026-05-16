// 
// JSWidget 
// https://xnu.app/scriptwidget
// 
// Usage for component guage
// 

$render(
  <col size="max">
    <gauge 
      type="system"
      value="0.6"
      text="hello" // not display
      current="60"
      min="0"
      max="100"
      style="circular" // default
      >
    </gauge>
  </col>
);
