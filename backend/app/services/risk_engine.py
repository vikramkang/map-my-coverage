from typing import Any, Dict


def evaluate(context: Dict[str, Any]) -> Dict[str, Any]:
    """
    context example (we'll build this from your stored answers):
    {
        "age": 32,
        "province": "ON",
        "income": 90000,
        "dependants": 2,
        "has_vehicle": True,
        "liability_limit": 1000000,
        "owns_home": True,
        "rents": False,
        "has_mortgage": True,
        "travels_outside_canada": True,
        ...
    }
    """

    # Defaults with safe fallbacks
    age = int(context.get("age", 0) or 0)
    income = float(context.get("income", 0) or 0)
    dependants = int(context.get("dependants", 0) or 0)
    province = context.get("province", "ON")
    has_vehicle = bool(context.get("has_vehicle", False))
    liability_limit = float(context.get("liability_limit", 0) or 0)
    owns_home = bool(context.get("owns_home", False))
    rents = bool(context.get("rents", False))
    has_mortgage = bool(context.get("has_mortgage", False))
    travels_outside_canada = bool(context.get("travels_outside_canada", False))
    has_existing_life = bool(context.get("has_existing_life", False))

    # --- Life insurance score & recommendations ---
    life_score = 0
    life_recos = []

    if dependants > 0 and income > 0:
        life_score += 30
        rec_coverage = int(income * 10)  # 10x income rule of thumb
        life_recos.append(
            {
                "title": "Consider term life insurance",
                "detail": (
                    f"Based on your income of ${income:,.0f} and {dependants} dependant(s), "
                    f"a starting point could be around ${rec_coverage:,.0f} in term life coverage."
                ),
                "priority": 1,
            }
        )

    if has_mortgage:
        life_score += 20
        life_recos.append(
            {
                "title": "Protect your mortgage",
                "detail": "You indicated that you have a mortgage; term life coverage that at least "
                          "covers your outstanding mortgage can help protect your family home.",
                "priority": 2,
            }
        )

    if not has_existing_life and (dependants > 0 or has_mortgage):
        life_recos.append(
            {
                "title": "No existing life insurance detected",
                "detail": "Since you reported no existing life insurance but have dependants or a mortgage, "
                          "it may be worth prioritizing life coverage.",
                "priority": 0,
            }
        )
        life_score += 10

    # Cap score
    life_score = min(life_score, 100)

    # --- Auto insurance (Ontario) ---
    auto_score = 0
    auto_recos = []

    if has_vehicle:
        auto_score += 30
        if province == "ON":
            auto_recos.append(
                {
                    "title": "Mandatory Ontario auto coverage",
                    "detail": "In Ontario, auto insurance is mandatory. Ensure you have at least the required "
                              "third-party liability, accident benefits, uninsured automobile, and DCPD coverage.",
                    "priority": 0,
                }
            )

        if liability_limit and liability_limit < 2_000_000:
            auto_score += 20
            auto_recos.append(
                {
                    "title": "Increase liability limit",
                    "detail": "Your current liability limit appears below $2,000,000. Many Ontario drivers choose "
                              "a $2M limit to better protect against large claims.",
                    "priority": 1,
                }
            )

    auto_score = min(auto_score, 100)

    # --- Home / Tenant ---
    home_score = 0
    home_recos = []

    if owns_home:
        home_score += 30
        home_recos.append(
            {
                "title": "Home insurance review",
                "detail": "As a homeowner, make sure your policy reflects replacement cost and any upgrades "
                          "(finished basement, renovations, etc.).",
                "priority": 0,
            }
        )

    if rents and not owns_home:
        home_score += 20
        home_recos.append(
            {
                "title": "Consider tenant insurance",
                "detail": "Tenant insurance can protect your belongings and provide liability coverage, "
                          "even if you don’t own the property.",
                "priority": 0,
            }
        )

    home_score = min(home_score, 100)

    # --- Travel insurance ---
    travel_score = 0
    travel_recos = []

    if travels_outside_canada:
        travel_score += 30
        travel_recos.append(
            {
                "title": "Out-of-country medical coverage",
                "detail": "You mentioned travelling outside Canada. Provincial health plans generally don’t cover "
                          "most emergency medical costs abroad; travel medical insurance can help cover this gap.",
                "priority": 0,
            }
        )

    travel_score = min(travel_score, 100)

    # --- Overall score ---
    categories = {
        "life": {"score": life_score, "recommendations": life_recos},
        "auto": {"score": auto_score, "recommendations": auto_recos},
        "home": {"score": home_score, "recommendations": home_recos},
        "travel": {"score": travel_score, "recommendations": travel_recos},
    }

    # Overall is just a simple average of non-zero categories
    non_zero_scores = [c["score"] for c in categories.values() if c["score"] > 0]
    overall = int(sum(non_zero_scores) / len(non_zero_scores)) if non_zero_scores else 0

    return {
        "overall_risk_score": overall,
        "categories": categories,
    }
