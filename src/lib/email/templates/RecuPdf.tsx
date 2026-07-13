import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Heading,
  Text,
  Button,
  Section,
} from '@react-email/components';

interface RecuPdfProps {
  prenom: string;
  lienTelechargement: string;
}

// Reçu / confirmation d'achat du PDF (200 F). Envoyé depuis le webhook Fedapay.
export function RecuPdf({ prenom, lienTelechargement }: RecuPdfProps) {
  return (
    <Html lang="fr">
      <Head />
      <Preview>Ton Plan de Parcours est prêt à télécharger</Preview>
      <Body style={{ backgroundColor: '#f7f8fb', fontFamily: 'sans-serif' }}>
        <Container style={{ padding: '24px' }}>
          <Heading style={{ color: '#12224a' }}>Merci {prenom} !</Heading>
          <Text>
            Ton paiement est confirmé. Ton Plan de Parcours détaillé (curriculum, comparatif
            écoles, témoignages) est prêt.
          </Text>
          <Section style={{ margin: '24px 0' }}>
            <Button
              href={lienTelechargement}
              style={{
                backgroundColor: '#12224a',
                color: '#ffffff',
                padding: '12px 20px',
                borderRadius: '8px',
                textDecoration: 'none',
              }}
            >
              Télécharger mon PDF
            </Button>
          </Section>
          <Text style={{ color: '#6b7280', fontSize: '12px' }}>
            ORIENTAFRIK · Ton orientation post-bac, sans hasard.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
