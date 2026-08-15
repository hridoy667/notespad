import * as userService from '../services/user.service.js';

export const listUsers = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const result = await userService.getAllUsers(page, limit);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSingleUser = async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);
    res.json(user);
  } catch (error) {
    const status = error.message === 'User not found' ? 404 : 500;
    res.status(status).json({ message: error.message });
  }
};

export const createUser = async (req, res) => {
  try {
    const newUser = await userService.createNewUser(req.body);
    res.status(201).json(newUser);
  } catch (error) {
    const status = error.message.includes('already exists') ? 400 : 500;
    res.status(status).json({ message: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const updatedUser = await userService.updateExistingUser(req.params.id, req.body);
    res.json(updatedUser);
  } catch (error) {
    const status = error.message === 'User not found' ? 404 : 500;
    res.status(status).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const response = await userService.removeUser(req.params.id);
    res.json(response);
  } catch (error) {
    const status = error.message === 'User not found' ? 404 : 500;
    res.status(status).json({ message: error.message });
  }
};