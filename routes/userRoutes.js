import express from 'express';
import UserController from '../controllers/UserController';
import AuthController from '../controllers/authController';
import upload from '../middleware/uploadMiddlware';

const router = express.Router();

router.post('/', AuthController.protect, UserController.createUser);
router.get('/:id', AuthController.protect, UserController.getUserById);
router.get('/', AuthController.protect, AuthController.restrict('admin'), UserController.getAllUsers);
router.put('/:id', AuthController.protect, upload.single('avatar'), UserController.updateUser);
router.delete('/:id', AuthController.protect, UserController.deleteUser);

export default router;
