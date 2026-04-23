import { useState, useMemo, useEffect, useCallback } from "react";
import { Plus, TreePine, Calendar, TrendingUp, Droplets, Scissors, Leaf, RotateCcw, Trash2, Edit3, ChevronDown, ChevronUp, X, Check, AlertCircle, Clock, Sun, CloudRain, Download, Upload } from "lucide-react";

const SPECIES_PRESETS = [
  "Deshojo Maple", "Japanese Maple", "Blue Carpet Juniper", "Stricta Juniper",
  "Juniper", "Spruce", "Cotoneaster", "Azalea", "Grape", "Honeysuckle",
  "Cherry Blossom", "Flowering Cherry", "Blackthorn", "Buxus",
  "Ficus", "Chinese Elm", "Pine (Black)", "Pine (White)",
  "Bougainvillea", "Serissa", "Zelkova", "Trident Maple",
  "Hinoki Cypress", "Jade", "Boxwood", "Wisteria"
];

const CARE_TYPES = [
  { id: "water", label: "Watering", icon: "Droplets", color: "#3b82f6", intervalDays: 2 },
  { id: "fertilize", label: "Fertilizing", icon: "Leaf", color: "#22c55e", intervalDays: 14 },
  { id: "prune", label: "Pruning", icon: "Scissors", color: "#f59e0b", intervalDays: 30 },
  { id: "repot", label: "Repotting", icon: "RotateCcw", color: "#8b5cf6", intervalDays: 365 },
  { id: "wire", label: "Wiring", icon: "TrendingUp", color: "#ec4899", intervalDays: 90 },
];

