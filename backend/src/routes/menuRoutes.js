import express from 'express';
const router = express.Router();
import { getMyMenus } from '../controllers/menuController.js';

router.get('/my-menus', getMyMenus);

export default router;
