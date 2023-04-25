import './App.css';
import Home from './routes/home';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/navbar';
import About from './routes/about';
import NoMatch from './routes/nomatch';
import Register from './routes/register';
import Login from './routes/login';
import Profile from './routes/profile';
import Needs from './routes/needs';
import UpdateProfile from './routes/updateProfile';
import ForgotPwd from './routes/forgotPwd';
import ResetPwd from './routes/resetPwd';
import SuccessPage from './routes/successPage';
import Verification from './routes/verification';
import AllUsers from './routes/allUsers';
import AddBlog from './routes/addBlog';
import Search from './routes/search';
import Alerts from './routes/alerts';
import BlogPost from './routes/blogPost';
import Blog from './routes/blog';
import Logout from './routes/logout';
import AdminPage from './routes/adminPage';
import Dashboard from './routes/dashboard';
import Files from './routes/files';
import MessagePage from './components/messagePage';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/register' element={<Register />} />
        <Route path='/register_success' element={<SuccessPage />} />
        <Route path='/login' element={<Login />} />
        <Route path='/logout' element={<Logout />} />
        <Route path='/profile' element={<Profile />} />
        <Route path='/profile/:id' element={<Profile />} />
        <Route path='/update_profile' element={<UpdateProfile />} />
        <Route path='/blog' element={<Blog />} />
        <Route path='/blog/:id' element={<Blog />} />
        <Route path='/blog/:userid/:blogid' element={<BlogPost />} />
        <Route path='/add_blog' element={<AddBlog />} />
        <Route path='/needs' element={<Needs />} />
        <Route path='/about' element={<About />} />
        <Route path='/forgot_password' element={<ForgotPwd />} />
        <Route path='/reset_password' element={<ResetPwd />} />
        <Route path='/success' element={<SuccessPage />} />
        <Route path='/verify' element={<Verification />} />
        <Route path='/all_users' element={<AllUsers />} />
        <Route path='/search' element={<Search />} />
        <Route path='/alerts' element={<Alerts />} />
        <Route path='/admin' element={<AdminPage />} />
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='/messages' element={<MessagePage />} />
        <Route path='/files/:userid' element={<Files />} />
        <Route path='*' element={<NoMatch />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
