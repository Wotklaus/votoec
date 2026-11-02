// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract VotoEC {
    mapping(address => bool) public yaVoto;
    mapping(uint => uint) public votos;
    uint public liderActual;

    // Eventos existentes y nuevos
    event VotoEmitido(address indexed votante, uint opcion, bytes32 idVoto);
    event UsuarioRegistrado(address indexed wallet, string email);
    event RecuentoActualizado(uint opcion, uint totalVotos, uint porcentaje);
    event CambioDeLider(uint nuevoLider, uint votos);

    // Registrar usuario (evento solo para auditoría, no guarda datos)
    function registrarUsuario(address wallet, string memory email) public {
        emit UsuarioRegistrado(wallet, email);
    }

    // Votación directa
    function votar(uint opcion) public {
        require(!yaVoto[msg.sender], "Ya votaste");
        yaVoto[msg.sender] = true;
        votos[opcion]++;

        uint totalVotos = votos[opcion];
        uint porcentaje = calcularPorcentaje(totalVotos);
        emit RecuentoActualizado(opcion, totalVotos, porcentaje);

        if (totalVotos > votos[liderActual]) {
            liderActual = opcion;
            emit CambioDeLider(opcion, totalVotos);
        }

        bytes32 idVoto = keccak256(abi.encodePacked(msg.sender, opcion, block.timestamp));
        emit VotoEmitido(msg.sender, opcion, idVoto);
    }

    // Votación por meta-transacción
    function votarPorMetaTx(address votante, uint opcion, bytes memory firma) public {
        require(!yaVoto[votante], "Ya votaste");

        bytes32 hash = keccak256(abi.encodePacked(votante));
        bytes32 mensaje = prefixed(hash);
        require(recoverSigner(mensaje, firma) == votante, "Firma n valida");

        yaVoto[votante] = true;
        votos[opcion]++;

        uint totalVotos = votos[opcion];
        uint porcentaje = calcularPorcentaje(totalVotos);
        emit RecuentoActualizado(opcion, totalVotos, porcentaje);

        if (totalVotos > votos[liderActual]) {
            liderActual = opcion;
            emit CambioDeLider(opcion, totalVotos);
        }

        bytes32 idVoto = keccak256(abi.encodePacked(votante, opcion, block.timestamp));
        emit VotoEmitido(votante, opcion, idVoto);
    }

    // Consultas
    function verificarVoto(address votante) public view returns (bool) {
        return yaVoto[votante];
    }

    function obtenerVotos(uint opcion) public view returns (uint) {
        return votos[opcion];
    }

    // Internas
    function calcularPorcentaje(uint votosOpcion) internal view returns (uint) {
        uint suma = 0;
        for (uint i = 1; i <= 10; i++) {
            suma += votos[i];
        }
        if (suma == 0) return 0;
        return (votosOpcion * 100) / suma;
    }

    function prefixed(bytes32 hash) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash));
    }

    function recoverSigner(bytes32 mensaje, bytes memory sig) internal pure returns (address) {
        require(sig.length == 65, "Firma malformada");
        bytes32 r;
        bytes32 s;
        uint8 v;
        assembly {
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }
        return ecrecover(mensaje, v, r, s);
    }
}
