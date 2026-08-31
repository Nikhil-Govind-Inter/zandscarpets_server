class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  findByPk(id, options = {}) {
    return this.model.findByPk(id, options);
  }

  findOne(where = {}, options = {}) {
    return this.model.findOne({ where, ...options });
  }

  findAll(options = {}) {
    return this.model.findAll(options);
  }

  findAndCountAll(options = {}) {
    return this.model.findAndCountAll(options);
  }

  create(data, options = {}) {
    return this.model.create(data, options);
  }

  update(instance, data, options = {}) {
    return instance.update(data, options);
  }

  destroy(instance, options = {}) {
    return instance.destroy(options);
  }

  bulkUpdate(data, where, options = {}) {
    return this.model.update(data, { where, ...options });
  }

  withTransaction(workFn) {
    const { sequelize } = require("../../../../database/models");
    return sequelize.transaction(workFn);
  }
}

module.exports = BaseRepository;
