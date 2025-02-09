import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { JUST_CMS_CONFIG, JustCmsConfig } from './just-cms.config';

/**
 * Categories
 */
export interface Category {
  name: string;
  slug: string;
}

export interface CategoriesResponse {
  categories: Category[];
}

/**
 * Image types
 */
export interface ImageVariant {
  url: string;
  width: number;
  height: number;
  filename: string;
}

export interface Image {
  alt: string;
  variants: ImageVariant[];
}

/**
 * Pages
 */
export interface PageSummary {
  title: string;
  subtitle: string;
  coverImage: Image | null;
  slug: string;
  categories: Category[];
  createdAt: string;
  updatedAt: string;
}

export interface PagesResponse {
  items: PageSummary[];
  total: number;
}

/**
 * Content Blocks for a single page
 */
export interface HeaderBlock {
  type: 'header';
  styles: string[];
  header: string;
  subheader: string | null;
  size: string;
}

export interface ListBlock {
  type: 'list';
  styles: string[];
  options: {
    title: string;
    subtitle?: string | null;
  }[];
}

export interface EmbedBlock {
  type: 'embed';
  styles: string[];
  url: string;
}

export interface ImageBlock {
  type: 'image';
  styles: string[];
  images: {
    alt: string;
    variants: ImageVariant[];
  }[];
}

export interface CodeBlock {
  type: 'code';
  styles: string[];
  code: string;
}

export interface TextBlock {
  type: 'text';
  styles: string[];
  text: string;
}

export interface CtaBlock {
  type: 'cta';
  styles: string[];
  text: string;
  url: string;
  description?: string | null;
}

export interface CustomBlock {
  type: 'custom';
  styles: string[];
  blockId: string;
  [key: string]: any;
}

export type ContentBlock =
  | HeaderBlock
  | ListBlock
  | EmbedBlock
  | ImageBlock
  | CodeBlock
  | TextBlock
  | CtaBlock
  | CustomBlock;

export interface PageDetail {
  title: string;
  subtitle: string;
  meta: {
    title: string;
    description: string;
  };
  coverImage: Image | null;
  slug: string;
  categories: Category[];
  content: ContentBlock[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Menus
 */
export interface MenuItem {
  title: string;
  subtitle?: string;
  icon: string;
  url: string;
  styles: string[];
  children: MenuItem[];
}

export interface Menu {
  id: string;
  name: string;
  items: MenuItem[];
}

/**
 * Page filters
 */
export interface PageFilters {
  category: {
    slug: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class JustCmsService {
  private BASE_URL = 'https://api.justcms.co/public';

  constructor(
    private http: HttpClient,
    @Inject(JUST_CMS_CONFIG) private config: JustCmsConfig
  ) {
    if (!this.config.apiToken) {
      throw new Error('JustCMS API token is required');
    }
    if (!this.config.projectId) {
      throw new Error('JustCMS project ID is required');
    }
  }

  /**
   * Helper: Makes a GET request to a JustCMS endpoint.
   *
   * @param endpoint The endpoint (e.g. 'pages' or 'menus/main')
   * @param queryParams Optional query parameters.
   * @returns An Observable of the typed response.
   */
  private get<T>(endpoint: string = '', queryParams?: Record<string, any>): Observable<T> {
    const url = `${this.BASE_URL}/${this.config.projectId}` + (endpoint ? `/${endpoint}` : '');
    let params = new HttpParams();
    if (queryParams) {
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params = params.set(key, String(value));
        }
      });
    }
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.config.apiToken}`
    });

    return this.http.get<T>(url, { headers, params }).pipe(
      catchError((error: HttpErrorResponse) => {
        const errorMsg = `JustCMS API error ${error.status}: ${error.message}`;
        return throwError(() => new Error(errorMsg));
      })
    );
  }

  /**
   * Retrieves all categories.
   */
  getCategories(): Observable<Category[]> {
    return this.get<CategoriesResponse>().pipe(
      map(response => response.categories)
    );
  }

  /**
   * Retrieves pages with optional filtering and pagination.
   *
   * @param params.filters Filter pages by a specific category slug.
   * @param params.start Pagination start index.
   * @param params.offset Number of items to return.
   */
  getPages(params?: {
    filters?: PageFilters;
    start?: number;
    offset?: number;
  }): Observable<PagesResponse> {
    const query: Record<string, any> = {};
    if (params?.filters?.category?.slug) {
      query['filter.category.slug'] = params.filters.category.slug;
    }
    if (params?.start !== undefined) {
      query['start'] = params.start;
    }
    if (params?.offset !== undefined) {
      query['offset'] = params.offset;
    }
    return this.get<PagesResponse>('pages', query);
  }

  /**
   * Retrieves a single page by its slug.
   *
   * @param slug The page slug.
   * @param version (Optional) If provided, adds the v query parameter (e.g. 'draft').
   */
  getPageBySlug(slug: string, version?: string): Observable<PageDetail> {
    const query: Record<string, any> = {};
    if (version) {
      query['v'] = version;
    }
    return this.get<PageDetail>(`pages/${slug}`, query);
  }

  /**
   * Retrieves a single menu by its ID.
   *
   * @param id The menu ID.
   */
  getMenuById(id: string): Observable<Menu> {
    return this.get<Menu>(`menus/${id}`);
  }

  /**
   * Utility: Checks if a content block has a specific style (case-insensitive).
   *
   * @param block The content block.
   * @param style The style to check for.
   */
  isBlockHasStyle(block: { styles: string[] }, style: string): boolean {
    return block.styles.map(s => s.toLowerCase()).includes(style.toLowerCase());
  }

  /**
   * Utility: Gets the large variant of an image (assumes the second variant is large).
   *
   * @param image The image.
   */
  getLargeImageVariant(image: Image): ImageVariant | undefined {
    return image.variants[1];
  }

  /**
   * Utility: Gets the first image from an image block.
   *
   * @param block The image block.
   */
  getFirstImage(block: { images: { alt: string; variants: ImageVariant[] }[] }): { alt: string; variants: ImageVariant[] } | undefined {
    return block.images && block.images.length > 0 ? block.images[0] : undefined;
  }

  /**
   * Utility: Checks if a page belongs to a specific category.
   *
   * @param page The page detail.
   * @param categorySlug The category slug to check.
   */
  hasCategory(page: PageDetail, categorySlug: string): boolean {
    return page.categories.map(category => category.slug).includes(categorySlug);
  }
}
