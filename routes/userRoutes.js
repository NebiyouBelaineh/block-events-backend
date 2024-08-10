import express from 'express';
import UserController from '../controllers/UserController';
import AuthUser from '../middleware/authToken';

const router = express.Router();

// Define user routes
router.post('/', AuthUser, UserController.createUser);

router.get('/:id', AuthUser, UserController.getUserById);

router.get('/', AuthUser, UserController.getAllUsers);

router.put('/:id', AuthUser, UserController.updateUser);

// May not be needed as of now: Only for admin
router.delete('/:id', AuthUser, UserController.deleteUser);

export default router;
