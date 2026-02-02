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
  // 使用 Graphics 创建粉色矩形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff69b4, 1); // 粉色
  graphics.fillRect(0, 0, 200, 150);
  
  // 生成纹理
  graphics.generateTexture('pinkRect', 200, 150);
  graphics.destroy(); // 销毁 graphics 对象，只保留纹理
  
  // 创建使用该纹理的 Sprite
  const pinkRect = this.add.sprite(400, 300, 'pinkRect');
  
  // 创建闪烁动画
  // 使用 yoyo 实现来回闪烁效果（alpha: 1 -> 0 -> 1）
  this.tweens.add({
    targets: pinkRect,
    alpha: 0,           // 目标 alpha 值
    duration: 1500,     // 单程时间 1.5 秒
    yoyo: true,         // 启用来回效果
    repeat: -1,         // 无限循环
    ease: 'Sine.easeInOut' // 平滑的缓动效果
  });
  
  // 添加提示文本
  this.add.text(400, 500, '粉色矩形闪烁动画 (3秒一次循环)', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);