import { useState, useEffect } from 'react';
import { ArrowLeft, User, MapPin, Calendar, CheckCircle, XCircle, Shield, Building, CreditCard, Home, AlertCircle } from 'lucide-react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Host } from '../../../interface/Host'
import { Hostel } from '../../../interface/Hostel';
import { Notification } from '../../../interface/Notification';
import { approveHost, getHostHostelData, getUserDetails, rejectHost } from '../../../services/adminServices';
import { socket } from '../../../utils/socket';



type RouteParams = {
  id: string;
};

const AdminHostDetailedBody = () => {


  const [hostel, setHostel] = useState<Hostel[]>([])
  const [showImageModal, setShowImageModal] = useState(false);
  const [host, setHost] = useState<Host>();

  const { id } = useParams<RouteParams>()

  const handleStatusChange = async (newStatus: string) => {
    setHost({ ...(host as Host), status: newStatus });

    try {
      const finalHostId = id as string;

      console.log(finalHostId, 'host')
      if (newStatus == 'approved') {
        console.log("hostId", id)
        const response = await approveHost(finalHostId)
        console.log(response)

        if (response.data.message == 'Approved') {
          const newNotification: Notification = {
            receiver: finalHostId,
            message: `Your request has been approved on ${new Date().toLocaleDateString()}`,
            title: 'Request Approved',
            type: 'success',
            isRead: true
          };

          socket.emit('send_notification', newNotification);
          console.log(host, 'hostt')
          const updateHost = {
            ...host,
            approvalRequest: "3"
          } as Host
          setHost(updateHost)
          toast.success("Host approved");
        }
      } else if (newStatus == 'rejected') {
        const response = await rejectHost(finalHostId);
        if (response.data.message == 'Reject') {
          const newNotification: Notification = {
            receiver: finalHostId,
            message: `Your request has been rejected on ${new Date().toLocaleDateString()}`,
            title: 'Request Rejected',
            type: 'warning',
            isRead: true
          };

          socket.emit('send_notification', newNotification);
          const updateHost = {
            ...host,
            approvalRequest: "1"
          } as Host;
          setHost(updateHost)
          toast.success("Host Rejected")

        } else if (response.data.message == 'Not Reject') {
          toast.error("Host Not Rejected")
        }
      }

    } catch (error) {
      console.log(error)
    }

  };

  const handleBack = () => {
    console.log("Navigating back");
  };


  useEffect(() => {
    const fetchHostData = async () => {
      try {
        if (!id) return;
        const response = await getUserDetails(id);
        const hostHostelData = await getHostHostelData(id);
        setHostel(hostHostelData.data.message)
        setHost(response.data.message)
      } catch (error) {
        console.log(error)
      }
    }
    fetchHostData();
  }, [id])

  return (
    <div className="w-full bg-gray-100 min-h-screen">

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


        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div className="bg-white rounded-xl shadow-md overflow-hidden">

            <div className="relative bg-gradient-to-r from-[#212936] to-[#45B8F2] p-6 flex flex-col items-center">
              <div className="mb-2">
                <CreditCard size={32} className="text-white" />
              </div>
              <h3 className="text-white font-medium">Identity Verification</h3>
              <p className="text-white text-sm opacity-80">Document Type: {host?.documentType}</p>
            </div>


            <div className="p-6 flex flex-col items-center border-b border-gray-100">
              <div
                className="w-[180px] h-[100px] bg-gray-50 p-2 rounded-lg border border-gray-200 overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-300"
                onClick={() => setShowImageModal(true)}
              >
                <img
                  src={host?.photo}
                  alt="ID Proof Document"
                  className="w-full h-full object-cover rounded hover:opacity-80 transition-opacity duration-300"
                />
              </div>


              <div className="mt-3 flex items-center">
                <div className={`w-2 h-2 rounded-full mr-2 ${host?.status === 'verified' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                <span className="text-sm font-medium">
                  {host?.status === 'verified' ? 'Verified ID' : 'Pending Verification'}
                </span>
              </div>


              <p className="text-xs text-gray-400 mt-1">Click to view full size</p>
            </div>


            {showImageModal && (
              <div
                className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
                onClick={() => setShowImageModal(false)}
              >
                <div className="relative max-w-4xl max-h-full">
                  <img
                    src={host?.photo}
                    alt="ID Proof Document - Full Size"
                    className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                  />


                  <button
                    onClick={() => setShowImageModal(false)}
                    className="absolute top-4 right-4 bg-white bg-opacity-20 hover:bg-opacity-30 
                   text-white p-2 rounded-full transition-all duration-200"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>


                  <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-3 py-2 rounded-lg">
                    <p className="text-sm font-medium">{host?.documentType} - {host?.name}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="p-6 text-center">
              <h2 className="text-2xl font-bold text-gray-800">{host?.name}</h2>
              <p className="text-gray-500 text-sm mt-1">Host ID: {host?._id?.toString()}</p>

              <div className="mt-4">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium 
                ${host?.status === 'approved' ? 'bg-green-100 text-green-800' :
                    host?.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'}`}>
                  <span className={`w-2 h-2 rounded-full mr-2 
                  ${host?.status === 'approved' ? 'bg-green-500' :
                      host?.status === 'rejected' ? 'bg-red-500' :
                        'bg-yellow-500'}`}></span>
                  {host?.approvalRequest === '3' ? 'Approved' :
                    (host?.approvalRequest === '1' && host?.photo) ? 'Rejected' : 'Pending Approval'}
                </div>
              </div>




            </div>
          </div>


          <div className="space-y-6">

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
                    <p className="font-medium">{host?.email}</p>
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
                    <p className="font-medium">{host?.address || "No address"}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Calendar className="text-[#45B8F2] mr-3 mt-1" size={18} />
                  <div>
                    <p className="text-xs text-gray-500">Joined Date</p>
                    <p className="font-medium">{host?.createdAt}</p>
                  </div>
                </div>
              </div>
            </div>


            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Shield className="text-[#45B8F2] mr-2" size={20} />
                Verification Request
              </h3>


              {host?.approvalRequest === '2' && (
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

              {host?.approvalRequest == "1" && host?.photo ? (
                <div className="mt-6 text-center py-4">
                  <div className="bg-red-50 rounded-full p-3 inline-flex mb-3">
                    <XCircle size={24} className="text-red-500" />
                  </div>
                  <h4 className="text-gray-800 font-medium mb-2">Request Rejected</h4>
                  <p className="text-gray-500 text-sm">
                    This host verification request has been rejected.
                  </p>
                </div>
              ) : (
                host?.approvalRequest == "1" && (
                  <div className="mt-6 text-center py-4">
                    <div className="bg-yellow-50 rounded-full p-3 inline-flex mb-3">
                      <AlertCircle size={24} className="text-yellow-500" />
                    </div>
                    <h4 className="text-gray-800 font-medium mb-2">No Request Sent</h4>
                    <p className="text-gray-500 text-sm">
                      No request has been made yet.
                    </p>
                  </div>
                )
              )}




              {host?.approvalRequest === '3' && (
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


          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Building className="text-[#45B8F2] mr-2" size={20} />
              Properties Listed ({hostel?.length})
            </h3>

            {hostel?.length > 0 ? (
              <>
                <div className="space-y-3">
                  {hostel?.map((property) => (
                    <div
                      key={property.hostelname}
                      className="group bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-lg hover:border-blue-200 transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg group-hover:from-blue-100 group-hover:to-indigo-100 transition-colors">
                          <Home className="text-blue-600 group-hover:text-blue-700 transition-colors" size={24} />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-md font-semibold text-gray-800 group-hover:text-blue-700 transition-colors">
                            {property.hostelname}
                          </h3>

                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>


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


      </div>
    </div>
  );
};

export default AdminHostDetailedBody;