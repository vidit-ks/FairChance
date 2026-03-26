const supabase = require("../config/supabaseClient");

const generateUniqueNumbers = () => {
  const numbers = new Set();
  while (numbers.size < 5) {
    const randomNum = Math.floor(Math.random() * 45) + 1;
    numbers.add(randomNum);
  }
  return Array.from(numbers).sort((a, b) => a - b);
};

const generateAlgorithmicNumbers = async () => {
  // Fetch all recent user scores to weigh frequency
  const { data: allScores } = await supabase.from("scores").select("score");
  
  if (!allScores || allScores.length === 0) {
    return generateUniqueNumbers(); // Fallback if no data
  }

  const frequency = {};
  for (let i = 1; i <= 45; i++) frequency[i] = 0;
  
  allScores.forEach(s => {
    if (frequency[s.score] !== undefined) frequency[s.score]++;
  });

  const sortedNumbers = Object.keys(frequency).sort((a, b) => frequency[b] - frequency[a]);
  
  // Pick 3 most frequent, 2 least frequent (with at least 0 frequency if unplayed)
  const mostFrequent = sortedNumbers.slice(0, 3).map(Number);
  
  // For least frequent, we want to look at the bottom of the list, 
  // ensuring we don't pick overlap with mostFrequent
  const remaining = sortedNumbers.map(Number).filter(n => !mostFrequent.includes(n));
  const leastFrequent = remaining.slice(-2);

  const finalNumbers = [...mostFrequent, ...leastFrequent];
  return finalNumbers.sort((a, b) => a - b);
};

// STEP A: CREATE DRAW
const createDraw = async (req, res) => {
  try {
    const { mode } = req.body; 
    
    let drawNumbers = [];
    if (mode === 'algorithm') {
      drawNumbers = await generateAlgorithmicNumbers();
    } else {
      drawNumbers = generateUniqueNumbers();
    }

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

const simulateDraw = async (req, res) => {
  try {
    const { mode = 'random' } = req.body;
    let drawNumbers = [];

    if (mode === 'algorithm') {
      drawNumbers = await generateAlgorithmicNumbers();
    } else {
      drawNumbers = generateUniqueNumbers();
    }

    const { data: activeSubs } = await supabase.from("subscriptions").select("user_id").eq("status", "active");
    const activeUserIds = activeSubs ? activeSubs.map(sub => sub.user_id) : [];

    let matchStats = { 5: 0, 4: 0, 3: 0 };
    let totalWinners = 0;

    for (const userId of activeUserIds) {
      const { data: scores } = await supabase.from("scores").select("score").eq("user_id", userId).order("created_at", { ascending: false }).limit(5);
      if (!scores) continue;
      
      const userScores = scores.map((s) => s.score);
      const matchedNumbers = userScores.filter((num) => drawNumbers.includes(num));
      
      if (matchedNumbers.length >= 3) {
        matchStats[matchedNumbers.length]++;
        totalWinners++;
      }
    }

    res.status(200).json({
      predicted_numbers: drawNumbers,
      mode_used: mode,
      total_winners: totalWinners,
      match_distribution: matchStats,
      jackpot_hit: matchStats[5] > 0
    });

  } catch (error) {
    res.status(500).json({ message: "Simulation failed", error: error.message });
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

const editDrawPool = async (req, res) => {
  try {
    const { id } = req.params;
    const { new_pool } = req.body;
    
    if (isNaN(new_pool) || new_pool < 0) {
      return res.status(400).json({ message: "Invalid pool amount" });
    }

    const { data: draw, error } = await supabase
      .from("draws")
      .update({ jackpot_pool: Number(new_pool) })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    res.status(200).json({ message: "Pool updated successfully", draw });
  } catch (error) {
    res.status(500).json({ message: "Failed to update pool", error: error.message });
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

const getParticipationSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    // 1. Get total past draws where user had an entry
    const { data: results, error: resError } = await supabase
      .from("draw_results")
      .select("id")
      .eq("user_id", userId);
      
    // 2. Next upcoming draw logic: if user is active, it's roughly 1 month from last draw
    const { data: latestDraw } = await supabase
      .from("draws")
      .select("created_at")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    let upcoming = "Pending active subscription";
    const { data: sub } = await supabase.from("subscriptions").select("status").eq("user_id", userId).eq("status", "active").maybeSingle();
    
    if (sub && sub.status === 'active' && latestDraw) {
      const nextDate = new Date(latestDraw.created_at);
      nextDate.setMonth(nextDate.getMonth() + 1);
      upcoming = nextDate.toLocaleDateString();
    }

    res.json({
      entered: results?.length || 0,
      upcoming: upcoming
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to get participation", error: error.message });
  }
};

module.exports = { createDraw, publishDraw, getLatestDraw, getLatestResults, simulateDraw, getParticipationSummary, editDrawPool };