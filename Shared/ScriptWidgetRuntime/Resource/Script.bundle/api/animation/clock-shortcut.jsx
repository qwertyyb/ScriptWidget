
//
// JSWidget
// https://xnu.app/scriptwidget
//
// another basic clock animation
//


$render(
  <col size="max" justify="center" align="center">
      <stack>
          <col animation="clockHour">
              <circle size={{width: 15, height: 15}} color="red"></circle>
              <spacer/>
          </col>
          <col animation="clockMinute">
              <circle size={{width: 10, height: 10}} color="blue"></circle>
              <spacer/>
          </col>
          <col animation="clockSecond">
              <circle size={{width: 5, height: 5}} color="yellow"></circle>
              <spacer/>
          </col>
      </stack>
  </col>
);

