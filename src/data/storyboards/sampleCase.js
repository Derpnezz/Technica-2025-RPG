export const SAMPLE_CASES = [
  {
    id: 'case-1',
    title: 'The Influencer Misinformation Trial',
    summary: 'A high-profile influencer is accused of spreading misinformation during a product launch causing financial loss.',
    scenario: 'An influencer endorsed a supplement claiming clinical benefits without clear evidence. Several consumers filed complaints after adverse effects.',
    witnesses: [
      { name: 'Alex Rivera', role: 'Influencer', description: 'Charismatic, persuasive, claims to cite studies.' },
      { name: 'Dr. Mei Lin', role: 'Independent Researcher', description: 'Skeptical scientist who analyzed claims.' },
      { name: 'Jordan Park', role: 'Affected Consumer', description: 'Experienced side effects and financial loss.' }
    ],
    exhibits: [
      { id: 'E-1', title: 'Product Advertisement', description: 'Social media post with bold claims.' },
      { id: 'E-2', title: 'Study Excerpt', description: 'A misquoted abstract from a small trial.' },
      { id: 'E-3', title: 'Customer Complaints', description: 'Emails and receipts showing purchases.' }
    ],
    entryPrompt: 'Should influencers be held legally accountable for unverified health claims that lead to consumer harm?'
  },
  {
    id: 'case-2',
    title: 'Workplace Surveillance Case',
    summary: 'Employees claim invasive monitoring that violated privacy; employer says it was for safety.',
    scenario: 'A company deployed monitoring tools that recorded keystrokes and webcam thumbnails to prevent data leaks.',
    witnesses: [
      { name: 'Pat Gomez', role: 'HR Manager', description: 'Defends monitoring as necessary.' },
      { name: 'Samira Kahn', role: 'Privacy Advocate', description: 'Questions proportionality and consent.' }
    ],
    exhibits: [
      { id: 'E-1', title: 'Monitoring Policy', description: 'Internal policy document.' },
      { id: 'E-2', title: 'Screenshots', description: 'Samples showing camera captures.' }
    ],
    entryPrompt: 'Is workplace surveillance justified when balanced against employee privacy rights?'
  }
];
