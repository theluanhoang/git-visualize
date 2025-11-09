export const getSlugFromPath = (path: string) => {
    const parts = path.split("/").filter(Boolean);
    return parts[parts.length - 1] || 'git-intro';
};