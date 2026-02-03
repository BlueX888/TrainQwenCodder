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
  // 创建黄色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffff00, 1); // 黄色
  graphics.fillRect(0, 0, 24, 24);
  graphics.generateTexture('yellowSquare', 24, 24);
  graphics.destroy(); // 销毁 graphics 对象，只保留纹理
}

function create() {
  // 添加提示文本
  this.add.text(400, 20, '点击画布任意位置生成黄色方块', {
    fontSize: '18px',
    color: '#ffffff'
  }).setOrigin(0.5, 0);

  // 监听指针按下事件
  this.input.on('pointerdown', (pointer) => {
    // 在点击位置创建黄色方块
    this.add.image(pointer.x, pointer.y, 'yellowSquare');
  });
}

new Phaser.Game(config);