
//
// JSWidget
// https://xnu.app/scriptwidget
//
// basic clock animation
//


$render(
  <col size="max" justify="center" align="center">
      <stack>
          <col animation="clockSecond">
              <rect size={{width: 5, height: 50}} color="yellow"></rect>
              <rect size={{width: 5, height: 50}} color="clear"></rect>
          </col>
          <col animation="clockMinute">
              <rect size={{width: 5, height: 40}} color="blue"></rect>
              <rect size={{width: 5, height: 40}} color="clear"></rect>
          </col>
          <col animation="clockHour">
              <rect size={{width: 5, height: 30}} color="red"></rect>
              <rect size={{width: 5, height: 30}} color="clear"></rect>
          </col>
      </stack>
  </col>
);

