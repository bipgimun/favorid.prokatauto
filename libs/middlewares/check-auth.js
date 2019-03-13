module.exports = function checkAuth(req, res, next) {
    if (!req.session.user.id) {
        const error = new Error('Нет доступа к данному разделу');
        Object.assign(error, { status: '403' });

        return next(error);
    }

    next();
}