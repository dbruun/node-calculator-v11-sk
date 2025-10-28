const express = require('express');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('public'));

const routes = require("./api/routes");
routes(app);

// Error handler middleware - register once for all routes
app.use(function(err, _req, res, next) {
    if (res.headersSent) {
        return next(err);
    }

    res.status(400);
    res.json({ error: err.message });
});

if (!module.parent) {
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}

module.exports = app;
