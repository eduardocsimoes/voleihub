// CardsCollectionPage.tsx - Página Principal da Coleção de Cards

import React, { useEffect, useState, useMemo } from "react";
import { auth } from "../firebase/config";
import { getUserProfile } from "../firebase/firestore";
import { CardStateService } from "../services/cardStateService";
import { checkUnlockedMetaAchievements } from "../services/metaAchievements";
import { CardData, CollectionStats, MetaAchievement, NotificationData, Achievement } from "../types/cardSystem";
import CardGallery from "../components/cards/CardGallery";
import CardRevealAnimation from "../components/cards/CardRevealAnimation";
import PremiumAchievementCard from "../components/premium/PremiumAchievementCard";
import { CollectionStatsPanel, NotificationBanner, MetaAchievementsList } from "../components/cards/auxiliary";
import { Trophy, Star, Bell, Loader } from "lucide-react";

export default function CardsCollectionPage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [cards, setCards] = useState<CardData[]>([]);
  const [stats, setStats] = useState<CollectionStats | null>(null);
  const [metaAchievements, setMetaAchievements] = useState<MetaAchievement[]>([]);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  
  const [revealingCardId, setRevealingCardId] = useState<string | null>(null);
  const [viewingCardId, setViewingCardId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"gallery" | "stats" | "meta">("gallery");

  const [cardService, setCardService] = useState<CardStateService | null>(null);

  // ========== INICIALIZAÇÃO ==========
  useEffect(() => {
    async function initialize() {
      try {
        const uid = auth.currentUser?.uid;
        if (!uid) {
          setLoading(false);
          return;
        }

        // Inicializa serviço
        const service = new CardStateService(uid);
        setCardService(service);

        // Carrega perfil
        const profileData = await getUserProfile(uid);
        setProfile(profileData);

        // Inicializa estados dos cards (primeira vez)
        if (profileData?.achievements && Array.isArray(profileData.achievements)) {
          await service.initializeCardStates(profileData.achievements as Achievement[]);
        }

        // Carrega dados dos cards
        await loadCardsData(service, profileData);

        // Carrega notificações
        await loadNotifications(service);

      } catch (error) {
        console.error("Erro ao inicializar:", error);
      } finally {
        setLoading(false);
      }
    }

    initialize();
  }, []);

  // ========== CARREGA DADOS DOS CARDS ==========
  async function loadCardsData(service: CardStateService, profileData: any) {
    if (!profileData.achievements) return;

    const cardsData = await service.getCardsData(profileData.achievements);
    setCards(cardsData);

    const collectionStats = await service.getCollectionStats(cardsData);
    setStats(collectionStats);

    // Carrega meta-conquistas
    const unlockedMetaIds: string[] = []; // TODO: Buscar do Firestore quais já foram desbloqueadas
    const metaAchievementsData = checkUnlockedMetaAchievements(
      collectionStats,
      cardsData,
      unlockedMetaIds
    );
    setMetaAchievements(metaAchievementsData);
  }

  // ========== CARREGA NOTIFICAÇÕES ==========
  async function loadNotifications(service: CardStateService) {
    const unreadNotifications = await service.getUnreadNotifications();
    setNotifications(unreadNotifications);
  }

  // ========== LISTENER EM TEMPO REAL ==========
  useEffect(() => {
    if (!cardService) return;

    const unsubscribe = cardService.subscribeToCardStates(async (newStates) => {
      // Recarrega dados quando houver mudança
      if (profile) {
        await loadCardsData(cardService, profile);
      }
    });

    return () => unsubscribe();
  }, [cardService, profile]);

  // ========== REVELAR CARD ==========
  async function handleRevealCard(cardId: string) {
    if (!cardService) return;

    setRevealingCardId(cardId);
  }

  async function handleRevealComplete() {
    if (!cardService || !revealingCardId) return;

    try {
      // Marca card como revelado
      await cardService.revealCard(revealingCardId);

      // Recarrega dados
      if (profile) {
        await loadCardsData(cardService, profile);
      }

      // Limpa estado
      setRevealingCardId(null);

      // Recarrega notificações
      await loadNotifications(cardService);

    } catch (error) {
      console.error("Erro ao revelar card:", error);
      setRevealingCardId(null);
    }
  }

  // ========== VISUALIZAR CARD ==========
  async function handleViewCard(cardId: string) {
    if (!cardService) return;

    setViewingCardId(cardId);

    // Incrementa contador de visualização
    await cardService.incrementViewCount(cardId);
  }

  // ========== FECHAR VISUALIZAÇÃO ==========
  function handleCloseView() {
    setViewingCardId(null);
  }

  // ========== NOTIFICAÇÕES ==========
  async function handleDismissNotification(notificationId: string) {
    if (!cardService) return;

    await cardService.markNotificationAsRead(notificationId);
    await loadNotifications(cardService);
  }

  async function handleClickNotification(notification: NotificationData) {
    if (!cardService) return;

    // Marca como lida
    await cardService.markNotificationAsRead(notification.id);

    // Abre card se for notificação de novo card
    if (notification.type === "new_card" && notification.cardId) {
      setRevealingCardId(notification.cardId);
    }

    // Recarrega notificações
    await loadNotifications(cardService);
  }

  // ========== CARDS PARA EXIBIÇÃO ==========
  const revealingCard = useMemo(() => {
    return cards.find((c) => c.achievement.id === revealingCardId);
  }, [cards, revealingCardId]);

  const viewingCard = useMemo(() => {
    return cards.find((c) => c.achievement.id === viewingCardId);
  }, [cards, viewingCardId]);

  // ========== LOADING ==========
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader className="animate-spin text-purple-500 mx-auto" size={48} />
          <p className="text-slate-400">Carregando sua coleção...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <p className="text-slate-400">Perfil não encontrado.</p>
      </div>
    );
  }

  // ========== ANIMAÇÃO DE REVEAL ==========
  if (revealingCardId && revealingCard) {
    return (
      <CardRevealAnimation
        onRevealComplete={handleRevealComplete}
        autoPlay={true}
        rarity={revealingCard.state.rarity}
      >
        <PremiumAchievementCard
          athleteName={profile.name}
          profilePhotoUrl={profile.photoURL}
          position={profile.position}
          championship={revealingCard.achievement.championship || revealingCard.achievement.title || ""}
          championshipCategory={revealingCard.achievement.championshipCategory}
          year={revealingCard.achievement.year}
          club={revealingCard.achievement.club || ""}
          achievement={revealingCard.achievement}
          allAchievements={profile.achievements || []}
          format="feed"
          brandText="voleihub.com"
        />
      </CardRevealAnimation>
    );
  }

  // ========== MODAL DE VISUALIZAÇÃO ==========
  if (viewingCardId && viewingCard) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
        <div className="relative max-w-md mx-4">
          <button
            onClick={handleCloseView}
            className="absolute -top-12 right-0 text-white hover:text-red-500 transition-colors"
          >
            <span className="text-sm font-medium">Fechar (ESC)</span>
          </button>

          <div className="scale-90 origin-center">
            <PremiumAchievementCard
              athleteName={profile.name}
              profilePhotoUrl={profile.photoURL}
              position={profile.position}
              championship={viewingCard.achievement.championship || viewingCard.achievement.title || ""}
              championshipCategory={viewingCard.achievement.championshipCategory}
              year={viewingCard.achievement.year}
              club={viewingCard.achievement.club || ""}
              achievement={viewingCard.achievement}
              allAchievements={profile.achievements || []}
              format="feed"
              brandText="voleihub.com"
            />
          </div>
        </div>
      </div>
    );
  }

  // ========== RENDER PRINCIPAL ==========
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Notificações */}
      <NotificationBanner
        notifications={notifications}
        onDismiss={handleDismissNotification}
        onClickNotification={handleClickNotification}
      />

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl md:text-5xl font-black text-white">
            Coleção de{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500">
              Conquistas
            </span>
          </h1>
          <p className="text-slate-400">
            Revele seus cards e desbloqueie conquistas especiais
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-slate-900/60 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-2">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("gallery")}
              className={`
                flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold transition-all
                ${
                  activeTab === "gallery"
                    ? "bg-purple-600 text-white shadow-lg"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                }
              `}
            >
              <Trophy size={20} />
              <span>Gallery</span>
              {cards.filter((c) => !c.state.revealed).length > 0 && (
                <span className="px-2 py-0.5 bg-pink-600 text-white text-xs font-black rounded-full">
                  {cards.filter((c) => !c.state.revealed).length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("stats")}
              className={`
                flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold transition-all
                ${
                  activeTab === "stats"
                    ? "bg-purple-600 text-white shadow-lg"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                }
              `}
            >
              <Bell size={20} />
              <span>Estatísticas</span>
            </button>

            <button
              onClick={() => setActiveTab("meta")}
              className={`
                flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold transition-all
                ${
                  activeTab === "meta"
                    ? "bg-purple-600 text-white shadow-lg"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                }
              `}
            >
              <Star size={20} />
              <span>Conquistas</span>
              {metaAchievements.filter((m) => m.unlocked).length > 0 && (
                <span className="px-2 py-0.5 bg-yellow-600 text-white text-xs font-black rounded-full">
                  {metaAchievements.filter((m) => m.unlocked).length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Conteúdo das tabs */}
        {activeTab === "gallery" && stats && (
          <CardGallery
            cards={cards}
            stats={stats}
            onRevealCard={handleRevealCard}
            onViewCard={handleViewCard}
            groupByYear={true}
          />
        )}

        {activeTab === "stats" && stats && <CollectionStatsPanel stats={stats} />}

        {activeTab === "meta" && <MetaAchievementsList metaAchievements={metaAchievements} />}
      </div>

      {/* Listener de ESC para fechar modal */}
      {viewingCardId && (
        <div
          className="fixed inset-0 z-40"
          onClick={handleCloseView}
          onKeyDown={(e) => e.key === "Escape" && handleCloseView()}
        />
      )}
    </div>
  );
}