import { Quiz, GameRecord, GameSettings } from '../types';

const DB_NAME = 'SnakeLadderQuizArenaDB';
const DB_VERSION = 1;

export const defaultSettings: GameSettings = {
  language: 'en',
  soundEnabled: true,
  classroomMode: false,
  winningRule: 'REACH_OR_PASS',
  penaltyRule: 'NO_MOVE',
  questionTimerSeconds: 0,
  reducedMotion: false,
};

export const defaultPreloadedQuizzes: Quiz[] = [
  {
    id: 'quiz_sci_y4_electricity',
    title: 'Year 4 Science: Electricity & Circuits',
    subject: 'Science',
    yearLevel: 'Year 4',
    topic: 'Electricity, Conductors & Circuits',
    language: 'English',
    description: 'Essential primary school science concepts covering electrical safety, simple circuits, conductors, and switches.',
    createdAt: 1714000000000,
    updatedAt: 1714000000000,
    questions: [
      {
        id: 'q_elec_1',
        question: 'Which component in a circuit provides electrical energy?',
        type: 'MCQ',
        options: [
          { label: 'A', text: 'Connecting wire' },
          { label: 'B', text: 'Battery / Dry cell' },
          { label: 'C', text: 'Switch' },
          { label: 'D', text: 'Light bulb' },
        ],
        correctAnswer: 'B',
        explanation: 'The dry cell or battery supplies electrical energy to push current through the circuit.',
        difficulty: 'Easy',
      },
      {
        id: 'q_elec_2',
        question: 'Metals such as copper and aluminum are good electrical conductors.',
        type: 'TRUE_FALSE',
        options: [],
        correctAnswer: 'TRUE',
        explanation: 'Metals permit electricity to flow through them easily, which is why electric wires are made of copper.',
        difficulty: 'Easy',
      },
      {
        id: 'q_elec_3',
        question: 'What happens to a bulb in a circuit if the switch is open?',
        type: 'MCQ',
        options: [
          { label: 'A', text: 'It shines brighter' },
          { label: 'B', text: 'It bursts' },
          { label: 'C', text: 'It does not light up' },
          { label: 'D', text: 'It flickers continuously' },
        ],
        correctAnswer: 'C',
        explanation: 'An open switch breaks the complete path, stopping current from reaching the bulb.',
        difficulty: 'Easy',
      },
      {
        id: 'q_elec_4',
        question: 'Name the material commonly used to coat electrical wires to prevent electric shocks.',
        type: 'SHORT_ANSWER',
        options: [],
        correctAnswer: 'Plastic',
        acceptedAnswers: ['rubber', 'insulator', 'plastics'],
        explanation: 'Plastic and rubber are electrical insulators that stop current from escaping and causing electric shock.',
        difficulty: 'Medium',
      },
      {
        id: 'q_elec_5',
        question: 'Water is a good conductor of electricity, making it dangerous to touch switches with wet hands.',
        type: 'TRUE_FALSE',
        options: [],
        correctAnswer: 'TRUE',
        explanation: 'Normal water conducts electricity and can cause severe electric shocks.',
        difficulty: 'Easy',
      },
      {
        id: 'q_elec_6',
        question: 'If one bulb blows in a series circuit, what happens to the remaining bulbs?',
        type: 'MCQ',
        options: [
          { label: 'A', text: 'They remain on' },
          { label: 'B', text: 'They get dimmer' },
          { label: 'C', text: 'They all turn off' },
          { label: 'D', text: 'They change color' },
        ],
        correctAnswer: 'C',
        explanation: 'In a series circuit, there is only one single continuous path. Any break cuts power to all components.',
        difficulty: 'Medium',
      },
      {
        id: 'q_elec_7',
        question: 'What is the device used to turn an electrical appliance on or off called?',
        type: 'SHORT_ANSWER',
        options: [],
        correctAnswer: 'Switch',
        acceptedAnswers: ['electrical switch', 'suis'],
        explanation: 'A switch connects or disconnects an electrical circuit.',
        difficulty: 'Easy',
      },
      {
        id: 'q_elec_8',
        question: 'Which of the following items is an electrical insulator?',
        type: 'MCQ',
        options: [
          { label: 'A', text: 'Iron nail' },
          { label: 'B', text: 'Wooden ruler' },
          { label: 'C', text: 'Steel coin' },
          { label: 'D', text: 'Aluminium foil' },
        ],
        correctAnswer: 'B',
        explanation: 'Wood does not allow electric current to pass through freely, making it an insulator.',
        difficulty: 'Easy',
      },
    ],
  },
  {
    id: 'quiz_sci_y4_sistem_suria_ms',
    title: 'Tahun 4 Sains: Sistem Suria & Tenaga',
    subject: 'Sains',
    yearLevel: 'Tahun 4',
    topic: 'Sistem Suria, Planet & Sumber Tenaga',
    language: 'Bahasa Melayu',
    description: 'Kuiz interaktif merangkumi susunan planet, pusat sistem suria, dan bentuk-bentuk tenaga asas.',
    createdAt: 1714001000000,
    updatedAt: 1714001000000,
    questions: [
      {
        id: 'q_suria_1',
        question: 'Apakah objek yang terletak di pusat Sistem Suria kita?',
        type: 'MCQ',
        options: [
          { label: 'A', text: 'Bumi' },
          { label: 'B', text: 'Bulan' },
          { label: 'C', text: 'Matahari' },
          { label: 'D', text: 'Musytari' },
        ],
        correctAnswer: 'C',
        explanation: 'Matahari ialah bintang gergasi di tengah Sistem Suria dan semua planet mengorbit mengelilinginya.',
        difficulty: 'Easy',
      },
      {
        id: 'q_suria_2',
        question: 'Planet yang paling dekat dengan Matahari ialah Utarid.',
        type: 'TRUE_FALSE',
        options: [],
        correctAnswer: 'TRUE',
        explanation: 'Utarid (Mercury) ialah planet pertama dan paling hampir dengan Matahari.',
        difficulty: 'Easy',
      },
      {
        id: 'q_suria_3',
        question: 'Apakah nama planet terbesar dalam Sistem Suria?',
        type: 'SHORT_ANSWER',
        options: [],
        correctAnswer: 'Musytari',
        acceptedAnswers: ['Jupiter', 'Planet Musytari'],
        explanation: 'Musytari ialah planet gergasi gas yang paling besar dalam sistem suria kita.',
        difficulty: 'Medium',
      },
      {
        id: 'q_suria_4',
        question: 'Apakah bentuk tenaga yang dihasilkan oleh Matahari?',
        type: 'MCQ',
        options: [
          { label: 'A', text: 'Tenaga bunyi dan kinetik' },
          { label: 'B', text: 'Tenaga cahaya dan haba' },
          { label: 'C', text: 'Tenaga kimia sahaja' },
          { label: 'D', text: 'Tenaga keupayaan sahaja' },
        ],
        correctAnswer: 'B',
        explanation: 'Matahari membekalkan tenaga cahaya untuk fotosintesis dan tenaga haba untuk memanaskan Bumi.',
        difficulty: 'Easy',
      },
      {
        id: 'q_suria_5',
        question: 'Bulan menghasilkan cahayanya sendiri pada waktu malam.',
        type: 'TRUE_FALSE',
        options: [],
        correctAnswer: 'FALSE',
        explanation: 'Bulan tidak menghasilkan cahaya sendiri, ia hanya memantulkan cahaya daripada Matahari.',
        difficulty: 'Easy',
      },
      {
        id: 'q_suria_6',
        question: 'Planet manakah yang terkenal dengan gelaran Planet Merah?',
        type: 'MCQ',
        options: [
          { label: 'A', text: 'Zuhrah' },
          { label: 'B', text: 'Marikh' },
          { label: 'C', text: 'Zuhal' },
          { label: 'D', text: 'Neptun' },
        ],
        correctAnswer: 'B',
        explanation: 'Marikh kelihatan kemerah-merahan kerana debu besi oksida di permukaannya.',
        difficulty: 'Easy',
      },
      {
        id: 'q_suria_7',
        question: 'Berapakah bilangan planet utama dalam Sistem Suria kita?',
        type: 'SHORT_ANSWER',
        options: [],
        correctAnswer: '8',
        acceptedAnswers: ['lapan', 'eight', '8 planet'],
        explanation: 'Terdapat 8 planet utama iaitu Utarid, Zuhrah, Bumi, Marikh, Musytari, Zuhal, Uranus dan Neptun.',
        difficulty: 'Easy',
      },
    ],
  },
  {
    id: 'quiz_math_y5_fractions',
    title: 'Year 5 Mathematics: Fractions & Decimals',
    subject: 'Mathematics',
    yearLevel: 'Year 5',
    topic: 'Fractions, Decimals, Percentages & Mental Arithmetic',
    language: 'English',
    description: 'Mental math challenges, fraction simplifications and decimal conversions for upper primary pupils.',
    createdAt: 1714002000000,
    updatedAt: 1714002000000,
    questions: [
      {
        id: 'q_m_1',
        question: 'What is 1/2 expressed as a decimal?',
        type: 'SHORT_ANSWER',
        options: [],
        correctAnswer: '0.5',
        acceptedAnswers: ['0.50', '.5'],
        explanation: 'Dividing 1 by 2 gives 0.5.',
        difficulty: 'Easy',
      },
      {
        id: 'q_m_2',
        question: 'What is 3/4 converted into a percentage?',
        type: 'MCQ',
        options: [
          { label: 'A', text: '25%' },
          { label: 'B', text: '50%' },
          { label: 'C', text: '75%' },
          { label: 'D', text: '80%' },
        ],
        correctAnswer: 'C',
        explanation: '3 divided by 4 equals 0.75, which is 75%.',
        difficulty: 'Easy',
      },
      {
        id: 'q_m_3',
        question: 'A fraction whose numerator is larger than its denominator is called an improper fraction.',
        type: 'TRUE_FALSE',
        options: [],
        correctAnswer: 'TRUE',
        explanation: 'For example, 7/4 is an improper fraction because the top number is greater than the bottom.',
        difficulty: 'Medium',
      },
      {
        id: 'q_m_4',
        question: 'Simplify the fraction 8/12 to its simplest form.',
        type: 'SHORT_ANSWER',
        options: [],
        correctAnswer: '2/3',
        acceptedAnswers: ['2 / 3', 'two thirds'],
        explanation: 'Dividing both numerator and denominator by their greatest common factor (4) yields 2/3.',
        difficulty: 'Medium',
      },
      {
        id: 'q_m_5',
        question: 'What is 15 multiplied by 4?',
        type: 'MCQ',
        options: [
          { label: 'A', text: '45' },
          { label: 'B', text: '50' },
          { label: 'C', text: '60' },
          { label: 'D', text: '65' },
        ],
        correctAnswer: 'C',
        explanation: '15 x 2 = 30, and 30 x 2 = 60.',
        difficulty: 'Easy',
      },
    ],
  },
  {
    id: 'quiz_trivia_general_ms',
    title: 'Trivia Pengetahuan Am Sekolah Rendah',
    subject: 'Pengetahuan Am',
    yearLevel: 'Tahun 4 - 6',
    topic: 'Alam Semula Jadi, Geografi & Kesihatan',
    language: 'Bahasa Melayu',
    description: 'Soalan santai menguji daya fikir, pengetahuan alam fauna, anatomi dan geografi dunia.',
    createdAt: 1714003000000,
    updatedAt: 1714003000000,
    questions: [
      {
        id: 'q_triv_1',
        question: 'Apakah mamalia terbesar yang hidup di muka bumi?',
        type: 'MCQ',
        options: [
          { label: 'A', text: 'Gajah Afrika' },
          { label: 'B', text: 'Paus Biru' },
          { label: 'C', text: 'Badak Sumbu' },
          { label: 'D', text: 'Jerung Putih' },
        ],
        correctAnswer: 'B',
        explanation: 'Paus Biru ialah haiwan dan mamalia terbesar yang pernah hidup, dengan berat mencecah 150 tan.',
        difficulty: 'Easy',
      },
      {
        id: 'q_triv_2',
        question: 'Tumbuh-tumbuhan menghasilkan gas oksigen semasa proses fotosintesis.',
        type: 'TRUE_FALSE',
        options: [],
        correctAnswer: 'TRUE',
        explanation: 'Tumbuhan menyerap karbon dioksida dan melepaskan oksigen yang diperlukan untuk hidupan bernafas.',
        difficulty: 'Easy',
      },
      {
        id: 'q_triv_3',
        question: 'Apakah organ manusia yang mengepam darah ke seluruh tubuh?',
        type: 'SHORT_ANSWER',
        options: [],
        correctAnswer: 'Jantung',
        acceptedAnswers: ['organ jantung', 'heart'],
        explanation: 'Jantung bertindak sebagai pam berotot yang mengedarkan darah beroksigen ke seluruh badan.',
        difficulty: 'Easy',
      },
      {
        id: 'q_triv_4',
        question: 'Berapakah bilangan benua utama di dunia?',
        type: 'MCQ',
        options: [
          { label: 'A', text: '5' },
          { label: 'B', text: '6' },
          { label: 'C', text: '7' },
          { label: 'D', text: '8' },
        ],
        correctAnswer: 'C',
        explanation: 'Terdapat 7 benua utama: Asia, Afrika, Amerika Utara, Amerika Selatan, Antartika, Eropah, dan Australia.',
        difficulty: 'Medium',
      },
    ],
  },
];

