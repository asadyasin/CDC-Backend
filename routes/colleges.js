import express from 'express';
import { getColleges, createCollege, updateCollege, deleteCollege, getSingleCollege } from '../controller/colleges.js';
import { verifyToken } from '../middleware/auth.js';
import { verifySuperAdmin } from '../middleware/superAdmin.js';
import { verifyAdmin } from '../middleware/admin.js';

const router = express.Router();

router.get('/', getColleges);
router.post('/', verifyAdmin, verifyToken, createCollege);
router.patch('/',verifySuperAdmin, verifyToken, updateCollege);
router.delete('/:id',verifySuperAdmin, verifyToken, deleteCollege);
router.get('/:id', verifyToken, getSingleCollege);

export default router;