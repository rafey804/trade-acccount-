//+------------------------------------------------------------------+
//|  TCC_Exness_AutoSync.mq5                                         |
//|  Trader Command Center — MT5 Auto Sync Expert Advisor            |
//|                                                                  |
//|  WHAT THIS DOES:                                                 |
//|  1. Every 5 seconds: sends ALL open positions to dashboard       |
//|     → Dashboard shows live trades with floating PnL             |
//|  2. When any trade closes: sends final data to dashboard         |
//|     → Dashboard records it in journal + analytics               |
//|                                                                  |
//|  SETUP (DO THIS ONCE):                                           |
//|  1. Copy this file to: MT5 → File → Open Data Folder            |
//|     → MQL5 → Experts → TCC_Exness_AutoSync.mq5                  |
//|  2. In MT5: Tools → Options → Expert Advisors tab               |
//|     ✅ Allow automated trading                                   |
//|     ✅ Allow WebRequest for listed URLs                          |
//|     Add: https://your-dashboard-url.vercel.app                  |
//|  3. Open any chart (XAUUSD M1 works fine)                       |
//|  4. Drag EA onto chart, fill in Dashboard URL + Secret Key       |
//|  5. Done! Keep MT5 open while trading                            |
//+------------------------------------------------------------------+

#property copyright "Trader Command Center"
#property version   "2.00"
#property description "Auto-syncs live + closed trades to your dashboard"

//--- Inputs
input string InpDashboardURL  = "https://your-dashboard.vercel.app";  // Your Vercel/Render URL
input string InpSecret        = "exness-dashboard-secret";             // Secret Key (match .env.local)
input int    InpSyncInterval  = 5;   // Sync open positions every X seconds
input bool   InpDebugLog      = true; // Show log messages in Experts tab

//--- Globals
int    g_timerCount    = 0;
ulong  g_lastPositions[];   // Track tickets from last check to detect closes

//+------------------------------------------------------------------+
void OnInit()
{
   EventSetTimer(1); // 1-second timer tick
   ArrayResize(g_lastPositions, 0);
   Log("✅ TCC AutoSync EA started. Dashboard: " + InpDashboardURL);
   Log("⏱ Syncing open positions every " + (string)InpSyncInterval + " seconds.");
   
   // Immediately send current state on startup
   SyncOpenPositions();
}

//+------------------------------------------------------------------+
void OnDeinit(const int reason)
{
   EventKillTimer();
   // Send empty positions array (all trades "closed" on EA removal)
   SendOpenPositions("[]");
   Log("EA stopped.");
}

//+------------------------------------------------------------------+
void OnTimer()
{
   g_timerCount++;
   
   // Check for closed trades on every tick
   CheckForClosedTrades();
   
   // Sync open positions every InpSyncInterval seconds
   if (g_timerCount % InpSyncInterval == 0)
   {
      SyncOpenPositions();
   }
}

//+------------------------------------------------------------------+
//| Build JSON array of all open positions and send to dashboard     |
//+------------------------------------------------------------------+
void SyncOpenPositions()
{
   int total = PositionsTotal();
   string json = "[";
   
   for (int i = 0; i < total; i++)
   {
      ulong ticket = PositionGetTicket(i);
      if (ticket == 0) continue;
      
      if (!PositionSelectByTicket(ticket)) continue;
      
      string symbol    = PositionGetString(POSITION_SYMBOL);
      double volume    = PositionGetDouble(POSITION_VOLUME);
      double openPrice = PositionGetDouble(POSITION_PRICE_OPEN);
      double curPrice  = PositionGetDouble(POSITION_PRICE_CURRENT);
      double floatPnl  = PositionGetDouble(POSITION_PROFIT);
      double swap      = PositionGetDouble(POSITION_SWAP);
      datetime openTime = (datetime)PositionGetInteger(POSITION_TIME);
      long posType     = PositionGetInteger(POSITION_TYPE);
      string typeStr   = (posType == POSITION_TYPE_BUY) ? "buy" : "sell";
      
      string openTimeStr = TimeToString(openTime, TIME_DATE | TIME_MINUTES | TIME_SECONDS);
      
      if (i > 0) json += ",";
      
      json += StringFormat(
         "{\"ticket\":%d,\"symbol\":\"%s\",\"type\":\"%s\","
         "\"volume\":%.2f,\"open_price\":%.5f,\"current_price\":%.5f,"
         "\"floating_pnl\":%.2f,\"swap\":%.2f,\"open_time\":\"%s\"}",
         (int)ticket, symbol, typeStr,
         volume, openPrice, curPrice,
         floatPnl, swap, openTimeStr
      );
   }
   
   json += "]";
   SendOpenPositions(json);
}

