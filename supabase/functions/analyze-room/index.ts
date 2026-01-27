import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Product {
  id: string;
  name: string;
  category: string;
  subcategory: string | null;
  price: number;
  colors: string[] | null;
  tags: string[] | null;
}

const styleDescriptions: Record<string, string> = {
  modern: 'Modern Minimal - Clean lines, neutral palette, functional design',
  scandinavian: 'Scandinavian - Light woods, cozy textures, hygge comfort',
  industrial: 'Industrial - Raw materials, exposed elements, urban edge',
  bohemian: 'Bohemian - Eclectic patterns, warm colors, layered textures',
  traditional: 'Traditional - Classic elegance, timeless details, rich materials',
  coastal: 'Coastal - Light and airy, natural textures, ocean-inspired palette',
};

const budgetRanges: Record<string, { min: number; max: number }> = {
  budget: { min: 0, max: 2000 },
  mid: { min: 2000, max: 5000 },
  luxury: { min: 5000, max: 50000 },
};

// Style mapping - which styles work well with which product categories/tags
const styleCompatibility: Record<string, string[]> = {
  modern: ['bestseller', 'new', 'ergonomic'],
  scandinavian: ['sustainable', 'bestseller'],
  industrial: ['bestseller', 'new'],
  bohemian: ['sustainable', 'new'],
  traditional: ['bestseller', 'luxury'],
  coastal: ['sustainable', 'new'],
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, style, budget } = await req.json();

    if (!imageBase64 || !style || !budget) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: imageBase64, style, budget' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Create Supabase client to fetch products
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch products from the database
    const { data: products, error: dbError } = await supabase
      .from('products')
      .select('id, name, category, subcategory, price, colors, tags')
      .eq('in_stock', true);

    if (dbError) {
      console.error('Database error fetching products:', dbError);
      throw new Error('Failed to fetch products from database');
    }

    if (!products || products.length === 0) {
      throw new Error('No products available in the database');
    }

    const budgetRange = budgetRanges[budget];
    const styleDesc = styleDescriptions[style];
    const compatibleTags = styleCompatibility[style] || ['bestseller'];

    // Create catalog description for AI
    const catalogDescription = products.map((p: Product) => 
      `- ID: ${p.id}, Name: "${p.name}", Category: ${p.category}, Subcategory: ${p.subcategory || 'N/A'}, Price: $${p.price}, Colors: ${p.colors?.join(', ') || 'Standard'}`
    ).join('\n');

    const systemPrompt = `You are a friendly, professional AI interior designer for Roomly, a furniture e-commerce platform.

Your personality:
- Warm, encouraging, and design-savvy
- Focus on comfort, aesthetics, and practicality
- Excited to collaborate with users
- Use friendly language and occasional emojis

CRITICAL RULES:
1. You can ONLY recommend products from the catalog below - never suggest products not in the list
2. Choose 3-5 products that work well together based on the room photo
3. Consider the room's existing features (windows, walls, floor, size)
4. Match the user's selected style: ${styleDesc}
5. Stay within budget range: $${budgetRange.min} - $${budgetRange.max} total
6. Explain WHY each piece works in the space
7. Use the exact product IDs from the catalog

AVAILABLE PRODUCT CATALOG:
${catalogDescription}

Respond with valid JSON in this exact format:
{
  "designNote": "A warm, personalized paragraph (2-3 sentences) about the room and your design approach. Comment on what you notice about the space.",
  "recommendations": [
    {
      "productId": "exact-uuid-from-catalog",
      "reason": "Brief explanation of why this piece works"
    }
  ],
  "styleNotes": "Additional design tips for the space (colors, layout suggestions, etc.)"
}`;

    console.log('Calling AI gateway for room analysis...');
    console.log('Style:', style, 'Budget:', budget);
    console.log('Available products:', products.length);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro',
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Please analyze this room photo and recommend furniture from the catalog that would complement the space. The user wants a ${styleDesc} style with a ${budget} budget range.`
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageBase64
                }
              }
            ]
          }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add funds to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    console.log('AI response received');

    const content = aiResponse.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('No content in AI response');
    }

    // Parse the JSON from the AI response
    let parsedResponse;
    try {
      // Extract JSON from potential markdown code blocks
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
      const jsonStr = jsonMatch[1] || content;
      parsedResponse = JSON.parse(jsonStr.trim());
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Failed to parse AI response as JSON');
    }

    // Validate and map product IDs to actual products
    const productIds = products.map((p: Product) => p.id);
    const recommendedProductIds = parsedResponse.recommendations
      .map((r: { productId: string }) => r.productId)
      .filter((id: string) => productIds.includes(id));

    console.log('Recommended product IDs:', recommendedProductIds);

    return new Response(
      JSON.stringify({
        success: true,
        designNote: parsedResponse.designNote,
        productIds: recommendedProductIds,
        styleNotes: parsedResponse.styleNotes,
        recommendations: parsedResponse.recommendations,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-room function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
        success: false 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
