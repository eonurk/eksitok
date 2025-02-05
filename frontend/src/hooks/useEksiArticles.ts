import { useState, useCallback } from "react";
import { EksiArticle } from "../types";

export function useEksiArticles() {
	const [articles, setArticles] = useState<EksiArticle[]>([]);
	const [loading, setLoading] = useState(false);
	const [page, setPage] = useState(1);
	const [error, setError] = useState(false);

	const CORS_PROXIES = [
		"https://corsproxy.io/?",
		"https://api.codetabs.com/v1/proxy?quest=",
		"https://api.allorigins.win/raw?url=",
	];

	const fetchWithFallback = async (
		url: string,
		proxyIndex = 0
	): Promise<Response> => {
		if (proxyIndex >= CORS_PROXIES.length) {
			throw new Error("All proxies failed");
		}

		try {
			const proxyUrl = CORS_PROXIES[proxyIndex] + encodeURIComponent(url);
			const response = await fetch(proxyUrl, {
				headers: {
					Accept: "text/html,application/xhtml+xml,application/xml",
				},
			});

			if (!response.ok) {
				throw new Error("Response not OK");
			}

			return response;
		} catch (error) {
			// Try next proxy
			console.error("Error fetching with proxy:", error);
			return fetchWithFallback(url, proxyIndex + 1);
		}
	};

	const fetchArticles = useCallback(async () => {
		try {
			setLoading(true);
			const url = `https://eksiseyler.com/Home/PartialLoadMore?PageNumber=${page}&CategoryId=0&ChannelId=NaN`;

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
			console.error("Error fetching articles:", error);
			setError(true);
		} finally {
			setLoading(false);
		}
	}, [page]);

	return { articles, loading, fetchArticles, error };
}
