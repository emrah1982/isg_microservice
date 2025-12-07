import { axiosInstance } from '@utils/axiosInstance';

export type ExamOption = { id: number; text: string; isCorrect: boolean; order: number };
export type ExamQuestion = { id: number; text: string; order: number; options: ExamOption[] };
export type Exam = { id: number; title: string; description?: string; durationMinutes: number; passScore: number; isActive: boolean; questions?: ExamQuestion[] };

export async function getExams(): Promise<Exam[]> {
  const { data } = await axiosInstance.get('http://localhost:8087/api/exams');
  return Array.isArray(data) ? data : [];
}

export const listExams = getExams;

export async function getExam(id: number): Promise<Exam> {
  const { data } = await axiosInstance.get(`http://localhost:8087/api/exams/${id}`);
  return data;
}

export async function createExam(payload: any): Promise<Exam> {
  const { data } = await axiosInstance.post('http://localhost:8087/api/exams', payload);
  return data;
}

export type TrainingSummary = { id: number; title: string };
export async function getTrainings(): Promise<TrainingSummary[]> {
  const { data } = await axiosInstance.get('http://localhost:8081/api/trainings');
  // TrainingsService returns ApiResponse
  const list = Array.isArray(data?.data) ? data.data : [];
  return list.map((t: any) => ({ id: t.id, title: t.title }));
}

export async function linkExamToTraining(trainingId: number, examId: number, order = 0) {
  await axiosInstance.post('http://localhost:8087/api/training-exams', { trainingId, examId, order });
}

export async function getTrainingExams(trainingId: number) {
  const { data } = await axiosInstance.get(`http://localhost:8087/api/training-exams/${trainingId}`);
  return Array.isArray(data) ? data : [];
}

export async function unlinkExam(trainingId: number, examId: number) {
  await axiosInstance.delete(`http://localhost:8087/api/training-exams/${trainingId}/${examId}`);
}

export async function startAttempt(examId: number, userId: number) {
  const { data } = await axiosInstance.post(`http://localhost:8087/api/attempts/start/${examId}`, { userId });
  return data as { attemptId: number };
}

export async function sendAnswer(attemptId: number, questionId: number, selectedOptionId: number) {
  await axiosInstance.post(`http://localhost:8087/api/attempts/${attemptId}/answer`, { questionId, selectedOptionId });
}

export async function submitAttempt(attemptId: number) {
  const { data } = await axiosInstance.post(`http://localhost:8087/api/attempts/${attemptId}/submit`, {});
  return data as { score: number; passed: boolean; totalQuestions: number; correctCount: number };
}

export async function getTrainingsByExam(examId: number) {
  const { data } = await axiosInstance.get(`http://localhost:8087/api/training-exams/by-exam/${examId}`);
  return Array.isArray(data) ? data : [];
}

export async function getPersonnelExams(personnelId: number, userId?: number) {
  const q = userId ? `?userId=${userId}` : '';
  const { data } = await axiosInstance.get(`http://localhost:8087/api/personnel-exams/${personnelId}${q}`);
  return Array.isArray(data) ? data : [];
}
