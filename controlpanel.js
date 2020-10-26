
var cpanelroot = (req, res, admin) => {
  var html = `<!DOCTYPE HTML>
  <html>
  <head>
  <title>InvertedBot Control Panel</title>
  </head>
  </html>
  `;
  res.send(html);
};

module.exports = {
  cpanelroot:cpanelroot
};