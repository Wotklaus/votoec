import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./styles/Admin.module.css";
import EventsMonitorContent from "../components/EventsMonitor";
import CandidatesBarChart from "../components/CandidatoBarChart";
import api from "../api"; // Asegúrate de que este 'api' esté configurado correctamente para hacer peticiones HTTP

// --- Importar íconos de Lucide React ---
import {
  BarChart2,          // Para Resultados (Gráfico)
  PieChart,           // Para Conteo por Candidato (Gráfico de torta o similar)
  FileText,           // Para Reporte General (Archivo)
  Monitor,            // Para Monitor de Eventos
  Users,              // Para Usuarios
  Wallet,             // Para Wallets
  UserCheck,          // Para Candidatos (Podría ser Vote, o User, etc.)
  Key,                // Para Rol de Usuario (llave o engranaje)
  LogOut,             // Para Cerrar sesión
  Edit,               // Para el botón de editar
  Trash2,             // Para el botón de eliminar
  Save,               // Para el botón de guardar
  XCircle,            // Para el botón de cancelar
  UserPlus,           // Para el botón de agregar candidato
  PlusCircle,         // --- NUEVO! Para el botón de agregar rol
} from "lucide-react";
// ----------------------------------------

// Mapeo para nombres de encabezados de tabla más legibles
const headerDisplayMap = {
  "votanteEmail": "EMAIL ",
  "votanteNombre": "NOMBRE ",
  "walletAddress": "WALLET ADDRESS",
  "privateKey": "PRIVATE KEY", // Considera ocultar esto en producción
  "candidatoNombre": "CANDIDATO",
  "txHash": "TX HASH",
  "FECHA": "FECHA",
  "nombre": "Nombre",
  "email": "Email",
  "apellido": "Apellido",
  "cedula": "Cédula",
  "telefono": "Teléfono",
  "wallet": "WALLET (Interno)", // Esto es más bien un campo objeto en MongoDB
  "id": "ID",
  "totalVotos": "Total Votos",
  "id_voto": "ID Voto",
  "id_usuario": "ID Usuario",
  "id_candidato": "ID Candidato",
  "id_rol": "ID Rol",
  "nombre_rol": "Nombre Rol",
  // Campos adicionales de candidatos para edición y creación
  "descripcion": "Descripción",
  "imagen_url": "URL Imagen",
};


