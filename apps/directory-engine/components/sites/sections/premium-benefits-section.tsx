import { TrendingUp, Link2, ImagePlay, FileText, Award } from 'lucide-react';
import { cn } from '@/lib/utils';
interface PremiumBenefitsSectionProps {
  className?: string;
}

export function PremiumBenefitsSection({
  className,
}: PremiumBenefitsSectionProps) {
  const benefits = [
    {
      icon: TrendingUp,
      title: 'Priority Placement',
      description:
        'Get the highest placement in search results so potential customers find you first.',
    },
    {
      icon: Link2,
      title: 'Dofollow Links',
      description:
        'Boost your SEO with dofollow links that pass authority to your website.',
    },
    {
      icon: ImagePlay,
      title: 'Rich Media',
      description:
        'Showcase your business with multiple images and a video to stand out from the competition.',
    },
    {
      icon: FileText,
      title: 'Business Description',
      description:
        'Tell your story with a detailed business description that helps customers understand what makes you unique.',
    },
    {
      icon: Award,
      title: 'Premium Badge',
      description:
        'Display a premium member badge on your own website to build trust and credibility.',
    },
  ];

  return (
    <section className={cn('w-full py-16', className)}>
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-premium text-primary text-sm font-medium mb-4">
            <Award className="w-4 h-4" />
            Premium Subscription
          </div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Unlock Premium Benefits
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Take your listing to the next level with exclusive features designed
            to maximize your visibility and attract more customers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="flex flex-col p-6 rounded-xl bg-card border border-border hover:border-primary/50 hover:shadow-md transition-all"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <benefit.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
              <p className="text-sm text-muted-foreground">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
