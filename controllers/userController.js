const User = require('../models/user.model');
const mongoose = require('mongoose');

module.exports = {
	//register course
	//not done
	registerCourse: async function(userId, courseId) {
		const aggregateArr = [ {} ];

		const result = await User.updateOne(
			{
				_id: mongoose.Types.ObjectId(userId)
			},
			{
				$set: {
					//cho nay ko biet lam
				}
			}
		);
	},

	rateCourse: async function(userId, courseId, rate) {
		//rate course
	}
};
