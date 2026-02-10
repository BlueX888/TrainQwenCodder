const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: { preload, create }
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 创建蓝色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x0000ff, 1); // 蓝色
  graphics.fillRect(0, 0, 48, 48);
  graphics.generateTexture('blueSquare', 48, 48);
  graphics.destroy(); // 生成纹理后销毁 graphics 对象

  // 监听场景的 pointerdown 事件
  this.input.on('pointerdown', (pointer) => {
    // 在点击位置创建蓝色方块，居中对齐
    const square = this.add.image(pointer.x, pointer.y, 'blueSquare');
    square.setOrigin(0.5, 0.5); // 确保方块中心在点击位置
  });
}

new Phaser.Game(config);