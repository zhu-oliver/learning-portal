import { readFileSync } from "node:fs";
import path from "node:path";
import { runInNewContext } from "node:vm";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { describe, expect, it } from "vitest";

function soldiers() {
  const html = readFileSync(path.join(process.cwd(), "src", "games", "math-army", "index.html"), "utf8");
  const start = html.indexOf("// ---------- soldiers (instanced) ----------");
  const end = html.indexOf("// sunflower formation offsets", start);
  if (start < 0 || end < 0) throw new Error("Math Army soldier renderer not found");
  const scene = new THREE.Scene();
  return runInNewContext(`${html.slice(start, end)}\n({ armyTroops, enemyTroops })`, {
    THREE, mergeGeometries, scene, MAX_DRAW: 350,
  });
}

describe("Math Army soldier upgrades", () => {
  it("switches the whole army to distinct weapon and gear models without changing enemies", () => {
    const { armyTroops: army, enemyTroops: enemy } = soldiers();
    const rifle = army.gun.geometry;
    const enemyGun = enemy.gun.geometry;
    const weapons = new Set([rifle]);
    const gear = new Set();
    const sizes = [];
    expect(army.gear.visible).toBe(false);
    for (let tier = 1; tier <= 4; tier++) {
      army.setWeapon(tier);
      weapons.add(army.gun.geometry);
      gear.add(army.gear.geometry);
      army.gun.geometry.computeBoundingBox();
      sizes[tier] = army.gun.geometry.boundingBox.getSize(new THREE.Vector3());
      expect(army.gear.visible).toBe(true);
      expect(enemy.gun.geometry).toBe(enemyGun);
      army.begin();
      army.add(1, 0, 2, 0);
      army.add(3, 0, 4, 0);
      army.end();
      expect(army.gun.count).toBe(2);
      expect(army.gear.count).toBe(2);
      const gunMatrix = new THREE.Matrix4(), gearMatrix = new THREE.Matrix4();
      army.gun.getMatrixAt(1, gunMatrix);
      army.gear.getMatrixAt(1, gearMatrix);
      expect(gearMatrix.elements).toEqual(gunMatrix.elements);
    }
    expect(weapons.size).toBe(5);
    expect(gear.size).toBe(4);
    expect(sizes[1].x).toBeGreaterThan(sizes[2].x);
    expect(sizes[2].z).toBeGreaterThan(sizes[1].z);
    expect(sizes[3].x).toBeGreaterThan(sizes[2].x);
    army.setWeapon(0);
    expect(army.gun.geometry).toBe(rifle);
    expect(army.gear.visible).toBe(false);
    expect(enemy.gun.geometry).toBe(enemyGun);
  });
});
