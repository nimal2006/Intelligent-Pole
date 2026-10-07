package com.polevault.models

import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

class SensorModelsSpec extends AnyFlatSpec with Matchers {

  "SpatialZone" should "correctly classify physical coordinate bounds along 4.5m bar" in {
    SpatialZone.locateZone(0.5) shouldBe SpatialZone.LeftZone
    SpatialZone.locateZone(1.8) shouldBe SpatialZone.LeftZone
    SpatialZone.locateZone(2.25) shouldBe SpatialZone.CenterZone
    SpatialZone.locateZone(3.5) shouldBe SpatialZone.RightZone
  }

  "ContactType" should "parse string representation exhaustively with pattern matching" in {
    ContactType.fromString("POLE_CONTACT") shouldBe Some(ContactType.PoleContact)
    ContactType.fromString("BODY_CONTACT") shouldBe Some(ContactType.BodyContact)
    ContactType.fromString("CLEARANCE") shouldBe Some(ContactType.NoContact)
    ContactType.fromString("UNKNOWN") shouldBe None
  }
}
