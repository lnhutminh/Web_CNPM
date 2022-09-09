module.exports = function getUserInfo(u) {
	let user = {
		_id: '',
		email: '',
		avatar: '',
		first_name: ' ',
		last_name: '',
		permission: '',
		phone: '',
		DOB: ''
	};
	if (u) {
		user._id = u._id;
		user.email = u.email;
		user.avatar = u.avatar;
		user.first_name = u.first_name;
		user.last_name = u.last_name;
		user.permission = u.permission;
		user.phone = u.phone;
		user.DOB = u.DOB.toISOString().split('T')[0];
	}
	return user;
};
