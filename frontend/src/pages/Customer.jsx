import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./styles/Customer.module.css";
import api from "../api";
import CandidatesBarChart from "../components/CandidatoBarChart";
import VotingSection from "../components/VotingSection";

import {
  User,
  LogOut,
  Vote,
  Users,
  BarChart2,
  PieChart,
  Mail,
  Key,
  Wallet,
  Hash,
  IdCard,
  Phone,
  Edit, // Nuevo icono para el botón de editar
  Check, // Icono para guardar
  X // Icono para cancelar/regresar
} from "lucide-react";



// Utility component to display blockchain addresses with dynamic show/hide
const AddressDisplay = ({ address, isBlockchainData = false }) => {
  if (!address || typeof address !== 'string') return null;

  const [showFull, setShowFull] = useState(false); // Nuevo estado para controlar si se muestra completa

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Dirección copiada al portapapeles: " + text);
  };

  const handleClick = () => {
    setShowFull(!showFull); // Alternar el estado al hacer clic
  };

  let displayAddress = address; // Por defecto, mostrar la dirección completa

  // Lógica de truncamiento:
  // Si no se debe mostrar completa (showFull es false) y la dirección es larga, truncar.
  // Ajusta la longitud de truncamiento según el tipo de dato.
  if (!showFull) {
    if (isBlockchainData) { // Para Wallet Mongo y TxHash
      displayAddress = `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    } else { // Para Llave Privada (donde isBlockchainData es false)
      if (address.length > 60) { // Si la llave privada es muy larga, truncar de forma menos agresiva
        displayAddress = `${address.substring(0, 30)}...${address.substring(address.length - 20)}`;
      }
      // Si la llave privada no es muy larga, se mostrará completa por defecto (displayAddress = address)
    }
  }

  return (
    <span
      className={`${styles.addressDisplay} ${isBlockchainData ? styles.blockchainData : ''}`}
      title={address} // El tooltip siempre mostrará la dirección completa
      onClick={handleClick} // Usar el nuevo manejador de clic
      onContextMenu={(e) => { // Opcional: para copiar con clic derecho sin alternar visibilidad
        e.preventDefault();
        copyToClipboard(address);
      }}
    >
      {displayAddress}
      <span className={styles.copyIcon} onClick={(e) => { e.stopPropagation(); copyToClipboard(address); }}>📋</span>
    </span>
  );
};

const headerDisplayMap = {
  "VOTANTE_EMAIL": "VOTANTE EMAIL",
  "VOTANTE_NOMBRE": "VOTANTE NOMBRE",
  "WALLET_ADDRESS": "WALLET ADDRESS",
  "TXHASH": "TX HASH",
  "FECHA": "FECHA",
  "nombre": "Nombre",
  "email": "Email",
  "apellido": "Apellido",
  "cedula": "Cédula",
  "telefono": "Teléfono",
  "WALLET": "Wallet",
  "wallet": "wallet",
  "id": "ID",
  "totalVotos": "Total Votos",
  "id_voto": "ID Voto",
  "id_usuario": "ID Usuario",
  "id_candidato": "ID Candidato",
  "_id": "ID Mongo",
  "address": "Dirección Wallet",
  "privateKey": "Clave Privada",
  "auditoria": "Auditoría"
};


const UserPanel = () => {
  const [resultado, setResultado] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [userMongoData, setUserMongoData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [mongoLoading, setMongoLoading] = useState(false);
  const [profileError, setProfileError] = useState(null);
  const [mongoError, setMongoError] = useState(null);
  const [email, setEmail] = useState(""); // Este parece no usarse, podrías quitarlo si no lo necesitas.
  const [columnasVisibles, setColumnasVisibles] = useState([]);
  const [rutaActual, setRutaActual] = useState("");
  const [currentContent, setCurrentContent] = useState("profile");
  const [votacionMensajeGlobal, setVotacionMensajeGlobal] = useState("");
  const userEmail = localStorage.getItem("email");
  const navigate = useNavigate();

  // --- NUEVOS ESTADOS PARA EDICIÓN ---
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({
    nombre: "",
    apellido: "",
    cedula: "",
    telefono: "",
  });
  const [editMessage, setEditMessage] = useState(""); // Mensajes de éxito/error al editar

  // --- FUNCIONES PARA MANEJAR LA EDICIÓN ---
  const handleEditClick = () => {
    // Cuando se hace clic en editar, precarga los datos actuales en el estado de edición
    if (userProfile) {
      setEditedUser({
        nombre: userProfile.nombre || "",
        apellido: userProfile.apellido || "",
        cedula: userProfile.cedula || "",
        telefono: userProfile.telefono || "",
      });
      setIsEditing(true);
      setEditMessage(""); // Limpiar mensajes previos
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditMessage(""); // Limpiar mensajes
  };

  const handleSaveEdit = async () => {
    setEditMessage("Guardando cambios...");
    try {
      // Envía los datos actualizados a tu API.
      // Asegúrate de que tu backend tenga un endpoint para actualizar usuarios
      // basado en el email (o ID) y que reciba los campos actualizables.
      const response = await api.put(`/api/pg/usuarios/${userEmail}`, {
        nombre: editedUser.nombre,
        apellido: editedUser.apellido,
        cedula: editedUser.cedula,
        telefono: editedUser.telefono,
      });

      if (response.status === 200) {
        setEditMessage("✅ Perfil actualizado");
        setIsEditing(false);
        // Vuelve a cargar todos los datos del usuario para reflejar los cambios
        await fetchAllUserData();
      } else {
        setEditMessage("❌ Error al actualizar ");
      }
    } catch (error) {
      console.error("Error al guardar el perfil:", error);
      setEditMessage("❌ Error al guardar el perfil. Inténtalo de nuevo.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  // --- FIN DE NUEVOS ESTADOS Y FUNCIONES PARA EDICIÓN ---


  const configuracionPorRuta = {
    "/api/pg/usuarios": {
      blockchainData: ["WALLET.address"],
      formatearCampos: {
        WALLET: (value) => (value ? value.address : ""),
      },
      ocultar: ["activo", "contrasena"],
    },

    "/api/mongo/usuarios": {
      blockchainData: ["address", "txHash"], // privateKey no necesita estar aquí si isBlockchainData se pasa como false en renderUserProfile
      formatearCampos: {
        wallet: (value) => (value ? value.address : ""),
      },
      ocultar: ["__v", "auditoria"], // Asegurarse que privateKey NO esté aquí si se quiere mostrar en la tabla general
    },

    "/api/voto": {
      blockchainData: ["txHash", "id_voto"],
    },
    "/api/candidatos": {
      ocultar: ["descripcion", "activo", "imagen_url"], // <--- ASEGÚRATE DE QUE ESTA LÍNEA ESTÉ CORRECTA Y NO COMENTADA/FALTE
      blockchainData: [], // Añadir esta propiedad también si no la tienes, para consistencia
      formatearCampos: {}, // Y esta
    },

    "/api/reporte/reporte-votos-candidato": {
      ocultar: [],
      blockchainData: [],
      formatearCampos: {},
    },
    default: {
      blockchainData: [],
      formatearCampos: {},
      ocultar: [],
    },
  };

  const definirColumnasPorEndpoint = (endpoint) => {
    if (endpoint.includes("pg/usuarios")) {
      return ["nombre", "email", "apellido", "cedula", "telefono", "WALLET"];

    } else if (endpoint.includes("mongo/usuarios")) {
      return ["_id", "email", "wallet", "txHash", "privateKey", "auditoria"];

    } else if (endpoint.includes("reporte/reporte-votos-candidato")) {
      return ["VOTANTE_EMAIL", "VOTANTE_NOMBRE", "WALLET_ADDRESS", "TXHASH", "FECHA"];

    } else if (endpoint.includes("candidato")) {
      return ["id", "nombre", "totalVotos"];

    } else if (endpoint.includes("voto")) {
      return ["id_voto", "id_usuario", "id_candidato", "txHash"];
    }
    return [];
  };

  const fetchData = async (endpoint) => {
    setLoading(true);
    setResultado(null);
    setRutaActual(endpoint);
    setCurrentContent("table");
    setUserProfile(null);
    setUserMongoData(null);
    setProfileError(null);
    setMongoError(null);
    setVotacionMensajeGlobal("");
    setEditMessage(""); // Limpiar mensaje de edición al cambiar de vista
    setIsEditing(false); // Salir del modo edición al cambiar de vista
    try {
      const columnas = definirColumnasPorEndpoint(endpoint);
      setColumnasVisibles(columnas);
      const res = await api.get(endpoint);
      setResultado(res.data);
    } catch (err) {
      setResultado({ error: "Error al consultar" });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUserData = useCallback(async () => {
    if (!userEmail) {
      setProfileError("Email de usuario no encontrado. Por favor, inicie sesión.");
      setProfileLoading(false);
      navigate('/login');
      return;
    }
    setProfileLoading(true);
    setProfileError(null);
    try {
      const pgResponse = await api.get(`/api/pg/usuarios/${userEmail}`);
      setUserProfile(pgResponse.data);
    } catch (err) {
      console.error("Error al cargar el perfil PG del usuario:", err);
      setProfileError("Error al cargar su perfil (PG).");
    } finally {
      setProfileLoading(false);
    }
    setMongoLoading(true);
    setMongoError(null);
    try {
      const mongoResponse = await api.get(`/api/mongo/usuarios/${userEmail}`);
      setUserMongoData(Array.isArray(mongoResponse.data) ? mongoResponse.data : [mongoResponse.data]);
    } catch (err) {
      console.error("Error al cargar los datos de Mongo del usuario:", err);
      setMongoError("Error al cargar sus datos (Mongo).");
    } finally {
      setMongoLoading(false);
    }
  }, [userEmail, navigate]);

  useEffect(() => {
    setCurrentContent("profile");
    fetchAllUserData();
  }, [fetchAllUserData]);

  const renderUserProfile = () => {
    if (profileLoading) {
      return <p className={styles.loadingMessage}>Cargando perfil...</p>;
    }
    if (profileError) {
      return <p className={styles.errorMessage}>{profileError}</p>;
    }
    if (!userProfile) {
      return <p className={styles.noDataMessage}>No se encontraron datos de perfil (PG).</p>;
    }
    return (
      <div className={styles.profileCard}>
        <div className={styles.profileAvatar}>
          <User size={40} />
        </div>
        <div className={styles.profileInfo}>
          {/* Mensaje de éxito/error de edición */}
          {editMessage && (
            <p className={`${styles.editMessage} ${editMessage.startsWith("✅") ? styles.success : styles.error}`}>
              {editMessage}
            </p>
          )}

          {isEditing ? (
            <>
              {/* Modo de Edición */}
              <p>
                <User size={65} className={styles.userIcon} />
                <strong>Usuario:</strong>{" "}
                <input
                  type="text"
                  name="nombre"
                  value={editedUser.nombre}
                  onChange={handleInputChange}
                  className={styles.editInput}
                />{" "}
                <input
                  type="text"
                  name="apellido"
                  value={editedUser.apellido}
                  onChange={handleInputChange}
                  className={styles.editInput}
                />
              </p>
              <p>
                <Mail size={25} className={styles.userIcon} />
                <strong>Email:</strong> {userProfile.email} {/* Email no editable */}
              </p>
              <p>
                <IdCard size={25} className={styles.userIcon} />
                <strong>ID:</strong>{" "}
                <input
                  type="text"
                  name="cedula"
                  value={editedUser.cedula}
                  onChange={handleInputChange}
                  className={styles.editInput}
                />
              </p>
              <p>
                <Phone size={25} className={styles.userIcon} />
                <strong>Teléfono:</strong>{" "}
                <input
                  type="text"
                  name="telefono"
                  value={editedUser.telefono}
                  onChange={handleInputChange}
                  className={styles.editInput}
                />
              </p>
              <div className={styles.editButtons}>
                <button onClick={handleCancelEdit} className={styles.cancelButton}>
                  <X size={18} /> Regresar
                </button>
                <button onClick={handleSaveEdit} className={styles.saveButton}>
                  <Check size={18} /> Guardar
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Modo de Visualización */}
              <p><User size={25} className={styles.userIcon} /><strong>Usuario:</strong> {userProfile.nombre} {userProfile.apellido}</p>
              <p><Mail size={25} className={styles.userIcon} /><strong>Email:</strong> {userProfile.email}</p>
              <p><IdCard size={25} className={styles.userIcon} /><strong>ID:</strong> {userProfile.cedula}</p>
              <p><Phone size={25} className={styles.userIcon} /><strong>Teléfono:</strong> {userProfile.telefono}</p>

              {userProfile.WALLET && (
                <p>
                  <Wallet size={25} className={styles.userIcon} /><strong>Wallet PG:</strong>{" "}
                  <AddressDisplay address={userProfile.WALLET.address || userProfile.WALLET} isBlockchainData={false} />
                </p>
              )}

              {/* INICIO DE LOS DATOS DE WALLET DE MONGODB */}
              {mongoLoading ? (
                <p className={styles.loadingMessage}>Cargando datos de Wallet (MongoDB)...</p>
              ) : mongoError ? (
                <p className={styles.errorMessage}>{mongoError}</p>
              ) : userMongoData && userMongoData.length > 0 ? (
                <>
                  {userMongoData.map((mongoWallet, index) => (
                    <div key={mongoWallet._id || index} className={styles.walletEntry}>
                      <p>
                        <Wallet size={25} className={styles.userIcon} /><strong>Wallet Address:</strong>{" "}
                        {mongoWallet.wallet && mongoWallet.wallet.address ? (
                          <AddressDisplay address={mongoWallet.wallet.address} isBlockchainData={true} />
                        ) : (
                          "N/A"
                        )}
                      </p>
                      <p>
                        <Key size={25} className={styles.userIcon} /><strong>Private Key:</strong>{" "}
                        {mongoWallet.wallet && mongoWallet.wallet.privateKey ? (
                          <AddressDisplay address={mongoWallet.wallet.privateKey} isBlockchainData={false} />
                        ) : (
                          "N/A"
                        )}
                      </p>
                      <p>
                        <Hash size={25} className={styles.userIcon} /><strong>TxHash:</strong>{" "}
                        {mongoWallet.txHash ? (
                          <AddressDisplay address={mongoWallet.txHash} isBlockchainData={true} />
                        ) : (
                          "N/A"
                        )}
                      </p>
                      {userMongoData.length > 1 && index < userMongoData.length - 1 && <hr className={styles.walletDivider} />}
                    </div>
                  ))}
                </>
              ) : (
                <p className={styles.noDataMessage}>No se encontraron datos de Wallet en MongoDB.</p>
              )}
              {/* FIN DE LOS DATOS DE WALLET DE MONGODB */}

              {/* Botón de Actualizar */}
              <button onClick={handleEditClick} className={styles.updateProfileButton}>
                <Edit size={18} /> Actualizar Perfil
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

 

  const renderTable = (data, endpointForConfig = rutaActual) => {
    if (!data || typeof data !== "object" || (Array.isArray(data) && data.length === 0)) {
      return <p>No hay datos disponibles para la tabla.</p>;
    }

    const rows = Array.isArray(data) ? data : [data];
    const config = configuracionPorRuta[endpointForConfig] || configuracionPorRuta.default;
    let dataHeaders = Object.keys(rows[0] || {}).filter(
      (header) => !config.ocultar.includes(header)
    );
    if (dataHeaders.includes("WALLET") && endpointForConfig.includes("usuarios")) {
      dataHeaders = ["WALLET", ...dataHeaders.filter(h => h !== "WALLET")];
    } else if (dataHeaders.includes("address") && endpointForConfig.includes("mongo/usuarios")) {
      dataHeaders = ["address", ...dataHeaders.filter(h => h !== "address")];
    }

    const displayHeaders = dataHeaders.map(headerKey => {
      if (headerKey === "wallet" && endpointForConfig.includes("mongo/usuarios")) {
        return "WALLET MONGO";
      }
      return headerDisplayMap[headerKey] || headerKey;
    });
    return (
      <div className={styles.tableContainer}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead className={styles.thead}>
              <tr>
                {displayHeaders.map((headerText, idx) => (
                  <th key={idx} className={styles.th}>
                    {headerText.toUpperCase()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={idx} className={styles.tr}>
                  {dataHeaders.map((headerKey, hidx) => {
                    let displayValue = row[headerKey];
                    const isBlockchainField = (config.blockchainData.includes(headerKey) ||
                      (headerKey === 'wallet' && endpointForConfig.includes('mongo/usuarios')) ||
                      (headerKey === 'address' && endpointForConfig.includes('mongo/usuarios')) ||
                      (headerKey === 'txHash' && endpointForConfig.includes('mongo/usuarios')) ||
                      (headerKey === 'privateKey' && endpointForConfig.includes('mongo/usuarios')));

                    // Lógica existente para formatear valores
                    if (headerKey === "WALLET" && typeof row[headerKey] === 'object' && row[headerKey] !== null && row[headerKey].address) {
                      displayValue = row[headerKey].address;
                    } else if (headerKey === "wallet" && typeof row[headerKey] === 'object' && row[headerKey] !== null && row[headerKey].address) {
                      displayValue = row[headerKey].address;
                    }
                    if (config.formatearCampos && config.formatearCampos[headerKey]) {
                      displayValue = config.formatearCampos[headerKey](row[headerKey]);
                    } else if (typeof row[headerKey] === "object" && row[headerKey] !== null) {
                      displayValue = JSON.stringify(row[headerKey]);
                    }

                    return (
                      <td
                        key={hidx}
                        className={`${styles.td} ${isBlockchainField ? styles.blockchainData : ""}`}
                      >
                        {/* **** AÑADE ESTE BLOQUE DE CÓDIGO AQUÍ **** */}
                        {endpointForConfig === "/api/candidatos" && headerKey === "id" ? (
                          <>
                            {/* Renderiza el icono para el ID del candidato */}
                            <Users size={14} className={styles.candidateIcon} />
                            {/* Opcional: Si quieres que el número del ID también se muestre junto al icono, descomenta la siguiente línea */}
                            {/* <span style={{ marginLeft: '5px' }}>{displayValue}</span> */}
                          </>
                        ) : isBlockchainField && typeof displayValue === 'string' && displayValue.startsWith('0x') ? (
                          <AddressDisplay address={displayValue} isBlockchainData={true} />
                        ) : (
                          // Este es el caso por defecto para todos los demás campos
                          displayValue
                        )}
                        {/* **** FIN DEL BLOQUE A AÑADIR **** */}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const handleLogout = () => {
    localStorage.removeItem('email');
    localStorage.removeItem('rol');
    navigate('/');
  };

  const handleVoteSuccess = (message) => {
    setVotacionMensajeGlobal(message);
  };

  const handleVoteError = (message) => {
    setVotacionMensajeGlobal(message);
  };

  const renderMainContent = () => {
    return (
      <>
        
        {(() => {
          switch (currentContent) {
            case "profile":
              return (
                <>
                  {renderUserProfile()}
                </>
              );
            case "table":
              return loading ? (
                <p className={styles.loadingMessage}>Cargando datos...</p>
              ) : resultado ? (
                resultado.error ? (
                  <p className={styles.errorMessage}>{resultado.error}</p>
                ) : (
                  renderTable(resultado)
                )
              ) : (
                <p className={styles.noDataMessage}>
                  Selecciona una opción del menú para visualizar datos.
                </p>
              );
            case "chart":
              return <CandidatesBarChart />;
            case "vote":
              return (
                <VotingSection
                  userEmail={userEmail}
                  onVoteSuccess={handleVoteSuccess}
                  onVoteError={handleVoteError}
                />
              );
            default:
              return (
                <p className={styles.noDataMessage}>
                  Selecciona una opción del menú para visualizar datos.
                </p>
              );
          }
        })()}
      </>
    );
  };
  return (
    <div className={styles.userPanel}>
      <aside className={styles.sidebar}>
        <div className={styles["sidebar-header"]}>
          <h3> ______________________ </h3>
        </div>

        <div className={styles.actionButtons}>
          <button
            onClick={() => {
              setCurrentContent("profile");
              setResultado(null);
              setVotacionMensajeGlobal("");
              setEditMessage(""); // Limpiar mensaje de edición
              setIsEditing(false); // Salir del modo edición
              fetchAllUserData(); // Asegurarse de recargar el perfil si se sale de edición o se vuelve a Mi Perfil
            }}
            className={currentContent === "profile" ? styles.activeButton : ""}
          >
            <User size={18} className={styles.menuIcon} /> Mi Perfil
          </button>
          <button
            onClick={() => {
              setCurrentContent("vote");
              setResultado(null);
              setVotacionMensajeGlobal("");
              setEditMessage(""); // Limpiar mensaje de edición
              setIsEditing(false); // Salir del modo edición
            }}
            className={currentContent === "vote" ? styles.activeButton : ""}
          >
            <Vote size={18} className={styles.menuIcon} /> Votar
          </button>

          <button
            onClick={() => {
              setCurrentContent("chart");
              setResultado(null);
              setVotacionMensajeGlobal("");
              setEditMessage(""); // Limpiar mensaje de edición
              setIsEditing(false); // Salir del modo edición
            }}
            className={currentContent === "chart" ? styles.activeButton : ""}
          >
            <BarChart2 size={18} className={styles.menuIcon} /> Resultados
          </button>
          <button
            onClick={() => {
              fetchData("/api/reporte/reporte-votos-candidato", "resultados");
              setEditMessage(""); // Limpiar mensaje de edición
              setIsEditing(false); // Salir del modo edición
            }}
            className={currentContent === "resultados" ? styles.activeButton : ""}
          >
            <PieChart size={18} className={styles.menuIcon} /> Detalles
          </button>
        </div>
        <div className={styles.divider}></div>
        <button onClick={handleLogout} className={styles.logoutButton}>
          <LogOut size={18} className={styles.menuIcon} /> Cerrar sesión
        </button>
      </aside>
      <main className={styles.mainContent}>
        {renderMainContent()}
      </main>
    </div>
  );
};

export default UserPanel;