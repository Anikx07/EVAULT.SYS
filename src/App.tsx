/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  LogOut, 
  Download, 
  Trash2, 
  Shield, 
  Briefcase, 
  GraduationCap, 
  Folder,
  X,
  Plus,
  ArrowLeft,
  FileText,
  Eye,
  Sun,
  Moon,
  Users,
  Settings,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Database,
  UserPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend 
} from 'recharts';

// --- Types ---
type Category = 'identity' | 'career' | 'certificates' | 'other';
type Role = 'user' | 'admin';
type AdminTab = 'users' | 'files' | 'insights';

interface VaultFile {
  id: string;
  name: string;
  category: Category;
  size: string;
  date: string;
  type: string;
  owner?: string;
}

interface User {
  id: string;
  username: string;
  role: Role;
  joined: string;
  fileCount: number;
}

// --- Mock Data ---
const INITIAL_FILES: VaultFile[] = [
  { id: '1', name: 'Passport_Scan.pdf', category: 'identity', size: '1.2 MB', date: '2024-03-15', type: 'application/pdf', owner: 'admin' },
  { id: '2', name: 'Resume_2024.docx', category: 'career', size: '450 KB', date: '2024-03-20', type: 'application/msword', owner: 'admin' },
  { id: '3', name: 'Degree_Certificate.jpg', category: 'certificates', size: '2.8 MB', date: '2024-02-10', type: 'image/jpeg', owner: 'user1' },
  { id: '4', name: 'Apartment_Lease.pdf', category: 'other', size: '3.5 MB', date: '2024-01-05', type: 'application/pdf', owner: 'user1' },
];

const INITIAL_USERS: User[] = [
  { id: '1', username: 'admin', role: 'admin', joined: '2024-01-01', fileCount: 2 },
  { id: '2', username: 'user1', role: 'user', joined: '2024-02-15', fileCount: 2 },
];

