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
  // 使用 Graphics 生成 24x24 黄色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffff00, 1); // 黄色
  graphics.fillRect(0, 0, 24, 24);
  graphics.generateTexture('yellowSquare', 24, 24);
  graphics.destroy(); // 生成纹理后销毁 graphics 对象

  // 监听画布点击事件
  this.input.on('pointerdown', (pointer) => {
    // 在点击位置创建黄色方块
    // 使用 pointer.x 和 pointer.y 作为方块中心位置
    this.add.image(pointer.x, pointer.y, 'yellowSquare');
  });
}

new Phaser.Game(config);