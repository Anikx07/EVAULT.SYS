<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>EVAULT.SYS | SECURE_ARCHIVE</title>
    <!-- Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@300;400;500&display=swap" rel="stylesheet">
    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- React & Babel CDNs -->
    <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <!-- Framer Motion CDN -->
    <script src="https://unpkg.com/framer-motion@10.16.4/dist/framer-motion.js"></script>
    <!-- Recharts CDN -->
    <script src="https://unpkg.com/recharts/umd/Recharts.js"></script>
    <!-- Lucide Icons CDN -->
    <script src="https://unpkg.com/lucide@latest"></script>

    <style>
        :root {
            --color-vault-bg-dark: #000000;
            --color-vault-surface-dark: #0a0a0a;
            --color-vault-border-dark: #1a1a1a;
            --color-vault-accent-dark: #00f3ff;
            --color-vault-secondary-dark: #ff00ff;
            --color-vault-neon-green: #39ff14;
            --color-vault-danger: #ff003c;
        }

        body {
            font-family: 'Space Grotesk', sans-serif;
            background: var(--color-vault-bg-dark);
            color: white;
            overflow-x: hidden;
        }

        .cyber-tile {
            background: rgba(10, 10, 10, 0.9);
            backdrop-filter: blur(10px);
            border: 1px solid var(--color-vault-border-dark);
            transition: all 0.3s ease;
        }

        .cyber-tile:hover {
            border-color: var(--color-vault-accent-dark);
            box-shadow: 0 0 20px rgba(0, 243, 255, 0.1);
        }

        .cyber-btn {
            clip-path: polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%);
            padding: 12px 24px;
            font-family: 'JetBrains Mono', monospace;
            font-weight: bold;
            text-transform: uppercase;
            transition: all 0.2s ease;
        }

        .cyber-btn-primary {
            background: var(--color-vault-accent-dark);
            color: black;
        }

        .cyber-btn-primary:hover {
            filter: brightness(1.1);
            box-shadow: 0 0 15px rgba(0, 243, 255, 0.5);
        }

        .cyber-text-gradient {
            background: linear-gradient(to right, var(--color-vault-accent-dark), var(--color-vault-secondary-dark));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .scanline {
            width: 100%;
            height: 100px;
            z-index: 10;
            background: linear-gradient(0deg, rgba(0, 0, 0, 0) 0%, rgba(0, 243, 255, 0.05) 50%, rgba(0, 0, 0, 0) 100%);
            position: fixed;
            bottom: 100%;
            animation: scanline 8s linear infinite;
            pointer-events: none;
        }

        @keyframes scanline {
            0% { bottom: 100%; }
            100% { bottom: -100px; }
        }
    </style>
</head>
<body>
    <div id="root"></div>

    <script type="text/babel">
        const { useState, useEffect, useMemo } = React;
        const { motion, AnimatePresence } = window.framerMotion;
        const { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } = window.Recharts;

        // --- API HELPER ---
        const API_URL = 'api.php';
        const api = {
            login: (data) => fetch(`${API_URL}?action=login`, { method: 'POST', body: JSON.stringify(data) }).then(r => r.json()),
            getUsers: () => fetch(`${API_URL}?action=get_users`).then(r => r.json()),
            getFiles: () => fetch(`${API_URL}?action=get_files`).then(r => r.json()),
            createUser: (data) => fetch(`${API_URL}?action=create_user`, { method: 'POST', body: JSON.stringify(data) }).then(r => r.json()),
            deleteFile: (id) => fetch(`${API_URL}?action=delete_file&id=${id}`).then(r => r.json()),
        };

        function App() {
            const [isLoggedIn, setIsLoggedIn] = useState(false);
            const [user, setUser] = useState(null);
            const [users, setUsers] = useState([]);
            const [files, setFiles] = useState([]);
            const [isAdminView, setIsAdminView] = useState(false);
            const [adminTab, setAdminTab] = useState('insights');
            const [activeCategory, setActiveCategory] = useState(null);

            // Load Data
            useEffect(() => {
                if (isLoggedIn && user?.role === 'admin') {
                    api.getUsers().then(setUsers);
                    api.getFiles().then(setFiles);
                }
            }, [isLoggedIn, user]);

            const handleLogin = async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const res = await api.login(Object.fromEntries(formData));
                if (res.status === 'success') {
                    setUser(res.user);
                    setIsLoggedIn(true);
                } else {
                    alert('ACCESS_DENIED');
                }
            };

            if (!isLoggedIn) {
                return (
                    <div className="min-h-screen flex items-center justify-center p-4">
                        <div className="scanline"></div>
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md p-12 cyber-tile">
                            <h1 className="text-6xl font-bold mb-2 text-center cyber-text-gradient tracking-tighter">EVAULT_SYS</h1>
                            <p className="text-[10px] font-mono uppercase tracking-[0.3em] mb-12 text-center text-[#00f3ff]">[ STATUS: SECURE_ARCHIVE ]</p>
                            <form onSubmit={handleLogin} className="space-y-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-mono uppercase opacity-50">Identity_ID</label>
                                    <input name="username" type="text" className="w-full bg-transparent border-b border-[#1a1a1a] py-3 font-mono text-lg focus:outline-none focus:border-[#00f3ff]" required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-mono uppercase opacity-50">Access_Key</label>
                                    <input name="password" type="password" className="w-full bg-transparent border-b border-[#1a1a1a] py-3 font-mono text-lg focus:outline-none focus:border-[#00f3ff]" required />
                                </div>
                                <button type="submit" className="w-full cyber-btn cyber-btn-primary mt-4">INITIALIZE_ACCESS</button>
                            </form>
                        </motion.div>
                    </div>
                );
            }

            return (
                <div className="min-h-screen p-6">
                    <div className="scanline"></div>
                    <header className="max-w-7xl mx-auto flex justify-between items-center mb-12">
                        <h1 className="text-3xl font-bold cyber-text-gradient tracking-tighter cursor-pointer" onClick={() => {setActiveCategory(null); setIsAdminView(false);}}>EVAULT.SYS</h1>
                        <div className="flex items-center gap-6">
                            {user.role === 'admin' && (
                                <button onClick={() => setIsAdminView(!isAdminView)} className="text-[10px] font-mono uppercase border border-[#1a1a1a] px-4 py-1 rounded hover:border-[#00f3ff]">
                                    {isAdminView ? 'EXIT_ROOT' : 'ROOT_ACCESS'}
                                </button>
                            )}
                            <button onClick={() => setIsLoggedIn(false)} className="text-[#ff003c] font-mono text-xs">LOGOUT</button>
                        </div>
                    </header>

                    <main className="max-w-7xl mx-auto">
                        {isAdminView ? (
                            <div className="space-y-12">
                                <h2 className="text-4xl font-bold cyber-text-gradient">ADMIN_DASHBOARD</h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="p-8 cyber-tile">
                                        <p className="text-[10px] font-mono opacity-50">TOTAL_USERS</p>
                                        <p className="text-4xl font-bold">{users.length}</p>
                                    </div>
                                    <div className="p-8 cyber-tile">
                                        <p className="text-[10px] font-mono opacity-50">TOTAL_FILES</p>
                                        <p className="text-4xl font-bold">{files.length}</p>
                                    </div>
                                    <div className="p-8 cyber-tile">
                                        <p className="text-[10px] font-mono opacity-50">SYSTEM_STATUS</p>
                                        <p className="text-4xl font-bold text-[#39ff14]">ONLINE</p>
                                    </div>
                                </div>
                                {/* Admin Tabs and Tables would go here similarly to the React version */}
                                <div className="p-12 cyber-tile text-center opacity-50 font-mono">
                                    [ ADMIN_INTERFACE_ACTIVE ]
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {['identity', 'career', 'certificates', 'other'].map(cat => (
                                    <div key={cat} className="p-12 cyber-tile cursor-pointer group" onClick={() => setActiveCategory(cat)}>
                                        <h3 className="text-2xl font-bold mb-2 uppercase">{cat}</h3>
                                        <p className="text-[10px] font-mono text-[#00f3ff]">ACCESS_SECTOR</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </main>
                </div>
            );
        }

        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(<App />);
    </script>
</body>
</html>
