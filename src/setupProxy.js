const { createProxyMiddleware } = require('http-proxy-middleware');
module.exports = function (app) {
  app.use(function (req, res, next) {
      res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
      res.setHeader("Cross-Origin-Embedder-Policy", "same-origin"); // require-corp for upload or same-origin for template details
      next();
  });

  app.use(
      '/api',
      createProxyMiddleware({
        target: 'http://localhost:8080',
        changeOrigin: true,
      })
  
    );
};
