const checkParams = (paramName) => {
    return (req, res, next) => {
        const { [paramName]: param } = req.params;

        if (!param)
            throw new Error('Отсутствует id');

        if (!Number(param))
            throw new Error('Id type error');

        next();
    }
}

module.exports = {
    checkParams
};