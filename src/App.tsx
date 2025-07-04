
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Teams from './pages/Teams';
import TeamList from './pages/TeamList';
import CreateTeam from './pages/CreateTeam';
import TeamChat from './pages/TeamChat';
import Login from './pages/Login';
import PrivateRoute from './components/PrivateRoute';
import JoinTeamPage from './pages/JoinTeamPage';
import HackathonList from './pages/HackathonList';
import LeaderboardComponent from './pages/Leaderboard';
// import Header from './components/Header';
import PublishHackathon from './components/PublishHackathon';
// import Navigation from './components/Navigation';
import Navbar from './components/Navbar';
import AIAssistant from './components/Aiassistant';
import PostFeed from './pages/PostFeed';
import OthersProfile from './pages/OthersProfile';
import Dashboard from './pages/Dashboard';
import ResumeAnalyzer from './pages/ResumeAnalyzer';
function App() {
  return (

    <AuthProvider>
      <Router>

        <Navbar />
        {/*         
         <Header /> */}

        {/* <Navigation /> */}

        <main className="min-h-screen bg-secondarygray relative">
          <>
            <Routes>
              <Route path="/login" element={
                <Login />
              } />
              <Route path="/" element={<Home />} />
              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                }
              />
              <Route
                path="/profile/:erpId"
                element={
                  <PrivateRoute>
                    <OthersProfile />
                  </PrivateRoute>
                }
              />

              <Route
                path="/teams"
                element={
                  <PrivateRoute>
                    <Teams />
                  </PrivateRoute>
                }
              />
              <Route
                path="/hackathons"
                element={
                  <HackathonList />
                }
              />
              <Route
                path="/Leaderboard"
                element={
                  <LeaderboardComponent />
                }
              />

              <Route
                path="/publish-hackathon"
                element={
                  <PrivateRoute>
                    <PublishHackathon />
                  </PrivateRoute>
                }
              />
              <Route
                path="/Dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/ResumeAnalyzer"
                element={
                  <PrivateRoute>
                    <ResumeAnalyzer />
                  </PrivateRoute>
                }
              />
              <Route
                path="/team-chat"
                element={
                  <PrivateRoute>
                    <TeamList />
                  </PrivateRoute>
                }
              />
              <Route
                path="/explore"
                element={
                  <PrivateRoute>
                    <PostFeed />
                  </PrivateRoute>
                }
              />
              <Route
                path="/create-team"
                element={
                  <PrivateRoute>
                    <CreateTeam />
                  </PrivateRoute>
                }
              />
              <Route
                path="/team/:teamId"
                element={
                  <PrivateRoute>
                    <TeamChat />
                  </PrivateRoute>
                }
              />
              {/* Add JoinTeamPage route inside Routes */}
              <Route
                path="/join-team/:inviteId"
                element={
                  <PrivateRoute>
                    <JoinTeamPage />
                  </PrivateRoute>
                }
              />
            </Routes>
          </>
        </main>
        <Toaster position="top-right" />


      </Router>
      <AIAssistant />
    </AuthProvider>
  );
}
export default App;