import React from 'react';
import { AppLayout } from '../components/Layout.js';
import { CandidateProfile } from '../components/mission-control/CandidateProfile.js';

export function CandidateProfilePage() {
  const candidate = {
    name: "Alex Rivera",
    role: "Senior Full-Stack Engineer",
    matchScore: 96,
    skills: ["React", "TypeScript", "Node.js", "GraphQL"],
    status: "Interviewing"
  };

  return (
    <AppLayout title="Candidate Profile" subtitle="Detailed overview of applicant match">
      <div className="p-6 max-w-2xl mx-auto">
        <CandidateProfile candidate={candidate} />
      </div>
    </AppLayout>
  );
}
