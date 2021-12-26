const dayjs = require('dayjs');
const sequelize = require('../../model/index');
const { Op } = require("sequelize");

const modelMap = new Map();

addModel = (model, aliasName) => {
    modelMap.set(aliasName, { model, as: aliasName });
}

getModel = (alias) => {
    return modelMap.get(alias)
}

prepareAndGetQuery = (req, includeModels) => {
    const { page = 0, size = 0, sortField = '', sortOrder = 1,
        filters = '{}' } = req.query;
    const limit = size ? parseInt(size) : 0;
    const offset = page ? parseInt(page * limit) : 0;
    let query = { limit, offset };
    const filterObject = JSON.parse(filters);
    addSortQuery(sortField, sortOrder, query);
    const operatationByMatchCase = (key, matchCase, value) => {
        switch (matchCase) {
            case 'date':
                if (!isNaN(Date.parse(value))) {
                    const formatedStringDate = dayjs(value).format('YYYY-MM-DD');
                    return sequelize.where(sequelize.fn('date', sequelize.col(key)), formatedStringDate);
                }
            case 'equals':
                if (key.split('.').length > 1) {
                    return { [`$${key}$`]: { [Op.eq]: value } };
                } else {
                    return { [key]: { [Op.eq]: value } };
                }
            case 'contains':
                if (key.split('.').length > 1) {
                    return { [`$${key}$`]: { [Op.substring]: value } };
                } else {
                    return { [key]: { [Op.substring]: value } };
                }
            default:
                if (key.split('.').length > 1) {
                    return { [`$${key}$`]: { [Op.startsWith]: value } };
                } else {
                    return { [key]: { [Op.startsWith]: value } };
                }
        }
    }
    query = Object.keys(filterObject).reduce((acc, key, index) => {
        const { matchMode, value } = filterObject[key];
        if (!index) {
            acc.where = { [Op.and]: [] };
        }
        const filterCriteria = operatationByMatchCase(key, matchMode, value);
        acc.where[Op.and].push(filterCriteria);
        return acc;
    }, query);
    if ((includeModels || []).length) {
        query.include = includeModels.map((includeAlias) => {
            return modelMap.get(includeAlias);
        });
    }
    return query;
}

const addSortQuery = (sortField, sortOrder, query) => {
    query.order = [];
    if (sortField.constructor.name === 'Array') {
        sortField.forEach((sortItem, index) => {
            createSortOrder(query.order, sortItem, sortOrder[index]);
        })
    } else if (sortField.trim().length) {
        createSortOrder(query.order, sortField, sortOrder);
    }
}

const createSortOrder = (order = [], sortField, sortOrder) => {
    if (sortField.split('.').length > 1) {
        const associationObject = modelMap.get(sortField.split('.')[0]);
        order.push([associationObject,
            sortField.split('.')[1],
            sortOrder >= 1 ? 'ASC' : 'DESC']);
    } else {
        order.push([sortField, sortOrder >= 1 ? 'ASC' : 'DESC']);
    }
}

module.exports = { prepareAndGetQuery, addModel, getModel }