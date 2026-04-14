const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Complaint = require('./models/Complaint');
const connectDB = require('./config/db');

dotenv.config();

const users = [
    {
        name: 'Citizen John Doe',
        mobileNumber: '9999999991',
        email: 'john@example.com',
        address: 'Downtown Avenue',
        role: 'citizen'
    },
    {
        name: 'Sanitation Dept Lead',
        mobileNumber: '8888888881',
        email: 'sanitation@city.gov',
        role: 'department',
        departmentType: 'Sanitation'
    },
    {
        name: 'Super Admin',
        mobileNumber: '7777777771',
        email: 'admin@city.gov',
        role: 'admin'
    }
];

const seedData = async () => {
    try {
        await connectDB();
        
        // Clear Existing Data
        await User.deleteMany();
        await Complaint.deleteMany();
        
        console.log('Previous Data Cleared.');

        // Insert Users
        const createdUsers = await User.insertMany(users);
        console.log('Seed Users Inserted:');
        createdUsers.forEach(u => console.log(`- ${u.name} (Mobile: ${u.mobileNumber}, Role: ${u.role})`));

        // Find specific users for relation
        const citizen = createdUsers.find(u => u.role === 'citizen');

        const complaints = [
            {
                user: citizen._id,
                title: 'Garbage pile up near Main Street',
                description: 'The garbage bins have overflowed and it has been stinking the entire block for 3 days.',
                category: 'Sanitation',
                media: {
                    image: '/uploads/sample-sanitation.jpg'
                },
                location: {
                    lat: 18.5204,
                    lng: 73.8567,
                    address: 'Main Street Corner'
                },
                status: 'Submitted',
                assignedToDepartment: 'Municipal Solid Waste'
            },
            {
                user: citizen._id,
                title: 'Broken Streetlight causing accidents',
                description: 'The streetlight at junction cross is missing, low visibility at night.',
                category: 'Civic Infrastructure',
                media: {
                    image: '/uploads/sample-infrastructure.jpg'
                },
                location: {
                    lat: 18.5222,
                    lng: 73.8511,
                    address: 'Junction Cross'
                },
                status: 'In Progress',
                assignedToDepartment: 'Public Works Dept',
                deadline: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day in past for SLA breach mock
            }
        ];

        await Complaint.insertMany(complaints);
        console.log('Seed Complaints Inserted.');

        console.log('Seeding Complete! Exiting...');
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedData();
