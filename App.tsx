import React, { useState, useEffect, useMemo, useRef } from 'react';
import { OrderItem, SoldItem, PriceItem } from './types';
// Fix: Corrected typo from SOLD_to_OPTIONS to SOLD_TO_OPTIONS
import { SIZES, QUANTITIES, SOLD_TO_OPTIONS, PRICES_DATA } from './constants';
import { log, getLogs, clearLogs } from './logger';


// Declare XLSX since it's loaded from a script tag
declare const XLSX: any;
declare const Chart: any;

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
  </svg>
);

const CalendarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
    </svg>
);

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const ProducedIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h6m-6 4h6m-6 4h6" />
    </svg>
);

const SoldIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);

const TotalIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m2 10h-8a2 2 0 01-2-2V5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 01-2 2zM5 7h.01M5 11h.01M5 15h.01" />
    </svg>
);

const SettingsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const EditIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
    </svg>
);

const UserGroupIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" viewBox="0 0 20 20" fill="currentColor">
      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
    </svg>
);

const SaveIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6a1 1 0 10-2 0v5.586l-1.293-1.293zM3 4a1 1 0 011-1h12a1 1 0 011 1v1a1 1 0 01-1 1H4a1 1 0 01-1-1V4z" />
    </svg>
);

const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

const UploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);

const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
);

const MinusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
    </svg>
);

const PackageIcon = () => (
     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
);

const LoginIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
    </svg>
);

const LogoutIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
);

const SyncIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4 4l1.5 1.5A9 9 0 0120.5 10M20 20l-1.5-1.5A9 9 0 003.5 14" />
    </svg>
);

const InstallAppIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
);

type View = 'produced' | 'sold' | 'total' | 'settings';
type Theme = 'light' | 'dark';
type DailyData<T> = { [yearMonth: string]: { [day: number]: T[] } };

const getYearMonthKey = (date: Date): string => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};

