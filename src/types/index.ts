/**
 * 对应数据库中的 public.profiles 表
 */
export interface Profile {
    id: string; // UUID
    username: string | null;
    role: 'user' | 'admin';
    avatar_url: string | null;
    created_at: string;
}

/**
 * 对应数据库中的 public.tags 表
 */
export interface Tag {
    id: number;
    category: string;
    name: string;
}

/**
 * 对应数据库中的 public.works 表
 */
export interface Work {
    id: number;
    title: string;
    author_name: string;
    original_url: string;
    platform: string;
    summary: string | null;
    submitter_id: string | null; // UUID
    created_at: string;
}

/**
 * 前端展示用的 Work 对象，可能包含关联的 Tags
 */
export interface WorkWithTags extends Work {
    tags?: Tag[];
}

/**
 * 对应数据库中的 public.radio_messages 表
 */
export interface RadioMessage {
    id: number;
    user_id: string; // UUID
    nickname: string;
    content: string;
    linked_work_id: number | null;
    is_winter_letter_storage_participant: boolean;
    created_at: string;
}

/**
 * 对应数据库中的 public.radio_reactions 表
 */
export interface RadioReaction {
    id: number;
    message_id: number;
    user_id: string;
    emoji: string;
    created_at: string;
}

/**
 * 对应数据库中的 public.favorite_folders 表
 */
export interface FavoriteFolder {
    id: number;
    user_id: string; // UUID
    name: string;
    created_at: string;
}

/**
 * 对应数据库中的 public.quiz_questions 表（不含正确答案）
 */
export interface QuizQuestion {
    id: number;
    question: string;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
}

/**
 * 单道题的作答
 */
export interface QuizAnswer {
    id: number;
    answer: string; // 'a' | 'b' | 'c' | 'd'
}

/**
 * 答题结果
 */
export interface QuizResult {
    passed: boolean;
    score: number;
    correct: number;
    total: number;
}
