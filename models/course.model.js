const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//>>> DO NOT EDIT OR DELETE ON DATABASE, IT'S RELATED TO MOST OF FUNCTIONS OF THIS APP <<<

const lessonSchema = new Schema({
	title: { type: String, required: true, trim: true },
	des: String,
	documents: [],
	video: String,
	videoUrl: String
});

const courseSchema = new Schema({
	courseName: { type: String, required: true, trim: true },
	des: String, //aka description
	view: Number,
	rating: { type: Number, default: 0 },
	price: 0,
	discount: 0,
	category: String,
	studentAmount: { type: Number, default: 0 },
	image: String,
	imageUrl: String,
	teacher: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		require: true
	},
	lessons: [ lessonSchema ]
});

const Course = mongoose.model('Course', courseSchema);
const Lesson = mongoose.model('Lesson', lessonSchema);

module.exports = {
	//get all courses
	getAllCourse: async function() {
		const aggregateArr = [
			//arr
			{
				// match all
				$match: {}
			},
			{
				$lookup: {
					from: 'User',
					localField: 'Teacher',
					foreignField: '_id',
					as: 'Teacher'
				}
			},
			{
				$project: {
					_id: '$_id',
					courseName: '$courseName',
					des: '$des',
					view: '$view',
					rating: '$rating',
					price: '$price',
					discount: '$discount',
					category: '$category',
					studentAmount: '$studentAmount',
					image: '$image',
					imageUrl: '$imageUrl',
					Teacher: {
						_id: '$Teacher._id',
						Name: '$Teacher.name'
					}
				}
			}
		];
		let result = await Course.aggregate(aggregateArr);
		return result;
	},

	//Search course
	search: async function(keyword) {
		//mongodb atlas search
		const aggregateArr = [
			{
				$search: {
					index: 'default',
					text: {
						query: keyword,
						path: 'courseName'
					}
				}
			}
		];
		let result = await Course.aggregate(aggregateArr);
		return result;
	},

	//get 1 course by id
	getCourseById: async function(id) {
		const aggregateArr = [
			{
				$match: {
					_id: mongoose.Types.ObjectId(id)
				}
			},
			{
				$lookup: {
					from: 'users',
					localField: 'teacher',
					foreignField: '_id',
					as: 'Teacher'
				}
			}
		];
		let result = await Course.aggregate(aggregateArr);
		return result;
	},

	//get course by teacher
	getCourseByTeacher: async function(teacherId) {
		const aggregateArr = [
			{
				$match: {
					teacher: mongoose.Types.ObjectId(teacherId)
				}
			},
			{
				$lookup: {
					from: 'User',
					localField: 'Teacher',
					foreignField: '_id',
					as: 'Teacher'
				}
			},
			{
				$project: {
					_id: '$_id',
					courseName: '$courseName',
					des: '$des',
					view: '$view',
					rating: '$rating',
					price: '$price',
					discount: '$discount',
					category: '$category',
					image: '$image',
					imageUrl: '$imageUrl',
					studentAmount: '$studentAmount',
					Teacher: {
						_id: '$Teacher._id',
						Name: '$Teacher.name'
					}
				}
			}
		];
		let result = await Course.aggregate(aggregateArr);
		return result;
	},

	//get all category
	getAllCat: async function() {
		const aggregateArr = [
			{
				$match: {}
			},
			{
				$project: {
					_id: 0,
					category: '$category'
				}
			}
		];

		let result = await Course.aggregate(aggregateArr);
		let newResult = [ ...new Set(result) ];
		return newResult;
	},

	//get course by cat
	getCourseByCat: async function(catName) {
		const aggregateArr = [
			{
				$match: {
					category: catName
				}
			},
			{
				$lookup: {
					from: 'User',
					localField: 'Teacher',
					foreignField: '_id',
					as: 'Teacher'
				}
			},
			{
				$project: {
					_id: '$_id',
					courseName: '$courseName',
					des: '$des',
					view: '$view',
					rating: '$rating',
					price: '$price',
					discount: '$discount',
					category: '$category',
					studentAmount: '$studentAmount',
					image: '$image',
					imageUrl: '$imageUrl',
					Teacher: {
						_id: '$Teacher._id',
						Name: '$Teacher.name'
					}
				}
			}
		];

		let result = await Course.aggregate(aggregateArr);
		return result;
	},

	//add course
	addCourse: async function(entity) {
		return await new Course({
			courseName: entity.courseName,
			des: entity.des,
			rating: 0,
			price: entity.price,
			discount: entity.discount,
			category: entity.category,
			image: entity.image,
			imageUrl: entity.imageUrl,
			teacher: mongoose.Types.ObjectId(entity.teacher)
		}).save();
	},

	//delete course
	deleteCourse: async function(CourseId) {
		try {
			await Course.findByIdAndDelete(CourseId);
		} catch (err) {}
	},

	//get all Lesson
	getAllLessonById: async function(lessonId) {
		const aggregateArr = [
			{
				$match: {
					'lessons._id': mongoose.Types.ObjectId(lessonId)
				}
			},
			{
				$project: {
					lessons: '$lessons'
				}
			}
		];
		let result = await Course.aggregate(aggregateArr);
		return result[0].lessons;
	},

	//get lesson from course
	getSingleLesson: async function(lessonId) {
		const aggregateArr = [
			{
				$match: {
					'lessons._id': mongoose.Types.ObjectId(lessonId)
				}
			},
			{
				$project: {
					lessons: '$lessons'
				}
			}
		];
		let res = await Course.aggregate(aggregateArr);
		let result;
		for (let l of res[0].lessons) {
			if (l._id.toString() === lessonId) {
				result = l;
			}
		}
		return result;
	},
	getCourseByLessonId: async function(lessonId) {
		const aggregateArr = [
			{
				$match: {
					'lessons._id': mongoose.Types.ObjectId(lessonId)
				}
			}
		];
		let result = await Course.aggregate(aggregateArr);
		return result;
	},
	Courses: Course,
	Lesson: Lesson
};
