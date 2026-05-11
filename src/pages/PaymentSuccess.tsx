import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import PageLayout from '@/components/PageLayout';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // Could verify the session here if needed
    console.log('Payment successful, session:', sessionId);
  }, [sessionId]);

  return (
    <PageLayout>
      <div className="min-h-screen flex items-center justify-center py-20">
        <div className="container mx-auto px-4">
          <Card className="max-w-lg mx-auto glass text-center">
            <CardContent className="pt-10 pb-8">
              <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-primary" />
              </div>
              <h1 className="text-3xl font-bold mb-4">Payment Successful!</h1>
              <p className="text-muted-foreground mb-8">
                Thank you for your purchase. Your credits have been added to your account.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild>
                  <Link to="/dashboard">
                    Go to Dashboard
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/video-model">Start Creating</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}
