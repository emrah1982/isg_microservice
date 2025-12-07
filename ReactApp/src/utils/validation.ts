import * as yup from 'yup';

export const userSchema = yup.object({
  email: yup.string().email().required(),
  fullName: yup.string().min(2).required(),
  role: yup.string().required(),
});

export const trainingSchema = yup.object({
  title: yup.string().required(),
  date: yup.date().required(),
});
