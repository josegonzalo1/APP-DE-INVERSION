export interface PresetAsset {
  symbol: string;
  name: string;
  category: 'Acciones' | 'Cripto' | 'Materias Primas' | 'Índices' | 'Forex';
  icon: string;
  typicalPrice?: string;
}

export const PRESET_ASSETS: PresetAsset[] = [
  { symbol: 'NVDA', name: 'NVIDIA Corp.', category: 'Acciones', icon: 'Cpu', typicalPrice: '135.00 USD' },
  { symbol: 'AAPL', name: 'Apple Inc.', category: 'Acciones', icon: 'Smartphone', typicalPrice: '228.00 USD' },
  { symbol: 'TSLA', name: 'Tesla Inc.', category: 'Acciones', icon: 'Zap', typicalPrice: '215.00 USD' },
  { symbol: 'MSFT', name: 'Microsoft Corp.', category: 'Acciones', icon: 'Cloud', typicalPrice: '418.00 USD' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', category: 'Acciones', icon: 'ShoppingBag', typicalPrice: '190.00 USD' },
  { symbol: 'BTC', name: 'Bitcoin', category: 'Cripto', icon: 'Coins', typicalPrice: '96,500 USD' },
  { symbol: 'ETH', name: 'Ethereum', category: 'Cripto', icon: 'Boxes', typicalPrice: '2,750 USD' },
  { symbol: 'ORO', name: 'Oro (Gold Spot)', category: 'Materias Primas', icon: 'ShieldAlert', typicalPrice: '2,900 USD/oz' },
  { symbol: 'PETROLEO', name: 'Petróleo Crudo WTI', category: 'Materias Primas', icon: 'Droplet', typicalPrice: '71.50 USD' },
  { symbol: 'US500', name: 'Índice US 500 (S&P 500)', category: 'Índices', icon: 'TrendingUp', typicalPrice: '5,960 USD' },
  { symbol: 'US100', name: 'Índice US 100 (Nasdaq 100)', category: 'Índices', icon: 'Activity', typicalPrice: '21,650 USD' },
  { symbol: 'EURUSD', name: 'EUR / USD', category: 'Forex', icon: 'Globe', typicalPrice: '1.0520' },
];
