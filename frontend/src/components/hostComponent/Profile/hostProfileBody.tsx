import  { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getHost, getwalletDetails } from '../../../services/hostServices';

const UserProfileBody = () => {

  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [balance, setBalance] = useState(0)
  const [id, setId] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getHost();
        const walletDetails = await getwalletDetails();
        console.log(walletDetails.data.message,'hello')

        setId(response.data.message._id)
        setBalance(walletDetails?.data?.message?.balance)
        setName(response.data.message.name);
        setEmail(response.data.message.email)
        console.log(balance,'balance')
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };

    fetchData();
  }, []);

  const navigateToShowBooking = () => {
    navigate(`/host/showbookings/${id}`)
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          width: '100%',
        }}
      >
        {/* Profile Header */}
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '20px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '20px',
            }}
          >
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: '#e0e0e0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ fontSize: '40px' }}>👤</span>
            </div>
            <div>
              <h2 style={{ margin: '0', fontSize: '24px' }}>{name}</h2>
              <p style={{ margin: '5px 0 0 0', color: '#666' }}>
                {email}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
          }}
        >
          {/* Change Password */}
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '20px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              cursor: 'pointer',
              transition: 'transform 0.2s',
            }}
            onClick={() => navigate('/host/changepassword')}
            onMouseOver={(e) =>
              (e.currentTarget.style.transform = 'translateY(-5px)')
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.transform = 'translateY(0)')
            }
          >
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <div style={{ fontSize: '24px', marginBottom: '10px' }}>🔑</div>
              <div style={{ fontWeight: 'bold' }}>Change Password</div>
            </div>
          </div>

          {/* Edit Profile */}
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '20px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              cursor: 'pointer',
              transition: 'transform 0.2s',
            }}
            onClick={() => navigate('/host/editprofile')}
            onMouseOver={(e) =>
              (e.currentTarget.style.transform = 'translateY(-5px)')
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.transform = 'translateY(0)')
            }
          >
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <div style={{ fontSize: '24px', marginBottom: '10px' }}>✏️</div>
              <div style={{ fontWeight: 'bold' }}>Edit Profile</div>
            </div>
          </div>

          {/* Show Bookings */}
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '20px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              cursor: 'pointer',
              transition: 'transform 0.2s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.transform = 'translateY(-5px)')}
            onMouseOut={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <div style={{ fontSize: '24px', marginBottom: '10px' }}>📚</div>
              <div
                onClick={navigateToShowBooking}
                style={{ fontWeight: 'bold', cursor: 'pointer' }}
              >
                Show Bookings
              </div>
            </div>
          </div>


          {/* Wallet */}
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '20px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              cursor: 'pointer',
              transition: 'transform 0.2s',
            }}
            onClick={() => navigate('/host/wallet')}
            onMouseOver={(e) =>
              (e.currentTarget.style.transform = 'translateY(-5px)')
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.transform = 'translateY(0)')
            }
          >
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <div style={{ fontSize: '24px', marginBottom: '10px' }}>💰</div>
              <div style={{ fontWeight: 'bold' }}>Wallet</div>
              <div
                style={{
                  color: '#666',
                  fontSize: '14px',
                  marginTop: '5px',
                }}
              >
                Balance: ₹{balance??'0'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileBody;
