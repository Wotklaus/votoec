import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import api from '../api'; // Asegúrate de que tu instancia de Axios para API esté bien importada
import styles from '../pages/styles/Admin.module.css'; // Para usar algunos estilos base del admin

// Registrar los componentes de Chart.js que vamos a usar
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const CandidatesBarChart = () => {
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Colores predefinidos para las barras
    const backgroundColors = [
        'rgba(15, 107, 107, 0.6)', // Teal
        'rgba(35, 192, 56, 0.6)', // Purple
        'rgba(211, 208, 28, 0.55)', // Orange
        'rgba(255, 99, 132, 0.6)',  // Red
        'rgba(54, 162, 235, 0.6)',  // Blue
        'rgba(201, 203, 207, 0.6)'  // Grey
    ];
    const borderColors = [
        'rgba(106, 147, 194, 1)',
        'rgba(100, 212, 132, 1)',
        'rgba(255, 183, 111, 1)',
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(201, 203, 207, 1)'
    ];

    useEffect(() => {
        const fetchChartData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Obtener el reporte de votos por candidato
                const reportRes = await api.get('/api/reporte/reporte-votos-candidato');
                const data = reportRes.data;

                if (data && Array.isArray(data) && data.length > 0) {
                    // Las etiquetas del gráfico serán directamente los nombres de los candidatos.
                    // Asumimos que `item.nombre_candidato` viene del reporte.
                    const labels = data.map(item => item.nombre || `Candidato ${item.id}`);
                    const votes = data.map(item => item.totalVotos);

                    setChartData({
                        labels: labels,
                        datasets: [
                            {
                                label: 'Total de Votos',
                                data: votes,
                                backgroundColor: backgroundColors.slice(0, labels.length),
                                borderColor: borderColors.slice(0, labels.length),
                                borderWidth: 1,
                            },
                        ],
                    });
                } else {
                    setChartData({ labels: [], datasets: [] });
                }
            } catch (err) {
                console.error("Error al obtener datos para el gráfico:", err);
                setError("No se pudieron cargar los datos del gráfico.");
                setChartData({ labels: [], datasets: [] });
            } finally {
                setLoading(false);
            }
        };

        fetchChartData();
    }, []);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    font: {
                        size: 14,
                    },
                    color: '#333',
                }
            },
            title: {
                display: true,
                text: 'Resultados ',
                font: {
                    size: 25,
                    weight: 'bold'
                },
                color: '#000000',
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += new Intl.NumberFormat('es-ES').format(context.parsed.y) + ' votos';
                        }
                        return label;
                    },
                }
            }
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Candidatos',
                    font: {
                        size: 16,
                        weight: 'bold'
                    },
                    color: '#444',
                },
                ticks: {
                    // Habilitamos la visualización de las etiquetas del eje X para mostrar los nombres de los candidatos
                    display: true,
                    font: {
                        size: 15
                    },
                    color: '#000000',
                },
                grid: {
                    display: false
                },
            },
            y: {
                title: {
                    display: true,
                    text: ' Votos',
                    font: {
                        size: 16,
                        weight: 'bold'
                    },
                    color: '#444',
                },
                ticks: {
                    beginAtZero: true,
                    font: {
                        size: 12
                    },
                    color: '#555',
                },
                grid: {
                    color: '#e0e0e0'
                }
            },
        },
    };

    if (loading) {
        return <p className={styles.loadingMessage}>Cargando gráfico de resultados...</p>;
    }

    if (error) {
        return <p className={styles.errorMessage}>{error}</p>;
    }

    if (chartData.labels.length === 0) {
        return <p className={styles.noDataMessage}>No hay datos de votación para mostrar en el gráfico.</p>;
    }

    return (
        <div className={styles.chartWrapper}>
            <div className={styles.chartContainer}>
                {/* El componente Bar de Chart.js se encargará de renderizar las barras con las etiquetas del eje X */}
                <Bar data={chartData} options={options} />
            </div>
            {/* Se elimina completamente el div `candidatePhotosOverlay` y su contenido,
                ya que no se requiere la superposición de imágenes. */}
        </div>
    );
};

export default CandidatesBarChart;