// Species-specific care data based on horticultural research
// Sources: Bonsai Empire, Bonsai Tonight, Bonsai4Me, Eisei-en (Bjorn Bjorholm)
const SPECIES_CARE = {
  "Japanese Maple": {
    water: { intervalDays: 1, note: "Daily in growing season; reduce in winter. Protect from hot afternoon sun to avoid leaf scorch." },
    fertilize: { intervalDays: 14, note: "Every 2 weeks spring (Mar-Jun). Stop Jul-Aug during heat stress. Resume biweekly Sep-Oct. None in winter." },
    prune: { intervalDays: 60, note: "Structural pruning in late winter (Feb-Mar). Pinch new shoots to first leaf pair in early summer (Jun). Light cleanup in Nov." },
    repot: { intervalDays: 730, note: "Every 2 years in early spring before buds open (Feb-Mar)." },
    wire: { intervalDays: 120, note: "Best in late autumn after leaf drop. Check regularly — maples thicken fast and wire can scar." },
  },
  "Pine (Black)": {
    water: { intervalDays: 3, note: "Every 2-4 days in growing season. Pines prefer slightly drier soil. Check twice daily in summer." },
    fertilize: { intervalDays: 28, note: "Monthly during growing season with acid-based fertilizer. Heavier feeding in spring and fall; lighter in summer. None in winter." },
    prune: { intervalDays: 90, note: "Candle pinching in late spring (May). Decandling in mid-summer (Jun-Jul) on healthy trees. Needle thinning in fall (Oct-Nov)." },
    repot: { intervalDays: 1095, note: "Every 3-5 years for mature trees, 2-3 for young. Early spring before candles extend." },
    wire: { intervalDays: 180, note: "Best in late fall to early spring. Leave wire on for full growing season; remove before it bites in." },
  },
  "Pine (White)": {
    water: { intervalDays: 3, note: "Similar to black pine but slightly more moisture-tolerant. Every 2-3 days in growing season." },
    fertilize: { intervalDays: 28, note: "Monthly during growing season. White pines prefer lighter feeding than black pines. None in winter." },
    prune: { intervalDays: 90, note: "Pinch candles in spring (May-Jun) by removing 1/2 to 2/3 of each candle. Needle plucking in fall." },
    repot: { intervalDays: 1095, note: "Every 3-5 years. Early spring before candles extend. Use well-draining soil mix." },
    wire: { intervalDays: 180, note: "Late fall through early spring. White pine bark marks easily — use raffia protection." },
  },
  "Azalea": {
    water: { intervalDays: 1, note: "Daily — azaleas love moisture. Use rainwater or acidic water (they dislike lime). Never let soil dry out completely." },
    fertilize: { intervalDays: 14, note: "Every 2 weeks spring to early summer with acid fertilizer. STOP during flowering to prevent bud drop. Resume after bloom." },
    prune: { intervalDays: 90, note: "Prune ONLY right after flowering (late May-Jun). Never prune after July or you'll remove next year's flower buds." },
    repot: { intervalDays: 730, note: "Every 2 years, either in spring or right after flowering. Use acidic kanuma soil." },
    wire: { intervalDays: 120, note: "After flowering in summer. Azalea branches are brittle — wire carefully and use guy wires where possible." },
  },
  "Juniper": {
    water: { intervalDays: 2, note: "Every 2-3 days. Let soil dry slightly between waterings — junipers dislike soggy roots. Mist foliage in dry weather." },
    fertilize: { intervalDays: 21, note: "Every 2-4 weeks spring through fall. Reduce to every 6-8 weeks in winter. Use balanced organic fertilizer." },
    prune: { intervalDays: 30, note: "Pinch new growth throughout growing season by pulling (not cutting) shoot tips. Never hedge-trim — it browns foliage." },
    repot: { intervalDays: 730, note: "Every 2 years. Spring is ideal. Use well-draining mix with extra aggregate." },
    wire: { intervalDays: 120, note: "Can wire year-round. Junipers are very flexible. Check regularly for wire bite." },
  },
  "Ficus": {
    water: { intervalDays: 2, note: "Every 1-2 days. Keep evenly moist but not waterlogged. Tolerates brief dry spells. Mist leaves for humidity (40-60% RH)." },
    fertilize: { intervalDays: 14, note: "Every 2 weeks year-round (ficus grows continuously indoors). Reduce slightly in winter if growth slows." },
    prune: { intervalDays: 30, note: "Prune year-round. Cut back to 2 leaves after 6-8 leaves develop. Milky sap is normal — it seals wounds quickly." },
    repot: { intervalDays: 730, note: "Every 2 years in spring. Ficus tolerates aggressive root pruning well." },
    wire: { intervalDays: 90, note: "Can wire year-round. Branches are flexible but thicken fast — check wire monthly." },
  },
  "Chinese Elm": {
    water: { intervalDays: 1, note: "Daily in warm months. Keep soil evenly moist. Water thoroughly until it drains from bottom holes." },
    fertilize: { intervalDays: 17, note: "Every 2-3 weeks spring through fall. Monthly in winter if kept indoors and still growing." },
    prune: { intervalDays: 21, note: "Prune year-round. Allow shoots to grow 8 leaf pairs, then trim back to 2-3 leaves for ramification." },
    repot: { intervalDays: 730, note: "Every 2 years (young) to 3-5 years (mature). Repot in early spring before new growth." },
    wire: { intervalDays: 90, note: "Best in growing season when branches are flexible. Remove wire after 3-4 months to prevent scarring." },
  },
  "Trident Maple": {
    water: { intervalDays: 1, note: "Daily in growing season — trident maples are heavy drinkers. May need twice daily in peak summer." },
    fertilize: { intervalDays: 14, note: "Every 2 weeks spring through fall. Heavy feeder. Reduce in winter." },
    prune: { intervalDays: 30, note: "Trim throughout growing season. Cut back to 1-2 leaf pairs. Defoliate in early summer for smaller leaves." },
    repot: { intervalDays: 730, note: "Every 2 years in early spring. Aggressive root growth — can root-prune heavily." },
    wire: { intervalDays: 90, note: "Wire in late autumn after leaf drop. Clip-and-grow often preferred over wiring for this species." },
  },
  "Bougainvillea": {
    water: { intervalDays: 2, note: "Every 2-3 days. Allow soil to dry slightly between waterings — this encourages flowering. Reduce in winter." },
    fertilize: { intervalDays: 14, note: "Every 2 weeks during growing season with high-phosphorus fertilizer to encourage blooms. None in winter." },
    prune: { intervalDays: 30, note: "Prune after flowering. Can be pruned hard — resprouts vigorously. Wear gloves (thorns!)." },
    repot: { intervalDays: 730, note: "Every 2-3 years in spring. Roots are delicate — minimize disturbance." },
    wire: { intervalDays: 120, note: "Wire in growing season. Branches become brittle with age. Use guy wires for thick branches." },
  },
  "Serissa": {
    water: { intervalDays: 1, note: "Daily — keep consistently moist. Very sensitive to changes in watering. Leaf drop is common after any stress." },
    fertilize: { intervalDays: 14, note: "Every 2 weeks during growing season. Light feeding — avoid over-fertilizing. Reduce in winter." },
    prune: { intervalDays: 30, note: "Prune throughout growing season. Responds well to pinching. Can flower year-round with good care." },
    repot: { intervalDays: 730, note: "Every 2 years in spring. Minimize root disturbance — serissa dislikes being repotted." },
    wire: { intervalDays: 90, note: "Wire in growing season. Branches are thin and flexible but snap if bent too far." },
  },
  "Hinoki Cypress": {
    water: { intervalDays: 2, note: "Every 1-2 days. Keep moist but not waterlogged. Mist foliage regularly — appreciates humidity." },
    fertilize: { intervalDays: 21, note: "Every 3 weeks during growing season. Light feeder — avoid strong fertilizer. None in winter." },
    prune: { intervalDays: 30, note: "Pinch new growth by hand throughout growing season. Thin interior foliage to let light in and prevent browning." },
    repot: { intervalDays: 1095, note: "Every 3-5 years. Spring. Use well-draining mix. Slow grower — don't over-prune roots." },
    wire: { intervalDays: 120, note: "Fall through early spring. Branches become rigid with age — wire while young." },
  },
  "Jade": {
    water: { intervalDays: 7, note: "Weekly — jade is a succulent. Let soil dry completely between waterings. Overwatering causes root rot." },
    fertilize: { intervalDays: 30, note: "Monthly during growing season (spring-summer). Use diluted succulent fertilizer. None in winter." },
    prune: { intervalDays: 45, note: "Prune year-round. Heals well. Let wounds dry before watering. Cuttings root easily for propagation." },
    repot: { intervalDays: 1095, note: "Every 3-5 years. Spring-summer. Very slow grower. Use well-draining succulent/cactus soil." },
    wire: { intervalDays: 180, note: "Branches snap easily — prefer clip-and-grow method. If wiring, pad branches well." },
  },
  "Boxwood": {
    water: { intervalDays: 2, note: "Every 1-2 days. Keep evenly moist. Tolerates some dryness but prefers consistent moisture." },
    fertilize: { intervalDays: 14, note: "Every 2 weeks spring through fall. Balanced fertilizer. Reduce in winter." },
    prune: { intervalDays: 21, note: "Prune throughout growing season. Extremely dense growth — thin interior regularly for air circulation." },
    repot: { intervalDays: 730, note: "Every 2-3 years in early spring." },
    wire: { intervalDays: 120, note: "Wire in growing season. Branches are flexible when young. Clip-and-grow works well for shaping." },
  },
  "Wisteria": {
    water: { intervalDays: 1, note: "Daily — wisteria is a vigorous grower and heavy drinker. May need twice daily in summer." },
    fertilize: { intervalDays: 21, note: "Every 3 weeks. Use low-nitrogen, high-phosphorus fertilizer to encourage flowering over vegetative growth." },
    prune: { intervalDays: 14, note: "Prune aggressively throughout growing season — extremely vigorous. Cut long runners back to 2-3 buds. Leave flower buds." },
    repot: { intervalDays: 730, note: "Every 2 years in early spring before buds swell. Vigorous root system." },
    wire: { intervalDays: 90, note: "Wire in dormant season. Trunk and branches thicken very rapidly — check wire frequently." },
  },
  "Zelkova": {
    water: { intervalDays: 1, note: "Daily in growing season. Keep evenly moist. Reduce in winter." },
    fertilize: { intervalDays: 14, note: "Every 2 weeks spring through fall. Balanced fertilizer. None in winter." },
    prune: { intervalDays: 21, note: "Prune throughout growing season. Broom-style zelkova: let shoots extend then clip back to maintain shape." },
    repot: { intervalDays: 730, note: "Every 2 years in early spring before buds open." },
    wire: { intervalDays: 120, note: "Wire in early spring. Clip-and-grow is the traditional method for zelkova broom style." },
  },
  "Deshojo Maple": {
    water: { intervalDays: 1, note: "Daily in growing season; reduce in winter. MORE sensitive to sun than regular maples — protect from afternoon sun in summer." },
    fertilize: { intervalDays: 14, note: "Every 2 weeks spring (Mar-Jun). Stop Jul-Aug during heat stress. Resume biweekly Sep-Oct. None in winter." },
    prune: { intervalDays: 60, note: "Trim shoots with more than 4 leaves back throughout growing season. Structural pruning in late winter (Feb-Mar). Light cleanup in Nov." },
    repot: { intervalDays: 730, note: "Every 2 years in early spring before buds open (Feb-Mar)." },
    wire: { intervalDays: 120, note: "Best in late autumn after leaf drop. Check regularly — maples thicken fast and wire can scar." },
  },
  "Blue Carpet Juniper": {
    water: { intervalDays: 2, note: "Every 2-3 days. Let soil dry slightly between waterings. Spreading habit means check soil under foliage mat." },
    fertilize: { intervalDays: 21, note: "Every 2-4 weeks spring through fall. Reduce to every 6-8 weeks in winter. Use balanced organic fertilizer." },
    prune: { intervalDays: 30, note: "Pinch new growth throughout growing season by pulling (not cutting) shoot tips. Never hedge-trim — it browns foliage." },
    repot: { intervalDays: 730, note: "Every 2 years. Spring is ideal. Use well-draining mix with extra aggregate." },
    wire: { intervalDays: 120, note: "Can wire year-round. Junipers are very flexible. Check regularly for wire bite." },
  },
  "Stricta Juniper": {
    water: { intervalDays: 2, note: "Every 2-3 days. Let soil dry slightly between waterings. Columnar habit needs even moisture distribution." },
    fertilize: { intervalDays: 21, note: "Every 2-4 weeks spring through fall. Reduce to every 6-8 weeks in winter. Use balanced organic fertilizer." },
    prune: { intervalDays: 30, note: "Pinch new growth throughout growing season. Maintain columnar form by trimming outward growth. Never hedge-trim." },
    repot: { intervalDays: 730, note: "Every 2 years. Spring is ideal. Use well-draining mix with extra aggregate." },
    wire: { intervalDays: 120, note: "Can wire year-round. Junipers are very flexible. Use wire to shape the natural columnar form." },
  },
  "Spruce": {
    water: { intervalDays: 2, note: "Every 1-2 days in growing season. Keep moist but not waterlogged. Check twice daily in summer — never let soil fully dry." },
    fertilize: { intervalDays: 28, note: "Monthly with solid organic fertilizer during growing season (spring through late fall). Can also use liquid fertilizer weekly." },
    prune: { intervalDays: 90, note: "In spring, let new shoots extend to 1-1.5 inches, then pinch back. Only one flush of growth per year. Structural pruning in early spring or late summer." },
    repot: { intervalDays: 1095, note: "Every 2-4 years, older specimens less often. Early spring before new growth. Use well-draining soil." },
    wire: { intervalDays: 120, note: "Wire in late autumn through winter. Branches become brittle with age — wire younger growth." },
  },
  "Cotoneaster": {
    water: { intervalDays: 2, note: "Every 1-2 days in summer — heavy drinker. Can tolerate short droughts but prefers consistent moisture. Reduce in winter." },
    fertilize: { intervalDays: 7, note: "Weekly with liquid fertilizer OR monthly with solid organic during growing season. Reduce when flowers/berries present to avoid fruit drop." },
    prune: { intervalDays: 21, note: "Cut new growth back to 2 buds/leaves throughout growing season. Wait until leaves harden off before pruning to avoid weakening tree." },
    repot: { intervalDays: 730, note: "Every 2-4 years in late winter/early spring before growth starts. Remove no more than 1/4 of root mass." },
    wire: { intervalDays: 90, note: "Wire during growing season. Branches are fairly flexible. Good beginner species for wiring practice." },
  },
  "Grape": {
    water: { intervalDays: 1, note: "Daily — grape vines are heavy drinkers, especially when fruiting. Never let soil dry completely. May need twice daily in full sun." },
    fertilize: { intervalDays: 14, note: "Every 2 weeks during growing season with half-strength organic fertilizer. Switch to low-nitrogen after fruit sets." },
    prune: { intervalDays: 30, note: "Prune 2-3 times during summer growing season. Pinch young tendrils. Cut back to 2-3 buds in late summer to encourage fruiting next year. Avoid heavy pruning in winter." },
    repot: { intervalDays: 730, note: "Every 2-3 years. Prune away 1/3 of root ball. Use well-draining soil." },
    wire: { intervalDays: 90, note: "Wire in growing season when flexible. Vine-like growth — training and tying is often more useful than wiring." },
  },
  "Honeysuckle": {
    water: { intervalDays: 1, note: "Daily — keep consistently moist but ensure good drainage. Sensitive to waterlogged conditions." },
    fertilize: { intervalDays: 14, note: "Every 2 weeks with liquid fertilizer during growing season. Higher nitrogen in spring for foliage, higher phosphorus in late summer for flowers. None in winter." },
    prune: { intervalDays: 21, note: "Continual pinching of new shoots during growing season. Hard pruning best done in summer. Heals fast from cuts." },
    repot: { intervalDays: 730, note: "Every 2-3 years in early spring before new growth starts." },
    wire: { intervalDays: 90, note: "Wire during growing season. Vine-like growth habit — training and tying may be more effective than traditional wiring." },
  },
  "Cherry Blossom": {
    water: { intervalDays: 1, note: "Daily during growing season — rootball must not dry out, especially during flowering and fruiting. Ensure good drainage to prevent rot." },
    fertilize: { intervalDays: 14, note: "Every 2 weeks during growing season. Weekly feeding in summer boosts flower bud production. Low-nitrogen in autumn. None in winter." },
    prune: { intervalDays: 90, note: "Do NOT prune until all flowers drop. Shorten long shoots in autumn leaving a couple of nodes. Structural pruning/wiring in winter or early spring." },
    repot: { intervalDays: 730, note: "Every 2-3 years in early spring before flowers open. Prune young roots more aggressively; treat mature roots gently." },
    wire: { intervalDays: 120, note: "Wire in winter or early spring. Branches can be brittle — wire carefully." },
  },
  "Flowering Cherry": {
    water: { intervalDays: 1, note: "Daily during growing season — rootball must not dry out, especially during flowering. Ensure good drainage to prevent rot." },
    fertilize: { intervalDays: 14, note: "Every 2 weeks during growing season. Weekly in summer for more flower buds. Low-nitrogen in autumn. None in winter." },
    prune: { intervalDays: 90, note: "Do NOT prune until all flowers drop. Shorten long shoots in autumn. Flower buds form toward end of summer — don't prune those off." },
    repot: { intervalDays: 730, note: "Every 2-3 years in early spring before flowers open." },
    wire: { intervalDays: 120, note: "Wire in winter or early spring. Branches can be brittle — wire carefully." },
  },
  "Blackthorn": {
    water: { intervalDays: 1, note: "Daily during growing season. Keep evenly moist but not waterlogged. Let top 1-2 inches dry between waterings. Reduce in winter." },
    fertilize: { intervalDays: 14, note: "Every 2 weeks during growing season. Weekly feeding in summer increases flower bud production. Balanced fertilizer at half strength." },
    prune: { intervalDays: 60, note: "Responds well to hard pruning. Prune after flowering. Watch for thorns! Brittle wood — be careful when wiring." },
    repot: { intervalDays: 365, note: "Annually in late winter as soon as flowering finishes." },
    wire: { intervalDays: 120, note: "Wire carefully — wood is brittle and has thorns. Use raffia protection where needed." },
  },
  "Buxus": {
    water: { intervalDays: 2, note: "Every 1-2 days. Keep evenly moist. Tolerates some dryness but prefers consistent moisture." },
    fertilize: { intervalDays: 14, note: "Every 2 weeks spring through fall. Balanced fertilizer. Reduce in winter." },
    prune: { intervalDays: 21, note: "Prune throughout growing season. Extremely dense growth — thin interior regularly for air circulation." },
    repot: { intervalDays: 730, note: "Every 2-3 years in early spring." },
    wire: { intervalDays: 120, note: "Wire in growing season. Branches are flexible when young. Clip-and-grow works well for shaping." },
  },
};

