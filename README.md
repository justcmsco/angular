# JustCMS Angular Integration

A simple, type-safe integration for [JustCMS](https://justcms.co) in your Angular project. This integration provides an injectable service that wraps the JustCMS public API endpoints, making it easy to fetch categories, pages, and menus.

## Features

- **TypeScript support:** Fully typed structures for API responses.
- **Angular Service:** All JustCMS API calls are encapsulated in one injectable service.
- **Easy Integration:** Configure your API token and project ID via Angular's dependency injection.
- **Flexible Endpoints:** Supports fetching categories, pages (with filtering and pagination), a page by its slug, and a menu by its ID.

## Installation

1. **Add the Service and Configuration Files:**

   Copy the following files into your project:
   - `just-cms.config.ts`
   - `just-cms.service.ts`

2. **Install Dependencies:**

   Ensure that your Angular project has `@angular/common/http` installed and imported in your AppModule. If not, run:
   
   ```bash
   npm install @angular/common
   ```

## Configuration

Provide your JustCMS API token and project ID via Angular's dependency injection. For example, in your AppModule:

```typescript
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { JUST_CMS_CONFIG, JustCmsConfig } from './just-cms.config';

const justCmsConfig: JustCmsConfig = {
  apiToken: 'YOUR_JUSTCMS_API_TOKEN',
  projectId: 'YOUR_JUSTCMS_PROJECT_ID'
};

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule
  ],
  providers: [
    { provide: JUST_CMS_CONFIG, useValue: justCmsConfig }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

## Usage

Inject the `JustCmsService` into your components or services and use its methods to fetch data from JustCMS.

### Example Component

Below is an example that fetches and displays categories:

```typescript
import { Component, OnInit } from '@angular/core';
import { JustCmsService, Category } from './just-cms.service';

@Component({
  selector: 'app-categories',
  template: \`
    <div>
      <h2>Categories</h2>
      <ul>
        <li *ngFor="let cat of categories">
          {{ cat.name }}
        </li>
      </ul>
    </div>
  \`
})
export class CategoriesComponent implements OnInit {
  categories: Category[] = [];

  constructor(private justCmsService: JustCmsService) { }

  ngOnInit(): void {
    this.justCmsService.getCategories().subscribe({
      next: (cats) => this.categories = cats,
      error: (err) => console.error('Error fetching categories', err)
    });
  }
}
```

### Available Methods

The `JustCmsService` provides the following methods:

#### getCategories()
Fetches all categories for your project.
```typescript
this.justCmsService.getCategories().subscribe(categories => {
  // categories is of type Category[]
});
```

#### getPages(params?: { filters?: PageFilters; start?: number; offset?: number })
Fetches pages with optional filtering and pagination.
```typescript
// Get all pages
this.justCmsService.getPages().subscribe(pagesResponse => {
  // pagesResponse.items contains the pages, and pagesResponse.total the total count.
});

// Get pages from a specific category
this.justCmsService.getPages({ filters: { category: { slug: 'blog' } } }).subscribe(pagesResponse => {
  // Handle the filtered pages
});
```

#### getPageBySlug(slug: string, version?: string)
Fetches a specific page by its slug.
```typescript
this.justCmsService.getPageBySlug('about-us').subscribe(page => {
  // page is of type PageDetail
});
```

#### getMenuById(id: string)
Fetches a menu and its items by ID.
```typescript
this.justCmsService.getMenuById('main-menu').subscribe(menu => {
  // menu is of type Menu
});
```

#### Utility Methods

- **isBlockHasStyle(block: ContentBlock, style: string): boolean**  
  Checks if a content block has a specific style (case-insensitive).
  ```typescript
  const isHighlighted = this.justCmsService.isBlockHasStyle(block, 'highlight');
  ```

- **getLargeImageVariant(image: Image): ImageVariant**  
  Gets the large variant of an image (assumed to be the second variant in the array).
  ```typescript
  const largeImage = this.justCmsService.getLargeImageVariant(page.coverImage);
  ```

- **getFirstImage(block: ImageBlock): { alt: string; variants: ImageVariant[] }**  
  Retrieves the first image from an image block.
  ```typescript
  const firstImage = this.justCmsService.getFirstImage(imageBlock);
  ```

- **hasCategory(page: PageDetail, categorySlug: string): boolean**  
  Checks if a page belongs to a specific category.
  ```typescript
  const isBlogPost = this.justCmsService.hasCategory(page, 'blog');
  ```

## API Endpoints Overview

The service wraps the following JustCMS API endpoints:

- **Get Categories:** Retrieve all categories for your project.
- **Get Pages:** Retrieve pages with optional filtering (by category slug) and pagination.
- **Get Page by Slug:** Retrieve detailed information about a specific page.
- **Get Menu by ID:** Retrieve a menu and its items by its unique identifier.

For more details on each endpoint, refer to the [JustCMS Public API Documentation](https://justcms.co/api).
