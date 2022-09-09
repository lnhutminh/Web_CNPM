const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const rateSchema = new Schema({
	_id: { type: Schema.Types.ObjectId, ref: 'Courses' },
	rate: { type: String, default: null }
});
const userSchema = new Schema({
	email: { type: String, required: true },
	password: { type: String, required: true },
	permission: {
		type: String,
		default: 'Student',
		enum: [ 'Student', 'Teacher', 'Admin' ]
	}, //Admin, Teacher, Student
	first_name: { type: String, trim: true },
	last_name: { type: String, trim: true },
	phone: String,
	DOB: Date,
	avt_file: String,
	avatar: {
		type: String,
		default: 'https://thelifetank.com/wp-content/uploads/2018/08/avatar-default-icon.png'
	},
	courses: [ rateSchema ],
	secretOTP: { type: String, default: '' }, //For register
	about: String
});

const User = mongoose.model('User', userSchema);

module.exports = {
	User,
	enrollCourse: async function(courseId, studentId) {
		try {
			const course = await User.updateOne(
				{ _id: studentId },
				{
					$addToSet: {
						courses: {
							_id: mongoose.Types.ObjectId(courseId)
						}
					}
				}
			);
		} catch (err) {
			console.log(err);
		}
	},
	getUserCourses: async function(studentId) {
		const aggregateArr = [
			{
				$match: {
					_id: mongoose.Types.ObjectId(studentId)
				}
			},
			{
				$project: {
					courses: '$courses',
					_id: false
				}
			}
		];
		let result = await User.aggregate(aggregateArr);
		return result;
	}
};