class DatabaseService {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private openDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains('quizzes')) {
          const quizStore = db.createObjectStore('quizzes', { keyPath: 'id' });
          quizStore.createIndex('subject', 'subject', { unique: false });
          quizStore.createIndex('yearLevel', 'yearLevel', { unique: false });
          quizStore.createIndex('updatedAt', 'updatedAt', { unique: false });
        }

        if (!db.objectStoreNames.contains('game_history')) {
          const historyStore = db.createObjectStore('game_history', { keyPath: 'id' });
          historyStore.createIndex('date', 'date', { unique: false });
        }

        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      };

      request.onsuccess = async (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        await this.seedDefaults(db);
        resolve(db);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });

    return this.dbPromise;
  }

  private async seedDefaults(db: IDBDatabase): Promise<void> {
    return new Promise((resolve) => {
      const tx = db.transaction(['quizzes', 'settings'], 'readwrite');
      const quizStore = tx.objectStore('quizzes');
      const countReq = quizStore.count();

      countReq.onsuccess = () => {
        if (countReq.result === 0) {
          for (const quiz of defaultPreloadedQuizzes) {
            quizStore.put(quiz);
          }
        }
      };

      const settingsStore = tx.objectStore('settings');
      const getSetReq = settingsStore.get('app_settings');
      getSetReq.onsuccess = () => {
        if (!getSetReq.result) {
          settingsStore.put({ key: 'app_settings', value: defaultSettings });
        }
      };

      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  }

  // Quizzes CRUD
  public async getAllQuizzes(): Promise<Quiz[]> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('quizzes', 'readonly');
      const store = tx.objectStore('quizzes');
      const request = store.getAll();

      request.onsuccess = () => {
        const list = (request.result || []) as Quiz[];
        // Sort newest first
        list.sort((a, b) => b.updatedAt - a.updatedAt);
        resolve(list);
      };
      request.onerror = () => reject(request.error);
    });
  }

  public async getQuizById(id: string): Promise<Quiz | null> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('quizzes', 'readonly');
      const store = tx.objectStore('quizzes');
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  public async saveQuiz(quiz: Quiz): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('quizzes', 'readwrite');
      const store = tx.objectStore('quizzes');
      const item: Quiz = {
        ...quiz,
        updatedAt: Date.now(),
      };
      const request = store.put(item);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  public async deleteQuiz(id: string): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('quizzes', 'readwrite');
      const store = tx.objectStore('quizzes');
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Game History
  public async getGameHistory(): Promise<GameRecord[]> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('game_history', 'readonly');
      const store = tx.objectStore('game_history');
      const request = store.getAll();

      request.onsuccess = () => {
        const records = (request.result || []) as GameRecord[];
        records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        resolve(records);
      };
      request.onerror = () => reject(request.error);
    });
  }

  public async saveGameRecord(record: GameRecord): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('game_history', 'readwrite');
      const store = tx.objectStore('game_history');
      const request = store.put(record);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  public async deleteGameRecord(id: string): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('game_history', 'readwrite');
      const store = tx.objectStore('game_history');
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  public async clearAllGameHistory(): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('game_history', 'readwrite');
      const store = tx.objectStore('game_history');
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Settings
  public async getSettings(): Promise<GameSettings> {
    const db = await this.openDB();
    return new Promise((resolve) => {
      const tx = db.transaction('settings', 'readonly');
      const store = tx.objectStore('settings');
      const request = store.get('app_settings');

      request.onsuccess = () => {
        if (request.result && request.result.value) {
          resolve({ ...defaultSettings, ...request.result.value });
        } else {
          resolve(defaultSettings);
        }
      };
      request.onerror = () => resolve(defaultSettings);
    });
  }

  public async saveSettings(settings: GameSettings): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('settings', 'readwrite');
      const store = tx.objectStore('settings');
      const request = store.put({ key: 'app_settings', value: settings });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

export const dbService = new DatabaseService();
