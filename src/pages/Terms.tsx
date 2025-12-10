import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, FileText, Shield, Eye, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import hanchiLogo from "@/assets/hanchi-nose-logo.png";

export default function Terms() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </Button>
          <div className="flex items-center gap-2">
            <img src={hanchiLogo} alt="Hanchi" className="w-8 h-8 rounded-full" />
            <h1 className="text-xl font-bold text-foreground">Legal</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Tabs defaultValue="terms" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="terms" className="gap-2">
                <FileText size={16} />
                Terms of Service
              </TabsTrigger>
              <TabsTrigger value="privacy" className="gap-2">
                <Shield size={16} />
                Privacy Policy
              </TabsTrigger>
            </TabsList>

            <TabsContent value="terms" className="space-y-6">
              <div className="bg-card border border-border rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="text-primary" size={24} />
                  <h2 className="text-xl font-bold text-foreground">Terms of Service</h2>
                </div>
                <p className="text-sm text-muted-foreground mb-4">Last updated: January 2025</p>
                
                <div className="space-y-6 text-muted-foreground">
                  <section>
                    <h3 className="font-semibold text-foreground mb-2">1. Acceptance of Terms</h3>
                    <p>By accessing and using Hanchi AI ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.</p>
                  </section>

                  <section>
                    <h3 className="font-semibold text-foreground mb-2">2. Description of Service</h3>
                    <p>Hanchi AI is a free AI assistant service that provides conversational AI, image generation, translation, and other AI-powered features. The service is provided "as is" without any guarantees of availability or accuracy.</p>
                  </section>

                  <section>
                    <h3 className="font-semibold text-foreground mb-2">3. User Responsibilities</h3>
                    <ul className="list-disc list-inside space-y-2">
                      <li>You must be at least 13 years old to use this service</li>
                      <li>You are responsible for all content you submit to the service</li>
                      <li>You agree not to use the service for illegal activities</li>
                      <li>You agree not to attempt to harm, hack, or disrupt the service</li>
                      <li>You agree not to use the service to generate harmful, hateful, or misleading content</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="font-semibold text-foreground mb-2">4. Prohibited Uses</h3>
                    <ul className="list-disc list-inside space-y-2">
                      <li>Generating content that promotes violence or hatred</li>
                      <li>Creating misleading or fake news content</li>
                      <li>Impersonating others or creating deceptive content</li>
                      <li>Using the service for fraud or scams</li>
                      <li>Attempting to bypass content filters for malicious purposes</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="font-semibold text-foreground mb-2">5. Intellectual Property</h3>
                    <p>Content you create using Hanchi AI belongs to you. However, you grant us a license to use anonymized data to improve our service. The Hanchi AI brand, logo, and software remain our intellectual property.</p>
                  </section>

                  <section>
                    <h3 className="font-semibold text-foreground mb-2">6. Disclaimer</h3>
                    <p>Hanchi AI provides information for general purposes only. We do not guarantee the accuracy of responses. Do not rely on Hanchi for medical, legal, or financial advice without consulting a professional.</p>
                  </section>

                  <section>
                    <h3 className="font-semibold text-foreground mb-2">7. Limitation of Liability</h3>
                    <p>Hanchi AI and its operators shall not be liable for any damages arising from your use of the service. This includes direct, indirect, incidental, or consequential damages.</p>
                  </section>

                  <section>
                    <h3 className="font-semibold text-foreground mb-2">8. Changes to Terms</h3>
                    <p>We may update these terms from time to time. Continued use of the service after changes constitutes acceptance of the new terms.</p>
                  </section>

                  <section>
                    <h3 className="font-semibold text-foreground mb-2">9. Contact</h3>
                    <p>For questions about these terms, contact us at: legal@hanchi.ai</p>
                  </section>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="privacy" className="space-y-6">
              <div className="bg-card border border-border rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="text-primary" size={24} />
                  <h2 className="text-xl font-bold text-foreground">Privacy Policy</h2>
                </div>
                <p className="text-sm text-muted-foreground mb-4">Last updated: January 2025</p>
                
                <div className="space-y-6 text-muted-foreground">
                  <section>
                    <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                      <Eye size={18} className="text-primary" />
                      What We Collect
                    </h3>
                    <ul className="list-disc list-inside space-y-2">
                      <li><strong>Account Information:</strong> Email address and profile information you provide</li>
                      <li><strong>Conversations:</strong> Messages you send to Hanchi (stored securely for your chat history)</li>
                      <li><strong>Usage Data:</strong> How you use the app (features used, session duration)</li>
                      <li><strong>Device Information:</strong> Browser type, device type, IP address</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                      <CheckCircle size={18} className="text-green-500" />
                      How We Use Your Data
                    </h3>
                    <ul className="list-disc list-inside space-y-2">
                      <li>To provide and improve the Hanchi AI service</li>
                      <li>To personalize your experience (user memory feature)</li>
                      <li>To maintain your conversation history</li>
                      <li>To analyze usage patterns and improve features</li>
                      <li>To communicate important updates about the service</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                      <AlertTriangle size={18} className="text-yellow-500" />
                      What We DON'T Do
                    </h3>
                    <ul className="list-disc list-inside space-y-2">
                      <li>We do NOT sell your personal data to third parties</li>
                      <li>We do NOT share your conversations with advertisers</li>
                      <li>We do NOT use your data for targeted advertising</li>
                      <li>We do NOT store payment information (the service is free)</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="font-semibold text-foreground mb-2">Data Storage & Security</h3>
                    <p>Your data is stored securely using industry-standard encryption. We use Supabase for data storage, which provides enterprise-level security. Your conversations are encrypted in transit and at rest.</p>
                  </section>

                  <section>
                    <h3 className="font-semibold text-foreground mb-2">Your Rights</h3>
                    <ul className="list-disc list-inside space-y-2">
                      <li><strong>Access:</strong> You can view all your stored data in Settings</li>
                      <li><strong>Deletion:</strong> You can delete your conversations and account anytime</li>
                      <li><strong>Export:</strong> You can export your conversation history</li>
                      <li><strong>Correction:</strong> You can update your profile information</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="font-semibold text-foreground mb-2">Cookies & Tracking</h3>
                    <p>We use essential cookies to keep you logged in and maintain your session. We do not use advertising or tracking cookies. You can disable cookies in your browser settings, but this may affect functionality.</p>
                  </section>

                  <section>
                    <h3 className="font-semibold text-foreground mb-2">Third-Party Services</h3>
                    <p>We use the following third-party services:</p>
                    <ul className="list-disc list-inside space-y-2">
                      <li><strong>Supabase:</strong> Authentication and database (your data stays secure)</li>
                      <li><strong>Puter AI:</strong> AI model provider (queries are processed and not stored)</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="font-semibold text-foreground mb-2">Children's Privacy</h3>
                    <p>Hanchi AI is not intended for children under 13. If we learn we have collected data from a child under 13, we will delete it promptly.</p>
                  </section>

                  <section>
                    <h3 className="font-semibold text-foreground mb-2">Changes to This Policy</h3>
                    <p>We may update this privacy policy from time to time. We will notify you of significant changes via email or in-app notification.</p>
                  </section>

                  <section>
                    <h3 className="font-semibold text-foreground mb-2">Contact Us</h3>
                    <p>For privacy-related questions or concerns, contact us at: privacy@hanchi.ai</p>
                  </section>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Back to Chat */}
        <div className="mt-8 text-center">
          <Button variant="outline" onClick={() => navigate("/chat")}>
            Back to Hanchi
          </Button>
        </div>
      </main>
    </div>
  );
}
