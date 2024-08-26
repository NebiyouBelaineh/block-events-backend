import express from 'express';
import AuthController from '../controllers/authController';

const router = express.Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.get('/check', AuthController.check);
router.post('/logout', AuthController.logout);
router.get('/users', AuthController.protect, AuthController.restrict('admin'), AuthController.getAllUsers);

export default router;
