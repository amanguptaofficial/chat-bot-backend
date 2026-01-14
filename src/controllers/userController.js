import User from '../models/User.js';

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.auth.userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    return res.json({ success: true, data: { user: user.toSafeJSON() } });
  } catch (error) {
    console.error('Get me error:', error);
    return res.status(500).json({ success: false, error: 'Failed to load profile' });
  }
};

