import { Component, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BlogSection } from '../../models/blog-post';
import { SITE } from '../../data/site.config';
import { SiteFooterComponent } from '../../components/site-footer/site-footer.component';
import { SiteHeaderComponent } from '../../components/site-footer/site-header.component';

interface LegalPage {
  title: string;
  description: string;
  sections: BlogSection[];
}

const UPDATED = '2026-11-09';

const PAGES: Record<string, LegalPage> = {
  'affiliate-disclosure': {
    title: 'Affiliate Disclosure',
    description: 'How Adattamento may earn money from links on this site.',
    sections: [
      {
        paragraphs: [
          `Adattamento, operated by ${SITE.companyName}, may earn a commission when you click certain links on this site and buy a product from a retailer. This costs you nothing extra, and the price you pay is the same.`,
          'Commissions help us keep the free try-on and the guides on this site running. They do not change what we write, and we only recommend products and ideas we think are useful.',
          'Links of this kind are marked as sponsored links. Product details such as price and availability come from the retailer and can change, so always check the retailer\'s page before you buy.',
        ],
      },
      {
        heading: 'Questions',
        paragraphs: [`If you have a question about this disclosure, contact us at ${SITE.contactEmail}.`],
      },
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    description: 'What information Adattamento collects, why, who sees it, and how long we keep it.',
    sections: [
      {
        paragraphs: [
          `Adattamento is operated by ${SITE.companyName} ("we", "us"). This policy explains how we handle your information when you use our virtual try-on and read our guides.`,
        ],
      },
      {
        heading: 'What we collect',
        list: [
          'Account details: your name, email address and a securely hashed password if you create an account.',
          'Photos you upload: a photo of yourself and photos of clothing or accessories, and the generated result image.',
          'Guest try-on data: for the free guest try-on we record your IP address, so we can limit it to one free try-on, and an email address only if you choose to give one.',
          'Subscription details: if you subscribe, payments are handled by Stripe. We do not see or store your full card number.',
          'Technical data: our servers keep standard request logs, and your browser stores a login token so you stay signed in.',
        ],
      },
      {
        heading: 'How we use it',
        list: [
          'To create your try-on image and show it to you.',
          'To run your account, quotas and subscription.',
          'To prevent abuse and keep costs under control.',
          'To email you if you asked us to, and to answer your questions.',
        ],
      },
      {
        heading: 'Who processes your photos',
        paragraphs: [
          'To generate a try-on image, your photos are sent to third-party AI image services we use, currently FASHN and Replicate (which runs the Pruna model). Our servers are hosted on Amazon Web Services. These providers process the images to produce your result. We do not sell your photos.',
        ],
      },
      {
        heading: 'How long we keep it',
        list: [
          'Guest try-on photos and results are deleted from our servers within 24 hours.',
          'Photos and results for registered accounts are kept until you ask us to delete them.',
          'We keep the IP address and optional email attached to a guest try-on record so the free-trial limit keeps working.',
        ],
      },
      {
        heading: 'Your choices',
        paragraphs: [
          `You can ask us to delete your account and your images, or unsubscribe from emails, at any time by contacting ${SITE.contactEmail}.`,
        ],
      },
      {
        heading: 'Children',
        paragraphs: ['Adattamento is not intended for children under 13, and we do not knowingly collect their information.'],
      },
      {
        heading: 'Changes',
        paragraphs: ['If we change this policy we will update the date at the top of this page.'],
      },
    ],
  },
  terms: {
    title: 'Terms of Use',
    description: 'The rules for using Adattamento.',
    sections: [
      {
        paragraphs: [`Adattamento is operated by ${SITE.companyName} ("we", "us"). By using Adattamento you agree to these terms.`],
      },
      {
        heading: 'Using the service',
        list: [
          'Only upload photos you have the right to use. Do not upload photos of other people without their permission.',
          'Do not upload illegal, explicit or abusive content, or try to misuse or overload the service.',
          'The free guest try-on is limited to one per visitor.',
        ],
      },
      {
        heading: 'Results',
        paragraphs: [
          'Generated images are AI-made previews. They may not be accurate and are not a guarantee of how a garment will fit or look. Use size charts and measurements when buying clothing.',
        ],
      },
      {
        heading: 'Subscriptions',
        paragraphs: [
          'Paid plans give you a monthly number of generations and are billed through Stripe. You can cancel at any time and your plan will continue until the end of the paid period.',
        ],
      },
      {
        heading: 'Third-party links',
        paragraphs: [
          'We link to products on retailer sites. We do not control those sites and are not responsible for their products or policies.',
        ],
      },
      {
        heading: 'Disclaimer',
        paragraphs: [
          'The service is provided as is, without warranties. To the extent the law allows, we are not liable for indirect losses arising from your use of the service.',
        ],
      },
      {
        heading: 'Contact',
        paragraphs: [`Questions about these terms: ${SITE.contactEmail}.`],
      },
    ],
  },
};

@Component({
  selector: 'app-legal',
  standalone: true,
  imports: [RouterLink, SiteHeaderComponent, SiteFooterComponent],
  template: `
    <app-site-header />
    <main class="blog">
      <h1>{{ page.title }}</h1>
      <p class="meta">Last updated {{ updated }}</p>
      @for (section of page.sections; track $index) {
        @if (section.heading) { <h2>{{ section.heading }}</h2> }
        @for (p of section.paragraphs ?? []; track $index) { <p>{{ p }}</p> }
        @if (section.list) {
          <ul>@for (item of section.list; track $index) { <li>{{ item }}</li> }</ul>
        }
      }
      <p><a routerLink="/">Back to Adattamento</a></p>
    </main>
    <app-site-footer />
  `,
  styleUrl: '../blog/blog.scss',
})
export class LegalComponent {
  updated = UPDATED;
  page: LegalPage = PAGES[inject(ActivatedRoute).snapshot.data['page']];

  constructor() {
    inject(Title).setTitle(`${this.page.title} | Adattamento`);
    inject(Meta).updateTag({ name: 'description', content: this.page.description });
  }
}
