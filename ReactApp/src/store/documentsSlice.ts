import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface DocumentsState {
  lastUpdatedAt: string | null;
}

const initialState: DocumentsState = {
  lastUpdatedAt: null,
};

const documentsSlice = createSlice({
  name: 'documents',
  initialState,
  reducers: {
    setDocumentsUpdatedAt(state, action: PayloadAction<string | null>) {
      state.lastUpdatedAt = action.payload;
    },
  },
});

export const { setDocumentsUpdatedAt } = documentsSlice.actions;
export default documentsSlice.reducer;
