import os
import time
import logging
from datetime import datetime, timezone, timedelta
import requests
from supabase import create_client, Client
from logging.handlers import RotatingFileHandler
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# === Configure Logging ===
log_handler = RotatingFileHandler(
    'financial_fetcher.log', 
    maxBytes=10485760,  # 10MB
    backupCount=5
)

# === Setup Logging ===
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[log_handler, logging.StreamHandler()]
)
logger = logging.getLogger(__name__)

# === Setup Supabase ===
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not supabase_url or not supabase_key:
    logger.error("Missing Supabase credentials. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.")
    exit(1)
    
supabase: Client = create_client(supabase_url, supabase_key)

# === Tickers and Asset Lists ===
CRYPTO_SYMBOLS = ["BTC", "ETH", "SOL", "MATIC", "DOGE", "XRP", "ADA", "DOT", "AVAX", "LINK"]

CURRENCY_PAIRS = [
    {"symbol": "EUR", "name": "Euro"},
    {"symbol": "GBP", "name": "British Pound"},
    {"symbol": "JPY", "name": "Japanese Yen"},
    {"symbol": "CHF", "name": "Swiss Franc"},
    {"symbol": "AUD", "name": "Australian Dollar"},
    {"symbol": "CAD", "name": "Canadian Dollar"},
    {"symbol": "CNY", "name": "Chinese Yuan"},
    {"symbol": "PLN", "name": "Polish Złoty"},
    {"symbol": "NOK", "name": "Norwegian Krone"},
    {"symbol": "BRL", "name": "Brazilian Real"},
    {"symbol": "RUB", "name": "Russian Ruble"},
    {"symbol": "INR", "name": "Indian Rupee"},
    {"symbol": "SGD", "name": "Singapore Dollar"},
    {"symbol": "NZD", "name": "New Zealand Dollar"},
    {"symbol": "HKD", "name": "Hong Kong Dollar"},
    {"symbol": "SEK", "name": "Swedish Krona"},
    {"symbol": "MXN", "name": "Mexican Peso"},
    {"symbol": "ZAR", "name": "South African Rand"}
]

METALS = ["gold", "silver", "platinum", "palladium"]

STOCK_SYMBOLS = [
    {"symbol": "SPY", "name": "S&P 500"},
    {"symbol": "^FTSE", "name": "FTSE 100"},
    {"symbol": "NOBL", "name": "ProShares Dividend Aristocrats"},
    {"symbol": "SCHD", "name": "Schwab US Dividend Equity"},
    {"symbol": "VOO", "name": "Vanguard S&P 500"},
    {"symbol": "VTI", "name": "Vanguard Total Stock Market"},
    {"symbol": "AAPL", "name": "Apple"},
    {"symbol": "MSFT", "name": "Microsoft"},
    {"symbol": "META", "name": "Meta Platforms"},
    {"symbol": "GOOGL", "name": "Alphabet"},
    {"symbol": "AMZN", "name": "Amazon"},
    {"symbol": "NVDA", "name": "NVIDIA"},
    {"symbol": "TSLA", "name": "Tesla"},
    {"symbol": "JPM", "name": "JPMorgan Chase"},
    {"symbol": "JNJ", "name": "Johnson & Johnson"},
    {"symbol": "V", "name": "Visa"},
    {"symbol": "WMT", "name": "Walmart"},
    {"symbol": "PG", "name": "Procter & Gamble"},
    {"symbol": "KO", "name": "Coca-Cola"},
    {"symbol": "DIS", "name": "Disney"}
]

# === Helper Functions ===
def should_fetch_data(table_name, min_age_seconds=3600):
    """Check if we should fetch new data based on the age of the most recent entry"""
    today = datetime.now(timezone.utc).date().isoformat()
    
    try:
        # Check the latest entry in the DB
        result = supabase.table(table_name) \
            .select('date') \
            .eq('date_day', today) \
            .order('date', desc=True) \
            .limit(1) \
            .execute()
            
        if result.data and len(result.data) > 0:
            latest_timestamp = datetime.fromisoformat(result.data[0]['date'].replace('Z', '+00:00'))
            now = datetime.now(timezone.utc)
            time_diff = (now - latest_timestamp).total_seconds()
            return time_diff >= min_age_seconds
        return True  # No data for today, should fetch
    except Exception as e:
        logger.error(f"Error checking if should fetch {table_name}: {e}")
        return True  # On error, default to fetching

