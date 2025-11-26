import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-change-in-production';

export const encrypt = (text: string): string => {
    return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
};

export const decrypt = (encryptedText: string): string => {
    const bytes = CryptoJS.AES.decrypt(encryptedText, ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
};

export const maskPersonalInfo = (text: string): string => {
    // 名前のマスキング（例：山田太郎 → 山田○○）
    text = text.replace(/([一-龯ぁ-んァ-ヶー]{1,2})([一-龯ぁ-んァ-ヶー]{1,3})/g, '$1○○');

    // 電話番号のマスキング
    text = text.replace(/(\d{2,4})-?(\d{2,4})-?(\d{4})/g, '***-****-$3');

    // メールアドレスのマスキング
    text = text.replace(/([a-zA-Z0-9._-]+)@([a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/g, '***@$2');

    // 住所のマスキング（番地以降）
    text = text.replace(/(\d+)丁目(\d+)番地?(\d+)号?/g, '$1丁目○番地○号');

    return text;
};

export const generatePatientId = (): string => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `PT-${timestamp}-${random}`.toUpperCase();
};
