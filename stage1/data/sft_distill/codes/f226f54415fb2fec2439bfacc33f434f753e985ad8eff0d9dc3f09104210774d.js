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
  // 预加载阶段：创建橙色椭圆纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xFFA500, 1); // 橙色
  graphics.fillEllipse(40, 40, 80, 80); // 中心点(40,40)，宽高80像素
  graphics.generateTexture('orangeEllipse', 80, 80);
  graphics.destroy();
}

function create() {
  // 添加提示文本
  this.add.text(400, 50, '点击画布任意位置生成橙色椭圆', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);

  // 监听画布点击事件
  this.input.on('pointerdown', (pointer) => {
    // 在点击位置创建椭圆精灵
    const ellipse = this.add.sprite(pointer.x, pointer.y, 'orangeEllipse');
    
    // 可选：添加简单的缩放动画效果
    ellipse.setScale(0);
    this.tweens.add({
      targets: ellipse,
      scale: 1,
      duration: 200,
      ease: 'Back.easeOut'
    });
  });
}

new Phaser.Game(config);