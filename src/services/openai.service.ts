import OpenAI from 'openai';
import { logger } from '../utils/logger';
import { IPatientRecord } from '../models/PatientRecord';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export interface GeneratedQuiz {
    title: string;
    description: string;
    questions: Array<{
        question: string;
        options: string[];
        correctAnswer: number;
        explanation: string;
    }>;
    difficulty: 'easy' | 'medium' | 'hard';
}

export class OpenAIService {
    async generateQuizFromRecords(records: IPatientRecord[], difficulty: 'easy' | 'medium' | 'hard' = 'medium'): Promise<GeneratedQuiz> {
        try {
            const recordsSummary = records.map((record, index) => ({
                index: index + 1,
                diagnosis: record.diagnosis,
                treatment: record.treatment,
                chiefComplaint: record.chiefComplaint,
            }));

            const prompt = `あなたは医学教育の専門家です。以下の患者記録に基づいて、医師の理解度をチェックするための${difficulty === 'easy' ? '基礎的な' : difficulty === 'medium' ? '中級レベルの' : '高度な'}クイズを5問作成してください。

患者記録:
${JSON.stringify(recordsSummary, null, 2)}

以下のJSON形式で回答してください:
{
  "title": "クイズのタイトル",
  "description": "クイズの説明",
  "questions": [
    {
      "question": "問題文",
      "options": ["選択肢1", "選択肢2", "選択肢3", "選択肢4"],
      "correctAnswer": 0,
      "explanation": "正解の説明"
    }
  ],
  "difficulty": "${difficulty}"
}

注意事項:
- 問題は臨床的に重要なポイントに焦点を当ててください
- 選択肢は4つ作成してください
- correctAnswerは0から3のインデックスで指定してください
- 説明は詳細で教育的な内容にしてください
- 個人情報は含めないでください`;

            const response = await openai.chat.completions.create({
                model: 'gpt-4-turbo-preview',
                messages: [
                    {
                        role: 'system',
                        content: 'あなたは医学教育の専門家で、医師向けの教育的なクイズを作成します。',
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                temperature: 0.7,
                response_format: { type: 'json_object' },
            });

            const content = response.choices[0].message.content;
            if (!content) {
                throw new Error('No content received from OpenAI');
            }

            const quiz = JSON.parse(content) as GeneratedQuiz;

            // Validate quiz structure
            if (!quiz.questions || quiz.questions.length === 0) {
                throw new Error('Invalid quiz structure');
            }

            logger.info(`Generated quiz with ${quiz.questions.length} questions`);
            return quiz;
        } catch (error) {
            logger.error('Error generating quiz:', error);
            throw error;
        }
    }

    async analyzeDiagnosisPattern(records: IPatientRecord[]): Promise<string> {
        try {
            const diagnosisList = records.map(r => r.diagnosis);

            const prompt = `以下の診断リストを分析し、パターンや傾向、学習すべき重要なポイントを日本語で簡潔にまとめてください:

診断: ${diagnosisList.join(', ')}

分析結果を200文字以内で提供してください。`;

            const response = await openai.chat.completions.create({
                model: 'gpt-4-turbo-preview',
                messages: [
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                temperature: 0.5,
                max_tokens: 300,
            });

            return response.choices[0].message.content || '分析結果を生成できませんでした。';
        } catch (error) {
            logger.error('Error analyzing diagnosis pattern:', error);
            throw error;
        }
    }
}

export const openAIService = new OpenAIService();
