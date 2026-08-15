import * as postService from '../services/post.service.js';

export const listPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;

    const result = await postService.getAllPosts(page, limit);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getSinglePost = async (req, res) => {
  try {
    const result = await postService.getPostById(req.params.id);
    res.json(result);
  } catch (error) {
    const status = error.message === 'Post not found' ? 404 : 500;
    res.status(status).json({
      success: false,
      message: error.message,
    });
  }
};

export const createPost = async (req, res) => {
  try {
    const result = await postService.createNewPost(req.body, req.user.id);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updatePost = async (req, res) => {
  try {
    const result = await postService.updateExistingPost(
      req.params.id,
      req.body,
      req.user
    );
    res.json(result);
  } catch (error) {
    const status = error.message.includes('Forbidden')
      ? 403
      : error.message === 'Post not found'
      ? 404
      : 500;
    res.status(status).json({
      success: false,
      message: error.message,
    });
  }
};

export const deletePost = async (req, res) => {
  try {
    const result = await postService.removePost(req.params.id, req.user);
    res.json(result);
  } catch (error) {
    const status = error.message.includes('Forbidden')
      ? 403
      : error.message === 'Post not found'
      ? 404
      : 500;
    res.status(status).json({
      success: false,
      message: error.message,
    });
  }
};