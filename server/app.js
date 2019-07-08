const express = require('express');

const port = 8080;

let app = express();

app.use(express.static('web'));

app.listen(port, () => {
    console.log('OctoprintDash listening on port ' + port)
})