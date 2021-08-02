export interface QuestionInput {
    questionName: string,
    questionType: string,
    message: string,
    choices?: string[],
    validateFunction?(value: any): string | boolean,
}