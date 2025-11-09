export type CodeSample = {
	id: string;
	title: string;
	language: 'bash' | 'git' | 'ts' | 'tsx' | 'js' | 'json' | 'md' | string;
	code: string;
	description?: string;
	imageUrl?: string;
};

export type Lesson = {
	slug: string;
	title: string;
	description: string;
	sections: Array<{
		heading: string;
		body: string;
		examples?: CodeSample[];
		imageUrl?: string;
	}>;
	prerequisites?: string[];
	nextSlug?: string;
	prevSlug?: string;
};

export type LessonMeta = Pick<Lesson, 'slug' | 'title' | 'description'>; 