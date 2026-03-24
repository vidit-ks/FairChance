const supabase = require("../config/supabaseClient");

const addScore = async (req, res) => {
  try {
    const { userId, score, played_at } = req.body;

    if (!userId || !score || !played_at) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const numericScore = Number(score);

    if (numericScore < 1 || numericScore > 45) {
      return res.status(400).json({ message: "Score must be between 1 and 45" });
    }

    const { error: insertError } = await supabase.from("scores").insert([
      {
        user_id: userId,
        score: numericScore,
        played_at,
      },
    ]);

    if (insertError) {
      return res.status(500).json({ message: "Failed to add score", error: insertError.message });
    }

    const { data: allScores, error: fetchError } = await supabase
      .from("scores")
      .select("*")
      .eq("user_id", userId)
      .order("played_at", { ascending: false })
      .order("created_at", { ascending: false });

    if (fetchError) {
      return res.status(500).json({ message: "Failed to fetch scores", error: fetchError.message });
    }

    if (allScores.length > 5) {
      const scoresToDelete = allScores.slice(5);

      const idsToDelete = scoresToDelete.map((item) => item.id);

      const { error: deleteError } = await supabase
        .from("scores")
        .delete()
        .in("id", idsToDelete);

      if (deleteError) {
        return res.status(500).json({ message: "Failed trimming old scores", error: deleteError.message });
      }
    }

    const { data: finalScores, error: finalFetchError } = await supabase
      .from("scores")
      .select("*")
      .eq("user_id", userId)
      .order("played_at", { ascending: false })
      .order("created_at", { ascending: false });

    if (finalFetchError) {
      return res.status(500).json({ message: "Failed to fetch final scores", error: finalFetchError.message });
    }

    res.status(201).json({
      message: "Score added successfully",
      scores: finalScores,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to add score", error: error.message });
  }
};

const getScores = async (req, res) => {
  try {
    const { userId } = req.params;

    const { data, error } = await supabase
      .from("scores")
      .select("*")
      .eq("user_id", userId)
      .order("played_at", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(500).json({ message: "Failed to fetch scores", error: error.message });
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch scores", error: error.message });
  }
};

module.exports = { addScore, getScores };