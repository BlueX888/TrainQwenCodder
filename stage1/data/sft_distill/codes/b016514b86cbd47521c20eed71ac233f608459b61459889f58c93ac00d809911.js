const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 使用 Graphics 创建紫色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x9966ff, 1); // 紫色
  graphics.fillCircle(50, 50, 50); // 在 (50,50) 位置绘制半径 50 的圆
  graphics.generateTexture('purpleCircle', 100, 100);
  graphics.destroy();
}

function create() {
  // 创建紫色圆形精灵，放置在屏幕中央
  const circle = this.add.sprite(400, 300, 'purpleCircle');
  
  // 创建闪烁动画
  // 使用 yoyo 模式实现闪烁效果：alpha 从 1 -> 0.2 -> 1
  this.tweens.add({
    targets: circle,
    alpha: 0.2,           // 目标透明度（变暗）
    duration: 750,        // 单程持续时间 0.75 秒
    ease: 'Sine.easeInOut', // 平滑缓动
    yoyo: true,           // 往返动画（0.75秒变暗 + 0.75秒变亮 = 1.5秒）
    repeat: -1            // 无限循环
  });
  
  // 添加提示文本
  this.add.text(400, 500, 'Purple Circle Blinking (1.5s cycle)', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);