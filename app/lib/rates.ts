export interface RateHistory {
  date: string;
  value: number;
}

export interface InterestRates {
  kr: {
    current: number;
    history: RateHistory[];
  };
  us: {
    current: number;
    history: RateHistory[];
  };
}

const ECOS_API_KEY = process.env.ECOS_API_KEY;
const FRED_API_KEY = process.env.FRED_API_KEY;

async function fetchKORate(): Promise<{
  current: number;
  history: RateHistory[];
}> {
  try {
    if (!ECOS_API_KEY) throw new Error("ECOS_API_KEY is missing");

    // 722Y001: 한국은행 기준금리 (연%)
    // 0101000: 한국은행 기준금리
    const now = new Date();
    const endYearMonth = now.toISOString().slice(0, 7).replace("-", "");

    // 8년 전 날짜 계산 (원본 객체 보존)
    const eightYearsAgo = new Date();
    eightYearsAgo.setFullYear(now.getFullYear() - 8);
    const startYearMonth = eightYearsAgo
      .toISOString()
      .slice(0, 7)
      .replace("-", "");

    const url = `https://ecos.bok.or.kr/api/StatisticSearch/${ECOS_API_KEY}/json/ko/1/100/722Y001/M/${startYearMonth}/${endYearMonth}/0101000/`;

    const response = await fetch(url, { next: { revalidate: 3600 } }); // 1시간 캐싱
    const data = await response.json();

    if (!data.StatisticSearch?.row) return { current: 3.25, history: [] };

    const rawHistory = data.StatisticSearch.row;
    const history = rawHistory
      .map((item: any) => ({
        date: item.TIME,
        value: parseFloat(item.DATA_VALUE),
      }))
      .filter((item: any) => !isNaN(item.value))
      .sort((a: any, b: any) => a.date.localeCompare(b.date));

    if (history.length === 0) return { current: 3.25, history: [] };

    return {
      current: history[history.length - 1].value,
      history,
    };
  } catch (error) {
    console.error("Error fetching KO rate:", error);
    return { current: 3.25, history: [] };
  }
}

async function fetchUSRate(): Promise<{
  current: number;
  history: RateHistory[];
}> {
  try {
    if (!FRED_API_KEY) throw new Error("FRED_API_KEY is missing");

    // DFEDTARU: Federal Funds Target Range - Upper Limit
    // frequency=m (월간), aggregation_method=eop (기말) 설정을 추가하여 한국 데이터와 맞춤
    const url = `https://api.stlouisfed.org/fred/series/observations?series_id=DFEDTARU&api_key=${FRED_API_KEY}&file_type=json&sort_order=desc&limit=96&frequency=m&aggregation_method=eop`;

    const response = await fetch(url, { next: { revalidate: 3600 } });
    const data = await response.json();

    if (!data.observations || data.observations.length === 0) {
      // 폴백용 FEDFUNDS(실효금리)도 동일하게 월간 데이터로 요청
      const fallbackUrl = `https://api.stlouisfed.org/fred/series/observations?series_id=FEDFUNDS&api_key=${FRED_API_KEY}&file_type=json&sort_order=desc&limit=96&frequency=m`;
      const fallbackRes = await fetch(fallbackUrl, {
        next: { revalidate: 3600 },
      });
      const fallbackData = await fallbackRes.json();
      if (!fallbackData.observations) return { current: 4.5, history: [] };
      data.observations = fallbackData.observations;
    }

    const history = data.observations
      .map((item: any) => ({
        // FRED 날짜 포맷 "2023-12-01" -> "202312"로 변환하여 한국 데이터와 매칭
        date: item.date.replace(/-/g, "").slice(0, 6),
        value: parseFloat(item.value),
      }))
      .filter((item: any) => !isNaN(item.value))
      .sort((a: any, b: any) => a.date.localeCompare(b.date));

    // 유효한 데이터가 하나도 없을 경우 폴백
    if (history.length === 0) return { current: 4.5, history: [] };

    return {
      current: history[history.length - 1].value,
      history,
    };
  } catch (error) {
    console.error("Error fetching US rate:", error);
    return { current: 4.5, history: [] };
  }
}

export async function getInterestRates(): Promise<InterestRates> {
  const [kr, us] = await Promise.all([fetchKORate(), fetchUSRate()]);
  return { kr, us };
}
