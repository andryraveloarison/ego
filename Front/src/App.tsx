// App.tsx
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import VideoUpload from './pages/VideoUpload';
import Layout from './components/Layout';
import Live from './pages/Live';

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/upload" element={<VideoUpload />} />
          <Route path="/live" element={<Live />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