# === Fetch Functions ===
def fetch_crypto():
    """Fetch cryptocurrency data from CoinGecko API"""
    logger.info("Fetching cryptocurrency data...")
    now = datetime.now(timezone.utc)
    now_iso = now.isoformat()
    today = now.date().isoformat()
    
    if not should_fetch_data('crypto', min_age_seconds=300):  # 5 minutes
        logger.info("Recent crypto data exists, skipping fetch")
        return
    
    try:
        response = requests.get(
            'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=30&page=1',
            timeout=10
        )
        
        if not response.ok:
            logger.error(f"CoinGecko API error: {response.status_code} - {response.text}")
            return
            
        data = response.json()
        crypto_data = []
        
        for coin in data:
            crypto_data.append({
                "symbol": coin["symbol"].upper(),
                "name": coin["name"],
                "date": now_iso,
                "price": coin["current_price"],
                "market_cap": coin["market_cap"],
                "volume_24h": coin["total_volume"],
                "date_day": today
            })
            logger.info(f"Crypto {coin['symbol'].upper()}: ${coin['current_price']}")
            
        # Delete existing entries for today
        supabase.table("crypto").delete().eq("date_day", today).execute()
        
        # Insert new data
        supabase.table("crypto").insert(crypto_data).execute()
        logger.info(f"Successfully updated {len(crypto_data)} cryptocurrencies")
    except Exception as e:
        logger.error(f"Error fetching crypto data: {e}")

def fetch_currencies():
    """Fetch currency exchange rates from Forex API"""
    logger.info("Fetching currency exchange rates...")
    now = datetime.now(timezone.utc)
    now_iso = now.isoformat()
    today = now.date().isoformat()
    
    if not should_fetch_data('currencies'):
        logger.info("Recent currency data exists, skipping fetch")
        return
        
    try:
        forex_api_url = os.getenv("FOREX_API_URL")
        forex_api_key = os.getenv("FOREX_API_KEY")
        
        if not forex_api_url or not forex_api_key:
            logger.error("Missing Forex API credentials")
            return
            
        url = f"{forex_api_url}/latest.json?app_id={forex_api_key}&base=USD"
        response = requests.get(url, timeout=10)
        
        if not response.ok:
            logger.error(f"Forex API error: {response.status_code} - {response.text}")
            return
            
        data = response.json()
        rates = data["rates"]
        
        currency_data = []
        for pair in CURRENCY_PAIRS:
            symbol = pair["symbol"]
            rate = rates.get(symbol)
            
            if rate:
                price = 1 / rate
                currency_data.append({
                    "symbol": symbol,
                    "name": pair["name"],
                    "date": now_iso,  # Fixed: Use offset-aware datetime
                    "price": price,
                    "date_day": today
                })
                logger.info(f"Currency {symbol}: {price}")
                
        # Delete existing entries for today
        supabase.table("currencies").delete().eq("date_day", today).execute()
        
        # Insert new data
        supabase.table("currencies").insert(currency_data).execute()
        logger.info(f"Successfully updated {len(currency_data)} currencies")
    except Exception as e:
        logger.error(f"Error fetching currency data: {e}")

def fetch_metals():
    """Fetch precious metals prices"""
    logger.info("Fetching precious metals prices...")
    now = datetime.now(timezone.utc)
    now_iso = now.isoformat()
    today = now.date().isoformat()
    
    if not should_fetch_data('metals'):
        logger.info("Recent metals data exists, skipping fetch")
        return
        
    try:
        metals_api_url = os.getenv("METALS_API_URL")
        metals_api_key = os.getenv("METALS_API_KEY")
        
        if not metals_api_url or not metals_api_key:
            logger.error("Missing Metals API credentials")
            return
            
        url = f"{metals_api_url}/latest?api_key={metals_api_key}&currency=USD&unit=toz"
        response = requests.get(url, timeout=10)
        
        if not response.ok:
            logger.error(f"Metals API error: {response.status_code} - {response.text}")
            return
            
        data = response.json()
        metals_data = []
        
        for metal in METALS:
            price = data.get("metals", {}).get(metal, 0)
            metals_data.append({
                "metal": metal,
                "date": now_iso,  # Fixed: Use offset-aware datetime
                "price": price,
                "date_day": today
            })
            logger.info(f"Metal {metal}: ${price}")
            
        # Delete existing entries for today
        supabase.table("metals").delete().eq("date_day", today).execute()
        
        # Insert new data
        supabase.table("metals").insert(metals_data).execute()
        logger.info(f"Successfully updated {len(metals_data)} metals")
    except Exception as e:
        logger.error(f"Error fetching metals data: {e}")

