/** Persistent decorative Korean-traditional framing around the viewport (thin obangsaek edge
 * bands). Deliberately stays off the board itself — see Board3D.tsx/textures.ts, untouched. */
export function ThemeFrame() {
  return (
    <>
      <div className="theme-frame-edge top" />
      <div className="theme-frame-edge bottom" />
    </>
  );
}
