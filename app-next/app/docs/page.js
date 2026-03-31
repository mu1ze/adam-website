import DocsClient from './DocsClient';
import PretextShowcase from './PretextShowcase';

export const metadata = {
  title: 'ADAM - Documentation',
  description: 'Interactive documentation showcasing DOM-free text rendering.',
};

export default function DocsPage() {
  return (
    <main className="container">
      <div className="page-header" style={{ marginBottom: 40 }}>
        <h1>[ ADAM ARCHITECTURE ]</h1>
        <p>Interactive DOM-Free Documentation</p>
      </div>
      <DocsClient />
      <PretextShowcase />
    </main>
  );
}
