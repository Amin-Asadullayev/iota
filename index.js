const express = require("express");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const { stderr } = require("process");

const app = express();

app.use(express.json());

app.use(express.static(path.join(__dirname, "/public")));

app.post("/api/v1/info", (req, res) => {
  const { url } = req.body;
  console.log(url);
  exec(
    `yt-dlp -j '${url}' | jq '{
    title: .title,
    duration: .duration_string,
    thumbnail: .thumbnail,
    formats: ([.formats[].ext | ascii_upcase] | unique),
    qualities: ([.formats[].height | select(. != null) | tostring + "p"] | unique)
  }'`,
    (err, out, stderr) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      return res.json(JSON.parse(out));
    },
  );
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Listening");
});
