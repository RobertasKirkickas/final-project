import { create } from 'zustand';
import { mountStoreDevtool } from 'simple-zustand-devtools';

const useAuthStore = create((set, get) => ({
	allUserData: null, // Store all user data
	loading: false,

	// Function 'user' that returns an object with user-related data
	user: () => ({
		user_id: get().allUserData?.user_id || null,
		username: get().allUserData?.username || null,
	}),

	// Allows setting the 'allUserData' state
	setUser: (user) => set({ allUserData: user }),

	// Allows setting the 'loading' state
	setLoading: (loading) => set({ loading }),

	// Checks if 'allUserData' is not null
	isLoggedIn: () => get().allUserData !== null,
}));

// Attach the DevTools only in a development environment
if (import.meta.env.DEV) {
	mountStoreDevtool('Store', useAuthStore);
}

export { useAuthStore };
