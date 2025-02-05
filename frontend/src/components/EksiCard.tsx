import { EksiArticle } from "../types";

interface EksiCardProps {
	article: EksiArticle;
}

export function EksiCard({ article }: EksiCardProps) {
	// Only show category if both title and category exist and are different
	const showCategory =
		article.category &&
		article.title &&
		article.category.trim() !== "" &&
		article.title.trim() !== "" &&
		article.category.toLowerCase() !== article.title.toLowerCase();

	return (
		<div className="h-screen w-full snap-start relative">
			{/* Background Image */}
			<div
				className="absolute inset-0 bg-cover bg-center"
				style={{
					backgroundImage: `url(${article.imageUrl})`,
				}}
			>
				{/* Dark overlay for better text visibility */}
				<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
			</div>

			{/* Content */}
			<div className="relative h-full flex flex-col justify-end p-8 pb-16">
				<div className="max-w-3xl">
					{showCategory && (
						<span className="text-sm font-medium text-white/90 uppercase mb-3 block">
							{article.category}
						</span>
					)}
					<h1 className="text-4xl font-bold text-white mb-3 leading-tight">
						{article.title}
					</h1>
					{article.snippet && (
						<p className="text-lg text-white/90 mb-4 line-clamp-3">
							{article.snippet}
						</p>
					)}
					<a
						href={article.url}
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex items-center px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg backdrop-blur-sm transition-colors"
					>
						Devamını Oku
						<svg
							className="w-5 h-5 ml-2"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M14 5l7 7m0 0l-7 7m7-7H3"
							/>
						</svg>
					</a>
				</div>
			</div>
		</div>
	);
}
