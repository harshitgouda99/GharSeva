import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import servicesReducer from './slices/servicesSlice';
import bookingsReducer from './slices/bookingsSlice';
import notificationsReducer from './slices/notificationsSlice';
import favoritesReducer from './slices/favoritesSlice';
import complaintsReducer from './slices/complaintsSlice';
import addressesReducer from './slices/addressesSlice';
import reviewsReducer from './slices/reviewsSlice';
import adminReducer from './slices/adminSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    services: servicesReducer,
    bookings: bookingsReducer,
    notifications: notificationsReducer,
    favorites: favoritesReducer,
    complaints: complaintsReducer,
    addresses: addressesReducer,
    reviews: reviewsReducer,
    admin: adminReducer
  }
});
export default store;

