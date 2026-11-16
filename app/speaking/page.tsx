import type { Metadata } from 'next';
import Link from 'next/link';

import { SchemaGraph } from '@/components/Schema';
import Entry from '@/components/Speaking/Entry';
import PageWrapper from '@/components/Template/PageWrapper';
import { getAppearances } from '@/data/speaking';
import { createPageMetadata } from '@/lib/metadata';
import { collectionPageNode, sectionPageNodes } from '@/lib/schema';
import { AUTHOR_NAME } from '@/lib/utils';

const PAGE_TITLE = 'Speaking';

const SPEAKING_DESCRIPTION = `Presentations, competition pitches, and technical demos by ${AUTHOR_NAME}.`;

export const metadata: Metadata = createPageMetadata({
  title: PAGE_TITLE,
  description: SPEAKING_DESCRIPTION,
  path: '/speaking/',
});

export default function SpeakingPage() {
  const appearances = getAppearances();

  return (
    <PageWrapper>
      <SchemaGraph
        nodes={sectionPageNodes(
          collectionPageNode,
          '/speaking/',
          PAGE_TITLE,
          SPEAKING_DESCRIPTION,
        )}
      />
      {/* The register's layout classes are shared with /projects. */}
      <div className="projects-page">
        <header className="projects-header">
          <h1 className="page-title">{PAGE_TITLE}</h1>
          <p className="page-subtitle page-prose">
            Technical presentations, competition pitches, and hackathon demos
            covering AI systems, decentralized environments, and agricultural
            marketplaces.
          </p>
        </header>

        <section className="projects-group" aria-labelledby="speaking-public">
          <div className="section-header">
            <h2 id="speaking-public" className="section-heading">
              Presentations &amp; Pitches
            </h2>
          </div>
          <ol className="projects-register">
            {appearances.map((appearance) => (
              <li key={appearance.link}>
                <Entry data={appearance} />
              </li>
            ))}
          </ol>
        </section>

        <section className="projects-group" aria-labelledby="speaking-private">
          <div className="section-header">
            <h2 id="speaking-private" className="section-heading">
              Collaborations &amp; Events
            </h2>
          </div>
          <p className="page-prose">
            I regularly organize and lead technical workshops, hackathons, and
            coding sessions through ByteMinds Society and college events. If
            you’re interested in collaborating on an event or project,{' '}
            <Link href="/contact/">get in touch</Link>.
          </p>
        </section>
      </div>
    </PageWrapper>
  );
}
