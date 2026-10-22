import { Team, Question, WinningRule, WrongAnswerPenalty, GamePhase, GameSnapshot, GameSettings } from '../types';
import { LADDERS, SNAKES, BOARD_SIZE } from './constants';
import { soundManager } from '../services/sound';

export interface GameEngineState {
  teams: Team[];
  activeTeamIndex: number;
  diceValue: number | null;
  phase: GamePhase;
  currentQuestion: Question | null;
  selectedAnswer: string | null;
  isAnswerCorrect: boolean | null;
  turnNumber: number;
  winningTeamId: string | null;
  lastActionDescription: string;
  snakeLadderEncounter: {
    type: 'snake' | 'ladder';
    from: number;
    to: number;
  } | null;
}

export class GameEngine {
  private state: GameEngineState;
  private history: GameSnapshot[] = [];
  private winningRule: WinningRule = 'REACH_OR_PASS';
  private penaltyRule: WrongAnswerPenalty = 'NO_MOVE';
  private questions: Question[] = [];
  private questionIndex: number = 0;
  private onStateChange: (state: GameEngineState) => void;

  constructor(
    teams: Team[],
    questions: Question[],
    settings: GameSettings,
    onStateChange: (state: GameEngineState) => void
  ) {
    this.winningRule = settings.winningRule;
    this.penaltyRule = settings.penaltyRule;
    this.questions = [...questions];
    this.onStateChange = onStateChange;

    // Reset initial team progress
    const initializedTeams = teams.map((t) => ({
      ...t,
      currentSquare: 1,
      correctCount: 0,
      incorrectCount: 0,
      attemptsCount: 0,
      skippedTurns: 0,
      isSkippedForTurn: false,
    }));

    this.state = {
      teams: initializedTeams,
      activeTeamIndex: 0,
      diceValue: null,
      phase: 'AWAIT_ROLL',
      currentQuestion: null,
      selectedAnswer: null,
      isAnswerCorrect: null,
      turnNumber: 1,
      winningTeamId: null,
      lastActionDescription: 'Game initialized. Team 1 is ready to roll.',
      snakeLadderEncounter: null,
    };

    // Check if team 0 is skipped (in fresh game, it shouldn't be, but handles generic turns)
    this.checkCurrentTeamSkip();
  }

  public getState(): GameEngineState {
    return { ...this.state };
  }

  private pushSnapshot(actionDescription: string) {
    const snapshot: GameSnapshot = {
      teams: JSON.parse(JSON.stringify(this.state.teams)),
      activeTeamIndex: this.state.activeTeamIndex,
      diceValue: this.state.diceValue,
      phase: this.state.phase,
      currentQuestion: this.state.currentQuestion ? { ...this.state.currentQuestion } : null,
      selectedAnswer: this.state.selectedAnswer,
      isAnswerCorrect: this.state.isAnswerCorrect,
      turnNumber: this.state.turnNumber,
      winningTeamId: this.state.winningTeamId,
      lastActionDescription: actionDescription,
    };
    this.history.push(snapshot);
  }

  private emit() {
    this.onStateChange({ ...this.state });
  }

  public canUndo(): boolean {
    return this.history.length > 0 && this.state.phase !== 'ROLLING' && this.state.phase !== 'MOVING';
  }

  public undo(): boolean {
    if (!this.canUndo()) return false;
    const previous = this.history.pop();
    if (!previous) return false;

    this.state = {
      teams: previous.teams,
      activeTeamIndex: previous.activeTeamIndex,
      diceValue: previous.diceValue,
      phase: previous.phase,
      currentQuestion: previous.currentQuestion,
      selectedAnswer: previous.selectedAnswer,
      isAnswerCorrect: previous.isAnswerCorrect,
      turnNumber: previous.turnNumber,
      winningTeamId: previous.winningTeamId,
      lastActionDescription: `Undid action: ${previous.lastActionDescription}`,
      snakeLadderEncounter: null,
    };

    soundManager.playClick();
    this.emit();
    return true;
  }

