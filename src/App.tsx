import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Library from './pages/Library';
import Insights from './pages/Insights';
import AddBook from './pages/AddBook';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';

import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import Settings from './pages/Settings';

function App() {
    return (
        <SettingsProvider>
            <AuthProvider>
                <Routes>
                    <Route path="/signin" element={<SignIn />} />
                    <Route path="/signup" element={<SignUp />} />
                    <Route path="/" element={<Layout />}>
                        <Route index element={<Dashboard />} />
                        <Route path="library" element={<Library />} />
                        <Route path="add" element={<AddBook />} />
                        <Route path="edit/:id" element={<AddBook />} />
                        <Route path="insights" element={<Insights />} />
                        <Route path="settings" element={<Settings />} />
                    </Route>
                </Routes>
            </AuthProvider>
        </SettingsProvider>
    );
}

export default App;
