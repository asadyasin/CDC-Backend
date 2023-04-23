import express from 'express';
import { getDegrees, createDegree, updateDegree, deleteDegree, getSingleDegree} from '../controller/degrees.js';
import { verifyToken } from '../middleware/auth.js';
import { verifySuperAdmin } from '../middleware/superAdmin.js';
import { verifyAdmin } from '../middleware/admin.js';

const router = express.Router();

router.get('/', getDegrees);
router.post('/', verifyAdmin, verifyToken, createDegree);
router.patch('/',verifySuperAdmin, verifyToken, updateDegree);
router.delete('/:id',verifySuperAdmin, verifyToken, deleteDegree);
router.get('/:degreename', verifyToken ,getSingleDegree);

export default router;