'use client';
import { useState } from 'react';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';

export default function NewComplaint() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'Sanitation',
        lat: '',
        lng: '',
        address: ''
    });
    const [image, setImage] = useState(null);
    const [video, setVideo] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleLocation = () => {
        if ("geolocation" in navigator) {
            setLoading(true);
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    // Simulated reverse geocoding for POC (Indore areas)
                    setTimeout(() => {
                        const areas = ["Vijay Nagar, Indore", "Palasia, Indore", "Rajwada, Indore", "Bhawarkua, Indore", "Sudama Nagar, Indore"];
                        const randomArea = areas[Math.floor(Math.random() * areas.length)];
                        
                        setFormData(prev => ({
                            ...prev, 
                            lat: position.coords.latitude, 
                            lng: position.coords.longitude,
                            address: randomArea
                        }));
                        setLoading(false);
                    }, 800);
                },
                (error) => {
                    alert("Please allow location access to auto-fill GPS coordinates.");
                    setLoading(false);
                }
            );
        } else {
            alert("Geolocation IS NOT available in your browser.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.lat) return alert('Location is required!');
        
        setLoading(true);
        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        if (image) data.append('image', image);
        if (video) data.append('video', video);

        try {
            await api.post('/complaints', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            router.push('/citizen/dashboard');
        } catch (error) {
            alert('Error submitting complaint: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="hero-gradient min-h-screen py-10 px-4">
            <div className="container max-w-4xl mx-auto panel p-8 md:p-10">
                <span className="soft-badge">Citizen Complaint Module</span>
                <h1 className="section-title mt-4 mb-2">Report a Civic Issue</h1>
                <p className="text-sm text-slate-600 mb-6">Add title, description, media evidence and geo-location to register your grievance.</p>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Issue Title</label>
                        <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="mt-1 w-full p-2.5 border border-slate-300 rounded-lg" placeholder="Brief summary of the issue"/>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700">Category</label>
                        <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="mt-1 w-full p-2.5 border border-slate-300 rounded-lg bg-white">
                            <option>Sanitation</option>
                            <option>Traffic</option>
                            <option>Police</option>
                            <option>Civic Infrastructure</option>
                            <option>Others</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700">Detailed Description</label>
                        <textarea required rows="4" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="mt-1 w-full p-2.5 border border-slate-300 rounded-lg" placeholder="Describe the issue in detail..."></textarea>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Location & Geo-tagging</label>
                            <button type="button" onClick={handleLocation} disabled={loading} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 flex justify-center items-center rounded-lg border border-slate-300 transition text-sm disabled:opacity-50">
                                {loading && !formData.lat ? 'Fetching Location...' : '📍 Capture Current Location'}
                            </button>
                            {formData.lat && (
                                <div className="mt-2 text-xs text-emerald-700 font-medium bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                                    <p>Area: <strong>{formData.address}</strong></p>
                                    <p className="opacity-70 mt-0.5">GPS: {formData.lat.toFixed(4)}, {formData.lng.toFixed(4)}</p>
                                </div>
                            )}
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Evidence (Image / Camera)</label>
                            <input type="file" accept="image/*" capture="environment" onChange={e => setImage(e.target.files[0])} className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border border-slate-300 rounded-lg"/>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Optional Video Evidence (Camera)</label>
                        <input type="file" accept="video/*" capture="environment" onChange={e => setVideo(e.target.files[0])} className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 border border-slate-300 rounded-lg"/>
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition shadow disabled:opacity-70">
                            {loading ? 'Submitting...' : 'Submit Complaint'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
