import express from 'express';
const router = express.Router();

// Placeholder routes - to be implemented
router.post('/upload', (_req, res) => {
  res.json({ success: true, message: 'Import routes - to be implemented' });
});

router.get('/export', (_req, res) => {
  res.json({ success: true, message: 'Export routes - to be implemented' });
});

export default router;
