fn main(score: Field, minScore: Field) -> pub Field {
    let is_valid: Field = if score >= minScore { 1 } else { 0 };
    constrain is_valid == 0 || is_valid == 1;
    is_valid
}
