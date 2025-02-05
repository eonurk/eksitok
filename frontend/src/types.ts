export interface EksiArticle {
	id: string;
	title: string;
	url: string;
	snippet: string;
	imageUrl?: string;
	author?: string;
	publishDate?: string;
	category?: string;
	viewCount?: number;
}
