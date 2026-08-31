const { models } = require("../../../../database/models");
const BaseRepository = require("../shared/BaseRepository");

class PolicyRepository {
  constructor() {
    this.policy = new BaseRepository(models.Policy);
  }

  findBySlug(slug) {
    return this.policy.findOne({ slug });
  }
}

module.exports = new PolicyRepository();
