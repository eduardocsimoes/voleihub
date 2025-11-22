const Dashboard = () => {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
  
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow p-4">
            <h2 className="text-gray-500 text-sm">Total de Atletas</h2>
            <p className="text-3xl font-bold">120</p>
          </div>
  
          <div className="bg-white rounded-xl shadow p-4">
            <h2 className="text-gray-500 text-sm">Avaliações Pendentes</h2>
            <p className="text-3xl font-bold">8</p>
          </div>
  
          <div className="bg-white rounded-xl shadow p-4">
            <h2 className="text-gray-500 text-sm">Treinos Hoje</h2>
            <p className="text-3xl font-bold">5</p>
          </div>
        </div>
      </div>
    );
  };
  
  export default Dashboard;
  