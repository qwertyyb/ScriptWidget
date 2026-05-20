// 
// JSWidget 
// https://qwertyyb.github.io/JSWidget/
// 
// Usage for component chart
// 

let data = [
  { label:  "Production", value: 4000, category: "Gizmos" },
  { label:  "Production", value: 5000, category: "Gadgets" },
  { label:  "Production", value: 6000, category: "Widgets" },
]

$render(
  <col size="max">
    <chart 
      type="bar-y" // required
      data={data}
      category={true}
      padding={20} // optional , general
      >
    </chart>
  </col>
);