// Fallback for species not in the database
const DEFAULT_CARE = {
  water: { intervalDays: 2, note: "Check soil daily. Water when top layer feels dry." },
  fertilize: { intervalDays: 14, note: "Every 2 weeks during growing season. Reduce or stop in winter." },
  prune: { intervalDays: 30, note: "Trim as needed during growing season." },
  repot: { intervalDays: 730, note: "Every 2 years in early spring." },
  wire: { intervalDays: 90, note: "Wire during growing season. Check regularly for wire bite." },
};

function getSpeciesCare(species) {
  return SPECIES_CARE[species] || DEFAULT_CARE;
}

function getSpeciesCareInterval(species, careType) {
  const care = getSpeciesCare(species);
  return care[careType]?.intervalDays || CARE_TYPES.find(c => c.id === careType)?.intervalDays || 14;
}

function getSpeciesCareNote(species, careType) {
  const care = getSpeciesCare(species);
  return care[careType]?.note || "";
}

const HEALTH_OPTIONS = ["Excellent", "Good", "Fair", "Needs Attention", "Critical"];

const IconMap = { Droplets, Scissors, Leaf, RotateCcw, TrendingUp };

function formatDate(d) {
  if (!d) return "—";
  const date = new Date(d);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const now = new Date(); now.setHours(0,0,0,0);
  const target = new Date(dateStr); target.setHours(0,0,0,0);
  return Math.ceil((target - now) / 86400000);
}

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

