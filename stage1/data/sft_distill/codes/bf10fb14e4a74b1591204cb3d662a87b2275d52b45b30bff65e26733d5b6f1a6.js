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
  // 使用 Graphics 绘制灰色矩形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1); // 灰色
  graphics.fillRect(0, 0, 100, 100);
  
  // 生成纹理
  graphics.generateTexture('grayRect', 100, 100);
  graphics.destroy(); // 销毁 graphics 对象，只保留纹理
  
  // 创建精灵对象并设置位置到屏幕中心
  const rectangle = this.add.sprite(400, 300, 'grayRect');
  
  // 创建旋转动画
  this.tweens.add({
    targets: rectangle,
    angle: 360, // 旋转到 360 度
    duration: 1000, // 持续 1 秒
    ease: 'Linear', // 线性缓动
    repeat: -1 // 无限循环
  });
}

new Phaser.Game(config);