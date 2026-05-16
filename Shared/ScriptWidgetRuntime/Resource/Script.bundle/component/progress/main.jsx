//
// JSWidget
// https://xnu.app/scriptwidget
//
// component: progress
//

$render(
  <col size="max" padding={12}>
    <text font="caption">Loading</text>
    <progress value="0.72" total="1" color="#3b82f6" />
    <progress value="0.45" total="1" style="circular" color="#10b981" size="32" />
  </col>
);
