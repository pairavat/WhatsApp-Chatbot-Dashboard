import express from 'express';
const router = express.Router();

// Placeholder routes - to be implemented
router.post('/', (_req, res) => {
  res.json({ success: true, message: 'WhatsApp webhook - to be implemented' });
});

router.get('/', (_req, res) => {
  res.json({ success: true, message: 'WhatsApp webhook verification - to be implemented' });
});

export default router;
