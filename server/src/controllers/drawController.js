const supabase = require("../config/supabaseClient");

const generateUniqueNumbers = () => {
  const numbers = new Set();

  while (numbers.size < 5) {
    const randomNum = Math.floor(Math.random() * 45) + 1;
    numbers.add(randomNum);
  }

  return Array.from(numbers).sort((a, b) => a - b);
};

const runDraw = async (req, res) => {
  try {
    const drawNumbers = generateUniqueNumbers();

    const { data: draw, error: drawError } = await supabase
      .from("draws")
      .insert([
        {
          draw_numbers: drawNumbers,
          status: "published",
        },
      ])
      .select()
      .single();

    if (drawError) {
      return res.status(500).json({ message: drawError.message });
    }

    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("id");

    if (usersError) {
      return res.status(500).json({ message: usersError.message });
    }

    const resultsToInsert = [];

    for (const user of users) {
      const { data: scores, error: scoreError } = await supabase
        .from("scores")
        .select("score")
        .eq("user_id", user.id)
        .order("played_at", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(5);

      if (scoreError) {
        return res.status(500).json({ message: scoreError.message });
      }

      const userScores = scores.map((s) => s.score);
      const matchedNumbers = userScores.filter((num) => drawNumbers.includes(num));
      const matchedCount = matchedNumbers.length;

      resultsToInsert.push({
        draw_id: draw.id,
        user_id: user.id,
        matched_count: matchedCount,
        matched_numbers: matchedNumbers,
      });
    }

    if (resultsToInsert.length > 0) {
      const { error: resultError } = await supabase
        .from("draw_results")
        .insert(resultsToInsert);

      if (resultError) {
        return res.status(500).json({ message: resultError.message });
      }
    }

    res.status(201).json({
      message: "Draw created and results generated",
      draw,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to run draw", error: error.message });
  }
};

const getLatestDraw = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("draws")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      return res.status(500).json({ message: error.message });
    }

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
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (drawError) {
      return res.status(500).json({ message: drawError.message });
    }

    if (!latestDraw) {
      return res.json([]);
    }

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

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch results", error: error.message });
  }
};

module.exports = { runDraw, getLatestDraw, getLatestResults };