def fetch_stocks():
    """Fetch stock prices from Yahoo Finance"""
    logger.info("Fetching stock prices...")
    now = datetime.now(timezone.utc)
    now_iso = now.isoformat()
    today = now.date().isoformat()
    
    if not should_fetch_data('stocks'):
        logger.info("Recent stock data exists, skipping fetch")
        return
    
    errors = []
    stock_data = []
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }
    
    for stock in STOCK_SYMBOLS:
        symbol = stock["symbol"]
        clean_symbol = symbol.replace("^", "")
        
        retries = 3
        initial_delay = 10
        
        for attempt in range(retries):
            try:
                logger.info(f"Fetching data for {symbol} (Attempt {attempt + 1}/{retries})...")
                url = f"https://query1.finance.yahoo.com/v8/finance/chart/{symbol}?interval=1d&range=1d"
                logger.info(f"{url}")
                response = requests.get(url, headers=headers, timeout=10)
                
                if response.status_code == 429:
                    delay = initial_delay * (2 ** attempt)
                    logger.warning(f"Rate limit hit for {symbol}, retrying after {delay}s...")
                    time.sleep(delay)
                    continue
                
                if not response.ok:
                    error_msg = f"HTTP error! status: {response.status_code}"
                    logger.error(f"Error fetching {symbol}: {error_msg}")
                    errors.append(f"{symbol}: {error_msg}")
                    break
                
                data = response.json()
                result = data.get("chart", {}).get("result", [{}])[0]
                meta = result.get("meta", {})
                price = meta.get("regularMarketPrice")
                
                indicators = result.get("indicators", {})
                quote = indicators.get("quote", [{}])[0]
                volume = quote.get("volume", [0])[0] or 0
                
                if not price:
                    error_msg = "No price data available"
                    logger.error(f"Error fetching {symbol}: {error_msg}")
                    errors.append(f"{symbol}: {error_msg}")
                    break
                
                stock_data.append({
                    "symbol": clean_symbol,
                    "name": stock["name"],
                    "date": now_iso,
                    "price": price,
                    "volume": volume,
                    "date_day": today
                })
                
                logger.info(f"Successfully processed {symbol}: ${price}")
                break
                
            except Exception as e:
                error_msg = str(e)
                logger.error(f"Error fetching {symbol}: {error_msg}")
                errors.append(f"{symbol}: {error_msg}")
                break
            
            time.sleep(15)
    
    if stock_data:
        try:
            logger.info(f"Preparing to insert {len(stock_data)} stocks into database...")
            existing_data = supabase.table("stocks").select("*").eq("date_day", today).execute().data
            supabase.table("stocks").insert(stock_data).execute()
            logger.info(f"Successfully inserted {len(stock_data)} stocks into database")
            supabase.table("stocks").delete().eq("date_day", today).neq("date", now_iso).execute()
            logger.info("Cleaned up old stock data for today")
        except Exception as e:
            logger.error(f"Database error while saving stocks: {e}")
            errors.append(f"Database error: {e}")
    
    if errors:
        logger.warning(f"Encountered {len(errors)} errors while fetching stocks: {errors}")
    else:
        logger.info("Stock fetching completed with no errors")

# === Main Function ===
def main():
    logger.info("Starting financial data fetcher")
    
    last_crypto_run = 0
    last_stocks_run = 0
    last_daily_run = 0
    
    crypto_interval = 300  # 5 minutes
    stocks_interval = 3600  # 1 hour
    daily_interval = 86400  # 24 hours
    
    while True:
        try:
            current_time = time.time()
            
            if current_time - last_crypto_run >= crypto_interval:
                logger.info("=== Fetching Crypto Data ===")
                fetch_crypto()
                last_crypto_run = current_time
            
            if current_time - last_stocks_run >= stocks_interval:
                logger.info("=== Fetching Stock Data ===")
                fetch_stocks()
                last_stocks_run = current_time
            
            if current_time - last_daily_run >= daily_interval:
                logger.info("=== Fetching Daily Data (Currencies & Metals) ===")
                fetch_currencies()
                fetch_metals()
                last_daily_run = current_time
            
            time.sleep(60)
            
        except Exception as e:
            logger.error(f"Error in main loop: {e}")
            logger.info("Sleeping for 5 minutes before retry...")
            time.sleep(300)

if __name__ == "__main__":
    main()