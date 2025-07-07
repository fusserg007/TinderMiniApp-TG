/**
 * Модель пользователя
 */
export interface User {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  languageCode: string;
  gender: 'male' | 'female' | 'not_specified';
  interestsGender: 'male' | 'female' | 'both' | 'not_specified';
  ageRange: '18-25' | '26-35' | '36-45' | '46+' | 'not_specified';
  photo: string;
  restScores: number;
  createdAt?: Date;
  updatedAt?: Date;
}
