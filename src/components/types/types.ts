// API

export interface Word {
  id?: string;
  _id?: string;
  group: number;
  page: number;
  word: string;
  image: string;
  audio: string;
  audioMeaning: string;
  audioExample: string;
  textMeaning: string;
  textExample: string;
  transcription: string;
  textExampleTranslate: string;
  textMeaningTranslate: string;
  wordTranslate: string;
}

export interface User {
  name: string;
  email: string;
  password: string;
}

// TODO Check Auth structure in current database version (now present only token, refreshToken)
export interface Auth {
  message: string;
  token: string;
  refreshToken: string;
  userId: string;
  name: string;
}

interface UserWord {
  difficulty: string;
  id: string;
  wordId: string;
}

interface StatisticsData {
  id: string;
  learnedWords: number;
  optional?: Optional;
}

export interface CreateUserError {
  path: string[];
  message: string;
}

export interface CreateUserErrors {
  status: string;
  errors: CreateUserError[];
}

export type Optional = Record<string, unknown>;

interface ApiMethodsData {
  code: number;
}

export interface CreateUserData extends ApiMethodsData {
  data: User | CreateUserErrors | string;
}

export interface GetUpdateUserData extends ApiMethodsData {
  data: User | string;
}

export interface DeleteUserWordData extends ApiMethodsData {
  data: string;
}

export interface GetUserTokensData extends ApiMethodsData {
  data: Auth | string;
}

export interface UserWordData extends ApiMethodsData {
  data: UserWord | string;
}

export interface GetUserAggregatedWord extends ApiMethodsData {
  data: Word[] | string;
}

export interface GetUpsertStatistics extends ApiMethodsData {
  data: StatisticsData | string;
}
