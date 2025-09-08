const { models, sequelize } = require("../../models");



class dummyService {

   

    static async index() {
    try {
        const data = {
            id: 1,
            page: "Home Page",
            status: "active",
        };

        return data;
    } catch (error) {
        throw new Error(`Error fetching data: ${error.message}`);
    }
}


    
}

module.exports = dummyService;