const Admin = () => {
  const [resultado, setResultado] = useState(null); // Almacena los datos de la tabla o gráfico
  const [loading, setLoading] = useState(false); // Indica si una operación de API está en curso
  const [rutaActual, setRutaActual] = useState(""); // Guarda la ruta API activa
  const [currentContent, setCurrentContent] = useState("chart"); // Controla qué contenido se muestra (chart, table, eventsMonitor)
  const [currentTitle, setCurrentTitle] = useState("Resultados"); // Título de la sección actual
  const [editingRowId, setEditingRowId] = useState(null); // ID de la fila que está actualmente en modo de edición
  const [editedData, setEditedData] = useState({}); // Datos temporales de la fila que se está editando
  const navigate = useNavigate(); // Hook para la navegación de React Router

  // --- ESTADOS PARA AGREGAR CANDIDATO ---
  const [showAddCandidateForm, setShowAddCandidateForm] = useState(false); // Controla la visibilidad del formulario
  const [newCandidateData, setNewCandidateData] = useState({ // Estado para los datos del nuevo candidato
    nombre: "",
    // Valores por defecto para descripción e imagen_url
    descripcion: "Descripción por defecto",
    imagen_url: "https://ejemplo.com/imagen_default.png" // Puedes usar una URL de imagen real por defecto
  });
  // -------------------------------------

  // --- CAMBIOS PARA ROL DE USUARIO: NUEVO ESTADO PARA FORMULARIO DE ROL ---
  const [showAddRoleForm, setShowAddRoleForm] = useState(false); // Controla la visibilidad del formulario de rol
  const [newRoleData, setNewRoleData] = useState({
    nombre: "", // Solo necesitamos el nombre del rol
  });
  // -----------------------------------------------------------------------


  // Configuración de las tablas: campos a ocultar, título, si tiene acciones, campos editables y la clave primaria
  const configuracionPorRuta = {
    "/api/mongo/usuarios": {
      ocultar: ["wallet", "txHash", "auditoria", "__v"],
      title: "Wallets",
      mostrarAcciones: false,
    },
    "/api/pg/usuarios": {
      ocultar: ["activo", "contrasena"],
      title: "Usuarios",
      mostrarAcciones: false,
    },
    "/api/candidatos": {
      ocultar: ["activo", "descripcion", "imagen_url"],
      title: "Candidatos",
      mostrarAcciones: true,
      camposEditables: ["nombre"],
      idKey: "id",
    },
    "/api/roles": {
      ocultar: [],
      title: "Rol de Usuario",
      mostrarAcciones: true, // --- CAMBIOS PARA ROL DE USUARIO: HABILITADO ACCIONES ---
      camposEditables: ["nombre"],
      idKey: "id",
    },
    "/api/voto": {
      ocultar: [],
      title: "Votos Registrados",
      mostrarAcciones: false,
    },
    "/api/reporte/reporte-votos-candidato": {
      ocultar: [],
      mostrarAcciones: false,
      title: "Votos por Candidato"
    },
    "/api/reporte": {
      ocultar: ["fecha"],
      mostrarAcciones: false,
      title: "Reporte ",
      ordenCampos: [
        "votanteEmail",
        "votanteNombre",
        "walletAddress",
        "candidatoNombre",
        "txHash",
      ],
    },
    default: {
      ocultar: [],
      mostrarAcciones: false,
      title: " "
    },
  };

  // Función para obtener datos de la API
  const fetchData = async (endpoint) => {
    setLoading(true);
    setResultado(null);
    setRutaActual(endpoint);
    setCurrentContent("table");
    setCurrentTitle(configuracionPorRuta[endpoint]?.title || configuracionPorRuta.default.title);
    setEditingRowId(null);
    setEditedData({});
    // --- CAMBIOS PARA ROL DE USUARIO: RESETEAR FORMULARIOS AL CARGAR TABLA ---
    setShowAddCandidateForm(false); // Cierra el formulario de agregar candidato
    setNewCandidateData({ // Resetea datos del formulario con los valores por defecto
      nombre: "",
      descripcion: "Descripción por defecto",
      imagen_url: "https://ejemplo.com/imagen_default.png"
    });
    setShowAddRoleForm(false); // Cierra el formulario de agregar rol
    setNewRoleData({ nombre: "" }); // Resetea datos del formulario de rol
    // -----------------------------------------------------------------------
    try {
      const res = await api.get(endpoint);
      setResultado(res.data);
    } catch (err) {
      setResultado({ error: "Error al consultar: " + (err.response?.data?.error || err.message) });
      console.error("Error al obtener datos:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- FUNCIONES PARA EDICIÓN Y ELIMINACIÓN ---
  const handleEditClick = (row) => {
    const config = configuracionPorRuta[rutaActual];
    if (config && config.idKey) {
      setEditingRowId(row[config.idKey]);
      setEditedData({ ...row });
    }
  };

  const handleCancelEdit = () => {
    setEditingRowId(null);
    setEditedData({});
  };

  const handleSaveEdit = async (rowId) => {
    setLoading(true);
    const config = configuracionPorRuta[rutaActual];

    if (!config || !config.idKey || !config.camposEditables) {
      alert("Error: Configuración de tabla incompleta para guardar.");
      setLoading(false);
      return;
    }

    try {
      const dataToSend = {};
      config.camposEditables.forEach(key => {
        if (editedData.hasOwnProperty(key)) {
          dataToSend[key] = editedData[key];
        }
      });

      let endpoint = '';
      if (rutaActual === "/api/candidatos") {
        endpoint = `/api/candidatos/${rowId}`;
      } else if (rutaActual === "/api/roles") {
        endpoint = `/api/roles/${rowId}`; // --- CAMBIOS PARA ROL DE USUARIO: ENDPOINT DE EDICIÓN DE ROL ---
      } else {
        alert("Error: Edición no soportada para esta tabla.");
        setLoading(false);
        return;
      }

      await api.put(endpoint, dataToSend);
      setEditingRowId(null);
      setEditedData({});
      fetchData(rutaActual);
    } catch (err) {
      alert("Error al actualizar el registro: " + (err.response?.data?.message || err.message));
      console.error("Error al actualizar:", err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e, key) => {
    setEditedData({
      ...editedData,
      [key]: e.target.value,
    });
  };

  const handleDeleteClick = async (rowId) => {
    setLoading(true);
    const config = configuracionPorRuta[rutaActual];
    if (!config || !config.idKey) {
      
    
      setLoading(false);
      return;
    }

    try {
      let endpoint = '';
      if (rutaActual === "/api/candidatos") {
        endpoint = `/api/candidatos/${rowId}`;
      } else if (rutaActual === "/api/roles") {
        endpoint = `/api/roles/${rowId}`; // --- CAMBIOS PARA ROL DE USUARIO: ENDPOINT DE ELIMINACIÓN DE ROL ---
      } else {
        alert("Error: Eliminación no soportada para esta tabla.");
        setLoading(false);
        return;
      }

      await api.delete(endpoint);
     
      fetchData(rutaActual);
    } catch (err) {
      
      console.error("Error al eliminar:", err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };
  // --- FIN FUNCIONES DE CRUD ---


  // --- NUEVAS FUNCIONES PARA AGREGAR CANDIDATO ---
  const handleAddCandidateChange = (e) => {
    const { name, value } = e.target;
    setNewCandidateData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleAddCandidateSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/api/candidatos", newCandidateData);
      
      setShowAddCandidateForm(false);
      setNewCandidateData({
        nombre: "",
        descripcion: "Descripción por defecto",
        imagen_url: "https://ejemplo.com/imagen_default.png"
      });
      fetchData("/api/candidatos");
    } catch (err) {
      alert("Error al agregar candidato: " + (err.response?.data?.error || err.message));
      console.error("Error al agregar candidato:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAddCandidate = () => {
    setShowAddCandidateForm(false);
    setNewCandidateData({
      nombre: "",
      descripcion: "Descripción por defecto",
      imagen_url: "https://ejemplo.com/imagen_default.png"
    });
  };
  // -----------------------------------------------------------------

  // --- CAMBIOS PARA ROL DE USUARIO: NUEVAS FUNCIONES PARA AGREGAR ROL ---
  const handleAddRoleChange = (e) => {
    const { name, value } = e.target;
    setNewRoleData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleAddRoleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Endpoint para agregar rol, asumiendo que tu backend espera un objeto { nombre_rol: "..." }
      await api.post("/api/roles", newRoleData);
     
      setShowAddRoleForm(false); // Cierra el formulario
      setNewRoleData({ nombre: "" }); // Limpia el formulario
      fetchData("/api/roles"); // Recarga la tabla de roles
    } catch (err) {
      alert("Error al agregar rol: " + (err.response?.data?.error || err.message));
      console.error("Error al agregar rol:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAddRole = () => {
    setShowAddRoleForm(false);
    setNewRoleData({ nombre: "" }); // Limpia el formulario
  };
  // ----------------------------------------------------------------------


  // Renderiza la tabla de datos
  const renderTable = (data) => {
    // ... (El código de renderTable es el mismo que el anterior) ...
    if (!data || typeof data !== "object") return <p>No hay datos disponibles.</p>;

    const rows = Array.isArray(data) ? data : [data];
    if (rows.length === 0) return <p>No hay datos disponibles.</p>;

    const config = configuracionPorRuta[rutaActual] || configuracionPorRuta.default;
    const showActionButtons = config.mostrarAcciones === true;

    if (rutaActual === "/api/mongo/usuarios") {
      rows.forEach(row => {
        if (row.wallet && typeof row.wallet === "object") {
          row.walletAddress = row.wallet.address;
          row.privateKey = row.wallet.privateKey;
        }
      });
    }

    let dataKeysFromSource = Object.keys(rows[0] || {});
    let orderedDataKeys = [];

    if (config.ordenCampos && Array.isArray(config.ordenCampos) && config.ordenCampos.length > 0) {
      orderedDataKeys = config.ordenCampos.filter(key => dataKeysFromSource.includes(key) || key === "walletAddress" || key === "privateKey");
    } else {
      orderedDataKeys = dataKeysFromSource;
    }

    let dataHeaders = orderedDataKeys.filter(
      (header) => !config.ocultar.includes(header)
    );

    const displayHeaders = dataHeaders.map(headerKey => {
      if (headerKey === "walletAddress" && rutaActual === "/api/mongo/usuarios") {
        return "WALLET ";
      }
      return headerDisplayMap[headerKey] || headerKey.replace(/([A-Z])/g, ' $1').trim();
    });

    return (
      <div className={styles["table-wrapper"]}>
        <table className={styles.table}>
          <thead className={styles.thead}>
            <tr>
              {displayHeaders.map((headerText, idx) => (
                <th key={idx} className={styles.th}>
                  {headerText.toUpperCase()}
                </th>
              ))}
              {showActionButtons && <th className={styles.th}>ACCIONES</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => {
              const rowId = row[config.idKey];
              const isEditing = editingRowId === rowId;

              return (
                <tr key={idx} className={styles.tr}>
                  {dataHeaders.map((headerKey, hidx) => {
                    let displayValue = row[headerKey];

                    if (config.formatearCampos && config.formatearCampos[headerKey]) {
                      displayValue = config.formatearCampos[headerKey](row[headerKey]);
                    } else if (typeof row[headerKey] === "object" && row[headerKey] !== null) {
                      if (headerKey.toLowerCase() === "wallet" && row[headerKey]?.address) {
                        displayValue = row[headerKey].address;
                      } else {
                        displayValue = JSON.stringify(row[headerKey]);
                      }
                    }

                    const isEditableField = isEditing && config.camposEditables?.includes(headerKey);

                    return (
                      <td
                        key={hidx}
                        className={`${styles.td} ${isEditableField ? styles.editableCell : ""}`}
                      >
                        {isEditableField ? (
                          <input
                            type="text"
                            value={editedData[headerKey] || ''}
                            onChange={(e) => handleInputChange(e, headerKey)}
                            className={styles.editInput}
                            disabled={loading}
                          />
                        ) : (
                          displayValue
                        )}
                      </td>
                    );
                  })}
                  {showActionButtons && (
                    <td className={styles.td}>
                      <div className={styles.actionCell}>
                        {isEditing ? (
                          <>
                            <button
                              className={styles.saveBtn}
                              onClick={() => handleSaveEdit(rowId)}
                              disabled={loading}
                            >
                              <Save size={16} /> Guardar
                            </button>
                            <button
                              className={styles.cancelBtn}
                              onClick={handleCancelEdit}
                              disabled={loading}
                            >
                              <XCircle size={16} /> Cancelar
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              className={styles.editBtn}
                              onClick={() => handleEditClick(row)}
                              disabled={loading}
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              className={styles.deleteBtn}
                              onClick={() => handleDeleteClick(rowId)}
                              disabled={loading}
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  // Renderiza el contenido principal del dashboard (gráfico, tabla o monitor de eventos)
  const renderMainContent = () => {
    switch (currentContent) {
      case "chart":
        return <CandidatesBarChart />;
      case "table":
        // Primero, siempre renderizamos el mensaje de carga, error o la tabla
        const tableOrMessage = loading ? (
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

        // --- CAMBIOS PARA ROL DE USUARIO: CONDICIONAL PARA MOSTRAR FORMULARIO DE AGREGAR ROL ---
        if (rutaActual === "/api/roles" && showAddRoleForm) {
          return (
            <>
              {tableOrMessage} {/* Renderiza la tabla (o mensaje) primero */}
              <div className={styles.formContainer}>
                <h3>Agregar Nuevo Rol de Usuario</h3>
                <form onSubmit={handleAddRoleSubmit} className={styles.addForm}>
                  <div className={styles.formGroup}>
                    <label htmlFor="nombre">Nombre del Rol:</label>
                    <input
                      type="text"
                      id="nombre"
                      name="nombre"
                      value={newRoleData.nombre}
                      onChange={handleAddRoleChange}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className={styles.formActions}>
                    <button type="submit" className={styles.saveBtn} disabled={loading}>
                      <Save size={16} /> Guardar Rol
                    </button>
                    <button type="button" className={styles.cancelBtn} onClick={handleCancelAddRole} disabled={loading}>
                      <XCircle size={16} /> Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </>
          );
        }
        // ------------------------------------------------------------------------------------------

        // Si estamos en la ruta de candidatos y el formulario de añadir está abierto
        // Y queremos que aparezca DEBAJO de la tabla
        if (rutaActual === "/api/candidatos" && showAddCandidateForm) {
          return (
            <>
              {tableOrMessage} {/* Renderiza la tabla (o mensaje) primero */}
              <div className={styles.formContainer}>
                <h3>Agregar Nuevo Candidato</h3>
                <form onSubmit={handleAddCandidateSubmit} className={styles.addForm}>
                  <div className={styles.formGroup}>
                    <label htmlFor="nombre">Nombre:</label>
                    <input
                      type="text"
                      id="nombre"
                      name="nombre"
                      value={newCandidateData.nombre}
                      onChange={handleAddCandidateChange}
                      required
                      disabled={loading}
                    />
                  </div>
                  {/* Campos descripcion e imagen_url OCULTOS y con valores por defecto */}
                  <div className={styles.formActions}>
                    <button type="submit" className={styles.saveBtn} disabled={loading}>
                      <Save size={16} /> Guardar Candidato
                    </button>
                    <button type="button" className={styles.cancelBtn} onClick={handleCancelAddCandidate} disabled={loading}>
                      <XCircle size={16} /> Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </>
          );
        }

        // Si no estamos mostrando ningún formulario, simplemente devuelve la tabla o el mensaje
        return tableOrMessage;

      case "eventsMonitor":
        return <EventsMonitorContent />;
      default:
        return (
          <p className={styles.noDataMessage}>
            Selecciona una opción del menú para visualizar datos.
          </p>
        );
    }
  };

  return (
    <div className={styles["admin-dashboard"]}>
      {/* Barra lateral de navegación */}
      <nav className={styles.sidebar}>
        <div className={styles["sidebar-header"]}>
          <h2>AdminPanel</h2>
        </div>
        <div className={styles["action-buttons"]}>
          <p className={styles.menuSectionTitle}>Reportes </p>
          {/* Botones para reportes y monitor de eventos */}
          <button
            onClick={() => {
              setCurrentContent("chart");
              setCurrentTitle(" ");
              setResultado(null);
              setRutaActual("");
              setEditingRowId(null); // Resetear estado de edición al cambiar de vista
              setEditedData({});
              setShowAddCandidateForm(false); // Resetear formulario de agregar
              setNewCandidateData({ nombre: "", descripcion: "Descripción por defecto", imagen_url: "https://ejemplo.com/imagen_default.png" });
              setShowAddRoleForm(false); // --- CAMBIOS PARA ROL DE USUARIO: Resetear form de rol ---
              setNewRoleData({ nombre: "" }); // --- CAMBIOS PARA ROL DE USUARIO: Resetear datos de rol ---
            }}
            className={currentContent === "chart" ? styles.activeButton : styles.actionButton}
          >
            <BarChart2 size={25} className={styles.buttonIcon} /> Resultados
          </button>
          <button
            onClick={() => {
              setCurrentContent("table");
              fetchData("/api/reporte/reporte-votos-candidato");
            }}
            className={currentContent === "table" && rutaActual === "/api/reporte/reporte-votos-candidato" ? styles.activeButton : styles.actionButton}
          >
            <PieChart size={25} className={styles.buttonIcon} /> Detalles de Votos
          </button>
          <button
            onClick={() => {
              setCurrentContent("table");
              fetchData("/api/reporte");
            }}
            className={currentContent === "table" && rutaActual === "/api/reporte" ? styles.activeButton : styles.actionButton}
          >
            <FileText size={25} className={styles.buttonIcon} /> Reporte 
          </button>
          <button
            onClick={() => {
              setCurrentContent("eventsMonitor");
              setCurrentTitle("");
              setResultado(null);
              setRutaActual("");
              setEditingRowId(null); // Resetear estado de edición al cambiar de vista
              setEditedData({});
              setShowAddCandidateForm(false); // Resetear formulario de agregar
              setNewCandidateData({ nombre: "", descripcion: "Descripción por defecto", imagen_url: "https://ejemplo.com/imagen_default.png" });
              setShowAddRoleForm(false); // --- CAMBIOS PARA ROL DE USUARIO: Resetear form de rol ---
              setNewRoleData({ nombre: "" }); // --- CAMBIOS PARA ROL DE USUARIO: Resetear datos de rol ---
            }}
            className={currentContent === "eventsMonitor" ? styles.activeButton : styles.actionButton}
          >
            <Monitor size={25} className={styles.buttonIcon} /> Monitor de Eventos
          </button>

          <div className={styles.divider}></div>

          <p className={styles.menuSectionTitle}>Gestión de Datos</p>
          {/* Botones para gestión de datos (tablas con posible CRUD) */}
          <button
            onClick={() => {
              setCurrentContent("table");
              fetchData("/api/pg/usuarios");
            }}
            className={currentContent === "table" && rutaActual === "/api/pg/usuarios" ? styles.activeButton : styles.actionButton}
          >
            <Users size={25} className={styles.buttonIcon} /> Usuarios 
          </button>
          <button
            onClick={() => {
              setCurrentContent("table");
              fetchData("/api/mongo/usuarios");
            }}
            className={currentContent === "table" && rutaActual === "/api/mongo/usuarios" ? styles.activeButton : styles.actionButton}
          >
            <Wallet size={25} className={styles.buttonIcon} /> Wallets 
          </button>
          <button
            onClick={() => {
              setCurrentContent("table");
              fetchData("/api/candidatos");
            }}
            className={currentContent === "table" && rutaActual === "/api/candidatos" ? styles.activeButton : styles.actionButton}
          >
            <UserCheck size={25} className={styles.buttonIcon} /> Candidatos
          </button>
          {/* Botón de Agregar Candidato ELIMINADO DE AQUÍ DE LA BARRA LATERAL */}
          <button
            onClick={() => {
              setCurrentContent("table");
              fetchData("/api/roles");
            }}
            className={currentContent === "table" && rutaActual === "/api/roles" ? styles.activeButton : styles.actionButton}
          >
            <Key size={25} className={styles.buttonIcon} /> Rol de Usuario
          </button>

          <div className={styles.divider}></div>

          {/* Botón de cerrar sesión */}
          <button onClick={() => {
            localStorage.removeItem('email'); // Limpia el email almacenado
            localStorage.removeItem('rol'); // Limpia el rol almacenado
            navigate("/"); // Redirige a la página de inicio/login
          }} className={styles.logoutButton}>
            <LogOut size={25} className={styles.buttonIcon} /> Cerrar sesión
          </button>
        </div>
      </nav>

      {/* Contenido principal del dashboard */}
      <main className={styles["main-content"]}>
        <section className={styles.results}>
          <h4 className={styles.sectionTitle}>
            {currentTitle} {/* Muestra el título de la sección actual */}
          </h4>

          {renderMainContent()} {/* Renderiza el contenido dinámico (tabla +/o formulario) */}

          {/* --- UBICACIÓN PARA EL BOTÓN AGREGAR CANDIDATO (DEBAJO DE LA TABLA) --- */}
          {/* Se muestra solo si estamos en la vista de candidatos, es una tabla y el formulario no está abierto */}
          {rutaActual === "/api/candidatos" && currentContent === "table" && !showAddCandidateForm && (
            <div className={styles.addButtonContainer}> {/* Contenedor para el botón si quieres más control CSS */}
              <button
                onClick={() => {
                  setShowAddCandidateForm(true); // Muestra el formulario
                  setEditingRowId(null); // Asegura que no estemos en modo edición de fila
                  setEditedData({}); // Limpia datos de edición
                }}
                className={styles.actionButton} // Puedes usar una clase diferente para este botón
                disabled={loading}
              >
                <UserPlus size={20} className={styles.buttonIcon} /> Agregar Candidato
              </button>
            </div>
          )}
          {/* ---------------------------------------------------- */}

          {/* --- CAMBIOS PARA ROL DE USUARIO: UBICACIÓN PARA EL BOTÓN AGREGAR ROL --- */}
          {rutaActual === "/api/roles" && currentContent === "table" && !showAddRoleForm && (
            <div className={styles.addButtonContainer}>
              <button
                onClick={() => {
                  setShowAddRoleForm(true);
                  setEditingRowId(null);
                  setEditedData({});
                }}
                className={styles.actionButton} // Puedes usar la misma clase o una nueva si lo deseas
                disabled={loading}
              >
                <PlusCircle size={20} className={styles.buttonIcon} /> Agregar Rol
              </button>
            </div>
          )}
          {/* ------------------------------------------------------------------------- */}
        </section>
      </main>
    </div>
  );
};

export default Admin;