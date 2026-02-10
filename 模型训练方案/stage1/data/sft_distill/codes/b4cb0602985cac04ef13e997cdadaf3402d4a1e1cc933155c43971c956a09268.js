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
  // 使用 Graphics 创建白色菱形纹理
  const graphics = this.make.graphics({ x: 0, y: 0, add: false });
  
  // 绘制菱形（四个三角形组成）
  graphics.fillStyle(0xffffff, 1);
  graphics.beginPath();
  graphics.moveTo(50, 0);    // 上顶点
  graphics.lineTo(100, 50);  // 右顶点
  graphics.lineTo(50, 100);  // 下顶点
  graphics.lineTo(0, 50);    // 左顶点
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('diamond', 100, 100);
  graphics.destroy();
}

function create() {
  // 创建菱形精灵并放置在屏幕中央
  const diamond = this.add.sprite(400, 300, 'diamond');
  
  // 创建淡入淡出动画
  // 使用 yoyo 实现淡入后自动淡出
  // duration 1500ms，yoyo 模式下完整周期是 1500ms * 2 = 3000ms
  // 但题目要求 1.5 秒完成一次淡入淡出，所以单程时间是 750ms
  this.tweens.add({
    targets: diamond,
    alpha: { from: 0, to: 1 },  // 从完全透明到完全不透明
    duration: 750,               // 淡入时间 0.75 秒
    yoyo: true,                  // 自动反向播放（淡出）
    repeat: -1,                  // 无限循环
    ease: 'Sine.easeInOut'       // 使用正弦缓动使过渡更平滑
  });
  
  // 添加说明文字
  this.add.text(400, 500, 'Diamond Fade In/Out Animation', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);