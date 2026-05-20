//
// JSWidget
// https://qwertyyb.github.io/JSWidget/
//
// Usage for api file
//

const raw = $file.readString("data.json");
const json = JSON.parse(raw);
console.log("readString:", raw);
console.log("parsed name:", json.name);

console.log("list root:", $file.list(""));

const wrote = $file.writeString("notes.txt", "hello from $file");
console.log("writeString notes.txt:", wrote);

const removed = $file.remove("notes.txt");
console.log("remove notes.txt:", removed);
