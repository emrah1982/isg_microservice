import { configureStore } from '@reduxjs/toolkit';
import usersReducer from '@store/usersSlice';
import trainingsReducer from '@store/trainingsSlice';
import documentsReducer from '@store/documentsSlice';
import incidentsReducer from '@store/incidentsSlice';
import reportingReducer from '@store/reportingSlice';
import riskAnalysisReducer from '@store/riskAnalysisSlice';
import visionReducer from '@store/visionSlice';

export const store = configureStore({
  reducer: {
    users: usersReducer,
    trainings: trainingsReducer,
    documents: documentsReducer,
    incidents: incidentsReducer,
    reporting: reportingReducer,
    riskAnalysis: riskAnalysisReducer,
    vision: visionReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
