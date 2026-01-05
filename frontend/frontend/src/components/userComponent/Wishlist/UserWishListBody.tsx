import { useEffect, useState } from 'react';
import { X, Check, Heart, ArrowLeft, Trash2, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {  deleteAllWishlists, getWishlist, removeFromWishlist } from '../../../services/userServices';

export interface WishlistItem {
  _id: string;
  image: string;
  hostelname: string;
  category: string;
  price: number;
  hostel_id: string;
}

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlistData = async () => {
      try {
        setLoading(true);
        const response = await getWishlist();
        console.log(response.data.message, "message");
        const data = response.data.message; 
        const wishlistdata = data.map((datas: WishlistItem) => ({
          _id: datas._id,
          image: datas.image,
          hostelname: datas.hostelname,
          price: datas.price,
          category: datas.category,
          hostel_id: datas.hostel_id
        }));
        setWishlist(wishlistdata);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchWishlistData();
  }, []);

  const handleRemoveItem = async ({ hostel_id }: { hostel_id: string }) => {
    try {
      console.log(hostel_id, 'he');
      const response = await removeFromWishlist(hostel_id);
      console.log(response.data.message);
      if (response.data.message == 'Hostel Removed From Wishlist') {
        console.log("Removeddd");
        toast.success('Hostel Removed From Wishlist')
        
        setWishlist((prev) => prev.filter(item => item.hostel_id !== hostel_id));

      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleClearWishlist = async () => {
    try {
      const response = await deleteAllWishlists();
      console.log(response.data.message);
      if (response.data.message === 'Wishlist Deleted') {
        toast.success("Wishlist Cleared", {
          style: { backgroundColor: '#FFFFFF', color: '#31AFEF' }
        });
        
        setWishlist([])
      } else {
        toast.error(response.data.message, {
          style: { backgroundColor: '#FFFFFF', color: '#31AFEF' }
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center min-h-screen bg-gray-50">
      {/* Wishlist Content */}
      <div className="py-12 px-4 md:px-6 max-w-6xl mx-auto w-full">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Empty state */}
          {wishlist.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="bg-gray-100 rounded-full p-6 mb-6">
                <Heart className="h-12 w-12 text-gray-400" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-3">Your wishlist is empty</h2>
              <p className="text-gray-500 mb-8 max-w-md">No rooms have been added to your wishlist yet. Explore our hostels to find your perfect accommodation.</p>
              <a
                href="/hostel"
                className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition shadow-md hover:shadow-lg"
              >
                <ArrowLeft className="mr-2 h-5 w-5" />
                Browse Hostels
              </a>
            </div>
          ) : (
            <>
              {/* Table Header - Only visible on larger screens */}
              <div className="hidden md:grid md:grid-cols-12 bg-gray-50 py-4 px-6 text-sm font-medium text-gray-500 border-b">
                <div className="md:col-span-1"></div>
                <div className="md:col-span-2">Product</div>
                <div className="md:col-span-3">Name</div>
                <div className="md:col-span-2">Price</div>
                <div className="md:col-span-2">Availability</div>
                <div className="md:col-span-2 text-right">Actions</div>
              </div>

              {/* Wishlist Items */}
              <div className="divide-y divide-gray-100">
                {wishlist.map((item) => {
                  const hostel = item;
                  console.log(hostel.hostel_id, 'hello');
                  return (
                    <div key={hostel._id} className="group py-6 px-4 md:px-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-center hover:bg-gray-50 transition duration-150">
                      {/* Remove Button (Mobile: Top Right, Desktop: Left Column) */}
                      <div className="absolute top-3 right-3 md:static md:col-span-1 flex justify-center">
                        <button
                          onClick={() => handleRemoveItem({ hostel_id: hostel?.hostel_id })}
                          className="text-gray-400 hover:text-red-500 transition p-1 rounded-full hover:bg-red-50"
                          aria-label="Remove item"
                        >
                          <X size={20} />
                        </button>
                      </div>

                      {/* Product Image */}
                      <div className="md:col-span-2 flex justify-center md:justify-start">
                        <div className="h-24 w-24 md:h-20 md:w-20 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-white">
                          <img
                            src={`${hostel.image}`}
                            alt={hostel?.hostelname}
                            className="h-full w-full object-cover object-center"
                          />
                        </div>
                      </div>

                      {/* Product Details */}
                      <div className="md:col-span-3 text-center md:text-left">
                        <h3 className="text-lg font-medium text-gray-900 mb-1">{hostel?.hostelname}</h3>
                        <p className="text-sm text-gray-500">Category: {hostel?.category.toUpperCase()}</p>
                      </div>

                      {/* Price */}
                      <div className="md:col-span-2 text-center md:text-left">
                        <div className="flex flex-col md:flex-row md:items-center gap-1">
                          <span className="text-lg font-semibold text-gray-900">₹{hostel.price}</span>
                        </div>
                      </div>

                      {/* Stock Status */}
                      <div className="md:col-span-2 text-center md:text-left">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <Check size={14} className="mr-1" />
                          Active
                        </span>
                      </div>

                      {/* Action Button */}
                      <div className="md:col-span-2 flex justify-center md:justify-end gap-2">
                        <button
                          onClick={() => navigate(`/singlehostel/${hostel.hostel_id}`)}
                          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition shadow-sm hover:shadow"
                        >
                          <Eye/>
                          {/* <ShoppingCart size={16} className="mr-2" /> */}
                          <span className='ml-1'>View Hostel</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="p-6 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                <a
                  href="/hostel"
                  className="inline-flex items-center px-5 py-2.5 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition shadow-sm hover:shadow w-full sm:w-auto justify-center"
                >
                  <ArrowLeft size={16} className="mr-2" />
                  Continue to hostel Page
                </a>

                <button
                  onClick={handleClearWishlist}
                  className="inline-flex items-center px-5 py-2.5 bg-red-50 border border-red-200 text-red-600 text-sm font-medium rounded-lg hover:bg-red-100 transition shadow-sm hover:shadow w-full sm:w-auto justify-center"
                >
                  <Trash2 size={16} className="mr-2" />
                  Clear Wishlist
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}