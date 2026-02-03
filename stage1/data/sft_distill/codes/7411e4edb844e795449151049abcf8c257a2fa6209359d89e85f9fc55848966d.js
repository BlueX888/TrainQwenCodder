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
  // 使用 Graphics 绘制椭圆
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00aaff, 1);
  graphics.fillEllipse(100, 75, 200, 150); // 椭圆中心在(100, 75)，宽200，高150
  
  // 生成纹理
  graphics.generateTexture('ellipse', 200, 150);
  graphics.destroy(); // 销毁 graphics 对象，纹理已生成
  
  // 创建使用椭圆纹理的 Sprite
  const ellipseSprite = this.add.sprite(400, 300, 'ellipse');
  
  // 创建缩放 Tween 动画
  this.tweens.add({
    targets: ellipseSprite,
    scaleX: 0.64,
    scaleY: 0.64,
    duration: 1250, // 2.5秒的一半，因为需要来回
    yoyo: true, // 自动反向播放（恢复到原始大小）
    repeat: -1, // 无限循环
    ease: 'Sine.easeInOut' // 使用平滑的缓动函数
  });
  
  // 添加提示文本
  this.add.text(400, 50, 'Ellipse Scale Animation\n(64% and back, 2.5s cycle)', {
    fontSize: '20px',
    color: '#ffffff',
    align: 'center'
  }).setOrigin(0.5);
}

new Phaser.Game(config);