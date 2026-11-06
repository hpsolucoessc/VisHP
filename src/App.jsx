import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, ShoppingCart, FileText, CheckSquare, Plus, Trash2, 
  Camera, Check, Printer, Download, ArrowLeft, Building2, Save, Upload, RefreshCw
} from 'lucide-react';

export default function App() {
  // Estados principais
  const [activeTab, setActiveTab] = useState('visita');
  const [escolaAtual, EscolaAtual] = useState('EEB Prof. Gertrud Rita Bullet - Itajaí');
  const [listaEscolas, setListaEscolas] = useState([
    'EEB Prof. Gertrud Rita Bullet - Itajaí',
    'EEB Olegário Bernardes - Ilhota',
    'EM Profª Maria da Glória - Itajaí'
  ]);
  const [novoNomeEscola, setNovoNomeEscola] = useState('');
  const [isModalEscolaOpen, setIsModalEscolaOpen] = useState(false);

  // Dados do Orçamento HP Soluções
  const [companyInfo, setCompanyInfo] = useState({
    name: 'HP Comércio e Serviços Integrados Ltda',
    cnpj: '66.799.072/0001-59',
    phone: '(47) 99188-1921',
    email: 'hpsolucoessc@gmail.com',
    city: 'Itajaí - SC',
    validity: '15 dias',
    totalGlobal: ''
  });

  // Lista de itens de vistoria padrão inicial
  const [visitaItens, setVisitaItens] = useState([
    {
      id: 1,
      ambiente: 'Sala 01',
      servico: 'Trocar 3 lâmpadas T8, remover ventilador de parede, substituir tomada 10A',
      precisaComprar: true,
      material: '3x Lâmpada LED T8, 1x Tomada 10A',
      status: 'Pendente',
      foto: null
    },
    {
      id: 2,
      ambiente: 'Sala 02',
      servico: 'Trocar cabo HDMI 10 metros, trocar interruptor de 3 teclas',
      precisaComprar: true,
      material: '1x Cabo HDMI 10m, 1x Interruptor 3 teclas',
      status: 'Pendente',
      foto: null
    },
    {
      id: 3,
      ambiente: 'Corredor Esquerdo',
      servico: 'Substituir switch da internet',
      precisaComprar: true,
      material: '1x Switch Gigabit 8 portas',
      status: 'Pendente',
      foto: null
    },
    {
      id: 4,
      ambiente: 'Banheiro Masculino Professores',
      servico: 'Substituir kit de descarga acoplada',
      precisaComprar: true,
      material: '1x Kit completo de descarga acoplada',
      status: 'Pendente',
      foto: null
    }
  ]);

  // Formulário de Novo Serviço
  const [novoAmbiente, setNovoAmbiente] = useState('Sala 01');
  const [novoServico, setNovoServico] = useState('');
  const [precisaComprar, setPrecisaComprar] = useState(false);
  const [materialComprar, setMaterialComprar] = useState('');
  const [fotoAtual, setFotoAtual] = useState(null);

  const ambientesSugeridos = [
    'Sala 01', 'Sala 02', 'Sala 03', 'Sala 04', 
    'Corredor esquerdo', 'Corredor direito', 
    'Banheiro Masculino', 'Banheiro Feminino', 
    'Banheiro Masculino Professores', 'Secretaria', 'Diretoria'
  ];

  // Adicionar Serviço
  const handleAddServico = (e) => {
    e.preventDefault();
    if (!novoServico.trim()) return;

    const novoItem = {
      id: Date.now(),
      ambiente: novoAmbiente.trim(),
      servico: novoServico.trim(),
      precisaComprar: precisaComprar,
      material: precisaComprar ? materialComprar.trim() : '',
      status: 'Pendente',
      foto: fotoAtual
    };

    setVisitaItens([...visitaItens, novoItem]);
    setNovoServico('');
    setMaterialComprar('');
    setPrecisaComprar(false);
    setFotoAtual(null);
  };

  const handleDeletarItem = (id) => {
    setVisitaItens(visitaItens.filter(item => item.id !== id));
  };

  const handleMudarStatus = (id) => {
    setVisitaItens(visitaItens.map(item => {
      if (item.id === id) {
        return { ...item, status: item.status === 'Pendente' ? 'Concluído' : 'Pendente' };
      }
      return item;
    }));
  };

  // Simular foto
  const handleCapturarFoto = () => {
    const simuladorFotos = [
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400',
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400',
      'https://images.unsplash.com/photo-1541888946425-d0fbb18f244c?w=400'
    ];
    const fotoAleatoria = simuladorFotos[Math.floor(Math.random() * simuladorFotos.length)];
    setFotoAtual(fotoAleatoria);
  };

  // Itens para Compra Consolidados
  const itensParaCompra = visitaItens.filter(item => item.precisaComprar && item.material);

  // Copiar para WhatsApp
  const copiarListaWhatsApp = () => {
    let texto = `🛒 *LISTA DE COMPRAS - ${escolaAtual}*\n*HP Soluções*\n\n`;
    itensParaCompra.forEach((item, index) => {
      texto += `${index + 1}. *[${item.ambiente}]* ${item.material}\n`;
    });
    navigator.clipboard.writeText(texto);
    alert('Lista de compras copiada para a área de transferência!');
  };

  // Agrupar por ambiente para o orçamento e execução
  const ambientesAgrupados = visitaItens.reduce((acc, item) => {
    if (!acc[item.ambiente]) {
      acc[item.ambiente] = [];
    }
    acc[item.ambiente].push(item);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans pb-20">
      
      {/* HEADER FIXO */}
      <header className="bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-30 shadow-md">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl text-white font-bold">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-blue-400 font-semibold uppercase tracking-wider">HP Soluções - Gestão de Visitas</span>
              <h1 className="text-lg font-bold text-white flex items-center gap-2">
                {escolaAtual}
              </h1>
            </div>
          </div>
          
          <button 
            onClick={() => setIsModalEscolaOpen(true)}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition"
          >
            Trocar Escola / Local
          </button>
        </div>

        {/* Indicadores rápidos */}
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-800/80 text-center text-xs">
          <div className="bg-slate-800/50 p-1.5 rounded">
            <span className="text-slate-400 block">Ambientes</span>
            <strong className="text-white text-sm">{Object.keys(ambientesAgrupados).length}</strong>
          </div>
          <div className="bg-slate-800/50 p-1.5 rounded">
            <span className="text-slate-400 block">Serviços</span>
            <strong className="text-blue-400 text-sm">{visitaItens.length}</strong>
          </div>
          <div className="bg-slate-800/50 p-1.5 rounded">
            <span className="text-slate-400 block">Pra Comprar</span>
            <strong className="text-amber-400 text-sm">{itensParaCompra.length}</strong>
          </div>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="max-w-4xl w-full mx-auto p-4 flex-1">
        
        {/* ABA 1: VISITA / LEVANTAMENTO */}
        {activeTab === 'visita' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-blue-500" />
                Adicionar Serviço na Visita
              </h2>

              <form onSubmit={handleAddServico} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">1. AMBIENTE (SELECIONE OU DIGITE)</label>
                  <input 
                    type="text"
                    value={novoAmbiente}
                    onChange={(e) => setNovoAmbiente(e.target.value)}
                    placeholder="Ex: Sala 01, Corredor..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 mb-2"
                    required
                  />
                  <div className="flex flex-wrap gap-1.5">
                    {ambientesSugeridos.map(amb => (
                      <button
                        key={amb}
                        type="button"
                        onClick={() => setNovoAmbiente(amb)}
                        className={`text-xs px-2.5 py-1 rounded-lg border transition ${novoAmbiente === amb ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'}`}
                      >
                        {amb}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">2. O QUE PRECISA SER FEITO? (SERVIÇO)</label>
                  <textarea 
                    value={novoServico}
                    onChange={(e) => setNovoServico(e.target.value)}
                    placeholder="Ex: Trocar 3 lâmpadas T8, substituir tomada 10A..."
                    rows="2"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-blue-500 resize-none"
                    required
                  />
                </div>

                {/* Foto */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">3. REGISTRO FOTOGRÁFICO (OPCIONAL)</label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleCapturarFoto}
                      className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 px-4 py-2 rounded-xl text-xs font-medium transition"
                    >
                      <Camera className="w-4 h-4 text-blue-400" />
                      {fotoAtual ? 'Trocar Foto' : 'Tirar / Anexar Foto'}
                    </button>
                    {fotoAtual && (
                      <div className="flex items-center gap-2">
                        <img src={fotoAtual} alt="Preview" className="w-10 h-10 object-cover rounded-lg border border-slate-600" />
                        <button type="button" onClick={() => setFotoAtual(null)} className="text-xs text-red-400 hover:underline">Remover</button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Checkbox Precisa Comprar */}
                <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-xl space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={precisaComprar}
                      onChange={(e) => setPrecisaComprar(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-700 text-blue-600 focus:ring-blue-500 bg-slate-900"
                    />
                    <span className="text-sm font-medium text-white">Necessita compra de material para este serviço?</span>
                  </label>

                  {precisaComprar && (
                    <div>
                      <input 
                        type="text"
                        value={materialComprar}
                        onChange={(e) => setMaterialComprar(e.target.value)}
                        placeholder="Ex: 3x Lâmpada LED T8, 1x Tomada 10A..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                        required={precisaComprar}
                      />
                    </div>
                  )}
                </div>

                <button 
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
                >
                  <Plus className="w-4 h-4" /> Adicionar à Lista de Visita
                </button>
              </form>
            </div>

            {/* Lista lançada */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Itens Levantados nesta Visita ({visitaItens.length})</h3>
              
              {visitaItens.length === 0 ? (
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 text-center text-slate-500">
                  Nenhum serviço lançado ainda. Use o formulário acima para comecar.
                </div>
              ) : (
                visitaItens.map((item) => (
                  <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="bg-blue-950 text-blue-400 border border-blue-800 text-xs px-2 py-0.5 rounded-md font-semibold">{item.ambiente}</span>
                        {item.precisaComprar && (
                          <span className="bg-amber-950 text-amber-400 border border-amber-800 text-xs px-2 py-0.5 rounded-md">Compra necessária</span>
                        )}
                      </div>
                      <p className="text-sm text-slate-200">{item.servico}</p>
                      {item.material && (
                        <p className="text-xs text-amber-300/90 font-medium">📦 Materiais: {item.material}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      {item.foto && (
                        <img src={item.foto} alt="Evidência" className="w-12 h-12 object-cover rounded-lg border border-slate-700" />
                      )}
                      <button 
                        onClick={() => handleDeletarItem(item.id)}
                        className="text-slate-500 hover:text-red-400 p-2 transition"
                        title="Excluir item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ABA 2: COMPRAS */}
        {activeTab === 'compras' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-4 rounded-2xl">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-amber-500" />
                  Lista Consolidada para Compras
                </h2>
                <p className="text-xs text-slate-400">Materiais necessários separados por ambiente</p>
              </div>
              <button 
                onClick={copiarListaWhatsApp}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition shadow-lg shadow-emerald-600/20"
              >
                Copiar para WhatsApp
              </button>
            </div>

            {itensParaCompra.length === 0 ? (
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 text-center text-slate-500">
                Nenhum material marcado para compra nos itens da visita.
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                {itensParaCompra.map((item, idx) => (
                  <div key={item.id} className="flex items-start justify-between border-b border-slate-800 pb-3 last:border-0 last:pb-0">
                    <div className="space-y-1">
                      <span className="text-xs text-blue-400 font-bold">{idx + 1}. [{item.ambiente}]</span>
                      <p className="text-sm text-slate-100 font-medium">{item.material}</p>
                      <p className="text-xs text-slate-400">Serviço associado: {item.servico}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ABA 3: ORÇAMENTO */}
        {activeTab === 'orcamento' && (
          <div className="space-y-6">
            {/* Controles de Valor Global e Empresa */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-500" />
                Configuração da Proposta Comercial
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">VALOR TOTAL DO ORÇAMENTO (R$)</label>
                  <input 
                    type="text"
                    value={companyInfo.totalGlobal}
                    onChange={(e) => setCompanyInfo({...companyInfo, totalGlobal: e.target.value})}
                    placeholder="Ex: 2.850,00"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-sm font-bold focus:outline-none focus:border-blue-500"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">Valor único englobando serviços e materiais inclusos.</span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">VALIDADE DA PROPOSTA</label>
                  <input 
                    type="text"
                    value={companyInfo.validity}
                    onChange={(e) => setCompanyInfo({...companyInfo, validity: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Espelho do Orçamento A4 */}
            <div className="bg-white text-slate-900 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
              
              {/* Cabeçalho Proposta */}
              <div className="border-b border-slate-200 pb-4 flex justify-between items-start">
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900">{companyInfo.name}</h3>
                  <p className="text-xs text-slate-600">CNPJ: {companyInfo.cnpj}</p>
                  <p className="text-xs text-slate-600">Contato: {companyInfo.phone} | {companyInfo.email}</p>
                  <p className="text-xs text-slate-600">{companyInfo.city}</p>
                </div>
                <div className="text-right">
                  <span className="bg-slate-100 text-slate-800 text-[10px] uppercase font-bold px-2.5 py-1 rounded border border-slate-300">Orçamento Comercial</span>
                  <p className="text-xs text-slate-500 mt-1">Data: {new Date().toLocaleDateString()}</p>
                  <p className="text-xs text-slate-500">Validade: {companyInfo.validity}</p>
                </div>
              </div>

              {/* Cliente / Local */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Local da Execução</span>
                <strong className="text-sm text-slate-900">{escolaAtual}</strong>
              </div>

              {/* Escopo por Ambiente */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Escopo de Serviços por Ambiente</h4>
                
                {Object.keys(ambientesAgrupados).map((ambiente) => (
                  <div key={ambiente} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-2">
                    <h5 className="font-bold text-sm text-blue-700">{ambiente}</h5>
                    <ul className="list-disc list-inside space-y-1 text-xs text-slate-700">
                      {ambientesAgrupados[ambiente].map((item) => (
                        <li key={item.id}>
                          <span>{item.servico}</span>
                          {item.material && <span className="block text-[11px] text-amber-800 ml-4">↳ Material: {item.material}</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Valor Total Global */}
              <div className="border-t border-slate-200 pt-4 flex justify-between items-center bg-slate-100 p-4 rounded-xl">
                <div>
                  <span className="text-xs text-slate-600 uppercase font-bold block">Valor Total da Proposta</span>
                  <span className="text-[11px] text-slate-500">Serviços e materiais inclusos</span>
                </div>
                <div className="text-xl font-black text-blue-700">
                  R$ {companyInfo.totalGlobal || '0,00'}
                </div>
              </div>
            </div>

            <button 
              onClick={() => window.print()}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-lg"
            >
              <Printer className="w-4 h-4" /> Imprimir / Gerar PDF da Proposta
            </button>
          </div>
        )}

        {/* ABA 4: EXECUTAR (CHECKLIST) */}
        {activeTab === 'executar' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-emerald-500" />
                Checklist de Execução da Obra
              </h2>
              <p className="text-xs text-slate-400">Marque os serviços conforme forem concluídos na escola</p>
            </div>

            {Object.keys(ambientesAgrupados).map((ambiente) => (
              <div key={ambiente} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <h3 className="font-bold text-sm text-blue-400 border-b border-slate-800 pb-2">{ambiente}</h3>
                <div className="space-y-2.5">
                  {ambientesAgrupados[ambiente].map((item) => (
                    <div 
                      key={item.id} 
                      onClick={() => handleMudarStatus(item.id)}
                      className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between gap-3 ${item.status === 'Concluído' ? 'bg-emerald-950/20 border-emerald-900/50 text-slate-400 line-through' : 'bg-slate-950 border-slate-800 text-slate-200'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-lg border flex items-center justify-center ${item.status === 'Concluído' ? 'bg-emerald-600 border-emerald-500 text-white' : 'border-slate-700'}`}>
                          {item.status === 'Concluído' && <Check className="w-3.5 h-3.5" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{item.servico}</p>
                          {item.material && <span className="text-xs text-amber-400/80 block">📦 {item.material}</span>}
                        </div>
                      </div>

                      <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${item.status === 'Concluído' ? 'bg-emerald-900/40 text-emerald-400' : 'bg-amber-900/40 text-amber-400'}`}>
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

      </main>

      {/* NAVBAR INFERIOR */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 z-30 py-2 px-4 shadow-lg">
        <div className="max-w-md mx-auto grid grid-cols-4 gap-1 text-center">
          <button 
            onClick={() => setActiveTab('visita')}
            className={`flex flex-col items-center py-1.5 rounded-xl transition ${activeTab === 'visita' ? 'text-blue-500 bg-blue-950/30' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <ClipboardList className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-medium">1. Visita</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('compras')}
            className={`flex flex-col items-center py-1.5 rounded-xl transition relative ${activeTab === 'compras' ? 'text-amber-500 bg-amber-950/30' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <ShoppingCart className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-medium">2. Compras</span>
            {itensParaCompra.length > 0 && (
              <span className="absolute top-1 right-5 bg-amber-500 text-slate-950 font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                {itensParaCompra.length}
              </span>
            )}
          </button>

          <button 
            onClick={() => setActiveTab('orcamento')}
            className={`flex flex-col items-center py-1.5 rounded-xl transition ${activeTab === 'orcamento' ? 'text-blue-500 bg-blue-950/30' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <FileText className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-medium">3. Orçamento</span>
          </button>

          <button 
            onClick={() => setActiveTab('executar')}
            className={`flex flex-col items-center py-1.5 rounded-xl transition ${activeTab === 'executar' ? 'text-emerald-500 bg-emerald-950/30' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <CheckSquare className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-medium">4. Executar</span>
          </button>
        </div>
      </nav>

      {/* MODAL TROCAR ESCOLA */}
      {isModalEscolaOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Selecionar ou Adicionar Escola</h3>
            
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {listaEscolas.map((esc) => (
                <button
                  key={esc}
                  onClick={() => { EscolaAtual(esc); setIsModalEscolaOpen(false); }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium transition ${escolaAtual === esc ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                >
                  {esc}
                </button>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-800 space-y-2">
              <label className="text-xs text-slate-400 font-medium block">Cadastrar Nova Escola / Local</label>
              <div className="flex gap-2">
                <input 
                  type="text"
                  value={novoNomeEscola}
                  onChange={(e) => setNovoNomeEscola(e.target.value)}
                  placeholder="Nome da Escola..."
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
                <button 
                  onClick={() => {
                    if (novoNomeEscola.trim()) {
                      setListaEscolas([...listaEscolas, novoNomeEscola.trim()]);
                      EscolaAtual(novoNomeEscola.trim());
                      setNovoNomeEscola('');
                      setIsModalEscolaOpen(false);
                    }
                  }}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-medium transition"
                >
                  Adicionar
                </button>
              </div>
            </div>

            <button 
              onClick={() => setIsModalEscolaOpen(false)}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-xl text-xs font-medium transition mt-2"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