  // Check if current team's turn was flagged to be skipped
  private checkCurrentTeamSkip(): boolean {
    const currentTeam = this.state.teams[this.state.activeTeamIndex];
    if (currentTeam && currentTeam.isSkippedForTurn) {
      this.pushSnapshot(`${currentTeam.name} skipped turn due to previous penalty.`);
      
      const updatedTeams = [...this.state.teams];
      updatedTeams[this.state.activeTeamIndex] = {
        ...currentTeam,
        isSkippedForTurn: false,
        skippedTurns: currentTeam.skippedTurns + 1,
      };

      this.state.teams = updatedTeams;
      this.state.lastActionDescription = `${currentTeam.name} loses this turn.`;

      // Advance to next team
      this.advanceTurn();
      return true;
    }
    return false;
  }

  // Teacher rolls dice
  public startDiceRoll(): number {
    if (this.state.phase !== 'AWAIT_ROLL') {
      return this.state.diceValue || 1;
    }

    this.pushSnapshot(`Rolling dice for ${this.state.teams[this.state.activeTeamIndex].name}`);
    this.state.phase = 'ROLLING';
    soundManager.playDiceRoll();

    const result = Math.floor(Math.random() * 6) + 1;
    this.state.diceValue = result;
    this.emit();

    // Pick question from pool
    const question = this.pickNextQuestion();
    this.state.currentQuestion = question;
    this.state.selectedAnswer = null;
    this.state.isAnswerCorrect = null;

    // Transition to question after dice settle
    setTimeout(() => {
      this.state.phase = 'QUESTION_ACTIVE';
      this.state.lastActionDescription = `${this.state.teams[this.state.activeTeamIndex].name} rolled a ${result}. Answer question to advance!`;
      this.emit();
    }, 700);

    return result;
  }

  private pickNextQuestion(): Question {
    if (this.questions.length === 0) {
      // Fallback simple question
      return {
        id: 'q_default',
        question: 'Ready to advance! Is education the key to success?',
        type: 'TRUE_FALSE',
        options: [],
        correctAnswer: 'TRUE',
        explanation: 'Education opens doors and creates opportunities for all students.',
        difficulty: 'Easy',
      };
    }
    const q = this.questions[this.questionIndex % this.questions.length];
    this.questionIndex++;
    return q;
  }

  // Teacher selects answer for the active team
  public selectAnswer(answer: string) {
    if (this.state.phase !== 'QUESTION_ACTIVE') return;
    this.state.selectedAnswer = answer;
    soundManager.playClick();
    this.emit();
  }

  // Automatic verification of an answer string against question
  public evaluateAnswer(givenAnswer: string, question: Question): boolean {
    const qType = question.type;
    const cleanGiven = givenAnswer.trim().toLowerCase();

    if (qType === 'MCQ') {
      const correct = question.correctAnswer.trim().toLowerCase();
      return cleanGiven === correct;
    }

    if (qType === 'TRUE_FALSE') {
      const correct = question.correctAnswer.trim().toLowerCase();
      const isGivenTrue = cleanGiven.includes('true') || cleanGiven === 'benar' || cleanGiven === 'betul' || cleanGiven === 't';
      const isCorrectTrue = correct.includes('true') || correct === 'benar' || correct === 'betul' || correct === 't';
      return isGivenTrue === isCorrectTrue;
    }

    if (qType === 'SHORT_ANSWER') {
      const canonical = question.correctAnswer.trim().toLowerCase();
      if (cleanGiven === canonical) return true;

      if (Array.isArray(question.acceptedAnswers)) {
        for (const alt of question.acceptedAnswers) {
          if (cleanGiven === alt.trim().toLowerCase()) {
            return true;
          }
        }
      }
    }

    return false;
  }

