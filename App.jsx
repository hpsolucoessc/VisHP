import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Building2,
  ClipboardList,
  ShoppingCart,
  FileText,
  CheckSquare,
  Plus,
  Trash2,
  Camera,
  Copy,
  Check,
  Printer,
  ChevronDown,
  ChevronRight,
  Wrench,
  Package,
  MapPin,
  Calendar,
  Download,
  Upload,
  Edit3,
  X,
  Image as ImageIcon,
  Share2,
  Filter,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  FolderPlus,
  Loader2,
  Eye,
  Settings
} from 'lucide-react';

// Ambientes rápidos para facilitar a digitação em campo
const QUICK_ENVIRONMENTS = [
  'Sala 01',
  'Sala 02',
  'Sala 03',
  'Corredor esquerdo',
  'Corredor principal',
  'Banheiro masculino professores',
  'Banheiro feminino',
  'Secretaria',
  'Diretoria',
  'Cozinha / Refeitório',
  'Pátio / Quadra'
];

// Unidades comuns
const UNITS = ['un', 'm', 'kit', 'par', 'cx', 'rl'];

// Dados padrão da empresa para o cabeçalho do Orçamento / PDF
const DEFAULT_COMPANY_INFO = {
  name: 'HP Soluções — Comércio e Serviços Integrados Ltda',
  cnpj: '66.799.072/0001-59',
  contact: '(47) 99188-1921 | hpsolucoessc@gmail.com',
  city: 'Itajaí / SC',
  validity: '15 dias'
};

// Dados iniciais com o exemplo exato solicitado pelo usuário
const INITIAL_VISITS = [
  {
    id: 'visita-exemplo-1',
    schoolName: 'EEB Exemplo - Vistoria Geral',
    date: '2026-11-05',
    notes: 'Fornecimento de materiais e mão de obra especializada inclusos.',
    totalPrice: 1070.00,
    items: [
      {
        id: 'item-1',
        environment: 'Sala 01',
        service: 'Trocar 3 lâmpadas T8',
        needsMaterial: true,
        materials: [
          { id: 'm-1', name: 'Lâmpada LED T8 18W', qty: 3, unit: 'un', bought: false }
        ],
        completed: false,
        photoBefore: null,
        photoAfter: null
      },
      {
        id: 'item-2',
        environment: 'Sala 01',
        service: 'Remover ventilador de parede',
        needsMaterial: false,
        materials: [],
        completed: false,
        photoBefore: null,
        photoAfter: null
      },
      {
        id: 'item-3',
        environment: 'Sala 01',
        service: 'Substituir tomada 10A',
        needsMaterial: true,
        materials: [
          { id: 'm-2', name: 'Tomada 10A com espelho', qty: 1, unit: 'un', bought: false }
        ],
        completed: false,
        photoBefore: null,
        photoAfter: null
      },
      {
        id: 'item-4',
        environment: 'Sala 02',
        service: 'Trocar cabo HDMI 10 metros',
        needsMaterial: true,
        materials: [
          { id: 'm-3', name: 'Cabo HDMI 10 metros', qty: 1, unit: 'un', bought: false }
        ],
        completed: false,
        photoBefore: null,
        photoAfter: null
      },
      {
        id: 'item-5',
        environment: 'Sala 02',
        service: 'Trocar interruptor de 3 teclas',
        needsMaterial: true,
        materials: [
          { id: 'm-4', name: 'Interruptor 3 teclas simples', qty: 1, unit: 'un', bought: false }
        ],
        completed: false,
        photoBefore: null,
        photoAfter: null
      },
      {
        id: 'item-6',
        environment: 'Corredor esquerdo',
        service: 'Substituir switch da internet',
        needsMaterial: true,
        materials: [
          { id: 'm-5', name: 'Switch Gigabit 8 portas', qty: 1, unit: 'un', bought: false }
        ],
        completed: false,
        photoBefore: null,
        photoAfter: null
      },
      {
        id: 'item-7',
        environment: 'Banheiro masculino professores',
        service: 'Substituir kit de descarga acoplada',
        needsMaterial: true,
        materials: [
          { id: 'm-6', name: 'Kit mecanismo caixa acoplada universal', qty: 1, unit: 'kit', bought: false }
        ],
        completed: false,
        photoBefore: null,
        photoAfter: null
      }
    ]
  }
];

