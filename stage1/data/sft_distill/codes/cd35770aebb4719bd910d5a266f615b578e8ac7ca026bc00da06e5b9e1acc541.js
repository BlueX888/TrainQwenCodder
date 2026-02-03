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
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 绘制圆形并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1); // 绿色圆形
  graphics.fillCircle(50, 50, 50); // 半径50的圆形
  graphics.generateTexture('circle', 100, 100);
  graphics.destroy();

  // 创建圆形精灵，放置在屏幕中心
  const circle = this.add.sprite(400, 300, 'circle');

  // 创建缩放动画
  // 从原始大小(scale=1)缩放到24%(scale=0.24)，然后恢复
  // yoyo: true 表示动画会反向播放（往返效果）
  // duration: 2000 表示单程2秒，往返共4秒
  // loop: -1 表示无限循环
  this.tweens.add({
    targets: circle,
    scale: 0.24,           // 目标缩放值：24%
    duration: 2000,        // 单程时长：2秒
    yoyo: true,            // 启用往返效果（缩小后再放大）
    loop: -1,              // 无限循环
    ease: 'Linear'         // 线性缓动
  });

  // 添加文字说明
  this.add.text(400, 50, 'Circle scaling to 24% and back (4s loop)', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);