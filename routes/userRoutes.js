import express from 'express';
import UserController from '../controllers/UserController';

const router = express.Router();

// Define user routes
router.post('/', UserController.createUser);

router.get('/:id', UserController.getUser);

router.put('/:id', UserController.updateUser);

// May not be needed as of now: Only for admin
router.delete('/:id', UserController.deleteUser);

export default router;
