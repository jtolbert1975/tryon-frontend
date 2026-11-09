import { Component, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BLOG_POSTS } from '../../../data/blog-posts';
import { BlogPost } from '../../../models/blog-post';
import { SiteFooterComponent } from '../../../components/site-footer/site-footer.component';
import { SiteHeaderComponent } from '../../../components/site-footer/site-header.component';

@Component({
  selector: 'app-blog-post',
  standalone: true,
  imports: [RouterLink, SiteHeaderComponent, SiteFooterComponent],
  templateUrl: './blog-post.component.html',
  styleUrl: '../blog.scss',
})
export class BlogPostComponent {
  post: BlogPost | undefined;
  related: BlogPost[] = [];

  constructor() {
    const slug = inject(ActivatedRoute).snapshot.paramMap.get('slug');
    this.post = BLOG_POSTS.find((p) => p.slug === slug);

    if (!this.post) {
      inject(Router).navigate(['/blog']);
      return;
    }

    this.related = BLOG_POSTS.filter((p) => p.slug !== slug).slice(0, 3);
    inject(Title).setTitle(`${this.post.title} | Adattamento`);
    inject(Meta).updateTag({ name: 'description', content: this.post.description });
  }
}
