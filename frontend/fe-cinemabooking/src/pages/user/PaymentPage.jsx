import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, CreditCard, Landmark, QrCode, ShieldCheck, Wallet } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';
import toast from 'react-hot-toast';
import BookingProgress from '@/components/BookingProgress';
import { movieService } from '@/services/movieService';
import { showtimeService } from '@/services/showtimeService';
import { bookingService } from '@/services/bookingService';
import { transactionService } from '@/services/transactionService';
export default function PaymentPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [bookingData, setBookingData] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('qris');
    const { register, handleSubmit, } = useForm();
    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
        loadBookingData();
    }, []);
    const loadBookingData = async () => {
        try {
            const selectionData = sessionStorage.getItem('seatSelection');
            if (!selectionData) {
                toast.error('No booking data found');
                navigate('/movies');
                return;
            }
            const selection = JSON.parse(selectionData);
            const [movieData, showtimeData] = await Promise.all([
                movieService.getMovieById(selection.movieId),
                showtimeService.getShowtimeById(selection.showtimeId)
            ]);
            setBookingData({
                movie: movieData,
                showtime: showtimeData,
                selection
            });
        }
        catch (error) {
            console.error('Error loading booking data:', error);
            toast.error('Failed to load booking data');
            navigate('/movies');
        }
        finally {
            setLoading(false);
        }
    };
    const onSubmit = async (_data) => {
        if (!bookingData || !user)
            return;
        setLoading(true);
        try {
            const bookingPayload = {
                user: user.id,
                movieId: bookingData.movie._id,
                showtime: bookingData.selection.showtimeId,
                total_seats: bookingData.selection.selectedSeats.length,
                total_amount: bookingData.selection.totalAmount,
                selected_seats: bookingData.selection.selectedSeats,
            };
            const booking = await bookingService.createBooking(bookingPayload);
            const paymentMethods = {
                qris: 'QRIS',
                wallet: 'E-wallet',
                va: 'Virtual Account',
                card: 'Credit Card',
            };
            await transactionService.createTransaction({
                bookingId: booking._id,
                amount: booking.total_amount,
                paymentMethod: paymentMethods[paymentMethod],
            });
            sessionStorage.removeItem('seatSelection');
            toast.success('Booking and payment request created!');
            navigate('/booking-confirmation');
        }
        catch (error) {
            console.error('Error processing booking:', error);
            toast.error('Booking failed. Please try again.');
        }
        finally {
            setLoading(false);
        }
    };
    if (loading || !bookingData) {
        return (<div className="min-h-screen flex items-center justify-center bg-dark-900">
        <LoadingSpinner size="lg"/>
      </div>);
    }
    const { movie, showtime, selection } = bookingData;
    return (<div className="min-h-screen bg-dark-950 text-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-dark-950/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <button onClick={() => navigate(-1)} className="btn btn-secondary flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4"/>
            <span>Back</span>
          </button>
          <BookingProgress currentStep="payment"/>
          <div></div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <p className="section-eyebrow mb-2">Checkout</p>
          <h1 className="text-3xl font-bold font-display">Complete Payment</h1>
          <p className="mt-2 text-slate-400">Choose a secure payment method and confirm your e-ticket.</p>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-[1.1fr_0.9fr]">
          {/* Payment Form */}
          <div className="cinema-panel p-6">
            <h2 className="text-2xl font-bold mb-6">Payment Method</h2>
            <div className="mb-6 grid grid-cols-2 gap-3">
              {[
            { id: 'qris', label: 'QRIS', icon: QrCode },
            { id: 'wallet', label: 'E-wallet', icon: Wallet },
            { id: 'va', label: 'Virtual Account', icon: Landmark },
            { id: 'card', label: 'Credit Card', icon: CreditCard },
        ].map((method) => {
            const Icon = method.icon;
            const active = paymentMethod === method.id;
            return (<button key={method.id} type="button" onClick={() => setPaymentMethod(method.id)} className={`rounded-lg border p-4 text-left transition ${active ? 'border-primary-500 bg-primary-500/15 text-white' : 'border-white/10 bg-dark-950 text-slate-300 hover:border-white/30'}`}>
                    <Icon className="mb-3 h-5 w-5 text-accent-400"/>
                    <span className="font-semibold">{method.label}</span>
                  </button>);
        })}
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {paymentMethod === 'card' ? (<>
                  <div>
                    <label className="block text-sm font-medium mb-1">Card Holder Name</label>
                    <input {...register('cardHolder', { required: true })} className="input"/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Card Number</label>
                    <input {...register('cardNumber', { required: true })} className="input" placeholder="0000 0000 0000 0000"/>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-1">Expiry Date</label>
                      <input {...register('expiryDate', { required: true })} className="input" placeholder="MM/YY"/>
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-1">CVV</label>
                      <input {...register('cvv', { required: true })} className="input" placeholder="123"/>
                    </div>
                  </div>
                </>) : (<div className="rounded-lg border border-dashed border-white/15 bg-dark-950 p-6 text-center">
                  {paymentMethod === 'qris' && (<>
                      <div className="mx-auto mb-4 grid h-40 w-40 grid-cols-5 gap-1 rounded-lg bg-white p-3">
                        {Array.from({ length: 25 }).map((_, index) => (<span key={index} className={`${index % 3 === 0 || index % 7 === 0 ? 'bg-dark-950' : 'bg-slate-200'} rounded-sm`}/>))}
                      </div>
                      <h3 className="font-semibold">Scan QRIS to Pay</h3>
                      <p className="mt-2 text-sm text-slate-400">Use your banking app or e-wallet. This demo confirms after you press the button below.</p>
                    </>)}
                  {paymentMethod === 'wallet' && (<>
                      <Wallet className="mx-auto mb-4 h-12 w-12 text-accent-400"/>
                      <h3 className="font-semibold">Choose E-wallet</h3>
                      <p className="mt-2 text-sm text-slate-400">Supports GoPay, OVO, DANA, and ShopeePay in a real integration.</p>
                    </>)}
                  {paymentMethod === 'va' && (<>
                      <Landmark className="mx-auto mb-4 h-12 w-12 text-accent-400"/>
                      <h3 className="font-semibold">Virtual Account</h3>
                      <p className="mt-2 text-sm text-slate-400">A payment code will be generated after confirmation in a real checkout.</p>
                    </>)}
                </div>)}
              <div className="flex items-center gap-2 rounded-md bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
                <ShieldCheck className="h-4 w-4"/>
                Payment is protected by encrypted checkout simulation.
              </div>
            </form>
          </div>

          {/* Booking Summary */}
          <div className="cinema-panel p-6">
            <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <img src={movie.poster_url} alt={movie.title} className="w-20 rounded-lg"/>
                <div>
                  <h3 className="font-semibold text-lg">{movie.title}</h3>
                  <p className="text-sm text-slate-400">{showtime.hall.hall_name}</p>
                </div>
              </div>
              <div className="border-t border-dark-700 pt-4 space-y-2">
                <div className="flex justify-between"><span className="text-slate-400">Date</span><span>{new Date(showtime.show_date).toLocaleDateString()}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Time</span><span>{showtime.start_time}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Seats</span><span>{selection.selectedSeats.join(', ')}</span></div>
              </div>
              <div className="border-t border-dark-700 pt-4">
                <div className="flex justify-between font-bold text-xl">
                    <span>Total</span>
                    <span>IDR {selection.totalAmount.toLocaleString()}</span>
                </div>
              </div>
              <button onClick={handleSubmit(onSubmit)} disabled={loading} className="btn btn-primary w-full text-lg mt-4 py-3">
                {loading ? <LoadingSpinner size="sm"/> : 'Confirm and Pay'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>);
}
