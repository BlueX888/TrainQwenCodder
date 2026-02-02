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
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制灰色圆形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x888888, 1); // 灰色
  graphics.fillCircle(50, 50, 50); // 在中心绘制半径为 50 的圆
  
  // 生成纹理
  graphics.generateTexture('grayCircle', 100, 100);
  graphics.destroy(); // 销毁 graphics 对象，因为已经生成纹理
  
  // 创建精灵对象
  const circle = this.add.sprite(400, 300, 'grayCircle');
  
  // 创建闪烁动画
  // 使用 alpha 透明度从 1 -> 0 -> 1 实现闪烁效果
  this.tweens.add({
    targets: circle,
    alpha: 0, // 目标透明度为 0（完全透明）
    duration: 1000, // 1 秒淡出
    yoyo: true, // 反向播放（淡入）
    repeat: -1, // 无限循环
    ease: 'Sine.easeInOut' // 使用正弦缓动使闪烁更平滑
  });
  
  // 添加提示文本
  this.add.text(400, 500, '灰色圆形闪烁动画 (2秒循环)', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);