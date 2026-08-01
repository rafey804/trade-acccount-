import { NextResponse } from 'next/server';

export const revalidate = 300; // Cache for 5 minutes

export async function GET() {
  try {
    const response = await fetch('https://nfs.faireconomy.media/ff_calendar_thisweek.json', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
      next: { revalidate: 300 } // ISR caching
    });

    if (!response.ok) {
      throw new Error('Failed to fetch from ForexFactory');
    }

    const data = await response.json();

    // Filter out low impact and non-major currencies
    const importantCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'NZD'];
    
    const filteredData = data.filter((event: any) => {
      const isImportantImpact = event.impact === 'High' || event.impact === 'Medium';
      const isImportantCurrency = importantCurrencies.includes(event.country);
      return isImportantImpact && isImportantCurrency;
    });

    return NextResponse.json(filteredData);
  } catch (error) {
    console.error('Calendar Fetch Error:', error);
    return NextResponse.json({ error: 'Failed to load calendar' }, { status: 500 });
  }
}
