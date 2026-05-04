document.addEventListener("DOMContentLoaded", function() {
    const container = document.getElementById('tradingview-container');

    const widgetDiv = document.createElement('div');
    widgetDiv.className = 'tradingview-widget-container__widget';
    container.appendChild(widgetDiv);
    
    const widgetConfig = {
        "colorTheme": "dark",
        "dateRange": "1D",
        "showChart": true,
        "locale": "id",
        "width": "100%",
        "height": "100%",
        "largeChartUrl": "",
        "isTransparent": true,
        "showSymbolLogo": true,
        "showFloatingTooltip": false,
        "tabs": [
            {
                "title": "Emas (XAU/USD)",
                "symbols": [
                    { "s": "OANDA:XAUUSD", "d": "OANDA (Standar Institusi)" },
                    { "s": "FOREXCOM:XAUUSD", "d": "FOREX.com (Likuiditas Tinggi)" },
                    { "s": "FX_IDC:XAUUSD", "d": "ICE Data Services (Agregasi)" },
                    { "s": "PEPPERSTONE:XAUUSD", "d": "Pepperstone (ECN/Harga Mentah)" },
                    { "s": "TVC:GOLD", "d": "TradingView (Agregasi CFD)" }
                ]
            },
            {
                "title": "Indeks Dolar (DXY) & Valuta",
                "symbols": [
                    { "s": "CAPITALCOM:DXY", "d": "Capital.com (Terverifikasi)" },
                    { "s": "PEPPERSTONE:USDX", "d": "Pepperstone (Terverifikasi)" },
                    { "s": "INDEX:DXY", "d": "Official U.S. Dollar Index" },
                    { "s": "OANDA:EURUSD", "d": "EUR/USD (Korelasi Terbalik DXY)" },
                    { "s": "AMEX:UUP", "d": "Invesco DXY ETF (Saham Publik AS)" }
                ]
            },
            {
                "title": "Minyak (Brent)",
                "symbols": [
                    { "s": "TVC:UKOIL", "d": "TVC (Acuan Agregat Global)" },
                    { "s": "OANDA:BCOUSD", "d": "OANDA (Brent Crude)" },
                    { "s": "FOREXCOM:UKOIL", "d": "FOREX.com" },
                    { "s": "TVC:USOIL", "d": "WTI: Acuan Amerika Serikat" },
                    { "s": "OANDA:WTICOUSD", "d": "WTI: OANDA" }
                ]
            }
        ]
    };

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js';
    script.async = true;
    
    script.innerHTML = JSON.stringify(widgetConfig);
    container.appendChild(script);
});