//+------------------------------------------------------------------+
//| HTTP POST to /api/exness/live-positions                          |
//+------------------------------------------------------------------+
void SendOpenPositions(string positionsJson)
{
   double balance = AccountInfoDouble(ACCOUNT_BALANCE);
   double equity = AccountInfoDouble(ACCOUNT_EQUITY);
   double marginFree = AccountInfoDouble(ACCOUNT_MARGIN_FREE);
   double marginUsed = AccountInfoDouble(ACCOUNT_MARGIN);
   
   string accountJson = StringFormat(
      "{\"balance\":%.2f,\"equity\":%.2f,\"margin_free\":%.2f,\"margin\":%.2f}",
      balance, equity, marginFree, marginUsed
   );

   string payload = StringFormat(
      "{\"secret\":\"%s\",\"account\":%s,\"positions\":%s}",
      InpSecret, accountJson, positionsJson
   );
   
   string url = InpDashboardURL + "/api/exness/live-positions";
   int result = HttpPost(url, payload);
   
   if (result == 200 || result == 201)
   {
      Log("📡 Live positions synced (" + (string)PositionsTotal() + " open)");
   }
   else if (result > 0)
   {
      Log("⚠ Live sync returned HTTP " + (string)result);
   }
}

//+------------------------------------------------------------------+
//| Detect newly closed trades by comparing position tickets         |
//+------------------------------------------------------------------+
void CheckForClosedTrades()
{
   // Get current open tickets
   int total = PositionsTotal();
   ulong currentTickets[];
   ArrayResize(currentTickets, total);
   
   for (int i = 0; i < total; i++)
   {
      currentTickets[i] = PositionGetTicket(i);
   }
   
   // Find tickets that were open before but are now closed
   for (int i = 0; i < ArraySize(g_lastPositions); i++)
   {
      ulong oldTicket = g_lastPositions[i];
      bool stillOpen = false;
      
      for (int j = 0; j < ArraySize(currentTickets); j++)
      {
         if (currentTickets[j] == oldTicket)
         {
            stillOpen = true;
            break;
         }
      }
      
      if (!stillOpen)
      {
         // This position was closed! Fetch it from history and send
         Log("🔔 Position #" + (string)oldTicket + " detected as closed. Syncing...");
         SyncClosedTrade(oldTicket);
      }
   }
   
   // Update last positions
   ArrayCopy(g_lastPositions, currentTickets);
}

