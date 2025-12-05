import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getFollowers } from "../firebase/follow";
import { FollowUserSummary } from "../firebase/follow";

export default function SeguidoresAtleta() {
  const { id } = useParams();
  const [users, setUsers] = useState<FollowUserSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!id) return;
      const lista = await getFollowers(id);
      setUsers(lista);
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) return <div className="p-4 text-white">Carregando...</div>;

  return (
    <div className="text-white p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Seguidores</h1>

      {users.length === 0 && (
        <p className="text-gray-400">Nenhum seguidor encontrado.</p>
      )}

      <div className="space-y-4">
        {users.map((u) => (
          <div
            key={u.uid}
            className="flex items-center gap-3 bg-gray-800 p-3 rounded-xl border border-gray-700"
          >
            <img
              src={u.photoURL || "https://via.placeholder.com/40"}
              className="w-12 h-12 rounded-full object-cover"
            />

            <div>
              <p className="font-semibold">{u.name}</p>
              <p className="text-sm text-gray-400">{u.uid}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
