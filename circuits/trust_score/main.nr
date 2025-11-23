fn main(userScore: Field, minScore: Field) -> pub Field {
    // Noir best practice: constrain boolean outputs explicitly so the verifier can trust the value.
    let mut is_valid: Field = 0;

    if userScore >= minScore {
        is_valid = 1;
    }

    // Ensure the public output is boolean (0 or 1)
    constrain is_valid * (is_valid - 1) == 0;

    return is_valid;
}
