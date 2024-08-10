import express from 'express';
import UserController from '../controllers/UserController';
import AuthUser from '../middleware/authToken';

const router = express.Router();

router.post('/', AuthUser, UserController.createUser);
router.get('/:id', AuthUser, UserController.getUserById);
router.get('/', AuthUser, UserController.getAllUsers);
router.put('/:id', AuthUser, UserController.updateUser);
router.delete('/:id', AuthUser, UserController.deleteUser);

export default router;
