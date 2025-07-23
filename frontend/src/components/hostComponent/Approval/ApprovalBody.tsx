import React, { useEffect, useState } from 'react';
import { AlertCircle, Mail, Clock, ArrowRight, Upload, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Host } from '../../../interface/Host';
import { Notification } from '../../../interface/Notification';
import { io } from "socket.io-client";
import { getAdmin, getHost, submitHostApproval } from '../../../services/hostServices';
const apiUrl = import.meta.env.VITE_BACKEND_URL;
const socket = io(apiUrl);


const ApprovalBody = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [requestAlreadySent, setRequestAlreadySent] = useState(false);
  const [isRejected, setIsRejected] = useState(false);

  const [host, setHost] = useState<Host>();

  const idOptions = [
    { value: 'aadhaar', label: 'Aadhaar Card' },
    { value: 'license', label: 'Driving License' },
    { value: 'passport', label: 'Passport' },
    { value: 'voter', label: 'Voter ID' },
    { value: 'pan', label: 'PAN Card' }
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadSuccess(false);
      setUploadError('');
    }
  };

  const handleDocumentTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDocumentType(e.target.value);
  };

  const handleUpload = async () => {
    if (!selectedFile || !documentType) {
      setUploadError('Please select both a document type and file');
      return;
    }

    setIsUploading(true);
    setUploadError('');

    try {
      setTimeout(() => {
        setIsUploading(false);
        setUploadSuccess(true);
        toast.success("Document uploaded successfully");
      }, 1500);

    } catch (error) {
      console.error('Upload error:', error);
      setIsUploading(false);
      setUploadError('Failed to upload document. Please try again.');
      toast.error("Upload failed");
    }
  };

  const handleRequestPermission = async () => {
    if (!uploadSuccess) {
      toast.error("Please upload your ID document first");
      return;
    }

    const formData = new FormData();

    if (selectedFile) {
      formData.append('file', selectedFile);
    }
    formData.append('documentType', documentType);
    console.log(formData, 'Document')
    console.log(selectedFile)

    try {
      const response = await submitHostApproval(formData);

      const adminData = await getAdmin();
      const id = adminData.data.message._id;
      console.log(adminData.data.message._id, 'Admin')

      console.log(response);
      const newNotification: Notification = {
        receiver: id,
        message: `You have received a new verification request on ${new Date().toLocaleDateString()}`,
        title: 'Verification Request',
        type: 'info', 
        isRead: true
      };
      console.log('rece', newNotification)
      socket.emit('send_notification', newNotification)
      toast.success("Approval Request Sent");
      navigate('/host/home');
    } catch (error) {
      console.log(error);
      toast.error("Failed to submit verification request");
    }
  };

  useEffect(() => {
    const fetchHostData = async () => {
      try {
        const response = await getHost();
        setHost(response.data.message)
        if (response.data.message.photo && Number(response.data.message.approvalRequest) === 1) {
          setIsRejected(true);
          return
        }
        if (response.data.message.photo && response.data.message.documentType && response.data.message.approvalRequest !== 1) {
          setRequestAlreadySent(true);
        }
      } catch (error) {
        console.log(error)
      }
    }
    fetchHostData()
  }, [])

  if (isRejected) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 px-4">
        <div className="max-w-3xl mx-auto py-12">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="border-b border-gray-200 bg-red-50 p-6 rounded-t-lg">
              <div className="flex items-center gap-4">
                <div className="bg-white p-3 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">Verification Request Rejected</h1>
                  <p className="text-sm text-gray-600 mt-1">
                    Please submit a new document for verification
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md">
                <div className="flex gap-3">
                  <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-red-700 font-medium">
                      Your verification was rejected
                    </p>
                    <p className="text-sm text-red-700 mt-1">
                      Your previous document ({host?.documentType}) was rejected. This may be due to image quality issues, invalid document, or information mismatch. Please upload a clearer document to continue.
                    </p>
                  </div>
                </div>
              </div>

              {/* Document Upload Section */}
              <div className="space-y-4 border border-gray-200 rounded-lg p-5">
                <h2 className="text-lg font-medium text-gray-900">Upload New Document</h2>

                {/* Document Type Selector */}
                <div className="space-y-2">
                  <label htmlFor="documentType" className="block text-sm font-medium text-gray-700">
                    Select ID Document Type
                  </label>
                  <select
                    id="documentType"
                    className="w-full rounded-lg border border-gray-300 py-2 px-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    value={documentType}
                    onChange={handleDocumentTypeChange}
                  >
                    <option value="">Select document type</option>
                    {idOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* File Uploader */}
                <div className="space-y-2">
                  <label htmlFor="file" className="block text-sm font-medium text-gray-700">
                    Upload Document
                  </label>

                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      id="file"
                      className="hidden"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={handleFileChange}
                    />

                    <div className="space-y-2">
                      <div className="flex justify-center">
                        <Upload className="h-8 w-8 text-gray-400" />
                      </div>
                      <div className="text-sm text-gray-600">
                        <label htmlFor="file" className="cursor-pointer text-emerald-600 hover:text-emerald-500 font-medium">
                          Click to upload
                        </label>
                        <span> or drag and drop</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        JPG, PNG(max. 5MB)
                      </p>

                      {selectedFile && (
                        <div className="mt-2 px-3 py-1 bg-gray-100 rounded-md inline-flex items-center gap-2">
                          <span className="text-sm text-gray-800 truncate max-w-xs">{selectedFile.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Upload Status */}
                {uploadSuccess && (
                  <div className="flex items-center gap-2 text-sm text-emerald-600">
                    <CheckCircle className="h-4 w-4" />
                    <span>Document uploaded successfully!</span>
                  </div>
                )}

                {uploadError && (
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <XCircle className="h-4 w-4" />
                    <span>{uploadError}</span>
                  </div>
                )}

                {/* Upload Button */}
                <div>
                  <button
                    className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors font-medium disabled:bg-gray-400"
                    onClick={handleUpload}
                    disabled={!selectedFile || !documentType || isUploading}
                  >
                    {isUploading ? 'Uploading...' : 'Upload Document'}
                  </button>
                </div>
              </div>

              {/* Tips for better submission */}
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-md">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-blue-700 font-medium">Tips for successful verification</p>
                    <ul className="text-sm text-blue-700 mt-1 list-disc pl-5">
                      <li>Ensure the document is clearly visible and not blurry</li>
                      <li>All corners of the document must be visible</li>
                      <li>Information should be legible and not obscured</li>
                      <li>Ensure the document is valid and not expired</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4">
                <button
                  className={`w-full sm:w-auto px-6 py-3 rounded-lg font-medium transition-colors ${uploadSuccess
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  onClick={handleRequestPermission}
                  disabled={!uploadSuccess}
                >
                  Resubmit Verification Request
                </button>
                {!uploadSuccess && (
                  <p className="text-xs text-gray-500 mt-2">
                    Please upload a valid ID document first
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If request already sent, show a different UI
  if (requestAlreadySent) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 px-4">
        <div className="max-w-3xl mx-auto py-12">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="border-b border-gray-200 bg-blue-50 p-6 rounded-t-lg">
              <div className="flex items-center gap-4">
                <div className="bg-white p-3 rounded-full">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">Verification Request Pending</h1>
                  <p className="text-sm text-gray-600 mt-1">
                    Your verification request has already been submitted
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-md">
                <div className="flex gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-emerald-700 font-medium">
                      Verification request already sent!
                    </p>
                    <p className="text-sm text-emerald-700 mt-1">
                      Your document ({host?.documentType}) is currently under review by our team. We'll notify you once the verification process is complete.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-lg font-medium text-gray-900">What's Next?</h2>

                <div className="grid gap-4">
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="bg-white p-2 rounded-full">
                      <Clock className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Admin Review</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Our team is reviewing your verification request. This typically takes 24-48 hours.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="bg-white p-2 rounded-full">
                      <Mail className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Email Notification</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        You'll receive an email once your verification is approved
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  className="w-full sm:w-auto px-6 py-3 rounded-lg font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors"
                  onClick={() => navigate('/host/home')}
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 px-4">
      <div className="max-w-3xl mx-auto py-12">
        {/* Main Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Status Banner */}
          <div className="border-b border-gray-200 bg-emerald-50 p-6 rounded-t-lg">
            <div className="flex items-center gap-4">
              <div className="bg-white p-3 rounded-full">
                <Clock className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">New Host Verification Required</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Complete verification to start adding properties on StayBuddy
                </p>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-6 space-y-6">
            {/* Info Box */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-md">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-700">
                  As a new host, you need to complete verification before you can add properties.
                  This helps us maintain quality standards for our guests.
                </p>
              </div>
            </div>

            {/* Steps */}
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-gray-900">Verification Process</h2>

              <div className="grid gap-4">
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="bg-white p-2 rounded-full">
                    <Upload className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Upload ID Document</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Upload a valid government-issued ID document for verification
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="bg-white p-2 rounded-full">
                    <Mail className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Submit Verification</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      After uploading your ID, submit your host verification request
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="bg-white p-2 rounded-full">
                    <Clock className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Admin Review</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Our team will review your request within 24-48 hours
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="bg-white p-2 rounded-full">
                    <ArrowRight className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Start Hosting</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Once approved, you can start adding your properties
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Document Upload Section */}
            <div className="space-y-4 border border-gray-200 rounded-lg p-5">
              <h2 className="text-lg font-medium text-gray-900">ID Document Upload</h2>

              {/* Document Type Selector */}
              <div className="space-y-2">
                <label htmlFor="documentType" className="block text-sm font-medium text-gray-700">
                  Select ID Document Type
                </label>
                <select
                  id="documentType"
                  className="w-full rounded-lg border border-gray-300 py-2 px-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  value={documentType}
                  onChange={handleDocumentTypeChange}
                >
                  <option value="">Select document type</option>
                  {idOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* File Uploader */}
              <div className="space-y-2">
                <label htmlFor="file" className="block text-sm font-medium text-gray-700">
                  Upload Document
                </label>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    id="file"
                    className="hidden"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={handleFileChange}
                  />

                  <div className="space-y-2">
                    <div className="flex justify-center">
                      <Upload className="h-8 w-8 text-gray-400" />
                    </div>
                    <div className="text-sm text-gray-600">
                      <label htmlFor="file" className="cursor-pointer text-emerald-600 hover:text-emerald-500 font-medium">
                        Click to upload
                      </label>
                      <span> or drag and drop</span>
                    </div>
                    <p className="text-xs text-gray-500">
                      JPG, PNG(max. 5MB)
                    </p>

                    {selectedFile && (
                      <div className="mt-2 px-3 py-1 bg-gray-100 rounded-md inline-flex items-center gap-2">
                        <span className="text-sm text-gray-800 truncate max-w-xs">{selectedFile.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Upload Status */}
              {uploadSuccess && (
                <div className="flex items-center gap-2 text-sm text-emerald-600">
                  <CheckCircle className="h-4 w-4" />
                  <span>Document uploaded successfully!</span>
                </div>
              )}

              {uploadError && (
                <div className="flex items-center gap-2 text-sm text-red-600">
                  <XCircle className="h-4 w-4" />
                  <span>{uploadError}</span>
                </div>
              )}

              {/* Upload Button */}
              <div>
                <button
                  className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors font-medium disabled:bg-gray-400"
                  onClick={handleUpload}
                  disabled={!selectedFile || !documentType || isUploading}
                >
                  {isUploading ? 'Uploading...' : 'Upload Document'}
                </button>
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-4">
              <button
                className={`w-full sm:w-auto px-6 py-3 rounded-lg font-medium transition-colors ${uploadSuccess
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                onClick={handleRequestPermission}
                disabled={!uploadSuccess}
              >
                Submit Verification Request
              </button>
              {!uploadSuccess && (
                <p className="text-xs text-gray-500 mt-2">
                  Please upload a valid ID document first
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApprovalBody;