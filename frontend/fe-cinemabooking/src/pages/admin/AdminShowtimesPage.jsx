import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Plus, Edit, Trash2, Calendar } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import toast from 'react-hot-toast';
import { movieService } from '@/services/movieService';
import { showtimeService } from '@/services/showtimeService';
import { bookingService } from '@/services/bookingService';
import { bioskopService } from '@/services/bioskopService';
const ShowtimeForm = ({ showtimeToEdit, onClose, onSave }) => {
    const [movies, setMovies] = useState([]);
    const [halls, setHalls] = useState([]);
    const [bioskop, setBioskop] = useState([]);
    const { register, handleSubmit, reset, formState: { errors, isSubmitting }, } = useForm();
    useEffect(() => {
        const fetchPrerequisites = async () => {
            try {
                const [moviesData, hallsData, bioskopData] = await Promise.all([
                    movieService.getMovies(),
                    showtimeService.getHalls(),
                    bioskopService.getBioskop(),
                ]);
                setMovies(moviesData);
                setHalls(hallsData);
                setBioskop(bioskopData);
            }
            catch {
                toast.error('Could not load movies or halls.');
            }
        };
        fetchPrerequisites();
    }, []);
    useEffect(() => {
        if (showtimeToEdit) {
            reset({
                movie_id: showtimeToEdit.movie._id,
                hall_id: showtimeToEdit.hall._id || '',
                bioskop_id: showtimeToEdit.bioskopId?._id || showtimeToEdit.bioskopId || '',
                show_date: new Date(showtimeToEdit.show_date).toISOString().split('T')[0],
                start_time: showtimeToEdit.start_time,
                end_time: showtimeToEdit.end_time,
                ticket_price: showtimeToEdit.ticket_price,
            });
        }
        else {
            reset();
        }
    }, [showtimeToEdit, reset]);
    const onSubmit = async (formData) => {
        try {
            const dataToSubmit = {
                movie: formData.movie_id,
                hallId: formData.hall_id,
                hallName: halls.find((hall) => hall._id === formData.hall_id)?.hall_name,
                bioskopId: formData.bioskop_id,
                show_date: formData.show_date,
                start_time: formData.start_time,
                end_time: formData.end_time,
                ticket_price: Number(formData.ticket_price),
            };
            if (showtimeToEdit) {
                await showtimeService.updateShowtime(showtimeToEdit._id, dataToSubmit);
            }
            else {
                await showtimeService.createShowtime(dataToSubmit);
            }
            toast.success(`Showtime ${showtimeToEdit ? 'updated' : 'added'} successfully!`);
            onSave();
        }
        catch (error) {
            toast.error(error.message);
        }
    };
    return (<div className="fixed inset-0 bg-dark-900/80 z-50 flex items-center justify-center p-4">
      <div className="card w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">&times;</button>
        <h2 className="text-2xl font-bold mb-6">{showtimeToEdit ? 'Edit Showtime' : 'Add New Showtime'}</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Movie</label>
              <select {...register('movie_id', { required: 'Movie is required' })} className="input">
                <option value="">Select a movie</option>
                {movies.map(movie => <option key={movie._id} value={movie._id}>{movie.title}</option>)}
              </select>
              {errors.movie_id && <p className="text-red-400 text-sm mt-1">{errors.movie_id.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Cinema</label>
              <select {...register('bioskop_id', { required: 'Cinema is required' })} className="input">
                <option value="">Select a cinema</option>
                {bioskop.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}
              </select>
              {errors.bioskop_id && <p className="text-red-400 text-sm mt-1">{errors.bioskop_id.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Hall</label>
              <select {...register('hall_id', { required: 'Hall is required' })} className="input">
                <option value="">Select a hall</option>
                {halls.map(hall => <option key={hall._id} value={hall._id}>{hall.hall_name}</option>)}
              </select>
              {errors.hall_id && <p className="text-red-400 text-sm mt-1">{errors.hall_id.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Show Date</label>
              <input type="date" {...register('show_date', { required: 'Show date is required' })} className="input"/>
              {errors.show_date && <p className="text-red-400 text-sm mt-1">{errors.show_date.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ticket Price (IDR)</label>
              <input type="number" {...register('ticket_price', { required: 'Price is required' })} className="input"/>
              {errors.ticket_price && <p className="text-red-400 text-sm mt-1">{errors.ticket_price.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Start Time</label>
              <input type="time" {...register('start_time', { required: 'Start time is required' })} className="input"/>
              {errors.start_time && <p className="text-red-400 text-sm mt-1">{errors.start_time.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Time</label>
              <input type="time" {...register('end_time', { required: 'End time is required' })} className="input"/>
              {errors.end_time && <p className="text-red-400 text-sm mt-1">{errors.end_time.message}</p>}
            </div>
          </div>
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary">
              {isSubmitting ? <LoadingSpinner size="sm"/> : 'Save Showtime'}
            </button>
          </div>
        </form>
      </div>
    </div>);
};
const DeleteConfirmationModal = ({ showtime, onClose, onConfirm }) => (<div className="fixed inset-0 bg-dark-900/80 z-50 flex items-center justify-center p-4">
    <div className="card p-6 w-full max-w-md">
      <h2 className="text-xl font-bold mb-4">Confirm Deletion</h2>
      <p className="text-slate-300 mb-6">
        Are you sure you want to delete the showtime for "<strong>{showtime.movie?.title}</strong>" on {new Date(showtime.show_date).toLocaleDateString()} at {showtime.start_time}?
      </p>
      <div className="flex justify-end space-x-4">
        <button onClick={onClose} className="btn btn-secondary">Cancel</button>
        <button onClick={() => onConfirm(showtime._id)} className="btn btn-danger">Delete Showtime</button>
      </div>
    </div>
  </div>);
export default function AdminShowtimesPage() {
    const [showtimes, setShowtimes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingShowtime, setEditingShowtime] = useState(null);
    const [showtimeToDelete, setShowtimeToDelete] = useState(null);
    const [searchParams, setSearchParams] = useSearchParams();
    const [movieFilter, setMovieFilter] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [seatCounts, setSeatCounts] = useState({});
    useEffect(() => {
        fetchShowtimes();
    }, []);
    const fetchShowtimes = async () => {
        setLoading(true);
        try {
            const data = await showtimeService.getShowtimes();
            setShowtimes(data || []);
            const counts = await Promise.all(data.map(async (showtime) => [showtime._id, (await bookingService.getSeatAvailability(showtime._id)).length]));
            setSeatCounts(Object.fromEntries(counts));
        }
        catch {
            toast.error('Failed to load showtimes');
        }
        finally {
            setLoading(false);
        }
    };
    const handleOpenModal = (showtime) => {
        setEditingShowtime(showtime);
        setIsModalOpen(true);
    };
    useEffect(() => {
        if (searchParams.get('openModal') === 'true') {
            handleOpenModal(null);
            searchParams.delete('openModal');
            setSearchParams(searchParams);
        }
    }, []);
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingShowtime(null);
    };
    const handleSave = () => {
        fetchShowtimes();
        handleCloseModal();
    };
    const handleConfirmDelete = async (showtimeId) => {
        try {
            await showtimeService.deleteShowtime(showtimeId);
            toast.success('Showtime deleted successfully');
            fetchShowtimes();
        }
        catch (error) {
            toast.error(error.message || 'Failed to delete showtime');
        }
        finally {
            setShowtimeToDelete(null);
        }
    };
    const filteredShowtimes = showtimes.filter((showtime) => {
        const matchesMovie = !movieFilter || showtime.movie?._id === movieFilter;
        const matchesDate = !dateFilter || showtime.show_date.startsWith(dateFilter);
        return matchesMovie && matchesDate;
    });
    if (loading) {
        return (<div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg"/>
      </div>);
    }
    return (<div className="space-y-6">
      {isModalOpen && <ShowtimeForm showtimeToEdit={editingShowtime} onClose={handleCloseModal} onSave={handleSave}/>}
      {showtimeToDelete && (<DeleteConfirmationModal showtime={showtimeToDelete} onClose={() => setShowtimeToDelete(null)} onConfirm={handleConfirmDelete}/>)}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Showtimes</h1>
          <p className="text-slate-400">Manage movie showtimes</p>
        </div>
        <button onClick={() => handleOpenModal(null)} className="btn btn-primary flex items-center space-x-2">
          <Plus className="h-5 w-5"/>
          <span>Add Showtime</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <select value={movieFilter} onChange={(event) => setMovieFilter(event.target.value)} className="input">
          <option value="">All Movies</option>
          {[...new Map(showtimes.map((showtime) => [showtime.movie?._id, showtime.movie])).values()].map((movie) => (<option key={movie?._id} value={movie?._id}>{movie?.title}</option>))}
        </select>
        <input type="date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} className="input"/>
      </div>

      {filteredShowtimes.length === 0 ? (<div className="text-center py-12 card">
          <Calendar className="h-16 w-16 text-slate-600 mx-auto mb-4"/>
          <p className="text-slate-400 text-lg mb-4">No showtimes found</p>
          <button onClick={() => handleOpenModal(null)} className="btn btn-primary">Add Your First Showtime</button>
        </div>) : (<div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Movie</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Hall</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Date & Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Seats</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-700">
                {filteredShowtimes.map((showtime) => (<tr key={showtime._id} className="hover:bg-dark-800/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white max-w-xs truncate">{showtime.movie?.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-500/20 text-blue-400 rounded-full">
                        {showtime.hall?.hall_name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                      <div>{new Date(showtime.show_date).toLocaleDateString()}</div>
                      <div className="text-slate-400">{showtime.start_time} - {showtime.end_time}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary-400">
                      IDR {showtime.ticket_price.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                      {seatCounts[showtime._id] || 0} booked / {Math.max(0, (showtime.hall.total_seats || 0) - (seatCounts[showtime._id] || 0))} available
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button onClick={() => handleOpenModal(showtime)} className="text-green-400 hover:text-green-300 p-2 rounded-full hover:bg-dark-700">
                          <Edit className="h-4 w-4"/>
                        </button>
                        <button onClick={() => setShowtimeToDelete(showtime)} className="text-red-400 hover:text-red-300 p-2 rounded-full hover:bg-dark-700">
                          <Trash2 className="h-4 w-4"/>
                        </button>
                      </div>
                    </td>
                  </tr>))}
              </tbody>
            </table>
          </div>
        </div>)}
    </div>);
}
