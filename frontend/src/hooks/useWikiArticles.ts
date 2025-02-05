import { useState, useCallback } from "react";
import { useLocalization } from "./useLocalization";
import { EksiArticle } from "../types";

const preloadImage = (src: string): Promise<void> => {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.src = src;
		img.onload = () => resolve();
		img.onerror = reject;
	});
};

export function useEksiArticles() {
	const [articles, setArticles] = useState<EksiArticle[]>([]);
	const [loading, setLoading] = useState(false);
	const [buffer, setBuffer] = useState<EksiArticle[]>([]);
	const { currentLanguage } = useLocalization();

	const fetchArticles = async (forBuffer = false) => {
		if (loading) return;
		setLoading(true);
		try {
			const response = await fetch(
				currentLanguage.api +
					new URLSearchParams({
						action: "query",
						format: "json",
						generator: "random",
						grnnamespace: "0",
						prop: "extracts|pageimages|info",
						inprop: "url",
						grnlimit: "20",
						exintro: "1",
						exlimit: "max",
						exsentences: "5",
						explaintext: "1",
						piprop: "thumbnail",
						pithumbsize: "400",
						origin: "*",
					})
			);

			const data = await response.json();
			const newArticles = Object.values(data.query.pages)
				.map(
					(page: any): EksiArticle => ({
						title: page.title,
						extract: page.extract,
						pageid: page.pageid,
						thumbnail: page.thumbnail,
						url: page.canonicalurl,
					})
				)
				.filter(
					(article) =>
						article.thumbnail &&
						article.thumbnail.source &&
						article.url &&
						article.extract
				);

			await Promise.allSettled(
				newArticles
					.filter((article) => article.thumbnail)
					.map((article) => preloadImage(article.thumbnail!.source))
			);

			if (forBuffer) {
				setBuffer(newArticles);
			} else {
				setArticles((prev) => [...prev, ...newArticles]);
				fetchArticles(true);
			}
		} catch (error) {
			console.error("Error fetching articles:", error);
		}
		setLoading(false);
	};

	const getMoreArticles = useCallback(() => {
		if (buffer.length > 0) {
			setArticles((prev) => [...prev, ...buffer]);
			setBuffer([]);
			fetchArticles(true);
		} else {
			fetchArticles(false);
		}
	}, [buffer]);

	return { articles, loading, fetchArticles: getMoreArticles };
}
