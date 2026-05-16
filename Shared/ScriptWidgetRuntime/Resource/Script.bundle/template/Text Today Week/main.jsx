// 
// JSWidget 
// https://xnu.app/scriptwidget
// 
// 

var d = new Date();

const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
let day = weekday[d.getDay()];


$render(
    <col
        backgroundColor="red"
        size="max" justify="center" align="center"
    >
        <text font="largeTitle" color="black" padding={10}>
            {day}
        </text>
    </col>
);
