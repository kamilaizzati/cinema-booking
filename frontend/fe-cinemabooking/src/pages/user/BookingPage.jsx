import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Armchair, CalendarDays, Clock, MapPin, X } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import toast from 'react-hot-toast';
import BookingProgress from '@/components/BookingProgress';
import { movieService } from '@/services/movieService';
import { showtimeService } from '@/services/showtimeService';
import { bookingService } from '@/services/bookingService';
export default function BookingPage() {
    const { movieId } = useParams();
    const { showtimeId } = useParams();
    const navigate = useNavigate();
    const [movie, setMovie] = useState(null);
    const [showtimes, setShowtimes] = useState([]);
    const [selectedShowtime, setSelectedShowtime] = useState(null);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [occupiedSeats, setOccupiedSeats] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        if (showtimeId) {
            fetchFromShowtime(showtimeId);
        }
        else if (movieId) {
            fetchMovieAndShowtimes(movieId);
        }
    }, [movieId, showtimeId]);
    useEffect(() => {
        if (selectedShowtime) {
            fetchOccupiedSeats(selectedShowtime._id);
        }
    }, [selectedShowtime]);
    const fetchMovieAndShowtimes = async (id) => {
        try {
            const [movieData, showtimesData] = await Promise.all([
                movieService.getMovieById(id),
                showtimeService.getMovieShowtimes(id)
            ]);
            setMovie(movieData);
            setShowtimes(showtimesData || []);
        }
        catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load movie details');
        }
        finally {
            setLoading(false);
        }
    };
    const fetchFromShowtime = async (id) => {
        try {
            const showtime = await showtimeService.getShowtimeById(id);
            const showtimesData = await showtimeService.getMovieShowtimes(showtime.movie._id);
            setMovie(showtime.movie);
            setShowtimes(showtimesData);
            setSelectedShowtime(showtime);
        }
        catch (error) {
            console.error('Error fetching showtime:', error);
            toast.error('Failed to load showtime details');
        }
        finally {
            setLoading(false);
        }
    };
    const fetchOccupiedSeats = async (showtimeId) => {
        try {
            const data = await bookingService.getSeatAvailability(showtimeId);
            setOccupiedSeats(data);
        }
        catch (error) {
            console.error("Error fetching occupied seats:", error);
            toast.error("Could not load seat information.");
        }
    };
    const generateSeats = () => {
        const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
        const seatsPerRow = 10;
        const seats = [];
        for (const row of rows) {
            for (let i = 1; i <= seatsPerRow; i++) {
                const seatId = `${row}${i}`;
                const isOccupied = occupiedSeats.includes(seatId);
                seats.push({
                    id: seatId,
                    row,
                    category: row === 'H' || row === 'I' ? 'premiere' : row === 'J' ? 'couple' : 'regular',
                    isOccupied,
                });
            }
        }
        return seats;
    };
    const handleSeatClick = (seatId) => {
        if (occupiedSeats.includes(seatId))
            return;
        setSelectedSeats(prev => prev.includes(seatId)
            ? prev.filter(s => s !== seatId)
            : [...prev, seatId]);
    };
    const handleProceedToPayment = () => {
        if (!selectedShowtime || selectedSeats.length === 0) {
            toast.error('Please select a showtime and at least one seat');
            return;
        }
        const selectionData = {
            movieId: movie?._id || movieId,
            showtimeId: selectedShowtime._id,
            selectedSeats,
            totalAmount: selectedSeats.length * selectedShowtime.ticket_price
        };
        sessionStorage.setItem('seatSelection', JSON.stringify(selectionData));
        navigate('/payment');
    };
    if (loading || !movie) {
        return (<div className="min-h-screen flex items-center justify-center bg-dark-900">
        <LoadingSpinner size="lg"/>
      </div>);
    }
    return (<div className="min-h-screen bg-dark-950 text-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-dark-950/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link to="/movies" className="btn btn-secondary flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4"/>
            <span>Back</span>
          </Link>
          <BookingProgress currentStep="selection"/>
          <div></div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex flex-col gap-6 rounded-lg border border-white/10 bg-dark-900/70 p-4 sm:flex-row sm:items-center">
          <img src={movie.poster_url} alt={movie.title} className="w-24 rounded-md shadow-lg sm:w-28"/>
          <div>
            <p className="section-eyebrow mb-2">Reserve seats</p>
            <h1 className="text-3xl font-bold font-display">{movie.title}</h1>
            <p className="text-slate-400">{movie.genre} • {movie.duration} minutes • {movie.classification || 'All audience'}</p>
          </div>
        </div>
        
        <div className="cinema-panel mb-8 p-5">
            <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <p className="section-eyebrow mb-2">Schedule</p>
                <h2 className="text-xl font-semibold">Choose Date & Time</h2>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <MapPin className="h-4 w-4 text-accent-400"/>
                CinemaID Grand Indonesia
              </div>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-1">
            {showtimes.map((showtime) => (<button key={showtime._id} className={`min-w-44 rounded-lg border p-4 text-left transition ${selectedShowtime?._id === showtime._id
                ? 'border-primary-500 bg-primary-600 text-white'
                : 'border-white/10 bg-dark-950 text-slate-200 hover:border-primary-500/60'}`} onClick={() => {
                setSelectedShowtime(showtime);
                setSelectedSeats([]);
            }}>
                    <span className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide opacity-75">
                      <CalendarDays className="h-4 w-4"/>
                      {new Date(showtime.show_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                    <span className="block text-2xl font-black">{showtime.start_time}</span>
                    <span className="mt-1 flex items-center gap-2 text-sm opacity-80">
                      <Clock className="h-4 w-4"/>
                      {showtime.hall.hall_name}
                    </span>
                </button>))}
            </div>
        </div>

        {selectedShowtime && (<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 cinema-panel p-4 sm:p-6">
              <div className="mx-auto mb-10 max-w-3xl">
                <div className="h-10 rounded-t-full border-t-4 border-accent-300 bg-gradient-to-b from-accent-400/30 to-transparent text-center text-xs font-bold uppercase tracking-[0.35em] text-accent-200">
                  Screen
                </div>
              </div>
              <div className="mx-auto mb-6 max-w-3xl space-y-2 overflow-x-auto pb-2">
                  {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].map((row) => (<div key={row} className="grid min-w-[430px] grid-cols-[24px_repeat(10,1fr)_24px] items-center gap-2">
                      <span className="text-center text-xs font-bold text-slate-500">{row}</span>
                      {generateSeats().filter((seat) => seat.row === row).map((seat) => (<button key={seat.id} onClick={() => handleSeatClick(seat.id)} disabled={seat.isOccupied} className={`seat mx-auto ${seat.isOccupied
                        ? 'seat-occupied'
                        : selectedSeats.includes(seat.id)
                            ? 'seat-selected'
                            : seat.category === 'premiere' || seat.category === 'couple'
                                ? 'seat-premiere'
                                : 'seat-available'}`} aria-label={`Seat ${seat.id}`}>
                          {seat.id.replace(row, '')}
                        </button>))}
                      <span className="text-center text-xs font-bold text-slate-500">{row}</span>
                    </div>))}
              </div>
               <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-300">
                  <div className="flex items-center space-x-2"><div className="seat seat-available h-4 w-4"></div><span>Regular</span></div>
                  <div className="flex items-center space-x-2"><div className="seat seat-premiere h-4 w-4"></div><span>Premiere</span></div>
                  <div className="flex items-center space-x-2"><div className="seat seat-selected h-4 w-4"></div><span>Selected</span></div>
                  <div className="flex items-center space-x-2"><div className="seat seat-occupied h-4 w-4"></div><span>Occupied</span></div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="cinema-panel sticky top-24 p-6">
                <p className="section-eyebrow mb-2">Order</p>
                <h3 className="text-xl font-semibold mb-4">Booking Summary</h3>
                <div className="mb-5 rounded-md bg-dark-950 p-4 text-sm text-slate-300">
                  <div className="mb-2 flex justify-between"><span>Studio</span><span className="font-semibold text-white">{selectedShowtime.hall.hall_name}</span></div>
                  <div className="mb-2 flex justify-between"><span>Date</span><span className="font-semibold text-white">{new Date(selectedShowtime.show_date).toLocaleDateString()}</span></div>
                  <div className="flex justify-between"><span>Time</span><span className="font-semibold text-white">{selectedShowtime.start_time}</span></div>
                </div>
                <ul className="mb-4 max-h-44 space-y-2 overflow-y-auto">
                  {selectedSeats.map(seat => (<li key={seat} className="flex items-center justify-between rounded-md bg-white/5 px-3 py-2">
                      <span className="inline-flex items-center gap-2"><Armchair className="h-4 w-4 text-accent-400"/> Seat {seat}</span>
                      <button onClick={() => handleSeatClick(seat)} className="text-slate-400 hover:text-white" aria-label={`Remove seat ${seat}`}>
                        <X className="h-4 w-4"/>
                      </button>
                    </li>))}
                  {selectedSeats.length === 0 && <p className="text-slate-400">No seats selected.</p>}
                </ul>
                <div className="border-t border-dark-700 pt-4">
                    <div className="mb-2 flex justify-between text-sm text-slate-400">
                      <span>{selectedSeats.length} ticket(s)</span>
                      <span>IDR {selectedShowtime.ticket_price.toLocaleString()} each</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span className="text-accent-300">IDR {(selectedSeats.length * selectedShowtime.ticket_price).toLocaleString()}</span>
                    </div>
                </div>
                <button onClick={handleProceedToPayment} disabled={selectedSeats.length === 0} className="btn btn-primary w-full mt-6 py-3 text-lg">
                  Continue to Payment
                </button>
              </div>
            </div>
          </div>)}
      </main>
    </div>);
}