// Formatação de moeda em Real (R$)
const formatCurrency = (val) => {
  const num = Number(val) || 0;
  return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export default function App() {
  // Estado principal das visitas (com salvamento automático no navegador)
  const [visits, setVisits] = useState(() => {
    try {
      const saved = localStorage.getItem('hp_solucoes_visits_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      // ignora erro de leitura
    }
    return INITIAL_VISITS;
  });

  const [activeVisitId, setActiveVisitId] = useState(() => {
    return visits[0]?.id || INITIAL_VISITS[0].id;
  });

  const [activeTab, setActiveTab] = useState('levantamento'); // 'levantamento' | 'compras' | 'orcamento' | 'execucao'
  const [isFullscreenMode, setIsFullscreenMode] = useState(false);

  // Dados da Empresa para o cabeçalho do PDF
  const [companyInfo, setCompanyInfo] = useState(() => {
    try {
      const saved = localStorage.getItem('hp_solucoes_company_v2');
      if (saved) return { ...DEFAULT_COMPANY_INFO, ...JSON.parse(saved) };
    } catch (e) {
      // ignora erro
    }
    return DEFAULT_COMPANY_INFO;
  });
  const [showCompanyEditor, setShowCompanyEditor] = useState(false);
  const [includePhotosInPdf, setIncludePhotosInPdf] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Salvar automaticamente alterações no navegador
  useEffect(() => {
    try {
      localStorage.setItem('hp_solucoes_visits_v2', JSON.stringify(visits));
    } catch (e) {
      // ignora erro de quota
    }
  }, [visits]);

  useEffect(() => {
    try {
      localStorage.setItem('hp_solucoes_company_v2', JSON.stringify(companyInfo));
    } catch (e) {
      // ignora erro
    }
  }, [companyInfo]);

  // Modal de Nova Visita / Trocar Escola
  const [isSchoolModalOpen, setIsSchoolModalOpen] = useState(false);
  const [newSchoolName, setNewSchoolName] = useState('');
  const [newSchoolDate, setNewSchoolDate] = useState(new Date().toISOString().split('T')[0]);

  // Estado do formulário de Levantamento rápido
  const [envInput, setEnvInput] = useState('Sala 01');
  const [serviceInput, setServiceInput] = useState('');
  const [needsMaterial, setNeedsMaterial] = useState(false);
  const [tempMaterials, setTempMaterials] = useState([
    { id: 'temp-1', name: '', qty: 1, unit: 'un' }
  ]);
  const [photoBefore, setPhotoBefore] = useState(null);
  const [editingItemId, setEditingItemId] = useState(null);

  // Estado de filtros e feedbacks
  const [execFilter, setExecFilter] = useState('todos'); // 'todos' | 'pendentes' | 'concluidos'
  const [toastMessage, setToastMessage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [boughtKeys, setBoughtKeys] = useState({});
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const fileInputRef = useRef(null);
  const importJsonRef = useRef(null);
  const pdfProposalRef = useRef(null);

  // Visita atual selecionada
  const currentVisit = useMemo(() => {
    return visits.find(v => v.id === activeVisitId) || visits[0];
  }, [visits, activeVisitId]);

  // Garantir compatibilidade caso uma visita antiga tivesse laborCost + materialCost
  const currentTotalPrice = useMemo(() => {
    if (!currentVisit) return 0;
    if (typeof currentVisit.totalPrice === 'number') return currentVisit.totalPrice;
    const legacySum = (Number(currentVisit.laborCost) || 0) + (Number(currentVisit.materialCost) || 0);
    return legacySum;
  }, [currentVisit]);

  // Mostrar aviso rápido (Toast)
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Compressão rápida de foto da câmera para caber na memória e carregar rápido
  const handlePhotoUpload = (e, callback) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const scaleSize = img.width > MAX_WIDTH ? MAX_WIDTH / img.width : 1;
        canvas.width = img.width * scaleSize;
        canvas.height = img.height * scaleSize;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        callback(compressedBase64);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Adicionar linha de material temporário no formulário
  const addTempMaterialRow = () => {
    setTempMaterials(prev => [
      ...prev,
      { id: `temp-${Date.now()}-${Math.random()}`, name: '', qty: 1, unit: 'un' }
    ]);
  };

  const updateTempMaterial = (id, field, value) => {
    setTempMaterials(prev =>
      prev.map(m => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  const removeTempMaterial = (id) => {
    if (tempMaterials.length <= 1) return;
    setTempMaterials(prev => prev.filter(m => m.id !== id));
  };

  // Salvar ou atualizar item de levantamento
  const handleSaveItem = (e) => {
    e.preventDefault();
    if (!envInput.trim() || !serviceInput.trim()) {
      showToast('Preencha o Ambiente e o Serviço!');
      return;
    }

    const validMaterials = needsMaterial
      ? tempMaterials
          .filter(m => m.name.trim() !== '')
          .map(m => ({
            id: m.id.startsWith('temp-') ? `mat-${Date.now()}-${Math.random()}` : m.id,
            name: m.name.trim(),
            qty: Number(m.qty) || 1,
            unit: m.unit || 'un',
            bought: Boolean(m.bought)
          }))
      : [];

    if (editingItemId) {
      setVisits(prev =>
        prev.map(v => {
          if (v.id !== currentVisit.id) return v;
          return {
            ...v,
            items: v.items.map(it =>
              it.id === editingItemId
                ? {
                    ...it,
                    environment: envInput.trim(),
                    service: serviceInput.trim(),
                    needsMaterial: validMaterials.length > 0,
                    materials: validMaterials,
                    photoBefore
                  }
                : it
            )
          };
        })
      );
      setEditingItemId(null);
      showToast('Item atualizado com sucesso!');
    } else {
      const newItem = {
        id: `item-${Date.now()}`,
        environment: envInput.trim(),
        service: serviceInput.trim(),
        needsMaterial: validMaterials.length > 0,
        materials: validMaterials,
        completed: false,
        photoBefore,
        photoAfter: null
      };

      setVisits(prev =>
        prev.map(v =>
          v.id === currentVisit.id ? { ...v, items: [...v.items, newItem] } : v
        )
      );
      showToast(`Adicionado em ${envInput.trim()}!`);
    }

    // Limpa apenas o serviço e materiais (mantém o Ambiente ativo para lançar vários na mesma sala rápido!)
    setServiceInput('');
    setNeedsMaterial(false);
    setTempMaterials([{ id: `temp-${Date.now()}`, name: '', qty: 1, unit: 'un' }]);
    setPhotoBefore(null);
  };

  // Editar item existente
  const handleEditItem = (item) => {
    setEditingItemId(item.id);
    setEnvInput(item.environment);
    setServiceInput(item.service);
    setNeedsMaterial(item.needsMaterial && item.materials.length > 0);
    setTempMaterials(
      item.materials && item.materials.length > 0
        ? item.materials.map(m => ({ ...m }))
        : [{ id: `temp-${Date.now()}`, name: '', qty: 1, unit: 'un' }]
    );
    setPhotoBefore(item.photoBefore || null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Excluir item
  const handleDeleteItem = (itemId) => {
    setVisits(prev =>
      prev.map(v =>
        v.id === currentVisit.id
          ? { ...v, items: v.items.filter(i => i.id !== itemId) }
          : v
      )
    );
    showToast('Item removido.');
  };

  // Alternar concluído no Checklist de Execução
  const toggleItemCompleted = (itemId) => {
    setVisits(prev =>
      prev.map(v => {
        if (v.id !== currentVisit.id) return v;
        return {
          ...v,
          items: v.items.map(it =>
            it.id === itemId ? { ...it, completed: !it.completed } : it
          )
        };
      })
    );
  };

  // Anexar foto do serviço concluído (Depois)
  const handleAddAfterPhoto = (itemId, base64) => {
    setVisits(prev =>
      prev.map(v => {
        if (v.id !== currentVisit.id) return v;
        return {
          ...v,
          items: v.items.map(it =>
            it.id === itemId ? { ...it, photoAfter: base64 } : it
          )
        };
      })
    );
    showToast('Foto de conclusão anexada!');
  };

  // Atualizar valor único global ou observações do orçamento
  const updateVisitField = (field, value) => {
    setVisits(prev =>
      prev.map(v =>
        v.id === currentVisit.id ? { ...v, [field]: value } : v
      )
    );
  };

  // Criar nova visita / escola
  const handleCreateVisit = (e) => {
    e.preventDefault();
    if (!newSchoolName.trim()) return;
    const newVisit = {
      id: `visita-${Date.now()}`,
      schoolName: newSchoolName.trim(),
      date: newSchoolDate,
      notes: 'Fornecimento de materiais e mão de obra especializada inclusos.',
      totalPrice: 0,
      items: []
    };
    setVisits(prev => [newVisit, ...prev]);
    setActiveVisitId(newVisit.id);
    setNewSchoolName('');
    setIsSchoolModalOpen(false);
    showToast(`Visita criada: ${newVisit.schoolName}`);
  };

  // Agrupar itens por Ambiente
  const groupedByEnvironment = useMemo(() => {
    const groups = {};
    if (!currentVisit?.items) return groups;
    currentVisit.items.forEach(item => {
      const env = item.environment || 'Sem Ambiente';
      if (!groups[env]) groups[env] = [];
      groups[env].push(item);
    });
    return groups;
  }, [currentVisit]);

  // Consolidar Lista de Compras (soma automática de itens com o mesmo nome e unidade)
  const consolidatedShoppingList = useMemo(() => {
    const map = {};
    if (!currentVisit?.items) return [];

    currentVisit.items.forEach(item => {
      if (item.needsMaterial && Array.isArray(item.materials)) {
        item.materials.forEach(mat => {
          const normalizedKey = `${mat.name.trim().toLowerCase()}_${(mat.unit || 'un').toLowerCase()}`;
          if (!map[normalizedKey]) {
            map[normalizedKey] = {
              key: normalizedKey,
              name: mat.name.trim(),
              unit: mat.unit || 'un',
              totalQty: 0,
              environments: new Set()
            };
          }
          map[normalizedKey].totalQty += Number(mat.qty) || 0;
          map[normalizedKey].environments.add(item.environment);
        });
      }
    });

    return Object.values(map).map(entry => ({
      ...entry,
      environments: Array.from(entry.environments)
    }));
  }, [currentVisit]);

  // Copiar texto para área de transferência
  const copyToClipboard = (text, label) => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    showToast(label || 'Copiado para a área de transferência!');
  };

  // Gerar texto da Lista de Compras para WhatsApp
  const handleCopyShoppingListWhatsApp = () => {
    if (consolidatedShoppingList.length === 0) {
      showToast('Nenhum material na lista de compras.');
      return;
    }
    const lines = [
      `*🛒 LISTA DE MATERIAIS - ${currentVisit.schoolName.toUpperCase()}*`,
      `📅 Data: ${currentVisit.date.split('-').reverse().join('/')}`,
      `----------------------------------`
    ];
    consolidatedShoppingList.forEach((mat, idx) => {
      const status = boughtKeys[mat.key] ? '✅ (Já em estoque)' : '';
      lines.push(`${idx + 1}. *${mat.totalQty} ${mat.unit}* - ${mat.name} ${status}`);
      lines.push(`   _Ambientes: ${mat.environments.join(', ')}_`);
    });
    copyToClipboard(lines.join('\n'), 'Lista de compras copiada para o WhatsApp!');
  };

  // Gerar texto completo para Orçamento (Valor Único Global)
  const handleCopyBudgetScope = () => {
    const lines = [
      `*PROPOSTA COMERCIAL DE MANUTENÇÃO*`,
      `*${companyInfo.name}*`,
      `CNPJ: ${companyInfo.cnpj} | ${companyInfo.contact}`,
      `----------------------------------`,
      `*Cliente / Unidade:* ${currentVisit.schoolName}`,
      `*Data:* ${currentVisit.date.split('-').reverse().join('/')} | *Validade:* ${companyInfo.validity}`,
      ``,
      `*1. ESCOPO DE SERVIÇOS POR AMBIENTE:*`
    ];

    Object.entries(groupedByEnvironment).forEach(([env, items]) => {
      lines.push(`\n📍 *${env.toUpperCase()}*`);
      items.forEach(it => {
        lines.push(`  • ${it.service}`);
      });
    });

    if (consolidatedShoppingList.length > 0) {
      lines.push(`\n*2. MATERIAIS INCLUSOS NO FORNECIMENTO:*`);
      consolidatedShoppingList.forEach(m => {
        lines.push(`  • ${m.totalQty} ${m.unit} - ${m.name}`);
      });
    }

    if (currentVisit.notes?.trim()) {
      lines.push(`\n*Observações:* ${currentVisit.notes.trim()}`);
    }

    lines.push(
      `\n💰 *VALOR TOTAL (MATERIAIS + MÃO DE OBRA INCLUSOS): R$ ${formatCurrency(currentTotalPrice)}*`
    );

    copyToClipboard(lines.join('\n'), 'Proposta copiada para o WhatsApp!');
  };

  // Carregar biblioteca html2pdf dinamicamente e gerar download direto do arquivo .PDF
  const handleDownloadPdf = async () => {
    if (!pdfProposalRef.current) return;
    setIsGeneratingPdf(true);
    showToast('Gerando arquivo PDF...');

    try {
      if (!window.html2pdf) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
          script.onload = resolve;
          script.onerror = reject;
          document.body.appendChild(script);
        });
      }

      const safeSchoolName = currentVisit.schoolName
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .replace(/_+/g, '_');
      const fileName = `Orcamento_${safeSchoolName}_${currentVisit.date}.pdf`;

      const opt = {
        margin: [10, 10, 10, 10],
        filename: fileName,
        image: { type: 'jpeg', quality: 0.96 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      await window.html2pdf().set(opt).from(pdfProposalRef.current).save();
      showToast('PDF baixado com sucesso!');
    } catch (err) {
      showToast('Abrindo modo de impressão...');
      handleOpenPrintWindow();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Abrir janela dedicada de impressão (funciona mesmo dentro de iframes bloqueados)
  const handleOpenPrintWindow = () => {
    if (!pdfProposalRef.current) return;
    const printContents = pdfProposalRef.current.innerHTML;
    const win = window.open('', '_blank', 'width=900,height=800');
    if (!win) {
      window.print();
      return;
    }
    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Orçamento - ${currentVisit.schoolName}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @media print {
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
          </style>
        </head>
        <body class="bg-white p-6 text-slate-800">
          ${printContents}
          <script>
            setTimeout(() => { window.print(); }, 600);
          </script>
        </body>
      </html>
    `);
    win.document.close();
  };

  // Exportar Backup JSON
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(visits, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `visitas_manutencao_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Backup exportado!');
  };

  // Importar Backup JSON
  const handleImportJSON = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setVisits(parsed);
          setActiveVisitId(parsed[0].id);
          showToast('Visitas importadas com sucesso!');
        }
      } catch (err) {
        showToast('Erro ao ler arquivo JSON.');
      }
    };
    reader.readAsText(file);
  };

  // Estatísticas para barra de progresso da execução
  const executionStats = useMemo(() => {
    const total = currentVisit?.items?.length || 0;
    const done = currentVisit?.items?.filter(i => i.completed).length || 0;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    return { total, done, pct };
  }, [currentVisit]);

  // Função para alternar tela cheia imersiva (esconde barras do navegador)
  const toggleFullscreenApp = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreenMode(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreenMode(false);
    }
  };

  return (
    <div className={`min-h-screen bg-slate-100 text-slate-800 pb-28 print:bg-white print:pb-0 ${isFullscreenMode ? 'fixed inset-0 z-50 overflow-y-auto' : ''}`}>
      {/* Notificação Flutuante (Toast) */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-full shadow-xl flex items-center gap-2 text-sm font-medium animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modal de Visualização de Foto Ampliada */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-2xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-3 right-3 bg-black/60 text-white p-2 rounded-full hover:bg-black"
            >
              <X className="w-5 h-5" />
            </button>
            <img src={previewImage} alt="Registro da vistoria" className="w-full h-auto max-h-[80vh] object-contain" />
          </div>
        </div>
      )}

      {/* Modal de Visualização Limpa em Tela Cheia para Impressão / PDF */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs overflow-y-auto p-3 sm:p-6">
          <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-10 print:hidden">
              <div className="font-bold text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" />
                <span>Visualização da Proposta / Orçamento</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={isGeneratingPdf}
                  className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5"
                >
                  {isGeneratingPdf ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                  Baixar PDF
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Imprimir
                </button>
                <button
                  type="button"
                  onClick={() => setIsPrintModalOpen(false)}
                  className="p-1.5 text-slate-300 hover:text-white rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div
              className="p-6"
              dangerouslySetInnerHTML={{
                __html: pdfProposalRef.current ? pdfProposalRef.current.innerHTML : ''
              }}
            />
          </div>
        </div>
      )}

      {/* Modal para Trocar ou Criar Nova Escola/Visita */}
      {isSchoolModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                Escolas / Visitas
              </h3>
              <button onClick={() => setIsSchoolModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Lista de visitas salvas */}
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Selecionar Visita Salva</p>
              {visits.map(v => (
                <button
                  key={v.id}
                  onClick={() => {
                    setActiveVisitId(v.id);
                    setIsSchoolModalOpen(false);
                  }}
                  className={`w-full text-left p-3 rounded-xl border transition flex items-center justify-between ${
                    v.id === currentVisit.id
                      ? 'bg-blue-50 border-blue-500 text-blue-900 font-semibold'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div>
                    <div className="text-sm">{v.schoolName}</div>
                    <div className="text-xs text-slate-500">
                      {v.date.split('-').reverse().join('/')} • {v.items.length} serviços
                    </div>
                  </div>
                  {v.id === currentVisit.id && <Check className="w-4 h-4 text-blue-600" />}
                </button>
              ))}
            </div>

            {/* Criar nova visita */}
            <form onSubmit={handleCreateVisit} className="space-y-3 border-t pt-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Cadastrar Nova Visita</p>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Nome da Escola / Cliente</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: EEB Nereu Ramos"
                  value={newSchoolName}
                  onChange={e => setNewSchoolName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Data da Visita</label>
                <input
                  type="date"
                  value={newSchoolDate}
                  onChange={e => setNewSchoolDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 shadow-sm transition"
              >
                <FolderPlus className="w-4 h-4" />
                Iniciar Nova Visita
              </button>
            </form>

            {/* Backup */}
            <div className="border-t pt-3 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleExportJSON}
                className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> Exportar Backup
              </button>
              <button
                type="button"
                onClick={() => importJsonRef.current?.click()}
                className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" /> Importar Backup
              </button>
              <input
                ref={importJsonRef}
                type="file"
                accept=".json"
                onChange={handleImportJSON}
                className="hidden"
              />
            </div>
          </div>
        </div>
      )}

      {/* Cabeçalho Superior Fixo */}
      <header className="bg-slate-900 text-white sticky top-0 z-30 shadow-md print:hidden">
        <div className="max-w-4xl mx-auto px-4 py-2.5 flex items-center justify-between gap-2">
          <button
            onClick={() => setIsSchoolModalOpen(true)}
            className="flex items-center gap-2 text-left group bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-xl transition max-w-[65%] sm:max-w-[75%]"
          >
            <div className="bg-blue-600 p-1.5 rounded-lg shrink-0">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <div className="truncate">
              <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                <span>ESCOLA / LOCAL</span>
                <ChevronDown className="w-3 h-3 text-blue-400" />
              </div>
              <div className="font-bold text-xs sm:text-sm truncate">{currentVisit.schoolName}</div>
            </div>
          </button>

          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleFullscreenApp}
              className="bg-slate-800 hover:bg-slate-700 text-blue-400 px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 border border-slate-700"
              title="Expandir para tela cheia"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Tela Cheia</span>
            </button>
            <button
              onClick={() => setIsSchoolModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Nova Visita</span>
            </button>
          </div>
        </div>

        {/* Barra de Resumo Rápido */}
        <div className="bg-slate-800/80 border-t border-slate-700/60 px-4 py-1.5 text-xs text-slate-300">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-blue-400" />
              {Object.keys(groupedByEnvironment).length} ambientes
            </span>
            <span className="flex items-center gap-1">
              <Wrench className="w-3.5 h-3.5 text-amber-400" />
              {currentVisit.items.length} serviços
            </span>
            <span className="flex items-center gap-1">
              <ShoppingCart className="w-3.5 h-3.5 text-emerald-400" />
              {consolidatedShoppingList.length} itens p/ compra
            </span>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-4xl mx-auto px-4 pt-4">
        {/* ==========================================
            ABA 1: LEVANTAMENTO NA VISITA
        ========================================== */}
        {activeTab === 'levantamento' && (
          <div className="space-y-6">
            {/* Card de Lançamento Rápido */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-base sm:text-lg text-slate-900 flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-blue-600" />
                  {editingItemId ? 'Editar Item do Levantamento' : 'Adicionar Serviço na Visita'}
                </h2>
                {editingItemId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingItemId(null);
                      setServiceInput('');
                      setNeedsMaterial(false);
                      setPhotoBefore(null);
                    }}
                    className="text-xs text-red-600 font-semibold hover:underline"
                  >
                    Cancelar edição
                  </button>
                )}
              </div>

              <form onSubmit={handleSaveItem} className="space-y-4">
                {/* Seleção ou Digitação de Ambiente */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    1. Ambiente (Selecione ou Digite)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Sala 01, Corredor esquerdo, Banheiro..."
                    value={envInput}
                    onChange={e => setEnvInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none mb-2"
                  />
                  {/* Atalhos Rápidos de Ambiente */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 no-scrollbar">
                    {QUICK_ENVIRONMENTS.map(env => (
                      <button
                        type="button"
                        key={env}
                        onClick={() => setEnvInput(env)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                          envInput.toLowerCase() === env.toLowerCase()
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {env}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Serviço a ser executado */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    2. O que precisa ser feito? (Serviço)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Ex: Trocar 3 lâmpadas T8, substituir tomada 10A..."
                      value={serviceInput}
                      onChange={e => setServiceInput(e.target.value)}
                      className="flex-1 px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className={`px-3.5 py-2.5 rounded-xl border flex items-center gap-1.5 text-xs font-semibold transition shrink-0 ${
                        photoBefore
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                          : 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100'
                      }`}
                      title="Tirar ou anexar foto"
                    >
                      <Camera className="w-4 h-4" />
                      <span>{photoBefore ? 'Foto OK' : 'Foto'}</span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={e => handlePhotoUpload(e, setPhotoBefore)}
                      className="hidden"
                    />
                  </div>

                  {/* Preview da foto se houver */}
                  {photoBefore && (
                    <div className="mt-2 flex items-center gap-3 bg-slate-50 p-2 rounded-xl border border-slate-200">
                      <img
                        src={photoBefore}
                        alt="Preview"
                        className="w-12 h-12 object-cover rounded-lg border"
                      />
                      <span className="text-xs text-slate-600 flex-1">Foto anexada ao serviço</span>
                      <button
                        type="button"
                        onClick={() => setPhotoBefore(null)}
                        className="text-red-500 p-1 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Flag: Precisa Comprar Material? */}
                <div className="pt-1">
                  <div
                    onClick={() => setNeedsMaterial(!needsMaterial)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                      needsMaterial
                        ? 'bg-amber-50/80 border-amber-400 text-amber-900'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <ShoppingCart className={`w-5 h-5 ${needsMaterial ? 'text-amber-600' : 'text-slate-400'}`} />
                      <div>
                        <div className="text-sm font-bold">Precisa comprar material?</div>
                        <div className="text-xs text-slate-500">
                          Ative para já enviar a peça para a Lista de Compras
                        </div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={needsMaterial}
                      onChange={() => {}}
                      className="w-5 h-5 accent-amber-600 rounded cursor-pointer"
                    />
                  </div>

                  {/* Sub-formulário de Materiais */}
                  {needsMaterial && (
                    <div className="mt-3 p-3.5 bg-amber-50/40 border border-amber-200 rounded-xl space-y-3">
                      <div className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                        Materiais necessários para este serviço:
                      </div>

                      {tempMaterials.map((mat, index) => (
                        <div key={mat.id} className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Ex: Lâmpada LED T8, Cabo HDMI 10m..."
                            value={mat.name}
                            onChange={e => updateTempMaterial(mat.id, 'name', e.target.value)}
                            className="flex-1 px-3 py-2 bg-white border border-amber-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-amber-500"
                          />
                          <input
                            type="number"
                            min="1"
                            value={mat.qty}
                            onChange={e => updateTempMaterial(mat.id, 'qty', e.target.value)}
                            className="w-16 px-2 py-2 bg-white border border-amber-300 rounded-lg text-sm text-center outline-none focus:ring-2 focus:ring-amber-500"
                          />
                          <select
                            value={mat.unit}
                            onChange={e => updateTempMaterial(mat.id, 'unit', e.target.value)}
                            className="w-16 px-1.5 py-2 bg-white border border-amber-300 rounded-lg text-sm outline-none"
                          >
                            {UNITS.map(u => (
                              <option key={u} value={u}>{u}</option>
                            ))}
                          </select>
                          {tempMaterials.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeTempMaterial(mat.id)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={addTempMaterialRow}
                        className="text-xs font-semibold text-amber-800 hover:text-amber-950 flex items-center gap-1 pt-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> + Adicionar outro material neste serviço
                      </button>
                    </div>
                  )}
                </div>

                {/* Botão Salvar */}
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold py-3 rounded-xl shadow-sm transition flex items-center justify-center gap-2 text-sm"
                >
                  <Plus className="w-5 h-5" />
                  {editingItemId ? 'Salvar Alterações' : `Adicionar em "${envInput || 'Ambiente'}"`}
                </button>
              </form>
            </div>

            {/* Lista de Itens já Lançados Agrupados por Ambiente */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wider">
                  Itens Levantados por Ambiente ({currentVisit.items.length})
                </h3>
              </div>

              {Object.keys(groupedByEnvironment).length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 text-slate-400">
                  Nenhum serviço registrado nesta visita ainda. Use o formulário acima!
                </div>
              ) : (
                Object.entries(groupedByEnvironment).map(([env, items]) => (
                  <div key={env} className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
                    <div className="bg-slate-800 text-white px-4 py-2.5 flex items-center justify-between">
                      <div className="font-bold text-sm flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-400" />
                        <span>{env}</span>
                      </div>
                      <span className="text-xs bg-slate-700 text-slate-200 px-2.5 py-0.5 rounded-full">
                        {items.length} {items.length === 1 ? 'item' : 'itens'}
                      </span>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {items.map(item => (
                        <div key={item.id} className="p-3.5 sm:p-4 flex items-start justify-between gap-3 hover:bg-slate-50/60">
                          <div className="space-y-1.5 flex-1">
                            <div className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                              <span>{item.service}</span>
                            </div>

                            {/* Badges de materiais se houver */}
                            {item.needsMaterial && item.materials.length > 0 && (
                              <div className="flex flex-wrap gap-1.5">
                                {item.materials.map(m => (
                                  <span
                                    key={m.id}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-amber-100 text-amber-900 border border-amber-200"
                                  >
                                    <ShoppingCart className="w-3 h-3 text-amber-700" />
                                    Comprar: {m.qty} {m.unit} - {m.name}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Miniatura da foto se houver */}
                            {item.photoBefore && (
                              <button
                                type="button"
                                onClick={() => setPreviewImage(item.photoBefore)}
                                className="inline-flex items-center gap-1.5 text-xs text-blue-600 font-medium hover:underline pt-1"
                              >
                                <ImageIcon className="w-3.5 h-3.5" /> Ver foto do local
                              </button>
                            )}
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleEditItem(item)}
                              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="Editar"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteItem(item.id)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Excluir"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ==========================================
            ABA 2: LISTA DE COMPRAS CONSOLIDADA
        ========================================== */}
        {activeTab === 'compras' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-emerald-600" />
                    Lista de Compras Unificada
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Itens idênticos de salas diferentes são somados automaticamente.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCopyShoppingListWhatsApp}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2.5 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition"
                >
                  <Copy className="w-4 h-4" />
                  Copiar p/ Fornecedor (WhatsApp)
                </button>
              </div>

              {consolidatedShoppingList.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <Package className="w-10 h-10 mx-auto text-slate-300" />
                  <p className="text-sm">Nenhum item marcado para compra nesta visita.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 mt-2">
                  {consolidatedShoppingList.map(mat => {
                    const isBought = Boolean(boughtKeys[mat.key]);
                    return (
                      <div
                        key={mat.key}
                        onClick={() =>
                          setBoughtKeys(prev => ({ ...prev, [mat.key]: !prev[mat.key] }))
                        }
                        className={`py-3.5 px-2 flex items-center justify-between gap-3 cursor-pointer rounded-xl transition ${
                          isBought ? 'opacity-60 bg-slate-50' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={isBought}
                            onChange={() => {}}
                            className="mt-1 w-5 h-5 accent-emerald-600 rounded cursor-pointer"
                          />
                          <div>
                            <div className={`font-bold text-sm sm:text-base ${isBought ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                              <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md mr-2">
                                {mat.totalQty} {mat.unit}
                              </span>
                              {mat.name}
                            </div>
                            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1 flex-wrap">
                              <span className="font-medium text-slate-600">Para:</span>
                              {mat.environments.map(env => (
                                <span key={env} className="bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                                  {env}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${
                            isBought
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {isBought ? 'Comprado / Estoque' : 'Comprar'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==========================================
            ABA 3: RESUMO PARA ORÇAMENTO
        ========================================== */}
        {activeTab === 'orcamento' && (
          <div className="space-y-5">
            {/* Barra de ações de orçamento (oculta na impressão) */}
            <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-4 sm:p-5 print:hidden space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    Proposta e Orçamento (Valor Único)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Escopo por ambiente + materiais inclusos com valor global unificado.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyBudgetScope}
                    className="flex-1 sm:flex-initial bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-3.5 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition"
                  >
                    <Copy className="w-4 h-4" />
                    Copiar (WhatsApp)
                  </button>
                  <button
                    type="button"
                    disabled={isGeneratingPdf}
                    onClick={handleDownloadPdf}
                    className="flex-1 sm:flex-initial bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold px-3.5 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition"
                  >
                    <Download className="w-4 h-4" />
                    {isGeneratingPdf ? 'Gerando PDF...' : 'Baixar PDF'}
                  </button>
                  <button
                    type="button"
                    onClick={handleOpenPrintWindow}
                    className="bg-slate-800 hover:bg-slate-900 text-white font-semibold px-3 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition"
                    title="Abrir tela de impressão"
                  >
                    <Printer className="w-4 h-4" />
                    <span className="hidden sm:inline">Imprimir</span>
                  </button>
                </div>
              </div>

              {/* Campo Único de Valor Total (Serviços + Materiais Inclusos) + Observações */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                <div className="bg-blue-50/70 p-3.5 rounded-xl border border-blue-200">
                  <label className="block text-xs font-bold uppercase tracking-wider text-blue-900 mb-1">
                    Valor Total do Orçamento (R$)
                  </label>
                  <p className="text-[11px] text-blue-700 mb-2">
                    Valor único englobando serviços + materiais inclusos
                  </p>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-500 text-sm">
                      R$
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      value={currentTotalPrice || ''}
                      onChange={e => updateVisitField('totalPrice', parseFloat(e.target.value) || 0)}
                      placeholder="1630,00"
                      className="w-full bg-white pl-9 pr-3 py-2 rounded-lg border border-blue-300 font-extrabold text-slate-900 text-base focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-col justify-between">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Observações / Condições da Proposta
                    </label>
                    <input
                      type="text"
                      value={currentVisit.notes || ''}
                      onChange={e => updateVisitField('notes', e.target.value)}
                      placeholder="Ex: Fornecimento de materiais e mão de obra inclusos."
                      className="w-full bg-white px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-slate-200/80 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium">
                      <input
                        type="checkbox"
                        checked={includePhotosInPdf}
                        onChange={e => setIncludePhotosInPdf(e.target.checked)}
                        className="w-4 h-4 accent-blue-600 rounded"
                      />
                      Incluir fotos no PDF
                    </label>

                    <button
                      type="button"
                      onClick={() => setShowCompanyEditor(!showCompanyEditor)}
                      className="text-blue-600 hover:underline font-semibold flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      {showCompanyEditor ? 'Ocultar cabeçalho' : 'Editar cabeçalho'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Editor opcional dos dados do cabeçalho da empresa */}
              {showCompanyEditor && (
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Razão Social / Nome</label>
                    <input
                      type="text"
                      value={companyInfo.name}
                      onChange={e => setCompanyInfo(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-white px-2.5 py-1.5 rounded border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">CNPJ</label>
                    <input
                      type="text"
                      value={companyInfo.cnpj}
                      onChange={e => setCompanyInfo(prev => ({ ...prev, cnpj: e.target.value }))}
                      className="w-full bg-white px-2.5 py-1.5 rounded border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Telefone / E-mail</label>
                    <input
                      type="text"
                      value={companyInfo.contact}
                      onChange={e => setCompanyInfo(prev => ({ ...prev, contact: e.target.value }))}
                      className="w-full bg-white px-2.5 py-1.5 rounded border border-slate-300"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-semibold text-slate-600 block mb-1">Cidade / UF</label>
                      <input
                        type="text"
                        value={companyInfo.city}
                        onChange={e => setCompanyInfo(prev => ({ ...prev, city: e.target.value }))}
                        className="w-full bg-white px-2.5 py-1.5 rounded border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-600 block mb-1">Validade</label>
                      <input
                        type="text"
                        value={companyInfo.validity}
                        onChange={e => setCompanyInfo(prev => ({ ...prev, validity: e.target.value }))}
                        className="w-full bg-white px-2.5 py-1.5 rounded border border-slate-300"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Folha Limpa de Escopo (aparece na tela e é exportada para o PDF) */}
            <div
              ref={pdfProposalRef}
              className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 sm:p-8 space-y-6 print:shadow-none print:border-none print:p-0"
            >
              {/* Cabeçalho da Empresa */}
              <div className="border-b-2 border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <div className="text-base sm:text-lg font-extrabold text-slate-900 uppercase tracking-tight">
                    {companyInfo.name}
                  </div>
                  <div className="text-xs text-slate-600 mt-0.5">
                    CNPJ: {companyInfo.cnpj} • {companyInfo.city}
                  </div>
                  <div className="text-xs text-slate-600">{companyInfo.contact}</div>
                </div>

                <div className="sm:text-right bg-slate-100 px-3.5 py-2 rounded-xl border border-slate-200">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Proposta Comercial
                  </div>
                  <div className="text-xs text-slate-600 mt-0.5">
                    Data: <strong>{currentVisit.date.split('-').reverse().join('/')}</strong>
                  </div>
                  <div className="text-xs text-slate-600">
                    Validade: <strong>{companyInfo.validity}</strong>
                  </div>
                </div>
              </div>

              {/* Identificação da Escola / Cliente */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Unidade / Local da Vistoria
                  </span>
                  <span className="text-base font-extrabold text-slate-900">
                    {currentVisit.schoolName}
                  </span>
                </div>
                <div className="text-xs text-slate-600">
                  Ambientes vistoriados: <strong>{Object.keys(groupedByEnvironment).length}</strong> • Serviços: <strong>{currentVisit.items.length}</strong>
                </div>
              </div>

              {/* 1. Lista de Serviços por Ambiente */}
              <div className="space-y-3">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1.5">
                  1. Escopo de Serviços por Ambiente
                </h3>
                <div className="space-y-2.5">
                  {Object.entries(groupedByEnvironment).map(([env, items]) => (
                    <div key={env} className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200">
                      <div className="font-bold text-slate-900 text-sm mb-1.5 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>{env}</span>
                      </div>
                      <ul className="list-disc list-inside space-y-1 text-sm text-slate-700 pl-1">
                        {items.map(it => (
                          <li key={it.id}>{it.service}</li>
                        ))}
                      </ul>

                      {includePhotosInPdf && items.some(i => i.photoBefore) && (
                        <div className="flex flex-wrap gap-2 mt-2.5 pt-2 border-t border-slate-200/60">
                          {items
                            .filter(i => i.photoBefore)
                            .map(i => (
                              <div key={i.id} className="w-24">
                                <img
                                  src={i.photoBefore}
                                  alt={i.service}
                                  className="w-24 h-20 object-cover rounded border border-slate-300"
                                />
                                <p className="text-[10px] text-slate-500 truncate mt-0.5">{i.service}</p>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. Lista Consolidada de Materiais Inclusos */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1.5">
                  2. Relação de Materiais Inclusos
                </h3>
                {consolidatedShoppingList.length === 0 ? (
                  <p className="text-sm text-slate-500 italic">Mão de obra técnica (sem materiais adicionais listados).</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {consolidatedShoppingList.map(mat => (
                      <div
                        key={mat.key}
                        className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 text-xs sm:text-sm"
                      >
                        <span className="font-medium text-slate-800">{mat.name}</span>
                        <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded shrink-0 ml-2">
                          {mat.totalQty} {mat.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 3. Quadro Único de Valor Total (Serviços + Materiais Inclusos) */}
              <div className="pt-2">
                <div className="bg-slate-900 text-white p-4 sm:p-5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-blue-300">
                      Investimento Global
                    </div>
                    <div className="text-sm font-semibold text-slate-200">
                      Valor Total (Serviços + Materiais Inclusos)
                    </div>
                  </div>
                  <div className="text-2xl font-extrabold text-white">
                    R$ {formatCurrency(currentTotalPrice)}
                  </div>
                </div>

                {currentVisit.notes?.trim() && (
                  <div className="mt-3 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <strong>Observações:</strong> {currentVisit.notes}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            ABA 4: CHECKLIST DE EXECUÇÃO EM CAMPO
        ========================================== */}
        {activeTab === 'execucao' && (
          <div className="space-y-4">
            {/* Card de Progresso da Obra */}
            <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                    <CheckSquare className="w-5 h-5 text-emerald-600" />
                    Checklist de Execução
                  </h2>
                  <p className="text-xs text-slate-500">
                    Vá marcando cada serviço conforme finalizar em cada ambiente para não esquecer nada.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-extrabold text-emerald-600">{executionStats.pct}%</span>
                  <div className="text-[11px] text-slate-500">
                    {executionStats.done} de {executionStats.total} prontos
                  </div>
                </div>
              </div>

              {/* Barra de Progresso */}
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${executionStats.pct}%` }}
                />
              </div>

              {/* Filtros Rápidos */}
              <div className="flex items-center gap-2 pt-1">
                {[
                  { id: 'todos', label: `Todos (${executionStats.total})` },
                  { id: 'pendentes', label: `Pendentes (${executionStats.total - executionStats.done})` },
                  { id: 'concluidos', label: `Concluídos (${executionStats.done})` }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setExecFilter(tab.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                      execFilter === tab.id
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Ambientes e Checkboxes de Execução */}
            {Object.entries(groupedByEnvironment).map(([env, items]) => {
              const filteredItems = items.filter(it => {
                if (execFilter === 'pendentes') return !it.completed;
                if (execFilter === 'concluidos') return it.completed;
                return true;
              });

              if (filteredItems.length === 0) return null;

              const allDoneInEnv = items.every(i => i.completed);

              return (
                <div
                  key={env}
                  className={`bg-white rounded-2xl shadow-xs border overflow-hidden transition ${
                    allDoneInEnv ? 'border-emerald-300' : 'border-slate-200'
                  }`}
                >
                  <div
                    className={`px-4 py-3 flex items-center justify-between ${
                      allDoneInEnv ? 'bg-emerald-700 text-white' : 'bg-slate-800 text-white'
                    }`}
                  >
                    <div className="font-bold text-sm flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{env}</span>
                    </div>
                    <span className="text-xs font-semibold bg-black/20 px-2.5 py-0.5 rounded-full">
                      {items.filter(i => i.completed).length}/{items.length} concluídos
                    </span>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {filteredItems.map(item => (
                      <div
                        key={item.id}
                        className={`p-4 flex items-start justify-between gap-3 transition ${
                          item.completed ? 'bg-emerald-50/40' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div
                          onClick={() => toggleItemCompleted(item.id)}
                          className="flex items-start gap-3.5 cursor-pointer flex-1 select-none"
                        >
                          <input
                            type="checkbox"
                            checked={item.completed}
                            onChange={() => {}}
                            className="mt-0.5 w-6 h-6 accent-emerald-600 rounded-lg cursor-pointer shrink-0"
                          />
                          <div className="space-y-1">
                            <div
                              className={`font-bold text-sm sm:text-base ${
                                item.completed ? 'line-through text-slate-400' : 'text-slate-900'
                              }`}
                            >
                              {item.service}
                            </div>

                            {/* Materiais que precisam ser levados para aquela sala */}
                            {item.needsMaterial && item.materials.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 pt-0.5">
                                {item.materials.map(m => (
                                  <span
                                    key={m.id}
                                    className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200"
                                  >
                                    Levar: <strong>{m.qty} {m.unit}</strong> {m.name}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Fotos Antes / Depois */}
                            <div className="flex items-center gap-3 pt-1">
                              {item.photoBefore && (
                                <button
                                  type="button"
                                  onClick={e => {
                                    e.stopPropagation();
                                    setPreviewImage(item.photoBefore);
                                  }}
                                  className="text-xs text-blue-600 font-semibold flex items-center gap-1 hover:underline"
                                >
                                  <ImageIcon className="w-3.5 h-3.5" /> Foto Antes
                                </button>
                              )}
                              {item.photoAfter && (
                                <button
                                  type="button"
                                  onClick={e => {
                                    e.stopPropagation();
                                    setPreviewImage(item.photoAfter);
                                  }}
                                  className="text-xs text-emerald-600 font-semibold flex items-center gap-1 hover:underline"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Foto Concluído
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Botão para tirar foto do serviço pronto */}
                        <label className="cursor-pointer p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 flex items-center gap-1 text-xs font-medium shrink-0">
                          <Camera className="w-4 h-4 text-emerald-600" />
                          <span className="hidden sm:inline">Foto Pronto</span>
                          <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={e =>
                              handlePhotoUpload(e, base64 => handleAddAfterPhoto(item.id, base64))
                            }
                            className="hidden"
                          />
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Barra de Navegação Inferior (Mobile-First) */}
      <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 z-40 shadow-lg print:hidden">
        <div className="max-w-4xl mx-auto grid grid-cols-4">
          <button
            onClick={() => setActiveTab('levantamento')}
            className={`py-2.5 px-1 flex flex-col items-center justify-center gap-1 text-xs font-bold transition ${
              activeTab === 'levantamento'
                ? 'text-blue-600 border-t-2 border-blue-600 bg-blue-50/30'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <ClipboardList className="w-5 h-5" />
            <span>1. Visita</span>
          </button>

          <button
            onClick={() => setActiveTab('compras')}
            className={`py-2.5 px-1 flex flex-col items-center justify-center gap-1 text-xs font-bold transition relative ${
              activeTab === 'compras'
                ? 'text-emerald-600 border-t-2 border-emerald-600 bg-emerald-50/30'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShoppingCart className="w-5 h-5" />
            <span>2. Compras</span>
            {consolidatedShoppingList.length > 0 && (
              <span className="absolute top-1.5 right-6 bg-amber-500 text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">
                {consolidatedShoppingList.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('orcamento')}
            className={`py-2.5 px-1 flex flex-col items-center justify-center gap-1 text-xs font-bold transition ${
              activeTab === 'orcamento'
                ? 'text-blue-600 border-t-2 border-blue-600 bg-blue-50/30'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-5 h-5" />
            <span>3. Orçamento</span>
          </button>

          <button
            onClick={() => setActiveTab('execucao')}
            className={`py-2.5 px-1 flex flex-col items-center justify-center gap-1 text-xs font-bold transition ${
              activeTab === 'execucao'
                ? 'text-emerald-600 border-t-2 border-emerald-600 bg-emerald-50/30'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <CheckSquare className="w-5 h-5" />
            <span>4. Executar</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
