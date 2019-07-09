const express = require('express');
const path = require('path');

const port = 8080;

let app = express();

app.use(express.static(path.resolve(__dirname, 'web')));

app.listen(port, () => {
    console.log('OctoprintDash listening on port ' + port)
})