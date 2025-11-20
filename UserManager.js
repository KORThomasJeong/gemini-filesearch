const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcryptjs');

const USERS_FILE = path.join(__dirname, 'users.json');

class UserManager {
    constructor() {
        this.users = [];
        this.init();
    }

    async init() {
        try {
            const data = await fs.readFile(USERS_FILE, 'utf8');
            this.users = JSON.parse(data);
        } catch (error) {
            // If file doesn't exist, start with empty array
            this.users = [];
            await this.save();
        }
    }

    async save() {
        await fs.writeFile(USERS_FILE, JSON.stringify(this.users, null, 2));
    }

    async createUser(username, password) {
        // Check if user exists
        if (this.users.find(u => u.username === username)) {
            throw new Error('User already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // First user is admin
        const role = this.users.length === 0 ? 'admin' : 'user';
        // First user is auto-approved, others pending
        const approved = this.users.length === 0;

        const newUser = {
            id: Date.now().toString(),
            username,
            password: hashedPassword,
            role,
            approved,
            createdAt: new Date().toISOString()
        };

        this.users.push(newUser);
        await this.save();
        return { id: newUser.id, username: newUser.username, role: newUser.role, approved: newUser.approved };
    }

    async authenticate(username, password) {
        const user = this.users.find(u => u.username === username);
        if (!user) return null;

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;

        return { id: user.id, username: user.username, role: user.role, approved: user.approved };
    }

    getAllUsers() {
        return this.users.map(u => ({
            id: u.id,
            username: u.username,
            role: u.role,
            approved: u.approved,
            createdAt: u.createdAt
        }));
    }

    async approveUser(userId) {
        const user = this.users.find(u => u.id === userId);
        if (!user) throw new Error('User not found');

        user.approved = true;
        await this.save();
        return user;
    }

    async resetPassword(userId, newPassword) {
        const user = this.users.find(u => u.id === userId);
        if (!user) throw new Error('User not found');

        user.password = await bcrypt.hash(newPassword, 10);
        await this.save();
    }

    async deleteUser(userId) {
        this.users = this.users.filter(u => u.id !== userId);
        await this.save();
    }
}

module.exports = new UserManager();
