import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { siteConfig } from '@/config/site';
import { aboutContent } from '@/content/about';
import { aboutTeaser } from '@/content/home';

export function AboutTeaser() {
  return (
    <section aria-labelledby="about-teaser-heading" className="bg-surface py-16 sm:py-20">
      <Container>
        <div className="grid items-center gap-8 md:grid-cols-[auto_1fr]">
          <Image
            src={siteConfig.founder.image}
            alt={aboutContent.founder.imageAlt}
            width={160}
            height={160}
            className="size-40 rounded-2xl object-cover"
          />
          <div>
            <h2
              id="about-teaser-heading"
              className="text-3xl font-extrabold tracking-tight text-white"
            >
              {aboutTeaser.heading}
            </h2>
            <p className="mt-3 max-w-2xl text-lg text-slate-300">{aboutTeaser.body}</p>
            <div className="mt-5">
              <Button href="/about" variant="secondary">
                {aboutTeaser.cta}
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
