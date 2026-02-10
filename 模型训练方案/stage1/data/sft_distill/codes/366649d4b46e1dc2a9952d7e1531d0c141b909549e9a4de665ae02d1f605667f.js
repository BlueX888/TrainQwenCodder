const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: {
    preload: preload,
    create: create
  },
  backgroundColor: '#2d2d2d'
};

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 使用 Graphics 生成黄色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffff00, 1); // 黄色
  graphics.fillRect(0, 0, 24, 24);
  graphics.generateTexture('yellowSquare', 24, 24);
  graphics.destroy(); // 生成纹理后销毁 graphics 对象

  // 监听画布点击事件
  this.input.on('pointerdown', (pointer) => {
    // 在点击位置创建黄色方块
    const square = this.add.image(pointer.x, pointer.y, 'yellowSquare');
    
    // 可选：添加简单的创建动画效果
    square.setScale(0);
    this.tweens.add({
      targets: square,
      scale: 1,
      duration: 150,
      ease: 'Back.easeOut'
    });
  });

  // 添加提示文本
  const text = this.add.text(400, 30, '点击画布任意位置生成黄色方块', {
    fontSize: '20px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  text.setOrigin(0.5);
}

new Phaser.Game(config);