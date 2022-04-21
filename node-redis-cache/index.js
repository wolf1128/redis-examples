const express = require('express');
const Redis = require('ioredis');
const fs = require('fs');

const app = express();
const redis = new Redis();

// Cache Layer
const userCacheHandler = (req, res, next) => {
	const { id } = req.params;

	redis.get(`user-${id}`, (error, result) => {
		if (error) throw new Error(error);

		if (result !== null) {
			res.json(JSON.parse(result));
		} else {
			next();
		}
	});
};
const postCacheHandler = (req, res, next) => {
	const { id } = req.params;

	redis.get(`post-${id}`, (error, result) => {
		if (error) throw new Error(error);

		if (result !== null) {
			res.json(JSON.parse(result));
		} else {
			next();
		}
	});
};

// Routes
app.get('/users/:id', userCacheHandler, (req, res) => {
	const { id } = req.params;

	const data = JSON.parse(fs.readFileSync('./data/users.json'));
	const user = data.users.find((u) => (u.id == id));

	redis.set(`user-${id}`, JSON.stringify(user), 'EX', 30);

	res.json(user);
});

app.get('/posts/:id', postCacheHandler, (req, res) => {
	const { id } = req.params;

	const data = JSON.parse(fs.readFileSync('./data/posts.json'));
	const post = data.posts.find((u) => (u.id == id));

	redis.set(`post-${id}`, JSON.stringify(post), 'EX', 30);

	res.json(post);
});

app.listen(5000, () => {
	console.log('Server is running...');
});
