exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405 };

  try {
    const { name, scores, answers } = JSON.parse(event.body);

    const SECTIONS = [
      'Gospel knowledge','Character & fruit','Skills & mission',
      'Relationships','Life application','Reproduction'
    ];

    const QUESTIONS = [
      [
        'I can clearly explain the core gospel message — Jesus\u2019 life, death, resurrection, and what it means for my life.',
        'When I face anxiety, conflict, or disappointment, I naturally turn to gospel truth rather than reacting from fear or performance.',
        'I see Jesus as the answer to my deepest needs for identity, security, and purpose — not just as Savior from eternal consequences.',
        'I can help someone else identify a false belief they carry and point them toward the gospel in everyday conversation.'
      ],
      [
        'People who know me well would say I respond to frustrating situations with patience rather than reactive anger.',
        'I practice honesty about my struggles while still pursuing growth — I live authentically rather than performing for others\u2019 approval.',
        'I show genuine compassion to people in need without expecting anything in return.',
        'My spiritual disciplines (prayer, Scripture, sabbath, solitude) feel like life-giving practices rather than obligations I must perform.'
      ],
      [
        'I am intentionally present with people in my neighborhood, workplace, or community in ways that reflect Christ\u2019s love.',
        'I can share the gospel naturally in conversation — it doesn\u2019t feel like a script I recite but a story I live.',
        'I understand my spiritual gifts and actively use them to serve others and strengthen my church community.',
        'I can feed and lead myself spiritually — I don\u2019t depend entirely on a pastor or program to grow.'
      ],
      [
        'I have 1\u20133 people who know my full story and walk closely with me — I am not doing the Christian life alone.',
        'My relationship with Jesus feels like abiding and remaining in Him — not just attending church or keeping up religious habits.',
        'I am growing in my ability to connect authentically with people in my small group or church community.',
        'I practice mutual accountability — I invite correction and offer it to others with grace, not judgment.'
      ],
      [
        'In the past 3 months, I can point to a specific area of my life where my behavior has genuinely changed because of my faith.',
        'My values around integrity, generosity, and service show up in decisions at work, at home, and with money — not just at church.',
        'I respond to both success and failure with gospel-grounded security rather than pride or shame.',
        'People outside the church who know me would notice something different about the way I live — my peace, generosity, or how I treat others.'
      ],
      [
        'I am currently investing intentionally in at least one person\u2019s spiritual growth — not just a friendship, but walking alongside them.',
        'The people I spend time with spiritually are growing in their own ability to apply the gospel and invest in others.',
        'I open my own life rhythms to others — not just meeting in structured settings but inviting them into my everyday life.',
        'Stories of life transformation through discipleship are a natural part of my conversations with other believers.'
      ]
    ];

    const sorted = [...scores].sort((a, b) => a.pct - b.pct);
    const low = sorted.slice(0, 2);
    const high = sorted[sorted.length - 1];

    const answersBlock = SECTIONS.map((sec, si) =>
      `${sec}:\n` + QUESTIONS[si].map((q, qi) =>
        `  "${q}" — ${answers[si][qi]}/5`
      ).join('\n')
    ).join('\n\n');

    const prompt = `You are a warm, spiritually grounded discipleship coach. ${name} has just completed a Discipleship Growth Assessment.

Their scores:
${scores.map(s => `- ${s.name}: ${s.pct}%`).join('\n')}

Their two lowest areas: ${low.map(l => `${l.name} (${l.pct}%)`).join(' and ')}
Their strongest area: ${high.name} (${high.pct}%)

Their detailed answers (1=Rarely true, 5=Very true):
${answersBlock}

Write a personal, warm 90-day growth plan for ${name} focused on their two lowest areas. Use EXACTLY these headers and format — nothing extra:

A WORD FOR YOU

[2-3 sentences of warm personal encouragement. Reference their specific strength. Speak directly to what their answers reveal about where they are. Do not be generic.]

PHASE 1 — WEEKS 1–4: [Short evocative title]
[2 sentences describing what this phase is about and why it matters for ${name} specifically.]

YOUR PRACTICES THIS PHASE:
• [Specific concrete action tied to their actual low-scoring answers — not generic advice]
• [Another specific action]
• [A third action]
• [One Scripture passage that anchors this phase]

PHASE 2 — WEEKS 5–8: [Short title]
[2 sentences.]

YOUR PRACTICES THIS PHASE:
• [Specific action]
• [Specific action]
• [Specific action]
• [One Scripture]

PHASE 3 — WEEKS 9–12: [Short title]
[2 sentences.]

YOUR PRACTICES THIS PHASE:
• [Specific action]
• [Specific action]
• [Specific action]
• [One Scripture]

ONE THING TO REMEMBER

[2 sentences. Something a wise spiritual mentor would say to ${name} specifically. Make it feel personal, not like a closing paragraph.]

Rules: warm and direct tone, spiritually grounded, base everything on their actual answer patterns, no generic advice, no extra headers, no markdown formatting.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1200,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    const plan = data.content?.[0]?.text || '';

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ plan })
    };

  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: err.message })
    };
  }
};
