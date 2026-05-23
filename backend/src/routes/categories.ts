import { Router } from 'express'
import { getAllCategories, getCategoryWithMoments } from '../controllers/categoriesController'

const router = Router()

router.get('/', getAllCategories)
router.get('/:slug', getCategoryWithMoments)

export default router
