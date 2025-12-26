import React from "react";
import AthletePresentationCard from "../../components/AthletePresentationCard";
import { useAuth } from "../../contexts/AuthContext";
import { useUserProfile } from "../../hooks/useUserProfile"; // se já existir

export default function AthleteCardPage() {
  const { user } = useAuth();
  const profile = useUserProfile(user?.uid);

  if (!profile) {
    return <p className="text-gray-400">Carregando perfil...</p>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold text-white">
        Cartão de Apresentação
      </h1>

      <AthletePresentationCard
        name={profile.name}
        photoUrl={profile.photoURL}
        position={profile.position}
        heightCm={profile.height}
        club={profile.club}
        city={profile.city}
        state={profile.state}
        highlight={profile.mainHighlight}
      />
    </div>
  );
}
