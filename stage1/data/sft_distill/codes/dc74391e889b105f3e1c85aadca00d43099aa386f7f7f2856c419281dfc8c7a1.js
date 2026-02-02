const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create
  }
};

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 使用 Graphics 绘制灰色圆形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x888888, 1); // 灰色
  graphics.fillCircle(50, 50, 50); // 在 (50, 50) 位置绘制半径 50 的圆
  
  // 生成纹理
  graphics.generateTexture('circleTexture', 100, 100);
  graphics.destroy(); // 销毁 graphics 对象，只保留纹理
  
  // 创建 Sprite 对象
  const circle = this.add.sprite(400, 300, 'circleTexture');
  
  // 创建闪烁动画
  this.tweens.add({
    targets: circle,
    alpha: 0.2, // 目标透明度（闪烁到较暗）
    duration: 1000, // 单程持续时间 1 秒
    yoyo: true, // 启用往返效果（1秒变暗，1秒变亮，共2秒）
    repeat: -1, // 无限循环
    ease: 'Sine.easeInOut' // 使用平滑的缓动函数
  });
  
  // 添加提示文本
  this.add.text(400, 500, 'Circle Blinking Animation (2s cycle)', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);