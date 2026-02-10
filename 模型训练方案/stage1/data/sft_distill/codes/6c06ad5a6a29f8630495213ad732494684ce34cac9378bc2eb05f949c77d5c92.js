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
  // 使用 Graphics 绘制圆形并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1); // 绿色圆形
  graphics.fillCircle(50, 50, 50); // 在 (50, 50) 位置绘制半径为 50 的圆
  graphics.generateTexture('circle', 100, 100);
  graphics.destroy(); // 销毁 graphics 对象，只保留纹理

  // 创建圆形精灵并居中显示
  const circle = this.add.sprite(400, 300, 'circle');
  
  // 创建缩放动画
  this.tweens.add({
    targets: circle,
    scaleX: 0.24, // 缩放到 24%
    scaleY: 0.24, // 缩放到 24%
    duration: 2000, // 单程 2 秒
    ease: 'Linear', // 线性缓动
    yoyo: true, // 往返播放（缩小后再放大）
    loop: -1 // 无限循环
  });

  // 添加提示文字
  this.add.text(400, 550, 'Circle scaling: 100% ↔ 24% (4s cycle)', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);