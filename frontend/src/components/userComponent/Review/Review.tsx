import { useEffect, useState } from "react";
import { Star, StarHalf, ClipboardX } from "lucide-react";
import { useParams } from "react-router-dom";
import { getReviewDetails } from "../../../hooks/userHooks";


interface IReview {
  id: string;
  userId: User;
  email: string;
  rating: number;
  review: string;
  date: string;
  _id: string;
  createdAt: string;
}

interface User {
  name: string;
  password: string;
  number: string;
  email: string;
}

const UserReviews = () => {
  const { id } = useParams();
  const [reviews, setReviews] = useState([]);
  const [loading,setLoading] = useState(true)

  useEffect(() => {
    const fetchReviewData = async () => {
      try {
        if(!id) return;
        const response = await getReviewDetails(id);
        const data = response.data.message;
        setLoading(false)
        setReviews(data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchReviewData();
  }, []);

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={`full-${i}`} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <StarHalf key="half" className="w-5 h-5 fill-yellow-400 text-yellow-400" />
      );
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-5 h-5 text-gray-300" />);
    }

    return stars;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="relative w-16 h-16">
          {/* Outer circle */}
          <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
          {/* Spinning arc */}
          <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="max-w-3xl mx-auto p-4">
        <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
        <div className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-8">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-blue-100 rounded-full opacity-50" />
          <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-32 h-32 bg-purple-100 rounded-full opacity-50" />
          
          <div className="relative flex flex-col items-center text-center space-y-6">
            <div className="bg-white p-4 rounded-full shadow-md">
              <ClipboardX className="w-12 h-12 text-purple-500" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                No Reviews Available
              </h3>
              <p className="text-gray-600 max-w-md">
                This hostel hasn't received any reviews yet. Share your experience and help others make informed decisions.
              </p>
            </div>

            <div className="flex flex-col items-center space-y-2">
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    className="w-6 h-6 text-gray-200 transition-colors duration-300 hover:text-yellow-400"
                  />
                ))}
              </div>
              {/* <span className="text-sm text-gray-500">Be the first to rate this product</span> */}
            </div>

            {/* <button className="mt-4 px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full font-medium shadow-md hover:shadow-lg transition-shadow">
              Write a Review
            </button> */}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>

      {reviews.map((review: IReview) => (
        <div key={review._id} className="border rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">{review?.userId?.name}</h3>
                <p className="text-sm text-gray-500">{review?.userId?.email}</p>
              </div>
              <span className="text-sm text-gray-500">
                {new Date(review?.createdAt).toLocaleDateString()}
              </span>
            </div>

            <div className="flex items-center space-x-1">
              {renderStars(review.rating)}
              <span className="ml-2 text-sm text-gray-600">({review.rating})</span>
            </div>

            <p className="mt-2 text-gray-700">{review.review}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserReviews;