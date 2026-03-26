const supabase = require("../config/supabaseClient");

const uploadProof = async (req, res) => {
  try {
    const userId = req.user.id;
    const { draw_result_id, proof_url } = req.body;

    if (!draw_result_id || !proof_url) {
      return res.status(400).json({ message: "draw_result_id and proof_url are required" });
    }

    // Verify ownership of the draw result
    const { data: drawResult, error: findError } = await supabase
      .from("draw_results")
      .select("*")
      .eq("id", draw_result_id)
      .eq("user_id", userId)
      .single();

    if (findError || !drawResult) {
      return res.status(403).json({ message: "Invalid draw result or access denied" });
    }

    // Check if proof already uploaded
    const { data: existingProof } = await supabase
      .from("winners")
      .select("id")
      .eq("draw_result_id", draw_result_id)
      .maybeSingle();

    if (existingProof) {
      return res.status(400).json({ message: "Proof already uploaded for this record" });
    }

    // Insert into winners table
    const { data: winnerRecord, error: insertError } = await supabase
      .from("winners")
      .insert([{
        draw_id: drawResult.draw_id,
        user_id: userId,
        draw_result_id: draw_result_id,
        proof_url,
        verification_status: "pending"
      }])
      .select()
      .single();

    if (insertError) throw insertError;

    res.status(201).json({ message: "Proof uploaded successfully", proof: winnerRecord });
  } catch (error) {
    res.status(500).json({ message: "Failed to upload proof", error: error.message });
  }
};

const verifyProof = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejection_reason } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Status must be 'approved' or 'rejected'" });
    }

    let updateData = { verification_status: status };
    
    if (status === "approved") {
      updateData.paid_at = new Date().toISOString();
      updateData.rejection_reason = null; // Clear if previously rejected
    } else if (status === "rejected") {
      updateData.rejection_reason = rejection_reason || "Verification failed";
      updateData.paid_at = null;
    }

    const { data: updatedRecord, error: updateError } = await supabase
      .from("winners")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (updateError) throw updateError;

    res.status(200).json({ message: `Proof status updated to ${status}`, record: updatedRecord });
  } catch (error) {
    res.status(500).json({ message: "Failed to update proof status", error: error.message });
  }
};

const getAllProofs = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("winners")
      .select(`
        *,
        users (id, name, email),
        draws (mode, jackpot_pool)
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch proofs", error: error.message });
  }
};

module.exports = {
  uploadProof,
  verifyProof,
  getAllProofs
};
