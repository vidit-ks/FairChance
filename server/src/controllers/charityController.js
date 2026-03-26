const supabase = require("../config/supabaseClient");

const getCharities = async (req, res) => {
  try {
    const { search, featured } = req.query;

    let query = supabase.from("charities").select("*");

    if (search) {
      query = query.ilike("name", `%${search}%`);
    }

    if (featured === "true") {
      query = query.eq("is_featured", true);
    }

    const { data, error } = await query;

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch charities", error: error.message });
  }
};

const updateCharity = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, is_featured, min_percentage, description, image_url } = req.body;

    const { data, error } = await supabase
      .from("charities")
      .update({
        name,
        is_featured,
        min_percentage,
        description,
        image_url
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    res.status(200).json({ message: "Charity updated successfully", charity: data });
  } catch (error) {
    res.status(500).json({ message: "Failed to update charity", error: error.message });
  }
};

const selectCharity = async (req, res) => {
  try {
    // using req.user.id for security
    const userId = req.user.id;
    const { charityId } = req.body;

    const { error } = await supabase
      .from("users")
      .update({ charity_id: charityId })
      .eq("id", userId);

    if (error) throw error;
    res.status(200).json({ message: "Charity selected successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to select charity", error: error.message });
  }
};

const getSelectedCharity = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from("users")
      .select(`
        charity_id,
        charities (
          id,
          name,
          description,
          is_featured,
          min_percentage,
          image_url
        )
      `)
      .eq("id", userId)
      .single();

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch selected charity", error: error.message });
  }
};

module.exports = { getCharities, updateCharity, selectCharity, getSelectedCharity };