fn main(score: u32, minScore: u32) -> pub Field {
    let is_valid: Field = if score >= minScore { 1 } else { 0 };
    is_valid
}
