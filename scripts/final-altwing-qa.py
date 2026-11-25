from pathlib import Path
import sys
import subprocess


checks = [
    (
        Path(
            "src/features/wingmatch/engine/wingmatchV5.ts"
        ),
        "V5_CHOICE_MISSIONS",
        "WingMatch V5",
    ),

    (
        Path(
            "src/features/wingmatch/result/WingMascot.tsx"
        ),
        "wing-mascot",
        "Wing mascots",
    ),

    (
        Path(
            "src/features/wingmatch/result/WingMatchResult.tsx"
        ),
        "WHAT YOU COULD HAVE",
        "Wing landscape",
    ),

    (
        Path(
            "src/features/wingmatch/opportunities/OpportunityRadar.tsx"
        ),
        "YOUR STATE",
        "State opportunity selector",
    ),

    (
        Path(
            "src/features/wingmatch/build/BuildWing.tsx"
        ),
        "PROJECT OWNERSHIP",
        "Project ownership",
    ),

    (
        Path(
            "src/features/wingmatch/build/BuildWing.tsx"
        ),
        "VERSION HISTORY",
        "Version history",
    ),

    (
        Path(
            "src/features/wingmatch/build/ProjectPortfolio.tsx"
        ),
        "PROJECT EVIDENCE",
        "Evidence portfolio",
    ),

]


failed = []


print("")
print(
    "===== ALTWING FINAL QA ====="
)


for path, phrase, label in checks:

    if not path.exists():
        print(
            f"✗ {label}: file missing"
        )

        failed.append(
            label
        )

        continue


    text = path.read_text()


    if phrase not in text:
        print(
            f"✗ {label}: expected marker missing"
        )

        failed.append(
            label
        )

    else:
        print(
            f"✓ {label}"
        )


print("")

# The old pack title and decorative account-lock marker described a different
# layout. Test the current real reward transactions and rendered states instead.
# This does not add, certify, or pretend to protect a nonexistent leaderboard.
reward_check = subprocess.run(["node", "scripts/check-legacy-rewards.mjs"], check=False)
if reward_check.returncode != 0:
    failed.append("Current universe reward behavior / honest product boundary")


if failed:

    print(
        "FINAL QA FAILED:"
    )

    for item in failed:
        print(
            f"- {item}"
        )

    sys.exit(1)


print(
    "PASS: retained legacy systems and current universe reward behavior; no competitive leaderboard is offered. Browser QA remains separate."
)
