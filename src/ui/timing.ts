/**
 * Duration of the yut-stick tumble/settle animation (Scene.tsx, YutSticks3D). Shared so the
 * post-throw "judging the result" UI gate and the throw-result overlay stay in lockstep with
 * the actual visual settle, instead of drifting if one timing constant changes but not the other.
 */
export const STICK_SETTLE_MS = 650;