function addDays(dateStr, days) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function buildInitialCareSchedule(species) {
  const care = getSpeciesCare(species);
  return CARE_TYPES.map(ct => ({
    type: ct.id,
    lastDone: todayStr(),
    intervalDays: care[ct.id]?.intervalDays || ct.intervalDays,
  }));
}

const initialTrees = [
  {
    id: 1, name: "Deshojo Maple", species: "Deshojo Maple", age: 5, style: "",
    potType: "", height: 0, trunkDiameter: 0,
    health: "Good", acquired: "",
    notes: "Red-leaved variety of Japanese Maple. Bright red spring leaves turn reddish-green in summer, then red again in autumn. Needs extra sun protection.",
    careSchedule: buildInitialCareSchedule("Deshojo Maple"),
    growthLog: []
  },
  {
    id: 2, name: "Japanese Maple", species: "Japanese Maple", age: 0, style: "",
    potType: "", height: 0, trunkDiameter: 0,
    health: "Good", acquired: "",
    notes: "",
    careSchedule: buildInitialCareSchedule("Japanese Maple"),
    growthLog: []
  },
  {
    id: 3, name: "Blue Carpet Juniper", species: "Blue Carpet Juniper", age: 0, style: "",
    potType: "", height: 0, trunkDiameter: 0,
    health: "Good", acquired: "",
    notes: "Low-spreading ground cover juniper. Blue-grey foliage.",
    careSchedule: buildInitialCareSchedule("Blue Carpet Juniper"),
    growthLog: []
  },
  {
    id: 4, name: "Stricta Juniper", species: "Stricta Juniper", age: 0, style: "Formal Upright (Chokkan)",
    potType: "", height: 0, trunkDiameter: 0,
    health: "Good", acquired: "",
    notes: "Juniperus chinensis 'Stricta'. Naturally columnar form with blue-green foliage.",
    careSchedule: buildInitialCareSchedule("Stricta Juniper"),
    growthLog: []
  },
  {
    id: 5, name: "Spruce", species: "Spruce", age: 0, style: "",
    potType: "", height: 0, trunkDiameter: 0,
    health: "Good", acquired: "",
    notes: "",
    careSchedule: buildInitialCareSchedule("Spruce"),
    growthLog: []
  },
  {
    id: 6, name: "Cotoneaster", species: "Cotoneaster", age: 0, style: "",
    potType: "", height: 0, trunkDiameter: 0,
    health: "Good", acquired: "",
    notes: "Good beginner species. Produces small flowers and berries with seasonal interest.",
    careSchedule: buildInitialCareSchedule("Cotoneaster"),
    growthLog: []
  },
  {
    id: 7, name: "Azalea", species: "Azalea", age: 0, style: "",
    potType: "", height: 0, trunkDiameter: 0,
    health: "Good", acquired: "",
    notes: "Use rainwater or acidic water. Kanuma soil preferred.",
    careSchedule: buildInitialCareSchedule("Azalea"),
    growthLog: []
  },
  {
    id: 8, name: "Grape (cutting)", species: "Grape", age: 0, style: "",
    potType: "", height: 0, trunkDiameter: 0,
    health: "Fair", acquired: "",
    notes: "Currently rooting. Keep soil moist and warm. Avoid heavy feeding until roots are established.",
    careSchedule: buildInitialCareSchedule("Grape"),
    growthLog: []
  },
  {
    id: 9, name: "Honeysuckle (cutting)", species: "Honeysuckle", age: 0, style: "",
    potType: "", height: 0, trunkDiameter: 0,
    health: "Fair", acquired: "",
    notes: "Currently rooting. Keep soil moist. Honeysuckle cuttings root relatively easily.",
    careSchedule: buildInitialCareSchedule("Honeysuckle"),
    growthLog: []
  },
  {
    id: 10, name: "Cherry Blossom (cutting)", species: "Cherry Blossom", age: 0, style: "",
    potType: "", height: 0, trunkDiameter: 0,
    health: "Fair", acquired: "",
    notes: "Currently rooting. Cherry cuttings can be slow to establish. Keep moist, avoid direct sun until rooted.",
    careSchedule: buildInitialCareSchedule("Cherry Blossom"),
    growthLog: []
  },
  {
    id: 11, name: "Flowering Cherry", species: "Flowering Cherry", age: 0, style: "",
    potType: "", height: 0, trunkDiameter: 0,
    health: "Good", acquired: "",
    notes: "Don't prune until flowers have dropped. Flower buds form toward end of summer.",
    careSchedule: buildInitialCareSchedule("Flowering Cherry"),
    growthLog: []
  },
  {
    id: 12, name: "Blackthorn", species: "Blackthorn", age: 0, style: "",
    potType: "", height: 0, trunkDiameter: 0,
    health: "Good", acquired: "",
    notes: "Prunus spinosa. White flowers in early spring before leaves. Produces sloe berries in autumn. Watch out for thorns when pruning!",
    careSchedule: buildInitialCareSchedule("Blackthorn"),
    growthLog: []
  },
  {
    id: 13, name: "Buxus", species: "Buxus", age: 0, style: "",
    potType: "", height: 0, trunkDiameter: 0,
    health: "Good", acquired: "",
    notes: "Very dense growth. Thin interior regularly for air circulation to prevent disease.",
    careSchedule: buildInitialCareSchedule("Buxus"),
    growthLog: []
  },
];

function Badge({ children, color = "#6b7280", bg }) {
  return (
    <span style={{
      background: bg || `${color}18`, color, fontSize: 11, fontWeight: 600,
      padding: "2px 8px", borderRadius: 9999, whiteSpace: "nowrap"
    }}>{children}</span>
  );
}

function HealthBadge({ health }) {
  const colors = {
    "Excellent": "#16a34a", "Good": "#22c55e", "Fair": "#f59e0b",
    "Needs Attention": "#f97316", "Critical": "#ef4444"
  };
  return <Badge color={colors[health] || "#6b7280"}>{health}</Badge>;
}

function DueIndicator({ days }) {
  if (days === null) return null;
  if (days < 0) return <Badge color="#ef4444">Overdue {Math.abs(days)}d</Badge>;
  if (days === 0) return <Badge color="#f59e0b">Due today</Badge>;
  if (days <= 2) return <Badge color="#f59e0b">Due in {days}d</Badge>;
  return <Badge color="#6b7280">In {days}d</Badge>;
}