//+------------------------------------------------------------------+
//| Fetch closed trade from history and send to dashboard            |
//+------------------------------------------------------------------+
void SyncClosedTrade(ulong positionTicket)
{
   // Select recent history (last 7 days to be safe)
   datetime fromTime = TimeCurrent() - 7 * 24 * 3600;
   if (!HistorySelect(fromTime, TimeCurrent() + 60))
   {
      Log("❌ HistorySelect failed");
      return;
   }
   
   int totalDeals = HistoryDealsTotal();
   
   // Find the OUT deal for this position ticket
   for (int i = totalDeals - 1; i >= 0; i--)
   {
      ulong dealTicket = HistoryDealGetTicket(i);
      if (dealTicket == 0) continue;
      
      ulong dealPosId = (ulong)HistoryDealGetInteger(dealTicket, DEAL_POSITION_ID);
      if (dealPosId != positionTicket) continue;
      
      long entryType = HistoryDealGetInteger(dealTicket, DEAL_ENTRY);
      if (entryType != DEAL_ENTRY_OUT) continue;
      
      // Got the closing deal!
      string  symbol     = HistoryDealGetString(dealTicket, DEAL_SYMBOL);
      double  profit     = HistoryDealGetDouble(dealTicket, DEAL_PROFIT);
      double  commission = HistoryDealGetDouble(dealTicket, DEAL_COMMISSION);
      double  swap       = HistoryDealGetDouble(dealTicket, DEAL_SWAP);
      double  volume     = HistoryDealGetDouble(dealTicket, DEAL_VOLUME);
      double  closePrice = HistoryDealGetDouble(dealTicket, DEAL_PRICE);
      datetime closeTime = (datetime)HistoryDealGetInteger(dealTicket, DEAL_TIME);
      long    dealType   = HistoryDealGetInteger(dealTicket, DEAL_TYPE);
      string  comment    = HistoryDealGetString(dealTicket, DEAL_COMMENT);
      
      // Get open price from the IN deal of same position
      double openPrice = 0;
      datetime openTime = closeTime;
      
      for (int j = 0; j < totalDeals; j++)
      {
         ulong inTicket = HistoryDealGetTicket(j);
         ulong inPosId = (ulong)HistoryDealGetInteger(inTicket, DEAL_POSITION_ID);
         long inEntry = HistoryDealGetInteger(inTicket, DEAL_ENTRY);
         
         if (inPosId == positionTicket && inEntry == DEAL_ENTRY_IN)
         {
            openPrice = HistoryDealGetDouble(inTicket, DEAL_PRICE);
            openTime = (datetime)HistoryDealGetInteger(inTicket, DEAL_TIME);
            break;
         }
      }
      
      // Direction: DEAL_TYPE_SELL as OUT = was a Buy/Long position
      string tradeType = (dealType == DEAL_TYPE_SELL) ? "buy" : "sell";
      
      string openTimeStr  = TimeToString(openTime, TIME_DATE | TIME_MINUTES | TIME_SECONDS);
      string closeTimeStr = TimeToString(closeTime, TIME_DATE | TIME_MINUTES | TIME_SECONDS);
      
      string payload = StringFormat(
         "{\"secret\":\"%s\","
         "\"ticket\":%d,"
         "\"symbol\":\"%s\","
         "\"type\":\"%s\","
         "\"volume\":%.2f,"
         "\"open_price\":%.5f,"
         "\"close_price\":%.5f,"
         "\"open_time\":\"%s\","
         "\"close_time\":\"%s\","
         "\"profit\":%.2f,"
         "\"commission\":%.2f,"
         "\"swap\":%.2f,"
         "\"comment\":\"%s\"}",
         InpSecret,
         (int)dealTicket,
         symbol,
         tradeType,
         volume,
         openPrice,
         closePrice,
         openTimeStr,
         closeTimeStr,
         profit,
         commission,
         swap,
         comment
      );
      
      string url = InpDashboardURL + "/api/exness/mt4-webhook";
      int result = HttpPost(url, payload);
      
      if (result == 200 || result == 201)
      {
         double netPnl = profit + commission + swap;
         Log("✅ Closed trade synced: " + symbol + 
             (netPnl >= 0 ? " WIN +" : " LOSS ") + DoubleToString(netPnl, 2) + " USD");
      }
      else
      {
         Log("❌ Failed to sync closed trade. HTTP: " + (string)result);
      }
      
      break; // Found the closing deal, stop searching
   }
}

//+------------------------------------------------------------------+
//| HTTP POST helper — returns HTTP status code                      |
//+------------------------------------------------------------------+
int HttpPost(string url, string jsonPayload)
{
   char postData[];
   char result[];
   string resultHeaders;
   string headers = "Content-Type: application/json\r\n";
   
   int payloadLen = StringLen(jsonPayload);
   ArrayResize(postData, payloadLen);
   StringToCharArray(jsonPayload, postData, 0, payloadLen);
   
   int httpStatus = WebRequest("POST", url, headers, 5000, postData, result, resultHeaders);
   
   if (httpStatus == -1)
   {
      int err = GetLastError();
      if (err == 4060)
         Log("❌ URL not whitelisted! Go to Tools → Options → Expert Advisors → Add URL: " + InpDashboardURL);
      else
         Log("❌ WebRequest error: " + (string)err);
   }
   
   return httpStatus;
}

//+------------------------------------------------------------------+
//| Log helper                                                       |
//+------------------------------------------------------------------+
void Log(string message)
{
   if (InpDebugLog)
      Print("[TCC-EA] ", message);
}
