import "../cyberpunk-details.css";

export function AmbientDetails() {
  return (
    <div className="ambient-details" aria-hidden="true">
      <svg
        className="ambient-circuit"
        viewBox="0 0 1536 1024"
        preserveAspectRatio="none"
        focusable="false"
      >
        <path
          d="M967 0L1076 109V131 M1353 126L1140 277H1110 M1140 277H1510V312 M618 897L678 957H1001 M1484 830L1418 896H1263"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div className="edge-rail edge-rail-left">
        <svg
          className="edge-route"
          viewBox="0 0 52 1024"
          preserveAspectRatio="none"
          focusable="false"
        >
          <path
            d="M43 0V54H26 M43 54V558L27 574V878H43V1024 M0 312H5V376"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <span className="edge-cross edge-cross-top" />
        <span className="edge-cross edge-cross-bottom" />
        <span className="edge-node edge-node-first" />
        <span className="edge-node edge-node-second" />
        <span className="edge-ticks" />
      </div>
      <div className="edge-rail edge-rail-right">
        <svg
          className="edge-route"
          viewBox="0 0 52 1024"
          preserveAspectRatio="none"
          focusable="false"
        >
          <path
            d="M26 0V148 M26 368V649 M26 701V842H40V1024"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <span className="edge-cross edge-cross-top" />
        <span className="edge-cross edge-cross-middle" />
        <span className="edge-cross edge-cross-bottom" />
        <span className="edge-node edge-node-first" />
        <span className="edge-node edge-node-second" />
        <span className="edge-ticks" />
        <span className="edge-ticks edge-ticks-bottom" />
      </div>
      <span className="ambient-cross ambient-cross-heading" />
      <span className="ambient-cross ambient-cross-aside" />
      <span className="ambient-node ambient-node-heading" />
      <span className="ambient-dots" />
    </div>
  );
}

export function FooterContour() {
  return (
    <svg
      className="footer-contour"
      viewBox="0 0 1400 60"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M0 1H228L266 39H933 M947 39H977L1011 5H1400"
        vectorEffect="non-scaling-stroke"
      />
      <rect
        x="937"
        y="35"
        width="8"
        height="8"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
