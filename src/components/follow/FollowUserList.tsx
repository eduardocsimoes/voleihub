// src/components/follow/FollowUserList.tsx
import React from "react";
import { User as UserIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { FollowUserSummary } from "../../firebase/follow";

interface FollowUserListProps {
  users: FollowUserSummary[];
  emptyMessage: string;
}

export default function FollowUserList({
  users,
  emptyMessage,
}: FollowUserListProps) {

  if (!users || users.length === 0) {
    return (
      <p className="text-sm text-gray-400 text-center py-8">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {users.map((user) => (
        <div
          key={user.uid}
          className="flex items-center justify-between bg-gray-900/70 border border-gray-700/70 rounded-xl px-4 py-3"
        >
          <div className="flex items-center gap-3">
            {/* Foto ou iniciais */}
            {user.photoURL ? (
            <img
                src={user.photoURL}
                alt={user.name || "Foto do atleta"}
                className="w-10 h-10 rounded-full object-cover"
            />
            ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold">
                {(user.name || "?").charAt(0).toUpperCase()}
            </div>
            )}

            {/* Nome + tipo */}
            <div>
              <p className="text-sm font-semibold text-white flex items-center gap-2">
                {user.name}

                {user.userType && (
                  <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-gray-800 text-gray-300 border border-gray-700">
                    {user.userType}
                  </span>
                )}
              </p>

              <p className="text-xs text-gray-400 flex items-center gap-1">
                <UserIcon size={12} />
                Perfil VôleiHub
              </p>
            </div>
          </div>

          {/* Botão abrir perfil */}
          <Link
            to={`/perfil/${user.uid}`}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-600 text-gray-100 hover:border-orange-500 hover:bg-orange-500/10 transition-colors"
          >
            Ver perfil
          </Link>
        </div>
      ))}
    </div>
  );
}