const CATEGORIES: Record<Category, { name: string; icon: React.ReactNode; desc: string }> = {
  identity: { name: 'Identity', icon: <Shield className="w-12 h-12" />, desc: 'Passport, NID, Photo' },
  career: { name: 'Career', icon: <Briefcase className="w-12 h-12" />, desc: 'CV, Work Files' },
  certificates: { name: 'Certificates', icon: <GraduationCap className="w-12 h-12" />, desc: 'Certificates, Apostille' },
  other: { name: 'Other Documents', icon: <Folder className="w-12 h-12" />, desc: 'Misc Files' },
};

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<Role>('user');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [files, setFiles] = useState<VaultFile[]>(INITIAL_FILES);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<VaultFile | null>(null);
  const [isAdminView, setIsAdminView] = useState(false);
  const [adminTab, setAdminTab] = useState<AdminTab>('insights');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // New User Form State
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<Role>('user');

  // --- Theme Sync ---
  useEffect(() => {
    document.documentElement.className = theme;
  }, [theme]);

  // --- Login Logic ---
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const username = formData.get('username') as string;
    if (username === 'admin') {
      setUserRole('admin');
    } else {
      setUserRole('user');
    }
    setIsLoggedIn(true);
  };

  // --- User Creation Logic ---
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername || !newPassword) return;

    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      username: newUsername,
      role: newRole,
      joined: new Date().toISOString().split('T')[0],
      fileCount: 0
    };

    setUsers(prev => [...prev, newUser]);
    setNewUsername('');
    setNewPassword('');
    setNewRole('user');
    alert(`User ${newUsername} created successfully.`);
  };

  // --- File Logic ---
  const filteredFiles = useMemo(() => {
    if (!activeCategory) return [];
    return files.filter(file => {
      const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = file.category === activeCategory;
      const matchesOwner = userRole === 'admin' || file.owner === 'admin';
      return matchesSearch && matchesCategory && matchesOwner;
    });
  }, [files, searchQuery, activeCategory, userRole]);

  const handleDelete = (id: string) => {
    if (window.confirm('Confirm asset deletion?')) {
      setFiles(prev => prev.filter(f => f.id !== id));
    }
  };

  const handlePreview = (file: VaultFile) => {
    setPreviewFile(file);
    setIsPreviewOpen(true);
  };

  // --- Stats Calculation ---
  const stats = useMemo(() => {
    const totalFiles = files.length;
    const totalUsers = users.length;
    const totalSize = files.reduce((acc, f) => {
      const sizeVal = parseFloat(f.size.split(' ')[0]);
      return acc + sizeVal;
    }, 0).toFixed(1);
    
    const categoryData = (Object.keys(CATEGORIES) as Category[]).map(cat => ({
      name: CATEGORIES[cat].name,
      value: files.filter(f => f.category === cat).length
    }));

    const userData = users.map(u => ({
      name: u.username,
      files: u.fileCount
    }));

    return { totalFiles, totalUsers, totalSize, categoryData, userData };
  }, [files, users]);

  const COLORS = ['#00f3ff', '#ff00ff', '#39ff14', '#ff003c'];

  if (!isLoggedIn) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-500 ${theme === 'dark' ? 'bg-vault-bg-dark' : 'bg-vault-bg-light'}`}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,var(--color-vault-accent-dark)_0%,transparent_50%)]" />
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`w-full max-w-md p-8 md:p-12 border relative overflow-hidden cyber-tile ${theme === 'dark' ? 'cyber-glass-dark' : 'cyber-glass-light'}`}
        >
          <div className="relative z-10">
            <motion.h1 
              initial={{ x: -20 }}
              animate={{ x: 0 }}
              className="text-5xl md:text-6xl font-bold mb-2 text-center cyber-text-gradient tracking-tighter"
            >
              EVAULT_SYS
            </motion.h1>
            <p className={`text-[10px] font-mono uppercase tracking-[0.3em] mb-12 text-center ${theme === 'dark' ? 'text-vault-accent-dark' : 'text-vault-accent-light'}`}>
              [ STATUS: SECURE_ARCHIVE ]
            </p>
            
            <form onSubmit={handleLogin} className="space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase tracking-widest opacity-50">Identity_ID</label>
                <input 
                  name="username"
                  type="text" 
                  defaultValue="admin"
                  className={`w-full bg-transparent border-b border-vault-border-dark py-3 font-mono text-lg focus:outline-none focus:border-vault-accent-dark transition-all ${theme === 'dark' ? 'text-white' : 'text-black'}`}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase tracking-widest opacity-50">Access_Key</label>
                <input 
                  type="password" 
                  defaultValue="vault2025"
                  className={`w-full bg-transparent border-b border-vault-border-dark py-3 font-mono text-lg focus:outline-none focus:border-vault-accent-dark transition-all ${theme === 'dark' ? 'text-white' : 'text-black'}`}
                  required
                />
              </div>
              <button 
                type="submit" 
                className="w-full cyber-btn cyber-btn-primary mt-4"
              >
                INITIALIZE_ACCESS
              </button>
            </form>

            <div className="mt-10 flex justify-center">
              <button 
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="text-[9px] font-mono uppercase tracking-widest hover:text-vault-accent-dark transition-colors"
              >
                TOGGLE_ENV: {theme === 'dark' ? 'LIGHT' : 'DARK'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 font-sans relative overflow-hidden ${theme === 'dark' ? 'bg-vault-bg-dark text-vault-text-dark' : 'bg-vault-bg-light text-vault-text-light'}`}>
      {/* Scanline Effect */}
      <div className="scanline pointer-events-none" />
      
      {/* Header */}
      <header className={`py-6 border-b sticky top-0 z-40 ${theme === 'dark' ? 'border-vault-border-dark bg-vault-bg-dark/95 backdrop-blur-md' : 'border-vault-border-light bg-vault-bg-light/95 backdrop-blur-md'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <motion.h1 
            onClick={() => { setActiveCategory(null); setIsAdminView(false); }}
            className="text-3xl font-bold cursor-pointer cyber-text-gradient tracking-tighter"
          >
            EVAULT.SYS
          </motion.h1>
          
          <div className="flex items-center gap-4 md:gap-8">
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={`p-2 rounded border transition-all ${theme === 'dark' ? 'border-vault-border-dark hover:border-vault-accent-dark' : 'border-vault-border-light hover:border-vault-accent-light'}`}
            >
              {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            {userRole === 'admin' && (
              <button 
                onClick={() => setIsAdminView(!isAdminView)}
                className={`text-[10px] font-mono uppercase tracking-widest px-3 py-1 border rounded transition-all ${isAdminView ? 'bg-vault-accent-dark text-black border-vault-accent-dark' : 'border-vault-border-dark hover:border-vault-accent-dark'}`}
              >
                {isAdminView ? 'EXIT_ROOT' : 'ROOT_ACCESS'}
              </button>
            )}

            <div className="flex items-center gap-4">
              <div className={`w-8 h-8 rounded flex items-center justify-center text-[10px] font-bold border ${theme === 'dark' ? 'bg-vault-accent-dark/10 border-vault-accent-dark text-vault-accent-dark' : 'bg-vault-accent-light/10 border-vault-accent-light text-vault-accent-light'}`}>
                {userRole === 'admin' ? 'A' : 'U'}
              </div>
              <button 
                onClick={() => setIsLoggedIn(false)}
                className="text-vault-danger hover:opacity-80 transition-all"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {isAdminView ? (
            /* Admin Dashboard View */
            <motion.div 
              key="admin"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              {/* Stats Overview */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className={`p-6 border cyber-tile ${theme === 'dark' ? 'cyber-glass-dark' : 'cyber-glass-light'}`}>
                  <div className="flex items-center gap-4 mb-2">
                    <Users className="w-5 h-5 text-vault-accent-dark" />
                    <span className="text-[10px] font-mono uppercase opacity-50">Total_Identities</span>
                  </div>
                  <div className="text-3xl font-bold font-mono">{stats.totalUsers}</div>
                </div>
                <div className={`p-6 border cyber-tile-secondary ${theme === 'dark' ? 'cyber-glass-dark' : 'cyber-glass-light'}`}>
                  <div className="flex items-center gap-4 mb-2">
                    <Database className="w-5 h-5 text-vault-secondary-dark" />
                    <span className="text-[10px] font-mono uppercase opacity-50">Global_Assets</span>
                  </div>
                  <div className="text-3xl font-bold font-mono">{stats.totalFiles}</div>
                </div>
                <div className={`p-6 border cyber-tile-neon ${theme === 'dark' ? 'cyber-glass-dark' : 'cyber-glass-light'}`}>
                  <div className="flex items-center gap-4 mb-2">
                    <Activity className="w-5 h-5 text-vault-neon-green" />
                    <span className="text-[10px] font-mono uppercase opacity-50">Storage_Magnitude</span>
                  </div>
                  <div className="text-3xl font-bold font-mono">{stats.totalSize} MB</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 border-b border-vault-border-dark pb-4">
                <button 
                  onClick={() => { setAdminTab('insights'); setSelectedUser(null); }}
                  className={`text-[11px] font-mono uppercase tracking-widest px-4 py-2 transition-all ${adminTab === 'insights' ? 'text-vault-accent-dark border-b-2 border-vault-accent-dark' : 'text-vault-text-muted-dark hover:text-vault-accent-dark'}`}
                >
                  SYSTEM_INSIGHTS
                </button>
                <button 
                  onClick={() => { setAdminTab('users'); setSelectedUser(null); }}
                  className={`text-[11px] font-mono uppercase tracking-widest px-4 py-2 transition-all ${adminTab === 'users' ? 'text-vault-accent-dark border-b-2 border-vault-accent-dark' : 'text-vault-text-muted-dark hover:text-vault-accent-dark'}`}
                >
                  USER_REGISTRY
                </button>
                <button 
                  onClick={() => { setAdminTab('files'); setSelectedUser(null); }}
                  className={`text-[11px] font-mono uppercase tracking-widest px-4 py-2 transition-all ${adminTab === 'files' ? 'text-vault-accent-dark border-b-2 border-vault-accent-dark' : 'text-vault-text-muted-dark hover:text-vault-accent-dark'}`}
                >
                  GLOBAL_ASSETS
                </button>
              </div>

              {adminTab === 'insights' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className={`p-8 border cyber-tile ${theme === 'dark' ? 'cyber-glass-dark' : 'cyber-glass-light'}`}>
                    <h3 className="text-lg font-bold mb-6 font-mono flex items-center gap-2">
                      <PieChartIcon className="w-4 h-4 text-vault-accent-dark" /> ASSET_DISTRIBUTION
                    </h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={stats.categoryData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {stats.categoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#000', border: '1px solid #1a1a1a', borderRadius: '4px', fontSize: '12px' }}
                            itemStyle={{ color: '#fff' }}
                          />
                          <Legend verticalAlign="bottom" height={36} iconType="circle" />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className={`p-8 border cyber-tile ${theme === 'dark' ? 'cyber-glass-dark' : 'cyber-glass-light'}`}>
                    <h3 className="text-lg font-bold mb-6 font-mono flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-vault-secondary-dark" /> USER_ACTIVITY
                    </h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.userData}>
                          <XAxis dataKey="name" stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                          <YAxis stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                          <Tooltip 
                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                            contentStyle={{ backgroundColor: '#000', border: '1px solid #1a1a1a', borderRadius: '4px', fontSize: '12px' }}
                            itemStyle={{ color: '#fff' }}
                          />
                          <Bar dataKey="files" fill="#ff00ff" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}

              {adminTab === 'users' && !selectedUser && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Create User Form */}
                  <div className={`p-8 border cyber-tile ${theme === 'dark' ? 'cyber-glass-dark' : 'cyber-glass-light'}`}>
                    <h3 className="text-xl font-bold mb-8 cyber-text-gradient flex items-center gap-2">
                      <UserPlus className="w-5 h-5" /> NEW_IDENTITY_INIT
                    </h3>
                    <form onSubmit={handleCreateUser} className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-mono uppercase opacity-50">Username</label>
                        <input 
                          type="text" 
                          value={newUsername}
                          onChange={(e) => setNewUsername(e.target.value)}
                          className="w-full bg-transparent border-b border-vault-border-dark py-2 font-mono focus:outline-none focus:border-vault-accent-dark"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-mono uppercase opacity-50">Access_Key</label>
                        <input 
                          type="password" 
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full bg-transparent border-b border-vault-border-dark py-2 font-mono focus:outline-none focus:border-vault-accent-dark"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-mono uppercase opacity-50">Privilege_Level</label>
                        <select 
                          value={newRole}
                          onChange={(e) => setNewRole(e.target.value as Role)}
                          className="w-full bg-transparent border-b border-vault-border-dark py-2 font-mono focus:outline-none focus:border-vault-accent-dark"
                        >
                          <option value="user" className="bg-black text-white">USER</option>
                          <option value="admin" className="bg-black text-white">ADMIN</option>
                        </select>
                      </div>
                      <button type="submit" className="w-full cyber-btn cyber-btn-primary text-sm">
                        COMMIT_USER
                      </button>
                    </form>
                  </div>

                  {/* User List */}
                  <div className="lg:col-span-2 overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="text-[10px] font-mono uppercase tracking-widest border-b border-vault-border-dark opacity-50">
                          <th className="px-6 py-4">Identity</th>
                          <th className="px-6 py-4">Privilege</th>
                          <th className="px-6 py-4">Assets</th>
                          <th className="px-6 py-4 text-right">Control</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-vault-border-dark">
                        {users.map(user => (
                          <tr key={user.id} className="hover:bg-vault-accent-dark/5 transition-all group cursor-pointer" onClick={() => setSelectedUser(user)}>
                            <td className="px-6 py-4 font-mono group-hover:text-vault-accent-dark transition-colors">{user.username}</td>
                            <td className="px-6 py-4">
                              <span className={`text-[9px] font-mono px-2 py-0.5 border rounded ${user.role === 'admin' ? 'border-vault-secondary-dark text-vault-secondary-dark' : 'border-vault-accent-dark text-vault-accent-dark'}`}>
                                {user.role.toUpperCase()}
                              </span>
                            </td>
                            <td className="px-6 py-4 font-mono text-sm">{user.fileCount}</td>
                            <td className="px-6 py-4 text-right">
                              <button 
                                onClick={(e) => { e.stopPropagation(); /* Handle revoke */ }}
                                className="text-vault-danger hover:underline font-mono text-[10px]"
                              >
                                REVOKE
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {selectedUser && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <button 
                      onClick={() => setSelectedUser(null)}
                      className="text-[10px] font-mono uppercase tracking-widest flex items-center gap-2 hover:text-vault-accent-dark transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" /> BACK_TO_REGISTRY
                    </button>
                    <h3 className="text-xl font-bold font-mono">USER_ASSETS: <span className="text-vault-accent-dark">{selectedUser.username.toUpperCase()}</span></h3>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="text-[10px] font-mono uppercase tracking-widest border-b border-vault-border-dark opacity-50">
                          <th className="px-6 py-4">Asset_Name</th>
                          <th className="px-6 py-4">Class</th>
                          <th className="px-6 py-4">Magnitude</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-vault-border-dark">
                        {files.filter(f => f.owner === selectedUser.username).map(file => (
                          <tr key={file.id} className="hover:bg-vault-accent-dark/5 transition-all">
                            <td className="px-6 py-4 font-mono">{file.name}</td>
                            <td className="px-6 py-4 text-[10px] font-mono uppercase opacity-60">{file.category}</td>
                            <td className="px-6 py-4 font-mono text-sm opacity-60">{file.size}</td>
                            <td className="px-6 py-4 text-right space-x-4">
                              <button onClick={() => handlePreview(file)} className="text-vault-neon-green hover:underline font-mono text-[10px]">INSPECT</button>
                              <button className="text-vault-danger hover:underline font-mono text-[10px]">PURGE</button>
                            </td>
                          </tr>
                        ))}
                        {files.filter(f => f.owner === selectedUser.username).length === 0 && (
                          <tr>
                            <td colSpan={4} className="px-6 py-12 text-center font-mono opacity-30">NO_ASSETS_FOUND_FOR_THIS_IDENTITY</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {adminTab === 'files' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-[10px] font-mono uppercase tracking-widest border-b border-vault-border-dark opacity-50">
                        <th className="px-6 py-4">Owner</th>
                        <th className="px-6 py-4">Asset_Name</th>
                        <th className="px-6 py-4">Class</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-vault-border-dark">
                      {files.map(file => (
                        <tr key={file.id} className="hover:bg-vault-accent-dark/5 transition-all">
                          <td className="px-6 py-4 font-mono text-vault-accent-dark">{file.owner}</td>
                          <td className="px-6 py-4 font-mono">{file.name}</td>
                          <td className="px-6 py-4 text-[10px] font-mono uppercase opacity-60">{file.category}</td>
                          <td className="px-6 py-4 text-right space-x-4">
                            <button onClick={() => handlePreview(file)} className="text-vault-neon-green hover:underline font-mono text-[10px]">INSPECT</button>
                            <button className="text-vault-danger hover:underline font-mono text-[10px]">PURGE</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          ) : !activeCategory ? (
            /* Dashboard View - Clean UI Tiles */
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {(Object.entries(CATEGORIES) as [Category, typeof CATEGORIES['identity']][]).map(([key, cat]) => (
                <motion.div
                  key={key}
                  whileHover={{ y: -8 }}
                  onClick={() => setActiveCategory(key)}
                  className={`p-8 cursor-pointer cyber-tile relative group overflow-hidden ${theme === 'dark' ? 'cyber-glass-dark' : 'cyber-glass-light'}`}
                >
                  <div className="text-vault-accent-dark mb-6 group-hover:text-vault-secondary-dark transition-colors">
                    {cat.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-2 tracking-tight">{cat.name}</h3>
                  <p className="text-xs opacity-50 mb-8 font-mono">{cat.desc}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono text-vault-accent-dark">
                      {files.filter(f => f.category === key && (userRole === 'admin' || f.owner === 'admin')).length} ASSETS
                    </span>
                    <Plus className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            /* File List View */
            <motion.div 
              key="filelist"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div className="space-y-2">
                  <button 
                    onClick={() => setActiveCategory(null)}
                    className="text-[10px] font-mono uppercase tracking-widest flex items-center gap-2 hover:text-vault-accent-dark transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" /> RETURN_TO_ROOT
                  </button>
                  <h2 className="text-5xl font-bold cyber-text-gradient">{CATEGORIES[activeCategory].name}</h2>
                </div>
                <button 
                  onClick={() => setIsUploadModalOpen(true)}
                  className="cyber-btn cyber-btn-primary text-xs"
                >
                  INGEST_NEW_ASSET
                </button>
              </div>

              <div className={`cyber-tile overflow-hidden ${theme === 'dark' ? 'cyber-glass-dark' : 'cyber-glass-light'}`}>
                <div className="p-6 border-b border-vault-border-dark">
                  <div className="relative">
                    <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30" />
                    <input 
                      type="text" 
                      placeholder="SCANNING_FOR_ASSETS..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-transparent border-b border-vault-border-dark/30 pl-8 py-2 font-mono focus:outline-none focus:border-vault-accent-dark transition-all"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-[10px] font-mono uppercase tracking-widest border-b border-vault-border-dark opacity-50">
                        <th className="px-6 py-4">Asset_Name</th>
                        <th className="px-6 py-4">Magnitude</th>
                        <th className="px-6 py-4 text-right">Operations</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-vault-border-dark">
                      {filteredFiles.length > 0 ? (
                        filteredFiles.map((file) => (
                          <tr key={file.id} className="hover:bg-vault-accent-dark/5 transition-all group">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-4">
                                <FileText className="w-4 h-4 text-vault-accent-dark opacity-40 group-hover:opacity-100" />
                                <span className="font-mono">{file.name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 font-mono text-sm opacity-60">{file.size}</td>
                            <td className="px-6 py-4 text-right space-x-6">
                              <button onClick={() => handlePreview(file)} className="text-vault-neon-green hover:underline font-mono text-[10px]">INSPECT</button>
                              <button className="text-vault-accent-dark hover:underline font-mono text-[10px]">FETCH</button>
                              <button 
                                onClick={() => handleDelete(file.id)}
                                className="text-vault-danger hover:underline font-mono text-[10px]"
                              >
                                PURGE
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="px-6 py-20 text-center font-mono opacity-30">
                            NO_ASSETS_DETECTED_IN_THIS_SECTOR
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Upload Modal */}
      <AnimatePresence>
        {isUploadModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsUploadModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`relative w-full max-w-lg p-8 border cyber-tile ${theme === 'dark' ? 'cyber-glass-dark' : 'cyber-glass-light'}`}
            >
              <h2 className="text-3xl font-bold mb-8 cyber-text-gradient">ASSET_INGESTION</h2>
              
              <div className="space-y-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase opacity-50">Target_File</label>
                  <input 
                    type="file" 
                    className="w-full bg-transparent border-b border-vault-border-dark py-2 font-mono text-sm focus:outline-none focus:border-vault-accent-dark"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase opacity-50">Classification</label>
                  <select 
                    className="w-full bg-transparent border-b border-vault-border-dark py-2 font-mono text-sm focus:outline-none focus:border-vault-accent-dark"
                    defaultValue={activeCategory || 'other'}
                  >
                    <option value="identity" className="bg-black text-white">IDENTITY</option>
                    <option value="career" className="bg-black text-white">CAREER</option>
                    <option value="certificates" className="bg-black text-white">CERTIFICATES</option>
                    <option value="other" className="bg-black text-white">OTHER</option>
                  </select>
                </div>
                
                <div className="flex justify-end gap-4 pt-4">
                  <button 
                    onClick={() => setIsUploadModalOpen(false)}
                    className="px-6 py-2 text-[10px] font-mono uppercase hover:text-vault-danger transition-colors"
                  >
                    ABORT
                  </button>
                  <button 
                    onClick={() => setIsUploadModalOpen(false)}
                    className="cyber-btn cyber-btn-primary text-[10px]"
                  >
                    CONFIRM_INGEST
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {isPreviewOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPreviewOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`relative w-full max-w-5xl border p-4 cyber-tile ${theme === 'dark' ? 'cyber-glass-dark' : 'cyber-glass-light'}`}
            >
              <div className="flex justify-between items-center mb-4 px-4">
                <h2 className="text-xl font-bold font-mono text-vault-accent-dark">{previewFile?.name}</h2>
                <button onClick={() => setIsPreviewOpen(false)} className="text-vault-danger hover:opacity-80">
                  <X className="w-8 h-8" />
                </button>
              </div>
              <div className="bg-black/80 aspect-video flex items-center justify-center overflow-hidden border border-vault-border-dark">
                {previewFile?.type.startsWith('image/') ? (
                  <img src={`https://picsum.photos/seed/${previewFile.id}/1600/900`} alt="Preview" className="max-w-full max-h-full object-contain" />
                ) : (
                  <div className="text-center space-y-6 p-12">
                    <div className="relative inline-block">
                      <FileText className="w-24 h-24 text-vault-accent-dark/20 mx-auto" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Eye className="w-8 h-8 text-vault-accent-dark" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] font-mono uppercase opacity-50">ASSET_INSPECTION</p>
                      <p className="text-sm font-mono">FORMAT: {previewFile?.type}</p>
                    </div>
                    <button className="cyber-btn cyber-btn-secondary text-[10px]">
                      DOWNLOAD_FULL_ASSET
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
