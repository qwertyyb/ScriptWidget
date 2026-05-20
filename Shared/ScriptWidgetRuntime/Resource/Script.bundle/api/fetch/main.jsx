// 
// JSWidget 
// https://qwertyyb.github.io/JSWidget/
// 
// Usage for api $fetch
// 

// query json example
// https://jsonplaceholder.typicode.com/

const url = "https://jsonplaceholder.typicode.com/todos/1";
const result = await fetch(url);
console.log(result);

const model = JSON.parse(result);

$render(
  <col>
    <text font="title">receive title: {model.title}</text>
  </col>
);
