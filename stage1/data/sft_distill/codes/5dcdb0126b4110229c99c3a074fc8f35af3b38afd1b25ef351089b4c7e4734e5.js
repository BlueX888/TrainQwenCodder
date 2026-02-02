const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 使用 Graphics 创建灰色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1); // 灰色
  graphics.fillCircle(50, 50, 50); // 半径 50 的圆形
  graphics.generateTexture('grayCircle', 100, 100);
  graphics.destroy();
}

function create() {
  // 创建灰色圆形精灵，放置在屏幕中央
  const circle = this.add.sprite(400, 300, 'grayCircle');
  
  // 创建闪烁动画
  // 使用 Tween 控制 alpha 值实现闪烁效果
  this.tweens.add({
    targets: circle,           // 动画目标对象
    alpha: 0,                  // 目标 alpha 值（从当前 1 变到 0）
    duration: 1000,            // 单程持续时间 1 秒
    yoyo: true,                // 启用 yoyo，动画会反向播放（0 -> 1）
    repeat: -1,                // 无限循环（-1 表示永久重复）
    ease: 'Sine.easeInOut'     // 缓动函数，使闪烁更平滑自然
  });
  
  // 添加提示文本
  this.add.text(400, 500, '灰色圆形闪烁动画 (2秒循环)', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);