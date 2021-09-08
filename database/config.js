const mongoose = require('mongoose');

const dbConnection = async() => {

    try {
        await mongoose.connect(process.env.DB_CONN);
        console.log('DB Online');
    } catch (error) {
        console.log(error);
        throw new Error('Error a la hora de conectar con la BD, ver logs');
    }

}

module.exports = {
    dbConnection
}