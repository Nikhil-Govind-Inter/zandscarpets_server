const { models } = require("../../../../database/models");

class HomeService {

   

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

module.exports = HomeService;