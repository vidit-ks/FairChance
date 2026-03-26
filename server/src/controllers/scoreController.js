const supabase = require("../config/supabaseClient");

const addScore = async (req, res) => {
  try {
    const userId = req.user.id;
    const { score, played_at } = req.body;

    if (score === undefined || score === null) {
      return res.status(400).json({ message: "Score is required" });
    }

    const numericScore = Number(score);
    if (numericScore < 1 || numericScore > 45 || isNaN(numericScore)) {
      return res.status(400).json({ message: "Score must be between 1 and 45" });
    }

    let playedAt;
    try {
      playedAt = played_at ? new Date(played_at).toISOString() : new Date().toISOString();
    } catch (e) {
      playedAt = new Date().toISOString();
    }

    const { error: insertError } = await supabase.from("scores").insert([
      {
        user_id: userId,
        score: numericScore,
        played_at: playedAt,
      },
    ]);

    if (insertError) throw insertError;

    // Enforce 5 scores max
    const { data: allScores, error: fetchError } = await supabase
      .from("scores")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (fetchError) throw fetchError;

    if (allScores.length > 5) {
      const scoresToDelete = allScores.slice(5);
      const idsToDelete = scoresToDelete.map((item) => item.id);

      const { error: deleteError } = await supabase
        .from("scores")
        .delete()
        .in("id", idsToDelete);

      if (deleteError) throw deleteError;
    }

    const { data: finalScores } = await supabase
      .from("scores")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

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
    const userId = req.user.id;
    const { data, error } = await supabase
      .from("scores")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch scores", error: error.message });
  }
};

const editScore = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { score } = req.body;

    const numericScore = Number(score);
    if (numericScore < 1 || numericScore > 45 || isNaN(numericScore)) {
      return res.status(400).json({ message: "Score must be between 1 and 45" });
    }

    // Verify ownership or admin
    const { data: existing } = await supabase.from("scores").select("user_id").eq("id", id).single();
    if (!existing) return res.status(404).json({ message: "Score not found" });
    if (existing.user_id !== userId && req.user.role !== "admin") return res.status(403).json({ message: "Access denied" });

    const { data: updated, error } = await supabase
      .from("scores")
      .update({ score: numericScore })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({ message: "Score updated successfully", score: updated });
  } catch (error) {
    res.status(500).json({ message: "Failed to edit score", error: error.message });
  }
};

const deleteScore = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Verify ownership or admin
    const { data: existing } = await supabase.from("scores").select("user_id").eq("id", id).single();
    if (!existing) return res.status(404).json({ message: "Score not found" });
    if (existing.user_id !== userId && req.user.role !== "admin") return res.status(403).json({ message: "Access denied" });

    const { error } = await supabase.from("scores").delete().eq("id", id);
    if (error) throw error;

    res.status(200).json({ message: "Score deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete score", error: error.message });
  }
};

const getAllScores = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("scores")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch all scores", error: error.message });
  }
};

module.exports = { addScore, getScores, editScore, deleteScore, getAllScores };