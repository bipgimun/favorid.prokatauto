module.exports = (req, res, next) => {
    res.render(__dirname + '/pages-signin', { layout: 'login' });
}