// ─── Dashboard ────────────────────────────────────────────────
export interface DashboardUser {
  name?: string;
  email?: string;
}

export interface DashboardPoll {
  _id: string;
  title: string;
  description?: string;
  isPublished: boolean;
  isAnonymous: boolean;
  expiresAt?: string;
  createdAt?: string;
  totalResponses?: number;
}

export interface AnalyticsOverview {
  totalPolls: number;
  publishedPolls: number;
  draftPolls: number;
  livePolls: number;
  expiredPolls: number;
  totalResponses: number;
  totalResponsesToday: number;
  overallCompletionRatePercent: number;
}

export interface DashboardApiResponse<T> {
  status: boolean;
  message: string;
  data?: {
    result?: T;
  };
}

// ─── Poll Analytics ────────────────────────────────────────────
export interface PollAnalyticsOverview {
  _id: string;
  title: string;
  isPublished: boolean;
  autoPublishOnExpiry?: boolean;
  isAnonymous: boolean;
  createdAt: string;
  expiresAt: string;
  publishedAt?: string;
  totalResponses: number;
  totalQuestions: number;
  isExpired: boolean;
  responsesToday: number;
  authenticatedResponses: number;
  anonymousResponses: number;
  totalAnsweredSelections: number;
  averageCompletionRatePercent: number;
  totalMandatoryQuestions: number;
  fullyCompletedMandatoryCount: number;
  averageMandatoryCompletionRatePercent: number;
  mandatoryFullCompletionRatePercent: number;
}

export interface OptionAnalytics {
  optionId: string;
  optionText: string;
  count: number;
  percentage: number;
}

export interface QuestionAnalytics {
  questionId: string;
  text: string;
  isMandatory: boolean;
  skippedCount: number;
  totalAnswers: number;
  options: OptionAnalytics[];
}

export interface PollQuestionAnalytics {
  pollId: string;
  title: string;
  totalResponses: number;
  questions: QuestionAnalytics[];
}

export interface TrendPoint {
  bucket: string;
  count: number;
}

export interface ParticipationTrend {
  pollId: string;
  title: string;
  range: string;
  bucket: string;
  from: string;
  to: string;
  points: TrendPoint[];
}

// ─── Create Poll ───────────────────────────────────────────────
export interface CreatePollOption {
  text: string;
}

export interface CreatePollQuestion {
  text: string;
  isMandatory: boolean;
  options: CreatePollOption[];
}

export interface CreatePollPayload {
  title: string;
  description?: string;
  isAnonymous: boolean;
  autoPublishOnExpiry?: boolean;
  expiresAt: string;
  questions: CreatePollQuestion[];
}

// ─── Public Poll (respondent view) ────────────────────────────
export interface PublicPollOption {
  _id: string;
  text: string;
}

export interface PublicPollQuestion {
  _id: string;
  text: string;
  isMandatory: boolean;
  options: PublicPollOption[];
}

export interface PublicPoll {
  _id: string;
  title: string;
  description?: string;
  expiresAt: string;
  isPublished: boolean;
  isAnonymous: boolean;
  questions: PublicPollQuestion[];
}

export interface SubmitAnswerItem {
  questionId: string;
  selectedOptionId: string | null;
}

export interface SubmitResponsePayload {
  answers: SubmitAnswerItem[];
  fingerprint: string;
}

// ─── Public Results ────────────────────────────────────────────
export interface PublishedOptionResult {
  optionId: string;
  text: string;
  count: number;
  percentage: number;
}

export interface PublishedQuestionResult {
  questionId: string;
  text: string;
  totalAnswered: number;
  skippedCount: number;
  options: PublishedOptionResult[];
}

export interface PublishedPollResults {
  pollId: string;
  title: string;
  description?: string;
  publishedAt?: string;
  totalResponses: number;
  questions: PublishedQuestionResult[];
}
