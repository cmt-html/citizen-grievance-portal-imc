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

    const INDORE_SPOTS = [
        { name: 'Rajwada, Indore', lat: 22.7196, lng: 75.8577 },
        { name: 'Vijay Nagar, Indore', lat: 22.7533, lng: 75.8937 },
        { name: 'Palasia, Indore', lat: 22.7237, lng: 75.8824 },
        { name: 'Bhawarkua, Indore', lat: 22.6916, lng: 75.8676 },
        { name: 'Sudama Nagar, Indore', lat: 22.6986, lng: 75.8322 }
    ];

    const handleLocation = () => {
        if ("geolocation" in navigator) {
            setLoading(true);
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    let finalLat = position.coords.latitude;
                    let finalLng = position.coords.longitude;
                    
                    // POC Check: If outside Indore bounds, snap to a real Indore spot for testing
                    // Indore range approx: Lat 22.5 to 23.0, Lng 75.6 to 76.1
                    const isInIndore = finalLat > 22.5 && finalLat < 23.0 && finalLng > 75.6 && finalLng < 76.1;
                    
                    if (!isInIndore) {
                        const spot = INDORE_SPOTS[Math.floor(Math.random() * INDORE_SPOTS.length)];
                        finalLat = spot.lat;
                        finalLng = spot.lng;
                        console.log("📍 Outside Indore. Snapping to test spot:", spot.name);
                    }

                    try {
                        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${finalLat}&lon=${finalLng}`);
                        const data = await response.json();
                        const realAddress = data.display_name || "Indore, Madhya Pradesh";
                        // Clean up address (take first few parts)
                        const shortAddress = realAddress.split(',').slice(0, 3).join(',') + ", Indore";

                        setFormData(prev => ({
                            ...prev, 
                            lat: finalLat, 
                            lng: finalLng,
                            address: shortAddress
                        }));
                    } catch (err) {
                        // Fallback if API fails
                        setFormData(prev => ({
                            ...prev, 
                            lat: finalLat, 
                            lng: finalLng,
                            address: "Indore (GPS Location)"
                        }));
                    } finally {
                        setLoading(false);
                    }
                },
                (error) => {
                    alert("Please allow location access. Using a default Indore location for POC.");
                    const spot = INDORE_SPOTS[0];
                    setFormData(prev => ({ ...prev, lat: spot.lat, lng: spot.lng, address: spot.name }));
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
