import "server-only";

/** Every relation that can reference a media file; files in use cannot be deleted. */
export const MEDIA_USAGE = {
  personPhotos: true,
  orgLogos: true,
  orgCovers: true,
  articleFeatured: true,
  eventImages: true,
  journeyCovers: true,
  journeyVideos: true,
  guidanceCovers: true,
  guidanceVideos: true,
  guidanceImages: true,
  homeHeroVideos: true,
  homeHeroImages: true,
} as const;