function TabButton({ active, onClick, children, icon: Icon, count }) {
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 6, padding: "8px 16px",
      border: "none", borderBottom: active ? "2px solid #16a34a" : "2px solid transparent",
      background: "none", color: active ? "#16a34a" : "#6b7280",
      fontWeight: active ? 600 : 400, fontSize: 14, cursor: "pointer", transition: "all 0.15s"
    }}>
      {Icon && <Icon size={16} />}
      {children}
      {count !== undefined && (
        <span style={{
          background: active ? "#16a34a" : "#d1d5db", color: active ? "#fff" : "#374151",
          fontSize: 11, fontWeight: 700, borderRadius: 9999, padding: "1px 7px", minWidth: 18, textAlign: "center"
        }}>{count}</span>
      )}
    </button>
  );
}

function Modal({ title, onClose, children, width = 480 }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex",
      alignItems: "center", justifyContent: "center", zIndex: 1000
    }} onClick={onClose}>
      <div style={{
        background: "#fff", borderRadius: 12, width, maxWidth: "92vw",
        maxHeight: "85vh", overflow: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.3)"
      }} onClick={e => e.stopPropagation()}>
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "16px 20px", borderBottom: "1px solid #e5e7eb"
        }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{title}</h3>
          <button onClick={onClose} style={{
            border: "none", background: "none", cursor: "pointer", color: "#9ca3af", padding: 4
          }}><X size={18} /></button>
        </div>
        <div style={{ padding: 20 }}>{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 4 }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle = {
  width: "100%", padding: "8px 10px", border: "1px solid #d1d5db", borderRadius: 6,
  fontSize: 14, outline: "none", boxSizing: "border-box"
};

const selectStyle = { ...inputStyle, background: "#fff" };

const btnPrimary = {
  padding: "8px 18px", border: "none", borderRadius: 6, background: "#16a34a",
  color: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer"
};

const btnSecondary = {
  ...btnPrimary, background: "#f3f4f6", color: "#374151"
};

