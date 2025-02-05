import { useState, useCallback } from "react";
import { EksiArticle } from "../types";

export function useEksiArticles() {
	const [articles, setArticles] = useState<EksiArticle[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(false);
	const [page, setPage] = useState(1);

	// Development-friendly CORS proxies
	const DEV_CORS_PROXIES = [
		"https://cors-anywhere.herokuapp.com/",
		"https://thingproxy.freeboard.io/fetch/",
	];

	// Production CORS proxies
	const PROD_CORS_PROXIES = [
		"https://api.allorigins.win/raw?url=",
		"https://api.codetabs.com/v1/proxy?quest=",
		"https://proxy.cors.sh/",
	];

	const CORS_PROXIES = import.meta.env.DEV
		? DEV_CORS_PROXIES
		: PROD_CORS_PROXIES;

	const fetchWithFallback = async (
		url: string,
		proxyIndex = 0
	): Promise<Response> => {
		if (proxyIndex >= CORS_PROXIES.length) {
			throw new Error("All proxies failed");
		}

		try {
			const proxyUrl = CORS_PROXIES[proxyIndex] + encodeURIComponent(url);
			console.log(
				`Trying proxy ${proxyIndex + 1}/${CORS_PROXIES.length}:`,
				proxyUrl
			);

			const response = await fetch(proxyUrl, {
				headers: {
					Accept: "text/html,application/xhtml+xml,application/xml",
					"x-requested-with": "XMLHttpRequest",
					// Add origin header for development
					...(import.meta.env.DEV && {
						Origin: window.location.origin,
					}),
				},
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			return response;
		} catch (error) {
			console.error(`Proxy ${CORS_PROXIES[proxyIndex]} failed:`, error);
			// Add delay before trying next proxy to avoid rate limits
			await new Promise((resolve) => setTimeout(resolve, 1000));
			return fetchWithFallback(url, proxyIndex + 1);
		}
	};

	const fetchArticles = useCallback(async () => {
		try {
			setLoading(true);
			setError(false);
			const url = `https://eksiseyler.com/Home/PartialLoadMore?PageNumber=${page}&CategoryId=0&ChannelId=NaN`;

			console.log("Fetching articles for page:", page);
			const response = await fetchWithFallback(url);
			const html = await response.text();

			const parser = new DOMParser();
			const doc = parser.parseFromString(html, "text/html");

			// Find all article elements (excluding category cards)
			const articleElements = Array.from(
				doc.querySelectorAll(".content-box")
			).filter((element) => !element.classList.contains("channel-card"));

			const newArticles: EksiArticle[] = [];

			articleElements.forEach((element) => {
				const titleElement = element.querySelector(".content-title a");
				const imageElement = element.querySelector("img");
				const categoryElement = element.querySelector(".meta-category a");
				const viewCountElement = element.querySelector(".meta-stats");
				const snippetElement = element.querySelector(
					".mashup-summary, .content-summary"
				);

				if (titleElement) {
					const title = titleElement.textContent?.trim() || "";
					const category = categoryElement?.textContent?.trim() || "";

					// Only add articles that have both title and category, and they're different
					if (
						title &&
						category &&
						title !== "" &&
						category !== "" &&
						category.toLowerCase() !== title.toLowerCase()
					) {
						const article: EksiArticle = {
							id: Math.random().toString(36).substr(2, 9),
							title,
							url: (titleElement as HTMLAnchorElement).href || "",
							snippet: snippetElement?.textContent?.trim() || "",
							category,
							imageUrl:
								imageElement?.getAttribute("data-src") || imageElement?.src,
							viewCount: parseInt(
								viewCountElement?.textContent?.replace(/[^0-9]/g, "") || "0"
							),
						};

						newArticles.push(article);
					}
				}
			});

			setArticles((prev) => [...prev, ...newArticles]);
			setPage((p) => p + 1);
		} catch (error) {
			console.error("Failed to fetch articles:", error);
			setError(true);
		} finally {
			setLoading(false);
		}
	}, [page]);

	return { articles, loading, fetchArticles, error };
}
