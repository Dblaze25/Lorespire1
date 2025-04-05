import { pgTable, text, serial, integer, boolean, json, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// World schema
export const worlds = pgTable("worlds", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  userId: integer("user_id").notNull(),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertWorldSchema = createInsertSchema(worlds).omit({
  id: true,
  createdAt: true,
});

export type InsertWorld = z.infer<typeof insertWorldSchema>;
export type World = typeof worlds.$inferSelect;

// Region schema
export const regions = pgTable("regions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  worldId: integer("world_id").notNull(),
  imageUrl: text("image_url"),
  type: text("type"),
});

export const insertRegionSchema = createInsertSchema(regions).omit({
  id: true,
});

export type InsertRegion = z.infer<typeof insertRegionSchema>;
export type Region = typeof regions.$inferSelect;

// Location schema
export const locations = pgTable("locations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  regionId: integer("region_id").notNull(),
  imageUrl: text("image_url"),
  locationType: text("location_type"),
  x: integer("x"),
  y: integer("y"),
  markerType: text("marker_type").default("standard"),
});

export const insertLocationSchema = createInsertSchema(locations).omit({
  id: true,
});

export type InsertLocation = z.infer<typeof insertLocationSchema>;
export type Location = typeof locations.$inferSelect;

// Character/NPC schema
export const characters = pgTable("characters", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  worldId: integer("world_id").notNull(),
  regionId: integer("region_id"),
  locationId: integer("location_id"),
  description: text("description"),
  appearance: text("appearance"),
  personality: text("personality"),
  abilities: text("abilities").array(),
  imageUrl: text("image_url"),
  race: text("race"),
  characterType: text("character_type").default("npc"),
});

export const insertCharacterSchema = createInsertSchema(characters).omit({
  id: true,
});

export type InsertCharacter = z.infer<typeof insertCharacterSchema>;
export type Character = typeof characters.$inferSelect;

// Creature schema
export const creatures = pgTable("creatures", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  worldId: integer("world_id").notNull(),
  regionId: integer("region_id"),
  imageUrl: text("image_url"),
  description: text("description"),
  creatureType: text("creature_type"),
  rarity: text("rarity").default("common"),
  challengeRating: text("challenge_rating"),
  armorClass: integer("armor_class"),
  hitPoints: text("hit_points"),
  speed: text("speed"),
  abilities: json("abilities").default({}),
  specialAttacks: text("special_attacks").array(),
  elementType: text("element_type"),
});

export const insertCreatureSchema = createInsertSchema(creatures).omit({
  id: true,
});

export type InsertCreature = z.infer<typeof insertCreatureSchema>;
export type Creature = typeof creatures.$inferSelect;

// Spell schema
export const spells = pgTable("spells", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  worldId: integer("world_id").notNull(),
  level: integer("level"),
  school: text("school"),
  castingTime: text("casting_time"),
  range: text("range"),
  components: text("components"),
  duration: text("duration"),
  description: text("description"),
  imageUrl: text("image_url"),
  creatorCharacterId: integer("creator_character_id"),
});

export const insertSpellSchema = createInsertSchema(spells).omit({
  id: true,
});

export type InsertSpell = z.infer<typeof insertSpellSchema>;
export type Spell = typeof spells.$inferSelect;

// Lore schema
export const loreEntries = pgTable("lore_entries", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  worldId: integer("world_id").notNull(),
  content: text("content"),
  category: text("category"),
  imageUrl: text("image_url"),
});

export const insertLoreEntrySchema = createInsertSchema(loreEntries).omit({
  id: true,
});

export type InsertLoreEntry = z.infer<typeof insertLoreEntrySchema>;
export type LoreEntry = typeof loreEntries.$inferSelect;
