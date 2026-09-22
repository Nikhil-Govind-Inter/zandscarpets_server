const { models } = require("../../../../../database/models");
const BaseRepository = require("../../shared/BaseRepository");

class ContactEnquiryRepository extends BaseRepository {
  constructor() {
    super(models.ContactEnquiry);
  }
  
  
}

module.exports = new ContactEnquiryRepository();
