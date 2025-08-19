import React, { useState, useMemo, useEffect, createContext, useContext } from 'react';
import { Tractor, Wheat, UserPlus, ListChecks, Handshake, Leaf, Menu, X, ArrowLeft, Search, PlusCircle, LogOut } from 'lucide-react';
import './App.css';
// Assuming you have a CSS file for global styles
// import './App.css'; 

// #region -------- AUTHENTICATION & API --------

// Create an Authentication Context (if not already defined globally)
const AuthContext = createContext(null);

// API Service for backend communication (if not already defined globally)
const API_URL = 'http://localhost:8080/api';

const api = {
    login: (credentials) => {
        return fetch(`${API_URL}/auth/signin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
        }).then(async res => {
            if (!res.ok) {
                const errorData = await res.json();
                return Promise.reject(errorData);
            }
            return res.json(); // This should now return the JWT and user data
        });
    },
    signup: (userData) => {
        return fetch(`${API_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
        }).then(async res => {
            if (!res.ok) {
                const errorData = await res.json();
                return Promise.reject(errorData);
            }
            return res.json();
        });
    },
    // New function to fetch current user based on token
    getCurrentUser: (token) => {
      return fetch(`${API_URL}/api/auth/user`, { // Ensure this endpoint exists and returns user info
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(res => {
          if (!res.ok) {
              return Promise.reject('Failed to fetch user data');
          }
          return res.json();
      });
    },
    getCrops: () => {
        return fetch(`${API_URL}/crops`).then(res => res.json());
    },
    listCrop: (formData, token) => { // Accept token as argument
        return fetch(`${API_URL}/crops`, {
            method: 'POST',
            body: formData,
            headers: {
                'Authorization': `Bearer ${token}` // Add JWT to header
            }
        }).then(async res => {
            if (!res.ok) {
                let errorInfo = `HTTP error! status: ${res.status}`;
                try {
                    const errorData = await res.json();
                    errorInfo = errorData.message || JSON.stringify(errorData);
                } catch (e) {
                    errorInfo = res.statusText;
                }
                return Promise.reject(errorInfo);
            }
            return res.json();
        });
    },
};

// #endregion

// #region -------- PAGE COMPONENTS --------
const SellCropsPage = ({ onNavigate }) => {
    const { currentUser } = useContext(AuthContext);
    const [view, setView] = useState('list');
    const [crops, setCrops] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    useEffect(() => {
        api.getCrops()
            .then(data => {
                setCrops(data);
                setIsLoading(false);
            })
            .catch(error => {
                console.error("Failed to fetch crops:", error);
                setIsLoading(false);
            });
    }, []);

    const handleListCrop = async (event) => {
        event.preventDefault();
        if (!currentUser) {
            console.error("User not logged in.");
            return;
        }

        const formData = new FormData(event.target);
        
        try {
            const savedCrop = await api.listCrop(formData);
            setCrops(prevCrops => [...prevCrops, savedCrop]);
            setView('list');
        } catch (error) {
            console.error("Failed to list crop:", error);
            // You can show a user-friendly message here.
        }
    };

    const filteredCrops = useMemo(() => 
        crops.filter(crop =>
            crop.name.toLowerCase().includes(searchTerm.toLowerCase())
        ), [searchTerm, crops]);

    if (view === 'form') {
        return (
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-fade-in">
                <span onClick={() => setView('list')} className="flex items-center gap-2 text-green-600 hover:text-green-800 mb-8 cursor-pointer" role="button" tabIndex="0">
                    <ArrowLeft size={20} /> Back to Marketplace
                </span>
                <div className="bg-white p-8 rounded-xl shadow-lg text-center">
                    <Wheat size={48} className="mx-auto text-green-600 mb-4" />
                    <h1 className="text-4xl font-bold text-gray-800">List Your Crop for Sale</h1>
                    <p className="mt-4 text-lg text-gray-600">Fill in the details below to add your produce.</p>
                    <div className="mt-8">
                        <form onSubmit={handleListCrop} className="max-w-lg mx-auto text-left space-y-4">
                            <div>
                                <label htmlFor="cropName" className="block text-sm font-medium text-gray-700">Crop Name</label>
                                <input name="name" type="text" id="cropName" required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500" placeholder="e.g., Organic Tomatoes" />
                            </div>
                            <div>
                                <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price per kg ($)</label>
                                <input name="price" type="number" step="0.01" id="price" required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500" placeholder="e.g., 2.50" />
                            </div>
                            <input type="hidden" name="unit" value="kg" />

                            <div>
                                <label htmlFor="image" className="block text-sm font-medium text-gray-700">Crop Photo</label>
                                <input name="image" type="file" id="image" accept="image/*" required className="mt-1 block w-full text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100" />
                            </div>

                            <button type="submit" className="w-full bg-green-600 text-white px-6 py-3 rounded-full text-lg font-semibold hover:bg-green-700 transition-transform hover:scale-105 shadow-lg">
                                List My Crop
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-fade-in">
            <h1 className="text-4xl font-bold text-gray-800 text-center mb-2">Crops Marketplace</h1>
            <p className="text-lg text-gray-600 text-center mb-8">Find the freshest produce directly from local farmers.</p>
            
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-8">
                <div className="relative w-full md:w-1/3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                        type="text"
                        placeholder="Search for crops..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-green-500 focus:outline-none"
                    />
                </div>
                {currentUser && (
                    <button onClick={() => setView('form')} className="w-full md:w-auto flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-2 rounded-full text-lg font-semibold hover:bg-green-700 transition-transform hover:scale-105 shadow-lg">
                        <PlusCircle size={22} />
                        List a Crop
                    </button>
                )}
            </div>

            {isLoading ? (
                <p className="text-center text-gray-500">Loading crops...</p>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredCrops.length > 0 ? filteredCrops.map(crop => (
                        <div key={crop.id} className="border border-gray-200 rounded-lg overflow-hidden group shadow-sm hover:shadow-xl transition-shadow duration-300 bg-white">
                            {/* Update image source to display Base64 image data */}
                            {crop.image && <img src={`data:image/jpeg;base64,${crop.image}`} alt={crop.name} className="w-full h-48 object-cover" />}
                            <div className="p-4">
                                <h3 className="font-bold text-xl text-gray-800">{crop.name}</h3>
                                {/* ADD CONDITIONAL CHECK TO PREVENT CRASH */}
                                <p className="text-gray-500 text-sm">From {crop.farmer ? crop.farmer.name : 'Unknown Farmer'}</p>
                                <div className="flex justify-between items-center mt-4">
                                    <p className="text-green-600 font-bold text-lg">${crop.price} / {crop.unit}</p>
                                    <button className="bg-green-50 text-green-700 py-2 px-4 rounded-md hover:bg-green-100 transition-colors font-semibold">
                                        View
                                    </button>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <p className="col-span-full text-center text-gray-500">No crops found.</p>
                    )}
                </div>
            )}
        </div>
    );
};

// RentEquipmentPage (No auth changes needed for viewing)
const RentEquipmentPage = ({ onNavigate }) => (
  <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-fade-in">
    <span onClick={() => onNavigate('home')} className="flex items-center gap-2 text-green-600 hover:text-green-800 mb-8 cursor-pointer" role="button" tabIndex="0">
      <ArrowLeft size={20} /> Back to Home
    </span>
    <div className="bg-white p-8 rounded-xl shadow-lg text-center">
      <Tractor size={48} className="mx-auto text-green-600 mb-4" />
      <h1 className="text-4xl font-bold text-gray-800">Rent Farming Equipment</h1>
      <p className="mt-4 text-lg text-gray-600">Browse and rent the tools you need for your farm.</p>
       <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[{ name: 'John Deere Tractor', price: '$150/day', image: 'https://images.unsplash.com/photo-1561501900-3701fa6a0864?q=80&w=1770&auto=format&fit=crop' },
            { name: 'Seed Planter', price: '$80/day', image: 'https://images.unsplash.com/photo-1621998563509-408551453239?q=80&w=1932&auto=format&fit=crop' },
            { name: 'Combine Harvester', price: '$400/day', image: 'https://images.unsplash.com/photo-1562799343-53b491451127?q=80&w=1894&auto=format&fit=crop' }
          ].map(item => (
            <div key={item.name} className="border border-gray-200 rounded-lg overflow-hidden group shadow-sm hover:shadow-xl transition-shadow duration-300">
              <img src={item.image} alt={item.name} className="w-full h-48 object-cover" />
              <div className="p-4 text-left">
                <h3 className="font-semibold text-lg text-gray-800">{item.name}</h3>
                <p className="text-green-600 font-bold mt-1">{item.price}</p>
                <button onClick={() => onNavigate('home')} className="mt-4 w-full text-center bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition-colors">
                  Rent Now
                </button>
              </div>
            </div>
          ))}
        </div>
    </div>
  </div>
);

// AboutUsPage (No changes)
const AboutUsPage = ({ onNavigate }) => (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-fade-in">
        <span onClick={() => onNavigate('home')} className="flex items-center gap-2 text-green-600 hover:text-green-800 mb-8 cursor-pointer" role="button" tabIndex="0">
            <ArrowLeft size={20} /> Back to Home
        </span>
        <div className="bg-white p-8 rounded-xl shadow-lg">
            <h1 className="text-4xl font-bold text-gray-800 text-center">About FarmConnect</h1>
            <p className="mt-6 text-lg text-gray-600">
                FarmConnect was born from a simple idea: to bridge the gap between hardworking farmers and the modern marketplace. We believe in empowering agricultural communities by providing a platform that is fair, transparent, and easy to use.
            </p>
            <p className="mt-4 text-lg text-gray-600">
                Our mission is to help farmers get the best value for their produce by connecting them directly with buyers, and to make farming more efficient and cost-effective by facilitating the rental of essential equipment. We are committed to building a sustainable future for agriculture, one connection at a time.
            </p>
        </div>
    </div>
);

// LoginPage with API integration
const LoginPage = ({ onNavigate }) => {
    const { login } = useContext(AuthContext);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const credentials = {
            email: e.target.email.value,
            password: e.target.password.value,
        };
        try {
            const userData = await api.login(credentials);
            login(userData);
            onNavigate('home');
        } catch (err) {
            setError('Failed to log in. Please check your email and password.');
        }
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-fade-in">
             <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg">
                <h2 className="text-3xl font-bold text-center text-gray-800">Log In</h2>
                {error && <p className="mt-4 text-center text-red-500 bg-red-100 p-2 rounded-md">{error}</p>}
                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    <div>
                        <label htmlFor="email" className="sr-only">Email address</label>
                        <input id="email" name="email" type="email" required className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500" placeholder="Email address" />
                    </div>
                    <div>
                        <label htmlFor="password" className="sr-only">Password</label>
                        <input id="password" name="password" type="password" required className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500" placeholder="Password" />
                    </div>
                    <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-green-600 hover:bg-green-700">
                        Sign In
                    </button>
                </form>
                 <p className="mt-6 text-center text-sm text-gray-600">
                    Don't have an account?{' '}
                    <span onClick={() => onNavigate('signup')} className="font-medium text-green-600 hover:text-green-500 cursor-pointer" role="button" tabIndex="0">
                        Sign Up
                    </span>
                </p>
             </div>
        </div>
    );
};

// SignUpPage with API integration
const SignUpPage = ({ onNavigate }) => {
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);

    const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);

    const userData = {
        name: e.target.name.value,
        email: e.target.email.value,
        password: e.target.password.value,
    };

    try {
        await api.signup(userData);
        setMessage('Registration successful! Please log in.');
        setIsError(false);
        setTimeout(() => onNavigate('login'), 2000);
    } catch (errorData) {
        // Now it displays the specific message from the backend
        setMessage(errorData.message || 'An unknown error occurred.');
        setIsError(true);
    }
};


    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-fade-in">
             <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg">
                <h2 className="text-3xl font-bold text-center text-gray-800">Create an Account</h2>
                {message && <p className={`mt-4 text-center p-2 rounded-md ${isError ? 'text-red-500 bg-red-100' : 'text-green-500 bg-green-100'}`}>{message}</p>}
                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                     <div>
                        <label htmlFor="name" className="sr-only">Full Name</label>
                        <input id="name" name="name" type="text" required className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500" placeholder="Full Name" />
                    </div>
                    <div>
                        <label htmlFor="signup-email" className="sr-only">Email address</label>
                        <input id="signup-email" name="email" type="email" required className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500" placeholder="Email address" />
                    </div>
                    <div>
                        <label htmlFor="signup-password" className="sr-only">Password</label>
                        <input id="signup-password" name="password" type="password" required className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500" placeholder="Password" />
                    </div>
                    <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-green-600 hover:bg-green-700">
                        Sign Up
                    </button>
                </form>
                <p className="mt-6 text-center text-sm text-gray-600">
                    Already have an account?{' '}
                    <span onClick={() => onNavigate('login')} className="font-medium text-green-600 hover:text-green-500 cursor-pointer" role="button" tabIndex="0">
                        Log In
                    </span>
                </p>
             </div>
        </div>
    );
};