  // Teacher confirms answer (either auto evaluated or manual override)
  public confirmAnswer(overrideCorrect?: boolean, customPenalty?: WrongAnswerPenalty) {
    if (this.state.phase !== 'QUESTION_ACTIVE' || !this.state.currentQuestion) return;

    this.pushSnapshot(`Confirmed answer for ${this.state.teams[this.state.activeTeamIndex].name}`);

    let isCorrect: boolean;
    if (typeof overrideCorrect === 'boolean') {
      isCorrect = overrideCorrect;
    } else {
      isCorrect = this.evaluateAnswer(this.state.selectedAnswer || '', this.state.currentQuestion);
    }

    this.state.isAnswerCorrect = isCorrect;
    this.state.phase = 'ANSWER_CONFIRMED';

    const currentTeam = this.state.teams[this.state.activeTeamIndex];
    const updatedTeam = { ...currentTeam };
    updatedTeam.attemptsCount += 1;

    if (isCorrect) {
      updatedTeam.correctCount += 1;
      soundManager.playCorrect();
      this.state.lastActionDescription = `${currentTeam.name} answered correctly!`;
    } else {
      updatedTeam.incorrectCount += 1;
      soundManager.playWrong();
      this.state.lastActionDescription = `${currentTeam.name} answered incorrectly.`;

      // Apply penalty
      const appliedPenalty = customPenalty || this.penaltyRule;
      if (appliedPenalty === 'LOSE_TURN') {
        updatedTeam.isSkippedForTurn = true;
      }
    }

    const updatedTeams = [...this.state.teams];
    updatedTeams[this.state.activeTeamIndex] = updatedTeam;
    this.state.teams = updatedTeams;
    this.emit();
  }

  // Teacher presses Apply Movement / Next Turn
  public applyMovementAndAdvance() {
    if (this.state.phase !== 'ANSWER_CONFIRMED') return;

    const currentTeam = this.state.teams[this.state.activeTeamIndex];
    const roll = this.state.diceValue || 0;
    const isCorrect = this.state.isAnswerCorrect === true;

    if (!isCorrect) {
      // No movement on wrong answer, simply advance to next turn
      this.advanceTurn();
      return;
    }

    // Correct answer: Move token
    const startSquare = currentTeam.currentSquare;
    let targetSquare = startSquare + roll;

    // Check winning rule
    if (this.winningRule === 'EXACT') {
      if (targetSquare > BOARD_SIZE) {
        // Roll exceeded 100 on exact rule: cannot move past 100, stays put
        this.state.lastActionDescription = `${currentTeam.name} rolled a ${roll}, but needs exact number to reach 100! Remains on square ${startSquare}.`;
        this.advanceTurn();
        return;
      }
    } else {
      // REACH_OR_PASS: capped at 100
      if (targetSquare >= BOARD_SIZE) {
        targetSquare = BOARD_SIZE;
      }
    }

    // Start square-by-square movement animation
    this.state.phase = 'MOVING';
    this.emit();

    let currentStep = startSquare;
    const stepInterval = setInterval(() => {
      if (currentStep < targetSquare) {
        currentStep++;
        soundManager.playStep();
        const updated = [...this.state.teams];
        updated[this.state.activeTeamIndex] = {
          ...updated[this.state.activeTeamIndex],
          currentSquare: currentStep,
        };
        this.state.teams = updated;
        this.emit();
      } else {
        clearInterval(stepInterval);
        this.checkFinalSquareAndSnakesLadders(targetSquare);
      }
    }, 180);
  }

