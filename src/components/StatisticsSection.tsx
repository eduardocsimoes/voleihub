import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, Award, Target, Zap } from 'lucide-react';

export default function StatisticsSection() {
  // Dados para o gráfico de evolução da carreira
  const careerData = [
    { year: '2018', jogos: 12, vitorias: 8, titulos: 0 },
    { year: '2019', jogos: 28, vitorias: 18, titulos: 0 },
    { year: '2020', jogos: 24, vitorias: 15, titulos: 1 },
    { year: '2021', jogos: 32, vitorias: 22, titulos: 0 },
    { year: '2022', jogos: 35, vitorias: 25, titulos: 1 },
    { year: '2023', jogos: 38, vitorias: 28, titulos: 0 },
    { year: '2024', jogos: 42, vitorias: 32, titulos: 1 },
  ];

  // Dados para o radar de habilidades
  const skillsData = [
    { skill: 'Saque', value: 85 },
    { skill: 'Bloqueio', value: 78 },
    { skill: 'Ataque', value: 92 },
    { skill: 'Defesa', value: 75 },
    { skill: 'Recepção', value: 88 },
    { skill: 'Levantamento', value: 70 },
  ];

  // Dados para performance mensal
  const monthlyData = [
    { month: 'Jan', aproveitamento: 75 },
    { month: 'Fev', aproveitamento: 78 },
    { month: 'Mar', aproveitamento: 82 },
    { month: 'Abr', aproveitamento: 80 },
    { month: 'Mai', aproveitamento: 85 },
    { month: 'Jun', aproveitamento: 88 },
  ];

  const stats = [
    {
      label: 'Aproveitamento',
      value: '82%',
      change: '+5%',
      icon: TrendingUp,
      color: 'green',
    },
    {
      label: 'Pontos/Jogo',
      value: '15.3',
      change: '+2.1',
      icon: Award,
      color: 'blue',
    },
    {
      label: 'Aces/Jogo',
      value: '1.8',
      change: '+0.3',
      icon: Target,
      color: 'orange',
    },
    {
      label: 'Bloqueios/Jogo',
      value: '2.5',
      change: '+0.5',
      icon: Zap,
      color: 'purple',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Estatísticas Detalhadas</h2>
        <p className="text-gray-400">Análise completa do seu desempenho profissional</p>
      </div>

      {/* Cards de Estatísticas Rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-5 border border-gray-700 hover:border-orange-500/50 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg bg-${stat.color}-500/20 flex items-center justify-center`}>
                  <Icon size={20} className={`text-${stat.color}-500`} />
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full bg-${stat.color}-500/20 text-${stat.color}-500`}>
                  {stat.change}
                </span>
              </div>
              <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evolução da Carreira */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
          <h3 className="text-white font-semibold mb-4">Evolução da Carreira</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={careerData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="year" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="jogos"
                stroke="#F97316"
                strokeWidth={2}
                name="Jogos"
              />
              <Line
                type="monotone"
                dataKey="vitorias"
                stroke="#10B981"
                strokeWidth={2}
                name="Vitórias"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Radar de Habilidades */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
          <h3 className="text-white font-semibold mb-4">Radar de Habilidades</h3>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={skillsData}>
              <PolarGrid stroke="#374151" />
              <PolarAngleAxis dataKey="skill" stroke="#9CA3AF" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#9CA3AF" />
              <Radar
                name="Habilidades"
                dataKey="value"
                stroke="#F97316"
                fill="#F97316"
                fillOpacity={0.3}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Performance Mensal */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700 lg:col-span-2">
          <h3 className="text-white font-semibold mb-4">Aproveitamento Mensal (2024)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar
                dataKey="aproveitamento"
                fill="#F97316"
                radius={[8, 8, 0, 0]}
                name="Aproveitamento %"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabela de Comparação */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
        <h3 className="text-white font-semibold mb-4">Comparação por Temporada</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left text-gray-400 font-medium pb-3">Temporada</th>
                <th className="text-center text-gray-400 font-medium pb-3">Jogos</th>
                <th className="text-center text-gray-400 font-medium pb-3">Vitórias</th>
                <th className="text-center text-gray-400 font-medium pb-3">Títulos</th>
                <th className="text-center text-gray-400 font-medium pb-3">Aproveit.</th>
              </tr>
            </thead>
            <tbody>
              {careerData.slice().reverse().map((season, index) => (
                <tr key={season.year} className="border-b border-gray-700/50">
                  <td className="py-3 text-white font-medium">{season.year}</td>
                  <td className="text-center text-gray-300">{season.jogos}</td>
                  <td className="text-center text-green-500 font-medium">{season.vitorias}</td>
                  <td className="text-center text-yellow-500 font-medium">{season.titulos}</td>
                  <td className="text-center text-orange-500 font-medium">
                    {Math.round((season.vitorias / season.jogos) * 100)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}