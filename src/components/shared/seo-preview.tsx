import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface SeoPreviewProps {
  metaTitle: string;
  metaDescription: string;
  focusKeyword?: string;
  keywords?: string[];
  noIndex?: boolean;
  readingTime?: number;
  fallbackTitle?: string;
  fallbackDescription?: string;
}

export function SeoPreview({
  metaTitle,
  metaDescription,
  focusKeyword,
  keywords = [],
  noIndex = false,
  readingTime,
  fallbackTitle = "Untitled",
  fallbackDescription = "No description provided",
}: SeoPreviewProps) {
  const displayTitle = metaTitle || fallbackTitle;
  const displayDescription = metaDescription || fallbackDescription;
  const hasKeywords = focusKeyword || keywords.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>SEO Preview</CardTitle>
        <CardDescription>
          How this will appear in search results
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">
            Meta Title ({displayTitle.length}/60)
          </div>
          <div className="text-sm font-medium text-blue-600">
            {displayTitle}
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">
            Meta Description ({displayDescription.length}/160)
          </div>
          <div className="text-xs text-muted-foreground line-clamp-2">
            {displayDescription}
          </div>
        </div>

        {hasKeywords && (
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">Keywords</div>
            <div className="flex flex-wrap gap-1">
              {focusKeyword && (
                <Badge variant="secondary" className="text-xs">
                  {focusKeyword} (focus)
                </Badge>
              )}
              {keywords.slice(0, 3).map((keyword) => (
                <Badge key={keyword} variant="outline" className="text-xs">
                  {keyword}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {noIndex && (
          <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100">
            <strong>Not indexed:</strong> This won't appear in search results
          </div>
        )}

        {readingTime !== undefined && (
          <div className="flex items-center justify-between border-t border-border pt-4">
            <span className="text-xs text-muted-foreground">Reading time</span>
            <span className="text-xs font-medium text-foreground">
              {readingTime} min
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
