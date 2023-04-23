import express, { Router } from 'express';

import { signin, signup, getUser, deleteUser, updateUser ,resetPassword ,verified, verifyEmail} from '../controller/user.js';
import { verifyToken } from '../middleware/auth.js';
import { verifySuperAdmin } from '../middleware/superAdmin.js';

const router = express.Router();

router.get('/',verifySuperAdmin, verifyToken, getUser);
router.post('/signin', signin);
router.post('/signup', signup);
router.patch('/',verifySuperAdmin, verifyToken, updateUser);
router.patch('/', verifyToken, resetPassword);
router.delete('/:id',verifySuperAdmin, verifyToken, deleteUser);
router.get('/verified', verified);
router.get('/verify/:userId', verifyEmail);

export default router;