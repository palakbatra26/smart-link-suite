import http from "http";

const options = {
  hostname: "localhost",
  port: 3001,
  path: "/api/admin/make-admin",
  method: "PUT",
  headers: {
    "Content-Type": "application/json"
  }
};

const req = http.request(options, (res) => {
  let data = "";
  res.on("data", (chunk) => data += chunk);
  res.on("end", () => console.log(data));
});

req.on("error", (e) => console.error(e.message));

req.write(JSON.stringify({ email: "palakbatra79@gmail.com" }));
req.end();