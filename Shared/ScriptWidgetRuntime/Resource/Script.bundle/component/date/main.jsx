// 
// JSWidget 
// https://qwertyyb.github.io/JSWidget/
// 
// Usage for component date
// 

$render(
  <col>
    <date font="caption" date="now" style="time" />
    <date font="caption" date="now" style="date" />
    <date font="caption" date="start of today" style="timer" />
    <date font="title" date={Date.now()} style="timer" />
  </col>
);
