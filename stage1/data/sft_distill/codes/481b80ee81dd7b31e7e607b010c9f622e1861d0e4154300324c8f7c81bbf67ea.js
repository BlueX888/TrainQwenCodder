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
  // 使用 Graphics 创建黄色矩形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffff00, 1); // 黄色
  graphics.fillRect(0, 0, 150, 100);
  
  // 生成纹理
  graphics.generateTexture('yellowRect', 150, 100);
  graphics.destroy(); // 销毁 graphics 对象，只保留纹理
  
  // 创建精灵对象
  const rect = this.add.sprite(400, 300, 'yellowRect');
  
  // 设置初始透明度为 0（完全透明）
  rect.setAlpha(0);
  
  // 创建淡入淡出动画
  this.tweens.add({
    targets: rect,
    alpha: { from: 0, to: 1 }, // 淡入：从 0 到 1
    duration: 500, // 淡入用时 0.5 秒
    yoyo: true, // 启用 yoyo 效果，自动反向播放（淡出）
    repeat: -1, // 无限循环
    ease: 'Linear' // 线性缓动
  });
  
  // 添加提示文本
  this.add.text(400, 500, 'Yellow Rectangle Fade In/Out Animation', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);