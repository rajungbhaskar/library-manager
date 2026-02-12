import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Library from './pages/Library';
import Insights from './pages/Insights';
import AddBook from './pages/AddBook';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Landing from './pages/Landing';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { LibraryProvider } from './context/LibraryContext';
import Settings from './pages/Settings';

function App() {
    return (
        <SettingsProvider>
            <AuthProvider>
                <LibraryProvider>
                    <Routes>
                        <Route path="/" element={<Landing />} />
                        <Route path="/signin" element={<SignIn />} />
                        <Route path="/signup" element={<SignUp />} />
                        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                            <Route path="dashboard" element={<Dashboard />} />
                            <Route path="library" element={<Library />} />
                            <Route path="add" element={<AddBook />} />
                            <Route path="edit/:id" element={<AddBook />} />
                            <Route path="insights" element={<Insights />} />
                            <Route path="settings" element={<Settings />} />
                        </Route>
                    </Routes>
                </LibraryProvider>
            </AuthProvider>
        </SettingsProvider>
    );
}

export default App;
