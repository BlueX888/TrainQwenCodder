const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: { preload, create }
};

function preload() {
  // 使用 Graphics 创建粉色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xFFC0CB, 1); // 粉色
  graphics.fillRect(0, 0, 32, 32);
  graphics.generateTexture('pinkSquare', 32, 32);
  graphics.destroy();
}

function create() {
  // 添加提示文本
  this.add.text(10, 10, '点击画布任意位置生成粉色方块', {
    fontSize: '16px',
    color: '#ffffff'
  });

  // 监听指针按下事件
  this.input.on('pointerdown', (pointer) => {
    // 在点击位置创建粉色方块
    // 使用 pointer.x 和 pointer.y 作为方块中心位置
    this.add.image(pointer.x, pointer.y, 'pinkSquare');
  });
}

new Phaser.Game(config);