class userBCDTO {
    constructor(data) {        
        this.email = data.email;
        this.wallet = {
            address: data.wallet?.address,
            privateKey: data.wallet?.privateKey
        };

        this.firma = data.firma;
        this.txHash = data.txHash;
        this.auditoria = data.auditoria || [];
    } 
}

module.exports = userBCDTO;