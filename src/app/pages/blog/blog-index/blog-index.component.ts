import { Component, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { BLOG_POSTS } from '../../../data/blog-posts';
import { SiteFooterComponent } from '../../../components/site-footer/site-footer.component';
import { SiteHeaderComponent } from '../../../components/site-footer/site-header.component';

@Component({
  selector: 'app-blog-index',
  standalone: true,
  imports: [RouterLink, SiteHeaderComponent, SiteFooterComponent],
  templateUrl: './blog-index.component.html',
  styleUrl: '../blog.scss',
})
export class BlogIndexComponent {
  posts = [...BLOG_POSTS].sort((a, b) => b.date.localeCompare(a.date));

  constructor() {
    inject(Title).setTitle('Fashion & Shopping Guides | Adattamento');
    inject(Meta).updateTag({
      name: 'description',
      content: 'Practical guides on fit, color, wardrobe building and shopping for clothes online.',
    });
  }
}
