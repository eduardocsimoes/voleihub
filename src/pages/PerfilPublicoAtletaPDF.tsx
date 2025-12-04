// src/pages/PerfilPublicoAtletaPDF.tsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getUserProfile,
  AtletaProfile,
  CareerExperience,
  Achievement,
} from "../firebase/firestore";

export default function PerfilPublicoAtletaPDF() {
  const { id } = useParams();
  const [atleta, setAtleta] = useState<AtletaProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregar = async () => {
      if (!id) return;
      const perfil = await getUserProfile(id);
      setAtleta(perfil);
      setLoading(false);
    };
    carregar();
  }, [id]);

  if (loading || !atleta)
    return <div style={{ padding: 40, fontFamily: "Arial" }}>Carregando...</div>;

  const idade = atleta.birthDate
    ? new Date().getFullYear() - new Date(atleta.birthDate).getFullYear()
    : null;

  const carreiraOrdenada = [...(atleta.experiences || [])].sort(
    (a, b) => a.startYear - b.startYear
  );

  const conquistasOrdenadas = [...(atleta.achievements || [])].sort(
    (a, b) => b.year - a.year
  );

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 900,
        margin: "0 auto",
        padding: 40,
        fontFamily: "Arial, sans-serif",
        color: "#000",
      }}
    >
      {/* Cabeçalho */}
      <div style={{ textAlign: "center", marginBottom: 30 }}>
        <h1 style={{ margin: 0, fontSize: 32 }}>{atleta.name}</h1>
        {atleta.position && (
          <p style={{ fontSize: 16, marginTop: 6 }}>{atleta.position}</p>
        )}
        {idade && (
          <p style={{ fontSize: 14, marginTop: 4 }}>Idade: {idade} anos</p>
        )}
      </div>

      {/* Informações Básicas */}
      <h2 style={{ fontSize: 22, borderBottom: "2px solid #000" }}>
        Informações Gerais
      </h2>

      <table style={{ width: "100%", marginTop: 10, marginBottom: 25 }}>
        <tbody>
          <tr>
            <td style={{ fontWeight: "bold", width: 160 }}>Altura:</td>
            <td>{atleta.height ? `${atleta.height} cm` : "-"}</td>
          </tr>
          <tr>
            <td style={{ fontWeight: "bold" }}>Peso:</td>
            <td>{atleta.weight ? `${atleta.weight} kg` : "-"}</td>
          </tr>
          <tr>
            <td style={{ fontWeight: "bold" }}>Localidade:</td>
            <td>
              {atleta.city}/{atleta.state}
            </td>
          </tr>
          <tr>
            <td style={{ fontWeight: "bold" }}>Contato:</td>
            <td>{atleta.email}</td>
          </tr>
          {atleta.phone && (
            <tr>
              <td style={{ fontWeight: "bold" }}>Telefone:</td>
              <td>{atleta.phone}</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Bio */}
      {atleta.bio && (
        <>
          <h2 style={{ fontSize: 22, borderBottom: "2px solid #000" }}>
            Resumo Profissional
          </h2>
          <p style={{ marginTop: 10, marginBottom: 25 }}>{atleta.bio}</p>
        </>
      )}

      {/* Histórico de Clubes */}
      <h2 style={{ fontSize: 22, borderBottom: "2px solid #000" }}>
        Histórico de Clubes
      </h2>

      <table style={{ width: "100%", marginTop: 10, marginBottom: 25 }}>
        <thead>
          <tr style={{ fontWeight: "bold", borderBottom: "1px solid #000" }}>
            <td>Clube</td>
            <td>Posição</td>
            <td>Período</td>
          </tr>
        </thead>
        <tbody>
          {carreiraOrdenada.map((exp) => (
            <tr key={exp.id}>
              <td>{exp.clubName}</td>
              <td>{exp.position}</td>
              <td>
                {exp.startYear} – {exp.endYear || "Atual"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Títulos */}
      <h2 style={{ fontSize: 22, borderBottom: "2px solid #000" }}>
        Conquistas e Resultados
      </h2>

      <table style={{ width: "100%", marginTop: 10 }}>
        <thead>
          <tr style={{ fontWeight: "bold", borderBottom: "1px solid #000" }}>
            <td>Competição</td>
            <td>Clube</td>
            <td>Ano</td>
            <td>Resultado</td>
          </tr>
        </thead>
        <tbody>
          {conquistasOrdenadas.map((c) => (
            <tr key={c.id}>
              <td>{c.championship}</td>
              <td>{c.club}</td>
              <td>{c.year}</td>
              <td>{c.placement || c.award || "Participação"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p style={{ marginTop: 40, textAlign: "center", fontSize: 12 }}>
        Gerado automaticamente pela plataforma VôleiHub
      </p>
    </div>
  );
}
