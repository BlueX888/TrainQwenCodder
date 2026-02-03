const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 创建灰色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1); // 灰色
  graphics.fillCircle(50, 50, 50); // 半径 50 的圆形
  graphics.generateTexture('grayCircle', 100, 100);
  graphics.destroy();
}

function create() {
  // 在屏幕中心创建圆形精灵
  const circle = this.add.sprite(400, 300, 'grayCircle');
  
  // 创建闪烁动画
  // 使用 alpha 值从 1 → 0 → 1 实现闪烁效果
  this.tweens.add({
    targets: circle,
    alpha: 0,           // 目标透明度为 0（完全透明）
    duration: 1000,     // 单程 1 秒
    yoyo: true,         // 往返动画（0→1→0）
    repeat: -1,         // 无限循环
    ease: 'Sine.easeInOut' // 平滑的缓动效果
  });
}

new Phaser.Game(config);