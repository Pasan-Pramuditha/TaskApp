import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import '../App.css';

const Dashboard = () => {
    const [user] = useState(() => {
        const userData = localStorage.getItem('user');
        return userData ? JSON.parse(userData) : null;
    });

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const navigate = useNavigate();


    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await api.get('/products');
            setProducts(response.data);
        } catch (err) {
            if (err.response?.status === 401) {
                alert("Session expired. Please login again.");
                handleLogout();
            } else {
                alert("Error fetching data.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        setShowLogoutModal(true);
    };

    const confirmLogout = async () => {
        try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
                await api.post('/auth/logout', { refreshToken });
            }
        } catch (err) {
            console.error("Logout error:", err);
        } finally {

            localStorage.clear();
            navigate('/');
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            position: 'relative',
            background: 'radial-gradient(circle at 70% 30%, #005a78, #001f2b)',
            overflowX: 'hidden',
            padding: '40px 20px'
        }}>
            {/* Animated Particles */}
            <div className="particles-container">
                {[...Array(40)].map((_, i) => (
                    <div
                        key={i}
                        className="particle"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            width: `${Math.random() * 3 + 1}px`,
                            height: `${Math.random() * 3 + 1}px`,
                            animationDelay: `${Math.random() * 20}s`,
                            animationDuration: `${Math.random() * 15 + 15}s`,
                            opacity: Math.random() * 0.4 + 0.2
                        }}
                    ></div>
                ))}
            </div>

            <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                <header style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '50px',
                    padding: '20px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '20px',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                    <div>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, color: 'white' }}>Dashboard</h1>
                        <div style={{ height: '3px', width: '60px', background: '#00d2d3', marginTop: '5px' }}></div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>


                        <button
                            onClick={handleLogout}
                            className="logout-btn"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                <polyline points="16 17 21 12 16 7" />
                                <line x1="21" y1="12" x2="9" y2="12" />
                            </svg>
                            <span>Logout</span>
                        </button>
                    </div>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginBottom: '40px' }}>
                    {/* User Profile Card */}
                    <div className="glass-card" style={{
                        padding: '40px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        background: 'rgba(255, 255, 255, 0.05)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: '24px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        textAlign: 'center'
                    }}>
                        <div style={{
                            width: '90px',
                            height: '90px',
                            background: 'linear-gradient(135deg, #00878a, #39b54a)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '2.5rem',
                            fontWeight: 700,
                            color: 'white',
                            marginBottom: '20px',
                            boxShadow: '0 15px 30px rgba(0, 135, 138, 0.3)'
                        }}>
                            {user?.username.charAt(0).toUpperCase()}
                        </div>
                        <h3 style={{ fontSize: '1.75rem', marginBottom: '8px', color: 'white' }}>{user?.username}</h3>
                        <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '10px' }}>{user?.email}</p>
                    </div>


                    {/* Data Fetch Card */}
                    <div className="glass-card" style={{
                        padding: '40px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        background: 'rgba(255, 255, 255, 0.05)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '24px'
                    }}>

                        <button
                            onClick={fetchProducts}
                            disabled={loading}
                            style={{
                                alignSelf: 'center',
                                padding: '16px 32px',
                                background: loading ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #00878a, #39b54a)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '14px',
                                fontWeight: 700,
                                fontSize: '1rem',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                boxShadow: loading ? 'none' : '0 10px 20px rgba(0, 135, 138, 0.3)'
                            }}
                            onMouseOver={(e) => !loading && (e.target.style.transform = 'translateY(-2px)')}
                            onMouseOut={(e) => !loading && (e.target.style.transform = 'translateY(0)')}
                        >
                            {loading ? (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div className="spinner-small"></div> Processing...
                                </span>
                            ) : 'Fetch System Data'}
                        </button>
                    </div>
                </div>

                {/* Table Section */}
                <div className="glass-card" style={{
                    padding: '40px',
                    background: 'rgba(15, 23, 42, 0.4)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '24px'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                        <h4 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'white' }}>Inventory Overview</h4>
                        {products.length > 0 && (
                            <span style={{ padding: '6px 14px', background: 'rgba(0, 210, 211, 0.1)', color: '#00d2d3', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 600 }}>
                                {products.length} Items Found
                            </span>
                        )}
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                                    <th style={{ textAlign: 'left', padding: '15px', color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Index</th>
                                    <th style={{ textAlign: 'left', padding: '15px', color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Production Name</th>
                                    <th style={{ textAlign: 'left', padding: '15px', color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Description</th>
                                    <th style={{ textAlign: 'right', padding: '15px', color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Stock Qty</th>
                                    <th style={{ textAlign: 'right', padding: '15px', color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.length > 0 ? (
                                    products.map((p, index) => (
                                        <tr key={p.productId} style={{
                                            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                                            transition: 'background 0.2s',
                                            cursor: 'pointer'
                                        }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'}
                                            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                                            <td style={{ padding: '20px 15px', fontWeight: 600, color: '#00d2d3' }}>
                                                {String(index + 1).padStart(2, '0')}
                                            </td>
                                            <td style={{ padding: '20px 15px', fontWeight: 500 }}>{p.name}</td>
                                            <td style={{ padding: '20px 15px', color: 'rgba(255,255,255,0.6)', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={p.description}>
                                                {p.description || '-'}
                                            </td>
                                            <td style={{ padding: '20px 15px', textAlign: 'right', color: p.stockQuantity < 10 ? '#ff6b6b' : 'white' }}>
                                                {p.stockQuantity}
                                            </td>
                                            <td style={{ padding: '20px 15px', textAlign: 'right', fontWeight: 700, color: '#39b54a' }}>
                                                Rs. {p.price.toLocaleString()}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: 'center', padding: '100px 0', color: 'rgba(255,255,255,0.3)' }}>
                                            <div style={{ fontSize: '3rem', marginBottom: '15px' }}>📦</div>
                                            <p>No operational data available.</p>
                                            <p style={{ fontSize: '0.875rem', marginTop: '5px' }}>Please initiate a system fetch to load product records.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Logout Confirmation Modal */}
            {showLogoutModal && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0, 0, 0, 0.6)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    animation: 'fadeIn 0.25s ease'
                }}>
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.07)',
                        backdropFilter: 'blur(30px)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '24px',
                        padding: '50px 45px',
                        maxWidth: '420px',
                        width: '90%',
                        textAlign: 'center',
                        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5)',
                        animation: 'slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
                    }}>
                        {/* Icon */}
                        <div style={{
                            width: '70px',
                            height: '70px',
                            background: 'rgba(255, 77, 77, 0.15)',
                            border: '1px solid rgba(255, 77, 77, 0.3)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 25px',
                        }}>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ff4d4d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                <polyline points="16 17 21 12 16 7" />
                                <line x1="21" y1="12" x2="9" y2="12" />
                            </svg>
                        </div>

                        <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'white', marginBottom: '12px' }}>
                            Logout
                        </h2>
                        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.05rem', marginBottom: '35px', lineHeight: 1.6 }}>
                            Are you sure you want to log out of the system?
                        </p>

                        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                            {/* Cancel Button */}
                            <button
                                onClick={() => setShowLogoutModal(false)}
                                className="modal-cancel-btn"
                            >
                                No
                            </button>

                            {/* Confirm Button */}
                            <button
                                onClick={confirmLogout}
                                className="modal-confirm-btn"
                            >
                                Yes, Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .spinner-small {
                    width: 16px;
                    height: 16px;
                    border: 2px solid rgba(255,255,255,0.3);
                    border-radius: 50%;
                    border-top-color: #fff;
                    animation: spin 0.8s linear infinite;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(30px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .logout-btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 12px 22px;
                    background: linear-gradient(135deg, rgba(255,77,77,0.15), rgba(255,77,77,0.05));
                    color: #ff6b6b;
                    border: 1px solid rgba(255, 77, 77, 0.4);
                    border-radius: 14px;
                    font-weight: 700;
                    font-size: 0.95rem;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    backdrop-filter: blur(10px);
                    box-shadow: 0 4px 15px rgba(255, 77, 77, 0.1), inset 0 1px 0 rgba(255,255,255,0.1);
                    letter-spacing: 0.3px;
                }
                .logout-btn:hover {
                    background: linear-gradient(135deg, rgba(255,77,77,0.25), rgba(255,77,77,0.12));
                    border-color: rgba(255, 77, 77, 0.7);
                    color: #ff4d4d;
                    transform: translateY(-2px);
                    box-shadow: 0 10px 30px rgba(255, 77, 77, 0.25), inset 0 1px 0 rgba(255,255,255,0.15);
                }
                .logout-btn:active {
                    transform: translateY(0px);
                }
                .modal-cancel-btn {
                    flex: 1;
                    padding: 14px 20px;
                    background: rgba(255, 255, 255, 0.06);
                    color: rgba(255, 255, 255, 0.75);
                    border: 1px solid rgba(255, 255, 255, 0.12);
                    border-radius: 14px;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                .modal-cancel-btn:hover {
                    background: rgba(255, 255, 255, 0.12);
                    color: white;
                    transform: translateY(-1px);
                }
                .modal-confirm-btn {
                    flex: 1;
                    padding: 14px 20px;
                    background: linear-gradient(135deg, #ff4d4d, #cc2200);
                    color: white;
                    border: none;
                    border-radius: 14px;
                    font-size: 1rem;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    box-shadow: 0 6px 20px rgba(255, 77, 77, 0.35);
                }
                .modal-confirm-btn:hover {
                    background: linear-gradient(135deg, #ff6666, #dd3311);
                    transform: translateY(-2px);
                    box-shadow: 0 10px 30px rgba(255, 77, 77, 0.5);
                }
                .modal-confirm-btn:active {
                    transform: translateY(0);
                }
            `}</style>
        </div>
    );
};

export default Dashboard;

