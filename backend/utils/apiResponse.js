function ok(res, data, message = 'OK') {
  return res.json({ success: true, message, data });
}

function created(res, data, message = 'Created') {
  return res.status(201).json({ success: true, message, data });
}

function badRequest(res, message = 'Bad Request', errors) {
  return res.status(400).json({ success: false, message, errors });
}

function unauthorized(res, message = 'Unauthorized') {
  return res.status(401).json({ success: false, message });
}

function serverError(res, message = 'Internal server error', error) {
  return res.status(500).json({ success: false, message, ...(error && { error }) });
}

module.exports = { ok, created, badRequest, unauthorized, serverError };


