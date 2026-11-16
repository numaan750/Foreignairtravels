import express from 'express';
import { protectAdmin } from '../middleware/adminAuth.js';
import {
  createTicketIntegration,
  createTicketIntegrationKey,
  deleteTicketIntegration,
  exportGroupTickets,
  getTicketIntegrationKeys,
  getTicketIntegrations,
  previewTicketIntegration,
  revokeTicketIntegrationKey,
  syncDueTicketIntegrations,
  syncDueTicketIntegrationsCronAuth,
  syncTicketIntegration,
  updateTicketIntegration,
} from '../controllers/ticketintegrationscontroller.js';

const router = express.Router();

router.get('/export', exportGroupTickets);
router.get('/sync-due', syncDueTicketIntegrationsCronAuth, syncDueTicketIntegrations);
router.use(protectAdmin);

router.get('/keys', getTicketIntegrationKeys);
router.post('/keys', createTicketIntegrationKey);
router.delete('/keys/:id', revokeTicketIntegrationKey);
router.get('/', getTicketIntegrations);
router.post('/preview', previewTicketIntegration);
router.post('/', createTicketIntegration);
router.post('/:id/sync', syncTicketIntegration);
router.put('/:id', updateTicketIntegration);
router.delete('/:id', deleteTicketIntegration);

export default router;
