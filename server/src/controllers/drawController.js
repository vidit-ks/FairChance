const supabase = require("../config/supabaseClient");

const generateUniqueNumbers = () => {
  const numbers = new Set();
  while (numbers.size < 5) {
    const randomNum = Math.floor(Math.random() * 45) + 1;
    numbers.add(randomNum);
  }
  return Array.from(numbers).sort((a, b) => a - b);
};

// STEP A: CREATE DRAW
const createDraw = async (req, res) => {
  try {
    const { mode } = req.body; // 'random', 'algorithm', 'simulation'
    
    // In actual implementation, 'algorithm' and 'simulation' would behave differently.
    // We'll just generate the numbers first here.
    const drawNumbers = generateUniqueNumbers();

    // Fetch the previous draw to carry over the jackpot pool / rollover
    const { data: previousDraw } = await supabase
      .from("draws")
      .select("jackpot_pool, rollover_amount")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    // Base new jackpot
    const newJackpot = previousDraw ? Number(previousDraw.jackpot_pool) + Number(previousDraw.rollover_amount) : 10000;

    const { data: newDraw, error: drawError } = await supabase
      .from("draws")
      .insert([
        {
          draw_numbers: drawNumbers,
          mode: mode || "random",
          jackpot_pool: newJackpot,
          rollover_amount: 0,
        },
      ])
      .select()
      .single();

    if (drawError) throw drawError;

    res.status(201).json({
      message: "Draw generated successfully",
      draw: newDraw,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to create draw", error: error.message });
  }
};

// STEP B: PUBLISH DRAW & CALCULATE RESULTS
const publishDraw = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: draw, error: drawError } = await supabase
      .from("draws")
      .select("*")
      .eq("id", id)
      .single();

    if (drawError) throw drawError;
    if (!draw) return res.status(404).json({ message: "Draw not found" });
    if (draw.published_at) return res.status(400).json({ message: "Draw is already published" });

    // Users who are active
    const { data: activeSubs, error: subsError } = await supabase
      .from("subscriptions")
      .select("user_id")
      .eq("status", "active");

    if (subsError) throw subsError;

    const activeUserIds = activeSubs.map(sub => sub.user_id);
    const resultsToInsert = [];
    let jackpotHit = false;

    // Loop through each user and check their scores against the draw
    for (const userId of activeUserIds) {
      const { data: scores, error: scoreError } = await supabase
        .from("scores")
        .select("score")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(5);

      if (scoreError) continue;
      
      const userScores = scores.map((s) => s.score);
      const matchedNumbers = userScores.filter((num) => draw.draw_numbers.includes(num));
      const matchedCount = matchedNumbers.length;

      // Only enter result if 3, 4, or 5 matched
      if (matchedCount >= 3) {
        if (matchedCount === 5) jackpotHit = true;

        resultsToInsert.push({
          draw_id: draw.id,
          user_id: userId,
          matched_count: matchedCount,
          matched_numbers: matchedNumbers,
        });
      }
    }

    if (resultsToInsert.length > 0) {
      const { error: resultError } = await supabase
        .from("draw_results")
        .insert(resultsToInsert);

      if (resultError) throw resultError;
    }

    // Rollover logic: if no 5 matches, pool rolls over to next draw
    let updatedRolloverAmount = 0;
    if (!jackpotHit) {
        updatedRolloverAmount = Number(draw.jackpot_pool);
    }

    // Set published_at and update pool
    const { data: updatedDraw, error: updateError } = await supabase
      .from("draws")
      .update({
        published_at: new Date().toISOString(),
        rollover_amount: updatedRolloverAmount,
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError) throw updateError;

    res.status(200).json({
      message: "Draw published and results calculated",
      draw: updatedDraw,
      total_winners: resultsToInsert.length
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to publish draw", error: error.message });
  }
};

const getLatestDraw = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("draws")
      .select("*")
      .not("published_at", "is", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    res.json(data || null);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch latest draw", error: error.message });
  }
};

const getLatestResults = async (req, res) => {
  try {
    const { data: latestDraw, error: drawError } = await supabase
      .from("draws")
      .select("*")
      .not("published_at", "is", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (drawError) throw drawError;
    if (!latestDraw) return res.json([]);

    const { data, error } = await supabase
      .from("draw_results")
      .select(`
        *,
        users (
          id,
          name,
          email
        )
      `)
      .eq("draw_id", latestDraw.id)
      .order("matched_count", { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch results", error: error.message });
  }
};

module.exports = { createDraw, publishDraw, getLatestDraw, getLatestResults };