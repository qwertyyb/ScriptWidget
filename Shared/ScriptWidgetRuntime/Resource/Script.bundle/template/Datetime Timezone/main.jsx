
//
// JSWidget
// https://xnu.app/scriptwidget
//
//

const widget_size = $getenv("widget-size");
const widget_param = $getenv("widget-param");

const beijingDate = new Date().toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" }).toLocaleString();
const sanJoseDate = new Date().toLocaleString("zh-CN", { timeZone: "America/Los_Angeles" }).toLocaleString();
const newYorkDate = new Date().toLocaleString("zh-CN", { timeZone: "America/New_York" }).toLocaleString();
const sydneyDate = new Date().toLocaleString("zh-CN", { timeZone: "Australia/Sydney" }).toLocaleString();

$render(
    <row size="max">
        <col align="start">
            <text font={{ size: 14, design: "monospaced" }} color="blue">Beijing:</text>
            <text font={{ size: 14, design: "monospaced" }} color="green">San Jose:</text>
            <text font={{ size: 14, design: "monospaced" }} color="orange">New York:</text>
            <text font={{ size: 14, design: "monospaced" }} color="secondary">Sydney:</text>
        </col>
        <col align="start">
            <text font={{ size: 14, design: "monospaced" }} color="red">{beijingDate}</text>
            <text font={{ size: 14, design: "monospaced" }} color="yellow">{sanJoseDate}</text>
            <text font={{ size: 14, design: "monospaced" }} color="purple">{newYorkDate}</text>
            <text font={{ size: 14, design: "monospaced" }} color="gray">{sydneyDate}</text>
        </col>
    </row>
);