// #endregion

// #region -------- LAYOUT & UI COMPONENTS --------

// Main App Component with AuthProvider
export default function App() {
    const [currentUser, setCurrentUser] = useState(null);
    const [token, setToken] = useState(null); // State to store the JWT

    // Effect to check for stored token on initial load
    useEffect(() => {
        const storedToken = localStorage.getItem('jwtToken'); // Use a specific key for JWT
        if (storedToken) {
            setToken(storedToken);
            // Attempt to fetch user details using the stored token
            api.getCurrentUser(storedToken)
                .then(user => {
                    setCurrentUser(user);
                })
                .catch(error => {
                    console.error("Failed to re-authenticate with stored token:", error);
                    // Clear invalid token if re-authentication fails
                    localStorage.removeItem('jwtToken');
                    setToken(null);
                });
        }
    }, []); // Run only once on component mount

    // Updated login function to store JWT
    const login = (userData, jwtToken) => {
        localStorage.setItem('jwtToken', jwtToken); // Store the JWT
        setToken(jwtToken);
        setCurrentUser(userData);
    };

    // Updated logout function to remove JWT
    const logout = () => {
        localStorage.removeItem('jwtToken'); // Remove the JWT
        setToken(null);
        setCurrentUser(null);
    };

    return (
        <AuthContext.Provider value={{ currentUser, login, logout, token }}> {/* Pass token to context */}
            <PageRouter />
        </AuthContext.Provider>
    );
}

