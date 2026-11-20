import axios from "axios";
import { useAuthStore } from "@/stores/auth.js";


const api = {

    async csrf () {
       await axios.get('/sanctum/csrf-cookie');
    },

    async login (email, password) {
        try {

        await this.csrf();

        const authStore = useAuthStore();

        const { data } = await axios.post('api/v1/login', {email,password});

        authStore.login(data.data.user);
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }
};



export default api;