  private checkFinalSquareAndSnakesLadders(landingSquare: number) {
    const currentTeam = this.state.teams[this.state.activeTeamIndex];

    // Check if reached square 100 -> VICTORY!
    if (landingSquare >= BOARD_SIZE) {
      this.state.phase = 'VICTORY';
      this.state.winningTeamId = currentTeam.id;
      this.state.lastActionDescription = `🏆 ${currentTeam.name} telah sampai di Petak 100 dan memenangi permainan!`;
      soundManager.playVictory();
      this.emit();
      return;
    }

    // Check ladders (Foot of ladder -> climb up to top)
    const ladder = LADDERS.find((l) => l.start === landingSquare);
    if (ladder) {
      this.state.phase = 'SNAKE_LADDER_ANIM';
      this.state.snakeLadderEncounter = {
        type: 'ladder',
        from: ladder.start,
        to: ladder.end,
      };
      this.state.lastActionDescription = `🪜 TAHNIAH! ${currentTeam.name} mendarat di KAKI TANGGA Petak ${ladder.start}! Memanjat ke Petak ${ladder.end}!`;
      soundManager.playLadderClimb();
      this.emit();

      // Pause for 1000ms on ladder base so classroom clearly sees exact landing
      setTimeout(() => {
        let step = ladder.start;
        const climbInterval = setInterval(() => {
          if (step < ladder.end) {
            step++;
            soundManager.playStep();
            const updated = [...this.state.teams];
            updated[this.state.activeTeamIndex] = {
              ...updated[this.state.activeTeamIndex],
              currentSquare: step,
            };
            this.state.teams = updated;
            this.emit();
          } else {
            clearInterval(climbInterval);
            this.state.lastActionDescription = `🪜 ${currentTeam.name} kini selamat sampai di Petak ${ladder.end}!`;
            this.emit();

            // Pause for 1200ms on destination so classroom sees final position
            setTimeout(() => {
              this.state.snakeLadderEncounter = null;
              this.advanceTurn();
            }, 1200);
          }
        }, 80);
      }, 1000);
      return;
    }

    // Check snakes (Head of snake -> slide down to tail)
    const snake = SNAKES.find((s) => s.start === landingSquare);
    if (snake) {
      this.state.phase = 'SNAKE_LADDER_ANIM';
      this.state.snakeLadderEncounter = {
        type: 'snake',
        from: snake.start,
        to: snake.end,
      };
      this.state.lastActionDescription = `🐍 AWAS! ${currentTeam.name} mendarat di KEPALA ULAR Petak ${snake.start}! Menggelongsor turun ke Petak ${snake.end}!`;
      soundManager.playSnakeSlide();
      this.emit();

      // Pause for 1000ms on snake head so classroom clearly sees exact landing
      setTimeout(() => {
        let step = snake.start;
        const slideInterval = setInterval(() => {
          if (step > snake.end) {
            step--;
            soundManager.playStep();
            const updated = [...this.state.teams];
            updated[this.state.activeTeamIndex] = {
              ...updated[this.state.activeTeamIndex],
              currentSquare: step,
            };
            this.state.teams = updated;
            this.emit();
          } else {
            clearInterval(slideInterval);
            this.state.lastActionDescription = `🐍 ${currentTeam.name} kini berada di Petak ${snake.end}.`;
            this.emit();

            // Pause for 1200ms on destination so classroom sees final position
            setTimeout(() => {
              this.state.snakeLadderEncounter = null;
              this.advanceTurn();
            }, 1200);
          }
        }, 80);
      }, 1000);
      return;
    }

    // Clean normal landing: short pause so everyone sees the arrival before next turn
    setTimeout(() => {
      this.advanceTurn();
    }, 600);
  }

  // Advances active team pointer
  public advanceTurn() {
    let nextIndex = (this.state.activeTeamIndex + 1) % this.state.teams.length;
    let nextTurnNum = this.state.turnNumber;
    if (nextIndex === 0) {
      nextTurnNum += 1;
    }

    this.state.activeTeamIndex = nextIndex;
    this.state.turnNumber = nextTurnNum;
    this.state.diceValue = null;
    this.state.currentQuestion = null;
    this.state.selectedAnswer = null;
    this.state.isAnswerCorrect = null;
    this.state.phase = 'AWAIT_ROLL';
    this.state.lastActionDescription = `Turn ${nextTurnNum}: ${this.state.teams[nextIndex].name}'s turn. Roll the dice!`;
    this.emit();

    // Check if the new active team has a skip penalty
    this.checkCurrentTeamSkip();
  }

  // Teacher manual override for team position or square
  public overrideTeamSquare(teamId: string, newSquare: number) {
    this.pushSnapshot(`Teacher manual override position for team ${teamId}`);
    const clamped = Math.max(1, Math.min(BOARD_SIZE, newSquare));
    const updated = this.state.teams.map((t) => (t.id === teamId ? { ...t, currentSquare: clamped } : t));
    this.state.teams = updated;
    this.emit();
  }
}
