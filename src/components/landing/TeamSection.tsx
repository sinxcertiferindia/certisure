import { motion } from "framer-motion";
import { Linkedin } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type TeamMember = {
  name: string;
  role: string;
  description: string;
  linkedin: string;
  image: string;
};

type TeamGroup = {
  name: string;
  tagline: string;
  members: TeamMember[];
};

const teams: TeamGroup[] = [
  {
    name: "Core Team Members",
    tagline: "Designing, building, and promoting secure digital certificate solutions.",
    members: [
      {
        name: "Pragya Goyal",
        role: "Frontend Developer",
        description:
          "Crafts modern, responsive user interfaces with a focus on performance, accessibility, and user experience.",
        linkedin: "https://www.linkedin.com/in/pragya-goyal-365948256?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
        image:
          "/images/pragyaimg.jpeg",
      },
      {
        name: "Manas Parihar",
        role: "Backend Developer",
        description:
          "Designs scalable backend systems, APIs, and secure data workflows that power the platform reliably.",
        linkedin: "https://www.linkedin.com/in/manas-parihar-0195a9299?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
        image:
          "/images/manasimg.jpeg",
      },
      {
        name: "Shreya Vyas",
        role: "Marketing Lead",
        description:
          "Drives growth through strategic marketing, brand positioning, and customer engagement initiatives.",
        linkedin: "https://www.linkedin.com/in/shreya-vyas-04a5b0219?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
        image:
          "/images/shreyaimg.jpeg",
      },
    ],
  },
];

export function TeamSection() {
  return (
    <section id="team" className="py-28 bg-muted/40 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-24 left-10 w-72 h-72 bg-gradient-radial from-accent/10 to-transparent blur-3xl" />
        <div className="absolute bottom-12 right-10 w-80 h-80 bg-gradient-radial from-secondary/10 to-transparent blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        

        {/* Team Cards */}
        {teams.map((team, groupIndex) => (
          <motion.div
            key={team.name}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: groupIndex * 0.1 }}
            className="space-y-10"
          >
            <div className="text-center">
              <h3 className="text-3xl font-semibold text-foreground">
                {team.name}
              </h3>
              <p className="text-muted-foreground mt-3 max-w-3xl mx-auto">
                {team.tagline}
              </p>
            </div>

            <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
              {team.members.map((member, memberIndex) => (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: memberIndex * 0.08 }}
                >
                  <Card className="h-full max-w-md mx-auto border-border/60 bg-card/90 backdrop-blur p-6 hover:-translate-y-2 transition-all duration-300 shadow-lg hover:shadow-2xl">
                    <CardHeader className="flex flex-row items-center gap-6">
                      <Avatar className="h-20 w-20 ring-2 ring-accent/30">
                        <AvatarImage src={member.image} alt={member.name} />
                        <AvatarFallback className="text-lg">
                          {member.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-2xl">
                          {member.name}
                        </CardTitle>
                        <p className="text-base text-muted-foreground">
                          {member.role}
                        </p>
                      </div>
                    </CardHeader>

                    <CardContent className="flex flex-col gap-6 mt-2">
                      <p className="text-base text-muted-foreground leading-relaxed">
                        {member.description}
                      </p>

                      <Button variant="glass" size="default" className="w-fit" asChild>
                        <a
                          href={member.linkedin}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2"
                        >
                          <Linkedin className="h-5 w-5" />
                          LinkedIn
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

