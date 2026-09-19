'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { LocalStore } from '@/lib/store';
import { Shop, TableItem } from '@/lib/types/database.types';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import {
  QrCode,
  Plus,
  Printer,
  Trash2,
  Edit2,
  Copy,
  Check,
  Download,
  ExternalLink,
  Sparkles,
  Utensils,
  X,
} from 'lucide-react';

export default function TablesManagerPage() {
  const [shop, setShop] = useState<Shop | null>(null);
  const [tables, setTables] = useState<TableItem[]>([]);
  const [baseUrl, setBaseUrl] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<TableItem | null>(null);
  const [labelInput, setLabelInput] = useState('');

  useEffect(() => {
    setShop(LocalStore.getShop());
    setTables(LocalStore.getTables());
    if (typeof window !== 'undefined') {
      setBaseUrl(window.location.origin);
    }
  }, []);

  const handleSaveTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!labelInput.trim()) return;

    let updated: TableItem[];
    if (editingTable) {
      updated = tables.map(t =>
        t.id === editingTable.id ? { ...t, label: labelInput.trim() } : t
      );
    } else {
      const newTable: TableItem = {
        id: `tbl-${Date.now()}`,
        shop_id: shop?.id || 'demo-shop',
        label: labelInput.trim(),
        created_at: new Date().toISOString(),
      };
      updated = [...tables, newTable];
    }

    setTables(updated);
    LocalStore.saveTables(updated);
    setModalOpen(false);
    setLabelInput('');
    setEditingTable(null);
  };

  const handleDeleteTable = (tableId: string) => {
    if (!confirm('Remove this table QR code?')) return;
    const updated = tables.filter(t => t.id !== tableId);
    setTables(updated);
    LocalStore.saveTables(updated);
  };

  const handleCopyLink = (tableLabel: string, tableId: string) => {
    const url = `${baseUrl}/s/${shop?.slug || 'chai-bites'}?table=${encodeURIComponent(tableLabel)}`;
    navigator.clipboard.writeText(url);
    setCopiedId(tableId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadQR = (tableId: string, tableLabel: string) => {
    const canvas = document.getElementById(`qr-canvas-${tableId}`) as HTMLCanvasElement;
    if (!canvas) return;

    // Create high-res composite PNG with shop name and table label
    const downloadCanvas = document.createElement('canvas');
    const ctx = downloadCanvas.getContext('2d');
    const size = 400;
    downloadCanvas.width = size;
    downloadCanvas.height = size + 100;

    if (ctx) {
      // Background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, downloadCanvas.width, downloadCanvas.height);

      // Border
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 8;
      ctx.strokeRect(10, 10, downloadCanvas.width - 20, downloadCanvas.height - 20);

      // Shop Name Header
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(shop?.name || 'ScanServe Shop', size / 2, 50);

      // QR Code Image
      ctx.drawImage(canvas, 50, 70, 300, 300);

      // Table Label Banner
      ctx.fillStyle = '#d97706';
      ctx.roundRect ? ctx.roundRect(70, 390, 260, 44, 12) : ctx.fillRect(70, 390, 260, 44);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText(tableLabel, size / 2, 420);
    }

    const image = downloadCanvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = image;
    a.download = `${shop?.slug || 'shop'}-${tableLabel.toLowerCase().replace(/[^a-z0-9]/g, '-')}-qr.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (!shop) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-24">
      {/* Top Navigation - Hidden when printing */}
      <div className="no-print">
        <Navbar shopSlug={shop.slug} shopName={shop.name} />
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* Header - Hidden when printing */}
        <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center space-x-3">
              <QrCode className="w-8 h-8 text-amber-500" />
              <span>Tables & QR Code Generator</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Print-ready QR standees for every table. Customers scan and order instantly.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="py-2.5 px-4 bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 text-xs font-semibold rounded-xl transition flex items-center space-x-2 shadow"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>Print Sheet</span>
            </button>

            <button
              onClick={() => {
                setEditingTable(null);
                setLabelInput(`Table ${tables.length + 1}`);
                setModalOpen(true);
              }}
              className="py-2.5 px-5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold rounded-xl shadow-lg shadow-amber-500/20 transition flex items-center space-x-1.5 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add Table</span>
            </button>
          </div>
        </div>

        {/* PRINTABLE AREA CONTAINER (Targeted by @media print) */}
        <div className="printable-qr-area">
          {/* Printable Header Notice */}
          <div className="hidden print:block text-center mb-6">
            <h1 className="text-2xl font-black text-black">{shop.name}</h1>
            <p className="text-xs text-gray-600">Scan QR Code on your phone table camera to order & pay</p>
          </div>

          {/* Grid of QR Code Table Standees */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {tables.map(table => {
              const tableUrl = `${baseUrl}/s/${shop.slug}?table=${encodeURIComponent(table.label)}`;
              return (
                <div
                  key={table.id}
                  className="bg-slate-900 border border-slate-800 print:border-2 print:border-black print:bg-white print:text-black rounded-3xl p-6 flex flex-col items-center justify-between shadow-xl relative group transition hover:border-amber-500/50"
                >
                  {/* Shop Branding Banner */}
                  <div className="text-center w-full mb-3">
                    <div className="w-10 h-10 mx-auto rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 print:bg-black print:text-white flex items-center justify-center font-black text-lg mb-1 shadow">
                      {shop.name.charAt(0)}
                    </div>
                    <h3 className="text-sm font-bold text-white print:text-black truncate px-2">{shop.name}</h3>
                  </div>

                  {/* QR Code Container */}
                  <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-inner my-2 relative">
                    <QRCodeSVG
                      value={tableUrl}
                      size={140}
                      level="H"
                      includeMargin={false}
                    />
                    <div className="hidden">
                      <QRCodeCanvas
                        id={`qr-canvas-${table.id}`}
                        value={tableUrl}
                        size={300}
                        level="H"
                        includeMargin={false}
                      />
                    </div>
                  </div>

                  {/* Table Label Pill */}
                  <div className="mt-3 text-center w-full">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-amber-500/20 text-amber-400 print:bg-black print:text-white font-black text-base tracking-wide border border-amber-500/30 print:border-black">
                      {table.label}
                    </span>
                    <p className="text-[11px] text-slate-400 print:text-gray-600 mt-1 font-medium">
                      Scan with phone camera to order
                    </p>
                  </div>

                  {/* Card Actions (Hidden in Print) */}
                  <div className="no-print mt-4 pt-3 border-t border-slate-800 w-full flex items-center justify-between">
                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => handleDownloadQR(table.id, table.label)}
                        className="py-1 px-2.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 rounded-lg text-xs font-bold transition flex items-center space-x-1"
                        title="Download High-Res PNG QR Code"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>PNG</span>
                      </button>

                      <button
                        onClick={() => handleCopyLink(table.label, table.id)}
                        className="p-1.5 text-slate-400 hover:text-amber-400 transition flex items-center space-x-1 text-xs"
                        title="Copy QR Link"
                      >
                        {copiedId === table.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400 font-semibold">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Copy</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => {
                          setEditingTable(table);
                          setLabelInput(table.label);
                          setModalOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
                        title="Edit Label"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteTable(table.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg transition"
                        title="Delete Table"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* ADD / EDIT TABLE MODAL */}
      {modalOpen && (
        <div className="no-print fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">
                {editingTable ? 'Edit Table Label' : 'Add New Table'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTable} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Table Label
                </label>
                <input
                  type="text"
                  required
                  value={labelInput}
                  onChange={(e) => setLabelInput(e.target.value)}
                  placeholder="e.g. Table 5, Terrace T-1"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="py-2.5 px-4 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-6 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-xs font-bold rounded-xl hover:from-amber-400 hover:to-amber-500 transition"
                >
                  Save Table
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
