import { useEffect, useState } from 'react';
import { Film, Building, TrendingUp, RefreshCcw } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { adminService } from '@/services/adminService';
import { movieService } from '@/services/movieService';
import { showtimeService } from '@/services/showtimeService';
export default function AdminReportsPage() {
    const [movies, setMovies] = useState([]);
    const [halls, setHalls] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [weeklyRevenue, setWeeklyRevenue] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        fetchReportData();
    }, []);
    const fetchReportData = async () => {
        setLoading(true);
        try {
            const [stats, moviesData, hallsData, bookingsData] = await Promise.all([
                adminService.getDashboardStats(),
                movieService.getMovies(),
                showtimeService.getHalls(),
                adminService.getAllBookings(),
            ]);
            setMovies(moviesData);
            setHalls(hallsData);
            setBookings(bookingsData);
            setWeeklyRevenue(stats.weeklyRevenue);
        }
        catch (error) {
            console.error(error);
            toast.error('Error loading report data');
        }
        finally {
            setLoading(false);
        }
    };
    const today = new Date().toISOString().split('T')[0];
    const todayRevenue = bookings
        .filter(b => b.status === 'confirmed' && b.booking_date.startsWith(today))
        .reduce((sum, b) => sum + b.total_amount, 0);
    const currentMovies = movies.filter(m => m.is_now_showing);
    const activeHalls = halls.filter(h => h.is_active);
    if (loading) {
        return (<div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg"/>
      </div>);
    }
    const statCards = [
        {
            title: "Today's Revenue",
            value: `IDR ${todayRevenue.toLocaleString()}`,
            icon: TrendingUp,
            color: 'text-primary-400',
            bgColor: 'bg-primary-500/20'
        },
        {
            title: 'Now Showing Movies',
            value: currentMovies.length,
            icon: Film,
            color: 'text-blue-400',
            bgColor: 'bg-blue-500/20'
        },
        {
            title: 'Active Halls',
            value: activeHalls.length,
            icon: Building,
            color: 'text-green-400',
            bgColor: 'bg-green-500/20'
        }
    ];
    return (<div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Reports</h1>
          <p className="text-slate-400">Daily performance overview</p>
        </div>
        <button onClick={fetchReportData} className="btn btn-secondary flex items-center space-x-2">
          <RefreshCcw className="h-4 w-4"/>
          <span>Refresh</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (<div key={index} className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-white">
                    {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                  <Icon className={`h-6 w-6 ${stat.color}`}/>
                </div>
              </div>
            </div>);
        })}
      </div>

      <div className="card p-6 mt-6">
        <h2 className="text-xl font-bold mb-4">Weekly Revenue</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={weeklyRevenue} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155"/>
            <XAxis dataKey="date" stroke="#cbd5e1"/>
            <YAxis stroke="#cbd5e1"/>
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}/>
            <Bar dataKey="revenue" fill="#D70654"/>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>);
}
