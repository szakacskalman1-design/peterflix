import { Router } from 'express'
import {
  getAllMoments,
  getMomentById,
  createMoment,
  updateMoment,
  deleteMoment,
} from '../controllers/momentsController'
import { requireAdmin } from '../middleware/auth'

const router = Router()

router.get('/', getAllMoments)
router.get('/:id', getMomentById)
router.post('/', requireAdmin, createMoment)
router.put('/:id', requireAdmin, updateMoment)
router.delete('/:id', requireAdmin, deleteMoment)

export default router