export const App: React.FC = () => {
  const [dailyOrders, setDailyOrders] = useState<DailyData<OrderItem>>(() => {
    try { const saved = localStorage.getItem('dailyOrders'); return saved ? JSON.parse(saved) : {}; } catch (e) { return {}; }
  });
  const [dailySoldItems, setDailySoldItems] = useState<DailyData<SoldItem>>(() => {
    try { const saved = localStorage.getItem('dailySoldItems'); return saved ? JSON.parse(saved) : {}; } catch (e) { return {}; }
  });
  const [prices, setPrices] = useState<PriceItem[]>(() => {
    try { const saved = localStorage.getItem('prices'); return saved ? JSON.parse(saved) : PRICES_DATA; } catch (e) { return PRICES_DATA; }
  });
  const [soldToOptions, setSoldToOptions] = useState<string[]>(() => {
    try { const saved = localStorage.getItem('soldToOptions'); return saved ? JSON.parse(saved) : SOLD_TO_OPTIONS; } catch (e) { return SOLD_TO_OPTIONS; }
  });
  const [sizes, setSizes] = useState<string[]>(() => {
    try { const saved = localStorage.getItem('sizes'); return saved ? JSON.parse(saved) : SIZES; } catch (e) { return SIZES; }
  });

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedQuantity, setSelectedQuantity] = useState<number | ''>('');
  const [selectedSoldTo, setSelectedSoldTo] = useState<string>('');
  const [itemToRemove, setItemToRemove] = useState<OrderItem | null>(null);
  const [itemToRemoveSold, setItemToRemoveSold] = useState<SoldItem | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<View>('produced');
  const [theme, setTheme] = useState<Theme>(() => {
      const savedTheme = localStorage.getItem('theme') as Theme;
      return savedTheme === 'light' || savedTheme === 'dark' ? savedTheme : 'light';
  });
  const [zoomLevel, setZoomLevel] = useState<number>(() => {
    try { const saved = localStorage.getItem('zoomLevel'); return saved ? JSON.parse(saved) : 100; } catch (e) { return 100; }
  });
  const [isPriceModalOpen, setIsPriceModalOpen] = useState<boolean>(false);
  const [editedPrices, setEditedPrices] = useState<PriceItem[]>([]);
  const [totalViewTab, setTotalViewTab] = useState<'stock' | 'revenue' | 'graphics'>('stock');
  const [isStockWarningModalOpen, setIsStockWarningModalOpen] = useState<boolean>(false);
  const [stockWarningMessage, setStockWarningMessage] = useState<string>('');
  const [isClientsModalOpen, setIsClientsModalOpen] = useState<boolean>(false);
  const [newClientName, setNewClientName] = useState<string>('');
  const [clientToRemove, setClientToRemove] = useState<string | null>(null);
  const [isSizesModalOpen, setIsSizesModalOpen] = useState<boolean>(false);
  const [newSizeName, setNewSizeName] = useState<string>('');
  const [sizeToRemove, setSizeToRemove] = useState<string | null>(null);
  const [versionClickCount, setVersionClickCount] = useState(0);
  const [isDebugMenuOpen, setIsDebugMenuOpen] = useState(false);
  const [logs, setLogs] = useState(() => getLogs());
  
  // Auth & Sync State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  // PWA Install State
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<any>(null);

    useEffect(() => {
        const handleBeforeInstallPrompt = (e: any) => {
            // Prevent Chrome 67 and earlier from automatically showing the prompt
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setInstallPrompt(e);
            log('Омода барои насби барнома (PWA).');
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!installPrompt) return;
        // Show the install prompt
        installPrompt.prompt();
        // Wait for the user to respond to the prompt
        const { outcome } = await installPrompt.userChoice;
        if (outcome === 'accepted') {
            log('Корбар насби барномаро қабул кард');
        } else {
            log('Корбар насби барномаро рад кард');
        }
        // We've used the prompt, and can't use it again, throw it away
        setInstallPrompt(null);
    };


    useEffect(() => {
        log('Барнома оғоз шуд.');
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            setCurrentUser(savedUser);
            setIsLoggedIn(true);
            log(`Корбар ${savedUser} ба система ворид шуд (аз сессияи пешина).`);
        }
    }, []);

    const exportDataToServer = useMemo(() => async () => {
        if (!isLoggedIn || !navigator.onLine) return;
        
        setIsSyncing(true);
        log('Оғози содирот ба сервер...');

        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay

        try {
            const appData = {
                dailyOrders, dailySoldItems, prices, soldToOptions, sizes,
                updatedAt: new Date().toISOString()
            };
            localStorage.setItem('server_data', JSON.stringify(appData));
            log('Маълумот бомуваффақият ба сервер содир карда шуд.');
        } catch (e) {
            log(`Хатогӣ ҳангоми содирот ба сервер: ${e}`);
        } finally {
            setIsSyncing(false);
        }
    }, [isLoggedIn, dailyOrders, dailySoldItems, prices, soldToOptions, sizes]);
    
    useEffect(() => { localStorage.setItem('dailyOrders', JSON.stringify(dailyOrders)); exportDataToServer(); }, [dailyOrders, exportDataToServer]);
    useEffect(() => { localStorage.setItem('dailySoldItems', JSON.stringify(dailySoldItems)); exportDataToServer(); }, [dailySoldItems, exportDataToServer]);
    useEffect(() => { localStorage.setItem('prices', JSON.stringify(prices)); exportDataToServer(); }, [prices, exportDataToServer]);
    useEffect(() => { localStorage.setItem('soldToOptions', JSON.stringify(soldToOptions)); exportDataToServer(); }, [soldToOptions, exportDataToServer]);
    useEffect(() => { localStorage.setItem('sizes', JSON.stringify(sizes)); exportDataToServer(); }, [sizes, exportDataToServer]);


    useEffect(() => {
        document.documentElement.style.fontSize = `${zoomLevel}%`;
        localStorage.setItem('zoomLevel', JSON.stringify(zoomLevel));
        log(`Сатҳи масштаб ба ${zoomLevel}% иваз шуд.`);
    }, [zoomLevel]);

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.toggle('dark', theme === 'dark');
        localStorage.setItem('theme', theme);
        log(`Намуди зоҳирӣ ба '${theme}' иваз шуд.`);
    }, [theme]);
    
    useEffect(() => {
        log(`Намуд ба '${activeView}' иваз шуд.`);
    }, [activeView]);

    const importDataFromServer = async () => {
        if (!isLoggedIn) { alert('Лутфан, аввал ба система ворид шавед.'); return; }
        if (!navigator.onLine) { alert('Барои воридот аз сервер пайвастшавӣ ба интернет лозим аст.'); return; }
        if (!window.confirm('Оё шумо мутмаин ҳастед? Маълумоти ҷории шумо бо маълумоти сервер иваз карда мешавад.')) return;

        log('Оғози воридот аз сервер...');
        try {
            await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
            const serverDataRaw = localStorage.getItem('server_data');
            if (serverDataRaw) {
                const serverData = JSON.parse(serverDataRaw);
                setDailyOrders(serverData.dailyOrders || {});
                setDailySoldItems(serverData.dailySoldItems || {});
                setPrices(serverData.prices || PRICES_DATA);
                setSoldToOptions(serverData.soldToOptions || SOLD_TO_OPTIONS);
                setSizes(serverData.sizes || SIZES);
                log(`Маълумот аз сервер бомуваффақият ворид карда шуд (санаи навсозӣ: ${serverData.updatedAt}).`);
                alert('Маълумот аз сервер бомуваффақият ворид карда шуд!');
            } else {
                log('Дар сервер маълумот ёфт нашуд.');
                alert('Дар сервер маълумот барои воридот вуҷуд надорад.');
            }
        } catch (e) {
            log(`Хатогӣ ҳангоми воридот аз сервер: ${e}`);
            alert('Хатогӣ ҳангоми воридот аз сервер.');
        }
    };
    
    const handleLoginAttempt = () => {
        if (loginUsername === 'Stol' && loginPassword === 'Stol') {
            setCurrentUser(loginUsername);
            setIsLoggedIn(true);
            localStorage.setItem('currentUser', loginUsername);
            log(`Корбар ${loginUsername} бомуваффақият ба система ворид шуд.`);
            setIsLoginModalOpen(false);
            setLoginUsername(''); setLoginPassword(''); setLoginError('');
        } else {
            setLoginError('Номи корбар ё парол нодуруст аст.');
            log(`Кӯшиши нобарори воридшавӣ бо номи корбар: ${loginUsername}`);
        }
    };

    const handleLogout = () => {
        if (window.confirm('Оё шумо мехоҳед аз система берун шавед?')) {
            const user = currentUser;
            setCurrentUser(null);
            setIsLoggedIn(false);
            localStorage.removeItem('currentUser');
            log(`Корбар ${user} аз система берун шуд.`);
        }
    };

  const yearMonthKey = getYearMonthKey(selectedDate);
  const dayKey = selectedDate.getDate();
  
  const currentOrderItems = (dailyOrders[yearMonthKey] && dailyOrders[yearMonthKey][dayKey]) || [];
  const currentSoldItems = (dailySoldItems[yearMonthKey] && dailySoldItems[yearMonthKey][dayKey]) || [];

  const handleAddItem = () => {
    if (selectedSize && selectedQuantity) {
      const newItem: OrderItem = { id: crypto.randomUUID(), size: selectedSize, quantity: selectedQuantity as number };
      
      const newDailyOrders = JSON.parse(JSON.stringify(dailyOrders));
      if (!newDailyOrders[yearMonthKey]) newDailyOrders[yearMonthKey] = {};
      const updatedDayOrders = [...((newDailyOrders[yearMonthKey] && newDailyOrders[yearMonthKey][dayKey]) || []), newItem];
      newDailyOrders[yearMonthKey][dayKey] = updatedDayOrders;
      
      setDailyOrders(newDailyOrders);
      log(`Моли нав илова шуд: ${newItem.size}, миқдор: ${newItem.quantity}`);
      setSelectedSize('');
      setSelectedQuantity('');
    }
  };

  const handleAddSoldItem = () => {
    if (selectedSize && selectedQuantity) {
        const quantityToSell = selectedQuantity as number;
        const allProducedItems = Object.values(dailyOrders).flatMap(month => Object.values(month).flat());
        const totalProduced = allProducedItems.filter(item => item.size === selectedSize).reduce((sum, item) => sum + item.quantity, 0);
        const allSoldItems = Object.values(dailySoldItems).flatMap(month => Object.values(month).flat());
        const totalSold = allSoldItems.filter(item => item.size === selectedSize).reduce((sum, item) => sum + item.quantity, 0);
        const availableStock = totalProduced - totalSold;

        if (quantityToSell > availableStock) {
            const warningMsg = `Мол дар анбор барои андозаи "${selectedSize}" нокифоя аст. Дар анбор ${availableStock} дона мавҷуд аст.`;
            setStockWarningMessage(warningMsg);
            setIsStockWarningModalOpen(true);
            log(`Кӯшиши фурӯши мол аз меъёри мавҷуда: ${warningMsg}`);
            return;
        }

        const newItem: SoldItem = { id: crypto.randomUUID(), size: selectedSize, quantity: quantityToSell, soldTo: selectedSoldTo || 'Мизоҷ' };
        
        const newDailySoldItems = JSON.parse(JSON.stringify(dailySoldItems));
        if (!newDailySoldItems[yearMonthKey]) newDailySoldItems[yearMonthKey] = {};
        const updatedDaySoldItems = [...((newDailySoldItems[yearMonthKey] && newDailySoldItems[yearMonthKey][dayKey]) || []), newItem];
        newDailySoldItems[yearMonthKey][dayKey] = updatedDaySoldItems;

        setDailySoldItems(newDailySoldItems);
        log(`Мол фурӯхта шуд: ${newItem.size}, миқдор: ${newItem.quantity}, харидор: ${newItem.soldTo}`);
        setSelectedSize('');
        setSelectedQuantity('');
        setSelectedSoldTo('');
    }
  };
  
  const handleConfirmRemove = () => {
    if (itemToRemove) {
      const updatedDayOrders = currentOrderItems.filter(item => item.id !== itemToRemove.id);
      const newDailyOrders = JSON.parse(JSON.stringify(dailyOrders)); // Deep copy
      if (!newDailyOrders[yearMonthKey]) newDailyOrders[yearMonthKey] = {};
      
      if (updatedDayOrders.length > 0) {
        newDailyOrders[yearMonthKey][dayKey] = updatedDayOrders;
      } else {
        delete newDailyOrders[yearMonthKey][dayKey];
        if (Object.keys(newDailyOrders[yearMonthKey]).length === 0) {
            delete newDailyOrders[yearMonthKey];
        }
      }
      setDailyOrders(newDailyOrders);
      log(`Истеҳсоли мол хориҷ карда шуд: ${itemToRemove.size}, миқдор: ${itemToRemove.quantity}`);
      setItemToRemove(null);
    }
  };
  
  const handleConfirmRemoveSold = () => {
    if (itemToRemoveSold) {
        const updatedDaySoldItems = currentSoldItems.filter(item => item.id !== itemToRemoveSold.id);
        const newDailySoldItems = JSON.parse(JSON.stringify(dailySoldItems)); // Deep copy
        if (!newDailySoldItems[yearMonthKey]) newDailySoldItems[yearMonthKey] = {};

        if (updatedDaySoldItems.length > 0) {
            newDailySoldItems[yearMonthKey][dayKey] = updatedDaySoldItems;
        } else {
            delete newDailySoldItems[yearMonthKey][dayKey];
            if (Object.keys(newDailySoldItems[yearMonthKey]).length === 0) {
                delete newDailySoldItems[yearMonthKey];
            }
        }
        setDailySoldItems(newDailySoldItems);
        log(`Фурӯши мол бекор карда шуд: ${itemToRemoveSold.size}, миқдор: ${itemToRemoveSold.quantity}`);
        setItemToRemoveSold(null);
    }
  };

  const handleSavePrices = () => {
    setPrices(editedPrices);
    log('Нархҳо навсозӣ шуданд.');
    handleClosePriceModal();
  };

  const handleAddClient = () => {
      const trimmedName = newClientName.trim();
      if (trimmedName && !soldToOptions.some(opt => opt.toLowerCase() === trimmedName.toLowerCase())) {
          setSoldToOptions([...soldToOptions, trimmedName]);
          log(`Мизоҷи нав илова шуд: ${trimmedName}`);
          setNewClientName('');
      }
  };

  const handleConfirmRemoveClient = () => {
      if (clientToRemove) {
          const newOptions = soldToOptions.filter(client => client !== clientToRemove);
          setSoldToOptions(newOptions);
          log(`Мизоҷ хориҷ карда шуд: ${clientToRemove}`);
          if (selectedSoldTo === clientToRemove) setSelectedSoldTo('');
          setClientToRemove(null);
      }
  };

    const handleAddSize = () => {
        const trimmedName = newSizeName.trim();
        if (trimmedName && !sizes.some(s => s.toLowerCase() === trimmedName.toLowerCase())) {
            const newSizes = [...sizes, trimmedName];
            setSizes(newSizes);
            
            const newPriceEntry: PriceItem = { size: trimmedName, taer: 0, opt: 0, nacenka: 0 };
            setPrices([...prices, newPriceEntry]);
            log(`Андозаи нав илова шуд: ${trimmedName}`);
            setNewSizeName('');
        }
    };

    const handleConfirmRemoveSize = () => {
        if (sizeToRemove) {
            const newSizes = sizes.filter(s => s !== sizeToRemove);
            setSizes(newSizes);
            
            const newPrices = prices.filter(p => p.size !== sizeToRemove);
            setPrices(newPrices);
            
            log(`Андоза хориҷ карда шуд: ${sizeToRemove}`);
            if (selectedSize === sizeToRemove) setSelectedSize('');
            setSizeToRemove(null);
        }
    };
  
    const allTimeStockData = useMemo(() => {
        const allProducedItems = Object.values(dailyOrders).flatMap(month => Object.values(month).flat());
        const allSoldItems = Object.values(dailySoldItems).flatMap(month => Object.values(month).flat());

        return sizes.map(size => {
            const totalProduced = allProducedItems.filter(item => item.size === size).reduce((sum, item) => sum + item.quantity, 0);
            const totalSold = allSoldItems.filter(item => item.size === size).reduce((sum, item) => sum + item.quantity, 0);
            return { size, produced: totalProduced, sold: totalSold, remains: totalProduced - totalSold };
        });
    }, [dailyOrders, dailySoldItems, sizes]);

    const monthlyStockData = useMemo(() => {
        // Fix: Explicitly cast to OrderItem[] to avoid 'unknown' type error on filter/reduce
        const monthProducedItems = (dailyOrders[yearMonthKey] ? Object.values(dailyOrders[yearMonthKey]).flat() : []) as OrderItem[];
        // Fix: Explicitly cast to SoldItem[] to avoid 'unknown' type error on filter/reduce
        const monthSoldItems = (dailySoldItems[yearMonthKey] ? Object.values(dailySoldItems[yearMonthKey]).flat() : []) as SoldItem[];

        return sizes.map(size => {
            const monthlyProduced = monthProducedItems.filter(item => item.size === size).reduce((sum, item) => sum + item.quantity, 0);
            const monthlySold = monthSoldItems.filter(item => item.size === size).reduce((sum, item) => sum + item.quantity, 0);
            return { size, monthlyProduced, monthlySold };
        });
    }, [dailyOrders, dailySoldItems, yearMonthKey, sizes]);

    const stockBalanceTableData = useMemo(() => {
        return allTimeStockData.map(overall => {
            const monthly = monthlyStockData.find(m => m.size === overall.size);
            const monthlyProduced = monthly?.monthlyProduced || 0;
            const monthlySold = monthly?.monthlySold || 0;
            const prevMonthBalance = overall.remains - (monthlyProduced - monthlySold);
            
            return {
                size: overall.size,
                prevMonthBalance: prevMonthBalance,
                monthlyProduced: monthlyProduced,
                monthlySold: monthlySold,
                totalRemains: overall.remains,
            };
        });
    }, [allTimeStockData, monthlyStockData]);

  const handleExportToExcel = () => {
    const wb = XLSX.utils.book_new();

    const producedData: any[] = [];
    Object.entries(dailyOrders).forEach(([yearMonth, days]) => {
        Object.entries(days).forEach(([day, items]) => {
            const date = `${yearMonth}-${String(day).padStart(2, '0')}`;
            items.forEach(item => {
                producedData.push({ 'Сана': date, 'Андоза': item.size, 'Миқдор': item.quantity });
            });
        });
    });
    const producedWs = XLSX.utils.json_to_sheet(producedData);
    XLSX.utils.book_append_sheet(wb, producedWs, "Истеҳсолшуда");

    const soldData: any[] = [];
    Object.entries(dailySoldItems).forEach(([yearMonth, days]) => {
        Object.entries(days).forEach(([day, items]) => {
            const date = `${yearMonth}-${String(day).padStart(2, '0')}`;
            items.forEach(item => {
                soldData.push({ 'Сана': date, 'Андоза': item.size, 'Миқдор': item.quantity, 'Харидор': item.soldTo });
            });
        });
    });
    const soldWs = XLSX.utils.json_to_sheet(soldData);
    XLSX.utils.book_append_sheet(wb, soldWs, "Фурӯхташуда");
    
    const stockData = allTimeStockData.map(item => ({
        'Андоза': item.size,
        'Истеҳсоли умумӣ': item.produced,
        'Фурӯши умумӣ': item.sold,
        'Дар анбор': item.remains
    }));
    const stockWs = XLSX.utils.json_to_sheet(stockData);
    XLSX.utils.book_append_sheet(wb, stockWs, "Бақияи анбор");

    const pricesData = prices.map(p => ({
        'Андоза': p.size,
        'Арзиши аслӣ': p.taer,
        'Яклухт': p.opt,
        'Иловапулӣ': p.nacenka
    }));
    const pricesWs = XLSX.utils.json_to_sheet(pricesData);
    XLSX.utils.book_append_sheet(wb, pricesWs, "Нархҳо");

    const clientsData = soldToOptions.map(client => ({ 'Номи мизоҷ': client }));
    const clientsWs = XLSX.utils.json_to_sheet(clientsData);
    XLSX.utils.book_append_sheet(wb, clientsWs, "Мизоҷон");

    XLSX.writeFile(wb, "Hisoboti_Andozaho.xlsx");
    log('Маълумот ба Excel бомуваффақият содир карда шуд.');
  };

  const handleImportFromExcel = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = e.target?.result;
            const workbook = XLSX.read(data, { type: 'array' });

            const producedSheet = workbook.Sheets['Истеҳсолшуда'];
            if (producedSheet) {
                // Fix: Specify the type for rows from Excel sheet to avoid 'unknown' type errors.
                const producedData = XLSX.utils.sheet_to_json(producedSheet) as { 'Сана': string | number; 'Андоза': string; 'Миқдор': number }[];
                const newDailyOrders: DailyData<OrderItem> = {};
                producedData.forEach((row) => {
                    // Handle Excel's date serial number format
                    const dateValue = typeof row['Сана'] === 'number'
                        ? new Date(Date.UTC(1900, 0, row['Сана'] - 1))
                        : new Date(row['Сана']);

                    if (isNaN(dateValue.getTime())) return;
                    
                    const yearMonth = getYearMonthKey(dateValue);
                    const day = dateValue.getUTCDate();
                    
                    if (!newDailyOrders[yearMonth]) newDailyOrders[yearMonth] = {};
                    if (!newDailyOrders[yearMonth][day]) newDailyOrders[yearMonth][day] = [];
                    
                    newDailyOrders[yearMonth][day].push({ id: crypto.randomUUID(), size: row['Андоза'], quantity: row['Миқдор'] });
                });
                setDailyOrders(newDailyOrders);
            }

            const soldSheet = workbook.Sheets['Фурӯхташуда'];
            if (soldSheet) {
                // Fix: Specify the type for rows from Excel sheet to avoid 'unknown' type errors.
                const soldData = XLSX.utils.sheet_to_json(soldSheet) as { 'Сана': string | number; 'Андоза': string; 'Миқдор': number; 'Харидор': string }[];
                const newDailySoldItems: DailyData<SoldItem> = {};
                soldData.forEach((row) => {
                     const dateValue = typeof row['Сана'] === 'number'
                        ? new Date(Date.UTC(1900, 0, row['Сана'] - 1))
                        : new Date(row['Сана']);
                    if (isNaN(dateValue.getTime())) return;

                    const yearMonth = getYearMonthKey(dateValue);
                    const day = dateValue.getUTCDate();
                   
                    if (!newDailySoldItems[yearMonth]) newDailySoldItems[yearMonth] = {};
                    if (!newDailySoldItems[yearMonth][day]) newDailySoldItems[yearMonth][day] = [];
                    
                    newDailySoldItems[yearMonth][day].push({ id: crypto.randomUUID(), size: row['Андоза'], quantity: row['Миқдор'], soldTo: row['Харидор'] });
                });
                setDailySoldItems(newDailySoldItems);
            }

            const pricesSheet = workbook.Sheets['Нархҳо'];
            if (pricesSheet) {
                // Fix: Specify the type for rows from Excel sheet to avoid 'unknown' type errors.
                const pricesData = XLSX.utils.sheet_to_json(pricesSheet) as { 'Андоза': string; 'Арзиши аслӣ': number; 'Яклухт': number; 'Иловапулӣ': number }[];
                const newPrices: PriceItem[] = pricesData.map(row => ({
                    size: row['Андоза'],
                    taer: row['Арзиши аслӣ'],
                    opt: row['Яклухт'],
                    nacenka: row['Иловапулӣ']
                }));
                setPrices(newPrices);
                const newSizesFromPrices = newPrices.map(p => p.size);
                if (newSizesFromPrices.length > 0) {
                    setSizes(newSizesFromPrices);
                }
            }

            const clientsSheet = workbook.Sheets['Мизоҷон'];
            if (clientsSheet) {
                const clientsData = XLSX.utils.sheet_to_json(clientsSheet) as { 'Номи мизоҷ': string }[];
                const newClients = clientsData.map(row => row['Номи мизоҷ']);
                setSoldToOptions(newClients);
            }
            log('Воридот аз Excel бомуваффақият анҷом ёфт.');
            alert('Маълумот бомуваффақият ворид карда шуд!');
        } catch (error) {
            log(`Хатогӣ ҳангоми воридот аз Excel: ${error}`);
            console.error('Хатогӣ ҳангоми воридоти файл:', error);
            alert('Хатогӣ ҳангоми воридоти файл. Лутфан, дурустии файлро санҷед.');
        } finally {
            if (event.target) {
                event.target.value = '';
            }
        }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleIncreaseZoom = () => setZoomLevel(prev => Math.min(prev + 10, 150));
  const handleDecreaseZoom = () => setZoomLevel(prev => Math.max(prev - 10, 70));

  const handleOpenRemoveConfirm = (id: string) => setItemToRemove(currentOrderItems.find(item => item.id === id) || null);
  const handleCancelRemove = () => setItemToRemove(null);
  const handleOpenRemoveSoldConfirm = (id: string) => setItemToRemoveSold(currentSoldItems.find(item => item.id === id) || null);
  const handleCancelRemoveSold = () => setItemToRemoveSold(null);
  
  const handleDaySelect = (day: number) => { 
      setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day)); 
      setIsCalendarOpen(false); 
  };
  const handlePrevMonth = () => setSelectedDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const handleNextMonth = () => setSelectedDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const handleOpenPriceModal = () => { setEditedPrices(JSON.parse(JSON.stringify(prices))); setIsPriceModalOpen(true); };
  const handleClosePriceModal = () => setIsPriceModalOpen(false);
  const handlePriceChange = (index: number, field: keyof Omit<PriceItem, 'size'>, value: string) => {
    const newPrices = [...editedPrices];
    newPrices[index] = { ...newPrices[index], [field]: parseInt(value, 10) || 0 };
    setEditedPrices(newPrices);
  };
  const handleOpenClientsModal = () => setIsClientsModalOpen(true);
  const handleCloseClientsModal = () => { setIsClientsModalOpen(false); setNewClientName(''); };
  const handleOpenRemoveClientConfirm = (clientName: string) => setClientToRemove(clientName);
  const handleCancelRemoveClient = () => setClientToRemove(null);

  const handleOpenSizesModal = () => setIsSizesModalOpen(true);
  const handleCloseSizesModal = () => { setIsSizesModalOpen(false); setNewSizeName(''); };
  const handleOpenRemoveSizeConfirm = (sizeName: string) => setSizeToRemove(sizeName);
  const handleCancelRemoveSize = () => setSizeToRemove(null);

  const mainTitleMap = { produced: 'Истеҳсол', sold: 'Фуруш', total: 'Натиҷа', settings: 'Танзимот' };
  const mainTitle = mainTitleMap[activeView];

  const profitData = useMemo(() => {
    const monthSoldItems = (dailySoldItems[yearMonthKey] ? Object.values(dailySoldItems[yearMonthKey]).flat() : []);
    let totalProfit = 0;
    // Fix: Explicitly type 'item' as SoldItem to resolve property access errors.
    const profitBySize = monthSoldItems.reduce((acc, item: SoldItem) => {
        const priceInfo = prices.find(p => p.size === item.size);
        if (priceInfo) {
            const itemProfit = (priceInfo.opt - priceInfo.taer) * item.quantity;
            totalProfit += itemProfit;
            acc[item.size] = (acc[item.size] || { quantity: 0, profit: 0 });
            acc[item.size].quantity += item.quantity;
            acc[item.size].profit += itemProfit;
        }
        return acc;
    }, {} as { [key: string]: { quantity: number; profit: number } });
    const sortedBySize = Object.entries(profitBySize).map(([size, data]) => ({ size, ...data })).sort((a, b) => b.profit - a.profit);
    return { bySize: sortedBySize, total: totalProfit };
  }, [dailySoldItems, prices, yearMonthKey]);

  const clientPurchaseData = useMemo(() => {
    const monthSoldItems = (dailySoldItems[yearMonthKey] ? Object.values(dailySoldItems[yearMonthKey]).flat() : []);
    // Fix: Explicitly type 'item' as SoldItem to resolve property access errors.
    const purchasesByClient = monthSoldItems.reduce((acc, item: SoldItem) => {
        const priceInfo = prices.find(p => p.size === item.size);
        if (priceInfo) {
            const itemValue = (priceInfo.opt + priceInfo.nacenka) * item.quantity;
            const client = item.soldTo;
            if (!acc[client]) acc[client] = { totalAmount: 0, items: {} };
            acc[client].totalAmount += itemValue;
            acc[client].items[item.size] = (acc[client].items[item.size] || 0) + item.quantity;
        }
        return acc;
    }, {} as { [key: string]: { totalAmount: number; items: { [key: string]: number } } });
    return Object.entries(purchasesByClient).map(([name, data]) => ({ name, totalAmount: data.totalAmount, purchasedItems: Object.entries(data.items).map(([size, quantity]) => ({ size, quantity })) })).sort((a, b) => b.totalAmount - a.totalAmount);
  }, [dailySoldItems, prices, yearMonthKey]);
  
    useEffect(() => {
        if (totalViewTab !== 'graphics' || !chartRef.current) {
            return;
        }

        if (chartInstanceRef.current) {
            chartInstanceRef.current.destroy();
        }

        const ctx = chartRef.current.getContext('2d');
        const isDark = theme === 'dark';
        
        Chart.defaults.color = isDark ? '#cbd5e1' : '#475569';
        Chart.defaults.borderColor = isDark ? '#475569' : '#e2e8f0';

        chartInstanceRef.current = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: allTimeStockData.map(item => item.size),
                datasets: [
                    {
                        label: 'Истеҳсоли умумӣ',
                        data: allTimeStockData.map(item => item.produced),
                        backgroundColor: 'rgba(79, 70, 229, 0.8)',
                        borderColor: 'rgba(79, 70, 229, 1)',
                        borderWidth: 1
                    },
                    {
                        label: 'Фурӯши умумӣ',
                        data: allTimeStockData.map(item => item.sold),
                        backgroundColor: 'rgba(22, 163, 74, 0.8)',
                        borderColor: 'rgba(22, 163, 74, 1)',
                        borderWidth: 1
                    },
                    {
                        label: 'Дар анбор',
                        data: allTimeStockData.map(item => item.remains),
                        backgroundColor: 'rgba(100, 116, 139, 0.8)',
                        borderColor: 'rgba(100, 116, 139, 1)',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Миқдор (дона)'
                        }
                    },
                    x: {
                       ticks: {
                          maxRotation: 70,
                          minRotation: 70,
                       }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Графики бақияи умумии анбор'
                    }
                }
            }
        });

        return () => {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
            }
        };
    }, [totalViewTab, allTimeStockData, theme]);

    const handleVersionClick = () => {
        const newClickCount = versionClickCount + 1;
        setVersionClickCount(newClickCount);
        if (newClickCount >= 3) {
            log('Менюи ислоҳ кушода шуд.');
            setLogs(getLogs());
            setIsDebugMenuOpen(true);
            setVersionClickCount(0);
        }
    };

    const handleCloseDebugMenu = () => {
        setIsDebugMenuOpen(false);
        setVersionClickCount(0);
    };

    const handleRefreshLogs = () => {
        setLogs(getLogs());
    };

    const handleClearLogs = () => {
        clearLogs();
        setLogs([]);
        log('Феҳристи логҳо тоза карда шуд.');
        handleRefreshLogs();
    };

    const renderCalendar = () => {
        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0=Sun, 1=Mon...
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const startingDayOfWeek = (firstDayOfMonth === 0) ? 6 : firstDayOfMonth - 1; // 0=Mon, 6=Sun

        return (
             <div className="absolute top-full mt-2 left-0 z-20 w-80 bg-white dark:bg-slate-800 p-4 rounded-lg shadow-xl border dark:border-slate-700">
                <div className="flex justify-between items-center mb-4">
                    <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition">&lt;</button>
                    <span className="font-semibold text-lg">{selectedDate.toLocaleString('tg-TJ', { month: 'long', year: 'numeric' })}</span>
                    <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition">&gt;</button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-sm text-slate-500 mb-2">
                    <span>Ду</span><span>Се</span><span>Чо</span><span>Па</span><span>Ҷу</span><span>Ша</span><span>Як</span>
                </div>
                <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: startingDayOfWeek }).map((_, i) => <div key={`empty-${i}`} />)}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const isSelected = day === selectedDate.getDate();
                        return (
                            <button
                                key={day}
                                onClick={() => handleDaySelect(day)}
                                className={`p-2.5 rounded-full text-center font-semibold transition ${isSelected ? 'bg-indigo-600 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                            >
                                {day}
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-50 p-6 sm:p-8 lg:p-10 pb-36 transition-colors duration-300">
      
      {isSyncing && (
          <div className="fixed top-4 right-4 z-[80] bg-slate-800 text-white text-sm px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
              <SyncIcon />
              <span>Синхронизатсия...</span>
          </div>
      )}

      <div className="max-w-4xl mx-auto">
        <header className="relative flex items-center justify-center mb-12">
            {(activeView === 'produced' || activeView === 'sold' || activeView === 'total') && (
                <div className="absolute left-0 top-[50px]">
                    <div className="relative">
                        <button onClick={() => setIsCalendarOpen(!isCalendarOpen)} className="flex items-center gap-2 p-3 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition">
                            <CalendarIcon />
                            <span className="font-semibold text-lg whitespace-nowrap">{selectedDate.toLocaleDateString('tg-TJ', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        </button>
                        {isCalendarOpen && renderCalendar()}
                    </div>
                </div>
            )}
            <h1 className="text-6xl font-extrabold text-indigo-600 dark:text-indigo-400 text-center tracking-tighter">{mainTitle}</h1>
        </header>

        <main className="space-y-10">
          {activeView === 'produced' && (
            <>
              <section className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-lg">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-end">
                  <div>
                    <label htmlFor="size-select" className="block text-base font-medium text-slate-600 dark:text-slate-300 mb-2">Андоза:</label>
                    <select id="size-select" value={selectedSize} onChange={(e) => setSelectedSize(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md py-2 px-3 text-base focus:ring-indigo-500 focus:border-indigo-500">
                      <option value="" disabled>Андозаро интихоб кунед</option>
                      {sizes.map((size) => (<option key={size} value={size}>{size}</option>))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="quantity-select" className="block text-base font-medium text-slate-600 dark:text-slate-300 mb-2">Миқдор:</label>
                    <select id="quantity-select" value={selectedQuantity} onChange={(e) => setSelectedQuantity(Number(e.target.value))} className="w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md py-2 px-3 text-base focus:ring-indigo-500 focus:border-indigo-500">
                      <option value="" disabled>Миқдорро интихоб кунед</option>
                      {QUANTITIES.map((quantity) => (<option key={quantity} value={quantity}>{quantity}</option>))}
                    </select>
                  </div>
                </div>
                <button onClick={handleAddItem} className="mt-8 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-5 rounded-md transition duration-300 flex items-center justify-center text-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                  Илова кардан
                </button>
              </section>

              <section>
                  <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden">
                      <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                          {currentOrderItems.length > 0 ? (
                              currentOrderItems.map((item) => (
                                  <li key={item.id} className="p-6 flex justify-between items-center">
                                      <div>
                                          <p className="text-lg font-medium text-indigo-800 dark:text-indigo-300">{item.size}</p>
                                          <p className="text-base text-slate-500 dark:text-slate-400">Миқдор: {item.quantity}</p>
                                      </div>
                                      <button onClick={() => handleOpenRemoveConfirm(item.id)} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 transition">
                                          <TrashIcon />
                                      </button>
                                  </li>
                              ))
                          ) : (
                              <li className="p-6 text-center text-slate-500 dark:text-slate-400">Рӯйхат холӣ аст</li>
                          )}
                      </ul>
                  </div>
              </section>
            </>
          )}

          {activeView === 'sold' && (
            <>
              <section className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-lg">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-end">
                  <div>
                    <label htmlFor="size-select-sold" className="block text-base font-medium text-slate-600 dark:text-slate-300 mb-2">Андоза:</label>
                    <select id="size-select-sold" value={selectedSize} onChange={(e) => setSelectedSize(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md py-2 px-3 text-base focus:ring-indigo-500 focus:border-indigo-500">
                      <option value="" disabled>Андозаро интихоб кунед</option>
                      {sizes.map((size) => (<option key={size} value={size}>{size}</option>))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="quantity-select-sold" className="block text-base font-medium text-slate-600 dark:text-slate-300 mb-2">Миқдор:</label>
                    <select id="quantity-select-sold" value={selectedQuantity} onChange={(e) => setSelectedQuantity(Number(e.target.value))} className="w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md py-2 px-3 text-base focus:ring-indigo-500 focus:border-indigo-500">
                      <option value="" disabled>Миқдорро интихоб кунед</option>
                      {QUANTITIES.map((quantity) => (<option key={quantity} value={quantity}>{quantity}</option>))}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="sold-to-select" className="block text-base font-medium text-slate-600 dark:text-slate-300 mb-2">Харидор:</label>
                    <select id="sold-to-select" value={selectedSoldTo} onChange={(e) => setSelectedSoldTo(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md py-2 px-3 text-base focus:ring-indigo-500 focus:border-indigo-500">
                      <option value="" disabled>Харидорро интихоб кунед</option>
                      {soldToOptions.map((option) => (<option key={option} value={option}>{option}</option>))}
                    </select>
                  </div>
                </div>
                <button onClick={handleAddSoldItem} className="mt-8 w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-5 rounded-md transition duration-300 flex items-center justify-center text-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" /></svg>
                  Фурӯхтан
                </button>
              </section>

              <section>
                  <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden">
                      <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                          {currentSoldItems.length > 0 ? (
                              currentSoldItems.map((item) => (
                                  <li key={item.id} className="p-6 flex justify-between items-center">
                                      <div>
                                          <p className="text-lg font-medium text-green-800 dark:text-green-300">{item.size}</p>
                                          <p className="text-base text-slate-500 dark:text-slate-400">Миқдор: {item.quantity}</p>
                                          <p className="text-base text-slate-500 dark:text-slate-400">Харидор: {item.soldTo}</p>
                                      </div>
                                      <button onClick={() => handleOpenRemoveSoldConfirm(item.id)} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 transition">
                                          <TrashIcon />
                                      </button>
                                  </li>
                              ))
                          ) : (
                              <li className="p-6 text-center text-slate-500 dark:text-slate-400">Рӯйхати фурӯш холӣ аст</li>
                          )}
                      </ul>
                  </div>
              </section>
            </>
          )}

          {activeView === 'total' && (
              <section>
                  <div className="flex justify-center mb-8 border-b-2 border-slate-300 dark:border-slate-700">
                      <button onClick={() => setTotalViewTab('stock')} className={`py-3 px-6 text-lg font-semibold transition-colors duration-300 ${totalViewTab === 'stock' ? 'border-b-4 border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400'}`}>Бақияи анбор</button>
                      <button onClick={() => setTotalViewTab('revenue')} className={`py-3 px-6 text-lg font-semibold transition-colors duration-300 ${totalViewTab === 'revenue' ? 'border-b-4 border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400'}`}>Даромад</button>
                      <button onClick={() => setTotalViewTab('graphics')} className={`py-3 px-6 text-lg font-semibold transition-colors duration-300 ${totalViewTab === 'graphics' ? 'border-b-4 border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400'}`}>Графикҳо</button>
                  </div>
                  
                  {totalViewTab === 'stock' && (
                      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-x-auto">
                          <table className="w-full text-left">
                              <thead className="bg-slate-50 dark:bg-slate-700">
                                  <tr>
                                      <th className="p-3 text-sm font-semibold uppercase text-slate-600 dark:text-slate-300">Андоза</th>
                                      <th className="p-3 text-sm font-semibold uppercase text-slate-600 dark:text-slate-300 text-center">Бақияи гузашта</th>
                                      <th className="p-3 text-sm font-semibold uppercase text-slate-600 dark:text-slate-300 text-center">Истеҳсоли моҳ</th>
                                      <th className="p-3 text-sm font-semibold uppercase text-slate-600 dark:text-slate-300 text-center">Фурӯши моҳ</th>
                                      <th className="p-3 text-sm font-semibold uppercase text-slate-600 dark:text-slate-300 text-center">Бақияи умумӣ</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                  {stockBalanceTableData.map((item) => (
                                      <tr key={item.size} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                          <td className="p-3 text-sm font-medium">{item.size}</td>
                                          <td className={`p-3 text-sm text-center font-semibold ${item.prevMonthBalance >= 0 ? 'text-slate-700 dark:text-slate-300' : 'text-red-600 dark:text-red-400'}`}>{item.prevMonthBalance}</td>
                                          <td className="p-3 text-sm text-center text-indigo-600 dark:text-indigo-400 font-semibold">{item.monthlyProduced}</td>
                                          <td className="p-3 text-sm text-center text-green-600 dark:text-green-400 font-semibold">{item.monthlySold}</td>
                                          <td className={`p-3 text-sm text-center font-bold ${item.totalRemains >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>{item.totalRemains}</td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                      </div>
                  )}

                  {totalViewTab === 'revenue' && (
                      <div className="space-y-8">
                          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg text-center">
                              <h3 className="text-xl font-semibold text-slate-500 dark:text-slate-400 mb-2">Фоидаи умумӣ (дар ин моҳ)</h3>
                              <p className="text-4xl font-bold text-green-600 dark:text-green-400">{profitData.total.toLocaleString()} сомонӣ</p>
                          </div>
                          
                          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden">
                            <h3 className="p-4 text-lg font-semibold bg-slate-50 dark:bg-slate-700">Даромад аз рӯи андоза (дар ин моҳ)</h3>
                            <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                                {profitData.bySize.map(item => (
                                    <li key={item.size} className="p-4 flex justify-between items-center">
                                        <span>{item.size} <span className="text-slate-500">({item.quantity} дона)</span></span>
                                        <span className="font-semibold text-green-600">{item.profit.toLocaleString()} сомонӣ</span>
                                    </li>
                                ))}
                            </ul>
                          </div>

                          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden">
                            <h3 className="p-4 text-lg font-semibold bg-slate-50 dark:bg-slate-700">Харидории мизоҷон (дар ин моҳ)</h3>
                            <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                                {clientPurchaseData.map(client => (
                                    <li key={client.name} className="p-4">
                                        <div className="flex justify-between items-center font-semibold">
                                          <span>{client.name}</span>
                                          <span>{client.totalAmount.toLocaleString()} сомонӣ</span>
                                        </div>
                                        <ul className="mt-2 pl-4 text-sm text-slate-500">
                                          {client.purchasedItems.map(item => (
                                            <li key={item.size}>{item.size} - {item.quantity} дона</li>
                                          ))}
                                        </ul>
                                    </li>
                                ))}
                            </ul>
                          </div>
                      </div>
                  )}

                  {totalViewTab === 'graphics' && (
                      <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-lg h-96 md:h-[500px]">
                          <canvas ref={chartRef}></canvas>
                      </div>
                  )}

              </section>
          )}

          {activeView === 'settings' && (
              <section className="space-y-10">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg">
                    <h3 className="text-xl font-semibold mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">Аккаунт ва синхронизатсия</h3>
                    {isLoggedIn ? (
                        <div className="space-y-4">
                            <p>Шумо ҳамчун <span className="font-bold text-indigo-600 dark:text-indigo-400">{currentUser}</span> ворид шудед.</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <button onClick={importDataFromServer} className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition">
                                    <UploadIcon />
                                    Импорт аз сервер
                                </button>
                                <button onClick={() => exportDataToServer()} className="w-full flex items-center justify-center px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md transition">
                                    <DownloadIcon />
                                    Экспорт ба сервер
                                </button>
                                <button onClick={handleLogout} className="w-full flex items-center justify-center px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md transition sm:col-span-2">
                                    <LogoutIcon />
                                    Баромадан
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <p className="mb-4">Барои синхронизатсияи маълумот, лутфан ба аккаунти худ ворид шавед.</p>
                            <button onClick={() => setIsLoginModalOpen(true)} className="w-full flex items-center justify-center px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md transition">
                                <LoginIcon />
                                Ворид шудан
                            </button>
                        </div>
                    )}
                </div>

                {installPrompt && (
                <div className="bg-indigo-100 dark:bg-indigo-900/30 border border-indigo-300 dark:border-indigo-700 p-6 rounded-lg shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-bold text-indigo-800 dark:text-indigo-200">Насби барнома</h3>
                        <p className="text-slate-600 dark:text-slate-400">Барномаро ба экрани асосӣ илова кунед.</p>
                    </div>
                    <button onClick={handleInstallClick} className="w-full sm:w-auto flex items-center justify-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md transition shadow-md">
                        <InstallAppIcon />
                        Установить
                    </button>
                </div>
                )}

                <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg">
                  <h3 className="text-xl font-semibold mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">Намуди зоҳирӣ</h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-base font-medium text-slate-600 dark:text-slate-300 mb-2">Мавзӯъ:</label>
                      <div className="flex items-center space-x-4">
                        <button onClick={() => setTheme('light')} className={`px-4 py-2 rounded-md transition w-full ${theme === 'light' ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}>Равшан</button>
                        <button onClick={() => setTheme('dark')} className={`px-4 py-2 rounded-md transition w-full ${theme === 'dark' ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}>Торик</button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-base font-medium text-slate-600 dark:text-slate-300 mb-2">Андозаи интерфейс:</label>
                      <div className="flex items-center space-x-4">
                        <button onClick={handleDecreaseZoom} className="p-2 rounded-md bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition"><MinusIcon /></button>
                        <span className="font-semibold text-lg w-16 text-center">{zoomLevel}%</span>
                        <button onClick={handleIncreaseZoom} className="p-2 rounded-md bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition"><PlusIcon /></button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg">
                  <h3 className="text-xl font-semibold mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">Идоракунии маълумот</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button onClick={handleOpenSizesModal} className="w-full flex items-center justify-center px-4 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-md transition">
                        <PackageIcon />
                        Идораи молҳо
                    </button>
                    <button onClick={handleOpenPriceModal} className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition">
                      <EditIcon />
                      Тағйири нархҳо
                    </button>
                    <button onClick={handleOpenClientsModal} className="w-full flex items-center justify-center px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-md transition">
                      <UserGroupIcon />
                      Идораи мизоҷон
                    </button>
                    <button onClick={handleExportToExcel} className="w-full flex items-center justify-center px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md transition">
                      <DownloadIcon />
                      Содирот ба Excel
                    </button>
                    <button onClick={handleImportClick} className="w-full flex items-center justify-center px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md transition col-span-1 sm:col-span-2">
                      <UploadIcon />
                      Воридот аз Excel
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImportFromExcel}
                      className="hidden"
                      accept=".xlsx, .xls"
                    />
                  </div>
                </div>

                <div className="text-center text-slate-500 dark:text-slate-400">
                  <p onClick={handleVersionClick} className="cursor-pointer select-none">
                    Версияи барнома: 1.0
                  </p>
                </div>

              </section>
          )}

        </main>
      </div>
      
      {/* Modals */}
      {isLoginModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-sm flex flex-col">
                  <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                      <h3 className="text-2xl font-bold">Воридшавӣ</h3>
                      <button onClick={() => setIsLoginModalOpen(false)} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition"><CloseIcon /></button>
                  </div>
                  <div className="p-8 space-y-6">
                      <div>
                          <label className="block text-base font-medium text-slate-600 dark:text-slate-300 mb-2">Логин:</label>
                          <input type="text" value={loginUsername} onChange={e => setLoginUsername(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500" />
                      </div>
                      <div>
                          <label className="block text-base font-medium text-slate-600 dark:text-slate-300 mb-2">Парол:</label>
                          <input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500" />
                      </div>
                      {loginError && <p className="text-red-500 text-sm">{loginError}</p>}
                  </div>
                   <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex justify-end">
                      <button onClick={handleLoginAttempt} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md transition flex items-center">
                          <LoginIcon />
                          Даромадан
                      </button>
                  </div>
              </div>
          </div>
      )}

      {itemToRemove && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-8 max-w-sm w-full">
            <h3 className="text-xl font-bold mb-4">Тасдиқи тозакунӣ</h3>
            <p className="mb-6">Оё шумо мутмаин ҳастед, ки мехоҳед ин молро аз рӯйхат хориҷ кунед?</p>
            <div className="flex justify-end space-x-4">
              <button onClick={handleCancelRemove} className="px-5 py-2 rounded-md bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 transition">Бекор кардан</button>
              <button onClick={handleConfirmRemove} className="px-5 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white transition">Тоза кардан</button>
            </div>
          </div>
        </div>
      )}
      {itemToRemoveSold && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-8 max-w-sm w-full">
                <h3 className="text-xl font-bold mb-4">Тасдиқи тозакунӣ</h3>
                <p className="mb-6">Оё шумо мутмаин ҳастед, ки мехоҳед ин моли фурӯхташударо аз рӯйхат хориҷ кунед?</p>
                <div className="flex justify-end space-x-4">
                    <button onClick={handleCancelRemoveSold} className="px-5 py-2 rounded-md bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 transition">Бекор кардан</button>
                    <button onClick={handleConfirmRemoveSold} className="px-5 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white transition">Тоза кардан</button>
                </div>
            </div>
        </div>
      )}

      {isPriceModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                  <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                      <h3 className="text-2xl font-bold">Тағйир додани нархҳо</h3>
                      <button onClick={handleClosePriceModal} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition"><CloseIcon /></button>
                  </div>
                  <div className="p-6 overflow-y-auto">
                      <table className="w-full text-left">
                          <thead className="sticky top-0 bg-white dark:bg-slate-800">
                              <tr>
                                  <th className="py-2">Андоза</th>
                                  <th className="py-2">Арзиши аслӣ</th>
                                  <th className="py-2">Яклухт</th>
                                  <th className="py-2">Иловапулӣ</th>
                              </tr>
                          </thead>
                          <tbody>
                              {editedPrices.map((price, index) => (
                                  <tr key={price.size}>
                                      <td className="py-2 font-medium">{price.size}</td>
                                      <td><input type="number" value={price.taer} onChange={(e) => handlePriceChange(index, 'taer', e.target.value)} className="w-24 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded p-1" /></td>
                                      <td><input type="number" value={price.opt} onChange={(e) => handlePriceChange(index, 'opt', e.target.value)} className="w-24 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded p-1" /></td>
                                      <td><input type="number" value={price.nacenka} onChange={(e) => handlePriceChange(index, 'nacenka', e.target.value)} className="w-24 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded p-1" /></td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
                   <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex justify-end">
                      <button onClick={handleSavePrices} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md transition flex items-center">
                          <SaveIcon />
                          Захира кардан
                      </button>
                  </div>
              </div>
          </div>
      )}

      {isStockWarningModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-8 max-w-md w-full text-center">
                  <div className="text-yellow-500 w-16 h-16 mx-auto mb-4 border-4 border-yellow-500 rounded-full flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-4">Огоҳӣ</h3>
                  <p className="mb-6">{stockWarningMessage}</p>
                  <button onClick={() => setIsStockWarningModalOpen(false)} className="px-6 py-2 rounded-md bg-yellow-500 hover:bg-yellow-600 text-white font-semibold transition">Фаҳмо</button>
              </div>
          </div>
      )}

      {isClientsModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
                  <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                      <h3 className="text-2xl font-bold">Идоракунии мизоҷон</h3>
                      <button onClick={handleCloseClientsModal} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition"><CloseIcon /></button>
                  </div>
                  <div className="p-6 overflow-y-auto">
                      <div className="flex gap-4 mb-6">
                          <input type="text" value={newClientName} onChange={(e) => setNewClientName(e.target.value)} placeholder="Номи мизоҷи нав" className="flex-grow bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500" />
                          <button onClick={handleAddClient} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md transition">Илова</button>
                      </div>
                      <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                          {soldToOptions.map(client => (
                              <li key={client} className="py-3 flex justify-between items-center">
                                  <span>{client}</span>
                                  <button onClick={() => handleOpenRemoveClientConfirm(client)} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 transition">
                                      <TrashIcon />
                                  </button>
                              </li>
                          ))}
                      </ul>
                  </div>
              </div>
          </div>
      )}
      
      {isSizesModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
                  <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                      <h3 className="text-2xl font-bold">Идоракунии молҳо (андозаҳо)</h3>
                      <button onClick={handleCloseSizesModal} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition"><CloseIcon /></button>
                  </div>
                  <div className="p-6 overflow-y-auto">
                      <div className="flex gap-4 mb-6">
                          <input type="text" value={newSizeName} onChange={(e) => setNewSizeName(e.target.value)} placeholder="Номи андозаи нав" className="flex-grow bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500" />
                          <button onClick={handleAddSize} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md transition">Илова</button>
                      </div>
                      <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                          {sizes.map(size => (
                              <li key={size} className="py-3 flex justify-between items-center">
                                  <span>{size}</span>
                                  <button onClick={() => handleOpenRemoveSizeConfirm(size)} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 transition">
                                      <TrashIcon />
                                  </button>
                              </li>
                          ))}
                      </ul>
                  </div>
              </div>
          </div>
      )}

      {clientToRemove && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[60] p-4">
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-8 max-w-sm w-full">
                  <h3 className="text-xl font-bold mb-4">Тасдиқи тозакунӣ</h3>
                  <p className="mb-6">Оё шумо мутмаин ҳастед, ки мехоҳед мизоҷ <span className="font-semibold">"{clientToRemove}"</span>-ро хориҷ кунед?</p>
                  <div className="flex justify-end space-x-4">
                      <button onClick={handleCancelRemoveClient} className="px-5 py-2 rounded-md bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 transition">Бекор кардан</button>
                      <button onClick={handleConfirmRemoveClient} className="px-5 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white transition">Тоза кардан</button>
                  </div>
              </div>
          </div>
      )}

      {sizeToRemove && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[60] p-4">
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-8 max-w-sm w-full">
                  <h3 className="text-xl font-bold mb-4">Тасдиқи тозакунӣ</h3>
                  <p className="mb-6">Оё шумо мутмаин ҳастед, ки мехоҳед андозаи <span className="font-semibold">"{sizeToRemove}"</span>-ро хориҷ кунед? Ин амал нархи марбутаро низ хориҷ мекунад.</p>
                  <div className="flex justify-end space-x-4">
                      <button onClick={handleCancelRemoveSize} className="px-5 py-2 rounded-md bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 transition">Бекор кардан</button>
                      <button onClick={handleConfirmRemoveSize} className="px-5 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white transition">Тоза кардан</button>
                  </div>
              </div>
          </div>
      )}

      {isDebugMenuOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-[70] p-4">
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                  <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                      <h3 className="text-2xl font-bold">Менюи ислоҳ (Логҳо)</h3>
                      <button onClick={handleCloseDebugMenu} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition"><CloseIcon /></button>
                  </div>
                  <div className="p-6 overflow-y-auto flex-grow bg-slate-100 dark:bg-slate-900">
                      <pre className="text-xs whitespace-pre-wrap break-words rounded-md">
                          {logs.length > 0 ? logs.map((entry, index) => (
                              <div key={index} className="border-b border-slate-200 dark:border-slate-700 py-1 last:border-b-0">
                                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">{entry.timestamp}: </span>
                                  <span>{entry.message}</span>
                              </div>
                          )) : <p>Логҳо холӣ ҳастанд.</p>}
                      </pre>
                  </div>
                   <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-4">
                       <button onClick={handleRefreshLogs} className="px-5 py-2 rounded-md bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 transition">Навсозӣ</button>
                       <button onClick={handleClearLogs} className="px-5 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white transition">Тоза кардан</button>
                  </div>
              </div>
          </div>
      )}


      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 shadow-[0_-2px_10px_rgba(0,0,0,0.1)] dark:shadow-[0_-2px_10px_rgba(0,0,0,0.3)]">
          <div className="max-w-4xl mx-auto flex justify-around p-3">
              <button onClick={() => setActiveView('produced')} className={`flex flex-col items-center justify-center w-24 h-16 rounded-lg transition-colors duration-300 ${activeView === 'produced' ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-slate-700' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                  <ProducedIcon />
                  <span className="text-sm font-medium">Истеҳсол</span>
              </button>
              <button onClick={() => setActiveView('sold')} className={`flex flex-col items-center justify-center w-24 h-16 rounded-lg transition-colors duration-300 ${activeView === 'sold' ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-slate-700' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                  <SoldIcon />
                  <span className="text-sm font-medium">Фурӯш</span>
              </button>
              <button onClick={() => setActiveView('total')} className={`flex flex-col items-center justify-center w-24 h-16 rounded-lg transition-colors duration-300 ${activeView === 'total' ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-slate-700' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                  <TotalIcon />
                  <span className="text-sm font-medium">Натиҷа</span>
              </button>
              <button onClick={() => setActiveView('settings')} className={`flex flex-col items-center justify-center w-24 h-16 rounded-lg transition-colors duration-300 ${activeView === 'settings' ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-slate-700' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                  <SettingsIcon />
                  <span className="text-sm font-medium">Танзимот</span>
              </button>
          </div>
      </nav>
    </div>
  );
};