// services/cardStateService.ts - Serviço para gerenciar estados dos cards no Firebase

import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    collection,
    query,
    where,
    getDocs,
    deleteDoc,
    onSnapshot,
    Timestamp,
    writeBatch,
  } from "firebase/firestore";
  import { db } from "../firebase/config";
  import { CardState, Achievement, CardData, CollectionStats, NotificationData } from "../types/cardSystem";
  import { calculateCardRarity, calculateCardImportance, shouldGenerateCard } from "../utils/cardUtils";
  
  /**
   * Serviço para gerenciar o estado dos cards no Firestore
   */
  export class CardStateService {
    private userId: string;
  
    constructor(userId: string) {
      this.userId = userId;
    }
  
    /**
     * Inicializa estados dos cards para todas as conquistas existentes
     * Executa apenas uma vez quando o usuário acessa pela primeira vez
     */
    async initializeCardStates(achievements: Achievement[]): Promise<void> {
      const batch = writeBatch(db);
      const cardStatesRef = collection(db, "users", this.userId, "cardStates");
      
      for (const achievement of achievements) {
        if (!shouldGenerateCard(achievement)) continue;
        
        const cardStateRef = doc(cardStatesRef, achievement.id);
        const existingState = await getDoc(cardStateRef);
        
        // Só cria se não existir
        if (!existingState.exists()) {
          const cardState: CardState = {
            achievementId: achievement.id,
            revealed: false, // TODOS começam fechados
            revealedAt: null,
            rarity: calculateCardRarity(achievement),
            viewCount: 0,
            createdAt: new Date(),
            lastViewedAt: null,
          };
          
          batch.set(cardStateRef, {
            ...cardState,
            createdAt: Timestamp.fromDate(cardState.createdAt),
          });
        }
      }
      
      await batch.commit();
    }
  
    /**
     * Cria estado de card para nova conquista cadastrada
     */
    async createCardState(achievement: Achievement): Promise<void> {
      if (!shouldGenerateCard(achievement)) return;
      
      const cardStateRef = doc(db, "users", this.userId, "cardStates", achievement.id);
      
      const cardState: CardState = {
        achievementId: achievement.id,
        revealed: false,
        revealedAt: null,
        rarity: calculateCardRarity(achievement),
        viewCount: 0,
        createdAt: new Date(),
        lastViewedAt: null,
      };
      
      await setDoc(cardStateRef, {
        ...cardState,
        createdAt: Timestamp.fromDate(cardState.createdAt),
      });
      
      // Cria notificação de novo card
      await this.createNotification({
        type: "new_card",
        title: "🎉 Novo Card Desbloqueado!",
        message: `Você ganhou um card ${cardState.rarity.toUpperCase()}! Clique para revelar.`,
        cardId: achievement.id,
      });
    }
  
    /**
     * Revela um card (marca como revealed)
     */
    async revealCard(achievementId: string): Promise<void> {
      const cardStateRef = doc(db, "users", this.userId, "cardStates", achievementId);
      
      await updateDoc(cardStateRef, {
        revealed: true,
        revealedAt: Timestamp.fromDate(new Date()),
        viewCount: 1,
        lastViewedAt: Timestamp.fromDate(new Date()),
      });
      
      // Verifica se desbloqueou alguma meta-conquista
      await this.checkMetaAchievements();
    }
  
    /**
     * Incrementa contador de visualizações de um card
     */
    async incrementViewCount(achievementId: string): Promise<void> {
      const cardStateRef = doc(db, "users", this.userId, "cardStates", achievementId);
      const cardState = await getDoc(cardStateRef);
      
      if (cardState.exists()) {
        const currentCount = cardState.data().viewCount || 0;
        await updateDoc(cardStateRef, {
          viewCount: currentCount + 1,
          lastViewedAt: Timestamp.fromDate(new Date()),
        });
      }
    }
  
    /**
     * Deleta estado de card quando conquista é excluída
     */
    async deleteCardState(achievementId: string): Promise<void> {
      const cardStateRef = doc(db, "users", this.userId, "cardStates", achievementId);
      await deleteDoc(cardStateRef);
    }
  
    /**
     * Busca todos os estados de cards do usuário
     */
    async getAllCardStates(): Promise<CardState[]> {
      const cardStatesRef = collection(db, "users", this.userId, "cardStates");
      const snapshot = await getDocs(cardStatesRef);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          revealedAt: data.revealedAt?.toDate() || null,
          lastViewedAt: data.lastViewedAt?.toDate() || null,
        } as CardState;
      });
    }
  
    /**
     * Busca estado de um card específico
     */
    async getCardState(achievementId: string): Promise<CardState | null> {
      const cardStateRef = doc(db, "users", this.userId, "cardStates", achievementId);
      const snapshot = await getDoc(cardStateRef);
      
      if (!snapshot.exists()) return null;
      
      const data = snapshot.data();
      return {
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        revealedAt: data.revealedAt?.toDate() || null,
        lastViewedAt: data.lastViewedAt?.toDate() || null,
      } as CardState;
    }
  
    /**
     * Combina conquistas com seus estados para criar CardData[]
     */
    async getCardsData(achievements: Achievement[]): Promise<CardData[]> {
      const states = await this.getAllCardStates();
      const statesMap = new Map(states.map(s => [s.achievementId, s]));
      
      const cardsData: CardData[] = [];
      
      for (const achievement of achievements) {
        if (!shouldGenerateCard(achievement)) continue;
        
        let state = statesMap.get(achievement.id);
        
        // Se não tem estado, cria um
        if (!state) {
          await this.createCardState(achievement);
          const newState = await this.getCardState(achievement.id);
          if (!newState) continue;
          state = newState;
        }
        
        cardsData.push({
          achievement,
          state,
          score: calculateCardImportance(achievement),
        });
      }
      
      return cardsData;
    }
  
    /**
     * Calcula estatísticas da coleção
     */
    async getCollectionStats(cardsData: CardData[]): Promise<CollectionStats> {
      const totalCards = cardsData.length;
      const revealedCards = cardsData.filter(c => c.state.revealed).length;
      const lockedCards = totalCards - revealedCards;
      
      const byRarity = {
        legendary: cardsData.filter(c => c.state.rarity === "legendary").length,
        epic: cardsData.filter(c => c.state.rarity === "epic").length,
        rare: cardsData.filter(c => c.state.rarity === "rare").length,
        common: cardsData.filter(c => c.state.rarity === "common").length,
      };
      
      const byYear: Record<number, number> = {};
      cardsData.forEach(card => {
        const year = card.achievement.year;
        byYear[year] = (byYear[year] || 0) + 1;
      });
      
      const completionPercentage = totalCards > 0 ? (revealedCards / totalCards) * 100 : 0;
      
      const revealedDates = cardsData
        .filter(c => c.state.revealedAt)
        .map(c => c.state.revealedAt!)
        .sort((a, b) => b.getTime() - a.getTime());
      
      const lastRevealedAt = revealedDates.length > 0 ? revealedDates[0] : null;
      
      // Calcula streak (dias consecutivos revelando)
      const streakDays = this.calculateStreak(revealedDates);
      
      return {
        totalCards,
        revealedCards,
        lockedCards,
        byRarity,
        byYear,
        completionPercentage,
        lastRevealedAt,
        streakDays,
      };
    }
  
    /**
     * Calcula quantos dias consecutivos o usuário revelou cards
     */
    private calculateStreak(revealedDates: Date[]): number {
      if (revealedDates.length === 0) return 0;
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      let streak = 0;
      let currentDate = new Date(today);
      
      for (let i = 0; i < revealedDates.length; i++) {
        const revealDate = new Date(revealedDates[i]);
        revealDate.setHours(0, 0, 0, 0);
        
        if (revealDate.getTime() === currentDate.getTime()) {
          streak++;
          currentDate.setDate(currentDate.getDate() - 1);
        } else if (revealDate.getTime() < currentDate.getTime()) {
          break;
        }
      }
      
      return streak;
    }
  
    /**
     * Escuta mudanças em tempo real nos estados dos cards
     */
    subscribeToCardStates(callback: (states: CardState[]) => void): () => void {
      const cardStatesRef = collection(db, "users", this.userId, "cardStates");
      
      const unsubscribe = onSnapshot(cardStatesRef, (snapshot) => {
        const states = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            revealedAt: data.revealedAt?.toDate() || null,
            lastViewedAt: data.lastViewedAt?.toDate() || null,
          } as CardState;
        });
        
        callback(states);
      });
      
      return unsubscribe;
    }
  
    /**
     * Cria uma notificação
     */
    async createNotification(data: {
      type: NotificationData["type"];
      title: string;
      message: string;
      cardId?: string;
      metaAchievementId?: string;
    }): Promise<void> {
      const notificationsRef = collection(db, "users", this.userId, "notifications");
      const notificationId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const notification: NotificationData = {
        id: notificationId,
        type: data.type,
        title: data.title,
        message: data.message,
        cardId: data.cardId,
        metaAchievementId: data.metaAchievementId,
        read: false,
        createdAt: new Date(),
      };
      
      await setDoc(doc(notificationsRef, notificationId), {
        ...notification,
        createdAt: Timestamp.fromDate(notification.createdAt),
      });
    }
  
    /**
     * Busca notificações não lidas
     */
    async getUnreadNotifications(): Promise<NotificationData[]> {
      const notificationsRef = collection(db, "users", this.userId, "notifications");
      const q = query(notificationsRef, where("read", "==", false));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          expiresAt: data.expiresAt?.toDate() || undefined,
        } as NotificationData;
      }).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
  
    /**
     * Marca notificação como lida
     */
    async markNotificationAsRead(notificationId: string): Promise<void> {
      const notificationRef = doc(db, "users", this.userId, "notifications", notificationId);
      await updateDoc(notificationRef, { read: true });
    }
  
    /**
     * Verifica e desbloqueia meta-conquistas
     */
    private async checkMetaAchievements(): Promise<void> {
      // Implementação das meta-conquistas será feita em metaAchievements.ts
      // Este método será chamado sempre que um card for revelado
    }
  }