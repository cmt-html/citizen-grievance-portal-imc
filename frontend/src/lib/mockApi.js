import axios from 'axios';

// Utility to mock the response
const mockResponse = (status, data) => Promise.resolve({
    data,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    headers: {},
    config: {},
    request: {}
});

// Utility to simulate network delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const setupMockAdapter = (api) => {
    // Keep the original adapter so we can fallback if not mocked
    const originalAdapter = api.defaults.adapter;

    api.defaults.adapter = async (config) => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        
        // ONLY mock if it's demo-token or if it's the POC local environment.
        // For this POC requested by user, we mock EVERYTHING to ensure "perfect flow".
        
        const method = config.method.toLowerCase();
        const url = config.url;

        // Give a slight delay to feel realistic
        await delay(400);

        // 1. Auth Login / Register
        if (url.includes('/auth/login') || url.includes('/auth/register')) {
            const body = JSON.parse(config.data);
            const userRole = body.role || 'citizen';
            return mockResponse(200, {
                token: 'demo-token',
                user: {
                    _id: `mock-user-${Date.now()}`,
                    name: body.name || 'Demo Citizen',
                    mobileNumber: body.mobileNumber,
                    role: userRole,
                    departmentType: body.departmentType || '',
                    zone: body.zone || ''
                }
            });
        }

        if (url.includes('/auth/send-otp')) {
            return mockResponse(200, { message: 'OTP Sent', demoOtp: '1234' });
        }

        // 2. Submit Complaint
        if (method === 'post' && url.includes('/complaints')) {
            let title = 'N/A', category = 'N/A';
            if (config.data instanceof FormData) {
                title = config.data.get('title') || 'N/A';
                category = config.data.get('category') || 'N/A';
            } else if (config.data) {
                const parsed = JSON.parse(config.data);
                title = parsed.title;
                category = parsed.category;
            }

            const localComplaints = JSON.parse(localStorage.getItem('demoComplaints') || '[]');
            const newComplaint = {
                _id: `local-${Date.now()}`,
                complaintId: `CMP-DEMO-${Date.now().toString().slice(-6)}`,
                title,
                category,
                status: 'Submitted',
                assignedToDepartment: 'Pending Allocation',
                assignedToZone: 'Unassigned',
                escalationLevel: 0,
                createdAt: new Date().toISOString()
            };
            localComplaints.unshift(newComplaint);
            localStorage.setItem('demoComplaints', JSON.stringify(localComplaints));
            
            return mockResponse(200, {
                message: 'Complaint created successfully',
                complaint: newComplaint
            });
        }

        // 3. Get Complaints
        if (method === 'get' && url.includes('/complaints/my-history')) {
            const localComplaints = JSON.parse(localStorage.getItem('demoComplaints') || '[]');
            return mockResponse(200, localComplaints);
        }

        if (method === 'get' && url.includes('/complaints/all')) {
            const localComplaints = JSON.parse(localStorage.getItem('demoComplaints') || '[]');
            return mockResponse(200, localComplaints);
        }

        // 4. Update Actions / Feedback
        if (method === 'put' && url.match(/\/complaints\/.*\/feedback/)) {
            return mockResponse(200, { message: 'Feedback submitted' });
        }

        if (method === 'put' && url.match(/\/complaints\/.*\/status/)) {
            const body = JSON.parse(config.data);
            const id = url.split('/')[2];
            const localComplaints = JSON.parse(localStorage.getItem('demoComplaints') || '[]');
            const idx = localComplaints.findIndex(c => c.complaintId === id);
            if(idx > -1) {
                localComplaints[idx].status = body.status;
                localStorage.setItem('demoComplaints', JSON.stringify(localComplaints));
            }
            return mockResponse(200, { message: 'Status updated' });
        }

        if (method === 'put' && url.match(/\/complaints\/.*\/decision/)) {
            return mockResponse(200, { message: 'Decision recorded' });
        }

        // 5. Admin/Dept Dashboards
        if (url.includes('/dashboard-metrics')) {
            const localComplaints = JSON.parse(localStorage.getItem('demoComplaints') || '[]');
            return mockResponse(200, {
                total: localComplaints.length > 0 ? localComplaints.length : 12,
                pending: localComplaints.filter(c => c.status !== 'Resolved').length || 4,
                resolved: localComplaints.filter(c => c.status === 'Resolved').length || 8,
                slaBreached: 1
            });
        }

        if (url.includes('/reports/summary')) {
            return mockResponse(200, {
                byDepartment: { "Sanitation": 5, "Traffic": 2, "Water": 3 },
                byCategory: { "Garbage": 4, "Streetlight": 2, "Pothole": 4 }
            });
        }

        if (url.includes('/master-config')) {
            return mockResponse(200, {
                departments: ["Sanitation Dept", "Roads Dept", "Water Dept"],
                zones: ["Zone 1", "Zone 2", "Zone 3", "Zone 4"]
            });
        }

        // Return a mock 404 for anything else
        return Promise.reject({
            response: { status: 404, data: { message: 'MOCK API Route Not Found' } }
        });
    };
};

export default setupMockAdapter;
