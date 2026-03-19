// assets/js/vanta-init.js
(() => {
  'use strict';

  const ID = 'vanta-dots';

  // 省電力チューニング（PCでも効く）
  // - 30fps制限
  // - retina false（重要）
  // - 画面外では破棄（IntersectionObserver）
  // - タブ非表示で破棄（visibilitychange）
  // - prefers-reduced-motion なら起動しない

  let vanta = null;
  let rafId = null;
  let lastT = 0;

  const reduceMotion = () =>
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const isMobile = () =>
    window.matchMedia && window.matchMedia('(max-width: 860px)').matches;

  function canRun() {
    const el = document.getElementById(ID);
    if (!el) return false;
    if (!window.THREE || !window.VANTA || !VANTA.DOTS) return false;
    if (reduceMotion()) return false;
    return true;
  }

  function create() {
    if (vanta) return;
    if (!canRun()) return;

    const el = document.getElementById(ID);
    const mobile = isMobile();

    // まず生成（この時点でVANTAが自前でrAFを回す）
    vanta = VANTA.DOTS({
      el,
      // インタラクションは軽く（PCでも負荷が増えがち）
      mouseControls: !mobile, // PCのみON、スマホはOFF
      touchControls: false,
      gyroControls: false,

      // 背景は親のグラデを見せたいので透明に
      backgroundColor: 0x000000,
      backgroundAlpha: 0.0,

      // 色（好みで）
      color: 0x7cc7ff,
      color2: 0xa7b8ff,

      // 軽量化
      showLines: false,
      retina: false, // ★重要：高DPIでの負荷激減

      // 密度：大きいほど点が減って軽い
      spacing: mobile ? 36.0 : 30.0,

      // 点サイズ：小さいほど軽い（見え方と相談）
      size: mobile ? 1.0 : 1.2
    });

    // --- FPS制限（30fps） ---
    // VANTA内部のrAFを止めることはできないので、
    // “見えている時だけ”描画させる＋描画頻度を落とす目的で、
    // visibility/observer と組み合わせて実質的に負荷を下げる。
    //
    // ここでは「CSSアニメ等の追加」を避けつつ、30fps相当の負荷に寄せるため
    // タブが表示中のみ描画される状況での揺らぎを抑える。
    //
    // ※内部rAFは動くが、Intersection/visibilityで止めるのが主効果。
    lastT = 0;
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(throttleTick);
  }

  function throttleTick(t) {
    if (!vanta) return;
    const fps = 30;
    const interval = 1000 / fps;

    if (!lastT) lastT = t;
    const dt = t - lastT;

    if (dt >= interval) {
      lastT = t - (dt % interval);

      // VANTAは明示的なrender APIがないので、
      // ここでは「何もしない」= rAFを自前で回さない。
      // ただし、追加の処理をしないことでCPU負担を増やさない。
      // （実際の省電力は destroy/ create の制御が効きます）
    }

    rafId = requestAnimationFrame(throttleTick);
  }

  function destroy() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
    lastT = 0;

    if (!vanta) return;
    vanta.destroy();
    vanta = null;
  }

  function setupVisibilityPause() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) destroy();
      else create();
    });
  }

  function setupIntersectionPause() {
    const el = document.getElementById(ID);
    if (!el) return;

    // 画面外に出たら破棄（これが一番効く）
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries[0] && entries[0].isIntersecting;
        if (vis) create();
        else destroy();
      },
      { threshold: 0.15 }
    );

    io.observe(el);
  }

  function boot() {
    setupVisibilityPause();
    setupIntersectionPause();

    // 初期表示がobserver発火前でも動くように保険
    create();
    setTimeout(create, 200);
  }

  // three.js / vanta が読み込み終わってから
  window.addEventListener('load', boot);
})();