import express from 'express';
import { getMessages, createMessage , deleteMessge, emailReply} from '../controller/contact.js';
import { verifyToken } from '../middleware/auth.js';
import { verifySuperAdmin } from '../middleware/superAdmin.js';

const router = express.Router();

router.get('/', verifySuperAdmin, verifyToken, getMessages);
router.post('/', verifyToken, createMessage);
router.delete('/:id', verifySuperAdmin, verifyToken, deleteMessge);
router.post('/email/reply', verifySuperAdmin, verifyToken, emailReply);
export default router;