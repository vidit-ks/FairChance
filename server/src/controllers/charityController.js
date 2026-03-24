const supabase = require("../config/supabaseClient");

const getCharities = async (req, res) => {
  const { data, error } = await supabase.from("charities").select("*");

  if (error) {
    return res.status(500).json({ message: error.message });
  }

  res.json(data);
};

const selectCharity = async (req, res) => {
  const { userId, charityId } = req.body;

  const { error } = await supabase
    .from("users")
    .update({ charity_id: charityId })
    .eq("id", userId);

  if (error) {
    return res.status(500).json({ message: error.message });
  }

  res.json({ message: "Charity selected successfully" });
};

const getSelectedCharity = async (req, res) => {
  const { userId } = req.params;

  const { data, error } = await supabase
    .from("users")
    .select(`
      charity_id,
      charities (
        id,
        name,
        description
      )
    `)
    .eq("id", userId)
    .single();

  if (error) {
    return res.status(500).json({ message: error.message });
  }

  res.json(data);
};

module.exports = { getCharities, selectCharity, getSelectedCharity };