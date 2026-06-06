const Groq = require('groq-sdk');
const Post = require('../models/post');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const reviewCode = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (post.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (!post.codeSnippet) {
      return res.status(400).json({ message: 'No code snippet in this post' });
    }

    // Return cached review if less than 24 hours old
    if (post.aiReview?.generatedAt) {
      const hoursSince = (new Date() - new Date(post.aiReview.generatedAt)) / (1000 * 60 * 60);
      if (hoursSince < 24) {
        return res.status(200).json({ review: post.aiReview, cached: true });
      }
    }

    const prompt = `
You are an expert ${post.codeLanguage} developer and DSA teacher.
Analyze the following ${post.codeLanguage} code and respond in exactly this JSON format (no extra text):

{
  "concept": "What DSA concept or pattern this code uses and a brief explanation",
  "issues": "Any bugs, edge cases missed, bad practices. If none, say 'No major issues found.'",
  "optimized": "Suggest a more optimized approach if possible with time complexity. If already optimal, explain why."
}

Code to analyze:
\`\`\`${post.codeLanguage}
${post.codeSnippet}
\`\`\`
    `.trim();

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 1024
    });

    const rawResponse = completion.choices[0]?.message?.content || '';

    let review;
    try {
      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
      review = JSON.parse(jsonMatch[0]);
    } catch {
      return res.status(500).json({ message: 'AI response parsing failed' });
    }

    post.aiReview = {
      concept: review.concept || '',
      issues: review.issues || '',
      optimized: review.optimized || '',
      generatedAt: new Date()
    };
    await post.save();

    res.status(200).json({ review: post.aiReview, cached: false });

  } catch (error) {
    console.error('Groq error:', error.message);
    res.status(500).json({ message: 'AI review failed', error: error.message });
  }
};

module.exports = { reviewCode };