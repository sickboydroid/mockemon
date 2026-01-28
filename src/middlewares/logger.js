export default function requestLogger(req, res, next) {
  console.log(req.method, req.url);
  next();
}
