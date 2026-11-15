import {
  useEffect,
  useState,
} from "react";

import "./saved-wing-home-card-v2.css";


interface Props {
  onStartPath: () => void;
  onOpenUniverse: () => void;
  onRetake: () => void;
}


interface SavedWing {
  id: string;
  name?: string;
  short?: string;
}


const WING_NAMES:
  Record<
    string,
    {
      name: string;
      short: string;
      description: string;
    }
  > = {

  gnc: {
    name:
      "Guidance, Navigation & Control",
    short:
      "GNC",
    description:
      "Navigation, trajectories, sensors, and spacecraft control.",
  },

  avionics: {
    name:
      "Avionics",
    short:
      "AVIONICS",
    description:
      "Sensors, electronics, software signals, telemetry, and spacecraft diagnostics.",
  },

  structures: {
    name:
      "Structures",
    short:
      "STRUCTURES",
    description:
      "Loads, materials, mechanisms, mass, and spacecraft survival.",
  },

  thermal: {
    name:
      "Thermal Engineering",
    short:
      "THERMAL",
    description:
      "Heat transfer, temperature limits, cooling, and spacecraft survival.",
  },

  propulsion: {
    name:
      "Propulsion Engineering",
    short:
      "PROPULSION",
    description:
      "Thrust, fuel, efficiency, engines, and how spacecraft move.",
  },

  "mission-design": {
    name:
      "Mission Design",
    short:
      "MISSION DESIGN",
    description:
      "Objectives, resources, risk, trade studies, and whole-mission decisions.",
  },
};


function readWing():
  SavedWing | null {

  try {

    const raw =
      localStorage.getItem(
        "altwing-selected-wing-v1",
      );


    if (raw) {

      const parsed =
        JSON.parse(
          raw,
        ) as SavedWing;


      if (
        parsed &&
        typeof parsed.id ===
          "string"
      ) {
        return parsed;
      }
    }


    const legacy =
      localStorage.getItem(
        "altwing-selected-wing",
      );


    if (legacy) {
      return {
        id:
          legacy,
      };
    }

  } catch {
    return null;
  }


  return null;
}


function SavedWingHomeCard({
  onStartPath,
  onOpenUniverse,
  onRetake,
}: Props) {

  const [
    wing,
    setWing,
  ] =
    useState<SavedWing | null>(
      () =>
        readWing(),
    );


  useEffect(
    () => {

      const refresh =
        () =>
          setWing(
            readWing(),
          );


      window.addEventListener(
        "altwing:selected-wing",
        refresh,
      );


      return () =>
        window.removeEventListener(
          "altwing:selected-wing",
          refresh,
        );

    },
    [],
  );


  if (!wing) {
    return null;
  }


  const profile =
    WING_NAMES[
      wing.id
    ] ?? {
      name:
        wing.name ??
        wing.id,

      short:
        wing.short ??
        wing.id
          .toUpperCase(),

      description:
        "A direction worth testing through real engineering work.",
    };


  return (
    <section
      className="swhc-shell"
      data-wing={
        wing.id
      }
    >

      <div className="swhc-inner">

        <div className="swhc-mascot">

          <div className="swhc-orbit" />

          <img
            src="/brand/altwing-penguin.png"
            alt=""
          />

          <span>
            {profile.short}
          </span>

        </div>


        <div className="swhc-copy">

          <span className="swhc-kicker">
            WINGMATCH COMPLETE
          </span>

          <small>
            YOUR WING IS UNLOCKED
          </small>

          <h2>
            {profile.name}
          </h2>

          <p>
            {profile.description}
          </p>


          <div className="swhc-signal">

            <i />

            <span>
              YOUR CURRENT WING
            </span>

            <strong>
              {profile.short}
            </strong>

          </div>


          <div className="swhc-path-promise">

            <strong>
              Now test the work.
            </strong>

            <span>
              Build skills · Create proof ·
              Earn Cosmic rewards · Unlock
              your certificate
            </span>

          </div>

        </div>


        <div className="swhc-actions">

          <button
            type="button"
            className="swhc-primary"
            onClick={
              onStartPath
            }
          >
            <span>
              START MY {profile.short} PATH
            </span>

            <b>→</b>
          </button>


          <button
            type="button"
            className="swhc-secondary"
            onClick={
              onOpenUniverse
            }
          >
            OPEN MY UNIVERSE
          </button>


          <button
            type="button"
            className="swhc-retake"
            onClick={
              onRetake
            }
          >
            Retake WingMatch
          </button>

        </div>

      </div>

    </section>
  );
}


export default SavedWingHomeCard;
