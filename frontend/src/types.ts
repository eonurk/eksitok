export interface EksiArticle {
	id: string;
	title: string;
	url: string;
	snippet: string;
	imageUrl?: string;
	thumbnail?: {
		source: string;
		width: number;
		height: number;
	};
	author?: string;
	publishDate?: string;
	category?: string;
	viewCount?: number;
	extract?: string;
}

export interface WikiArticle {
	title: string;
	extract: string;
	pageid: number;
	thumbnail?: {
		source: string;
	};
	url: string;
}
