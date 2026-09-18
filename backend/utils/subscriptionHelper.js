const { Payment, User } = require('../models');

/**
 * Check if a user has an active paid subscription
 * @param {string|mongoose.Types.ObjectId|object} userOrId - User object or User ID
 * @returns {Promise<boolean>}
 */
async function isUserPaid(userOrId) {
  try {
    let user = userOrId;
    if (!user || typeof user === 'string' || user._id) {
      if (!user?.role || !user?.subscriptionExpiry) {
        user = await User.findById(user?._id || userOrId).lean();
      }
    }

    if (!user) return false;

    // Administrators and Superadmins are always granted full access
    if (user.role === 'admin' || user.role === 'superadmin') {
      return true;
    }

    // Check direct subscription expiry on user model
    if (user.subscriptionExpiry && new Date(user.subscriptionExpiry) > new Date()) {
      if (user.subscriptionType && user.subscriptionType !== 'free') {
        return true;
      }
    }

    // Check completed active payments in Payment collection
    const activePayment = await Payment.findOne({
      userId: user._id,
      status: 'completed',
      $or: [
        { 'examAccess.accessEndDate': { $gt: new Date() } },
        { 'examAccess.durationMonths': 0 } // Lifetime access
      ]
    }).lean();

    return !!activePayment;
  } catch (error) {
    console.error('[ERROR] Error checking isUserPaid:', error);
    return false;
  }
}

module.exports = {
  isUserPaid
};
