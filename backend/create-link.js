import fetch from "node-fetch";

const res = await fetch("http://localhost:3001/api/urls", {
  method: "POST",
  headers: { 
    "Content-Type": "application/json",
    "x-user-id": "69d9d23576cac3f0cc3a25dc"
  },
  body: JSON.stringify({ 
    originalUrl: "https://vprotechdigital.com/",
    customAlias: "vprotech"
  })
});
const data = await res.json();
console.log(data);