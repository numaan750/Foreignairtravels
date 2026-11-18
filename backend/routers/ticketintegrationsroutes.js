import express from 'express';
import { protectAdmin } from '../middleware/adminAuth.js';
import {
  createTicketIntegration,
  deleteTicketIntegration,
  exportGroupTickets,
  getTicketAccessEmails,
  getTicketIntegrations,
  grantTicketAccessEmail,
  previewTicketIntegration,
  revokeTicketAccessEmail,
  syncDueTicketIntegrations,
  syncDueTicketIntegrationsCronAuth,
  syncTicketIntegration,
  updateTicketIntegration,
} from '../controllers/ticketintegrationscontroller.js';

const router = express.Router();

router.get('/export', exportGroupTickets);
router.get('/sync-due', syncDueTicketIntegrationsCronAuth, syncDueTicketIntegrations);
router.use(protectAdmin);

router.get('/access', getTicketAccessEmails);
router.post('/access', grantTicketAccessEmail);
router.delete('/access/:id', revokeTicketAccessEmail);
router.get('/', getTicketIntegrations);
router.post('/preview', previewTicketIntegration);
router.post('/', createTicketIntegration);
router.post('/:id/sync', syncTicketIntegration);
router.put('/:id', updateTicketIntegration);
router.delete('/:id', deleteTicketIntegration);

export default router;
