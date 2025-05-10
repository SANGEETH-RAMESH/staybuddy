import React, { useState, useEffect } from 'react';
import { ArrowLeft, FileText, User, MapPin, Calendar, CheckCircle, XCircle, Clock, Shield, Building, CreditCard, File } from 'lucide-react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { LOCALHOST_URL } from '../../../constants/constants';

const AdminHostDetailedBody = () => {
  // Mock data - in a real app this would come from props or API

  const [hostel, setHostel] = useState([])

  const [host, setHost] = useState({
    id: "HOST12345",
    name: "Alex Johnson",
    email: "alex.johnson@example.com",
    phone: "+1 (555) 123-4567",
    documentType: "National ID",
    idProofImage: "/api/placeholder/150/150",
    status: "pending",
    address: "123 Main Street, New York, NY",
    joinDate: "March 15, 2024",
    totalListings: 4,
    averageRating: 4.7,
    verificationDocuments: [
      { name: "ID Verification", status: "verified", date: "Mar 15, 2024" },
      { name: "Address Proof", status: "verified", date: "Mar 16, 2024" },
      { name: "Background Check", status: "pending", date: "Awaiting" }
    ],
    properties: [
      { id: "PROP1", name: "Sunny Downtown Apartment", location: "Manhattan, NY", status: "active" },
      { id: "PROP2", name: "Cozy Studio Near Campus", location: "Brooklyn, NY", status: "active" },
      { id: "PROP3", name: "Spacious 2BR with View", location: "Queens, NY", status: "under_review" },
      { id: "PROP4", name: "Modern Loft", location: "Brooklyn, NY", status: "inactive" }
    ]
  });

  const hostId = useParams()

  const handleStatusChange = async(newStatus:string) => {
    setHost({ ...host, status: newStatus });
    // In a real app, you would make an API call here
    try {
      if(newStatus == 'approved'){
        console.log("hostId",hostId)
        const response = await axios.patch(`${LOCALHOST_URL}/admin/approvehost`,{hostId});
        console.log(response)
        if(response.data.message == 'Approved'){
          toast.success("Host approved");
          window.location.reload();
        }else if(response.data.message == 'Not Approved'){
          toast.error("Host Not Approved")
        }
      }else if(newStatus == 'rejected'){
        const response = await axios.patch(`${LOCALHOST_URL}/admin/rejecthost`,{hostId})
        if(response.data.message == 'Reject'){
          toast.success("Host Rejected")
          window.location.reload();
        }else if(response.data.message == 'Not Reject'){
          toast.error("Host Not Rejected")
        }
      }
      
    } catch (error) {
      console.log(error)
    }
   
  };

  const handleBack = () => {
    // Navigate back to host list - would use navigation in real app
    console.log("Navigating back");
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">Active</span>;
      case 'inactive':
        return <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">Inactive</span>;
      case 'under_review':
        return <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">Under Review</span>;
      case 'verified':
        return <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">Verified</span>;
      case 'pending':
        return <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">Pending</span>;
      default:
        return <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  const { id } = useParams();

  useEffect(() => {
    const fetchHostData = async () => {
      try {
        console.log("id", id)
        const response = await axios.get(`${LOCALHOST_URL}/admin/getUserDetails/${id}`)
        const hostHostelData = await axios.get(`${LOCALHOST_URL}/admin/getHostHostelData/${id}`)
        console.log(hostHostelData.data.message, 'Hostel')
        setHostel(hostHostelData.data.message)
        // console.log(response.data.message)
        setHost(response.data.message)
      } catch (error) {
        console.log(error)
      }
    }
    fetchHostData();
  }, [])

  return (
    <div className="w-full bg-gray-100 min-h-screen">
      {/* Content area */}
      <div className="px-4 py-6 bg-[#2D394E]">
        {/* Back button and title */}
        <div className="flex items-center mb-6">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-gray-200 rounded-full mr-2 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <h1 className="text-xl font-bold text-white">Host Details</h1>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Profile */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {/* Profile header with ID Proof instead of profile photo */}
            <div className="relative bg-gradient-to-r from-[#212936] to-[#45B8F2] p-6 flex flex-col items-center">
              <div className="mb-2">
                <CreditCard size={32} className="text-white" />
              </div>
              <h3 className="text-white font-medium">Identity Verification</h3>
              <p className="text-white text-sm opacity-80">Document Type: {host.documentType}</p>
            </div>

            {/* ID Proof Display */}
            <div className="p-6 flex flex-col items-center border-b border-gray-100">
              <div className="w-[180px] h-[100px] bg-gray-50 p-2 rounded-lg border border-gray-200">
                <img
                  src={host?.photo}
                  alt="ID Proof Document"
                  className="w-full object-cover rounded"
                />
              </div>
              <div className="mt-3 flex items-center">
                <div className={`w-2 h-2 rounded-full mr-2 ${host?.status === 'verified' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                <span className="text-sm font-medium">
                  {host?.status === 'verified' ? 'Verified ID' : 'Pending Verification'}
                </span>
              </div>
            </div>

            {/* Profile info */}
            <div className="p-6 text-center">
              <h2 className="text-2xl font-bold text-gray-800">{host.name}</h2>
              <p className="text-gray-500 text-sm mt-1">Host ID: {host._id}</p>

              {/* Status badge */}
              <div className="mt-4">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium 
                ${host.status === 'approved' ? 'bg-green-100 text-green-800' :
                    host.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'}`}>
                  <span className={`w-2 h-2 rounded-full mr-2 
                  ${host.status === 'approved' ? 'bg-green-500' :
                      host.status === 'rejected' ? 'bg-red-500' :
                        'bg-yellow-500'}`}></span>
                  {host?.approvalRequest === '3' ? 'Approved' :
                    (host?.approvalRequest === '1' && host?.photo) ? 'Rejected' : 'Pending Approval'}
                </div>
              </div>

              {/* Host stats */}
              {/* <div className="grid grid-cols-3 gap-2 mt-6 border-t border-gray-100 pt-6">
              <div>
                <p className="text-xs text-gray-500">Listings</p>
                <p className="font-semibold text-lg">{host.totalListings}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Rating</p>
                <p className="font-semibold text-lg">{host.averageRating}/5</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Since</p>
                <p className="font-semibold text-lg">{new Date(host.joinDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</p>
              </div>
            </div> */}


            </div>
          </div>

          {/* Middle column - Host information */}
          <div className="space-y-6">
            {/* Contact information */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <User className="text-[#45B8F2] mr-2" size={20} />
                Contact Information
              </h3>

              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="min-w-8 text-center mr-3 mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#45B8F2]">
                      <path d="M21 5v14h-18v-14h18zm-18-2a2 2 0 00-2 2v14a2 2 0 002 2h18a2 2 0 002-2v-14a2 2 0 00-2-2h-18z"></path>
                      <path d="M3 7l9 6 9-6"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email Address</p>
                    <p className="font-medium">{host.email}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="min-w-8 text-center mr-3 mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#45B8F2]">
                      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Phone Number</p>
                    <p className="font-medium">{host?.mobile}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <MapPin className="text-[#45B8F2] mr-3 mt-1" size={18} />
                  <div>
                    <p className="text-xs text-gray-500">Address</p>
                    <p className="font-medium">{host.address || "No address"}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Calendar className="text-[#45B8F2] mr-3 mt-1" size={18} />
                  <div>
                    <p className="text-xs text-gray-500">Joined Date</p>
                    <p className="font-medium">{host.createdAt}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Verification documents */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Shield className="text-[#45B8F2] mr-2" size={20} />
                Verification Request
              </h3>

              {/* Action buttons */}
              {host.approvalRequest === '2' && (
                <div className="mt-8 space-y-3">
                  <button
                    onClick={() => handleStatusChange('approved')}
                    className="w-full py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors font-medium flex items-center justify-center"
                  >
                    <CheckCircle size={18} className="mr-2" />
                    Approve Host
                  </button>

                  <button
                    onClick={() => handleStatusChange('rejected')}
                    className="w-full py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors font-medium flex items-center justify-center"
                  >
                    <XCircle size={18} className="mr-2" />
                    Reject Host
                  </button>
                </div>
              )}

              {(host.approvalRequest === '1' && host.photo) && (
                <div className="mt-6 text-center py-4">
                  <div className="bg-red-50 rounded-full p-3 inline-flex mb-3">
                    <XCircle size={24} className="text-red-500" />
                  </div>
                  <h4 className="text-gray-800 font-medium mb-2">Request Rejected</h4>
                  <p className="text-gray-500 text-sm">
                    This host verification request has been rejected.
                  </p>
                  {/* <button
                    onClick={() => handleStatusChange('pending')}
                    className="mt-4 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm"
                  >
                    Review Again
                  </button> */}
                </div>
              )}

              {host.approvalRequest === '3' && (
                <div className="mt-6 text-center py-4">
                  <div className="bg-green-50 rounded-full p-3 inline-flex mb-3">
                    <CheckCircle size={24} className="text-green-500" />
                  </div>
                  <h4 className="text-gray-800 font-medium mb-2">Request Approved</h4>
                  <p className="text-gray-500 text-sm">
                    This host has been successfully verified.
                  </p>
                  <div className="mt-4 text-xs text-gray-400">
                    Approved on {new Date().toLocaleDateString()}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right column - Properties */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Building className="text-[#45B8F2] mr-2" size={20} />
              Properties Listed ({hostel.length})
            </h3>

            {hostel.length > 0 ? (
              <>
                <div className="space-y-4">
                  {hostel.map((property, index) => (
                    <div key={index} className="border border-gray-100 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-800">{property.name}</h4>
                          <p className="text-sm text-gray-500 flex items-center mt-1">
                            <MapPin size={14} className="mr-1" /> {property.location}
                          </p>
                        </div>
                        {getStatusBadge(property.status)}
                      </div>
                      <div className="mt-3 pt-2 border-t border-gray-100 flex justify-between">
                        <span className="text-xs text-gray-500">ID: {property?._id}</span>
                        <button className="text-sm text-[#45B8F2] hover:underline">View Details</button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* <button className="mt-6 w-full py-2 border border-[#45B8F2] text-[#45B8F2] rounded-md hover:bg-[#45B8F2]/10 transition-colors font-medium flex items-center justify-center">
                  View All Properties
                </button> */}
              </>
            ) : (
              <div className="text-center py-8">
                <div className="bg-gray-50 inline-flex p-4 rounded-full mb-4">
                  <Building className="text-gray-400" size={24} />
                </div>
                <h4 className="text-gray-700 font-medium mb-2">No Properties Listed</h4>
                <p className="text-gray-500 text-sm mb-6">Host haven't added any properties yet.</p>

              </div>
            )}
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="mt-6 bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Clock className="text-[#45B8F2] mr-2" size={20} />
            Recent Activity
          </h3>

          <div className="border-l-2 border-gray-200 ml-4 space-y-6 pl-6 py-2">
            <div className="relative">
              <div className="absolute -left-10 top-1 w-4 h-4 rounded-full bg-[#45B8F2]"></div>
              <p className="text-sm text-gray-700">New property listed: <span className="font-medium">Modern Loft</span></p>
              <p className="text-xs text-gray-500 mt-1">May 2, 2025</p>
            </div>

            <div className="relative">
              <div className="absolute -left-10 top-1 w-4 h-4 rounded-full bg-[#45B8F2]"></div>
              <p className="text-sm text-gray-700">Completed verification for <span className="font-medium">Address Proof</span></p>
              <p className="text-xs text-gray-500 mt-1">March 16, 2024</p>
            </div>

            <div className="relative">
              <div className="absolute -left-10 top-1 w-4 h-4 rounded-full bg-[#45B8F2]"></div>
              <p className="text-sm text-gray-700">Joined StayBuddy as host</p>
              <p className="text-xs text-gray-500 mt-1">March 15, 2024</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHostDetailedBody;