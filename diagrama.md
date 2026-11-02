```mermaid
graph TD
    subgraph Frontend (Interfaz de Usuario)
        A[Usuario/Votante] -->|Accede via Web| B(Frontend VotoEC)
    end

    subgraph Backend (Lógica de Negocio y API)
        B -->|Peticiones HTTP/API REST| C(Backend VotoEC)
        C -->|Consulta/Guarda Datos| D(PostgreSQL)
        C -->|Consulta/Guarda Datos| E(MongoDB)
        C -->|Produce Eventos/Mensajes| F(Kafka Broker)
    end

    subgraph Blockchain Interaction (Interacción con Blockchain)
        C -->|Transacciones/Lectura RPC| G(Blockchain Polygon)
        H(Listener de Eventos Blockchain) -->|Escucha Eventos (RPC WSS)| G
        H -->|Consume/Produce Eventos| F
        H -->|Guarda Datos de Eventos| D
        H -->|Guarda Datos de Eventos| E
        A -->|Firma Transacciones| I(Metamask/Web3Auth)
        I -->|Envía Meta-Transacciones (si aplica)| G
    end

    subgraph Messaging System (Sistema de Mensajería)
        F -->|Coordinación| J(Zookeeper)
    end

    subgraph Data Storage (Almacenamiento de Datos)
        D(PostgreSQL)
        E(MongoDB)
    end

    subgraph Deployment Automation (Automatización de Despliegue)
        K(Docker)
        L(Jenkins/CI/CD)
        L -- Automatiza --> K
        K -- Conteneriza --> C
        K -- Conteneriza --> B
        K -- Conteneriza --> H
        K -- Conteneriza --> D
        K -- Conteneriza --> E
        K -- Conteneriza --> F
        K -- Conteneriza --> J
    end