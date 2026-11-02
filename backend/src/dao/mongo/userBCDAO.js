const userBC = require("../../models/userBC");
const userBCDTO = require("../../dto/mongo/userBCDTO");

class userBCDAO {

    //Crear usuario
    async crear(data) {
        const user = new userBC(data);
        await user.save();
        return new userBCDTO(user);        
    }

    //Buscar por email
    async buscarPorEmail(email) {
        const user = await userBC.findOne({ email });
        return user ? new userBCDTO(user) : null;
    }

    //Registrar acción en auditoría
    async registrarVoto(email, datosActualizados) {
        const user = await userBC.findOneAndUpdate(
            { email },
            { $set: datosActualizados },
            { new: true }
        );
        //return user ? new userBCDTO(user) : null;
    }

    
    async obtenerWalletsPorEmails(emails) {
    const users = await userBC.find({ email: { $in: emails } }).lean();
    const mapWallets = {};
    users.forEach(u => {
        mapWallets[u.email] = u.wallet.address;
    });
    return mapWallets;
    }

    async buscarPorAddress(address) {
        const user = await userBC.findOne({ "wallet.address": new RegExp(`^${address}$`, "i") });
        return user ? new userBCDTO(user) : null;
    }



    //Eliminar usuario
    async eliminar(email) {
        const result = await userBC.deleteOne({ email });
        return result.deletedCount > 0;
    }

    //Listar todos
    async listar() {
        const users = await userBC.find();
        return users.map((u) => new userBCDTO(u));
    }
}

module.exports = userBCDAO;