// ─── MAIN APP ─────────────────────────────────────────────
export default function BonsaiTracker() {
  const [trees, setTrees] = useState(() => {
    try {
      const saved = localStorage.getItem("bonsai-tracker-trees");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) { /* ignore parse errors, use defaults */ }
    return initialTrees;
  });
  const [tab, setTab] = useState("dashboard");
  const [selectedTree, setSelectedTree] = useState(null);
  const [showAddTree, setShowAddTree] = useState(false);
  const [showAddLog, setShowAddLog] = useState(false);
  const [editingTree, setEditingTree] = useState(null);
  const [expandedTasks, setExpandedTasks] = useState({});

  // ── Auto-save to localStorage ──
  useEffect(() => {
    try {
      localStorage.setItem("bonsai-tracker-trees", JSON.stringify(trees));
    } catch (e) { /* storage full or unavailable */ }
  }, [trees]);

  // ── Export / Import ──
  const exportData = useCallback(() => {
    const data = JSON.stringify(trees, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bonsai-backup-${todayStr()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [trees]);

  const importData = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const parsed = JSON.parse(ev.target.result);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setTrees(parsed);
            setSelectedTree(null);
            setTab("dashboard");
          } else {
            alert("Invalid backup file — expected an array of trees.");
          }
        } catch (err) {
          alert("Could not read backup file: " + err.message);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, []);

  // ── Derived data ──
  const upcomingTasks = useMemo(() => {
    const tasks = [];
    trees.forEach(tree => {
      (tree.careSchedule || []).forEach(cs => {
        const nextDue = addDays(cs.lastDone, cs.intervalDays);
        const days = daysUntil(nextDue);
        const careType = CARE_TYPES.find(c => c.id === cs.type);
        tasks.push({ treeId: tree.id, treeName: tree.name, ...cs, nextDue, days, careType });
      });
    });
    return tasks.sort((a, b) => (a.days ?? 999) - (b.days ?? 999));
  }, [trees]);

  const overdueTasks = upcomingTasks.filter(t => t.days !== null && t.days <= 0);
  const todayTasks = upcomingTasks.filter(t => t.days === 0);
  const soonTasks = upcomingTasks.filter(t => t.days !== null && t.days > 0 && t.days <= 7);

  const needsAttentionTrees = trees.filter(t => t.health === "Needs Attention" || t.health === "Critical");

  // ── Handlers ──
  function markDone(treeId, careType) {
    setTrees(prev => prev.map(t => {
      if (t.id !== treeId) return t;
      return {
        ...t,
        careSchedule: t.careSchedule.map(cs =>
          cs.type === careType ? { ...cs, lastDone: todayStr() } : cs
        )
      };
    }));
  }

  function addTree(tree) {
    const newId = Math.max(0, ...trees.map(t => t.id)) + 1;
    const speciesCare = getSpeciesCare(tree.species);
    setTrees(prev => [...prev, {
      ...tree, id: newId, growthLog: [],
      careSchedule: CARE_TYPES.map(ct => ({
        type: ct.id,
        lastDone: todayStr(),
        intervalDays: speciesCare[ct.id]?.intervalDays || ct.intervalDays
      }))
    }]);
    setShowAddTree(false);
  }

  function updateTree(updated) {
    setTrees(prev => prev.map(t => t.id === updated.id ? { ...t, ...updated } : t));
    setEditingTree(null);
    if (selectedTree?.id === updated.id) setSelectedTree(prev => ({ ...prev, ...updated }));
  }

  function deleteTree(id) {
    setTrees(prev => prev.filter(t => t.id !== id));
    if (selectedTree?.id === id) setSelectedTree(null);
  }

  function addGrowthLog(treeId, entry) {
    setTrees(prev => prev.map(t => {
      if (t.id !== treeId) return t;
      const updated = { ...t, growthLog: [entry, ...t.growthLog], height: entry.height || t.height, trunkDiameter: entry.trunkDiameter || t.trunkDiameter };
      if (selectedTree?.id === treeId) setSelectedTree(updated);
      return updated;
    }));
    setShowAddLog(false);
  }

  function updateCareInterval(treeId, careType, newInterval) {
    setTrees(prev => prev.map(t => {
      if (t.id !== treeId) return t;
      return { ...t, careSchedule: t.careSchedule.map(cs => cs.type === careType ? { ...cs, intervalDays: newInterval } : cs) };
    }));
  }

  // ── Render ──
  const currentTree = selectedTree ? trees.find(t => t.id === selectedTree.id) : null;

  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", maxWidth: 960, margin: "0 auto", padding: 16, color: "#1f2937" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #16a34a, #15803d)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <TreePine size={20} color="#fff" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Bonsai Tracker</h1>
            <p style={{ margin: 0, fontSize: 12, color: "#6b7280" }}>{trees.length} trees in your collection</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={importData} title="Import backup" style={{ ...btnSecondary, display: "flex", alignItems: "center", gap: 4, padding: "8px 12px" }}>
            <Upload size={16} />
          </button>
          <button onClick={exportData} title="Export backup" style={{ ...btnSecondary, display: "flex", alignItems: "center", gap: 4, padding: "8px 12px" }}>
            <Download size={16} />
          </button>
          <button onClick={() => setShowAddTree(true)} style={{ ...btnPrimary, display: "flex", alignItems: "center", gap: 6 }}>
            <Plus size={16} /> Add Tree
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, borderBottom: "1px solid #e5e7eb", marginBottom: 20 }}>
        <TabButton active={tab === "dashboard"} onClick={() => { setTab("dashboard"); setSelectedTree(null); }} icon={Sun}>Dashboard</TabButton>
        <TabButton active={tab === "collection"} onClick={() => { setTab("collection"); setSelectedTree(null); }} icon={TreePine} count={trees.length}>Collection</TabButton>
        <TabButton active={tab === "schedule"} onClick={() => { setTab("schedule"); setSelectedTree(null); }} icon={Calendar} count={overdueTasks.length || undefined}>Schedule</TabButton>
        <TabButton active={tab === "detail"} onClick={() => {}} icon={TrendingUp}>{currentTree ? currentTree.name : "Detail"}</TabButton>
      </div>

      {/* ════════ DASHBOARD ════════ */}
      {tab === "dashboard" && (
        <div>
          {/* Stats row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
            {[
              { label: "Total Trees", value: trees.length, color: "#16a34a", icon: TreePine },
              { label: "Overdue Tasks", value: overdueTasks.length, color: overdueTasks.length > 0 ? "#ef4444" : "#22c55e", icon: AlertCircle },
              { label: "Due Today", value: todayTasks.length, color: "#f59e0b", icon: Clock },
              { label: "Due This Week", value: soonTasks.length, color: "#3b82f6", icon: Calendar },
            ].map((s, i) => (
              <div key={i} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 12, color: "#6b7280" }}>{s.label}</p>
                    <p style={{ margin: "4px 0 0", fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</p>
                  </div>
                  <s.icon size={20} color={s.color} />
                </div>
              </div>
            ))}
          </div>

          {/* Needs attention */}
          {needsAttentionTrees.length > 0 && (
            <div style={{ background: "#fef3c7", border: "1px solid #fbbf24", borderRadius: 10, padding: 14, marginBottom: 16 }}>
              <p style={{ margin: 0, fontWeight: 600, fontSize: 13, color: "#92400e", marginBottom: 8 }}>Trees Needing Attention</p>
              {needsAttentionTrees.map(t => (
                <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <HealthBadge health={t.health} />
                  <span style={{ fontSize: 13, cursor: "pointer", color: "#92400e", textDecoration: "underline" }}
                    onClick={() => { setSelectedTree(t); setTab("detail"); }}>{t.name}</span>
                  <span style={{ fontSize: 12, color: "#a16207" }}>— {t.notes?.slice(0, 60)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Upcoming tasks */}
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: 16 }}>
            <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 600 }}>Upcoming Care Tasks</h3>
            {upcomingTasks.slice(0, 10).map((task, i) => {
              const Icon = task.careType ? IconMap[task.careType.icon] : Droplets;
              return (
                <div key={i} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "8px 0", borderBottom: i < 9 ? "1px solid #f3f4f6" : "none"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 6,
                      background: `${task.careType?.color || "#6b7280"}15`,
                      display: "flex", alignItems: "center", justifyContent: "center"
                    }}>
                      <Icon size={14} color={task.careType?.color} />
                    </div>
                    <div>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>{task.careType?.label}</span>
                      <span style={{ fontSize: 12, color: "#6b7280", marginLeft: 6, cursor: "pointer", textDecoration: "underline" }}
                        onClick={() => { setSelectedTree(trees.find(t => t.id === task.treeId)); setTab("detail"); }}>
                        {task.treeName}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <DueIndicator days={task.days} />
                    <button onClick={() => markDone(task.treeId, task.type)}
                      style={{ border: "1px solid #d1d5db", background: "#fff", borderRadius: 6, padding: "4px 10px", fontSize: 12, cursor: "pointer", color: "#374151" }}>
                      <Check size={12} /> Done
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ════════ COLLECTION ════════ */}
      {tab === "collection" && !currentTree && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280, 1fr))", gap: 14 }}>
          {trees.map(tree => {
            const nextTask = upcomingTasks.filter(t => t.treeId === tree.id).sort((a,b) => (a.days??999)-(b.days??999))[0];
            return (
              <div key={tree.id} style={{
                background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10,
                padding: 16, cursor: "pointer", transition: "box-shadow 0.15s"
              }} onClick={() => { setSelectedTree(tree); setTab("detail"); }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)"}
                onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 8 }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{tree.name}</h3>
                    <p style={{ margin: "2px 0 0", fontSize: 12, color: "#6b7280" }}>{tree.species}</p>
                  </div>
                  <HealthBadge health={tree.health} />
                </div>
                <div style={{ display: "flex", gap: 12, fontSize: 12, color: "#6b7280", marginBottom: 8 }}>
                  <span>Age: {tree.age}y</span>
                  <span>Height: {tree.height}cm</span>
                  <span>Style: {tree.style}</span>
                </div>
                {nextTask && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
                    <span style={{ color: "#6b7280" }}>Next:</span>
                    <span style={{ fontWeight: 500 }}>{nextTask.careType?.label}</span>
                    <DueIndicator days={nextTask.days} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ════════ SCHEDULE ════════ */}
      {tab === "schedule" && (
        <div>
          {[
            { title: "Overdue", tasks: overdueTasks, emptyMsg: "Nothing overdue", accent: "#ef4444" },
            { title: "Today", tasks: todayTasks, emptyMsg: "Nothing due today", accent: "#f59e0b" },
            { title: "This Week", tasks: soonTasks, emptyMsg: "Nothing coming up this week", accent: "#3b82f6" },
            { title: "Later", tasks: upcomingTasks.filter(t => t.days > 7), emptyMsg: "", accent: "#6b7280" },
          ].map((section, si) => (
            <div key={si} style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, cursor: "pointer" }}
                onClick={() => setExpandedTasks(p => ({ ...p, [si]: !p[si] }))}>
                {expandedTasks[si] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: section.accent }}>{section.title}</h3>
                <Badge color={section.accent}>{section.tasks.length}</Badge>
              </div>
              {!expandedTasks[si] && section.tasks.length > 0 && (
                <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
                  {section.tasks.map((task, i) => {
                    const Icon = task.careType ? IconMap[task.careType.icon] : Droplets;
                    return (
                      <div key={i} style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "10px 14px", borderBottom: i < section.tasks.length - 1 ? "1px solid #f3f4f6" : "none"
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <Icon size={16} color={task.careType?.color} />
                          <div>
                            <span style={{ fontSize: 13, fontWeight: 500 }}>{task.careType?.label}</span>
                            <span style={{ fontSize: 12, color: "#6b7280", marginLeft: 8 }}>{task.treeName}</span>
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 12, color: "#9ca3af" }}>Due {formatDate(task.nextDue)}</span>
                          <button onClick={() => markDone(task.treeId, task.type)}
                            style={{ border: "1px solid #d1d5db", background: "#fff", borderRadius: 6, padding: "4px 10px", fontSize: 12, cursor: "pointer" }}>
                            <Check size={12} /> Done
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {!expandedTasks[si] && section.tasks.length === 0 && section.emptyMsg && (
                <p style={{ fontSize: 13, color: "#9ca3af", margin: "4px 0 0 22px" }}>{section.emptyMsg}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ════════ DETAIL ════════ */}
      {tab === "detail" && currentTree && (
        <div>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 20 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>{currentTree.name}</h2>
                <HealthBadge health={currentTree.health} />
              </div>
              <p style={{ margin: 0, fontSize: 14, color: "#6b7280" }}>{currentTree.species} · {currentTree.style} · {currentTree.age} years old</p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setEditingTree(currentTree)} style={{ ...btnSecondary, display: "flex", alignItems: "center", gap: 4 }}>
                <Edit3 size={14} /> Edit
              </button>
              <button onClick={() => { if(confirm("Delete this tree?")) deleteTree(currentTree.id); }}
                style={{ ...btnSecondary, color: "#ef4444", display: "flex", alignItems: "center", gap: 4 }}>
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>

          {/* Info grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
            <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: 14 }}>
              <h4 style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 600, color: "#6b7280" }}>Measurements</h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 13 }}>
                <div><span style={{ color: "#9ca3af" }}>Height:</span> <strong>{currentTree.height} cm</strong></div>
                <div><span style={{ color: "#9ca3af" }}>Trunk:</span> <strong>{currentTree.trunkDiameter} cm</strong></div>
                <div><span style={{ color: "#9ca3af" }}>Pot:</span> <strong>{currentTree.potType}</strong></div>
                <div><span style={{ color: "#9ca3af" }}>Acquired:</span> <strong>{formatDate(currentTree.acquired)}</strong></div>
              </div>
            </div>
            <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: 14 }}>
              <h4 style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 600, color: "#6b7280" }}>Notes</h4>
              <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5 }}>{currentTree.notes || "No notes yet."}</p>
            </div>
          </div>

          {/* Care schedule */}
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: 16, marginBottom: 20 }}>
            <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 600 }}>Care Schedule</h3>
            <div style={{ display: "grid", gap: 8 }}>
              {(currentTree.careSchedule || []).map((cs, i) => {
                const ct = CARE_TYPES.find(c => c.id === cs.type);
                const Icon = ct ? IconMap[ct.icon] : Droplets;
                const nextDue = addDays(cs.lastDone, cs.intervalDays);
                const days = daysUntil(nextDue);
                const careNote = getSpeciesCareNote(currentTree.species, cs.type);
                return (
                  <div key={i} style={{ background: "#f9fafb", borderRadius: 8, padding: "8px 12px" }}>
                    <div style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Icon size={16} color={ct?.color} />
                        <span style={{ fontSize: 13, fontWeight: 500 }}>{ct?.label}</span>
                        <span style={{ fontSize: 12, color: "#9ca3af" }}>every {cs.intervalDays}d</span>
                        <select value={cs.intervalDays} onChange={e => updateCareInterval(currentTree.id, cs.type, parseInt(e.target.value))}
                          style={{ fontSize: 11, border: "1px solid #d1d5db", borderRadius: 4, padding: "2px 4px", background: "#fff" }}>
                          {[1,2,3,5,7,10,14,21,30,45,60,90,120,180,365,730,1095].map(d => (
                            <option key={d} value={d}>{d} days</option>
                          ))}
                        </select>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 12, color: "#9ca3af" }}>Last: {formatDate(cs.lastDone)}</span>
                        <DueIndicator days={days} />
                        <button onClick={() => markDone(currentTree.id, cs.type)}
                          style={{ border: "1px solid #d1d5db", background: "#fff", borderRadius: 6, padding: "4px 10px", fontSize: 12, cursor: "pointer" }}>
                          <Check size={12} /> Done
                        </button>
                      </div>
                    </div>
                    {careNote && (
                      <p style={{ margin: "6px 0 0 26px", fontSize: 11, color: "#6b7280", lineHeight: 1.4, fontStyle: "italic" }}>
                        {careNote}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Growth log */}
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Growth Log</h3>
              <button onClick={() => setShowAddLog(true)} style={{ ...btnPrimary, fontSize: 12, padding: "6px 12px", display: "flex", alignItems: "center", gap: 4 }}>
                <Plus size={14} /> Add Entry
              </button>
            </div>

            {/* Mini chart */}
            {currentTree.growthLog.length >= 2 && (
              <div style={{ marginBottom: 16 }}>
                <svg viewBox="0 0 400 100" style={{ width: "100%", height: 80 }}>
                  {(() => {
                    const sorted = [...currentTree.growthLog].sort((a,b) => new Date(a.date) - new Date(b.date));
                    const heights = sorted.map(g => g.height).filter(Boolean);
                    if (heights.length < 2) return null;
                    const min = Math.min(...heights) - 1;
                    const max = Math.max(...heights) + 1;
                    const range = max - min || 1;
                    const points = heights.map((h, i) => {
                      const x = 20 + (i / (heights.length - 1)) * 360;
                      const y = 90 - ((h - min) / range) * 80;
                      return `${x},${y}`;
                    });
                    return (
                      <>
                        <polyline points={points.join(" ")} fill="none" stroke="#16a34a" strokeWidth="2" />
                        {points.map((p, i) => {
                          const [x, y] = p.split(",");
                          return <circle key={i} cx={x} cy={y} r="3" fill="#16a34a" />;
                        })}
                        <text x="2" y="12" fontSize="9" fill="#9ca3af">{max}cm</text>
                        <text x="2" y="95" fontSize="9" fill="#9ca3af">{min}cm</text>
                      </>
                    );
                  })()}
                </svg>
              </div>
            )}

            {currentTree.growthLog.map((entry, i) => (
              <div key={i} style={{
                padding: "8px 0", borderBottom: i < currentTree.growthLog.length - 1 ? "1px solid #f3f4f6" : "none"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>{formatDate(entry.date)}</span>
                  <div style={{ display: "flex", gap: 12, fontSize: 12, color: "#6b7280" }}>
                    {entry.height && <span>H: {entry.height}cm</span>}
                    {entry.trunkDiameter && <span>T: {entry.trunkDiameter}cm</span>}
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>{entry.note}</p>
              </div>
            ))}
            {currentTree.growthLog.length === 0 && (
              <p style={{ fontSize: 13, color: "#9ca3af", textAlign: "center", padding: 20 }}>No growth entries yet. Add your first observation!</p>
            )}
          </div>
        </div>
      )}

      {tab === "detail" && !currentTree && (
        <div style={{ textAlign: "center", padding: 60, color: "#9ca3af" }}>
          <TreePine size={48} style={{ marginBottom: 12 }} />
          <p style={{ fontSize: 15 }}>Select a tree from the Collection tab to view details</p>
        </div>
      )}

      {/* ════════ ADD TREE MODAL ════════ */}
      {showAddTree && (
        <Modal title="Add New Tree" onClose={() => setShowAddTree(false)}>
          <AddTreeForm onSubmit={addTree} onCancel={() => setShowAddTree(false)} />
        </Modal>
      )}

      {/* ════════ EDIT TREE MODAL ════════ */}
      {editingTree && (
        <Modal title={`Edit ${editingTree.name}`} onClose={() => setEditingTree(null)}>
          <EditTreeForm tree={editingTree} onSubmit={updateTree} onCancel={() => setEditingTree(null)} />
        </Modal>
      )}

      {/* ════════ ADD LOG MODAL ════════ */}
      {showAddLog && currentTree && (
        <Modal title={`Log Entry — ${currentTree.name}`} onClose={() => setShowAddLog(false)} width={400}>
          <AddLogForm treeId={currentTree.id} currentHeight={currentTree.height} currentTrunk={currentTree.trunkDiameter} onSubmit={addGrowthLog} onCancel={() => setShowAddLog(false)} />
        </Modal>
      )}
    </div>
  );
}

// ─── FORMS ────────────────────────────────────────────────
function AddTreeForm({ onSubmit, onCancel }) {
  const [f, setF] = useState({ name: "", species: SPECIES_PRESETS[0], age: "", style: "Informal Upright", potType: "", height: "", trunkDiameter: "", health: "Good", acquired: todayStr(), notes: "" });
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="Name"><input style={inputStyle} value={f.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Kaede" /></Field>
        <Field label="Species">
          <select style={selectStyle} value={f.species} onChange={e => set("species", e.target.value)}>
            {SPECIES_PRESETS.map(s => <option key={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Age (years)"><input style={inputStyle} type="number" value={f.age} onChange={e => set("age", e.target.value)} /></Field>
        <Field label="Style">
          <select style={selectStyle} value={f.style} onChange={e => set("style", e.target.value)}>
            {["Formal Upright (Chokkan)","Informal Upright (Moyogi)","Slanting (Shakan)","Cascade (Kengai)","Semi-Cascade (Han-Kengai)","Literati (Bunjin)","Windswept (Fukinagashi)","Twin Trunk (Sokan)","Clump (Kabudachi)","Forest (Yose-ue)","Broom (Hokidachi)","Root Over Rock (Sekijoju)","Raft (Ikadabuki)","Exposed Root (Neagari)","Coiled (Bankan)"].map(s => <option key={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Height (cm)"><input style={inputStyle} type="number" value={f.height} onChange={e => set("height", e.target.value)} /></Field>
        <Field label="Trunk diameter (cm)"><input style={inputStyle} type="number" step="0.1" value={f.trunkDiameter} onChange={e => set("trunkDiameter", e.target.value)} /></Field>
        <Field label="Pot type"><input style={inputStyle} value={f.potType} onChange={e => set("potType", e.target.value)} placeholder="e.g. Oval glazed blue" /></Field>
        <Field label="Health">
          <select style={selectStyle} value={f.health} onChange={e => set("health", e.target.value)}>
            {HEALTH_OPTIONS.map(h => <option key={h}>{h}</option>)}
          </select>
        </Field>
        <Field label="Date acquired"><input style={inputStyle} type="date" value={f.acquired} onChange={e => set("acquired", e.target.value)} /></Field>
      </div>
      <Field label="Notes"><textarea style={{ ...inputStyle, minHeight: 60, resize: "vertical" }} value={f.notes} onChange={e => set("notes", e.target.value)} /></Field>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
        <button onClick={onCancel} style={btnSecondary}>Cancel</button>
        <button onClick={() => { if (!f.name) return; onSubmit({ ...f, age: parseInt(f.age) || 0, height: parseFloat(f.height) || 0, trunkDiameter: parseFloat(f.trunkDiameter) || 0 }); }} style={btnPrimary}>Add Tree</button>
      </div>
    </div>
  );
}

function EditTreeForm({ tree, onSubmit, onCancel }) {
  const [f, setF] = useState({ ...tree });
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="Name"><input style={inputStyle} value={f.name} onChange={e => set("name", e.target.value)} /></Field>
        <Field label="Species">
          <select style={selectStyle} value={f.species} onChange={e => set("species", e.target.value)}>
            {SPECIES_PRESETS.map(s => <option key={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Age (years)"><input style={inputStyle} type="number" value={f.age} onChange={e => set("age", e.target.value)} /></Field>
        <Field label="Style">
          <select style={selectStyle} value={f.style} onChange={e => set("style", e.target.value)}>
            {["Formal Upright (Chokkan)","Informal Upright (Moyogi)","Slanting (Shakan)","Cascade (Kengai)","Semi-Cascade (Han-Kengai)","Literati (Bunjin)","Windswept (Fukinagashi)","Twin Trunk (Sokan)","Clump (Kabudachi)","Forest (Yose-ue)","Broom (Hokidachi)","Root Over Rock (Sekijoju)","Raft (Ikadabuki)","Exposed Root (Neagari)","Coiled (Bankan)"].map(s => <option key={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Height (cm)"><input style={inputStyle} type="number" value={f.height} onChange={e => set("height", e.target.value)} /></Field>
        <Field label="Trunk diameter (cm)"><input style={inputStyle} type="number" step="0.1" value={f.trunkDiameter} onChange={e => set("trunkDiameter", e.target.value)} /></Field>
        <Field label="Pot type"><input style={inputStyle} value={f.potType} onChange={e => set("potType", e.target.value)} /></Field>
        <Field label="Health">
          <select style={selectStyle} value={f.health} onChange={e => set("health", e.target.value)}>
            {HEALTH_OPTIONS.map(h => <option key={h}>{h}</option>)}
          </select>
        </Field>
      </div>
      <Field label="Notes"><textarea style={{ ...inputStyle, minHeight: 60, resize: "vertical" }} value={f.notes} onChange={e => set("notes", e.target.value)} /></Field>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
        <button onClick={onCancel} style={btnSecondary}>Cancel</button>
        <button onClick={() => onSubmit({ ...f, age: parseInt(f.age) || 0, height: parseFloat(f.height) || f.height, trunkDiameter: parseFloat(f.trunkDiameter) || f.trunkDiameter })} style={btnPrimary}>Save</button>
      </div>
    </div>
  );
}

function AddLogForm({ treeId, currentHeight, currentTrunk, onSubmit, onCancel }) {
  const [f, setF] = useState({ date: todayStr(), height: currentHeight || "", trunkDiameter: currentTrunk || "", note: "" });
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));
  return (
    <div>
      <Field label="Date"><input style={inputStyle} type="date" value={f.date} onChange={e => set("date", e.target.value)} /></Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="Height (cm)"><input style={inputStyle} type="number" value={f.height} onChange={e => set("height", e.target.value)} /></Field>
        <Field label="Trunk diameter (cm)"><input style={inputStyle} type="number" step="0.1" value={f.trunkDiameter} onChange={e => set("trunkDiameter", e.target.value)} /></Field>
      </div>
      <Field label="Observation"><textarea style={{ ...inputStyle, minHeight: 60, resize: "vertical" }} value={f.note} onChange={e => set("note", e.target.value)} placeholder="What did you notice?" /></Field>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
        <button onClick={onCancel} style={btnSecondary}>Cancel</button>
        <button onClick={() => { if (!f.note) return; onSubmit(treeId, { ...f, height: parseFloat(f.height) || null, trunkDiameter: parseFloat(f.trunkDiameter) || null }); }} style={btnPrimary}>Save Entry</button>
      </div>
    </div>
  );
}