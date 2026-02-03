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
  // 使用 Graphics 创建圆形纹理
  const graphics = this.make.graphics({ x: 0, y: 0, add: false });
  graphics.fillStyle(0x00aaff, 1);
  graphics.fillCircle(50, 50, 50); // 半径50的圆形
  graphics.generateTexture('circle', 100, 100);
  graphics.destroy();
}

function create() {
  // 在屏幕中心创建圆形精灵
  const circle = this.add.sprite(400, 300, 'circle');
  
  // 创建缩放动画
  // yoyo: true 表示动画会反向播放（从0.8回到1）
  // repeat: -1 表示无限循环
  // duration: 2500 表示2.5秒完成一次完整动画（包括缩小和放大）
  this.tweens.add({
    targets: circle,
    scaleX: 0.8,
    scaleY: 0.8,
    duration: 1250, // 单程1.25秒，来回共2.5秒
    yoyo: true,     // 启用往返效果
    repeat: -1,     // 无限循环
    ease: 'Sine.easeInOut' // 使用平滑的缓动函数
  });
  
  // 添加文字说明
  this.add.text(400, 500, '圆形循环缩放动画 (80% ↔ 100%)', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);