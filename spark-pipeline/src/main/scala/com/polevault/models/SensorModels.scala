package com.polevault.models

import java.sql.Timestamp
import scala.util.Try

/**
 * ============================================================================
 * SCALA FUNDAMENTALS: DOMAIN MODELING & FUNCTIONAL PROGRAMMING
 * ============================================================================
 * Demonstrates core Scala concepts:
 * 1. Case Classes (immutability, auto equals/hashCode, toString, copy)
 * 2. Sealed Traits & Algebraic Data Types (ADTs) for exhaustive pattern matching
 * 3. Pattern Matching with guards and extractors
 * 4. Companion Objects with factory constructors
 * 5. Functional combinators (map, filter, foldLeft)
 * 6. Resilient parsing via Option and Try
 */

// ----------------------------------------------------------------------------
// 1. Sealed Traits / ADTs for Contact Classification & Location
// ----------------------------------------------------------------------------
sealed trait ContactType {
  def code: String
  def isInterference: Boolean
}

object ContactType {
  case object NoContact extends ContactType {
    val code = "NO_CONTACT"
    val isInterference = false
  }
  case object PoleContact extends ContactType {
    val code = "POLE_CONTACT"
    val isInterference = true
  }
  case object BodyContact extends ContactType {
    val code = "BODY_CONTACT"
    val isInterference = true
  }
  case object OtherContact extends ContactType {
    val code = "OTHER_CONTACT"
    val isInterference = true
  }

  // Exhaustive pattern matching constructor
  def fromString(str: String): Option[ContactType] = str.toUpperCase match {
    case "NO_CONTACT" | "CLEARANCE" => Some(NoContact)
    case "POLE_CONTACT" | "POLE"    => Some(PoleContact)
    case "BODY_CONTACT" | "BODY"    => Some(BodyContact)
    case "OTHER_CONTACT" | "OTHER"  => Some(OtherContact)
    case _                          => None
  }
}

sealed trait SpatialZone {
  def name: String
  def minXMeters: Double
  def maxXMeters: Double
}

object SpatialZone {
  case object LeftZone extends SpatialZone {
    val name = "LEFT"
    val minXMeters = 0.0
    val maxXMeters = 1.875
  }
  case object CenterZone extends SpatialZone {
    val name = "CENTER"
    val minXMeters = 1.875
    val maxXMeters = 2.625
  }
  case object RightZone extends SpatialZone {
    val name = "RIGHT"
    val minXMeters = 2.625
    val maxXMeters = 4.500
  }

  // Scala Pattern Matching with Guard Conditions
  def locateZone(xPos: Double): SpatialZone = xPos match {
    case x if x < 1.875 => LeftZone
    case x if x <= 2.625 => CenterZone
    case _               => RightZone
  }
}

// ----------------------------------------------------------------------------
// 2. Immutable Case Classes for 1,000 Hz Telemetry & Windows
// ----------------------------------------------------------------------------
case class RawSensorSample(
  timestamp: Timestamp,
  sampleIndex: Long,
  p1: Double,       // Piezo 1 @ 1.125m (Volts)
  sg1: Double,      // Strain Gauge 1 @ 1.650m (Microstrain)
  p2: Double,       // Piezo 2 @ 2.250m (Volts)
  sg2: Double,      // Strain Gauge 2 @ 2.850m (Microstrain)
  p3: Double,       // Piezo 3 @ 3.375m (Volts)
  imuAx: Double,    // Accel X (m/s^2)
  imuAy: Double,    // Accel Y (m/s^2)
  imuAz: Double,    // Accel Z (m/s^2)
  imuGx: Double,    // Gyro X (deg/s)
  imuGy: Double,    // Gyro Y (deg/s)
  imuGz: Double     // Gyro Z (deg/s)
) {
  // Functional helper: computes composite acceleration magnitude
  def totalAcceleration: Double =
    math.sqrt(imuAx * imuAx + imuAy * imuAy + imuAz * imuAz)

  // Functional helper: computes composite gyro magnitude
  def totalAngularVelocity: Double =
    math.sqrt(imuGx * imuGx + imuGy * imuGy + imuGz * imuGz)
}

object RawSensorSample {
  // Parsing helper using Scala Try for safe extraction
  def parseCsvLine(line: String): Option[RawSensorSample] = {
    Try {
      val parts = line.split(",").map(_.trim)
      RawSensorSample(
        timestamp = Timestamp.valueOf(parts(0)),
        sampleIndex = parts(1).toLong,
        p1 = parts(2).toDouble,
        sg1 = parts(3).toDouble,
        p2 = parts(4).toDouble,
        sg2 = parts(5).toDouble,
        p3 = parts(6).toDouble,
        imuAx = parts(7).toDouble,
        imuAy = parts(8).toDouble,
        imuAz = parts(9).toDouble,
        imuGx = parts(10).toDouble,
        imuGy = parts(11).toDouble,
        imuGz = parts(12).toDouble
      )
    }.toOption
  }
}

// Aggregated Feature Vector extracted over a window
case class WindowedFeatureVector(
  windowStart: Timestamp,
  windowEnd: Timestamp,
  p1Peak: Double,
  sg1Peak: Double,
  p2Peak: Double,
  sg2Peak: Double,
  p3Peak: Double,
  maxAccel: Double,
  maxGyro: Double,
  rmsEnergy: Double,
  dominantFreqHz: Double,
  durationMs: Double,
  estimatedXMeters: Double,
  zone: SpatialZone
)

// Classification Output Record
case class AttemptEvaluation(
  attemptId: Long,
  timestamp: Timestamp,
  isSuccess: Boolean,
  contactType: ContactType,
  location: SpatialZone,
  estimatedXMeters: Double,
  confidence: Double,
  featureVector: WindowedFeatureVector
) {
  // Pattern matching on classification state
  def feedbackMessage: String = (contactType, location) match {
    case (ContactType.NoContact, _) =>
      "Clean execution! Optimal trajectory and bar clearance."
    case (ContactType.PoleContact, SpatialZone.CenterZone) =>
      "Pole caught crossbar near center. Push pole forward earlier during extension."
    case (ContactType.BodyContact, SpatialZone.LeftZone) =>
      "Torso/hip contact on left sector. Approach angle drifting left towards peg."
    case (ContactType.BodyContact, _) =>
      "Body contact during bar clearance. Work on clearance tuck and arch timing."
    case (ContactType.OtherContact, _) =>
      "Low-frequency disturbance or glancing contact detected."
  }
}