// PageRouter handles navigation logic
const PageRouter = () => {
  const [currentPage, setCurrentPage] = useState('home');
  
  const handleNavigate = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'sell': return <SellCropsPage onNavigate={handleNavigate} />;
      case 'rent': return <RentEquipmentPage onNavigate={handleNavigate} />;
      case 'howitworks': return <HowItWorksSection isPage={true} onNavigate={handleNavigate} />;
      case 'about': return <AboutUsPage onNavigate={handleNavigate} />;
      case 'login': return <LoginPage onNavigate={handleNavigate} />;
      case 'signup': return <SignUpPage onNavigate={handleNavigate} />;
      case 'home':
      default: return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <Navbar onNavigate={handleNavigate} />
      <main>
        {renderPage()}
      </main>
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}

// HomePage Component
const HomePage = ({ onNavigate }) => {
    return (
        <div className="animate-fade-in">
            <HeroSection onNavigate={onNavigate} />
            <ServicesSection onNavigate={onNavigate} />
            <HowItWorksSection />
            <FeaturedSection />
            <TestimonialsSection />
        </div>
    );
};

// Navbar with dynamic auth state
const Navbar = ({ onNavigate }) => {
  const { currentUser, logout } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  
  const navLinks = [
    { name: 'Sell Crops', page: 'sell' },
    { name: 'Rent Equipment', page: 'rent' },
    { name: 'How It Works', page: 'howitworks' },
    { name: 'About Us', page: 'about' },
  ];

  const handleLinkClick = (page) => {
    onNavigate(page);
    setIsOpen(false);
  };
  
  const handleLogout = () => {
      logout();
      onNavigate('home');
      setIsOpen(false);
  }

  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <span onClick={() => handleLinkClick('home')} className="flex items-center gap-2 text-2xl font-bold text-green-700 cursor-pointer" role="button" tabIndex="0">
            <Leaf size={28} />
            <span>FarmConnect</span>
          </span>

          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <span key={link.name} onClick={() => handleLinkClick(link.page)} className="font-medium text-gray-600 hover:text-green-600 transition-colors duration-300 cursor-pointer" role="button" tabIndex="0">
                {link.name}
              </span>
            ))}
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            {currentUser ? (
                <>
                    <span className="text-gray-700">Welcome, {currentUser.name}!</span>
                    <span onClick={handleLogout} className="flex items-center gap-2 font-medium text-gray-600 hover:text-green-600 cursor-pointer" role="button" tabIndex="0">
                        <LogOut size={16} /> Logout
                    </span>
                </>
            ) : (
                <>
                    <span onClick={() => handleLinkClick('login')} className="font-medium text-gray-600 hover:text-green-600 cursor-pointer" role="button" tabIndex="0">Log In</span>
                    <span onClick={() => handleLinkClick('signup')} className="bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700 transition-all duration-300 shadow-sm cursor-pointer" role="button" tabIndex="0">
                      Sign Up
                    </span>
                </>
            )}
          </div>

          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600 hover:text-green-600">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white pb-4">
          <nav className="flex flex-col items-center space-y-4">
            {navLinks.map((link) => (
              <span key={link.name} onClick={() => handleLinkClick(link.page)} className="font-medium text-gray-600 hover:text-green-600 py-2 cursor-pointer" role="button" tabIndex="0">
                {link.name}
              </span>
            ))}
            {currentUser ? (
                 <span onClick={handleLogout} className="font-medium text-gray-600 hover:text-green-600 py-2 cursor-pointer" role="button" tabIndex="0">Logout</span>
            ) : (
                <>
                    <span onClick={() => handleLinkClick('login')} className="font-medium text-gray-600 hover:text-green-600 py-2 cursor-pointer" role="button" tabIndex="0">Log In</span>
                    <span onClick={() => handleLinkClick('signup')} className="bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-700 mt-2 cursor-pointer" role="button" tabIndex="0">
                      Sign Up
                    </span>
                </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

// Hero Section Component
const HeroSection = ({ onNavigate }) => {
  return (
    <section className="relative bg-green-900 text-white pt-20 pb-24 md:pt-32 md:pb-36">
      <div 
        className="absolute inset-0 bg-cover bg-center" 
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1932&auto=format&fit=crop')" }}
      ></div>
      <div className="absolute inset-0 bg-black opacity-50"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight text-shadow-lg">
          The Modern Marketplace for <span className="text-green-300">Your Farm</span>
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-green-50 text-shadow">
          Easily sell your fresh crops directly to buyers and rent the farming equipment you need, all in one place.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
          <span onClick={() => onNavigate('sell')} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-green-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-green-700 transition-transform hover:scale-105 shadow-lg cursor-pointer" role="button" tabIndex="0">
            <Wheat size={22} />
            Sell Your Crops
          </span>
          <span onClick={() => onNavigate('rent')} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white/90 text-green-800 px-8 py-4 rounded-full text-lg font-semibold hover:bg-white transition-transform hover:scale-105 shadow-lg backdrop-blur-sm cursor-pointer" role="button" tabIndex="0">
            <Tractor size={22} />
            Rent Equipment
          </span>
        </div>
      </div>
    </section>
  );
};

// Services Section Component
const ServicesSection = ({ onNavigate }) => {
  const services = [
    {
      icon: <Wheat size={40} className="text-green-600" />,
      title: "Sell Your Crops",
      description: "Reach a wider market and get the best price for your produce. List your crops in minutes and connect with buyers directly.",
      page: "sell",
      linkText: "Start Selling"
    },
    {
      icon: <Tractor size={40} className="text-green-600" />,
      title: "Rent Farming Equipment",
      description: "Access a wide range of farming accessories and machinery on-demand. Save money by renting instead of buying.",
      page: "rent",
      linkText: "Browse Rentals"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {services.map((service) => (
            <div key={service.title} className="bg-gray-50 p-8 rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300 border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="bg-green-100 p-3 rounded-full">
                  {service.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-800">{service.title}</h3>
              </div>
              <p className="mt-4 text-gray-600">{service.description}</p>
              <span onClick={() => onNavigate(service.page)} className="mt-6 inline-block text-green-600 font-semibold hover:text-green-800 transition-colors cursor-pointer" role="button" tabIndex="0">
                {service.linkText} &rarr;
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// How It Works Section Component
const HowItWorksSection = ({ isPage = false, onNavigate }) => {
  const steps = [
    {
      icon: <UserPlus size={32} />,
      title: "Create an Account",
      description: "Quick and easy registration to get you started on our platform."
    },
    {
      icon: <ListChecks size={32} />,
      title: "List Your Item",
      description: "Whether it's crops for sale or equipment for rent, create your listing in a few simple steps."
    },
    {
      icon: <Handshake size={32} />,
      title: "Connect & Transact",
      description: "Connect with interested parties, agree on terms, and complete your transaction securely."
    }
  ];

  return (
    <section className={`py-20 ${isPage ? 'bg-white' : 'bg-gray-50'}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {isPage && (
            <span onClick={() => onNavigate('home')} className="flex items-center gap-2 text-green-600 hover:text-green-800 mb-8 cursor-pointer" role="button" tabIndex="0">
                <ArrowLeft size={20} /> Back to Home
            </span>
        )}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800">Get Started in 3 Easy Steps</h2>
          <p className="mt-4 max-w-xl mx-auto text-gray-600">A simple and straightforward process for everyone.</p>
        </div>
        <div className="mt-12 grid md:grid-cols-3 gap-8 text-center">
          {steps.map((step, index) => (
            <div key={step.title} className="p-6">
              <div className="flex justify-center items-center mx-auto bg-green-600 text-white w-16 h-16 rounded-full text-2xl font-bold">
                {index + 1}
              </div>
              <h3 className="mt-6 text-xl font-semibold text-gray-800">{step.title}</h3>
              <p className="mt-2 text-gray-500">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Featured Section Component
const FeaturedSection = () => {
  const featuredItems = [
    { type: 'CROP', name: 'Organic Tomatoes', price: '$2.50/kg', image: 'https://images.unsplash.com/photo-1598512752271-33f913a5af13?q=80&w=1770&auto=format&fit=crop' },
    { type: 'EQUIPMENT', name: 'John Deere Tractor', price: '$150/day', image: 'https://images.unsplash.com/photo-1561501900-3701fa6a0864?q=80&w=1770&auto=format&fit=crop' },
    { type: 'CROP', name: 'Fresh Corn', price: '$1.00/ear', image: 'https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=1770&auto=format&fit=crop' },
    { type: 'EQUIPMENT', name: 'Seed Planter', price: '$80/day', image: 'https://images.unsplash.com/photo-1621998563509-408551453239?q=80&w=1932&auto=format&fit=crop' },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-gray-800">Featured Listings</h2>
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredItems.map(item => (
            <div key={item.name} className="border border-gray-200 rounded-lg overflow-hidden group shadow-sm hover:shadow-xl transition-shadow duration-300">
              <div className="relative">
                <img src={item.image} alt={item.name} className="w-full h-48 object-cover" />
                <span className={`absolute top-2 right-2 text-xs font-bold text-white px-2 py-1 rounded-full ${item.type === 'CROP' ? 'bg-yellow-500' : 'bg-blue-500'}`}>
                  {item.type === 'CROP' ? 'FOR SALE' : 'FOR RENT'}
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg text-gray-800">{item.name}</h3>
                <p className="text-green-600 font-bold mt-1">{item.price}</p>
                <button className="mt-4 block w-full text-center bg-green-50 text-green-700 py-2 rounded-md hover:bg-green-100 transition-colors">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Testimonials Section Component
const TestimonialsSection = () => {
    return (
        <section className="py-20 bg-green-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-bold text-center text-gray-800">What Our Farmers Say</h2>
                <div className="mt-12 grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <p className="text-gray-600 italic">"FarmConnect has revolutionized how I sell my produce. I'm getting better prices and connecting with buyers I never could have reached before. Highly recommended!"</p>
                        <p className="mt-4 font-semibold text-gray-800">- Rajinder Singh, Punjab</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <p className="text-gray-600 italic">"Renting a thresher for harvest season was so simple and affordable through this platform. It saved me a huge upfront investment. A game-changer for small farmers."</p>
                        <p className="mt-4 font-semibold text-gray-800">- Sunita Devi, Haryana</p>
                    </div>
                </div>
            </div>
        </section>
    );
}

// Footer Component
const Footer = ({ onNavigate }) => {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg">FarmConnect</h3>
            <p className="mt-2 text-gray-400 text-sm">Empowering farmers through technology, creating a sustainable agricultural future.</p>
          </div>
          <div>
            <h3 className="font-bold text-lg">Quick Links</h3>
            <ul className="mt-2 space-y-2 text-sm">
              <li><span onClick={() => onNavigate('sell')} className="text-gray-400 hover:text-white cursor-pointer" role="button" tabIndex="0">Sell Crops</span></li>
              <li><span onClick={() => onNavigate('rent')} className="text-gray-400 hover:text-white cursor-pointer" role="button" tabIndex="0">Rent Equipment</span></li>
              <li><span onClick={() => onNavigate('signup')} className="text-gray-400 hover:text-white cursor-pointer" role="button" tabIndex="0">Sign Up</span></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-lg">Legal</h3>
            <ul className="mt-2 space-y-2 text-sm">
              <li><span className="text-gray-400 hover:text-white cursor-pointer" role="button" tabIndex="0">Terms of Service</span></li>
              <li><span className="text-gray-400 hover:text-white cursor-pointer" role="button" tabIndex="0">Privacy Policy</span></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-lg">Contact</h3>
            <ul className="mt-2 space-y-2 text-sm">
              <li className="text-gray-400">Meerut, Uttar Pradesh</li>
              <li className="text-gray-400">contact@farmconnect.com</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-700 pt-8 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} FarmConnect. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
// #endregion
