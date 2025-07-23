import  { useEffect } from 'react';
import host_landing from '../../../assets/seller1.webp';
const apiUrl = import.meta.env.VITE_BACKEND_URL;
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { io } from "socket.io-client";
import createApiClient from '../../../apis/apiClient';
const hostApiClient = createApiClient('host');
const socket = io(apiUrl);



interface CustomJwtPayload {
  _id: string;
}

const HostLandingBody = () => {

  const navigate = useNavigate();

  const handleAddNewProperty = async() =>{
    const response = await hostApiClient.get(`${apiUrl}/host/newHost`)
    console.log(response)
    if(response.data.message=='Not containing' || response.data.message == 'Host ID not found'){
      console.log("hello")
      navigate('/host/approval')
    }else if(response.data.message == "Containing"){
      navigate('/host/addhostel')
    }
  }

  
  const handleNavigateToProperty = () =>{
    navigate('/host/hostel')
  }

  useEffect(() => {
      const accessToken = localStorage.getItem('hostAccessToken');
      if (accessToken) {
        const decoded = jwtDecode<CustomJwtPayload>(accessToken);
        const hostId = decoded._id
        if (hostId) {
          socket.emit('hostLoggedIn', hostId);
        }
      }
  
    }, [])


  return (
    <main className="pt-16 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12 lg:py-16">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
          <div className="w-full lg:w-2/5 space-y-6 text-center lg:text-left">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
              Welcome, Host!
            </h1>
            
            <p className="text-lg text-gray-600 max-w-lg mx-auto lg:mx-0">
              Manage your listings, view earnings, and connect with potential guests. 
              Your journey as a host starts here!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button
              onClick={handleAddNewProperty }
              className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors">
                Add New Property
              </button>
              <button
              onClick={handleNavigateToProperty}
              className="px-6 py-3 bg-white text-emerald-600 border border-emerald-600 rounded-lg font-medium hover:bg-emerald-50 transition-colors">
                View Properties
              </button>
            </div>
          </div>

          <div className="w-full lg:w-3/5">
            <div className="relative aspect-video rounded-2xl overflow-hidden shadow-xl">
              <img
              src={host_landing}
                alt="Host Welcome"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default HostLandingBody;
