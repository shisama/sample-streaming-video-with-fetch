const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path')

const dir = path.resolve(__dirname, "output");
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}

app.set('query parser', 'simple');

app.use((req, res, next) => {
  res.set('Cache-Control', 'no-cache');
  next();
});

app.set('query parser', 'simple');

app.use((req, res, next) => {
  res.set('Cache-Control', 'no-cache');
  next();
});

app.post('/send', (req, res) => {
  res.status(200);
  const filename = req.query.filename || String(Date.now());
  const fp = path.resolve(__dirname, "output", filename);
  if (fs.existsSync(fp)) fs.unlinkSync(fp);
  const writeStream = fs.createWriteStream(fp);
  
  req.on('data', (chunk) => {
    writeStream.write(chunk);
  });

  req.on('end', (chunk) => {
    if (res.writableEnded) return;
    res.send('Ended');
  });
});

app.use(express.static('public'));

const listener = app.listen(process.env.PORT || 3000, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});
