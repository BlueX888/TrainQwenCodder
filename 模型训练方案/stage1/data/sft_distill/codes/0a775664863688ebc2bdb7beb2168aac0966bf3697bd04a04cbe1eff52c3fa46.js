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
  // 使用 Graphics 绘制灰色方块
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1); // 灰色
  graphics.fillRect(0, 0, 100, 100);
  
  // 生成纹理
  graphics.generateTexture('graySquare', 100, 100);
  graphics.destroy(); // 销毁 graphics 对象，因为纹理已生成
  
  // 创建精灵对象，放置在屏幕中心
  const square = this.add.sprite(400, 300, 'graySquare');
  
  // 创建旋转动画
  this.tweens.add({
    targets: square,
    angle: 360, // 旋转 360 度
    duration: 1500, // 持续时间 1.5 秒
    ease: 'Linear', // 线性缓动，保持匀速旋转
    repeat: -1, // -1 表示无限循环
    onRepeat: function() {
      // 每次循环重置角度，避免角度累积过大
      square.angle = 0;
    }
  });
}

new Phaser.Game(config);