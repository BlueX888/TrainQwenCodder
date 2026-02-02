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
  // 使用 Graphics 绘制粉色矩形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff69b4, 1); // 粉色
  graphics.fillRect(0, 0, 200, 150);
  
  // 生成纹理
  graphics.generateTexture('pinkRect', 200, 150);
  graphics.destroy(); // 销毁 graphics 对象，节省资源
  
  // 创建精灵对象
  const pinkRectangle = this.add.sprite(400, 300, 'pinkRect');
  
  // 创建闪烁动画
  // 使用 yoyo 实现从 1 → 0 → 1 的闪烁效果
  this.tweens.add({
    targets: pinkRectangle,
    alpha: 0, // 目标透明度为 0（完全透明）
    duration: 1500, // 1.5 秒淡出
    yoyo: true, // 反向播放（淡入）
    repeat: -1, // 无限循环
    ease: 'Sine.easeInOut' // 平滑的缓动效果
  });
  
  // 添加提示文本
  this.add.text(400, 500, '粉色矩形闪烁动画（3秒一次循环）', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);